import { getDb } from '../_db.js';
export const config = { runtime: 'edge' };
export default async function handler() {
  const db = getDb();
  const [row] = await db`SELECT * FROM pages WHERE slug='dmca' LIMIT 1`;
  return Response.json({ok:true,data:row||null});
}
