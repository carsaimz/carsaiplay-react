import { useState } from 'react';
import {
  signInWithPopup, signOut as firebaseSignOut,
  onAuthStateChanged, User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '@/lib/firebase';
import api from '@/api/client';
import { useAuthStore } from '@/store/authStore';
import { Preferences } from '@capacitor/preferences';
import { toast } from 'react-toastify';

export function useFirebaseAuth() {
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const res = await api.post('/auth/firebase', { id_token: idToken, provider: 'google' });
      if (res.data.ok) {
        const { token, user } = res.data.data;
        await Preferences.set({ key: 'cp_token', value: token });
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(user);
        toast.success(`Bem-vindo, ${user.name}!`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro ao entrar com Google.');
    } finally { setLoading(false); }
  };

  const signInWithFacebook = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const idToken = await result.user.getIdToken();
      const res = await api.post('/auth/firebase', { id_token: idToken, provider: 'facebook' });
      if (res.data.ok) {
        const { token, user } = res.data.data;
        await Preferences.set({ key: 'cp_token', value: token });
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(user);
        toast.success(`Bem-vindo, ${user.name}!`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro ao entrar com Facebook.');
    } finally { setLoading(false); }
  };

  return { signInWithGoogle, signInWithFacebook, loading };
}
