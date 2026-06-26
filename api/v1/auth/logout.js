import { getDb } from '../../_db.js';
export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  const db = getDb();
  const token = (req.headers.get('Authorization') || '').replace('Bearer ', '');
  if (token) await db`DELETE FROM user_tokens WHERE token=${token}`.catch(() => {});
  return Response.json({ ok: true });
}
