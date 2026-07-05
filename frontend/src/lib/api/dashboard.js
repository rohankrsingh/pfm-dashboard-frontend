import { client } from './client';

export const dashboardService = {
  getDashboardSummary: async () => {
    return client.get('/dashboard/summary');
  },

  getCashFlowHistory: async () => {
    return client.get('/dashboard/history');
  },

  getMonthlyStats: async (month) => {
    return client.get(`/dashboard/stats/${month}`);
  },

  getAdvancedAnalytics: async () => {
    return client.get('/dashboard/advanced');
  }
};
