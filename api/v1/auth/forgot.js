import { getDb } from '../../_db.js';
import { randomBytes } from 'crypto';
export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  const { email } = await req.json();
  if (!email) return Response.json({ ok: false, error: 'Email obrigatório.' }, { status: 422 });

  const db = getDb();
  const [user] = await db`SELECT id FROM users WHERE email=${email} AND status='active' LIMIT 1`;
  // Always return ok to prevent email enumeration
  if (!user) return Response.json({ ok: true });

  const token   = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 2 * 3600 * 1000); // 2h
  await db`
    INSERT INTO user_tokens (user_id, token, expires_at)
    VALUES (${user.id}, ${'reset_' + token}, ${expires})
    ON CONFLICT DO NOTHING`;

  // TODO: send email with reset link
  // await sendEmail(email, `${process.env.APP_URL}/reset-password?token=${token}`)
  console.log(`Reset token for ${email}: ${token}`);

  return Response.json({ ok: true });
}
