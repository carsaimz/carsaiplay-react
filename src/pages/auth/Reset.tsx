import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { toast } from 'react-toastify';
import { useSettingsStore } from '@/store/settingsStore';

export default function Reset() {
  const [params] = useSearchParams();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { lang } = useSettingsStore();
  const navigate = useNavigate();
  const t = (pt: string, en: string) => lang === 'en' ? en : pt;

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = params.get('token') || '';
    setLoading(true);
    try {
      await authApi.reset({ token, password });
      toast.success(t('Palavra-passe redefinida!', 'Password reset!'));
      navigate('/login');
    } catch {
      toast.error(t('Link inválido ou expirado.', 'Invalid or expired link.'));
    } finally { setLoading(false); }
  };

  return (
    <div className="card p-8">
      <h2 className="text-xl font-semibold text-white mb-6">{t('Nova palavra-passe', 'New password')}</h2>
      <form onSubmit={handle} className="space-y-4">
        <div>
          <label className="label">{t('Nova palavra-passe', 'New password')}</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            className="input" required minLength={8} />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <i className="fa-solid fa-circle-notch animate-spin" /> : <i className="fa-solid fa-key" />}
          {t('Redefinir', 'Reset')}
        </button>
      </form>
    </div>
  );
}
