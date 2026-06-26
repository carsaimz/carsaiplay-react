import { useSettingsStore } from '@/store/settingsStore';
import type { Content, BlogPost } from '@/types';

export const useLang = () => {
  const { lang } = useSettingsStore();

  const t = (pt: string, en?: string) =>
    lang === 'en' && en ? en : pt;

  const title = (item: Pick<Content | BlogPost, 'title_pt' | 'title_en'>) =>
    (lang === 'en' && item.title_en) ? item.title_en : item.title_pt;

  const desc = (item: Pick<Content, 'description_pt' | 'description_en'>) =>
    (lang === 'en' && item.description_en) ? item.description_en : item.description_pt;

  return { lang, t, title, desc };
};
