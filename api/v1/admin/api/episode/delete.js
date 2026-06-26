import { getDb } from '../../../../_db.js';
export const config = { runtime: 'edge' };
async function isAdmin(req, db) {
  const token = (req.headers.get('Authorization')||'').replace('Bearer ','');
  if (!token) return false;
  const [r] = await db`SELECT u.role FROM users u JOIN user_tokens t ON t.user_id=u.id WHERE t.token=${token} AND t.expires_at>NOW() LIMIT 1`;
  return r?.role === 'admin';
}
export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  const db = getDb();
  if (!await isAdmin(req, db)) return Response.json({ ok: false, error: 'Proibido.' }, { status: 403 });
  const { ep_id } = await req.json();
  const [ep] = await db`SELECT season_id FROM episodes WHERE id=${parseInt(ep_id)} LIMIT 1`;
  await db`DELETE FROM episodes WHERE id=${parseInt(ep_id)}`;
  if (ep?.season_id) await db`UPDATE seasons SET ep_count=(SELECT COUNT(*) FROM episodes WHERE season_id=${ep.season_id}) WHERE id=${ep.season_id}`;
  return Response.json({ ok: true });
}
