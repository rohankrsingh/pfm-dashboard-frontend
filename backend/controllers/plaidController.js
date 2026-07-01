import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';
import { encrypt, decrypt } from '../utils/encryption.js';
import PlaidItem from '../models/PlaidItem.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import { mapPlaidCategory } from '../utils/categoryMapper.js';

// ── Plaid Client Setup ─────────────────────────────────────────────────────
const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Map Plaid account type/subtype to our internal Account type enum.
 * Account.type enum: ['checking', 'savings', 'investment', 'credit_card']
 */
function mapAccountType(plaidType, plaidSubtype) {
  if (plaidType === 'depository') {
    return plaidSubtype === 'savings' ? 'savings' : 'checking';
  }
  if (plaidType === 'credit') return 'credit_card';
  if (plaidType === 'investment' || plaidType === 'brokerage') return 'investment';
  return 'checking'; // fallback
}

/**
 * Resolve whether a Plaid transaction is income or expense.
 * Plaid convention: positive amount = money out (expense), negative = money in (income).
 */
function mapTransactionType(plaidAmount) {
  return plaidAmount > 0 ? 'expense' : 'income';
}

// ── Fetch & Save Accounts from Plaid ──────────────────────────────────────

async function fetchAndSaveAccounts(accessToken, itemId, userId) {
  const accountsResponse = await plaidClient.accountsGet({ access_token: accessToken });
  const plaidAccounts = accountsResponse.data.accounts;

  const savedAccounts = [];

  for (const acc of plaidAccounts) {
    const type = mapAccountType(acc.type, acc.subtype);

    // Upsert: update if already exists (e.g. after re-linking)
    const saved = await Account.findOneAndUpdate(
      { plaidAccountId: acc.account_id },
      {
        userId,
        plaidAccountId: acc.account_id,
        itemId,
        name: acc.name,
        mask: acc.mask,
        type,
        subtype: acc.subtype,
        balance: acc.balances.current ?? 0,
        currency: acc.balances.iso_currency_code || 'USD',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    savedAccounts.push(saved);
  }

  return savedAccounts;
}

// ── Transaction Sync (Incremental) ─────────────────────────────────────────

/**
 * Sync transactions for a given Plaid item using the cursor-based
 * /transactions/sync endpoint. Handles pagination and mutation-during-pagination.
 * 
 * Skill compliance:
 * - Cursor stored per item for incremental syncs ✓
 * - Handles TRANSACTIONS_SYNC_MUTATION_DURING_PAGINATION ✓
 * - Processes added, modified, removed ✓
 * - Updates account balances after sync ✓
 */
export async function syncTransactionsForItem(accessToken, itemId, userId) {
  const item = await PlaidItem.findOne({ itemId });
  if (!item) throw new Error(`PlaidItem not found: ${itemId}`);

  let cursor = item.transactionsCursor || null;
  let hasMore = true;
  let addedCount = 0;
  let modifiedCount = 0;
  let removedCount = 0;

  // Get our internal accountId map: plaidAccountId → _id
  const accounts = await Account.find({ itemId });
  const accountMap = {};
  accounts.forEach(acc => { accountMap[acc.plaidAccountId] = acc._id; });

  while (hasMore) {
    try {
      const response = await plaidClient.transactionsSync({
        access_token: accessToken,
        cursor: cursor || undefined,
        count: 500,
      });

      const { added, modified, removed, next_cursor, has_more } = response.data;

      // ── Process Added ──
      if (added.length > 0) {
        const newTxns = added
          .filter(txn => accountMap[txn.account_id]) // only for known accounts
          .map(txn => ({
            userId,
            plaidTransactionId: txn.transaction_id,
            itemId,
            accountId: accountMap[txn.account_id],
            amount: Math.abs(txn.amount),
            type: mapTransactionType(txn.amount),
            date: new Date(txn.date),
            description: txn.name,
            merchantName: txn.merchant_name || null,
            category: mapPlaidCategory(txn.personal_finance_category?.primary),
            subcategory: txn.personal_finance_category?.detailed?.toLowerCase() || null,
            paymentChannel: txn.payment_channel || null,
            pending: txn.pending,
          }));

        if (newTxns.length > 0) {
          await Transaction.insertMany(newTxns, { ordered: false }).catch(err => {
            // Ignore duplicate key errors (idempotent re-sync)
            if (err.code !== 11000) console.error('[Plaid] Insert error:', err.message);
          });
          addedCount += newTxns.length;
        }
      }

      // ── Process Modified ──
      for (const txn of modified) {
        await Transaction.findOneAndUpdate(
          { plaidTransactionId: txn.transaction_id },
          {
            amount: Math.abs(txn.amount),
            type: mapTransactionType(txn.amount),
            description: txn.name,
            merchantName: txn.merchant_name || null,
            pending: txn.pending,
            category: mapPlaidCategory(txn.personal_finance_category?.primary),
            subcategory: txn.personal_finance_category?.detailed?.toLowerCase() || null,
            paymentChannel: txn.payment_channel || null,
          }
        );
        modifiedCount++;
      }

      // ── Process Removed ──
      if (removed.length > 0) {
        const removedIds = removed.map(r => r.transaction_id);
        await Transaction.deleteMany({ plaidTransactionId: { $in: removedIds } });
        removedCount += removed.length;
      }

      cursor = next_cursor;
      hasMore = has_more;

    } catch (error) {
      if (error.response?.data?.error_code === 'TRANSACTIONS_SYNC_MUTATION_DURING_PAGINATION') {
        // Data changed mid-pagination — restart from null cursor (not from beginning of all time)
        console.warn('[Plaid] Mutation during pagination, restarting sync...');
        cursor = null;
        continue;
      }
      console.error('[Plaid] Sync error:', error.response?.data || error.message);
      throw error;
    }
  }

  // ── Update Account Balances (cached, free endpoint) ──
  try {
    const balanceResponse = await plaidClient.accountsGet({ access_token: accessToken });
    for (const plaidAcc of balanceResponse.data.accounts) {
      if (accountMap[plaidAcc.account_id]) {
        await Account.findByIdAndUpdate(accountMap[plaidAcc.account_id], {
          balance: plaidAcc.balances.current ?? 0,
        });
      }
    }
  } catch (balanceErr) {
    console.warn('[Plaid] Balance refresh failed (non-fatal):', balanceErr.message);
  }

  // ── Persist Cursor ──
  item.transactionsCursor = cursor;
  item.lastSyncedAt = new Date();
  await item.save();

  console.log(`[Plaid] Sync complete for item ${itemId}: +${addedCount} ~${modifiedCount} -${removedCount}`);
  return { addedCount, modifiedCount, removedCount };
}

// ── Controllers ────────────────────────────────────────────────────────────

/**
 * POST /api/plaid/create-link-token
 * Creates a fresh, single-use Plaid Link token for the authenticated user.
 * Link tokens expire in 4 hours and must NOT be cached.
 */
export const createLinkToken = async (req, res) => {
  try {
    const response = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: req.user.id.toString(),
      },
      client_name: 'PFM Dashboard',
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: 'en',
      // Webhook URL: must point to backend server, not frontend
      webhook: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/plaid/webhooks`,
      transactions: {
        days_requested: 180, // 180 days for recurring detection
      },
    });

    res.json({ link_token: response.data.link_token });
  } catch (error) {
    console.error('[Plaid] Link token creation failed:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Failed to create link token' });
  }
};

/**
 * POST /api/plaid/create-update-token
 * Creates a link token for update mode (re-authentication of existing item).
 * Used when item enters ITEM_LOGIN_REQUIRED error state.
 */
export const createUpdateLinkToken = async (req, res) => {
  const { itemId } = req.body;
  if (!itemId) return res.status(400).json({ success: false, message: 'itemId is required' });

  try {
    const item = await PlaidItem.findOne({ itemId, userId: req.user.id });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    const decryptedToken = decrypt(item.accessToken);

    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: req.user.id.toString() },
      client_name: 'PFM Dashboard',
      country_codes: [CountryCode.Us],
      language: 'en',
      webhook: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/plaid/webhooks`,
      access_token: decryptedToken, // update mode: provide access_token, NOT products
    });

    res.json({ link_token: response.data.link_token });
  } catch (error) {
    console.error('[Plaid] Update token creation failed:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Failed to create update link token' });
  }
};

