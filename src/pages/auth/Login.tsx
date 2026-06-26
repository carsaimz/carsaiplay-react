import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useAnalytics } from '@/hooks/useFirebaseAnalytics';
import { toast } from 'react-toastify';
import { useSettingsStore } from '@/store/settingsStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [pass, setPass]   = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuthStore();
  const { lang } = useSettingsStore();
  const navigate = useNavigate();
  const { signInWithGoogle, signInWithFacebook, loading: oauthLoading } = useFirebaseAuth();
  const { trackLogin } = useAnalytics();
  const t = (pt: string, en: string) => lang === 'en' ? en : pt;

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, pass);
      trackLogin('email');
      toast.success(t('Bem-vindo!', 'Welcome back!'));
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || t('Credenciais inválidas.', 'Invalid credentials.'));
    } finally { setLoading(false); }
  };

  return (
    <div className="card p-8">
      <h2 className="text-xl font-semibold text-white mb-1">{t('Entrar', 'Sign in')}</h2>
      <p className="text-sm text-text-muted mb-6">{t('Bem-vindo de volta!', 'Welcome back!')}</p>

      {/* OAuth buttons */}
      <div className="flex flex-col gap-2 mb-5">
        <button onClick={() => { signInWithGoogle(); trackLogin('google'); }} disabled={oauthLoading}
          className="btn-ghost w-full gap-3">
          <i className="fa-brands fa-google text-red-400" />
          {t('Continuar com Google', 'Continue with Google')}
        </button>
        <button onClick={() => { signInWithFacebook(); trackLogin('facebook'); }} disabled={oauthLoading}
          className="btn-ghost w-full gap-3">
          <i className="fa-brands fa-facebook text-blue-500" />
          {t('Continuar com Facebook', 'Continue with Facebook')}
        </button>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <hr className="flex-1 border-surface-border" />
        <span className="text-xs text-text-muted">{t('ou com email', 'or with email')}</span>
        <hr className="flex-1 border-surface-border" />
      </div>

      <form onSubmit={handle} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            className="input" placeholder="nome@exemplo.com" required autoComplete="email" />
        </div>
        <div>
          <label className="label">{t('Palavra-passe', 'Password')}</label>
          <div className="relative">
            <input type={showPass ? 'text' : 'password'} value={pass} onChange={e => setPass(e.target.value)}
              className="input pr-10" placeholder="••••••••" required autoComplete="current-password" />
            <button type="button" onClick={() => setShowPass(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white">
              <i className={`fa-solid fa-eye${showPass ? '-slash' : ''} text-sm`} />
            </button>
          </div>
        </div>
        <div className="text-right">
          <Link to="/forgot-password" className="text-xs text-primary hover:underline">
            {t('Esqueceste a palavra-passe?', 'Forgot your password?')}
          </Link>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <i className="fa-solid fa-circle-notch animate-spin" /> : <i className="fa-solid fa-right-to-bracket" />}
          {t('Entrar', 'Sign in')}
        </button>
      </form>
      <p className="text-center text-sm text-text-muted mt-6">
        {t('Ainda não tens conta?', "Don't have an account?")}
        {' '}<Link to="/register" className="text-primary hover:underline">{t('Registar', 'Register')}</Link>
      </p>
    </div>
  );
}
