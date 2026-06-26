import { useQuery } from '@tanstack/react-query';
import api from '@/api/client';
import { useSettingsStore } from '@/store/settingsStore';
import { imgUrl, formatDate } from '@/utils/helpers';
import { Link } from 'react-router-dom';

export default function Schedule() {
  const { lang } = useSettingsStore();
  const t = (pt: string, en: string) => lang === 'en' ? en : pt;
  const { data, isLoading } = useQuery({
    queryKey: ['schedule'],
    queryFn: () => api.get('/schedule').then(r => r.data.data),
  });

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
      <h1 className="page-title mb-8">
        <i className="fa-solid fa-calendar-days text-primary mr-3" />
        {t('Cronograma', 'Schedule')}
      </h1>
      {isLoading ? (
        <div className="space-y-3">{Array.from({length:6}).map((_,i)=><div key={i} className="skeleton h-20 rounded-xl"/>)}</div>
      ) : data?.length ? (
        <div className="space-y-3">
          {data.map((item: any) => (
            <Link key={item.id} to={`/content/${item.slug}`}
              className="card-hover flex items-center gap-4 p-4">
              <img src={imgUrl(item.poster_url)} alt={item.title_pt} className="w-12 h-16 object-cover rounded" />
              <div className="flex-1">
                <p className="font-semibold text-white">{lang === 'en' && item.title_en ? item.title_en : item.title_pt}</p>
                <p className="text-xs text-text-muted mt-0.5">{item.type}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-primary">{formatDate(item.release_date, lang)}</p>
                {item.episode_number && <p className="text-xs text-text-muted mt-0.5">{t(`Ep. ${item.episode_number}`, `Ep. ${item.episode_number}`)}</p>}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-text-muted">
          <i className="fa-solid fa-calendar-xmark text-4xl mb-3" />
          <p>{t('Sem lançamentos agendados.', 'No upcoming releases.')}</p>
        </div>
      )}
    </div>
  );
}
