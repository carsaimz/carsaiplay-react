import { useState } from 'react';
import { useSetupStore } from '@/store/setupStore';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type Step = 'welcome' | 'database' | 'app' | 'admin' | 'confirm';

const STEPS: Step[] = ['welcome', 'database', 'app', 'admin', 'confirm'];

const stepLabels: Record<Step, string> = {
  welcome:  'Bem-vindo',
  database: 'Base de dados',
  app:      'Aplicação',
  admin:    'Administrador',
  confirm:  'Finalizar',
};

const stepIcons: Record<Step, string> = {
  welcome:  'fa-rocket',
  database: 'fa-database',
  app:      'fa-film',
  admin:    'fa-user-shield',
  confirm:  'fa-check-circle',
};

export default function Setup() {
  const { saveSetup } = useSetupStore();
  const [step, setStep] = useState<Step>('welcome');
  const [loading, setLoading] = useState(false);
  const [testingDb, setTestingDb] = useState(false);
  const [dbOk, setDbOk] = useState<boolean | null>(null);
  const [showPass, setShowPass] = useState(false);

  const [form, setForm] = useState({
    database_url:    '',
    app_secret:      crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, ''),
    api_url:         typeof window !== 'undefined' ? window.location.origin : '',
    app_name:        'CarsaiPlay',
    app_description: 'Filmes, Séries e Animes',
    app_country:     'MZ',
    admin_name:      '',
    admin_email:     '',
    admin_password:  '',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const stepIndex = STEPS.indexOf(step);

  const testDatabase = async () => {
    if (!form.database_url) { toast.error('Insere a URL da base de dados.'); return; }
    setTestingDb(true);
    setDbOk(null);
    try {
      const res = await fetch(`${form.api_url}/setup/test-db`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ database_url: form.database_url }),
        signal: AbortSignal.timeout(10000),
      });
      const data = await res.json();
      setDbOk(data.ok);
      if (data.ok) toast.success('Ligação à base de dados bem sucedida!');
      else toast.error(data.error || 'Erro de ligação.');
    } catch {
      setDbOk(false);
      toast.error('Não foi possível ligar. Verifica a URL.');
    } finally { setTestingDb(false); }
  };

  const handleFinish = async () => {
    setLoading(true);
    const result = await saveSetup(form as any);
    if (result.ok) {
      toast.success('CarsaiPlay configurado com sucesso! A iniciar...');
      setTimeout(() => window.location.reload(), 1500);
    } else {
      toast.error(result.error || 'Erro ao configurar.');
      setLoading(false);
    }
  };

  const canNext: Record<Step, boolean> = {
    welcome:  true,
    database: !!form.database_url,
    app:      !!form.app_name && !!form.api_url,
    admin:    !!form.admin_name && !!form.admin_email && form.admin_password.length >= 8,
    confirm:  true,
  };

  const next = () => {
    const i = STEPS.indexOf(step);
    if (i < STEPS.length - 1) setStep(STEPS[i + 1]);
  };
  const prev = () => {
    const i = STEPS.indexOf(step);
    if (i > 0) setStep(STEPS[i - 1]);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
      <ToastContainer position="top-right" autoClose={4000} theme="dark"
        toastStyle={{ background: '#111118', border: '1px solid #1e1e2a', color: '#f5f5f5' }} />

      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="font-display text-5xl tracking-widest bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
            CARSAIPLAY
          </span>
          <p className="text-text-muted text-sm mt-2">Instalação inicial</p>
        </div>

        {/* Step progress */}
        <div className="flex items-center justify-between mb-8 px-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <button
                onClick={() => i < stepIndex && setStep(s)}
                className={`flex flex-col items-center gap-1 transition-all ${i <= stepIndex ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                  i < stepIndex  ? 'bg-primary border-primary text-white' :
                  i === stepIndex? 'bg-primary/20 border-primary text-primary' :
                                   'bg-surface-elevated border-surface-border text-text-muted'
                }`}>
                  {i < stepIndex
                    ? <i className="fa-solid fa-check text-sm" />
                    : <i className={`fa-solid ${stepIcons[s]} text-sm`} />
                  }
                </div>
                <span className={`text-[10px] font-medium hidden sm:block ${i === stepIndex ? 'text-primary' : 'text-text-muted'}`}>
                  {stepLabels[s]}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 w-8 sm:w-12 mx-1 sm:mx-2 transition-colors ${i < stepIndex ? 'bg-primary' : 'bg-surface-border'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="bg-surface-card border border-surface-border rounded-2xl p-6 shadow-2xl"
          >

            {/* WELCOME */}
            {step === 'welcome' && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto">
                  <i className="fa-solid fa-rocket text-primary text-2xl" />
                </div>
                <h2 className="text-xl font-bold text-white">Bem-vindo ao CarsaiPlay!</h2>
                <p className="text-text-secondary text-sm leading-relaxed">
                  Este assistente vai configurar a tua plataforma de streaming em poucos passos.
                  Precisarás de:
                </p>
                <div className="text-left space-y-3 mt-4">
                  {[
                    ['fa-database', 'URL da base de dados Neon PostgreSQL', 'neon.tech'],
                    ['fa-link',     'URL da tua API (este domínio)',        'auto-detectado'],
                    ['fa-user',     'Dados do administrador',               'escolhes agora'],
                  ].map(([icon, label, hint]) => (
                    <div key={label} className="flex items-center gap-3 p-3 bg-surface-elevated rounded-lg">
                      <i className={`fa-solid ${icon} text-primary w-5 text-center`} />
                      <div>
                        <p className="text-sm text-white">{label}</p>
                        <p className="text-xs text-text-muted">{hint}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DATABASE */}
            {step === 'database' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <i className="fa-solid fa-database text-primary text-xl" />
                  <h2 className="text-lg font-bold text-white">Base de Dados</h2>
                </div>
                <p className="text-sm text-text-muted">
                  Obtém a connection string em{' '}
                  <a href="https://neon.tech" target="_blank" rel="noreferrer" className="text-primary hover:underline">
                    neon.tech
                  </a>
                  {' '}→ Project → Connection string
                </p>
                <div>
                  <label className="label">URL da Base de Dados (Neon) *</label>
                  <input
                    value={form.database_url}
                    onChange={e => { set('database_url', e.target.value); setDbOk(null); }}
                    className="input font-mono text-xs"
                    placeholder="postgresql://user:pass@ep-xxx.neon.tech/carsaiplay?sslmode=require"
                  />
                </div>
                <div>
                  <label className="label">Chave Secreta (APP_SECRET)</label>
                  <div className="relative">
                    <input
                      value={form.app_secret}
                      onChange={e => set('app_secret', e.target.value)}
                      className="input font-mono text-xs pr-10"
                      placeholder="string aleatória longa"
                    />
                    <button type="button" onClick={() => set('app_secret', crypto.randomUUID().replace(/-/g,'') + crypto.randomUUID().replace(/-/g,''))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors text-xs">
                      <i className="fa-solid fa-rotate" />
                    </button>
                  </div>
                  <p className="text-xs text-text-muted mt-1">Usada para hash de passwords. Guarda esta chave!</p>
                </div>
                <button onClick={testDatabase} disabled={!form.database_url || testingDb}
                  className={`btn w-full text-sm ${dbOk === true ? 'bg-success/20 text-success border border-success/30' : dbOk === false ? 'bg-primary/20 text-primary border border-primary/30' : 'btn-ghost'}`}>
                  {testingDb
                    ? <><i className="fa-solid fa-circle-notch animate-spin" /> A testar...</>
                    : dbOk === true
                    ? <><i className="fa-solid fa-check" /> Ligação OK</>
                    : dbOk === false
                    ? <><i className="fa-solid fa-times" /> Falhou — tentar novamente</>
                    : <><i className="fa-solid fa-vial" /> Testar ligação</>
                  }
                </button>
              </div>
            )}

            {/* APP */}
            {step === 'app' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <i className="fa-solid fa-film text-primary text-xl" />
                  <h2 className="text-lg font-bold text-white">Configurações da App</h2>
                </div>
                <div>
                  <label className="label">Nome da Aplicação *</label>
                  <input value={form.app_name} onChange={e => set('app_name', e.target.value)} className="input" placeholder="CarsaiPlay" />
                </div>
                <div>
                  <label className="label">Descrição</label>
                  <input value={form.app_description} onChange={e => set('app_description', e.target.value)} className="input" placeholder="Filmes, Séries e Animes" />
                </div>
                <div>
                  <label className="label">País</label>
                  <select value={form.app_country} onChange={e => set('app_country', e.target.value)} className="input">
                    {[['MZ','🇲🇿 Moçambique'],['PT','🇵🇹 Portugal'],['BR','🇧🇷 Brasil'],['AO','🇦🇴 Angola'],['CV','🇨🇻 Cabo Verde'],['OTHER','Outro']].map(([v,l])=>(
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">URL da API *</label>
                  <input value={form.api_url} onChange={e => set('api_url', e.target.value)} className="input font-mono text-sm" placeholder="https://carsaiplay.vercel.app" />
                  <p className="text-xs text-text-muted mt-1">URL base onde a API está hospedada (sem /api/v1)</p>
                </div>
              </div>
            )}

            {/* ADMIN */}
            {step === 'admin' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <i className="fa-solid fa-user-shield text-primary text-xl" />
                  <h2 className="text-lg font-bold text-white">Conta de Administrador</h2>
                </div>
                <div>
                  <label className="label">Nome completo *</label>
                  <input value={form.admin_name} onChange={e => set('admin_name', e.target.value)} className="input" placeholder="Administrador" />
                </div>
                <div>
                  <label className="label">Email *</label>
                  <input type="email" value={form.admin_email} onChange={e => set('admin_email', e.target.value)} className="input" placeholder="admin@carsaiplay.mz" />
                </div>
                <div>
                  <label className="label">Palavra-passe * (mínimo 8 caracteres)</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={form.admin_password}
                      onChange={e => set('admin_password', e.target.value)}
                      className="input pr-10"
                      placeholder="••••••••"
                      minLength={8}
                    />
                    <button type="button" onClick={() => setShowPass(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white">
                      <i className={`fa-solid fa-eye${showPass ? '-slash' : ''} text-sm`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* CONFIRM */}
            {step === 'confirm' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <i className="fa-solid fa-check-circle text-success text-xl" />
                  <h2 className="text-lg font-bold text-white">Confirmar e Instalar</h2>
                </div>
                <div className="space-y-2">
                  {[
                    ['fa-database', 'Base de dados', form.database_url ? '✓ Configurada' : '✗ Em falta'],
                    ['fa-film',     'Aplicação',     form.app_name],
                    ['fa-link',     'API URL',       form.api_url],
                    ['fa-user',     'Admin',         `${form.admin_name} (${form.admin_email})`],
                    ['fa-key',      'Secret',        form.app_secret.slice(0, 12) + '…'],
                  ].map(([icon, label, value]) => (
                    <div key={label} className="flex items-center gap-3 p-3 bg-surface-elevated rounded-lg">
                      <i className={`fa-solid ${icon} text-primary w-4 text-center text-sm`} />
                      <span className="text-sm text-text-muted w-24 shrink-0">{label}</span>
                      <span className="text-sm text-white truncate">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 text-xs text-warning">
                  <i className="fa-solid fa-triangle-exclamation mr-2" />
                  Após instalar, guarda o APP_SECRET num local seguro. Precisarás dele se reinstalares.
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-4">
          {stepIndex > 0 && (
            <button onClick={prev} className="btn-ghost flex-1">
              <i className="fa-solid fa-arrow-left" /> Anterior
            </button>
          )}
          {step !== 'confirm' ? (
            <button onClick={next} disabled={!canNext[step]}
              className="btn-primary flex-1">
              Próximo <i className="fa-solid fa-arrow-right" />
            </button>
          ) : (
            <button onClick={handleFinish} disabled={loading || !form.database_url || !form.admin_email}
              className="btn-primary flex-1">
              {loading
                ? <><i className="fa-solid fa-circle-notch animate-spin" /> A instalar...</>
                : <><i className="fa-solid fa-rocket" /> Instalar CarsaiPlay</>
              }
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
