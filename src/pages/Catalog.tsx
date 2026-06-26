import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useContent } from '@/hooks/useContent';
import ContentCard from '@/components/ui/ContentCard';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { useSettingsStore } from '@/store/settingsStore';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/client';

export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const { lang } = useSettingsStore();
  const t = (pt: string, en: string) => lang === 'en' ? en : pt;

  const [filters, setFilters] = useState({
    type: params.get('type') || '',
    category: params.get('category') || '',
    sort: (params.get('sort') || 'recent') as 'recent' | 'popular' | 'rating' | 'title',
    page: 1,
  });

  const { data, isLoading } = useContent(filters);
  const { data: cats } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(r => r.data.data),
    staleTime: Infinity,
  });

  const set = (k: string, v: string) => setFilters(f => ({ ...f, [k]: v, page: 1 }));

  const types = [
    ['', t('Tudo', 'All')],
    ['movie', t('Filmes', 'Movies')],
    ['series', t('Séries', 'Series')],
    ['animation', t('Animações', 'Animations')],
    ['documentary', t('Documentários', 'Documentaries')],
  ];
  const sorts = [
    ['recent', t('Recentes', 'Recent')],
    ['popular', t('Populares', 'Popular')],
    ['rating', t('Mais bem avaliados', 'Top Rated')],
    ['title', t('A-Z', 'A-Z')],
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <h1 className="page-title mb-6">
        <i className="fa-solid fa-film text-primary mr-3" />
        {t('Catálogo', 'Catalog')}
      </h1>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <div className="flex gap-1 bg-surface-card border border-surface-border rounded-lg p-1">
          {types.map(([v, l]) => (
            <button key={v} onClick={() => set('type', v)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                filters.type === v ? 'bg-primary text-white' : 'text-text-secondary hover:text-white'
              }`}>{l}</button>
          ))}
        </div>
        <select value={filters.sort} onChange={e => set('sort', e.target.value)}
          className="input w-auto py-2 text-sm">
          {sorts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        {cats?.length && (
          <select value={filters.category} onChange={e => set('category', e.target.value)}
            className="input w-auto py-2 text-sm">
            <option value="">{t('Categoria', 'Category')}</option>
            {cats.map((c: any) => (
              <option key={c.slug} value={c.slug}>{lang === 'en' && c.name_en ? c.name_en : c.name_pt}</option>
            ))}
          </select>
        )}
      </div>
      {/* Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
        {isLoading
          ? Array.from({ length: 21 }).map((_, i) => <CardSkeleton key={i} />)
          : data?.data?.map((item, i) => <ContentCard key={item.id} content={item} index={i} />)
        }
      </div>
      {/* Pagination */}
      {data?.meta && data.meta.last_page > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          <button disabled={filters.page === 1} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))} className="btn-ghost">
            <i className="fa-solid fa-chevron-left" />
          </button>
          <span className="flex items-center px-4 text-sm text-text-secondary">
            {filters.page} / {data.meta.last_page}
          </span>
          <button disabled={filters.page === data.meta.last_page} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))} className="btn-ghost">
            <i className="fa-solid fa-chevron-right" />
          </button>
        </div>
      )}
    </div>
  );
}
