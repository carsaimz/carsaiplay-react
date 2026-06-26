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

  const [[contents], [users], [views], [requests]] = await Promise.all([
    db`SELECT COUNT(*) AS n FROM contents`,
    db`SELECT COUNT(*) AS n FROM users`,
    db`SELECT COALESCE(SUM(views),0) AS n FROM contents`,
    db`SELECT COUNT(*) AS n FROM content_requests WHERE status='pending'`,
  ]);

  const recentContent = await db`SELECT id,title_pt,type,status,created_at FROM contents ORDER BY created_at DESC LIMIT 5`;
  const recentUsers   = await db`SELECT id,name,email,role,status,created_at FROM users ORDER BY created_at DESC LIMIT 5`;

  return Response.json({ ok: true, data: {
    stats: {
      contents:  parseInt(contents?.n  || '0'),
      users:     parseInt(users?.n     || '0'),
      views:     parseInt(views?.n     || '0'),
      requests:  parseInt(requests?.n  || '0'),
    },
    recentContent,
    recentUsers,
  }});
}
