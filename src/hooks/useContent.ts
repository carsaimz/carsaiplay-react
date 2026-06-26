import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contentApi, ContentFilters } from '@/api/content';
import { toast } from 'react-toastify';

export const useHome = () =>
  useQuery({ queryKey: ['home'], queryFn: () => contentApi.home().then(r => r.data.data) });

export const useContent = (filters: ContentFilters) =>
  useQuery({
    queryKey: ['content', filters],
    queryFn: () => contentApi.list(filters).then(r => r.data),
  });

export const useContentDetail = (slug: string) =>
  useQuery({
    queryKey: ['content', slug],
    queryFn: () => contentApi.get(slug).then(r => r.data.data),
    enabled: !!slug,
  });

export const useSearch = (q: string) =>
  useQuery({
    queryKey: ['search', q],
    queryFn: () => contentApi.search(q).then(r => r.data.data),
    enabled: q.length >= 2,
  });

export const useFavorite = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: contentApi.favorite,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['content'] });
      qc.invalidateQueries({ queryKey: ['favorites'] });
    },
    onError: () => toast.error('Erro ao actualizar favoritos'),
  });
};

export const useRate = () =>
  useMutation({
    mutationFn: ({ content_id, rating }: { content_id: number; rating: number }) =>
      contentApi.rate(content_id, rating),
    onSuccess: (_, vars) => {
      toast.success('Avaliação guardada!');
    },
  });
