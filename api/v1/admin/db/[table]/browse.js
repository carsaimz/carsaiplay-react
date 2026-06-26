import { getDb } from '../../../../_db.js';
export const config = { runtime: 'edge' };
async function isAdmin(req, db) {
  const token = (req.headers.get('Authorization')||'').replace('Bearer ','');
  if (!token) return false;
  const [r] = await db`SELECT u.role FROM users u JOIN user_tokens t ON t.user_id=u.id WHERE t.token=${token} AND t.expires_at>NOW() LIMIT 1`;
  return r?.role === 'admin';
}
const ALLOWED_TABLES = ['users','contents','categories','content_categories','movies','seasons','episodes','embed_servers','ratings','favorites','watch_history','watch_later','notifications','achievements','user_achievements','blog_posts','blog_categories','schedule','content_requests','pages','settings','ads','follows','user_tokens','user_fcm_tokens','ad_zones','email_queue'];
export default async function handler(req, {params}) {
  const db = getDb();
  if (!await isAdmin(req,db)) return Response.json({ok:false,error:'Proibido.'},{status:403});
  const table = params?.table || new URL(req.url).pathname.split('/').at(-2);
  if (!ALLOWED_TABLES.includes(table)) return Response.json({ok:false,error:'Tabela não permitida.'},{status:403});
  const url = new URL(req.url);
  const page = Math.max(1,parseInt(url.searchParams.get('page')||'1'));
  const limit = 25; const offset=(page-1)*limit;
  const cols = await db`SELECT column_name AS name, data_type FROM information_schema.columns WHERE table_name=${table} AND table_schema='public' ORDER BY ordinal_position`;
  const [total] = await db.unsafe(`SELECT COUNT(*) AS n FROM ${table}`);
  const items = await db.unsafe(`SELECT * FROM ${table} ORDER BY 1 DESC LIMIT ${limit} OFFSET ${offset}`);
  return Response.json({ok:true,cols,pag:{items,total:parseInt(total.n),page,last:Math.ceil(total.n/limit)}});
}
