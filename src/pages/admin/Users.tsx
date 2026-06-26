import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { formatDate } from '@/utils/helpers';
import { toast } from 'react-toastify';

export default function AdminUsers() {
  const [filters, setFilters] = useState({ s:'', role:'', status:'', page:1 });
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', filters],
    queryFn: () => api.get('/admin/users', { params: filters }).then(r => r.data),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status, role }: any) => api.put('/admin/users', { id, status, role }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('Actualizado!'); },
  });

  const STATUS_COLORS: Record<string,string> = { active:'badge-green', banned:'badge-red', pending:'badge-yellow' };
  const ROLE_COLORS: Record<string,string> = { admin:'badge-red', user:'badge-gray' };

  return (
    <div>
      <h1 className="page-title mb-6"><i className="fa-solid fa-users text-primary mr-3" />Utilizadores</h1>
      <div className="card p-3 mb-4 flex flex-wrap gap-3">
        <input value={filters.s} onChange={e=>setFilters(f=>({...f,s:e.target.value,page:1}))} placeholder="Pesquisar nome ou email..." className="input flex-1 min-w-40 text-sm py-2" />
        <select value={filters.role} onChange={e=>setFilters(f=>({...f,role:e.target.value,page:1}))} className="input w-auto text-sm py-2">
          <option value="">Todos os papéis</option><option value="admin">Admin</option><option value="user">Utilizador</option>
        </select>
        <select value={filters.status} onChange={e=>setFilters(f=>({...f,status:e.target.value,page:1}))} className="input w-auto text-sm py-2">
          <option value="">Todos os estados</option><option value="active">Activo</option><option value="banned">Banido</option><option value="pending">Pendente</option>
        </select>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-surface-border"><tr>
            {['Utilizador','Papel','Estado','Registo','Ações'].map(h=><th key={h} className="p-3 text-left text-text-muted font-medium">{h}</th>)}
          </tr></thead>
          <tbody>
            {isLoading ? Array.from({length:8}).map((_,i)=><tr key={i}><td colSpan={5} className="p-3"><div className="skeleton h-10 rounded"/></td></tr>) :
              data?.data?.map((u: any) => (
                <tr key={u.id} className="border-b border-surface-border/50 hover:bg-surface-elevated/20">
                  <td className="p-3">
                    <p className="font-medium text-white">{u.name}</p>
                    <p className="text-xs text-text-muted">{u.email}</p>
                  </td>
                  <td className="p-3"><span className={`badge text-xs ${ROLE_COLORS[u.role]||'badge-gray'}`}>{u.role}</span></td>
                  <td className="p-3"><span className={`badge text-xs ${STATUS_COLORS[u.status]||'badge-gray'}`}>{u.status}</span></td>
                  <td className="p-3 text-xs text-text-muted">{formatDate(u.created_at)}</td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      {u.status === 'active'
                        ? <button onClick={()=>updateMutation.mutate({id:u.id,status:'banned',role:u.role})} className="btn-ghost text-xs py-1 text-red-400 border-red-900/40"><i className="fa-solid fa-ban mr-1"/>Banir</button>
                        : <button onClick={()=>updateMutation.mutate({id:u.id,status:'active',role:u.role})} className="btn-ghost text-xs py-1 text-success border-success/30"><i className="fa-solid fa-check mr-1"/>Activar</button>
                      }
                      {u.role !== 'admin'
                        ? <button onClick={()=>updateMutation.mutate({id:u.id,status:u.status,role:'admin'})} className="btn-ghost text-xs py-1 text-warning border-warning/30"><i className="fa-solid fa-shield-halved mr-1"/>Admin</button>
                        : <button onClick={()=>updateMutation.mutate({id:u.id,status:u.status,role:'user'})} className="btn-ghost text-xs py-1"><i className="fa-solid fa-user mr-1"/>User</button>
                      }
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
        {data?.meta?.last_page > 1 && (
          <div className="p-4 border-t border-surface-border flex items-center justify-between">
            <p className="text-xs text-text-muted">{data.meta.total} utilizadores</p>
            <div className="flex gap-2">
              <button disabled={filters.page===1} onClick={()=>setFilters(f=>({...f,page:f.page-1}))} className="btn-ghost py-1 px-2 text-xs"><i className="fa-solid fa-chevron-left"/></button>
              <span className="text-sm text-text-muted px-2">{filters.page}/{data.meta.last_page}</span>
              <button disabled={filters.page===data.meta.last_page} onClick={()=>setFilters(f=>({...f,page:f.page+1}))} className="btn-ghost py-1 px-2 text-xs"><i className="fa-solid fa-chevron-right"/></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
