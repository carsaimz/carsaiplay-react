import { getDb } from '../_db.js';
export const config = { runtime: 'edge' };

export default async function handler() {
  const db = getDb();
  const rows = await db`
    SELECT s.*, c.title_pt, c.title_en, c.slug, c.type, c.poster_url
    FROM schedule s
    LEFT JOIN contents c ON c.id=s.content_id
    WHERE s.release_date >= CURRENT_DATE
    ORDER BY s.release_date ASC
    LIMIT 30`;
  return Response.json({ ok: true, data: rows });
}
