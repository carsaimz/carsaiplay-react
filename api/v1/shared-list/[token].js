import { getDb } from '../../_db.js';
export const config = { runtime: 'edge' };
export default async function handler(req, {params}) {
  const db = getDb();
  const token = params?.token || new URL(req.url).pathname.split('/').pop();
  const [list] = await db`SELECT sl.*, u.name AS owner_name FROM shared_lists sl JOIN users u ON u.id=sl.user_id WHERE sl.token=${token} AND sl.expires_at > NOW() LIMIT 1`;
  if (!list) return Response.json({ok:false,error:'Lista não encontrada ou expirada.'},{status:404});
  const items = await db`SELECT c.* FROM contents c JOIN shared_list_items sli ON sli.content_id=c.id WHERE sli.list_id=${list.id} AND c.status='published'`;
  return Response.json({ok:true,data:{...list,items}});
}
