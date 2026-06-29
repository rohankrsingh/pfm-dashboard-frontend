import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';
import PlaidItem from '../models/PlaidItem.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';

// Setup Plaid client
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

export const createLinkToken = async (req, res) => {
  try {
    const response = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: req.user.id,
      },
      client_name: 'PFM Dashboard',
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: 'en',
      webhook: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/api/plaid/webhooks`, // Should be public URL in prod
      transactions: {
        days_requested: 180,
      },
    });

    res.json({ link_token: response.data.link_token });
  } catch (error) {
    console.error('Link token creation failed:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Failed to create link token' });
  }
};

export const exchangePublicToken = async (req, res) => {
  const { publicToken } = req.body;

  try {
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const { access_token, item_id } = exchangeResponse.data;

    // Save PlaidItem to DB
    // Note: In production, access_token should be encrypted at rest!
    await PlaidItem.create({
      userId: req.user.id,
      itemId: item_id,
      accessToken: access_token,
      status: 'ACTIVE'
    });

    // Fetch accounts from Plaid and save them
    const accountsResponse = await plaidClient.accountsGet({
      access_token,
    });

    const accountsData = accountsResponse.data.accounts.map(acc => ({
      userId: req.user.id,
      plaidAccountId: acc.account_id,
      itemId: item_id,
      name: acc.name,
      mask: acc.mask,
      type: acc.type === 'depository' && acc.subtype === 'savings' ? 'savings' :
            acc.type === 'depository' ? 'checking' : 
            acc.type === 'credit' ? 'credit_card' : 'checking',
      subtype: acc.subtype,
      balance: acc.balances.current || 0,
      currency: acc.balances.iso_currency_code || 'USD'
    }));

    await Account.insertMany(accountsData);

    // Initial sync
    await syncTransactions(access_token, item_id, req.user.id);

    res.json({ success: true, itemId: item_id });
  } catch (error) {
    console.error('Token exchange failed:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Failed to exchange token' });
  }
};

// Internal function to sync transactions
export const syncTransactions = async (accessToken, itemId, userId) => {
  const item = await PlaidItem.findOne({ itemId });
  if (!item) return;

  let cursor = item.transactionsCursor || null;
  let hasMore = true;

  while (hasMore) {
    try {
      const response = await plaidClient.transactionsSync({
        access_token: accessToken,
        cursor: cursor || undefined,
        count: 500,
      });

      const { added, modified, removed, next_cursor, has_more } = response.data;

      // Map account_id to our internal _id
      const accounts = await Account.find({ itemId });
      const accountMap = {};
      accounts.forEach(acc => accountMap[acc.plaidAccountId] = acc._id);

      // Process added
      if (added.length > 0) {
        const newTxns = added.map(txn => ({
          userId,
          plaidTransactionId: txn.transaction_id,
          itemId,
          accountId: accountMap[txn.account_id],
          amount: Math.abs(txn.amount), // Plaid amounts: positive = expense, negative = income
          type: txn.amount > 0 ? 'expense' : 'income',
          date: new Date(txn.date),
          description: txn.name,
          merchantName: txn.merchant_name,
          category: txn.personal_finance_category?.primary?.toLowerCase() || 'other',
          pending: txn.pending
        })).filter(txn => txn.accountId); // Ensure account is mapped

        if (newTxns.length > 0) {
          await Transaction.insertMany(newTxns, { ordered: false }).catch(e => console.error('Insert error (likely duplicate)', e.message));
        }
      }

      // Process modified
      for (const txn of modified) {
        await Transaction.findOneAndUpdate(
          { plaidTransactionId: txn.transaction_id },
          {
            amount: Math.abs(txn.amount),
            type: txn.amount > 0 ? 'expense' : 'income',
            description: txn.name,
            merchantName: txn.merchant_name,
            pending: txn.pending,
            category: txn.personal_finance_category?.primary?.toLowerCase() || 'other',
          }
        );
      }

      // Process removed
      if (removed.length > 0) {
        const removedIds = removed.map(r => r.transaction_id);
        await Transaction.deleteMany({ plaidTransactionId: { $in: removedIds } });
      }

      cursor = next_cursor;
      hasMore = has_more;

      // Update balances
      for (const account of accounts) {
        const balanceResponse = await plaidClient.accountsBalanceGet({
          access_token: accessToken,
          options: { account_ids: [account.plaidAccountId] }
        });
        const updatedAcc = balanceResponse.data.accounts[0];
        if (updatedAcc) {
          account.balance = updatedAcc.balances.current || 0;
          await account.save();
        }
      }

    } catch (error) {
      if (error.response?.data?.error_code === 'TRANSACTIONS_SYNC_MUTATION_DURING_PAGINATION') {
        cursor = null;
        continue;
      }
      console.error('Transactions sync error:', error.response?.data || error.message);
      break;
    }
  }

  item.transactionsCursor = cursor;
  await item.save();
};

export const manualSync = async (req, res) => {
  try {
    // Get all active items for user
    const items = await PlaidItem.find({ userId: req.user.id, status: 'ACTIVE' });
    
    for (const item of items) {
      await syncTransactions(item.accessToken, item.itemId, req.user.id);
    }
    
    res.status(200).json({ success: true, message: 'Sync complete' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const webhookHandler = async (req, res) => {
  // In production, verify webhook signature here!
  const { webhook_type, webhook_code, item_id, error } = req.body;

  try {
    if (webhook_type === 'TRANSACTIONS') {
      if (['SYNC_UPDATES_AVAILABLE', 'INITIAL_UPDATE', 'HISTORICAL_UPDATE'].includes(webhook_code)) {
        const item = await PlaidItem.findOne({ itemId: item_id });
        if (item) {
          await syncTransactions(item.accessToken, item_id, item.userId);
        }
      }
    } else if (webhook_type === 'ITEM') {
      if (webhook_code === 'ERROR') {
        await PlaidItem.findOneAndUpdate(
          { itemId: item_id },
          { status: 'ERROR', errorCode: error?.error_code, errorMessage: error?.error_message }
        );
      } else if (webhook_code === 'PENDING_DISCONNECT') {
        await PlaidItem.findOneAndUpdate({ itemId: item_id }, { status: 'PENDING_DISCONNECT' });
      } else if (webhook_code === 'USER_PERMISSION_REVOKED') {
        await PlaidItem.findOneAndUpdate({ itemId: item_id }, { status: 'REVOKED' });
        await Transaction.deleteMany({ itemId: item_id });
        await Account.deleteMany({ itemId: item_id });
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('Webhook error:', err);
    res.sendStatus(500);
  }
};
