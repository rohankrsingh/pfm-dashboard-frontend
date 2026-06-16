import { client } from './client';

export const accountService = {
  getAccounts: async () => {
    return client.get('/accounts');
  },

  getAccount: async (id) => {
    return client.get(`/accounts/${id}`);
  },

  createAccount: async (name, type, balance, color) => {
    return client.post('/accounts', { name, type, balance: parseFloat(balance), color });
  },

  updateAccount: async (id, data) => {
    return client.put(`/accounts/${id}`, data);
  },

  deleteAccount: async (id) => {
    return client.delete(`/accounts/${id}`);
  }
};
