import { useState } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '@/api/client';

export default function Settings() {
  const { lang, setLang } = useSettingsStore();
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();
  const t = (pt: string, en: string) => lang === 'en' ? en : pt;
  const [changingPw, setChangingPw] = useState(false);
  const [pw, setPw] = useState({ current: '', new: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success(t('Sessão encerrada.', 'Session ended.'));
    navigate('/');
  };

  const handleChangePw = async () => {
    if (pw.new !== pw.confirm) { toast.error(t('Palavras-passe não coincidem.', 'Passwords do not match.')); return; }
    if (pw.new.length < 8) { toast.error(t('Mínimo 8 caracteres.', 'Minimum 8 characters.')); return; }
    setPwLoading(true);
    try {
      await api.post('/user/change-password', { current_password: pw.current, new_password: pw.new });
      toast.success(t('Palavra-passe alterada!', 'Password changed!'));
      setChangingPw(false);
      setPw({ current: '', new: '', confirm: '' });
    } catch (e: any) {
      toast.error(e.response?.data?.error || t('Erro ao alterar.', 'Error changing password.'));
    } finally { setPwLoading(false); }
  };

  return (
    <div className="max-w-lg mx-auto px-4 md:px-6 py-8">
      <h1 className="page-title mb-8">
        <i className="fa-solid fa-gear text-primary mr-3" />{t('Definições', 'Settings')}
      </h1>
      <div className="space-y-4">

        {/* Language */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-white mb-3">
            <i className="fa-solid fa-language text-primary mr-2" />{t('Idioma', 'Language')}
          </h3>
          <div className="flex gap-2">
            {[['pt', '🇲🇿 Português'], ['en', '🇬🇧 English']] as const}
              {(['pt', 'en'] as const).map((code) => (
              <button key={code} onClick={() => setLang(code)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${lang === code ? 'bg-primary text-white' : 'btn-ghost'}`}>
                {code === 'pt' ? '🇲🇿 Português' : '🇬🇧 English'}
              </button>
            ))}
          </div>
        </div>

        {/* Change password */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">
              <i className="fa-solid fa-key text-primary mr-2" />{t('Palavra-passe', 'Password')}
            </h3>
            <button onClick={() => setChangingPw(v => !v)} className="text-xs text-primary hover:underline">
              {changingPw ? t('Cancelar', 'Cancel') : t('Alterar', 'Change')}
            </button>
          </div>
          {changingPw && (
            <div className="space-y-3">
              {[
                ['current', t('Palavra-passe actual', 'Current password')],
                ['new',     t('Nova palavra-passe', 'New password')],
                ['confirm', t('Confirmar nova', 'Confirm new')],
              ].map(([k, label]) => (
                <div key={k}>
                  <label className="label">{label}</label>
                  <input type="password" value={(pw as any)[k]} onChange={e => setPw(f => ({ ...f, [k]: e.target.value }))}
                    className="input" minLength={k !== 'current' ? 8 : undefined} />
                </div>
              ))}
              <button onClick={handleChangePw} disabled={pwLoading || !pw.current || !pw.new || !pw.confirm}
                className="btn-primary w-full text-sm">
                {pwLoading ? <i className="fa-solid fa-circle-notch animate-spin" /> : <i className="fa-solid fa-check" />}
                {t('Guardar', 'Save')}
              </button>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-white mb-3">
            <i className="fa-solid fa-bell text-primary mr-2" />{t('Notificações', 'Notifications')}
          </h3>
          <div className="space-y-3">
            {[
              ['notif_new_episode', t('Novos episódios de séries que sigo', 'New episodes of followed series')],
              ['notif_newsletter',  t('Newsletter do CarsaiPlay', 'CarsaiPlay newsletter')],
              ['notif_requests',    t('Actualizações dos meus pedidos', 'Updates on my requests')],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-text-secondary">{label}</span>
                <input type="checkbox" defaultChecked className="accent-primary" />
              </label>
            ))}
          </div>
        </div>

        {/* Account info */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-white mb-3">
            <i className="fa-solid fa-user text-primary mr-2" />{t('Conta', 'Account')}
          </h3>
          <p className="text-xs text-text-muted mb-3">{user?.email}</p>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-950/20 border border-red-900/30 transition-colors">
            <i className="fa-solid fa-right-from-bracket" /> {t('Terminar sessão', 'Sign out')}
          </button>
        </div>

        <p className="text-center text-xs text-text-muted pt-2">CarsaiPlay v1.0.0</p>
      </div>
    </div>
  );
}
