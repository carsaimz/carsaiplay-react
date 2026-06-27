export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  const { database_url } = await req.json();
  if (!database_url) return Response.json({ ok: false, error: 'URL em falta.' }, { status: 422 });

  try {
    const { neon } = await import('@neondatabase/serverless');
    const db = neon(database_url);
    await db`SELECT 1`;
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ ok: false, error: String(err.message || 'Erro de ligação.') }, { status: 400 });
  }
}
