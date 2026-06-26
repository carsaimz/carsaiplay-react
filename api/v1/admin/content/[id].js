import { getDb } from '../../../_db.js';
export const config = { runtime: 'edge' };
async function isAdmin(req, db) {
  const token = (req.headers.get('Authorization')||'').replace('Bearer ','');
  if (!token) return false;
  const [r] = await db`SELECT u.role FROM users u JOIN user_tokens t ON t.user_id=u.id WHERE t.token=${token} AND t.expires_at>NOW() LIMIT 1`;
  return r?.role === 'admin';
}
export default async function handler(req, {params}) {
  const db = getDb();
  if (!await isAdmin(req, db)) return Response.json({ ok: false, error: 'Proibido.' }, { status: 403 });
  const id = params?.id || new URL(req.url).pathname.split('/').at(-1);

  if (req.method === 'GET') {
    const [content] = await db`SELECT c.* FROM contents c WHERE c.id=${parseInt(id)} LIMIT 1`;
    if (!content) return Response.json({ ok: false, error: 'Not found' }, { status: 404 });
    const categories = await db`SELECT cat.* FROM categories cat JOIN content_categories cc ON cc.category_id=cat.id WHERE cc.content_id=${content.id}`;
    const [movie] = await db`SELECT * FROM movies WHERE content_id=${content.id} LIMIT 1`;
    return Response.json({ ok: true, data: { ...content, categories, movie } });
  }

  if (req.method === 'DELETE') {
    await db`DELETE FROM contents WHERE id=${parseInt(id)}`;
    return Response.json({ ok: true });
  }
  return new Response('Method Not Allowed', { status: 405 });
}
