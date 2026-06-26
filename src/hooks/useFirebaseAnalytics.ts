import { logEvent } from 'firebase/analytics';
import { analytics } from '@/lib/firebase';

export const trackEvent = (name: string, params?: Record<string, any>) => {
  if (analytics) logEvent(analytics, name, params);
};

export const useAnalytics = () => ({
  trackView:    (contentId: number, title: string) => trackEvent('content_view', { content_id: contentId, content_name: title }),
  trackSearch:  (query: string)                    => trackEvent('search', { search_term: query }),
  trackFavorite:(contentId: number)                => trackEvent('add_to_wishlist', { content_id: contentId }),
  trackRating:  (contentId: number, rating: number)=> trackEvent('rate_content', { content_id: contentId, rating }),
  trackShare:   (contentId: number)                => trackEvent('share', { content_id: contentId }),
  trackSignup:  (method: string)                   => trackEvent('sign_up', { method }),
  trackLogin:   (method: string)                   => trackEvent('login', { method }),
});
