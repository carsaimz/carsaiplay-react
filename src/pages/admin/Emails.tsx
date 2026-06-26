import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { toast } from 'react-toastify';
import { formatDate } from '@/utils/helpers';

const TABS = ['newsletter', 'queue', 'templates'] as const;
type Tab = typeof TABS[number];

export default function AdminEmails() {
  const [tab, setTab] = useState<Tab>('newsletter');
  const qc = useQueryClient();
  const [nl, setNl] = useState({ subject: '', body: '', recipients: 'all' });

  const queueQuery = useQuery({ queryKey: ['email-queue'], queryFn: () => api.get('/admin/emails/queue').then(r => r.data.data), enabled: tab === 'queue' });
  const tmplQuery  = useQuery({ queryKey: ['email-templates'], queryFn: () => api.get('/admin/emails/templates').then(r => r.data.data), enabled: tab === 'templates' });

  const sendNewsletter = useMutation({
    mutationFn: () => api.post('/admin/emails/newsletter/send', nl),
    onSuccess: () => { toast.success('Newsletter adicionada à fila!'); setNl({ subject:'', body:'', recipients:'all' }); },
  });

  const resend = useMutation({
    mutationFn: (id: number) => api.post('/admin/emails/queue/resend', { id }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['email-queue'] }); toast.success('Reenvio agendado!'); },
  });

  return (
    <div>
      <h1 className="page-title mb-6"><i className="fa-solid fa-envelope text-primary mr-3" />Emails</h1>
      <div className="flex gap-1 mb-6 bg-surface-card border border-surface-border rounded-xl p-1">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-primary text-white' : 'text-text-secondary hover:text-white'}`}>
            {t === 'newsletter' ? 'Newsletter' : t === 'queue' ? 'Fila' : 'Templates'}
          </button>
        ))}
      </div>

      {tab === 'newsletter' && (
        <div className="card p-6 space-y-4">
          <div><label className="label">Assunto</label><input value={nl.subject} onChange={e=>setNl(f=>({...f,subject:e.target.value}))} className="input" /></div>
          <div><label className="label">Corpo (HTML)</label><textarea rows={8} value={nl.body} onChange={e=>setNl(f=>({...f,body:e.target.value}))} className="input resize-none font-mono text-xs" /></div>
          <div><label className="label">Destinatários</label>
            <select value={nl.recipients} onChange={e=>setNl(f=>({...f,recipients:e.target.value}))} className="input w-auto">
              <option value="all">Todos os utilizadores activos</option>
              <option value="newsletter">Subscritores da newsletter</option>
            </select>
          </div>
          <button onClick={() => sendNewsletter.mutate()} disabled={!nl.subject || !nl.body || sendNewsletter.isPending} className="btn-primary">
            <i className="fa-solid fa-paper-plane" /> Enviar Newsletter
          </button>
        </div>
      )}

      {tab === 'queue' && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-surface-border"><tr>
              {['Destinatário','Assunto','Estado','Data','Ações'].map(h => <th key={h} className="p-3 text-left text-text-muted font-medium">{h}</th>)}
            </tr></thead>
            <tbody>
              {queueQuery.data?.map((e: any) => (
                <tr key={e.id} className="border-b border-surface-border/50">
                  <td className="p-3 text-sm text-white">{e.to_email}</td>
                  <td className="p-3 text-sm text-text-secondary truncate max-w-xs">{e.subject}</td>
                  <td className="p-3"><span className={`badge text-xs ${e.sent_at ? 'badge-green' : e.last_error ? 'badge-red' : 'badge-yellow'}`}>{e.sent_at ? 'Enviado' : e.last_error ? 'Falhou' : 'Pendente'}</span></td>
                  <td className="p-3 text-xs text-text-muted">{formatDate(e.created_at)}</td>
                  <td className="p-3"><button onClick={() => resend.mutate(e.id)} className="btn-ghost text-xs py-1"><i className="fa-solid fa-redo" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!queueQuery.data?.length && <p className="text-center py-8 text-text-muted text-sm">Fila vazia.</p>}
        </div>
      )}

      {tab === 'templates' && (
        <div className="space-y-3">
          {tmplQuery.data?.map((t: any) => (
            <div key={t.id} className="card p-4">
              <p className="font-medium text-white">{t.template_key}</p>
              <p className="text-sm text-text-muted">{t.subject_pt}</p>
            </div>
          ))}
          {!tmplQuery.data?.length && <p className="text-center py-8 text-text-muted text-sm">Sem templates.</p>}
        </div>
      )}
    </div>
  );
}
