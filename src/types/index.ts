export interface Content {
  id: number;
  title_pt: string;
  title_en: string;
  original_title: string;
  slug: string;
  type: 'movie' | 'series' | 'animation' | 'documentary';
  description_pt: string;
  description_en: string;
  release_year: number;
  duration: string;
  age_rating: string;
  poster_url: string;
  banner_url: string;
  trailer_url: string;
  featured: boolean;
  views: number;
  avg_rating: number;
  total_ratings: number;
  status: 'published' | 'draft';
  created_at: string;
  updated_at: string;
  categories?: Category[];
  seasons?: Season[];
  movie?: Movie;
  user_rating?: number;
  is_favorite?: boolean;
  is_watched?: boolean;
  in_watch_later?: boolean;
}

export interface Movie {
  embed_url: string;
  embed_url_dub: string;
  download_url: string;
  download_url_dub: string;
  quality: string;
  audio_language: string;
  subtitle_language: string;
  servers?: EmbedServer[];
}

export interface EmbedServer {
  name: string;
  url: string;
  lang: 'pt' | 'en' | 'leg';
}

export interface Season {
  id: number;
  season_number: number;
  title_pt: string;
  title_en: string;
  ep_count: number;
  episodes: Episode[];
}

export interface Episode {
  id: number;
  episode_number: number;
  title_pt: string;
  title_en: string;
  description_pt: string;
  duration: string;
  embed_url: string;
  embed_url_dub: string;
  download_url: string;
  thumbnail_url: string;
  published_at: string;
  servers?: EmbedServer[];
}

export interface Category {
  id: number;
  slug: string;
  name_pt: string;
  name_en: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  avatar: string;
  status: 'active' | 'banned' | 'pending';
  created_at: string;
}

export interface BlogPost {
  id: number;
  title_pt: string;
  title_en: string;
  slug: string;
  excerpt_pt: string;
  content_pt: string;
  featured_image: string;
  author_id: number;
  author_name?: string;
  category_id: number;
  category_name?: string;
  views: number;
  status: 'published' | 'draft';
  published_at: string;
  created_at: string;
}

export interface ApiResponse<T> {
  ok: boolean;
  data: T;
  error?: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  per_page: number;
  last_page: number;
}

export interface Lang {
  code: 'pt' | 'en';
  label: string;
  flag: string;
}

export interface Notification {
  id: number;
  title: string;
  body: string;
  type: string;
  read: boolean;
  created_at: string;
}

export interface Achievement {
  id: number;
  name_pt: string;
  name_en: string;
  description_pt: string;
  description_en: string;
  badge_icon: string;
  points: number;
  unlocked?: boolean;
  unlocked_at?: string;
}
