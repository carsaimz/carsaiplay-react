export const imgUrl = (path: string | null, fallback = '/no-poster.svg') => {
  if (!path) return fallback;
  if (path.startsWith('http')) return path;
  return `${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || ''}/${path}`;
};

export const ageRatingColor = (rating: string) => ({
  'L':  'bg-green-700 text-green-100',
  '10': 'bg-yellow-700 text-yellow-100',
  '12': 'bg-yellow-600 text-yellow-100',
  '14': 'bg-orange-700 text-orange-100',
  '16': 'bg-red-700 text-red-100',
  '18': 'bg-red-900 text-red-100',
}[rating] || 'bg-surface-border text-text-secondary');

export const typeLabel = (type: string, lang: 'pt' | 'en') => {
  const map: Record<string, [string, string]> = {
    movie:        ['Filme',         'Movie'],
    series:       ['Série',         'Series'],
    animation:    ['Animação',      'Animation'],
    documentary:  ['Documentário',  'Documentary'],
  };
  return map[type]?.[lang === 'en' ? 1 : 0] || type;
};

export const formatDate = (date: string, lang: 'pt' | 'en' = 'pt') => {
  if (!date) return '';
  return new Date(date).toLocaleDateString(lang === 'en' ? 'en-GB' : 'pt-MZ', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

export const numberFormat = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

export const embedId = (url: string) => {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
};
