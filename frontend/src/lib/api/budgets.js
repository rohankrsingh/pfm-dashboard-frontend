import { client } from './client.js';

export const budgetApi = {
  getBudgets: async (month) => {
    return client.get(`/budgets?month=${month}`);
  },

  createBudget: async (budgetData) => {
    return client.post('/budgets', budgetData);
  },

  updateBudget: async (id, budgetData) => {
    return client.put(`/budgets/${id}`, budgetData);
  },

  deleteBudget: async (id) => {
    return client.delete(`/budgets/${id}`);
  }
};
