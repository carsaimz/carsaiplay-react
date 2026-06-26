import { useHome } from '@/hooks/useContent';
import HeroSlider from '@/components/ui/HeroSlider';
import ContentRow from '@/components/ui/ContentRow';
import RandomButton from '@/components/ui/RandomButton';
import { useSettingsStore } from '@/store/settingsStore';
import { Link } from 'react-router-dom';

export default function Home() {
  const { data, isLoading } = useHome();
  const { lang } = useSettingsStore();
  const t = (pt: string, en: string) => lang === 'en' ? en : pt;

  return (
    <div>
      {/* Hero */}
      {data?.featured?.length ? <HeroSlider items={data.featured} /> : null}

      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-8">
        {/* Quick filters bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {[
              ['/catalog',               t('Tudo', 'All'),           'fa-border-all'],
              ['/catalog?type=movie',    t('Filmes', 'Movies'),      'fa-film'],
              ['/catalog?type=series',   t('Séries', 'Series'),      'fa-tv'],
              ['/catalog?type=animation',t('Animes', 'Anime'),       'fa-wand-sparkles'],
              ['/schedule',              t('Cronograma', 'Schedule'),'fa-calendar'],
            ].map(([to, label, icon]) => (
              <Link key={to} to={to}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-text-secondary hover:text-white hover:bg-surface-elevated border border-surface-border transition-colors">
                <i className={`fa-solid ${icon} text-primary text-xs`} />
                {label}
              </Link>
            ))}
          </div>
          <RandomButton />
        </div>

        <ContentRow title={t('Em Alta', 'Trending')}       icon="fa-fire"          items={data?.trending}    isLoading={isLoading} viewAllTo="/catalog?sort=popular" />
        <ContentRow title={t('Recentes', 'Recent')}        icon="fa-clock"         items={data?.recent}      isLoading={isLoading} viewAllTo="/catalog?sort=recent" />
        <ContentRow title={t('Séries', 'Series')}          icon="fa-tv"            items={data?.series}      isLoading={isLoading} viewAllTo="/catalog?type=series" />
        <ContentRow title={t('Filmes', 'Movies')}          icon="fa-film"          items={data?.movies}      isLoading={isLoading} viewAllTo="/catalog?type=movie" />
        <ContentRow title={t('Animações / Anime', 'Anime')} icon="fa-wand-sparkles" items={data?.animations}  isLoading={isLoading} viewAllTo="/catalog?type=animation" />
      </div>
    </div>
  );
}
