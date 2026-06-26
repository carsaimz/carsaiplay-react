import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { contentApi } from '@/api/content';
import { useLang } from '@/hooks/useLang';
import { imgUrl } from '@/utils/helpers';

export default function Episode() {
  const { id } = useParams<{ id: string }>();
  const { lang, t } = useLang();
  const [server, setServer] = useState(0);

  const { data: ep, isLoading } = useQuery({
    queryKey: ['episode', id],
    queryFn: () => contentApi.episode(Number(id)).then(r => r.data.data),
    enabled: !!id,
  });

  if (isLoading) return (
    <div className="fixed inset-0 bg-surface flex items-center justify-center">
      <div className="animate-spin text-primary text-3xl"><i className="fa-solid fa-circle-notch" /></div>
    </div>
  );
  if (!ep) return null;

  const servers = ep.servers || [];
  const url = servers[server]?.url || ep.embed_url;

  return (
    <div className="bg-black min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="bg-surface-card border-b border-surface-border px-4 py-3 flex items-center gap-4 safe-top">
        <Link to={`/content/${ep.content_slug || ''}`} className="btn-icon w-9 h-9 text-sm">
          <i className="fa-solid fa-arrow-left" />
        </Link>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-white text-sm truncate">{ep.content_title_pt}</p>
          <p className="text-xs text-text-muted">
            {t(`Ep. ${ep.episode_number}`, `Ep. ${ep.episode_number}`)} — {lang === 'en' && ep.title_en ? ep.title_en : ep.title_pt}
          </p>
        </div>
      </div>

      {/* Player */}
      <div className="w-full aspect-video bg-black">
        <iframe src={url} className="w-full h-full border-0" allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
      </div>

      {/* Servers */}
      {servers.length > 1 && (
        <div className="px-4 py-4 bg-surface-card border-t border-surface-border">
          <p className="text-xs text-text-muted mb-2">{t('Servidores', 'Servers')}</p>
          <div className="flex flex-wrap gap-2">
            {servers.map((s: any, i: number) => (
              <button key={i} onClick={() => setServer(i)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  i === server ? 'bg-primary text-white' : 'btn-ghost'
                }`}>
                <i className="fa-solid fa-server mr-1.5" />{s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="px-4 py-4 flex-1">
        <h2 className="font-semibold text-white mb-1">
          {lang === 'en' && ep.title_en ? ep.title_en : ep.title_pt}
        </h2>
        {ep.description_pt && (
          <p className="text-sm text-text-secondary">{ep.description_pt}</p>
        )}
      </div>
    </div>
  );
}
