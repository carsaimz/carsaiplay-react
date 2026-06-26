import { getDb } from '../_db.js';
export const config = { runtime: 'edge' };

export default async function handler(req) {
  const db    = getDb();
  const url   = new URL(req.url);
  const q     = url.searchParams.get('q') || '';
  const limit = Math.min(20, parseInt(url.searchParams.get('limit') || '10'));

  if (q.length < 2) return Response.json({ ok: true, data: [] });

  try {
    const rows = await db`
      SELECT id, title_pt, title_en, original_title, slug, type, release_year,
             poster_url, age_rating,
             COALESCE(AVG(r.rating), 0)::numeric(3,1) AS avg_rating
      FROM contents c
      LEFT JOIN ratings r ON r.content_id = c.id
      WHERE c.status = 'published'
        AND (c.title_pt ILIKE ${'%'+q+'%'} OR c.title_en ILIKE ${'%'+q+'%'}
             OR c.original_title ILIKE ${'%'+q+'%'})
      GROUP BY c.id
      ORDER BY c.views DESC
      LIMIT ${limit}`;
    return Response.json({ ok: true, data: rows });
  } catch (err) {
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}
