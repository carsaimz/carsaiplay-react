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
  const [topContent, byType, ratingDist, regTrend] = await Promise.all([
    db`SELECT id, title_pt, views FROM contents WHERE status='published' ORDER BY views DESC LIMIT 10`,
    db`SELECT type, COUNT(*) AS count FROM contents WHERE status='published' GROUP BY type ORDER BY count DESC`,
    db`SELECT rating, COUNT(*) AS count FROM ratings GROUP BY rating ORDER BY rating DESC`,
    db`SELECT DATE(created_at) AS date, COUNT(*) AS count FROM users WHERE created_at >= NOW() - INTERVAL '30 days' GROUP BY date ORDER BY date`,
  ]);
  // Calculate percentages
  const totalContent = byType.reduce((a:number,r:any) => a+parseInt(r.count),0);
  const byTypePct = byType.map((r:any) => ({...r, pct: Math.round(parseInt(r.count)/totalContent*100)}));
  const totalRatings = ratingDist.reduce((a:number,r:any) => a+parseInt(r.count),0);
  const ratingDistPct = ratingDist.map((r:any) => ({...r, pct: Math.round(parseInt(r.count)/totalRatings*100)}));
  const maxReg = Math.max(...regTrend.map((r:any)=>parseInt(r.count)),1);
  const regTrendPct = regTrend.map((r:any) => ({...r, pct: Math.round(parseInt(r.count)/maxReg*100)}));
  return Response.json({ok:true,data:{topContent, byType:byTypePct, ratingDist:ratingDistPct, regTrend:regTrendPct}});
}
