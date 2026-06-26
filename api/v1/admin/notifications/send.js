import { getDb } from '../../../_db.js';
export const config = { runtime: 'edge' };
async function isAdmin(req, db) {
  const token = (req.headers.get('Authorization')||'').replace('Bearer ','');
  if (!token) return false;
  const [r] = await db`SELECT u.role FROM users u JOIN user_tokens t ON t.user_id=u.id WHERE t.token=${token} AND t.expires_at>NOW() LIMIT 1`;
  return r?.role === 'admin';
}
export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method Not Allowed',{status:405});
  const db = getDb();
  if (!await isAdmin(req,db)) return Response.json({ok:false,error:'Proibido.'},{status:403});
  const {title, body, type, link, recipients} = await req.json();
  if (!title || !body) return Response.json({ok:false,error:'Campos obrigatórios.'},{status:422});
  // Global notification (user_id = NULL means all users see it)
  const [row] = await db`INSERT INTO notifications (user_id, title, body, type, read, created_at) VALUES (NULL, ${title}, ${body}, ${type||'info'}, false, NOW()) RETURNING *`;
  // TODO: send FCM push to all FCM tokens from user_fcm_tokens table
  return Response.json({ok:true,data:row});
}
