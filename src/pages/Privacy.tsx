import { useQuery } from '@tanstack/react-query';
import api from '@/api/client';
import { useSettingsStore } from '@/store/settingsStore';

export default function Privacy() {
  const { lang } = useSettingsStore();
  const { data, isLoading } = useQuery({
    queryKey: ['privacy'],
    queryFn: () => api.get('/privacy').then(r => r.data.data || r.data).catch(() => null),
  });

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
      <h1 className="page-title mb-8">
        <i className="fa-solid fa-shield-halved text-primary mr-3" />
        {lang === 'en' ? 'Privacy Policy' : 'Política de Privacidade'}
      </h1>
      {isLoading ? (
        <div className="space-y-3">{Array.from({length:5}).map((_,i)=><div key={i} className="skeleton h-6 rounded"/>)}</div>
      ) : data?.content_pt ? (
        <div className="prose prose-invert prose-sm max-w-none text-text-secondary leading-relaxed"
          dangerouslySetInnerHTML={{ __html: data.content_pt }} />
      ) : (
        <p className="text-text-muted text-sm">{lang === 'en' ? 'Content not available.' : 'Conteúdo não disponível.'}</p>
      )}
    </div>
  );
}
