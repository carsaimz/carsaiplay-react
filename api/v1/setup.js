import { createHash } from 'crypto';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  const { app_name, app_description, app_country, admin_name, admin_email, admin_password, database_url, app_secret } = await req.json();

  if (!admin_email || !admin_password || !database_url || !app_secret)
    return Response.json({ ok: false, error: 'Campos obrigatórios em falta.' }, { status: 422 });

  // Usar database_url da requisição OU a variável de ambiente
  const dbUrl = database_url || process.env.DATABASE_URL;
  if (!dbUrl) return Response.json({ ok: false, error: 'DATABASE_URL não configurada.' }, { status: 500 });

  try {
    const { neon } = await import('@neondatabase/serverless');
    const db = neon(dbUrl);

    // Verificar se já foi instalado
    const tables = await db`
      SELECT COUNT(*) AS n FROM information_schema.tables
      WHERE table_schema='public' AND table_name='users'`;
    const alreadyHasTables = parseInt(tables[0]?.n || '0') > 0;

    if (!alreadyHasTables) {
      return Response.json({
        ok: false,
        error: 'Schema da BD não encontrado. Executa database/schema.sql e database/schema_additions.sql no Neon Console primeiro.'
      }, { status: 400 });
    }

    // Verificar se já existe admin
    const [existingAdmin] = await db`SELECT id FROM users WHERE role='admin' LIMIT 1`;
    if (existingAdmin) {
      return Response.json({ ok: false, error: 'Já existe um administrador. Setup já foi realizado.' }, { status: 409 });
    }

    // Criar admin
    const passwordHash = createHash('sha256').update(admin_password + app_secret).digest('hex');
    await db`
      INSERT INTO users (name, email, password, role, status, avatar, created_at, updated_at)
      VALUES (${admin_name || 'Admin'}, ${admin_email}, ${passwordHash}, 'admin', 'active', '', NOW(), NOW())`;

    // Guardar settings na BD
    const settingsToSave = [
      ['app_name',        app_name        || 'CarsaiPlay'],
      ['app_description', app_description || 'Filmes, Séries e Animes'],
      ['app_country',     app_country     || 'MZ'],
      ['setup_done',      'true'],
      ['setup_at',        new Date().toISOString()],
    ];
    for (const [key, value] of settingsToSave) {
      await db`INSERT INTO settings (key, value, updated_at) VALUES (${key}, ${value}, NOW()) ON CONFLICT (key) DO UPDATE SET value=${value}, updated_at=NOW()`;
    }

    // Criar perfil principal para o admin
    const [adminUser] = await db`SELECT id FROM users WHERE email=${admin_email} LIMIT 1`;
    if (adminUser) {
      await db`
        INSERT INTO user_profiles (user_id, profile_name, avatar_icon, is_primary, created_at)
        VALUES (${adminUser.id}, ${admin_name || 'Admin'}, 'user-shield', true, NOW())
        ON CONFLICT DO NOTHING`;
    }

    return Response.json({ ok: true, message: 'CarsaiPlay instalado com sucesso!' });
  } catch (err) {
    return Response.json({ ok: false, error: String(err.message || err) }, { status: 500 });
  }
}
