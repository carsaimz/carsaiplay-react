// Cliente Neon — só instanciado em runtime (Edge Function), nunca no build do Vite
import { neon } from '@neondatabase/serverless';

let _sql = null;

export function getDb() {
  if (!_sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL não configurada. Usa o instalador para configurar a base de dados.');
    _sql = neon(url);
  }
  return _sql;
}
