import { getDb } from '../_db.js';
export const config = { runtime: 'edge' };
export default async function handler() {
  const db = getDb();
  const rows = await db`SELECT * FROM categories ORDER BY name_pt`;
  return Response.json({ ok: true, data: rows });
}
