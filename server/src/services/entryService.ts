import { queryAll, queryOne, run } from '../db/helpers';

export interface CreateEntryInput {
  title: string;
  question: string;
  answer: string;
  equipment_id?: number | null;
  topic_id?: number | null;
  repair_type?: string;
  severity?: string;
  source?: string;
  date_reported?: string;
  date_resolved?: string | null;
  tags?: string[];
}

export async function getAllEntries(options: {
  page?: number;
  limit?: number;
  equipment_id?: number;
  topic_id?: number;
  severity?: string;
  repair_type?: string;
  sort_by?: string;
  sort_order?: string;
}) {
  const page = options.page || 1;
  const limit = options.limit || 20;
  const offset = (page - 1) * limit;

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
  if (options.repair_type) {
    where += ' AND e.repair_type = ?';
    params.push(options.repair_type);
  }

  const sortColumn = options.sort_by || 'e.updated_at';
  const sortOrder = options.sort_order === 'asc' ? 'ASC' : 'DESC';

  const countRow = await queryOne(`SELECT COUNT(*) as total FROM entries e ${where}`, params);
  const total = countRow?.total || 0;

  const rows = await queryAll(`
    SELECT e.*,
      eq.name as equipment_name, eq.model as equipment_model,
      t.name as topic_name, t.color as topic_color,
      (SELECT COUNT(*) FROM occurrence_log o WHERE o.entry_id = e.id) as occurrence_count
    FROM entries e
    LEFT JOIN equipment eq ON e.equipment_id = eq.id
    LEFT JOIN topics t ON e.topic_id = t.id
    ${where}
    ORDER BY ${sortColumn} ${sortOrder}
    LIMIT ? OFFSET ?
  `, [...params, limit, offset]);

  for (const row of rows) {
    row.tags = (await queryAll('SELECT tag FROM entry_tags WHERE entry_id = ?', [row.id])).map((t: any) => t.tag);
  }

  return { entries: rows, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getEntryById(id: number) {
  const entry = await queryOne(`
    SELECT e.*,
      eq.name as equipment_name, eq.model as equipment_model, eq.manufacturer as equipment_manufacturer,
      t.name as topic_name, t.color as topic_color,
      (SELECT COUNT(*) FROM occurrence_log o WHERE o.entry_id = e.id) as occurrence_count
    FROM entries e
    LEFT JOIN equipment eq ON e.equipment_id = eq.id
    LEFT JOIN topics t ON e.topic_id = t.id
    WHERE e.id = ?
  `, [id]);

  if (!entry) return null;

  entry.tags = (await queryAll('SELECT tag FROM entry_tags WHERE entry_id = ?', [id])).map((t: any) => t.tag);
  entry.occurrences = await queryAll('SELECT * FROM occurrence_log WHERE entry_id = ? ORDER BY occurred_at DESC', [id]);

  return entry;
}

export async function createEntry(input: CreateEntryInput) {
  const result = await run(`
    INSERT INTO entries (title, question, answer, equipment_id, topic_id, repair_type, severity, source, date_reported, date_resolved)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    input.title, input.question, input.answer,
    input.equipment_id || null, input.topic_id || null,
    input.repair_type || '', input.severity || 'medium', input.source || '',
    input.date_reported || new Date().toISOString().split('T')[0],
    input.date_resolved || null
  ]);

  if (input.tags && input.tags.length > 0) {
    for (const tag of input.tags) {
      await run('INSERT INTO entry_tags (entry_id, tag) VALUES (?, ?) ON CONFLICT DO NOTHING', [result.lastId, tag.trim()]);
    }
  }

  return getEntryById(result.lastId);
}

export async function updateEntry(id: number, input: Partial<CreateEntryInput>) {
  const existing = await getEntryById(id);
  if (!existing) return null;

  await run(`
    UPDATE entries SET
      title = ?, question = ?, answer = ?,
      equipment_id = ?, topic_id = ?,
      repair_type = ?, severity = ?, source = ?,
      date_reported = ?, date_resolved = ?,
      updated_at = NOW()
    WHERE id = ?
  `, [
    input.title ?? existing.title, input.question ?? existing.question, input.answer ?? existing.answer,
    input.equipment_id !== undefined ? input.equipment_id : existing.equipment_id,
    input.topic_id !== undefined ? input.topic_id : existing.topic_id,
    input.repair_type ?? existing.repair_type, input.severity ?? existing.severity,
    input.source ?? existing.source, input.date_reported ?? existing.date_reported,
    input.date_resolved !== undefined ? input.date_resolved : existing.date_resolved, id
  ]);

  if (input.tags !== undefined) {
    await run('DELETE FROM entry_tags WHERE entry_id = ?', [id]);
    for (const tag of input.tags) {
      await run('INSERT INTO entry_tags (entry_id, tag) VALUES (?, ?) ON CONFLICT DO NOTHING', [id, tag.trim()]);
    }
  }

  return getEntryById(id);
}

export async function deleteEntry(id: number) {
  const result = await run('DELETE FROM entries WHERE id = ?', [id]);
  return result.changes > 0;
}

export async function logOccurrence(entryId: number, reportedBy: string, notes: string) {
  const entry = await queryOne('SELECT id FROM entries WHERE id = ?', [entryId]);
  if (!entry) return null;

  const result = await run('INSERT INTO occurrence_log (entry_id, reported_by, notes) VALUES (?, ?, ?)', [entryId, reportedBy, notes]);

  return { id: result.lastId, entry_id: entryId, occurred_at: new Date().toISOString(), reported_by: reportedBy, notes };
}
