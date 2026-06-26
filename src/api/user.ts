import api from './client';

export const userApi = {
  favorites:    () => api.get('/favorites'),
  history:      () => api.get('/user/history'),
  watchLater:   () => api.get('/user/watch-later'),
  requests:     () => api.get('/user/requests'),
  notifications:() => api.get('/notifications'),
  achievements: () => api.get('/user/achievements'),
  stats:        () => api.get('/user/stats'),
  profile:      (data: FormData) => api.post('/user/profile', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  markRead: (id: number) => api.post('/user/notification/read', { id }),
};
