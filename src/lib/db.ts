// src/lib/db.ts
import 'server-only';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL || 'postgresql://ankith@localhost:5432/crystal';

const globalForDb = globalThis as unknown as {
  sql: ReturnType<typeof postgres> | undefined;
};

export const sql = globalForDb.sql ?? postgres(connectionString);

if (process.env.NODE_ENV !== 'production') {
  globalForDb.sql = sql;
}