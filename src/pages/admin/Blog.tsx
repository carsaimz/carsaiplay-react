import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { formatDate } from '@/utils/helpers';
import { toast } from 'react-toastify';

export default function AdminBlog() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin-blog'], queryFn: () => api.get('/admin/blog').then(r => r.data) });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.get(`/admin/blog/${id}/delete`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-blog'] }); toast.success('Eliminado.'); },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title"><i className="fa-solid fa-newspaper text-primary mr-3" />Blog</h1>
        <Link to="/admin/blog/new" className="btn-primary text-sm"><i className="fa-solid fa-plus" /> Novo Post</Link>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-surface-border"><tr>
            {['Título','Categoria','Estado','Data','Ações'].map(h=><th key={h} className="p-3 text-left text-text-muted font-medium">{h}</th>)}
          </tr></thead>
          <tbody>
            {isLoading ? <tr><td colSpan={5} className="p-3"><div className="skeleton h-10 rounded"/></td></tr> :
              data?.data?.map((p: any) => (
                <tr key={p.id} className="border-b border-surface-border/50 hover:bg-surface-elevated/20">
                  <td className="p-3"><p className="text-white font-medium">{p.title_pt}</p><p className="text-xs text-text-muted">{p.views} views</p></td>
                  <td className="p-3 text-text-muted text-xs">{p.category_name || '—'}</td>
                  <td className="p-3"><span className={`badge text-xs ${p.status==='published'?'badge-green':'badge-gray'}`}>{p.status}</span></td>
                  <td className="p-3 text-xs text-text-muted">{formatDate(p.published_at||p.created_at)}</td>
                  <td className="p-3"><div className="flex gap-1">
                    <Link to={`/admin/blog/${p.id}/edit`} className="btn-icon w-7 h-7 text-xs"><i className="fa-solid fa-pen"/></Link>
                    <Link to={`/blog/${p.slug}`} target="_blank" className="btn-icon w-7 h-7 text-xs"><i className="fa-solid fa-eye"/></Link>
                    <button onClick={()=>{if(confirm('Eliminar?'))deleteMutation.mutate(p.id);}} className="btn-icon w-7 h-7 text-xs text-red-400"><i className="fa-solid fa-trash"/></button>
                  </div></td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
