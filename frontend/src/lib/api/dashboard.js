import { client } from './client';

export const dashboardService = {
  getDashboardSummary: async () => {
    return client.get('/dashboard/summary');
  },

  getMonthlyStats: async (month) => {
    return client.get(`/dashboard/stats/${month}`);
  }
};
