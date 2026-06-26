import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/api/user';
import ContentCard from '@/components/ui/ContentCard';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { useSettingsStore } from '@/store/settingsStore';

export default function WatchLater() {
  const { lang } = useSettingsStore();
  const { data, isLoading } = useQuery({ queryKey: ['watch-later'], queryFn: () => userApi.watchLater().then(r => r.data.data) });
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <h1 className="page-title mb-8">
        <i className="fa-solid fa-bookmark text-primary mr-3" />{lang === 'pt' ? 'Ver mais tarde' : 'Watch Later'}
      </h1>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
        {isLoading ? Array.from({length:12}).map((_,i)=><CardSkeleton key={i}/>) : data?.map((item: any, i: number) => <ContentCard key={item.id} content={item} index={i}/>)}
      </div>
      {!isLoading && !data?.length && (
        <div className="text-center py-16 text-text-muted">
          <i className="fa-solid fa-bookmark text-4xl mb-3" />
          <p>{lang === 'pt' ? 'Lista vazia.' : 'List is empty.'}</p>
        </div>
      )}
    </div>
  );
}
