import { getDb } from './_db.js';
export const config = { runtime: 'edge' };
export default async function handler() {
  const db = getDb();
  try {
    const [cached] = await db`SELECT value FROM settings WHERE key='sitemap_xml' LIMIT 1`;
    if (cached?.value) {
      return new Response(cached.value, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=86400' } });
    }
  } catch {}
  // Generate on-the-fly if not cached
  const baseUrl = process.env.APP_URL || 'https://carsaiplay.vercel.app';
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${baseUrl}/</loc><priority>1.0</priority></url><url><loc>${baseUrl}/catalog</loc><priority>0.9</priority></url></urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
