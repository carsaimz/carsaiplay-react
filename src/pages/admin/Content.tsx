import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { imgUrl, typeLabel, formatDate } from '@/utils/helpers';

export default function AdminContent() {
  const [filters, setFilters] = useState({ s: '', type: '', status: '', page: 1 });
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-content', filters],
    queryFn: () => api.get('/admin/content', { params: filters }).then(r => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/content/${id}/delete`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-content'] }),
  });

  const bulkMutation = useMutation({
    mutationFn: ({ ids, action }: any) => api.post('/admin/bulk', { ids, action, resource: 'content' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-content'] }); setSelected([]); },
  });

  const [selected, setSelected] = useState<number[]>([]);
  const toggle = (id: number) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll = () => setSelected(selected.length === data?.data?.length ? [] : data?.data?.map((i: any) => i.id) || []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title"><i className="fa-solid fa-film text-primary mr-3" />Gerir Conteúdo</h1>
        <Link to="/admin/content/new" className="btn-primary"><i className="fa-solid fa-plus" /> Adicionar</Link>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 flex flex-wrap gap-3">
        <input value={filters.s} onChange={e => setFilters(f => ({ ...f, s: e.target.value, page: 1 }))}
          placeholder="Pesquisar..." className="input flex-1 min-w-40 py-2 text-sm" />
        <select value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value, page: 1 }))} className="input w-auto py-2 text-sm">
          <option value="">Todos os tipos</option>
          {[['movie','Filme'],['series','Série'],['animation','Animação'],['documentary','Documentário']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))} className="input w-auto py-2 text-sm">
          <option value="">Todos os estados</option>
          <option value="published">Publicado</option>
          <option value="draft">Rascunho</option>
        </select>
      </div>

      {/* Bulk actions */}
      {selected.length > 0 && (
        <div className="card p-3 mb-4 flex items-center gap-3 border-primary/30 bg-primary/5">
          <span className="text-sm text-text-secondary">{selected.length} seleccionado(s)</span>
          <button onClick={() => bulkMutation.mutate({ ids: selected, action: 'publish' })} className="btn-primary text-xs py-1.5">
            <i className="fa-solid fa-globe" /> Publicar
          </button>
          <button onClick={() => bulkMutation.mutate({ ids: selected, action: 'archive' })} className="btn-ghost text-xs py-1.5">
            <i className="fa-solid fa-box-archive" /> Arquivar
          </button>
          <button onClick={() => { if (confirm(`Eliminar ${selected.length} item(s)?`)) bulkMutation.mutate({ ids: selected, action: 'delete' }); }}
            className="btn-ghost text-xs py-1.5 text-red-400 border-red-900/40">
            <i className="fa-solid fa-trash" /> Eliminar
          </button>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-surface-border">
              <tr>
                <th className="p-3 text-left w-8">
                  <input type="checkbox" onChange={toggleAll} checked={selected.length === data?.data?.length && data?.data?.length > 0} className="accent-primary" />
                </th>
                <th className="p-3 text-left text-text-muted font-medium">Conteúdo</th>
                <th className="p-3 text-left text-text-muted font-medium hidden md:table-cell">Tipo</th>
                <th className="p-3 text-left text-text-muted font-medium hidden md:table-cell">Views</th>
                <th className="p-3 text-left text-text-muted font-medium">Estado</th>
                <th className="p-3 text-left text-text-muted font-medium hidden md:table-cell">Data</th>
                <th className="p-3 text-right text-text-muted font-medium">Acções</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}><td colSpan={7} className="p-3"><div className="skeleton h-10 rounded" /></td></tr>
              )) : data?.data?.map((item: any) => (
                <tr key={item.id} className="border-b border-surface-border/50 hover:bg-surface-elevated/30 transition-colors">
                  <td className="p-3"><input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggle(item.id)} className="accent-primary" /></td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img src={imgUrl(item.poster_url)} alt={item.title_pt} className="w-8 h-11 object-cover rounded shrink-0" />
                      <div>
                        <p className="font-medium text-white text-sm">{item.title_pt}</p>
                        <p className="text-xs text-text-muted">{item.release_year}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 hidden md:table-cell"><span className="badge-gray text-xs">{typeLabel(item.type, 'pt')}</span></td>
                  <td className="p-3 hidden md:table-cell text-text-muted text-xs">{item.views?.toLocaleString()}</td>
                  <td className="p-3"><span className={`badge text-xs ${item.status === 'published' ? 'badge-green' : 'badge-gray'}`}>{item.status === 'published' ? 'Publicado' : 'Rascunho'}</span></td>
                  <td className="p-3 hidden md:table-cell text-text-muted text-xs">{formatDate(item.created_at)}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/content/${item.slug}`} target="_blank" className="btn-icon w-7 h-7 text-xs"><i className="fa-solid fa-eye" /></Link>
                      <Link to={`/admin/content/${item.id}/edit`} className="btn-icon w-7 h-7 text-xs"><i className="fa-solid fa-pen" /></Link>
                      <Link to={`/admin/content/${item.id}/episodes`} className="btn-icon w-7 h-7 text-xs text-info"><i className="fa-solid fa-list" /></Link>
                      <button onClick={() => { if (confirm('Eliminar?')) deleteMutation.mutate(item.id); }} className="btn-icon w-7 h-7 text-xs text-red-400">
                        <i className="fa-solid fa-trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data?.meta && data.meta.last_page > 1 && (
          <div className="p-4 border-t border-surface-border flex items-center justify-between">
            <p className="text-xs text-text-muted">{data.meta.total} resultados</p>
            <div className="flex gap-2">
              <button disabled={filters.page === 1} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))} className="btn-ghost py-1 px-2 text-xs"><i className="fa-solid fa-chevron-left" /></button>
              <span className="text-sm text-text-muted px-2">{filters.page} / {data.meta.last_page}</span>
              <button disabled={filters.page === data.meta.last_page} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))} className="btn-ghost py-1 px-2 text-xs"><i className="fa-solid fa-chevron-right" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
