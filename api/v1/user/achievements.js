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
    SELECT a.*, ua.unlocked_at, (ua.id IS NOT NULL) AS unlocked
    FROM achievements a
    LEFT JOIN user_achievements ua ON ua.achievement_id=a.id AND ua.user_id=${userId}
    ORDER BY unlocked DESC, a.points DESC`;

  return Response.json({ ok: true, data: rows });
}
