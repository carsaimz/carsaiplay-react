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
  const { title, type, year, link, message } = await req.json();
  if (!title) return Response.json({ ok: false, error: 'Título obrigatório.' }, { status: 422 });

  const [row] = await db`
    INSERT INTO content_requests (user_id, title, type, year, link, message, created_at)
    VALUES (${userId}, ${title}, ${type}, ${year}, ${link}, ${message}, NOW())
    RETURNING id`;
  return Response.json({ ok: true, data: row }, { status: 201 });
}
