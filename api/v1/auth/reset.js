import { getDb } from '../../_db.js';
import { createHash } from 'crypto';
export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  const { token, password } = await req.json();
  if (!token || !password) return Response.json({ ok: false, error: 'Dados inválidos.' }, { status: 422 });

  const db = getDb();
  const [row] = await db`
    SELECT user_id FROM user_tokens
    WHERE token=${'reset_' + token} AND expires_at > NOW() LIMIT 1`;
  if (!row) return Response.json({ ok: false, error: 'Link inválido ou expirado.' }, { status: 400 });

  const hashed = createHash('sha256').update(password + process.env.APP_SECRET).digest('hex');
  await db`UPDATE users SET password=${hashed}, updated_at=NOW() WHERE id=${row.user_id}`;
  await db`DELETE FROM user_tokens WHERE token=${'reset_' + token}`;

  return Response.json({ ok: true });
}
