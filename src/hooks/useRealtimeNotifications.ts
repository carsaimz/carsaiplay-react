import { useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db as firestoreDb } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

export function useRealtimeNotifications() {
  const { user, isAuthenticated } = useAuthStore();
  const qc = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    // Escutar novas notificações em tempo real via Firestore
    const q = query(
      collection(firestoreDb, 'notifications'),
      where('user_id', 'in', [String(user.id), 'all']),
      where('read', '==', false),
      orderBy('created_at', 'desc'),
      limit(10)
    );

    const unsub = onSnapshot(q, snap => {
      snap.docChanges().forEach(change => {
        if (change.type === 'added') {
          const data = change.doc.data();
          toast.info(`🔔 ${data.title}`, { toastId: change.doc.id });
          qc.invalidateQueries({ queryKey: ['notifications'] });
        }
      });
    }, () => {});

    return unsub;
  }, [isAuthenticated, user?.id]);
}
