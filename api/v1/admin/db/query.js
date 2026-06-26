import { getDb } from '../../../_db.js';
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
  const {sql} = await req.json();
  if (!sql?.trim()) return Response.json({ok:false,error:'SQL vazio.'},{status:422});
  // Safety: block DROP/TRUNCATE/ALTER on prod
  const forbidden = /\b(DROP|TRUNCATE|ALTER|CREATE)\b/i;
  if (forbidden.test(sql)) return Response.json({ok:false,error:'Operações DDL não permitidas.'},{status:403});
  try {
    const rows = await db.unsafe(sql);
    return Response.json({ok:true,data:Array.isArray(rows)?rows:[]});
  } catch(err:any) {
    return Response.json({ok:false,error:err.message},{status:400});
  }
}
