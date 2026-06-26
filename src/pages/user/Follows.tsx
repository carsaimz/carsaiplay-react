import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '@/api/client';
import { useSettingsStore } from '@/store/settingsStore';
import { imgUrl } from '@/utils/helpers';
import { toast } from 'react-toastify';

export default function Follows() {
  const { lang } = useSettingsStore();
  const t = (pt: string, en: string) => lang === 'en' ? en : pt;
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['follows'], queryFn: () => api.get('/user/follows').then(r => r.data.data) });

  const unfollow = useMutation({
    mutationFn: (content_id: number) => api.post('/follow', { content_id }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['follows'] }); toast.success(t('Deixou de seguir.', 'Unfollowed.')); },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
      <h1 className="page-title mb-8">
        <i className="fa-solid fa-rss text-primary mr-3" />{t('A Seguir', 'Following')}
      </h1>
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
      ) : data?.length ? (
        <div className="space-y-3">
          {data.map((item: any) => (
            <div key={item.id} className="card flex items-center gap-4 p-4">
              <img src={imgUrl(item.poster_url)} alt={item.title_pt} className="w-12 h-16 object-cover rounded shrink-0" />
              <div className="flex-1 min-w-0">
                <Link to={`/content/${item.slug}`} className="font-medium text-white hover:text-primary transition-colors line-clamp-1">
                  {lang === 'en' && item.title_en ? item.title_en : item.title_pt}
                </Link>
                <p className="text-xs text-text-muted mt-0.5">{item.type} · {item.release_year}</p>
              </div>
              <button onClick={() => unfollow.mutate(item.id)} className="btn-ghost text-xs gap-1 text-red-400 border-red-900/40">
                <i className="fa-solid fa-rss-square" /> {t('Deixar de seguir', 'Unfollow')}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-text-muted">
          <i className="fa-solid fa-rss text-4xl mb-3" />
          <p>{t('Não está a seguir nenhuma série.', 'Not following any series.')}</p>
        </div>
      )}
    </div>
  );
}
