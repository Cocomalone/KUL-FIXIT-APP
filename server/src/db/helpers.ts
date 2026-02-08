import { getPool } from './connection';

/**
 * Convert SQLite-style ? placeholders to PostgreSQL $1, $2, ... style.
 * This allows all existing SQL strings to work without modification.
 */
function convertPlaceholders(sql: string): string {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

export async function queryAll(sql: string, params: any[] = []): Promise<any[]> {
  const pool = getPool();
  const pgSql = convertPlaceholders(sql);
  const result = await pool.query(pgSql, params);
  return result.rows;
}

export async function queryOne(sql: string, params: any[] = []): Promise<any | null> {
  const rows = await queryAll(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export async function run(sql: string, params: any[] = []): Promise<{ lastId: number; changes: number }> {
  const pool = getPool();
  let pgSql = convertPlaceholders(sql);

  // Auto-append RETURNING id for INSERT statements that don't already have it
  const isInsert = /^\s*INSERT\s/i.test(pgSql);
  const hasReturning = /RETURNING\s/i.test(pgSql);
  if (isInsert && !hasReturning) {
    pgSql += ' RETURNING id';
  }

  const result = await pool.query(pgSql, params);
  const lastId = (result.rows && result.rows.length > 0 && result.rows[0].id !== undefined)
    ? result.rows[0].id
    : 0;
  const changes = result.rowCount || 0;

  return { lastId, changes };
}
