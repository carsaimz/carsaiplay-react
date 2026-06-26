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
  const {name_pt, name_en, slug} = await req.json();
  const [row] = await db`INSERT INTO categories (slug,name_pt,name_en) VALUES (${slug},${name_pt},${name_en||null}) ON CONFLICT (slug) DO UPDATE SET name_pt=${name_pt},name_en=${name_en||null} RETURNING *`;
  return Response.json({ok:true,data:row});
}
