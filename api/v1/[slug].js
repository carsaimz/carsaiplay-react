// GET /api/v1/content/:slug  →  implementado via api/v1/content/[slug].js
import { getDb } from '../../_db.js';
export const config = { runtime: 'edge' };

export default async function handler(req, { params }) {
  const db   = getDb();
  const slug = params?.slug || new URL(req.url).pathname.split('/').pop();

  try {
    const [rows] = await db`
      SELECT c.*,
        COALESCE(AVG(r.rating), 0)::numeric(3,1) AS avg_rating,
        COUNT(r.id) AS total_ratings
      FROM contents c
      LEFT JOIN ratings r ON r.content_id = c.id
      WHERE c.slug = ${slug} AND c.status = 'published'
      GROUP BY c.id
      LIMIT 1`;

    if (!rows) return Response.json({ ok: false, error: 'Not found' }, { status: 404 });

    // Categories
    const categories = await db`
      SELECT cat.* FROM categories cat
      JOIN content_categories cc ON cc.category_id = cat.id
      WHERE cc.content_id = ${rows.id}`;

    // If series: seasons + episodes
    let seasons = [];
    if (['series', 'animation'].includes(rows.type)) {
      seasons = await db`SELECT * FROM seasons WHERE content_id = ${rows.id} ORDER BY season_number`;
      for (const s of seasons) {
        s.episodes = await db`SELECT * FROM episodes WHERE season_id = ${s.id} ORDER BY episode_number`;
      }
    }

    // If movie: embed servers
    let movie = null;
    if (rows.type === 'movie') {
      const [m] = await db`SELECT * FROM movies WHERE content_id = ${rows.id} LIMIT 1`;
      if (m) {
        m.servers = await db`SELECT * FROM embed_servers WHERE content_id = ${rows.id} ORDER BY sort_order`;
        movie = m;
      }
    }

    // Increment views
    await db`UPDATE contents SET views = views + 1 WHERE id = ${rows.id}`;

    return Response.json({ ok: true, data: { ...rows, categories, seasons, movie } });
  } catch (err) {
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}