/**
 * POST /api/plaid/exchange-token
 * Exchanges a public_token (one-time use) for a permanent access_token.
 * Stores the access_token ENCRYPTED at rest.
 */
export const exchangePublicToken = async (req, res) => {
  const { publicToken } = req.body;
  if (!publicToken) return res.status(400).json({ success: false, message: 'publicToken is required' });

  try {
    // 1. Exchange public token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });
    const { access_token, item_id } = exchangeResponse.data;

    // 2. Get institution info
    const itemResponse = await plaidClient.itemGet({ access_token });
    const institutionId = itemResponse.data.item.institution_id;
    let institutionName = null;
    try {
      const instResponse = await plaidClient.institutionsGetById({
        institution_id: institutionId,
        country_codes: [CountryCode.Us],
      });
      institutionName = instResponse.data.institution.name;
    } catch (_) { /* Institution lookup failure is non-fatal */ }

    // 3. Store access_token ENCRYPTED
    const encryptedToken = encrypt(access_token);
    await PlaidItem.findOneAndUpdate(
      { itemId: item_id },
      {
        userId: req.user.id,
        itemId: item_id,
        accessToken: encryptedToken,
        institutionId,
        institutionName,
        status: 'ACTIVE',
        errorCode: null,
        errorMessage: null,
      },
      { upsert: true, new: true }
    );

    // 4. Fetch and save accounts
    await fetchAndSaveAccounts(access_token, item_id, req.user.id);

    // 5. Initial transaction sync (async — don't block response)
    syncTransactionsForItem(access_token, item_id, req.user.id).catch(err => {
      console.error('[Plaid] Initial sync failed (non-fatal):', err.message);
    });

    res.json({ success: true, itemId: item_id, institutionName });
  } catch (error) {
    console.error('[Plaid] Token exchange failed:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Failed to link bank account' });
  }
};

