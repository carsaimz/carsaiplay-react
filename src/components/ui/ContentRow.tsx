import { useRef } from 'react';
import ContentCard from './ContentCard';
import { CardSkeleton } from './Skeleton';
import type { Content } from '@/types';

interface Props {
  title: string;
  icon?: string;
  items?: Content[];
  isLoading?: boolean;
  viewAllTo?: string;
}

export default function ContentRow({ title, icon = 'fa-film', items = [], isLoading, viewAllTo }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: 'l' | 'r') => {
    scrollRef.current?.scrollBy({ left: dir === 'r' ? 280 : -280, behavior: 'smooth' });
  };

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4 px-4 md:px-0">
        <h2 className="section-title">
          <i className={`fa-solid ${icon} text-primary`} />
          {title}
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={() => scroll('l')} className="btn-icon w-8 h-8 text-xs hidden md:flex">
            <i className="fa-solid fa-chevron-left" />
          </button>
          <button onClick={() => scroll('r')} className="btn-icon w-8 h-8 text-xs hidden md:flex">
            <i className="fa-solid fa-chevron-right" />
          </button>
          {viewAllTo && (
            <a href={viewAllTo} className="text-xs text-primary hover:underline ml-1">
              Ver tudo <i className="fa-solid fa-arrow-right ml-0.5" />
            </a>
          )}
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide px-4 md:px-0 pb-2">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="shrink-0 w-36 md:w-44"><CardSkeleton /></div>
            ))
          : items.map((item, i) => (
              <div key={item.id} className="shrink-0 w-36 md:w-44">
                <ContentCard content={item} index={i} />
              </div>
            ))
        }
      </div>
    </section>
  );
}
