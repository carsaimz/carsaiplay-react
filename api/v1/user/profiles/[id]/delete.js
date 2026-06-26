import { getDb } from '../../../../_db.js';
export const config = { runtime: 'edge' };
async function authenticate(req, db) {
  const token = (req.headers.get('Authorization')||'').replace('Bearer ','');
  if (!token) return null;
  const [row] = await db`SELECT u.id FROM users u JOIN user_tokens t ON t.user_id=u.id WHERE t.token=${token} AND t.expires_at>NOW() LIMIT 1`;
  return row?.id || null;
}
export default async function handler(req, {params}) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  const db = getDb();
  const userId = await authenticate(req, db).catch(() => null);
  if (!userId) return Response.json({ ok: false, error: 'Não autenticado.' }, { status: 401 });
  const id = params?.id || new URL(req.url).pathname.split('/').at(-2);
  // Cannot delete primary profile
  const [p] = await db`SELECT is_primary FROM user_profiles WHERE id=${parseInt(id)} AND user_id=${userId} LIMIT 1`;
  if (!p) return Response.json({ ok: false, error: 'Perfil não encontrado.' }, { status: 404 });
  if (p.is_primary) return Response.json({ ok: false, error: 'Não é possível eliminar o perfil principal.' }, { status: 422 });
  await db`DELETE FROM user_profiles WHERE id=${parseInt(id)} AND user_id=${userId} AND is_primary=false`;
  return Response.json({ ok: true });
}
