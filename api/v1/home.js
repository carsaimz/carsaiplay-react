// GET /api/v1/home
import { getDb } from '../_db.js';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  const db = getDb();
  try {
    const [featured, trending, recent, series, movies, animations] = await Promise.all([
      db`SELECT c.*, COALESCE(AVG(r.rating),0)::numeric(3,1) AS avg_rating, COUNT(r.id) AS total_ratings
         FROM contents c LEFT JOIN ratings r ON r.content_id=c.id
         WHERE c.featured=true AND c.status='published' GROUP BY c.id ORDER BY c.updated_at DESC LIMIT 5`,

      db`SELECT c.*, COALESCE(AVG(r.rating),0)::numeric(3,1) AS avg_rating
         FROM contents c LEFT JOIN ratings r ON r.content_id=c.id
         WHERE c.status='published' GROUP BY c.id ORDER BY c.views DESC LIMIT 16`,

      db`SELECT c.*, COALESCE(AVG(r.rating),0)::numeric(3,1) AS avg_rating
         FROM contents c LEFT JOIN ratings r ON r.content_id=c.id
         WHERE c.status='published' GROUP BY c.id ORDER BY c.created_at DESC LIMIT 16`,

      db`SELECT c.*, COALESCE(AVG(r.rating),0)::numeric(3,1) AS avg_rating
         FROM contents c LEFT JOIN ratings r ON r.content_id=c.id
         WHERE c.type IN ('series') AND c.status='published' GROUP BY c.id ORDER BY c.views DESC LIMIT 16`,

      db`SELECT c.*, COALESCE(AVG(r.rating),0)::numeric(3,1) AS avg_rating
         FROM contents c LEFT JOIN ratings r ON r.content_id=c.id
         WHERE c.type='movie' AND c.status='published' GROUP BY c.id ORDER BY c.views DESC LIMIT 16`,

      db`SELECT c.*, COALESCE(AVG(r.rating),0)::numeric(3,1) AS avg_rating
         FROM contents c LEFT JOIN ratings r ON r.content_id=c.id
         WHERE c.type='animation' AND c.status='published' GROUP BY c.id ORDER BY c.views DESC LIMIT 16`,
    ]);

    return Response.json({ ok: true, data: { featured, trending, recent, series, movies, animations } });
  } catch (err) {
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}
