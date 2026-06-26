import { getDb } from '../../../_db.js';
import { createHash } from 'crypto';
export const config = { runtime: 'edge' };
async function authenticate(req, db) {
  const token = (req.headers.get('Authorization')||'').replace('Bearer ','');
  if (!token) return null;
  const [row] = await db`SELECT u.id FROM users u JOIN user_tokens t ON t.user_id=u.id WHERE t.token=${token} AND t.expires_at>NOW() LIMIT 1`;
  return row?.id || null;
}
export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method Not Allowed',{status:405});
  const db = getDb();
  const userId = await authenticate(req,db).catch(()=>null);
  if (!userId) return Response.json({ok:false,error:'Não autenticado.'},{status:401});
  const [count] = await db`SELECT COUNT(*) AS n FROM user_profiles WHERE user_id=${userId}`;
  if (parseInt(count.n) >= 5) return Response.json({ok:false,error:'Máximo de 5 perfis atingido.'},{status:422});
  const {name, icon='user', pin='', age_limit=18} = await req.json();
  if (!name) return Response.json({ok:false,error:'Nome obrigatório.'},{status:422});
  const pinHash = pin ? createHash('sha256').update(pin).digest('hex') : null;
  const [row] = await db`INSERT INTO user_profiles (user_id, profile_name, avatar_icon, pin_hash, age_limit, is_primary, created_at) VALUES (${userId}, ${name}, ${icon}, ${pinHash}, ${age_limit}, false, NOW()) RETURNING id, profile_name, avatar_icon, age_limit, is_primary`;
  return Response.json({ok:true,data:row},{status:201});
}
