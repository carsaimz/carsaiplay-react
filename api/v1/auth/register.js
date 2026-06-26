import { getDb } from '../../_db.js';
import { createHash } from 'crypto';
export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  const { name, email, password } = await req.json();
  if (!name || !email || !password) return Response.json({ ok: false, error: 'Campos obrigatórios.' }, { status: 422 });

  const db = getDb();
  try {
    const [exists] = await db`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
    if (exists) return Response.json({ ok: false, error: 'Email já registado.' }, { status: 409 });

    const hashed = createHash('sha256').update(password + process.env.APP_SECRET).digest('hex');
    const [user] = await db`
      INSERT INTO users (name, email, password, role, status, avatar, created_at)
      VALUES (${name}, ${email}, ${hashed}, 'user', 'active', '', NOW())
      RETURNING id, name, email, role, avatar, status, created_at`;

    return Response.json({ ok: true, data: user }, { status: 201 });
  } catch (err) {
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}
