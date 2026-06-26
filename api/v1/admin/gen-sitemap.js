import { getDb } from '../../_db.js';
export const config = { runtime: 'edge' };
async function isAdmin(req, db) {
  const token = (req.headers.get('Authorization')||'').replace('Bearer ','');
  if (!token) return false;
  const [r] = await db`SELECT u.role FROM users u JOIN user_tokens t ON t.user_id=u.id WHERE t.token=${token} AND t.expires_at>NOW() LIMIT 1`;
  return r?.role === 'admin';
}
export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method Not Allowed',{status:405});
  const db = getDb();
  if (!await isAdmin(req,db)) return Response.json({ok:false,error:'Proibido.'},{status:403});
  const [contents, posts] = await Promise.all([
    db`SELECT slug, updated_at FROM contents WHERE status='published'`,
    db`SELECT slug, published_at FROM blog_posts WHERE status='published'`,
  ]);
  const baseUrl = process.env.APP_URL || 'https://carsaiplay.vercel.app';
  const staticRoutes = ['/', '/catalog', '/schedule', '/blog', '/faq', '/dmca', '/about', '/contact', '/terms', '/privacy'];
  const urls = [
    ...staticRoutes.map(p => `<url><loc>${baseUrl}${p}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`),
    ...contents.map((c:any) => `<url><loc>${baseUrl}/content/${c.slug}</loc><lastmod>${new Date(c.updated_at).toISOString().split('T')[0]}</lastmod><priority>0.9</priority></url>`),
    ...posts.map((p:any) => `<url><loc>${baseUrl}/blog/${p.slug}</loc><lastmod>${new Date(p.published_at||Date.now()).toISOString().split('T')[0]}</lastmod><priority>0.7</priority></url>`),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`;
  // Store in settings for the sitemap.xml route to serve
  await db`INSERT INTO settings (key,value,updated_at) VALUES ('sitemap_xml', ${xml}, NOW()) ON CONFLICT (key) DO UPDATE SET value=${xml}, updated_at=NOW()`;
  return Response.json({ok:true, urls: urls.length});
}
