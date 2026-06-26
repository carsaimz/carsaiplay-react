import { getDb } from '../_db.js';
export const config = { runtime: 'edge' };
async function authenticate(req, db) {
  const token = (req.headers.get('Authorization')||'').replace('Bearer ','');
  if (!token) return null;
  const [row] = await db`SELECT u.id FROM users u JOIN user_tokens t ON t.user_id=u.id WHERE t.token=${token} AND t.expires_at>NOW() LIMIT 1`;
  return row?.id || null;
}
export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method Not Allowed',{status:405});
  const db = getDb();
  const userId = await authenticate(req,db).catch(()=>null);
  const {content_id, episode_id, reason} = await req.json();
  await db`INSERT INTO reports (user_id, content_id, episode_id, reason, status, created_at) VALUES (${userId}, ${content_id}, ${episode_id||null}, ${reason||'other'}, 'pending', NOW())`;
  return Response.json({ok:true});
}
