import { client } from './client.js';

export const budgetApi = {
  getBudgets: async (month) => {
    const { data } = await client.get(`/budgets?month=${month}`);
    return data;
  },

  createBudget: async (budgetData) => {
    const { data } = await client.post('/budgets', budgetData);
    return data;
  },

  updateBudget: async (id, budgetData) => {
    const { data } = await client.put(`/budgets/${id}`, budgetData);
    return data;
  },

  deleteBudget: async (id) => {
    const { data } = await client.delete(`/budgets/${id}`);
    return data;
  }
};
