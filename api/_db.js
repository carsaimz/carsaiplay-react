// api/_db.js  — Neon serverless client compartilhado
import { neon } from '@neondatabase/serverless';

let sql;
export function getDb() {
  if (!sql) sql = neon(process.env.DATABASE_URL);
  return sql;
}
