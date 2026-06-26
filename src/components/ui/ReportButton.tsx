import { useState } from 'react';
import api from '@/api/client';
import { useSettingsStore } from '@/store/settingsStore';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/store/authStore';
import { AnimatePresence, motion } from 'framer-motion';

const REASONS = [
  { value: 'broken_link',   pt: 'Link partido ou em falta', en: 'Broken or missing link' },
  { value: 'wrong_info',    pt: 'Informação incorrecta',    en: 'Wrong information' },
  { value: 'wrong_audio',   pt: 'Áudio errado',             en: 'Wrong audio' },
  { value: 'quality',       pt: 'Problema de qualidade',    en: 'Quality issue' },
  { value: 'other',         pt: 'Outro',                    en: 'Other' },
];

export default function ReportButton({ contentId, episodeId }: { contentId: number; episodeId?: number }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('broken_link');
  const [loading, setLoading] = useState(false);
  const { lang } = useSettingsStore();
  const { isAuthenticated } = useAuthStore();
  const t = (pt: string, en: string) => lang === 'en' ? en : pt;

  const submit = async () => {
    setLoading(true);
    try {
      await api.post('/report', { content_id: contentId, episode_id: episodeId, reason });
      toast.success(t('Relatório enviado. Obrigado!', 'Report sent. Thank you!'));
      setOpen(false);
    } catch { toast.error(t('Erro ao enviar.', 'Error sending report.')); }
    finally { setLoading(false); }
  };

  return (
    <div className="relative">
      <button onClick={() => isAuthenticated ? setOpen(v => !v) : toast.info(t('Inicie sessão para reportar.', 'Sign in to report.'))}
        className="btn-ghost text-xs gap-1.5 text-text-muted">
        <i className="fa-solid fa-flag" /> {t('Reportar problema', 'Report problem')}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute bottom-full right-0 mb-2 w-60 bg-surface-card border border-surface-border rounded-xl shadow-2xl z-50 p-4">
            <h4 className="text-sm font-semibold text-white mb-3">{t('Reportar problema', 'Report problem')}</h4>
            <div className="space-y-2 mb-3">
              {REASONS.map(r => (
                <label key={r.value} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="reason" value={r.value} checked={reason === r.value} onChange={e => setReason(e.target.value)}
                    className="accent-primary" />
                  <span className="text-sm text-text-secondary">{lang === 'en' ? r.en : r.pt}</span>
                </label>
              ))}
            </div>
            <button onClick={submit} disabled={loading} className="btn-primary w-full text-sm">
              {loading ? <i className="fa-solid fa-circle-notch animate-spin" /> : <i className="fa-solid fa-paper-plane" />}
              {t('Enviar', 'Send')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
