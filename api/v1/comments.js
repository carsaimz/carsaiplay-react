import { getDb } from '../_db.js';
export const config = { runtime: 'edge' };
export default async function handler(req) {
  const db = getDb();
  const url = new URL(req.url);
  const content_id = parseInt(url.searchParams.get('content_id')||'0');
  const page = Math.max(1,parseInt(url.searchParams.get('page')||'1'));
  const limit=10; const offset=(page-1)*limit;
  if (!content_id) return Response.json({ok:false,error:'content_id obrigatório.'},{status:422});
  const [rows,[count]] = await Promise.all([
    db`SELECT c.*, u.name AS username, u.avatar,
              (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id=c.id AND cl.type='like') AS likes,
              (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id=c.id AND cl.type='dislike') AS dislikes
       FROM comments c LEFT JOIN users u ON u.id=c.user_id
       WHERE c.content_id=${content_id} AND c.parent_id IS NULL AND c.approved=1
       ORDER BY c.created_at DESC LIMIT ${limit} OFFSET ${offset}`,
    db`SELECT COUNT(*) AS n FROM comments WHERE content_id=${content_id} AND parent_id IS NULL AND approved=1`,
  ]);
  // Attach replies (1 level)
  for (const c of rows) {
    c.replies = await db`SELECT c.*, u.name AS username, u.avatar FROM comments c LEFT JOIN users u ON u.id=c.user_id WHERE c.parent_id=${c.id} AND c.approved=1 ORDER BY c.created_at ASC LIMIT 5`;
  }
  return Response.json({ok:true,data:rows,meta:{total:parseInt(count.n),page,last_page:Math.ceil(count.n/limit)}});
}
