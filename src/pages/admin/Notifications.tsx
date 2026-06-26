import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { toast } from 'react-toastify';
import { formatDate } from '@/utils/helpers';

export default function AdminNotifications() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: '', body: '', type: 'info', link: '', recipients: 'all' });
  const { data } = useQuery({ queryKey: ['admin-notifications'], queryFn: () => api.get('/admin/notifications').then(r => r.data.data) });

  const sendMutation = useMutation({
    mutationFn: () => api.post('/admin/notifications/send', form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-notifications'] }); setForm({ title:'', body:'', type:'info', link:'', recipients:'all' }); toast.success('Notificação enviada!'); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.get(`/admin/notifications/${id}/delete`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-notifications'] }),
  });

  return (
    <div>
      <h1 className="page-title mb-6"><i className="fa-solid fa-bell text-primary mr-3" />Notificações</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold text-white mb-4">Enviar Notificação</h3>
          <div className="space-y-3">
            <div><label className="label">Título</label><input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} className="input" /></div>
            <div><label className="label">Mensagem</label><textarea rows={3} value={form.body} onChange={e=>setForm(f=>({...f,body:e.target.value}))} className="input resize-none" /></div>
            <div><label className="label">Link (opcional)</label><input value={form.link} onChange={e=>setForm(f=>({...f,link:e.target.value}))} className="input" placeholder="https://..." /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Tipo</label>
                <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} className="input text-sm">
                  <option value="info">Informação</option><option value="success">Sucesso</option><option value="warning">Aviso</option><option value="error">Erro</option>
                </select>
              </div>
              <div><label className="label">Destinatários</label>
                <select value={form.recipients} onChange={e=>setForm(f=>({...f,recipients:e.target.value}))} className="input text-sm">
                  <option value="all">Todos os utilizadores</option>
                </select>
              </div>
            </div>
            <button onClick={() => sendMutation.mutate()} disabled={!form.title || !form.body || sendMutation.isPending} className="btn-primary w-full">
              <i className="fa-solid fa-paper-plane" /> Enviar
            </button>
          </div>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold text-white mb-4">Enviadas</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-hide">
            {data?.map((n: any) => (
              <div key={n.id} className="flex items-start gap-3 py-2 border-b border-surface-border last:border-0">
                <div className="flex-1"><p className="text-sm font-medium text-white">{n.title}</p><p className="text-xs text-text-muted">{formatDate(n.created_at)} · {n.reads || 0} lidos</p></div>
                <button onClick={() => deleteMutation.mutate(n.id)} className="btn-icon w-7 h-7 text-xs text-red-400"><i className="fa-solid fa-trash" /></button>
              </div>
            ))}
            {!data?.length && <p className="text-sm text-text-muted text-center py-8">Nenhuma notificação enviada.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
