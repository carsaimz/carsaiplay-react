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
  const { content_id, season_number, title_pt, title_en, id } = await req.json();
  if (id) {
    const [row] = await db`UPDATE seasons SET season_number=${season_number}, title_pt=${title_pt||null}, title_en=${title_en||null} WHERE id=${id} RETURNING *`;
    return Response.json({ ok: true, data: row });
  }
  const [row] = await db`INSERT INTO seasons (content_id, season_number, title_pt, title_en, ep_count) VALUES (${parseInt(content_id)}, ${parseInt(season_number)}, ${title_pt||null}, ${title_en||null}, 0) RETURNING *`;
  return Response.json({ ok: true, data: row }, { status: 201 });
}
