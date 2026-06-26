import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { userApi } from '@/api/user';
import { useSettingsStore } from '@/store/settingsStore';
import { toast } from 'react-toastify';
import { formatDate } from '@/utils/helpers';

const STATUS_MAP: Record<string, { label_pt: string; label_en: string; badge: string }> = {
  pending:   { label_pt: 'Pendente',    label_en: 'Pending',    badge: 'badge-yellow' },
  reviewing: { label_pt: 'Em análise',  label_en: 'Reviewing',  badge: 'badge-blue' },
  approved:  { label_pt: 'Aprovado',    label_en: 'Approved',   badge: 'badge-green' },
  rejected:  { label_pt: 'Rejeitado',   label_en: 'Rejected',   badge: 'badge-red' },
  added:     { label_pt: 'Adicionado',  label_en: 'Added',      badge: 'badge-green' },
};

export default function UserRequests() {
  const { lang } = useSettingsStore();
  const t = (pt: string, en: string) => lang === 'en' ? en : pt;
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: '', type: 'movie', year: '', notes: '' });
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['user-requests'],
    queryFn: () => userApi.requests().then(r => r.data.data),
  });

  const submitMutation = useMutation({
    mutationFn: () => api.post('/request', form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-requests'] });
      setForm({ title: '', type: 'movie', year: '', notes: '' });
      setShowForm(false);
      toast.success(t('Pedido enviado!', 'Request sent!'));
    },
    onError: (e: any) => toast.error(e.response?.data?.error || t('Erro ao enviar pedido.', 'Error sending request.')),
  });

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="page-title">
          <i className="fa-solid fa-hand text-primary mr-3" />{t('Meus Pedidos', 'My Requests')}
        </h1>
        {(data?.length || 0) < 5 && (
          <button onClick={() => setShowForm(v => !v)} className="btn-primary text-sm">
            <i className="fa-solid fa-plus" /> {t('Novo Pedido', 'New Request')}
          </button>
        )}
      </div>

      {showForm && (
        <div className="card p-5 mb-6">
          <h3 className="font-semibold text-white mb-4">{t('Pedir Conteúdo', 'Request Content')}</h3>
          <div className="space-y-3">
            <div>
              <label className="label">{t('Título do Filme/Série *', 'Movie/Series Title *')}</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="input" placeholder={t('Ex: Vingadores: Endgame', 'Ex: Avengers: Endgame')} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">{t('Tipo', 'Type')}</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="input text-sm">
                  <option value="movie">{t('Filme', 'Movie')}</option>
                  <option value="series">{t('Série', 'Series')}</option>
                  <option value="animation">{t('Animação', 'Animation')}</option>
                  <option value="documentary">{t('Documentário', 'Documentary')}</option>
                </select>
              </div>
              <div>
                <label className="label">{t('Ano (opcional)', 'Year (optional)')}</label>
                <input type="number" min="1900" max="2030" value={form.year}
                  onChange={e => setForm(f => ({ ...f, year: e.target.value }))} className="input" placeholder="2024" />
              </div>
            </div>
            <div>
              <label className="label">{t('Informações adicionais', 'Additional info')}</label>
              <textarea rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="input resize-none text-sm"
                placeholder={t('Links, plataformas onde está disponível...', 'Links, platforms where available...')} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => submitMutation.mutate()} disabled={!form.title || submitMutation.isPending} className="btn-primary">
                {submitMutation.isPending ? <i className="fa-solid fa-circle-notch animate-spin" /> : <i className="fa-solid fa-paper-plane" />}
                {t('Enviar', 'Send')}
              </button>
              <button onClick={() => setShowForm(false)} className="btn-ghost">{t('Cancelar', 'Cancel')}</button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}</div>
      ) : data?.length ? (
        <div className="space-y-3">
          {data.map((r: any) => {
            const s = STATUS_MAP[r.status] || STATUS_MAP.pending;
            return (
              <div key={r.id} className="card p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-white">{r.title}</p>
                      <span className={`badge text-xs ${s.badge}`}>{lang === 'en' ? s.label_en : s.label_pt}</span>
                    </div>
                    <p className="text-xs text-text-muted mt-1">
                      {t(`${r.type}`, r.type)} {r.year ? `· ${r.year}` : ''} · {formatDate(r.created_at, lang)}
                    </p>
                    {r.notes && <p className="text-sm text-text-secondary mt-2 italic">"{r.notes}"</p>}
                    {r.admin_notes && (
                      <div className="mt-2 p-2 bg-info/10 border border-info/20 rounded text-xs text-info">
                        <i className="fa-solid fa-circle-info mr-1" />
                        {t('Admin: ', 'Admin: ')}{r.admin_notes}
                      </div>
                    )}
                  </div>
                  {r.votes > 0 && (
                    <div className="flex flex-col items-center shrink-0">
                      <i className="fa-solid fa-thumbs-up text-success text-sm" />
                      <span className="text-xs text-success">{r.votes}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-text-muted">
          <i className="fa-solid fa-hand text-4xl mb-3" />
          <p>{t('Ainda não fez nenhum pedido.', 'No requests yet.')}</p>
          <button onClick={() => setShowForm(true)} className="btn-primary mt-4 text-sm">
            <i className="fa-solid fa-plus" /> {t('Fazer Pedido', 'Make Request')}
          </button>
        </div>
      )}
    </div>
  );
}
