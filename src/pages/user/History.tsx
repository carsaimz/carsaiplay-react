import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/api/user';
import ContentCard from '@/components/ui/ContentCard';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { useSettingsStore } from '@/store/settingsStore';

export default function History() {
  const { lang } = useSettingsStore();
  const { data, isLoading } = useQuery({ queryKey: ['user-history'], queryFn: () => userApi.history().then(r => r.data.data) });
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <h1 className="page-title mb-8">
        <i className="fa-solid fa-clock-rotate-left text-primary mr-3" />{lang === 'pt' ? 'Histórico' : 'History'}
      </h1>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
        {isLoading ? Array.from({length:12}).map((_,i)=><CardSkeleton key={i}/>) : data?.map((item: any, i: number) => <ContentCard key={item.id} content={item} index={i}/>)}
      </div>
      {!isLoading && !data?.length && (
        <div className="text-center py-16 text-text-muted">
          <i className="fa-solid fa-clock-rotate-left text-4xl mb-3" />
          <p>{lang === 'pt' ? 'Histórico vazio.' : 'No history yet.'}</p>
        </div>
      )}
    </div>
  );
}
