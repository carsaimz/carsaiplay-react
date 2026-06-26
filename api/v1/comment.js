import { getDb } from '../_db.js';
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
  const {content_id, body, parent_id} = await req.json();
  if (!content_id || !body?.trim()) return Response.json({ok:false,error:'Campos obrigatórios.'},{status:422});
  // Check moderation setting
  const [setting] = await db`SELECT value FROM settings WHERE key='comment_moderation' LIMIT 1`;
  const needsApproval = setting?.value === 'true';
  const [row] = await db`INSERT INTO comments (user_id, content_id, body, parent_id, approved, created_at) VALUES (${userId}, ${content_id}, ${body.trim()}, ${parent_id||null}, ${needsApproval ? 0 : 1}, NOW()) RETURNING *`;
  return Response.json({ok:true,data:row},{status:201});
}
