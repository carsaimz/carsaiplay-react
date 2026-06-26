import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { useSettingsStore } from '@/store/settingsStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function PwaInstallBanner() {
  const [prompt, setPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);
  const { lang } = useSettingsStore();
  const t = (pt: string, en: string) => lang === 'en' ? en : pt;

  useEffect(() => {
    if (Capacitor.isNativePlatform()) return; // Já é app nativa
    const dismissed = localStorage.getItem('pwa_dismissed');
    if (dismissed) return;

    const handler = (e: any) => { e.preventDefault(); setPrompt(e); setShow(true); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setShow(false);
  };

  const dismiss = () => { setShow(false); localStorage.setItem('pwa_dismissed', '1'); };

  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 card border-primary/40 p-4 shadow-2xl">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
              <i className="fa-solid fa-download text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">{t('Instalar CarsaiPlay', 'Install CarsaiPlay')}</p>
              <p className="text-xs text-text-muted mt-0.5">{t('Adicione ao ecrã inicial para acesso rápido.', 'Add to home screen for quick access.')}</p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={install} className="btn-primary flex-1 text-sm py-2">
              <i className="fa-solid fa-mobile-screen-button" /> {t('Instalar', 'Install')}
            </button>
            <button onClick={dismiss} className="btn-ghost text-sm py-2">
              {t('Agora não', 'Not now')}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
