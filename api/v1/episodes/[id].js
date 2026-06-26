import { getDb } from '../../_db.js';
export const config = { runtime: 'edge' };

export default async function handler(req, { params }) {
  const db = getDb();
  const id = params?.id || new URL(req.url).pathname.split('/').pop();

  const [ep] = await db`
    SELECT e.*, s.content_id, s.season_number,
           c.slug AS content_slug, c.title_pt AS content_title_pt, c.title_en AS content_title_en
    FROM episodes e
    JOIN seasons s ON s.id = e.season_id
    JOIN contents c ON c.id = s.content_id
    WHERE e.id = ${parseInt(id)} LIMIT 1`;

  if (!ep) return Response.json({ ok: false, error: 'Not found' }, { status: 404 });

  const servers = await db`
    SELECT * FROM embed_servers WHERE episode_id=${ep.id} ORDER BY sort_order`;

  await db`UPDATE contents SET views=views+1 WHERE id=${ep.content_id}`;

  return Response.json({ ok: true, data: { ...ep, servers } });
}
