import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/client';
import { useSettingsStore } from '@/store/settingsStore';
import { imgUrl, formatDate } from '@/utils/helpers';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { lang } = useSettingsStore();
  const { data: post, isLoading } = useQuery({
    queryKey: ['blog', slug],
    queryFn: () => api.get(`/blog/${slug}`).then(r => r.data.data || r.data),
    enabled: !!slug,
  });

  if (isLoading) return <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">{Array.from({length:5}).map((_,i)=><div key={i} className="skeleton h-6 rounded"/>)}</div>;
  if (!post) return null;

  return (
    <article className="max-w-3xl mx-auto px-4 md:px-6 py-8">
      {post.featured_image && (
        <img src={imgUrl(post.featured_image)} alt={post.title_pt}
          className="w-full h-72 object-cover rounded-xl mb-8" />
      )}
      <span className="badge-red mb-3">{post.category_name}</span>
      <h1 className="font-display text-3xl md:text-4xl text-white tracking-wide mt-2 mb-3">
        {lang === 'en' && post.title_en ? post.title_en : post.title_pt}
      </h1>
      <div className="flex items-center gap-3 text-xs text-text-muted mb-8">
        <span><i className="fa-solid fa-user mr-1" />{post.author_name}</span>
        <span>·</span>
        <span><i className="fa-regular fa-clock mr-1" />{formatDate(post.published_at, lang)}</span>
        <span>·</span>
        <span><i className="fa-solid fa-eye mr-1" />{post.views}</span>
      </div>
      <div className="prose prose-invert prose-sm max-w-none text-text-secondary leading-relaxed"
        dangerouslySetInnerHTML={{ __html: post.content_pt }} />
    </article>
  );
}
