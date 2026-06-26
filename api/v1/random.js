import { getDb } from '../_db.js';
export const config = { runtime: 'edge' };
export default async function handler(req) {
  const db = getDb();
  const url = new URL(req.url);
  const type     = url.searchParams.get('type')||'';
  const category = url.searchParams.get('category')||'';
  const typeClause     = type     ? db`AND c.type=${type}`         : db``;
  const categoryClause = category ? db`AND EXISTS (SELECT 1 FROM content_categories cc JOIN categories cat ON cat.id=cc.category_id WHERE cc.content_id=c.id AND cat.slug=${category})` : db``;
  const [row] = await db`SELECT id,slug FROM contents c WHERE c.status='published' ${typeClause} ${categoryClause} ORDER BY RANDOM() LIMIT 1`;
  if (!row) return Response.json({ok:false,error:'Nenhum conteúdo encontrado.'},{status:404});
  return Response.json({ok:true,data:row});
}
