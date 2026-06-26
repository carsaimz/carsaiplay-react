import { getDb } from '../../_db.js';
export const config = { runtime: 'edge' };
async function authenticate(req, db) {
  const token = (req.headers.get('Authorization')||'').replace('Bearer ','');
  if (!token) return null;
  const [row] = await db`SELECT u.id FROM users u JOIN user_tokens t ON t.user_id=u.id WHERE t.token=${token} AND t.expires_at>NOW() LIMIT 1`;
  return row?.id || null;
}
export default async function handler(req) {
  const db = getDb();
  const userId = await authenticate(req,db).catch(()=>null);
  if (!userId) return Response.json({ok:false,error:'Não autenticado.'},{status:401});
  const rows = await db`SELECT r.*, c.title_pt AS content_title_pt FROM reminders r LEFT JOIN contents c ON c.id=r.content_id WHERE r.user_id=${userId} ORDER BY r.remind_at ASC`;
  return Response.json({ok:true,data:rows});
}
