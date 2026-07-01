import { client } from './client.js';

export const plaidApi = {
  /** Create a fresh link token for new bank connection */
  createLinkToken: async () => {
    return client.post('/plaid/create-link-token');
  },

  /**
   * Create a link token for update mode (re-authentication).
   * Used when item is in ITEM_LOGIN_REQUIRED error state.
   */
  createUpdateLinkToken: async (itemId) => {
    return client.post('/plaid/create-update-token', { itemId });
  },

  /** Exchange one-time public_token for permanent access */
  exchangePublicToken: async (publicToken) => {
    return client.post('/plaid/exchange-token', { publicToken });
  },

  /** Manually trigger transaction sync for all linked accounts */
  syncTransactions: async () => {
    return client.post('/plaid/sync');
  }
};
