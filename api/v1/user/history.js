import { getDb } from '../../_db.js';
export const config = { runtime: 'edge' };

async function authenticate(req, db) {
  const token = (req.headers.get('Authorization') || '').replace('Bearer ', '');
  if (!token) return null;
  const [row] = await db`SELECT u.id FROM users u JOIN user_tokens t ON t.user_id=u.id WHERE t.token=${token} AND t.expires_at>NOW() LIMIT 1`;
  return row?.id || null;
}

export default async function handler(req) {
  const db = getDb();
  const userId = await authenticate(req, db).catch(() => null);
  if (!userId) return Response.json({ ok: false, error: 'Não autenticado.' }, { status: 401 });

  const rows = await db`
    SELECT DISTINCT ON (c.id) c.id, c.title_pt, c.title_en, c.slug, c.type,
           c.poster_url, c.release_year, wh.watched_at, wh.progress_sec
    FROM watch_history wh
    JOIN contents c ON c.id = wh.content_id
    WHERE wh.user_id = ${userId}
    ORDER BY c.id, wh.watched_at DESC
    LIMIT 50`;

  return Response.json({ ok: true, data: rows });
}
