import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '@/api/client';
import { numberFormat, formatDate } from '@/utils/helpers';

const StatCard = ({ icon, label, value, color = 'text-primary', to }: any) => (
  <Link to={to || '#'} className="card-hover p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl bg-surface-elevated flex items-center justify-center shrink-0`}>
      <i className={`fa-solid ${icon} text-xl ${color}`} />
    </div>
    <div>
      <p className="text-2xl font-bold text-white">{numberFormat(value ?? 0)}</p>
      <p className="text-xs text-text-muted mt-0.5">{label}</p>
    </div>
  </Link>
);

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api.get('/admin/dashboard').then(r => r.data.data),
    refetchInterval: 30000,
  });

  return (
    <div>
      <h1 className="page-title mb-6"><i className="fa-solid fa-gauge-high text-primary mr-3" />Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {isLoading ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />) : (<>
          <StatCard icon="fa-film"       label="Conteúdos publicados"  value={data?.stats?.contents}  to="/admin/content" />
          <StatCard icon="fa-users"      label="Utilizadores activos"  value={data?.stats?.users}     to="/admin/users" color="text-blue-400" />
          <StatCard icon="fa-eye"        label="Visualizações totais"  value={data?.stats?.views}     color="text-green-400" />
          <StatCard icon="fa-hand"       label="Pedidos pendentes"     value={data?.stats?.requests}  to="/admin/requests" color="text-warning" />
          <StatCard icon="fa-comment"    label="Comentários pendentes" value={data?.stats?.comments}  to="/admin/comments" color="text-info" />
          <StatCard icon="fa-newspaper" label="Posts publicados"       value={data?.stats?.blog}      to="/admin/blog" color="text-purple-400" />
        </>)}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent content */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title text-base"><i className="fa-solid fa-film text-primary" />Conteúdo Recente</h3>
            <Link to="/admin/content/new" className="btn-primary py-1.5 px-3 text-xs">
              <i className="fa-solid fa-plus" /> Adicionar
            </Link>
          </div>
          <div className="space-y-2">
            {data?.recentContent?.map((item: any) => (
              <div key={item.id} className="flex items-center gap-3 py-2 border-b border-surface-border last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{item.title_pt}</p>
                  <p className="text-xs text-text-muted">{item.type} · {formatDate(item.created_at)}</p>
                </div>
                <span className={`badge text-xs ${item.status === 'published' ? 'badge-green' : 'badge-gray'}`}>{item.status}</span>
                <Link to={`/admin/content/${item.id}/edit`} className="btn-icon w-7 h-7 text-xs">
                  <i className="fa-solid fa-pen" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Recent users */}
        <div className="card p-5">
          <h3 className="section-title text-base mb-4"><i className="fa-solid fa-users text-primary" />Utilizadores Recentes</h3>
          <div className="space-y-2">
            {data?.recentUsers?.map((u: any) => (
              <div key={u.id} className="flex items-center gap-3 py-2 border-b border-surface-border last:border-0">
                <div className="w-7 h-7 rounded-full bg-surface-elevated flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-user text-xs text-text-muted" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{u.name}</p>
                  <p className="text-xs text-text-muted">{u.email}</p>
                </div>
                <span className={`badge text-xs ${u.role === 'admin' ? 'badge-red' : 'badge-gray'}`}>{u.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending requests */}
      {data?.pendingRequests?.length > 0 && (
        <div className="card p-5 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title text-base"><i className="fa-solid fa-hand text-warning" />Pedidos Pendentes</h3>
            <Link to="/admin/requests" className="text-xs text-primary hover:underline">Ver todos</Link>
          </div>
          <div className="space-y-2">
            {data.pendingRequests.map((r: any) => (
              <div key={r.id} className="flex items-center gap-3 py-2 border-b border-surface-border last:border-0">
                <div className="flex-1">
                  <p className="text-sm text-white">{r.title}</p>
                  <p className="text-xs text-text-muted">{r.username} · {r.type} · {formatDate(r.created_at)}</p>
                </div>
                <Link to="/admin/requests" className="btn-ghost text-xs">Gerir</Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
