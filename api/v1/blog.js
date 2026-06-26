import { getDb } from '../_db.js';
export const config = { runtime: 'edge' };

export default async function handler(req) {
  const db  = getDb();
  const url = new URL(req.url);
  const slug = url.searchParams.get('slug');

  if (slug) {
    const [post] = await db`
      SELECT p.*, u.name AS author_name, bc.name_pt AS category_name
      FROM blog_posts p
      LEFT JOIN users u ON u.id=p.author_id
      LEFT JOIN blog_categories bc ON bc.id=p.category_id
      WHERE p.slug=${slug} AND p.status='published' LIMIT 1`;
    if (!post) return Response.json({ ok: false, error: 'Not found' }, { status: 404 });
    await db`UPDATE blog_posts SET views=views+1 WHERE id=${post.id}`;
    return Response.json({ ok: true, data: post });
  }

  const rows = await db`
    SELECT p.id, p.slug, p.title_pt, p.title_en, p.excerpt_pt, p.featured_image,
           p.views, p.published_at, u.name AS author_name, bc.name_pt AS category_name
    FROM blog_posts p
    LEFT JOIN users u ON u.id=p.author_id
    LEFT JOIN blog_categories bc ON bc.id=p.category_id
    WHERE p.status='published'
    ORDER BY p.published_at DESC
    LIMIT 20`;

  return Response.json({ ok: true, data: rows });
}
