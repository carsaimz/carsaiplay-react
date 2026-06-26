import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { toast } from 'react-toastify';
import { formatDate } from '@/utils/helpers';

export default function AdminSchedule() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ content_id: '', episode_id: '', release_date: '', episode_number: '' });
  const { data, isLoading } = useQuery({ queryKey: ['admin-schedule'], queryFn: () => api.get('/admin/schedule').then(r => r.data.data) });
  const { data: contents } = useQuery({ queryKey: ['content-list-simple'], queryFn: () => api.get('/admin/content', { params: { per_page: 200 } }).then(r => r.data.data) });

  const saveMutation = useMutation({
    mutationFn: () => api.post('/admin/schedule/save', form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-schedule'] }); setForm({ content_id:'', episode_id:'', release_date:'', episode_number:'' }); toast.success('Guardado!'); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.post('/admin/schedule/delete', { id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-schedule'] }),
  });

  return (
    <div>
      <h1 className="page-title mb-6"><i className="fa-solid fa-calendar-days text-primary mr-3" />Cronograma</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold text-white mb-4">Adicionar Entrada</h3>
          <div className="space-y-3">
            <div>
              <label className="label">Conteúdo</label>
              <select value={form.content_id} onChange={e=>setForm(f=>({...f,content_id:e.target.value}))} className="input text-sm">
                <option value="">Seleccionar...</option>
                {contents?.map((c: any) => <option key={c.id} value={c.id}>{c.title_pt}</option>)}
              </select>
            </div>
            <div><label className="label">Nº Episódio (opcional)</label><input type="number" value={form.episode_number} onChange={e=>setForm(f=>({...f,episode_number:e.target.value}))} className="input" /></div>
            <div><label className="label">Data de Lançamento</label><input type="date" value={form.release_date} onChange={e=>setForm(f=>({...f,release_date:e.target.value}))} className="input" /></div>
            <button onClick={() => saveMutation.mutate()} disabled={!form.content_id || !form.release_date || saveMutation.isPending} className="btn-primary w-full">
              <i className="fa-solid fa-plus" /> Adicionar
            </button>
          </div>
        </div>
        <div className="md:col-span-2 card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-surface-border"><tr>
              {['Conteúdo','Ep.','Data','Ações'].map(h => <th key={h} className="p-3 text-left text-text-muted font-medium">{h}</th>)}
            </tr></thead>
            <tbody>
              {isLoading ? <tr><td colSpan={4} className="p-4"><div className="skeleton h-8 rounded" /></td></tr> :
                data?.map((s: any) => (
                  <tr key={s.id} className="border-b border-surface-border/50">
                    <td className="p-3 text-white">{s.title_pt}</td>
                    <td className="p-3 text-text-muted">{s.episode_number || '—'}</td>
                    <td className="p-3 text-text-muted">{formatDate(s.release_date)}</td>
                    <td className="p-3"><button onClick={() => deleteMutation.mutate(s.id)} className="btn-icon w-7 h-7 text-xs text-red-400"><i className="fa-solid fa-trash" /></button></td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
