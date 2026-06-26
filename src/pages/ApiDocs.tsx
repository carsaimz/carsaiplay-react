import { useSettingsStore } from '@/store/settingsStore';
import { useState } from 'react';

const endpoints = [
  { method: 'GET',  path: '/api/v1/home',           desc: 'Dados da página inicial (featured, trending, recent, series, movies, animations)' },
  { method: 'GET',  path: '/api/v1/content',         desc: 'Listar conteúdo (type, category, sort, page, per_page)' },
  { method: 'GET',  path: '/api/v1/content/:slug',   desc: 'Detalhe de um conteúdo por slug' },
  { method: 'GET',  path: '/api/v1/search?q=',       desc: 'Pesquisa por título' },
  { method: 'GET',  path: '/api/v1/trending',        desc: 'Conteúdo em tendência' },
  { method: 'GET',  path: '/api/v1/categories',      desc: 'Lista de categorias' },
  { method: 'GET',  path: '/api/v1/schedule',        desc: 'Cronograma de lançamentos' },
  { method: 'GET',  path: '/api/v1/episodes/:id',    desc: 'Detalhe de episódio' },
  { method: 'GET',  path: '/api/v1/blog',            desc: 'Posts do blog (GET) ou post por slug (?slug=)' },
  { method: 'POST', path: '/api/v1/auth/login',      desc: 'Autenticação (email, password)' },
  { method: 'POST', path: '/api/v1/auth/register',   desc: 'Registo (name, email, password)' },
  { method: 'POST', path: '/api/v1/auth/firebase',   desc: 'Auth Firebase (id_token, provider)' },
  { method: 'POST', path: '/api/v1/auth/logout',     desc: 'Terminar sessão' },
  { method: 'GET',  path: '/api/v1/me',              desc: 'Utilizador autenticado' },
  { method: 'GET',  path: '/api/v1/favorites',       desc: 'Favoritos do utilizador' },
  { method: 'POST', path: '/api/v1/favorite',        desc: 'Toggle favorito (content_id)' },
  { method: 'POST', path: '/api/v1/rate',            desc: 'Avaliar conteúdo (content_id, rating 1-5)' },
  { method: 'POST', path: '/api/v1/follow',          desc: 'Toggle seguir série (content_id)' },
  { method: 'POST', path: '/api/v1/watch-later',     desc: 'Toggle ver mais tarde (content_id)' },
  { method: 'POST', path: '/api/v1/comment',         desc: 'Publicar comentário (content_id, body, parent_id?)' },
  { method: 'GET',  path: '/api/v1/notifications',   desc: 'Notificações do utilizador' },
];

const methodColors: Record<string, string> = {
  GET:    'bg-info/20 text-info',
  POST:   'bg-success/20 text-success',
  PUT:    'bg-warning/20 text-warning',
  DELETE: 'bg-primary/20 text-primary',
};

export default function ApiDocs() {
  const { lang } = useSettingsStore();
  const [copied, setCopied] = useState('');

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
      <h1 className="page-title mb-2">
        <i className="fa-solid fa-code text-primary mr-3" /> API Docs
      </h1>
      <p className="text-text-muted text-sm mb-8">
        Base URL: <code className="bg-surface-elevated px-2 py-0.5 rounded text-primary">
          {import.meta.env.VITE_API_URL || '/api/v1'}
        </code>
      </p>
      <div className="space-y-2">
        {endpoints.map((ep, i) => (
          <div key={i} className="card p-4 flex items-start gap-4">
            <span className={`badge shrink-0 font-mono text-xs ${methodColors[ep.method]}`}>{ep.method}</span>
            <div className="flex-1 min-w-0">
              <code className="text-sm text-white font-mono">{ep.path}</code>
              <p className="text-xs text-text-muted mt-1">{ep.desc}</p>
            </div>
            <button onClick={() => copy(ep.path)} className="btn-icon w-7 h-7 text-xs shrink-0">
              <i className={`fa-solid ${copied === ep.path ? 'fa-check text-success' : 'fa-copy'}`} />
            </button>
          </div>
        ))}
      </div>
      <div className="card p-5 mt-6">
        <h3 className="text-sm font-semibold text-white mb-3">
          <i className="fa-solid fa-key text-primary mr-2" />Authentication
        </h3>
        <p className="text-xs text-text-muted mb-2">
          {lang === 'pt' ? 'Endpoints protegidos requerem o header:' : 'Protected endpoints require the header:'}
        </p>
        <code className="text-xs bg-surface-elevated block p-3 rounded text-primary">
          Authorization: Bearer {'<token>'}
        </code>
      </div>
    </div>
  );
}
