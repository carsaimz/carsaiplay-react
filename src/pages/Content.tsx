import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useContentDetail, useFavorite, useRate } from '@/hooks/useContent';
import { BannerSkeleton, TextSkeleton } from '@/components/ui/Skeleton';
import StarRating from '@/components/ui/StarRating';
import Comments from '@/components/ui/Comments';
import ReportButton from '@/components/ui/ReportButton';
import ShareButton from '@/components/ui/ShareButton';
import ContentRow from '@/components/ui/ContentRow';
import { imgUrl, ageRatingColor, typeLabel, formatDate } from '@/utils/helpers';
import { useLang } from '@/hooks/useLang';
import { useAuthStore } from '@/store/authStore';
import { useAnalytics } from '@/hooks/useFirebaseAnalytics';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

export default function ContentPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: content, isLoading } = useContentDetail(slug!);
  const { title, desc, lang, t } = useLang();
  const { isAuthenticated } = useAuthStore();
  const favorite = useFavorite();
  const rate = useRate();
  const { trackView, trackFavorite, trackRating } = useAnalytics();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [activeSeason, setActiveSeason] = useState(0);
  const [playerUrl, setPlayerUrl] = useState('');
  const [activeServer, setActiveServer] = useState(0);
  const [showTrailer, setShowTrailer] = useState(false);

  // Related content
  const { data: related } = useQuery({
    queryKey: ['related', slug],
    queryFn: () => api.get('/related', { params: { slug, limit: 10 } }).then(r => r.data.data),
    enabled: !!slug,
  });

  // Watch later
  const watchLater = useMutation({
    mutationFn: (content_id: number) => api.post('/watch-later', { content_id }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['watch-later'] }); toast.success(t('Guardado para ver mais tarde!', 'Saved for later!')); },
  });

  // Follow
  const follow = useMutation({
    mutationFn: (content_id: number) => api.post('/follow', { content_id }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['follows'] }); toast.success(t('A seguir!', 'Following!')); },
  });

  // Track view
  if (content && !isLoading) {
    trackView(content.id, content.title_pt);
  }

  if (isLoading) return (
    <div>
      <BannerSkeleton />
      <div className="max-w-5xl mx-auto px-4 mt-8 space-y-4">
        <TextSkeleton lines={5} />
      </div>
    </div>
  );

  if (!content) return (
    <div className="text-center py-24 text-text-muted">
      <i className="fa-solid fa-circle-exclamation text-4xl mb-4 block" />
      <p>{t('Conteúdo não encontrado.', 'Content not found.')}</p>
      <button onClick={() => navigate(-1)} className="btn-ghost mt-4 text-sm">
        <i className="fa-solid fa-arrow-left" /> {t('Voltar', 'Back')}
      </button>
    </div>
  );

  const isSeries = ['series', 'animation'].includes(content.type);
  const seasons = content.seasons || [];
  const currentSeason = seasons[activeSeason];
  const servers = content.movie?.servers || [];
  const currentEmbedUrl = servers[activeServer]?.url || content.movie?.embed_url || '';

  return (
    <div>
      {/* Banner */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <img src={imgUrl(content.banner_url || content.poster_url)} alt={content.title_pt}
          className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 -mt-32 relative z-10 pb-16">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Poster */}
          <div className="shrink-0 w-40 md:w-52 mx-auto md:mx-0">
            <img src={imgUrl(content.poster_url)} alt={content.title_pt}
              className="w-full rounded-xl shadow-2xl border border-surface-border" />
          </div>

          {/* Info */}
          <div className="flex-1 pt-2 md:pt-16">
            <h1 className="font-display text-3xl md:text-4xl text-white tracking-wide">{title(content)}</h1>
            {content.original_title && content.original_title !== content.title_pt && (
              <p className="text-sm text-text-muted mt-1 italic">{content.original_title}</p>
            )}

            <div className="flex flex-wrap items-center gap-3 mt-3">
              <span className={`badge text-xs ${ageRatingColor(content.age_rating)}`}>{content.age_rating}</span>
              <span className="badge-gray text-xs">{typeLabel(content.type, lang)}</span>
              {content.release_year && (
                <span className="text-sm text-text-muted"><i className="fa-regular fa-calendar mr-1" />{content.release_year}</span>
              )}
              {content.duration && (
                <span className="text-sm text-text-muted"><i className="fa-regular fa-clock mr-1" />{content.duration}</span>
              )}
              {content.avg_rating > 0 && (
                <span className="flex items-center gap-1 text-sm text-yellow-400">
                  <i className="fa-solid fa-star text-xs" />
                  {content.avg_rating.toFixed(1)}
                  <span className="text-text-muted text-xs">({content.total_ratings})</span>
                </span>
              )}
              <span className="text-sm text-text-muted">
                <i className="fa-solid fa-eye mr-1 text-xs" />{content.views?.toLocaleString()}
              </span>
            </div>

            {/* Categories */}
            {content.categories?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {content.categories.map((c: any) => (
                  <Link key={c.id} to={`/catalog?category=${c.slug}`} className="badge-blue text-xs px-2 py-1 hover:bg-info/30 transition-colors">
                    {lang === 'en' && c.name_en ? c.name_en : c.name_pt}
                  </Link>
                ))}
              </div>
            )}

            <p className="text-text-secondary text-sm mt-4 leading-relaxed line-clamp-3">{desc(content)}</p>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 mt-5">
              {!isSeries && currentEmbedUrl && (
                <button onClick={() => setPlayerUrl(currentEmbedUrl)} className="btn-primary">
                  <i className="fa-solid fa-play" /> {t('Assistir', 'Watch')}
                </button>
              )}
              {content.trailer_url && (
                <button onClick={() => setShowTrailer(true)} className="btn-ghost gap-2">
                  <i className="fa-brands fa-youtube text-red-500" /> Trailer
                </button>
              )}
              {isAuthenticated && (
                <>
                  <button
                    onClick={() => { favorite.mutate(content.id); trackFavorite(content.id); }}
                    className={`btn-icon ${content.is_favorite ? 'border-primary/60 bg-primary/10' : ''}`}
                    title={t('Favorito', 'Favorite')}>
                    <i className={`fa-${content.is_favorite ? 'solid' : 'regular'} fa-heart text-primary`} />
                  </button>
                  <button onClick={() => watchLater.mutate(content.id)} className="btn-icon" title={t('Ver mais tarde', 'Watch Later')}>
                    <i className={`fa-${content.in_watch_later ? 'solid' : 'regular'} fa-bookmark text-info`} />
                  </button>
                  {isSeries && (
                    <button onClick={() => follow.mutate(content.id)} className="btn-icon" title={t('Seguir', 'Follow')}>
                      <i className="fa-solid fa-rss text-success text-sm" />
                    </button>
                  )}
                </>
              )}
              <ShareButton title={title(content)} />
            </div>

            {/* User rating */}
            {isAuthenticated && (
              <div className="mt-4 flex items-center gap-3">
                <span className="text-sm text-text-muted">{t('Avaliar:', 'Rate:')}</span>
                <StarRating value={content.user_rating || 0}
                  onChange={r => { rate.mutate({ content_id: content.id, rating: r }); trackRating(content.id, r); }} />
              </div>
            )}

            {/* Download (filme) */}
            {!isSeries && content.movie?.download_url && (
              <div className="mt-3 flex items-center gap-2">
                <a href={content.movie.download_url} target="_blank" rel="noreferrer"
                  className="btn-ghost text-xs gap-2">
                  <i className="fa-solid fa-download" /> {t('Descarregar', 'Download')} ({content.movie.quality || 'HD'})
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Trailer modal */}
        <AnimatePresence>
          {showTrailer && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
              onClick={() => setShowTrailer(false)}>
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                className="w-full max-w-3xl aspect-video bg-black rounded-xl overflow-hidden"
                onClick={e => e.stopPropagation()}>
                <iframe
                  src={content.trailer_url?.replace('watch?v=', 'embed/') + '?autoplay=1'}
                  className="w-full h-full border-0" allowFullScreen allow="autoplay" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Player */}
        <AnimatePresence>
          {playerUrl && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
              <div className="card overflow-hidden">
                <div className="relative w-full aspect-video">
                  <iframe src={playerUrl} className="absolute inset-0 w-full h-full border-0" allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                </div>
                {/* Servers */}
                {servers.length > 1 && (
                  <div className="p-4 border-t border-surface-border">
                    <p className="text-xs text-text-muted mb-2">{t('Servidores disponíveis:', 'Available servers:')}</p>
                    <div className="flex flex-wrap gap-2">
                      {servers.map((s: any, i: number) => (
                        <button key={i} onClick={() => { setActiveServer(i); setPlayerUrl(s.url); }}
                          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${i === activeServer ? 'bg-primary text-white' : 'btn-ghost'}`}>
                          <i className="fa-solid fa-server mr-1.5 text-xs" />{s.name}
                          {s.lang && <span className="ml-1 text-xs opacity-70">[{s.lang}]</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {/* Download / Dub links */}
              {(content.movie?.embed_url_dub || content.movie?.download_url_dub) && (
                <div className="flex gap-3 mt-3">
                  {content.movie?.embed_url_dub && (
                    <button onClick={() => setPlayerUrl(content.movie!.embed_url_dub)} className="btn-ghost text-sm gap-2">
                      <i className="fa-solid fa-language" /> {t('Versão Dobrada', 'Dubbed Version')}
                    </button>
                  )}
                  {content.movie?.download_url_dub && (
                    <a href={content.movie.download_url_dub} target="_blank" rel="noreferrer" className="btn-ghost text-sm gap-2">
                      <i className="fa-solid fa-download" /> {t('Download Dobrado', 'Dubbed Download')}
                    </a>
                  )}
                </div>
              )}
              <div className="flex justify-end mt-2">
                <ReportButton contentId={content.id} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Episodes */}
        {isSeries && seasons.length > 0 && (
          <div className="mt-10">
            <h2 className="section-title mb-4">
              <i className="fa-solid fa-list text-primary" /> {t('Episódios', 'Episodes')}
            </h2>
            {seasons.length > 1 && (
              <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
                {seasons.map((s: any, i: number) => (
                  <button key={s.id} onClick={() => setActiveSeason(i)}
                    className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${i === activeSeason ? 'bg-primary text-white' : 'btn-ghost'}`}>
                    {t(`Temporada ${s.season_number}`, `Season ${s.season_number}`)}
                  </button>
                ))}
              </div>
            )}
            <div className="space-y-2">
              {currentSeason?.episodes?.map((ep: any) => (
                <Link key={ep.id} to={`/episode/${ep.id}`}
                  className="card-hover flex items-center gap-4 p-4 group">
                  <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">{ep.episode_number}</span>
                  </div>
                  {ep.thumbnail_url && (
                    <img src={imgUrl(ep.thumbnail_url)} alt={ep.title_pt}
                      className="w-20 aspect-video object-cover rounded shrink-0 hidden sm:block" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm group-hover:text-primary transition-colors">
                      {lang === 'en' && ep.title_en ? ep.title_en : ep.title_pt}
                    </p>
                    {ep.description_pt && (
                      <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{ep.description_pt}</p>
                    )}
                  </div>
                  {ep.duration && <span className="text-xs text-text-muted shrink-0">{ep.duration}</span>}
                  <i className="fa-solid fa-play text-primary text-sm shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Related */}
        {related?.length > 0 && (
          <div className="mt-12">
            <ContentRow title={t('Relacionados', 'Related')} icon="fa-thumbs-up" items={related} />
          </div>
        )}

        {/* Comments */}
        <Comments contentId={content.id} />

        {/* Report */}
        <div className="flex justify-end mt-6">
          <ReportButton contentId={content.id} />
        </div>
      </div>
    </div>
  );
}
