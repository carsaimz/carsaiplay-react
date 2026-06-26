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

  const { content_id } = await req.json();
  const [exists] = await db`SELECT id FROM follows WHERE user_id=${userId} AND content_id=${content_id} LIMIT 1`;
  if (exists) {
    await db`DELETE FROM follows WHERE user_id=${userId} AND content_id=${content_id}`;
    return Response.json({ ok: true, data: { following: false } });
  }
  await db`INSERT INTO follows (user_id, content_id, created_at) VALUES (${userId}, ${content_id}, NOW()) ON CONFLICT DO NOTHING`;
  return Response.json({ ok: true, data: { following: true } });
}
