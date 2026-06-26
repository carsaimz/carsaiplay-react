import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Content } from '@/types';
import { imgUrl, ageRatingColor, typeLabel } from '@/utils/helpers';
import { useSettingsStore } from '@/store/settingsStore';
import { useLang } from '@/hooks/useLang';

interface Props {
  content: Content;
  index?: number;
}

export default function ContentCard({ content, index = 0 }: Props) {
  const { lang } = useSettingsStore();
  const { title } = useLang();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
    >
      <Link to={`/content/${content.slug}`} className="content-card block">
        <div className="relative rounded-lg overflow-hidden group">
          <img
            src={imgUrl(content.poster_url)}
            alt={content.title_pt}
            className="w-full aspect-[2/3] object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          {/* Rating */}
          {content.avg_rating > 0 && (
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur rounded px-1.5 py-0.5">
              <i className="fa-solid fa-star text-yellow-400 text-xs" />
              <span className="text-xs font-semibold text-white">{content.avg_rating.toFixed(1)}</span>
            </div>
          )}
          {/* Age rating */}
          <div className={`absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold ${ageRatingColor(content.age_rating)}`}>
            {content.age_rating}
          </div>
          {/* Overlay */}
          <div className="content-card-overlay">
            <p className="text-white font-semibold text-sm line-clamp-2">{title(content)}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="badge-gray text-[10px] px-1.5 py-0.5 rounded">
                {typeLabel(content.type, lang)}
              </span>
              {content.release_year && (
                <span className="text-[10px] text-text-muted">{content.release_year}</span>
              )}
            </div>
          </div>
        </div>
        <div className="mt-2 px-0.5">
          <p className="text-sm font-medium text-text-primary line-clamp-1">{title(content)}</p>
          <p className="text-xs text-text-muted mt-0.5">{content.release_year}</p>
        </div>
      </Link>
    </motion.div>
  );
}
