import { getDb } from '../../_db.js';
export const config = { runtime: 'edge' };

async function isAdmin(req, db) {
  const token = (req.headers.get('Authorization') || '').replace('Bearer ', '');
  if (!token) return false;
  const [row] = await db`SELECT u.role FROM users u JOIN user_tokens t ON t.user_id=u.id WHERE t.token=${token} AND t.expires_at>NOW() LIMIT 1`;
  return row?.role === 'admin';
}

export default async function handler(req) {
  const db = getDb();
  if (!await isAdmin(req, db)) return Response.json({ ok: false, error: 'Proibido.' }, { status: 403 });

  const url    = new URL(req.url);
  const page   = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const limit  = 20;
  const offset = (page - 1) * limit;

  if (req.method === 'GET') {
    const [rows, [count]] = await Promise.all([
      db`SELECT c.*, COUNT(DISTINCT r.id) AS rating_count FROM contents c LEFT JOIN ratings r ON r.content_id=c.id GROUP BY c.id ORDER BY c.created_at DESC LIMIT ${limit} OFFSET ${offset}`,
      db`SELECT COUNT(*) AS n FROM contents`,
    ]);
    return Response.json({ ok: true, data: rows, meta: { total: parseInt(count.n), page, last_page: Math.ceil(count.n / limit) } });
  }

  if (req.method === 'POST') {
    const body = await req.json();
    const [row] = await db`
      INSERT INTO contents (slug,title_pt,title_en,original_title,type,description_pt,description_en,
                            release_year,duration,age_rating,poster_url,banner_url,trailer_url,
                            featured,status,created_at,updated_at)
      VALUES (${body.slug},${body.title_pt},${body.title_en},${body.original_title},${body.type},
              ${body.description_pt},${body.description_en},${body.release_year},${body.duration},
              ${body.age_rating||'L'},${body.poster_url},${body.banner_url},${body.trailer_url},
              ${body.featured||false},${body.status||'draft'},NOW(),NOW())
      RETURNING *`;
    return Response.json({ ok: true, data: row }, { status: 201 });
  }

  if (req.method === 'PUT') {
    const body = await req.json();
    const [row] = await db`
      UPDATE contents SET title_pt=${body.title_pt},title_en=${body.title_en},description_pt=${body.description_pt},
        description_en=${body.description_en},type=${body.type},release_year=${body.release_year},
        duration=${body.duration},age_rating=${body.age_rating},poster_url=${body.poster_url},
        banner_url=${body.banner_url},trailer_url=${body.trailer_url},featured=${body.featured},
        status=${body.status},updated_at=NOW()
      WHERE id=${body.id} RETURNING *`;
    return Response.json({ ok: true, data: row });
  }

  if (req.method === 'DELETE') {
    const { id } = await req.json();
    await db`DELETE FROM contents WHERE id=${id}`;
    return Response.json({ ok: true });
  }

  return new Response('Method Not Allowed', { status: 405 });
}
