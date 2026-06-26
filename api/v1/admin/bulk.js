import { getDb } from '../../_db.js';
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
  const {ids, action, resource} = await req.json();
  if (!ids?.length || !action || !resource) return Response.json({ok:false,error:'Dados inválidos.'},{status:422});
  if (resource === 'content') {
    if (action === 'publish')  await db`UPDATE contents SET status='published', updated_at=NOW() WHERE id = ANY(${ids})`;
    if (action === 'archive')  await db`UPDATE contents SET status='draft', updated_at=NOW() WHERE id = ANY(${ids})`;
    if (action === 'delete')   await db`DELETE FROM contents WHERE id = ANY(${ids})`;
  }
  return Response.json({ok:true, affected: ids.length});
}
