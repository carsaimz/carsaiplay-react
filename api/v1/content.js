// GET /api/v1/content?type=&category=&sort=&page=&per_page=
import { getDb } from '../_db.js';
export const config = { runtime: 'edge' };

export default async function handler(req) {
  const db = getDb();
  const url = new URL(req.url);
  const type     = url.searchParams.get('type')     || '';
  const category = url.searchParams.get('category') || '';
  const sort     = url.searchParams.get('sort')     || 'recent';
  const page     = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const perPage  = Math.min(50, parseInt(url.searchParams.get('per_page') || '24'));
  const offset   = (page - 1) * perPage;

  const orderMap = {
    recent:  'c.created_at DESC',
    popular: 'c.views DESC',
    rating:  'avg_rating DESC',
    title:   'c.title_pt ASC',
  };
  const orderBy = orderMap[sort] || orderMap.recent;

  try {
    const typeClause     = type     ? db`AND c.type = ${type}`     : db``;
    const categoryClause = category ? db`AND cat.slug = ${category}` : db``;

    const [rows, countRows] = await Promise.all([
      db`SELECT DISTINCT c.id, c.title_pt, c.title_en, c.original_title, c.slug, c.type,
                c.release_year, c.duration, c.age_rating, c.poster_url, c.banner_url,
                c.views, c.status, c.featured,
                COALESCE(AVG(r.rating) OVER (PARTITION BY c.id), 0)::numeric(3,1) AS avg_rating,
                COUNT(r.id) OVER (PARTITION BY c.id) AS total_ratings
         FROM contents c
         LEFT JOIN ratings r ON r.content_id = c.id
         LEFT JOIN content_categories cc ON cc.content_id = c.id
         LEFT JOIN categories cat ON cat.id = cc.category_id
         WHERE c.status = 'published'
         ${typeClause} ${categoryClause}
         ORDER BY ${db.unsafe(orderBy)}
         LIMIT ${perPage} OFFSET ${offset}`,

      db`SELECT COUNT(DISTINCT c.id) AS total
         FROM contents c
         LEFT JOIN content_categories cc ON cc.content_id = c.id
         LEFT JOIN categories cat ON cat.id = cc.category_id
         WHERE c.status = 'published'
         ${typeClause} ${categoryClause}`,
    ]);

    const total    = parseInt(countRows[0]?.total || '0');
    const lastPage = Math.ceil(total / perPage);

    return Response.json({
      ok: true,
      data: rows,
      meta: { total, page, per_page: perPage, last_page: lastPage },
    });
  } catch (err) {
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}
