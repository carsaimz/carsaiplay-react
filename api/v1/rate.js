import { getDb } from '../_db.js';
export const config = { runtime: 'edge' };

async function authenticate(req, db) {
  const token = (req.headers.get('Authorization') || '').replace('Bearer ', '');
  if (!token) return null;
  const [row] = await db`SELECT u.id FROM users u JOIN user_tokens t ON t.user_id=u.id WHERE t.token=${token} AND t.expires_at>NOW() LIMIT 1`;
  return row?.id || null;
}

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  const db = getDb();
  const userId = await authenticate(req, db).catch(() => null);
  if (!userId) return Response.json({ ok: false, error: 'Não autenticado.' }, { status: 401 });

  const { content_id, rating } = await req.json();
  if (!content_id || !rating || rating < 1 || rating > 5)
    return Response.json({ ok: false, error: 'Dados inválidos.' }, { status: 422 });

  await db`
    INSERT INTO ratings (user_id, content_id, rating, created_at)
    VALUES (${userId}, ${content_id}, ${rating}, NOW())
    ON CONFLICT (user_id, content_id) DO UPDATE SET rating = ${rating}`;

  return Response.json({ ok: true, data: { rating } });
}
