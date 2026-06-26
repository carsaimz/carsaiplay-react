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
  const tables = await db`
    SELECT t.table_name AS name,
           (SELECT COUNT(*) FROM information_schema.columns c WHERE c.table_name=t.table_name AND c.table_schema='public') AS col_count,
           (SELECT reltuples::bigint FROM pg_class WHERE relname=t.table_name) AS row_count
    FROM information_schema.tables t
    WHERE t.table_schema='public' AND t.table_type='BASE TABLE'
    ORDER BY t.table_name`;
  return Response.json({ok:true,data:tables});
}
