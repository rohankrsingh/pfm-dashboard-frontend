import { client } from './client';

export const authService = {
  login: async (email, password) => {
    const data = await client.post('/auth/login', { email, password });
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    return data;
  },

  signup: async (name, email, password) => {
    const data = await client.post('/auth/signup', { name, email, password });
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    return data;
  },

  getMe: async () => {
    return client.get('/auth/me');
  },

  logout: () => {
    localStorage.removeItem('token');
  }
};
