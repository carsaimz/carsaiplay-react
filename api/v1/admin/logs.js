import { getDb } from '../../_db.js';
export const config = { runtime: 'edge' };
async function isAdmin(req, db) {
  const token = (req.headers.get('Authorization')||'').replace('Bearer ','');
  if (!token) return false;
  const [r] = await db`SELECT u.role FROM users u JOIN user_tokens t ON t.user_id=u.id WHERE t.token=${token} AND t.expires_at>NOW() LIMIT 1`;
  return r?.role === 'admin';
}
export default async function handler(req) {
  const db = getDb();
  if (!await isAdmin(req,db)) return Response.json({ok:false,error:'Proibido.'},{status:403});
  const url = new URL(req.url);
  const level = url.searchParams.get('level')||'';
  const page = Math.max(1,parseInt(url.searchParams.get('page')||'1'));
  const limit=100; const offset=(page-1)*limit;
  const levelClause = level ? db`AND level=${level}` : db``;
  const rows = await db`SELECT * FROM system_logs WHERE 1=1 ${levelClause} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
  return Response.json({ok:true,data:rows});
}
