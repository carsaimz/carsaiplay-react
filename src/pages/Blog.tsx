import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '@/api/client';
import { useSettingsStore } from '@/store/settingsStore';
import { imgUrl, formatDate } from '@/utils/helpers';

export default function Blog() {
  const { lang } = useSettingsStore();
  const { data, isLoading } = useQuery({
    queryKey: ['blog'],
    queryFn: () => api.get('/blog').then(r => r.data.data || r.data),
  });

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
      <h1 className="page-title mb-8">
        <i className="fa-solid fa-newspaper text-primary mr-3" /> Blog
      </h1>
      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-6">
          {Array.from({length:4}).map((_,i)=><div key={i} className="skeleton h-64 rounded-xl"/>)}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {(data || []).map((post: any) => (
            <Link key={post.id} to={`/blog/${post.slug}`} className="card-hover group">
              {post.featured_image && (
                <img src={imgUrl(post.featured_image)} alt={post.title_pt}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105" />
              )}
              <div className="p-5">
                <p className="text-xs text-primary mb-2">{post.category_name}</p>
                <h2 className="font-semibold text-white group-hover:text-primary transition-colors line-clamp-2">
                  {lang === 'en' && post.title_en ? post.title_en : post.title_pt}
                </h2>
                <p className="text-sm text-text-muted mt-2 line-clamp-2">{post.excerpt_pt}</p>
                <p className="text-xs text-text-muted mt-3">
                  <i className="fa-regular fa-clock mr-1" />{formatDate(post.published_at, lang)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
