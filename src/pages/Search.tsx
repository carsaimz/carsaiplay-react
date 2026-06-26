import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSearch } from '@/hooks/useContent';
import ContentCard from '@/components/ui/ContentCard';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { useSettingsStore } from '@/store/settingsStore';

export default function Search() {
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const { data, isLoading, isFetching } = useSearch(q);
  const { lang } = useSettingsStore();
  const t = (pt: string, en: string) => lang === 'en' ? en : pt;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <h1 className="page-title mb-6"><i className="fa-solid fa-magnifying-glass text-primary mr-3" />{t('Pesquisar', 'Search')}</h1>
      <div className="relative mb-8">
        <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
        <input value={q} onChange={e => setQ(e.target.value)}
          placeholder={t('Pesquisar filmes, séries, animes…', 'Search movies, series, anime…')}
          className="input pl-10 py-3 text-base" autoFocus />
      </div>
      {q.length >= 2 ? (
        <>
          {(data?.length || 0) > 0 && (
            <p className="text-sm text-text-muted mb-4">
              {data?.length} {t('resultados para', 'results for')} "<span className="text-white">{q}</span>"
            </p>
          )}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {(isLoading || isFetching)
              ? Array.from({ length: 12 }).map((_, i) => <CardSkeleton key={i} />)
              : data?.map((item, i) => <ContentCard key={item.id} content={item} index={i} />)
            }
          </div>
          {!isLoading && !data?.length && (
            <div className="text-center py-16 text-text-muted">
              <i className="fa-solid fa-face-sad-tear text-4xl mb-3" />
              <p>{t('Nenhum resultado encontrado.', 'No results found.')}</p>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 text-text-muted">
          <i className="fa-solid fa-magnifying-glass text-4xl mb-3" />
          <p>{t('Escreva para pesquisar…', 'Type to search…')}</p>
        </div>
      )}
    </div>
  );
}
