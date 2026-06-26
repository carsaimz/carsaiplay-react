import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { useSettingsStore } from '@/store/settingsStore';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const ICONS = ['user','user-astronaut','user-ninja','user-secret','user-tie','child','person','robot','cat','dragon','ghost'];

export default function Profiles() {
  const { lang } = useSettingsStore();
  const t = (pt: string, en: string) => lang === 'en' ? en : pt;
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', icon: 'user', pin: '', age_limit: 18 });

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => api.get('/user/profiles').then(r => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/user/profiles/create', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['profiles'] }); setShowForm(false); setForm({ name: '', icon: 'user', pin: '', age_limit: 18 }); toast.success(t('Perfil criado!', 'Profile created!')); },
    onError: (e: any) => toast.error(e.response?.data?.error || t('Erro ao criar perfil.', 'Error creating profile.')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.post(`/user/profiles/${id}/delete`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['profiles'] }); toast.success(t('Perfil eliminado.', 'Profile deleted.')); },
  });

  const switchMutation = useMutation({
    mutationFn: (id: number) => api.post('/user/switch-profile', { profile_id: id }),
    onSuccess: () => { toast.success(t('Perfil activo alterado!', 'Active profile changed!')); qc.invalidateQueries(); },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="page-title"><i className="fa-solid fa-users text-primary mr-3" />{t('Perfis', 'Profiles')}</h1>
        {profiles.length < 5 && (
          <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
            <i className="fa-solid fa-plus" /> {t('Novo Perfil', 'New Profile')}
          </button>
        )}
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card p-6 mb-6">
          <h3 className="font-semibold text-white mb-4">{t('Novo Perfil', 'New Profile')}</h3>
          <div className="space-y-4">
            <div>
              <label className="label">{t('Nome', 'Name')}</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input" placeholder="Ex: João, Infantil..." />
            </div>
            <div>
              <label className="label">{t('Ícone', 'Icon')}</label>
              <div className="flex flex-wrap gap-2">
                {ICONS.map(icon => (
                  <button key={icon} onClick={() => setForm(f => ({ ...f, icon }))}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${form.icon === icon ? 'bg-primary text-white' : 'bg-surface-elevated text-text-muted hover:text-white'}`}>
                    <i className={`fa-solid fa-${icon}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">{t('PIN (opcional)', 'PIN (optional)')}</label>
                <input type="password" maxLength={4} value={form.pin} onChange={e => setForm(f => ({ ...f, pin: e.target.value }))} className="input" placeholder="0000" />
              </div>
              <div>
                <label className="label">{t('Limite de Idade', 'Age Limit')}</label>
                <select value={form.age_limit} onChange={e => setForm(f => ({ ...f, age_limit: parseInt(e.target.value) }))} className="input">
                  {[0, 10, 12, 14, 16, 18].map(a => <option key={a} value={a}>{a === 0 ? t('Livre', 'Free') : `${a}+`}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => createMutation.mutate(form)} disabled={!form.name || createMutation.isPending} className="btn-primary">
                {createMutation.isPending ? <i className="fa-solid fa-circle-notch animate-spin" /> : <i className="fa-solid fa-check" />}
                {t('Criar', 'Create')}
              </button>
              <button onClick={() => setShowForm(false)} className="btn-ghost">{t('Cancelar', 'Cancel')}</button>
            </div>
          </div>
        </motion.div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-32 rounded-xl" />)}</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {profiles.map((p: any) => (
            <div key={p.id} className={`card p-5 flex flex-col items-center text-center gap-3 ${p.is_primary ? 'border-primary/40' : ''}`}>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${p.is_primary ? 'bg-primary/20 border-2 border-primary' : 'bg-surface-elevated border border-surface-border'}`}>
                <i className={`fa-solid fa-${p.avatar_icon || 'user'} text-xl ${p.is_primary ? 'text-primary' : 'text-text-muted'}`} />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{p.profile_name}</p>
                {p.is_primary && <span className="badge-red text-[10px] mt-1">{t('Principal', 'Primary')}</span>}
                <p className="text-xs text-text-muted mt-1">{p.age_limit === 0 ? t('Livre', 'Free') : `${p.age_limit}+`}</p>
              </div>
              <div className="flex gap-2 w-full mt-auto">
                <button onClick={() => switchMutation.mutate(p.id)} className="btn-primary flex-1 py-1.5 text-xs">
                  <i className="fa-solid fa-right-to-bracket" /> {t('Usar', 'Use')}
                </button>
                {!p.is_primary && (
                  <button onClick={() => { if (confirm(t('Eliminar este perfil?', 'Delete this profile?'))) deleteMutation.mutate(p.id); }}
                    className="btn-icon w-8 h-8 text-xs text-red-400">
                    <i className="fa-solid fa-trash" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
