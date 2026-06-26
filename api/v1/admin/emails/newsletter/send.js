import { getDb } from '../../../../_db.js';
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
  const {subject, body, recipients} = await req.json();
  if (!subject || !body) return Response.json({ok:false,error:'Campos obrigatórios.'},{status:422});
  const users = await db`SELECT email, name FROM users WHERE status='active' ORDER BY created_at DESC`;
  let count = 0;
  for (const u of users) {
    await db`INSERT INTO email_queue (to_email, to_name, subject, body_html, created_at) VALUES (${u.email}, ${u.name}, ${subject}, ${body}, NOW())`;
    count++;
  }
  return Response.json({ok:true, queued: count});
}
