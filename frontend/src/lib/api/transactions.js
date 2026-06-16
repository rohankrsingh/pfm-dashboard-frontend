import { client } from './client';

export const transactionService = {
  getTransactions: async () => {
    return client.get('/transactions');
  },

  getTransactionsByAccount: async (accountId) => {
    return client.get(`/transactions/account/${accountId}`);
  },

  createTransaction: async (data) => {
    return client.post('/transactions', {
      description: data.description,
      amount: parseFloat(data.amount),
      type: data.type,
      category: data.category,
      accountId: data.accountId,
      date: data.date,
      notes: data.notes
    });
  },

  updateTransaction: async (id, data) => {
    return client.put(`/transactions/${id}`, data);
  },

  deleteTransaction: async (id) => {
    return client.delete(`/transactions/${id}`);
  }
};
