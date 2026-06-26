import { useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { Capacitor } from '@capacitor/core';
import { getMessagingInstance } from '@/lib/firebase';
import api from '@/api/client';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-toastify';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

export function usePushNotifications() {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    if (Capacitor.isNativePlatform()) {
      // Android nativo — usar @capacitor/push-notifications
      import('@capacitor/push-notifications').then(({ PushNotifications }) => {
        PushNotifications.requestPermissions().then(r => {
          if (r.receive === 'granted') {
            PushNotifications.register();
            PushNotifications.addListener('registration', ({ value: token }) => {
              api.post('/user/fcm-token', { token, platform: 'android' });
            });
            PushNotifications.addListener('pushNotificationReceived', notif => {
              toast.info(`🔔 ${notif.title}: ${notif.body}`);
            });
          }
        });
      }).catch(() => {});
      return;
    }

    // Web PWA — Firebase Messaging
    (async () => {
      const messaging = await getMessagingInstance();
      if (!messaging) return;
      try {
        const token = await getToken(messaging, { vapidKey: VAPID_KEY });
        if (token) await api.post('/user/fcm-token', { token, platform: 'web' });
        onMessage(messaging, payload => {
          toast.info(`🔔 ${payload.notification?.title}: ${payload.notification?.body}`);
        });
      } catch {}
    })();
  }, [isAuthenticated]);
}
