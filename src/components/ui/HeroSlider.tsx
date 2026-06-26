import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Content } from '@/types';
import { imgUrl } from '@/utils/helpers';
import { useLang } from '@/hooks/useLang';

interface Props { items: Content[] }

export default function HeroSlider({ items }: Props) {
  const [current, setCurrent] = useState(0);
  const { title, desc } = useLang();

  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c + 1) % items.length), 7000);
    return () => clearInterval(t);
  }, [items.length]);

  if (!items.length) return null;
  const item = items[current];

  return (
    <div className="relative w-full h-[55vh] md:h-[70vh] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div key={item.id} className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
        >
          <img src={imgUrl(item.banner_url || item.poster_url)} alt={item.title_pt}
            className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-12 left-4 md:left-12 max-w-xl z-10">
        <motion.div key={`info-${item.id}`}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="badge-red">{item.type}</span>
            {item.release_year && <span className="text-sm text-text-muted">{item.release_year}</span>}
            {item.avg_rating > 0 && (
              <span className="flex items-center gap-1 text-sm text-yellow-400">
                <i className="fa-solid fa-star text-xs" /> {item.avg_rating.toFixed(1)}
              </span>
            )}
          </div>
          <h1 className="font-display text-3xl md:text-5xl text-white tracking-wide mb-3">{title(item)}</h1>
          <p className="text-text-secondary text-sm md:text-base line-clamp-3 mb-5">{desc(item)}</p>
          <div className="flex items-center gap-3">
            <Link to={`/content/${item.slug}`} className="btn-primary">
              <i className="fa-solid fa-play" /> Assistir
            </Link>
            <Link to={`/content/${item.slug}`} className="btn-ghost">
              <i className="fa-solid fa-circle-info" /> Detalhes
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {items.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`h-1 rounded-full transition-all ${i === current ? 'w-6 bg-primary' : 'w-1.5 bg-white/30'}`} />
        ))}
      </div>
    </div>
  );
}
