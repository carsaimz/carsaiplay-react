import { getDb } from '../../_db.js';
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
  if (!userId) return Response.json({ok:false,error:'Não autenticado.'},{status:401});
  const {comment_id} = await req.json();
  await db`INSERT INTO comment_likes (user_id, comment_id, type, created_at) VALUES (${userId}, ${comment_id}, 'like', NOW()) ON CONFLICT (user_id, comment_id) DO UPDATE SET type='like'`;
  return Response.json({ok:true});
}
