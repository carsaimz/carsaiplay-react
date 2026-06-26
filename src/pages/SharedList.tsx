import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/client';
import ContentCard from '@/components/ui/ContentCard';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { useSettingsStore } from '@/store/settingsStore';

export default function SharedList() {
  const { token } = useParams<{ token: string }>();
  const { lang } = useSettingsStore();
  const t = (pt: string, en: string) => lang === 'en' ? en : pt;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['shared-list', token],
    queryFn: () => api.get(`/shared-list/${token}`).then(r => r.data.data),
    enabled: !!token,
  });

  if (isError) return (
    <div className="text-center py-24 text-text-muted">
      <i className="fa-solid fa-link-slash text-4xl mb-4" />
      <p>{t('Lista não encontrada ou expirada.', 'List not found or expired.')}</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <div className="mb-8">
        <h1 className="page-title">
          <i className="fa-solid fa-list-ul text-primary mr-3" />
          {data?.owner_name ? `${t('Lista de', 'List by')} ${data.owner_name}` : t('Lista Partilhada', 'Shared List')}
        </h1>
        {data?.items?.length && (
          <p className="text-text-muted text-sm mt-1">{data.items.length} {t('títulos', 'titles')}</p>
        )}
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
        {isLoading
          ? Array.from({ length: 12 }).map((_, i) => <CardSkeleton key={i} />)
          : data?.items?.map((item: any, i: number) => <ContentCard key={item.id} content={item} index={i} />)
        }
      </div>
      {!isLoading && !data?.items?.length && (
        <div className="text-center py-16 text-text-muted">
          <p>{t('Lista vazia.', 'Empty list.')}</p>
        </div>
      )}
    </div>
  );
}
