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
  const status = url.searchParams.get('status')||'';
  const page = Math.max(1, parseInt(url.searchParams.get('page')||'1'));
  const limit = 20; const offset = (page-1)*limit;
  const statusClause = status === 'pending' ? db`AND c.approved=0` : status === 'approved' ? db`AND c.approved=1` : db``;
  const [rows,[count]] = await Promise.all([
    db`SELECT c.*, u.name AS username, co.slug, co.title_pt AS content_title
       FROM comments c
       LEFT JOIN users u ON u.id=c.user_id
       LEFT JOIN contents co ON co.id=c.content_id
       WHERE 1=1 ${statusClause}
       ORDER BY c.created_at DESC LIMIT ${limit} OFFSET ${offset}`,
    db`SELECT COUNT(*) AS n FROM comments WHERE 1=1 ${statusClause}`,
  ]);
  return Response.json({ok:true,data:rows,meta:{total:parseInt(count.n),page,last_page:Math.ceil(count.n/limit)}});
}
