import { getDb } from '../_db.js';
export const config = { runtime: 'edge' };
export default async function handler() {
  const db = getDb();
  const rows = await db`
    SELECT c.*, COALESCE(AVG(r.rating),0)::numeric(3,1) AS avg_rating
    FROM contents c LEFT JOIN ratings r ON r.content_id=c.id
    WHERE c.status='published' GROUP BY c.id ORDER BY c.views DESC LIMIT 20`;
  return Response.json({ ok: true, data: rows });
}
