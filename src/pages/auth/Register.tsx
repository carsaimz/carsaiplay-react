import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-toastify';
import { useSettingsStore } from '@/store/settingsStore';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const { lang } = useSettingsStore();
  const navigate = useNavigate();
  const t = (pt: string, en: string) => lang === 'en' ? en : pt;

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.register(form);
      await login(form.email, form.password);
      toast.success(t('Conta criada com sucesso!', 'Account created successfully!'));
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.error || t('Erro ao criar conta.', 'Error creating account.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-8">
      <h2 className="text-xl font-semibold text-white mb-6">{t('Criar conta', 'Create account')}</h2>
      <form onSubmit={handle} className="space-y-4">
        {[
          ['name', t('Nome', 'Name'), 'text', t('O teu nome', 'Your name')],
          ['email', 'Email', 'email', 'nome@exemplo.com'],
          ['password', t('Palavra-passe', 'Password'), 'password', '••••••••'],
        ].map(([key, label, type, ph]) => (
          <div key={key}>
            <label className="label">{label}</label>
            <input type={type} value={(form as any)[key]} placeholder={ph}
              onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              className="input" required />
          </div>
        ))}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <i className="fa-solid fa-circle-notch animate-spin" /> : <i className="fa-solid fa-user-plus" />}
          {t('Registar', 'Register')}
        </button>
      </form>
      <p className="text-center text-sm text-text-muted mt-6">
        {t('Já tens conta?', 'Already have an account?')}
        {' '}<Link to="/login" className="text-primary hover:underline">{t('Entrar', 'Sign in')}</Link>
      </p>
    </div>
  );
}
