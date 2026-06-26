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
  const { id, season_id, episode_number, title_pt, title_en, description_pt, embed_url, embed_url_dub, download_url, duration } = await req.json();
  if (id) {
    const [row] = await db`UPDATE episodes SET episode_number=${parseInt(episode_number)}, title_pt=${title_pt||null}, title_en=${title_en||null}, description_pt=${description_pt||null}, embed_url=${embed_url||null}, embed_url_dub=${embed_url_dub||null}, download_url=${download_url||null}, duration=${duration||null} WHERE id=${id} RETURNING *`;
    await db`UPDATE seasons SET ep_count=(SELECT COUNT(*) FROM episodes WHERE season_id=${parseInt(season_id)}) WHERE id=${parseInt(season_id)}`;
    return Response.json({ ok: true, data: row });
  }
  const [row] = await db`INSERT INTO episodes (season_id, episode_number, title_pt, title_en, description_pt, embed_url, embed_url_dub, download_url, duration, created_at) VALUES (${parseInt(season_id)}, ${parseInt(episode_number)}, ${title_pt||null}, ${title_en||null}, ${description_pt||null}, ${embed_url||null}, ${embed_url_dub||null}, ${download_url||null}, ${duration||null}, NOW()) RETURNING *`;
  await db`UPDATE seasons SET ep_count=(SELECT COUNT(*) FROM episodes WHERE season_id=${parseInt(season_id)}) WHERE id=${parseInt(season_id)}`;
  return Response.json({ ok: true, data: row }, { status: 201 });
}
