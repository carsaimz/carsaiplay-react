import api from './client';
import type { ApiResponse, Content, PaginationMeta } from '@/types';

export interface ContentFilters {
  page?: number;
  per_page?: number;
  type?: string;
  category?: string;
  sort?: 'recent' | 'popular' | 'rating' | 'title';
  year?: number;
  q?: string;
}

export const contentApi = {
  list: (filters: ContentFilters = {}) =>
    api.get<ApiResponse<Content[]>>('/content', { params: filters }),

  get: (slug: string) =>
    api.get<ApiResponse<Content>>(`/content/${slug}`),

  trending: () =>
    api.get<ApiResponse<Content[]>>('/trending'),

  home: () =>
    api.get<ApiResponse<{
      featured: Content[];
      trending: Content[];
      recent: Content[];
      series: Content[];
      movies: Content[];
      animations: Content[];
    }>>('/home'),

  search: (q: string, limit = 10) =>
    api.get<ApiResponse<Content[]>>('/search', { params: { q, limit } }),

  rate: (content_id: number, rating: number) =>
    api.post('/rate', { content_id, rating }),

  favorite: (content_id: number) =>
    api.post('/favorite', { content_id }),

  watchLater: (content_id: number) =>
    api.post('/watch-later', { content_id }),

  follow: (content_id: number) =>
    api.post('/follow', { content_id }),

  episode: (id: number) =>
    api.get<ApiResponse<any>>(`/episodes/${id}`),
};
