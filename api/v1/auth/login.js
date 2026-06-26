import { getDb } from '../../_db.js';
import { createHash, randomBytes } from 'crypto';
export const config = { runtime: 'edge' };

function hashPassword(password) {
  return createHash('sha256').update(password + process.env.APP_SECRET).digest('hex');
}

function generateToken() {
  return randomBytes(32).toString('hex');
}

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  const { email, password } = await req.json();

  if (!email || !password) return Response.json({ ok: false, error: 'Campos obrigatórios.' }, { status: 422 });

  const db = getDb();
  try {
    const [user] = await db`SELECT * FROM users WHERE email = ${email} AND status = 'active' LIMIT 1`;
    if (!user || user.password !== hashPassword(password))
      return Response.json({ ok: false, error: 'Credenciais inválidas.' }, { status: 401 });

    const token = generateToken();
    const expires = new Date(Date.now() + 30 * 24 * 3600 * 1000); // 30 days
    await db`INSERT INTO user_tokens (user_id, token, expires_at) VALUES (${user.id}, ${token}, ${expires})`;

    const { password: _, ...safeUser } = user;
    return Response.json({ ok: true, data: { token, user: safeUser } });
  } catch (err) {
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}