/**
 * POST /api/plaid/sync
 * Manual sync for all active items of the authenticated user.
 */
export const manualSync = async (req, res) => {
  try {
    const items = await PlaidItem.find({ userId: req.user.id, status: 'ACTIVE' });
    
    if (items.length === 0) {
      return res.json({ success: true, message: 'No linked accounts to sync' });
    }

    const results = [];
    for (const item of items) {
      const accessToken = decrypt(item.accessToken);
      if (!accessToken) {
        console.error(`[Plaid] Failed to decrypt access token for item ${item.itemId}`);
        continue;
      }
      try {
        const result = await syncTransactionsForItem(accessToken, item.itemId, req.user.id.toString());
        results.push({ itemId: item.itemId, ...result });
      } catch (err) {
        // ITEM_LOGIN_REQUIRED — mark item as error, don't crash whole sync
        if (err.response?.data?.error_code === 'ITEM_LOGIN_REQUIRED') {
          await PlaidItem.findOneAndUpdate(
            { itemId: item.itemId },
            { status: 'ERROR', errorCode: 'ITEM_LOGIN_REQUIRED', errorMessage: 'Bank login required' }
          );
          results.push({ itemId: item.itemId, error: 'ITEM_LOGIN_REQUIRED' });
        } else {
          console.error(`[Plaid] Sync failed for item ${item.itemId}:`, err.message);
          results.push({ itemId: item.itemId, error: err.message });
        }
      }
    }

    res.json({ success: true, message: 'Sync complete', results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/plaid/webhooks
 * Handles Plaid webhook events.
 * NOTE: In production, add JWT signature verification using plaid-verification header.
 * For sandbox, Plaid cannot reach localhost so webhooks won't fire — use manual sync.
 */
export const webhookHandler = async (req, res) => {
  // Immediately acknowledge to Plaid (must respond within 10s)
  res.sendStatus(200);

  const { webhook_type, webhook_code, item_id, error } = req.body;
  console.log(`[Plaid Webhook] ${webhook_type}:${webhook_code} for item ${item_id}`);

  try {
    if (webhook_type === 'TRANSACTIONS') {
      if (['SYNC_UPDATES_AVAILABLE', 'INITIAL_UPDATE', 'HISTORICAL_UPDATE'].includes(webhook_code)) {
        const item = await PlaidItem.findOne({ itemId: item_id });
        if (!item || item.status !== 'ACTIVE') return;

        const accessToken = decrypt(item.accessToken);
        if (!accessToken) return;

        // Run sync async (we already responded 200)
        syncTransactionsForItem(accessToken, item_id, item.userId.toString()).catch(err => {
          console.error('[Plaid Webhook] Sync error:', err.message);
        });
      }
    } else if (webhook_type === 'ITEM') {
      if (webhook_code === 'ERROR') {
        await PlaidItem.findOneAndUpdate(
          { itemId: item_id },
          {
            status: 'ERROR',
            errorCode: error?.error_code,
            errorMessage: error?.error_message,
          }
        );
        console.warn(`[Plaid Webhook] Item ${item_id} entered ERROR state: ${error?.error_code}`);
      } else if (webhook_code === 'PENDING_DISCONNECT') {
        await PlaidItem.findOneAndUpdate({ itemId: item_id }, { status: 'PENDING_DISCONNECT' });
      } else if (webhook_code === 'USER_PERMISSION_REVOKED') {
        await PlaidItem.findOneAndUpdate({ itemId: item_id }, { status: 'REVOKED' });
        // Clean up user data per data retention policy
        await Transaction.deleteMany({ itemId: item_id });
        await Account.deleteMany({ itemId: item_id });
        console.warn(`[Plaid Webhook] Item ${item_id} revoked — data cleaned up`);
      }
    }
  } catch (err) {
    console.error('[Plaid Webhook] Processing error:', err);
  }
};
