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
  const body = await req.json();
  for (const [key, value] of Object.entries(body)) {
    if (typeof value === 'undefined') continue;
    await db`INSERT INTO settings (key,value,updated_at) VALUES (${key},${String(value??'')},NOW()) ON CONFLICT (key) DO UPDATE SET value=${String(value??'')},updated_at=NOW()`;
  }
  return Response.json({ok:true});
}
