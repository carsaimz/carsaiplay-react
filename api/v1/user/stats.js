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

  const [[watched], [favs], [revs], [reqs]] = await Promise.all([
    db`SELECT COUNT(DISTINCT content_id) AS n FROM watch_history WHERE user_id=${userId}`,
    db`SELECT COUNT(*) AS n FROM favorites WHERE user_id=${userId}`,
    db`SELECT COUNT(*) AS n FROM ratings WHERE user_id=${userId}`,
    db`SELECT COUNT(*) AS n FROM content_requests WHERE user_id=${userId}`,
  ]);

  return Response.json({ ok: true, data: {
    watched:   parseInt(watched?.n  || '0'),
    favorites: parseInt(favs?.n     || '0'),
    reviews:   parseInt(revs?.n     || '0'),
    requests:  parseInt(reqs?.n     || '0'),
  }});
}
