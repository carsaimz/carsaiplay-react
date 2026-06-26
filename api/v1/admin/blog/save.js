import { getDb } from '../../../_db.js';
export const config = { runtime: 'edge' };
async function isAdmin(req, db) {
  const token = (req.headers.get('Authorization')||'').replace('Bearer ','');
  if (!token) return false;
  const [r] = await db`SELECT u.role FROM users u JOIN user_tokens t ON t.user_id=u.id WHERE t.token=${token} AND t.expires_at>NOW() LIMIT 1`;
  return r?.role === 'admin';
}
async function getAdminId(req, db) {
  const token = (req.headers.get('Authorization')||'').replace('Bearer ','');
  const [r] = await db`SELECT u.id FROM users u JOIN user_tokens t ON t.user_id=u.id WHERE t.token=${token} AND t.expires_at>NOW() LIMIT 1`;
  return r?.id;
}
export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method Not Allowed',{status:405});
  const db = getDb();
  if (!await isAdmin(req,db)) return Response.json({ok:false,error:'Proibido.'},{status:403});
  const authorId = await getAdminId(req,db);
  const {title_pt,title_en,slug,excerpt_pt,content_pt,featured_image,category_id,status} = await req.json();
  const [row] = await db`INSERT INTO blog_posts (author_id,category_id,slug,title_pt,title_en,excerpt_pt,content_pt,featured_image,status,published_at,created_at) VALUES (${authorId},${category_id||null},${slug},${title_pt},${title_en||null},${excerpt_pt||null},${content_pt||null},${featured_image||null},${status||'draft'},${status==='published'?new Date():null},NOW()) RETURNING *`;
  return Response.json({ok:true,data:row},{status:201});
}
