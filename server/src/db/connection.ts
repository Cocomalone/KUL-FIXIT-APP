import pg from 'pg';
const { Pool } = pg;
import type { Pool as PoolType } from 'pg';
import { initializeSchema } from './schema';

// Make PostgreSQL return dates and timestamps as strings (like SQLite did)
// instead of JavaScript Date objects
pg.types.setTypeParser(1082, (val: string) => val);  // DATE -> string
pg.types.setTypeParser(1114, (val: string) => val);  // TIMESTAMP -> string
pg.types.setTypeParser(1184, (val: string) => val);  // TIMESTAMPTZ -> string
// Make COUNT/SUM return numbers instead of strings (bigint -> int)
pg.types.setTypeParser(20, (val: string) => parseInt(val, 10));  // INT8/BIGINT -> number

let pool: PoolType | null = null;

export async function initDb(): Promise<PoolType> {
  if (pool) return pool;

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : undefined,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  // Test connection
  const client = await pool.connect();
  try {
    await client.query('SELECT NOW()');
  } finally {
    client.release();
  }

  await initializeSchema(pool);
  return pool;
}

export function getPool(): PoolType {
  if (!pool) {
    throw new Error('Database not initialized. Call initDb() first.');
  }
  return pool;
}

export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
