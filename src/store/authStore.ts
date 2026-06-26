import { create } from 'zustand';
import { Preferences } from '@capacitor/preferences';
import api from '@/api/client';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loadSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  loadSession: async () => {
    try {
      const { value: token } = await Preferences.get({ key: 'cp_token' });
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const res = await api.get('/me');
        if (res.data.ok) {
          set({ user: res.data.data, token, isAuthenticated: true });
        } else {
          await Preferences.remove({ key: 'cp_token' });
        }
      }
    } catch {
      await Preferences.remove({ key: 'cp_token' });
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (!res.data.ok) throw new Error(res.data.error);
    const { token, user } = res.data.data;
    await Preferences.set({ key: 'cp_token', value: token });
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    set({ user, token, isAuthenticated: true });
  },

  logout: async () => {
    try { await api.post('/auth/logout'); } catch {}
    await Preferences.remove({ key: 'cp_token' });
    delete api.defaults.headers.common['Authorization'];
    set({ user: null, token: null, isAuthenticated: false });
  },

  setUser: (user) => set({ user }),
}));
