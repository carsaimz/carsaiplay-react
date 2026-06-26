import { getDb } from '../../_db.js';
import { randomBytes } from 'crypto';
export const config = { runtime: 'edge' };

// Verifica o ID token do Firebase usando a REST API pública
async function verifyFirebaseToken(idToken) {
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.FIREBASE_API_KEY}`;
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken }) });
  const data = await r.json();
  if (data.error) throw new Error('Token Firebase inválido');
  return data.users?.[0];
}

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  const { id_token, provider } = await req.json();
  if (!id_token) return Response.json({ ok: false, error: 'Token obrigatório.' }, { status: 422 });

  const db = getDb();
  try {
    const firebaseUser = await verifyFirebaseToken(id_token);
    const email = firebaseUser.email;
    const name  = firebaseUser.displayName || email.split('@')[0];
    const avatar= firebaseUser.photoUrl || '';

    // Upsert user
    let [user] = await db`SELECT * FROM users WHERE email=${email} LIMIT 1`;
    if (!user) {
      [user] = await db`
        INSERT INTO users (name, email, password, role, status, avatar, created_at, updated_at)
        VALUES (${name}, ${email}, '', 'user', 'active', ${avatar}, NOW(), NOW())
        RETURNING id, name, email, role, avatar, status, created_at`;
    } else {
      [user] = await db`
        UPDATE users SET name=${name}, avatar=${avatar}, updated_at=NOW()
        WHERE id=${user.id}
        RETURNING id, name, email, role, avatar, status, created_at`;
    }

    // Token
    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 30 * 24 * 3600 * 1000);
    await db`INSERT INTO user_tokens (user_id, token, expires_at) VALUES (${user.id}, ${token}, ${expires})`;

    const { password: _, ...safeUser } = user;
    return Response.json({ ok: true, data: { token, user: safeUser } });
  } catch (err) {
    return Response.json({ ok: false, error: err.message }, { status: 401 });
  }
}
