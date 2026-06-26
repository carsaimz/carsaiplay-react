import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { toast } from 'react-toastify';
import { useSettingsStore } from '@/store/settingsStore';

export default function Forgot() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { lang } = useSettingsStore();
  const t = (pt: string, en: string) => lang === 'en' ? en : pt;

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgot(email);
      setSent(true);
    } catch {
      toast.error(t('Erro ao enviar email.', 'Error sending email.'));
    } finally { setLoading(false); }
  };

  if (sent) return (
    <div className="card p-8 text-center">
      <i className="fa-solid fa-envelope-circle-check text-5xl text-primary mb-4" />
      <h2 className="text-xl font-semibold text-white mb-2">{t('Email enviado!', 'Email sent!')}</h2>
      <p className="text-sm text-text-muted">{t('Verifica a tua caixa de entrada.', 'Check your inbox.')}</p>
      <Link to="/login" className="btn-primary mt-6 inline-flex">{t('Voltar', 'Back')}</Link>
    </div>
  );

  return (
    <div className="card p-8">
      <h2 className="text-xl font-semibold text-white mb-2">{t('Recuperar palavra-passe', 'Recover password')}</h2>
      <p className="text-sm text-text-muted mb-6">{t('Insere o teu email e enviaremos um link.', 'Enter your email and we will send you a link.')}</p>
      <form onSubmit={handle} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            className="input" required />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <i className="fa-solid fa-circle-notch animate-spin" /> : <i className="fa-solid fa-paper-plane" />}
          {t('Enviar', 'Send')}
        </button>
      </form>
      <Link to="/login" className="block text-center text-sm text-text-muted mt-4 hover:text-white">{t('Voltar ao login', 'Back to login')}</Link>
    </div>
  );
}
