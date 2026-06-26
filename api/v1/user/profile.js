import { getDb } from '../../_db.js';
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

  const formData = await req.formData();
  const name = formData.get('name')?.toString().trim();
  if (!name) return Response.json({ ok: false, error: 'Nome obrigatório.' }, { status: 422 });

  const [user] = await db`
    UPDATE users SET name=${name}, updated_at=NOW()
    WHERE id=${userId}
    RETURNING id, name, email, role, avatar, status, created_at`;

  return Response.json({ ok: true, data: user });
}
