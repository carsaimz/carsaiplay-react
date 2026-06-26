import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { formatDate } from '@/utils/helpers';
import { toast } from 'react-toastify';

export default function AdminComments() {
  const [filters, setFilters] = useState({ status: '', page: 1 });
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-comments', filters],
    queryFn: () => api.get('/admin/comments', { params: filters }).then(r => r.data),
  });

  const action = useMutation({
    mutationFn: ({ id, act }: any) => api.post(`/admin/comments/${id}/${act}`),
    onSuccess: (_, { act }) => { qc.invalidateQueries({ queryKey: ['admin-comments'] }); toast.success(act === 'approve' ? 'Comentário aprovado!' : 'Comentário eliminado.'); },
  });

  return (
    <div>
      <h1 className="page-title mb-6"><i className="fa-solid fa-comments text-primary mr-3" />Moderação de Comentários</h1>
      <div className="card p-3 mb-6 flex gap-3">
        {[['','Todos'],['pending','Pendentes'],['approved','Aprovados']].map(([v,l]) => (
          <button key={v} onClick={() => setFilters(f => ({ ...f, status: v, page: 1 }))}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${filters.status === v ? 'bg-primary text-white' : 'text-text-secondary hover:text-white'}`}>{l}</button>
        ))}
      </div>
      <div className="space-y-3">
        {isLoading ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />) :
          data?.data?.map((c: any) => (
            <div key={c.id} className={`card p-4 ${!c.approved ? 'border-warning/30 bg-warning/5' : ''}`}>
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-white">{c.username}</span>
                    <span className="text-xs text-text-muted">em <a href={`/content/${c.slug}`} className="text-primary hover:underline">{c.content_title}</a></span>
                    <span className="text-xs text-text-muted">· {formatDate(c.created_at)}</span>
                    {!c.approved && <span className="badge-yellow text-xs">Pendente</span>}
                  </div>
                  <p className="text-sm text-text-secondary">{c.body}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                    <span><i className="fa-solid fa-thumbs-up mr-1" />{c.likes}</span>
                    <span><i className="fa-solid fa-thumbs-down mr-1" />{c.dislikes}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {!c.approved && (
                    <button onClick={() => action.mutate({ id: c.id, act: 'approve' })} className="btn-ghost text-xs text-success border-success/30">
                      <i className="fa-solid fa-check" /> Aprovar
                    </button>
                  )}
                  <button onClick={() => { if (confirm('Eliminar comentário?')) action.mutate({ id: c.id, act: 'delete' }); }}
                    className="btn-ghost text-xs text-red-400 border-red-900/40">
                    <i className="fa-solid fa-trash" />
                  </button>
                </div>
              </div>
            </div>
          ))
        }
        {!isLoading && !data?.data?.length && (
          <div className="text-center py-16 text-text-muted">
            <i className="fa-solid fa-comments text-4xl mb-3" />
            <p>Sem comentários {filters.status === 'pending' ? 'pendentes' : ''}.</p>
          </div>
        )}
      </div>
    </div>
  );
}
