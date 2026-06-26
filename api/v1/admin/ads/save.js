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
  const {zone, ...config} = await req.json();
  await db`INSERT INTO ad_zones (zone_key, config, updated_at) VALUES (${zone}, ${JSON.stringify(config)}, NOW()) ON CONFLICT (zone_key) DO UPDATE SET config=${JSON.stringify(config)}, updated_at=NOW()`;
  return Response.json({ok:true});
}
