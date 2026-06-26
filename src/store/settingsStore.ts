import { create } from 'zustand';
import { Preferences } from '@capacitor/preferences';

type Lang = 'pt' | 'en';
type Theme = 'dark';

interface SettingsState {
  lang: Lang;
  theme: Theme;
  setLang: (lang: Lang) => void;
  loadSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  lang: 'pt',
  theme: 'dark',
  setLang: async (lang) => {
    set({ lang });
    await Preferences.set({ key: 'cp_lang', value: lang });
  },
  loadSettings: async () => {
    const { value: lang } = await Preferences.get({ key: 'cp_lang' });
    if (lang === 'pt' || lang === 'en') set({ lang });
  },
}));
