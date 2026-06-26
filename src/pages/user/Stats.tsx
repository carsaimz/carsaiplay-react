import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/api/user';
import { useSettingsStore } from '@/store/settingsStore';
import { numberFormat } from '@/utils/helpers';

export default function Stats() {
  const { lang } = useSettingsStore();
  const t = (pt: string, en: string) => lang === 'en' ? en : pt;
  const { data, isLoading } = useQuery({ queryKey: ['user-stats'], queryFn: () => userApi.stats().then(r => r.data.data) });

  const statCards = [
    { key: 'watched',   icon: 'fa-eye',              label: t('Assistidos', 'Watched'),         color: 'text-blue-400' },
    { key: 'favorites', icon: 'fa-heart',             label: t('Favoritos', 'Favorites'),        color: 'text-red-400' },
    { key: 'reviews',   icon: 'fa-star',              label: t('Avaliações', 'Reviews'),         color: 'text-yellow-400' },
    { key: 'requests',  icon: 'fa-hand',              label: t('Pedidos', 'Requests'),           color: 'text-green-400' },
    { key: 'follows',   icon: 'fa-rss',               label: t('A seguir', 'Following'),         color: 'text-purple-400' },
    { key: 'comments',  icon: 'fa-comment',           label: t('Comentários', 'Comments'),       color: 'text-pink-400' },
    { key: 'hours',     icon: 'fa-clock',             label: t('Horas assistidas', 'Hours watched'), color: 'text-orange-400' },
    { key: 'streak',    icon: 'fa-fire',              label: t('Streak (dias)', 'Streak (days)'), color: 'text-red-500' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
      <h1 className="page-title mb-8">
        <i className="fa-solid fa-chart-bar text-primary mr-3" />{t('As minhas Estatísticas', 'My Statistics')}
      </h1>
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map(s => (
            <div key={s.key} className="card p-5 text-center">
              <i className={`fa-solid ${s.icon} text-2xl mb-2 ${s.color}`} />
              <p className="text-2xl font-bold text-white">{numberFormat(data?.[s.key] ?? 0)}</p>
              <p className="text-xs text-text-muted mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {data?.genre_breakdown && (
        <div className="card p-5 mt-6">
          <h3 className="section-title mb-4">
            <i className="fa-solid fa-chart-pie text-primary" />{t('Géneros favoritos', 'Favorite genres')}
          </h3>
          <div className="space-y-2">
            {data.genre_breakdown.slice(0, 6).map((g: any) => (
              <div key={g.slug} className="flex items-center gap-3">
                <span className="text-sm text-text-secondary w-28 shrink-0">{lang === 'en' && g.name_en ? g.name_en : g.name_pt}</span>
                <div className="flex-1 bg-surface-elevated rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${g.pct}%` }} />
                </div>
                <span className="text-xs text-text-muted w-10 text-right">{g.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
