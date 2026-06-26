import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { userApi } from '@/api/user';
import { useSettingsStore } from '@/store/settingsStore';
import { imgUrl, numberFormat } from '@/utils/helpers';
import api from '@/api/client';

const statCards = [
  { key: 'watched',   icon: 'fa-eye',              color: 'text-blue-400',   pt: 'Assistidos',   en: 'Watched' },
  { key: 'favorites', icon: 'fa-heart',             color: 'text-red-400',    pt: 'Favoritos',    en: 'Favorites' },
  { key: 'reviews',   icon: 'fa-star',              color: 'text-yellow-400', pt: 'Avaliações',   en: 'Reviews' },
  { key: 'requests',  icon: 'fa-hand',              color: 'text-green-400',  pt: 'Pedidos',      en: 'Requests' },
  { key: 'follows',   icon: 'fa-rss',               color: 'text-purple-400', pt: 'A seguir',     en: 'Following' },
  { key: 'comments',  icon: 'fa-comment',           color: 'text-pink-400',   pt: 'Comentários',  en: 'Comments' },
];

const quickLinks = [
  ['/user/favorites',     'fa-heart',              'Favoritos',        'Favorites'],
  ['/user/history',       'fa-clock-rotate-left',  'Histórico',        'History'],
  ['/user/watch-later',   'fa-bookmark',           'Ver mais tarde',   'Watch Later'],
  ['/user/follows',       'fa-rss',                'A seguir',         'Following'],
  ['/user/reminders',     'fa-bell',               'Lembretes',        'Reminders'],
  ['/user/requests',      'fa-hand',               'Pedidos',          'Requests'],
  ['/user/notifications', 'fa-envelope',           'Notificações',     'Notifications'],
  ['/user/achievements',  'fa-trophy',             'Conquistas',       'Achievements'],
  ['/user/stats',         'fa-chart-bar',          'Estatísticas',     'Statistics'],
  ['/user/profiles',      'fa-users',              'Perfis',           'Profiles'],
  ['/user/profile',       'fa-user-pen',           'Editar perfil',    'Edit profile'],
  ['/user/settings',      'fa-gear',               'Definições',       'Settings'],
];

export default function Dashboard() {
  const { user } = useAuthStore();
  const { lang } = useSettingsStore();
  const t = (pt: string, en: string) => lang === 'en' ? en : pt;

  const { data: statsData } = useQuery({
    queryKey: ['user-stats'],
    queryFn: () => userApi.stats().then(r => r.data.data),
  });
  const { data: history } = useQuery({
    queryKey: ['user-history'],
    queryFn: () => userApi.history().then(r => r.data.data),
  });
  const { data: notifs } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => userApi.notifications().then(r => r.data.data),
  });

  const unread = notifs?.filter((n: any) => !n.read).length || 0;

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
      {/* Profile header */}
      <div className="card p-6 mb-6 flex items-center gap-4">
        <img src={imgUrl(user?.avatar, '/avatar.svg')} alt={user?.name}
          className="w-16 h-16 rounded-full object-cover border-2 border-primary/50 shrink-0" />
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-white truncate">{user?.name}</h1>
          <p className="text-sm text-text-muted truncate">{user?.email}</p>
          {user?.role === 'admin' && (
            <Link to="/admin" className="badge-red text-xs mt-1">
              <i className="fa-solid fa-shield-halved mr-1" />Admin
            </Link>
          )}
        </div>
        <Link to="/user/profiles" className="btn-ghost text-sm shrink-0">
          <i className="fa-solid fa-users" /> {t('Perfis', 'Profiles')}
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-8">
        {statCards.map(s => (
          <div key={s.key} className="card p-3 text-center">
            <i className={`fa-solid ${s.icon} text-lg mb-1 ${s.color}`} />
            <p className="text-xl font-bold text-white">{numberFormat(statsData?.[s.key] ?? 0)}</p>
            <p className="text-[10px] text-text-muted mt-0.5">{lang === 'en' ? s.en : s.pt}</p>
          </div>
        ))}
      </div>

      {/* Notification badge */}
      {unread > 0 && (
        <Link to="/user/notifications"
          className="card border-primary/30 bg-primary/5 p-4 mb-6 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
            <i className="fa-solid fa-bell text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">
              {unread} {t('notificação(ões) não lida(s)', 'unread notification(s)')}
            </p>
          </div>
          <i className="fa-solid fa-chevron-right text-text-muted text-xs" />
        </Link>
      )}

      {/* Quick links grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {quickLinks.map(([to, icon, pt, en]) => (
          <Link key={to} to={to} className="card-hover flex items-center gap-3 p-3.5">
            <i className={`fa-solid ${icon} text-primary w-4 text-center`} />
            <span className="text-sm font-medium text-white">{t(pt, en)}</span>
            <i className="fa-solid fa-chevron-right text-text-muted text-xs ml-auto" />
          </Link>
        ))}
      </div>

      {/* Recent history */}
      {history?.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">
              <i className="fa-solid fa-clock-rotate-left text-primary" />
              {t('Vistos recentemente', 'Recently watched')}
            </h2>
            <Link to="/user/history" className="text-xs text-primary hover:underline">
              {t('Ver tudo', 'See all')}
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
            {history.slice(0, 12).map((item: any) => (
              <Link key={item.id} to={`/content/${item.slug}`} className="shrink-0 w-28 group">
                <div className="relative overflow-hidden rounded-lg">
                  <img src={imgUrl(item.poster_url)} alt={item.title_pt}
                    className="w-full aspect-[2/3] object-cover transition-transform duration-300 group-hover:scale-105" />
                  {item.progress_sec > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-surface-border">
                      <div className="h-1 bg-primary" style={{ width: `${Math.min(100, (item.progress_sec / (90 * 60)) * 100)}%` }} />
                    </div>
                  )}
                </div>
                <p className="text-xs text-text-muted mt-1 line-clamp-1">{item.title_pt}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
