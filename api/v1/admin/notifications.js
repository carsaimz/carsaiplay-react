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
  const rows = await db`SELECT n.*, COUNT(CASE WHEN n2.read THEN 1 END) AS reads FROM notifications n LEFT JOIN notifications n2 ON n2.title=n.title WHERE n.user_id IS NULL GROUP BY n.id ORDER BY n.created_at DESC LIMIT 50`;
  return Response.json({ok:true,data:rows});
}
