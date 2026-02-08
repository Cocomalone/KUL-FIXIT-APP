import { queryAll, queryOne } from '../db/helpers';

export interface SearchOptions {
  query: string;
  equipment_id?: number;
  topic_id?: number;
  severity?: string;
  date_from?: string;
  date_to?: string;
  repair_type?: string;
  limit?: number;
  offset?: number;
}

export async function searchEntries(options: SearchOptions) {
  const limit = options.limit || 20;
  const offset = options.offset || 0;

  // If no query text, fall back to filtered listing
  if (!options.query || options.query.trim() === '') {
    return filteredList(options);
  }

  // Use ILIKE-based search (case-insensitive in PostgreSQL)
  return likeSearch(options);
}

async function likeSearch(options: SearchOptions) {
  const limit = options.limit || 20;
  const offset = options.offset || 0;
  const terms = options.query!.trim().split(/\s+/).filter(t => t.length > 0);

  if (terms.length === 0) return { results: [], total: 0 };

  // Build WHERE clause: each term must match at least one field
  let filterWhere = '';
  const params: any[] = [];

  for (const term of terms) {
    const pattern = `%${term}%`;
    filterWhere += ' AND (e.title ILIKE ? OR e.question ILIKE ? OR e.answer ILIKE ? OR e.source ILIKE ?)';
    params.push(pattern, pattern, pattern, pattern);
  }

  if (options.equipment_id) {
    filterWhere += ' AND e.equipment_id = ?';
    params.push(options.equipment_id);
  }
  if (options.topic_id) {
    filterWhere += ' AND e.topic_id = ?';
    params.push(options.topic_id);
  }
  if (options.severity) {
    filterWhere += ' AND e.severity = ?';
    params.push(options.severity);
  }
  if (options.repair_type) {
    filterWhere += ' AND e.repair_type = ?';
    params.push(options.repair_type);
  }
  if (options.date_from) {
    filterWhere += ' AND e.date_reported >= ?';
    params.push(options.date_from);
  }
  if (options.date_to) {
    filterWhere += ' AND e.date_reported <= ?';
    params.push(options.date_to);
  }

  // Count total
  const countParams = [...params];
  const countRow = await queryOne(
    `SELECT COUNT(*) as total FROM entries e WHERE 1=1 ${filterWhere}`,
    countParams
  );
  const total = countRow ? countRow.total : 0;

  // Fetch results
  const resultParams = [...params, limit, offset];
  const rows = await queryAll(`
    SELECT e.*,
      eq.name as equipment_name, eq.model as equipment_model,
      t.name as topic_name, t.color as topic_color,
      0 as rank, '' as snippet,
      (SELECT COUNT(*) FROM occurrence_log o WHERE o.entry_id = e.id) as occurrence_count
    FROM entries e
    LEFT JOIN equipment eq ON e.equipment_id = eq.id
    LEFT JOIN topics t ON e.topic_id = t.id
    WHERE 1=1 ${filterWhere}
    ORDER BY e.updated_at DESC
    LIMIT ? OFFSET ?
  `, resultParams);

  // Attach tags
  for (const row of rows) {
    const tagRows = await queryAll('SELECT tag FROM entry_tags WHERE entry_id = ?', [row.id]);
    row.tags = tagRows.map((t: any) => t.tag);

    // Generate simple snippet by highlighting match
    if (options.query) {
      row.snippet = generateSnippet(row.question || row.answer || row.title || '', options.query);
    }
  }

  return { results: rows, total };
}

async function filteredList(options: SearchOptions) {
  const limit = options.limit || 20;
  const offset = options.offset || 0;

  let where = 'WHERE 1=1';
  const params: any[] = [];

  if (options.equipment_id) {
    where += ' AND e.equipment_id = ?';
    params.push(options.equipment_id);
  }
  if (options.topic_id) {
    where += ' AND e.topic_id = ?';
    params.push(options.topic_id);
  }
  if (options.severity) {
    where += ' AND e.severity = ?';
    params.push(options.severity);
  }
  if (options.date_from) {
    where += ' AND e.date_reported >= ?';
    params.push(options.date_from);
  }
  if (options.date_to) {
    where += ' AND e.date_reported <= ?';
    params.push(options.date_to);
  }

  const countRow = await queryOne(`SELECT COUNT(*) as total FROM entries e ${where}`, [...params]);
  const total = countRow ? countRow.total : 0;

  const rows = await queryAll(`
    SELECT e.*,
      eq.name as equipment_name, eq.model as equipment_model,
      t.name as topic_name, t.color as topic_color,
      0 as rank, '' as snippet,
      (SELECT COUNT(*) FROM occurrence_log o WHERE o.entry_id = e.id) as occurrence_count
    FROM entries e
    LEFT JOIN equipment eq ON e.equipment_id = eq.id
    LEFT JOIN topics t ON e.topic_id = t.id
    ${where}
    ORDER BY e.updated_at DESC
    LIMIT ? OFFSET ?
  `, [...params, limit, offset]);

  // Attach tags
  for (const row of rows) {
    const tagRows = await queryAll('SELECT tag FROM entry_tags WHERE entry_id = ?', [row.id]);
    row.tags = tagRows.map((t: any) => t.tag);
  }

  return { results: rows, total };
}

function generateSnippet(text: string, query: string): string {
  const lower = text.toLowerCase();
  const queryLower = query.toLowerCase();
  const idx = lower.indexOf(queryLower);
  if (idx === -1) {
    return text.slice(0, 150) + (text.length > 150 ? '...' : '');
  }
  const start = Math.max(0, idx - 60);
  const end = Math.min(text.length, idx + query.length + 60);
  let snippet = '';
  if (start > 0) snippet += '...';
  snippet += text.slice(start, end);
  if (end < text.length) snippet += '...';
  return snippet;
}
