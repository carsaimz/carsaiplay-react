import api from './client';

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),

  forgot: (email: string) =>
    api.post('/auth/forgot', { email }),

  reset: (data: { token: string; password: string }) =>
    api.post('/auth/reset', data),

  me: () => api.get('/me'),

  logout: () => api.post('/auth/logout'),
};
