import { useQuery } from '@tanstack/react-query';
import api from '@/api/client';
import { numberFormat } from '@/utils/helpers';

export default function AdminReports() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: () => api.get('/admin/reports').then(r => r.data.data),
  });

  if (isLoading) return (
    <div>
      <h1 className="page-title mb-6"><i className="fa-solid fa-chart-bar text-primary mr-3" />Relatórios</h1>
      <div className="grid md:grid-cols-2 gap-6">{Array.from({length:4}).map((_,i)=><div key={i} className="skeleton h-48 rounded-xl"/>)}</div>
    </div>
  );

  return (
    <div>
      <h1 className="page-title mb-6"><i className="fa-solid fa-chart-bar text-primary mr-3" />Relatórios</h1>
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top content */}
        <div className="card p-5">
          <h3 className="section-title mb-4"><i className="fa-solid fa-fire text-primary" />Top 10 por Visualizações</h3>
          <div className="space-y-2">
            {data?.topContent?.map((c: any, i: number) => (
              <div key={c.id} className="flex items-center gap-3 py-1">
                <span className="text-lg font-bold text-text-muted w-6 shrink-0">#{i+1}</span>
                <p className="text-sm text-white flex-1 truncate">{c.title_pt}</p>
                <span className="text-xs text-primary font-semibold">{numberFormat(c.views)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Content by type */}
        <div className="card p-5">
          <h3 className="section-title mb-4"><i className="fa-solid fa-chart-pie text-primary" />Conteúdo por Tipo</h3>
          <div className="space-y-3">
            {data?.byType?.map((t: any) => (
              <div key={t.type} className="flex items-center gap-3">
                <span className="text-sm text-text-secondary w-24 shrink-0 capitalize">{t.type}</span>
                <div className="flex-1 bg-surface-elevated rounded-full h-3">
                  <div className="bg-primary h-3 rounded-full" style={{ width: `${t.pct}%` }} />
                </div>
                <span className="text-sm text-white w-10 text-right font-semibold">{t.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Rating distribution */}
        <div className="card p-5">
          <h3 className="section-title mb-4"><i className="fa-solid fa-star text-primary" />Distribuição de Avaliações</h3>
          <div className="space-y-2">
            {[5,4,3,2,1].map(star => {
              const r = data?.ratingDist?.find((x: any) => x.rating === star);
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-sm text-yellow-400 w-8 shrink-0">{star} <i className="fa-solid fa-star text-xs" /></span>
                  <div className="flex-1 bg-surface-elevated rounded-full h-2">
                    <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${r?.pct || 0}%` }} />
                  </div>
                  <span className="text-xs text-text-muted w-10 text-right">{r?.count || 0}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Registration trend */}
        <div className="card p-5">
          <h3 className="section-title mb-4"><i className="fa-solid fa-users text-primary" />Novos Registos (30 dias)</h3>
          <div className="space-y-1">
            {data?.regTrend?.slice(-14).map((d: any) => (
              <div key={d.date} className="flex items-center gap-3">
                <span className="text-xs text-text-muted w-20 shrink-0">{d.date}</span>
                <div className="flex-1 bg-surface-elevated rounded-full h-2">
                  <div className="bg-info h-2 rounded-full" style={{ width: `${d.pct || 0}%` }} />
                </div>
                <span className="text-xs text-text-muted w-6 text-right">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
