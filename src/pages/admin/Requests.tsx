import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { formatDate } from '@/utils/helpers';
import { toast } from 'react-toastify';

const STATUS_COLORS: Record<string, string> = { pending:'badge-yellow', approved:'badge-green', rejected:'badge-red', reviewing:'badge-blue', added:'badge-green' };
const STATUS_LABELS: Record<string, string> = { pending:'Pendente', approved:'Aprovado', rejected:'Rejeitado', reviewing:'Em análise', added:'Adicionado' };

export default function AdminRequests() {
  const [filters, setFilters] = useState({ status: 'pending', page: 1 });
  const [notes, setNotes] = useState<Record<number, string>>({});
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-requests', filters],
    queryFn: () => api.get('/admin/requests', { params: filters }).then(r => r.data),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status, admin_notes }: any) => api.post('/admin/requests/update', { id, status, admin_notes }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-requests'] }); toast.success('Estado actualizado!'); },
  });

  return (
    <div>
      <h1 className="page-title mb-6"><i className="fa-solid fa-hand text-primary mr-3" />Pedidos de Conteúdo</h1>
      <div className="card p-3 mb-6 flex flex-wrap gap-2">
        {[['','Todos'],['pending','Pendentes'],['reviewing','Em análise'],['approved','Aprovados'],['rejected','Rejeitados']].map(([v,l]) => (
          <button key={v} onClick={() => setFilters(f => ({ ...f, status: v, page: 1 }))}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${filters.status === v ? 'bg-primary text-white' : 'text-text-secondary hover:text-white'}`}>{l}</button>
        ))}
      </div>
      <div className="space-y-3">
        {isLoading ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />) :
          data?.data?.map((r: any) => (
            <div key={r.id} className="card p-5">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-white">{r.title}</p>
                    <span className={`badge text-xs ${STATUS_COLORS[r.status] || 'badge-gray'}`}>{STATUS_LABELS[r.status] || r.status}</span>
                  </div>
                  <p className="text-xs text-text-muted">{r.type} · {r.year || 'Ano N/D'} · {r.username} · {formatDate(r.created_at)}</p>
                  {r.notes && <p className="text-sm text-text-secondary mt-2 italic">"{r.notes}"</p>}
                  <div className="mt-3">
                    <input value={notes[r.id] || r.admin_notes || ''} onChange={e => setNotes(n => ({ ...n, [r.id]: e.target.value }))}
                      placeholder="Notas do admin..." className="input text-sm py-1.5" />
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  {r.status !== 'approved' && (
                    <button onClick={() => updateMutation.mutate({ id: r.id, status: 'approved', admin_notes: notes[r.id] })}
                      className="btn-ghost text-xs text-success border-success/30 py-1.5"><i className="fa-solid fa-check" /> Aprovar</button>
                  )}
                  {r.status !== 'rejected' && (
                    <button onClick={() => updateMutation.mutate({ id: r.id, status: 'rejected', admin_notes: notes[r.id] })}
                      className="btn-ghost text-xs text-red-400 border-red-900/40 py-1.5"><i className="fa-solid fa-times" /> Rejeitar</button>
                  )}
                  {r.status === 'pending' && (
                    <button onClick={() => updateMutation.mutate({ id: r.id, status: 'reviewing', admin_notes: notes[r.id] })}
                      className="btn-ghost text-xs text-info border-info/30 py-1.5"><i className="fa-solid fa-search" /> Analisar</button>
                  )}
                </div>
              </div>
            </div>
          ))
        }
        {!isLoading && !data?.data?.length && (
          <div className="text-center py-16 text-text-muted">
            <i className="fa-solid fa-hand text-4xl mb-3" />
            <p>Sem pedidos {filters.status ? STATUS_LABELS[filters.status]?.toLowerCase() + 's' : ''}.</p>
          </div>
        )}
      </div>
    </div>
  );
}
