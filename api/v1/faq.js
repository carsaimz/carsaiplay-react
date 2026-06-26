import { getDb } from '../_db.js';
export const config = { runtime: 'edge' };
export default async function handler() {
  const db = getDb();
  const rows = await db`SELECT * FROM faqs WHERE active=true ORDER BY sort_order ASC`;
  return Response.json({ok:true,data:rows});
}
