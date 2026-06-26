import { getDb } from '../../_db.js';
export const config = { runtime: 'edge' };

async function isAdmin(req, db) {
  const token = (req.headers.get('Authorization') || '').replace('Bearer ', '');
  if (!token) return false;
  const [row] = await db`SELECT u.role FROM users u JOIN user_tokens t ON t.user_id=u.id WHERE t.token=${token} AND t.expires_at>NOW() LIMIT 1`;
  return row?.role === 'admin';
}

export default async function handler(req) {
  const db = getDb();
  if (!await isAdmin(req, db)) return Response.json({ ok: false, error: 'Proibido.' }, { status: 403 });

  const url    = new URL(req.url);
  const page   = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const limit  = 25;
  const offset = (page - 1) * limit;

  if (req.method === 'GET') {
    const [rows, [count]] = await Promise.all([
      db`SELECT id,name,email,role,status,avatar,created_at FROM users ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`,
      db`SELECT COUNT(*) AS n FROM users`,
    ]);
    return Response.json({ ok: true, data: rows, meta: { total: parseInt(count.n), page, last_page: Math.ceil(count.n / limit) } });
  }

  if (req.method === 'PUT') {
    const { id, status, role } = await req.json();
    const [row] = await db`UPDATE users SET status=${status}, role=${role}, updated_at=NOW() WHERE id=${id} RETURNING id,name,email,role,status`;
    return Response.json({ ok: true, data: row });
  }

  return new Response('Method Not Allowed', { status: 405 });
}
