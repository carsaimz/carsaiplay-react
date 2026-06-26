import { getDb } from '../../_db.js';
import { createHash } from 'crypto';
export const config = { runtime: 'edge' };
async function authenticate(req, db) {
  const token = (req.headers.get('Authorization')||'').replace('Bearer ','');
  if (!token) return null;
  const [row] = await db`SELECT u.id, u.password FROM users u JOIN user_tokens t ON t.user_id=u.id WHERE t.token=${token} AND t.expires_at>NOW() LIMIT 1`;
  return row || null;
}
export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  const db = getDb();
  const user = await authenticate(req, db).catch(() => null);
  if (!user) return Response.json({ ok: false, error: 'Não autenticado.' }, { status: 401 });
  const { current_password, new_password } = await req.json();
  if (!current_password || !new_password || new_password.length < 8)
    return Response.json({ ok: false, error: 'Dados inválidos.' }, { status: 422 });
  const currentHash = createHash('sha256').update(current_password + process.env.APP_SECRET).digest('hex');
  if (currentHash !== user.password)
    return Response.json({ ok: false, error: 'Palavra-passe actual incorrecta.' }, { status: 401 });
  const newHash = createHash('sha256').update(new_password + process.env.APP_SECRET).digest('hex');
  await db`UPDATE users SET password=${newHash}, updated_at=NOW() WHERE id=${user.id}`;
  return Response.json({ ok: true });
}
