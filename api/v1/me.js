import { getDb } from '../_db.js';
export const config = { runtime: 'edge' };

async function getUser(req, db) {
  const auth  = req.headers.get('Authorization') || '';
  const token = auth.replace('Bearer ', '').trim();
  if (!token) return null;
  const [row] = await db`
    SELECT u.id, u.name, u.email, u.role, u.avatar, u.status, u.created_at
    FROM users u
    JOIN user_tokens t ON t.user_id = u.id
    WHERE t.token = ${token} AND t.expires_at > NOW() AND u.status = 'active'
    LIMIT 1`;
  return row || null;
}

export default async function handler(req) {
  const db   = getDb();
  const user = await getUser(req, db).catch(() => null);
  if (!user) return Response.json({ ok: false, error: 'Não autenticado.' }, { status: 401 });
  return Response.json({ ok: true, data: user });
}
