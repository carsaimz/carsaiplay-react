import { getDb } from '../../_db.js';
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
  const {profile_id, pin} = await req.json();
  const [profile] = await db`SELECT * FROM user_profiles WHERE id=${profile_id} AND user_id=${userId} LIMIT 1`;
  if (!profile) return Response.json({ok:false,error:'Perfil não encontrado.'},{status:404});
  if (profile.pin_hash) {
    const {createHash} = await import('crypto');
    const hash = createHash('sha256').update(pin||'').digest('hex');
    if (hash !== profile.pin_hash) return Response.json({ok:false,error:'PIN incorrecto.'},{status:401});
  }
  await db`UPDATE user_tokens SET active_profile_id=${profile_id} WHERE user_id=${userId} AND expires_at > NOW()`;
  return Response.json({ok:true,data:{profile_id,profile_name:profile.profile_name}});
}
