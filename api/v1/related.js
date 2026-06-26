import { getDb } from '../_db.js';
export const config = { runtime: 'edge' };
export default async function handler(req) {
  const db = getDb();
  const url = new URL(req.url);
  const slug  = url.searchParams.get('slug') || '';
  const limit = Math.min(20, parseInt(url.searchParams.get('limit') || '10'));
  if (!slug) return Response.json({ ok: true, data: [] });
  // Get content's categories, then find similar
  const [content] = await db`SELECT id, type FROM contents WHERE slug=${slug} LIMIT 1`;
  if (!content) return Response.json({ ok: true, data: [] });
  const categoryIds = await db`SELECT category_id FROM content_categories WHERE content_id=${content.id}`;
  const ids = categoryIds.map((r) => r.category_id);
  if (!ids.length) {
    const rows = await db`SELECT c.*, COALESCE(AVG(r.rating),0)::numeric(3,1) AS avg_rating FROM contents c LEFT JOIN ratings r ON r.content_id=c.id WHERE c.status='published' AND c.type=${content.type} AND c.id != ${content.id} GROUP BY c.id ORDER BY c.views DESC LIMIT ${limit}`;
    return Response.json({ ok: true, data: rows });
  }
  const rows = await db`
    SELECT DISTINCT c.id, c.title_pt, c.title_en, c.slug, c.type, c.release_year, c.poster_url, c.age_rating,
           COALESCE(AVG(r.rating) OVER (PARTITION BY c.id), 0)::numeric(3,1) AS avg_rating, c.views
    FROM contents c
    JOIN content_categories cc ON cc.content_id=c.id
    LEFT JOIN ratings r ON r.content_id=c.id
    WHERE cc.category_id = ANY(${ids}) AND c.status='published' AND c.id != ${content.id}
    ORDER BY c.views DESC
    LIMIT ${limit}`;
  return Response.json({ ok: true, data: rows });
}
