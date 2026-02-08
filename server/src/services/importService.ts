import { getPool } from '../db/connection';
import fs from 'fs';
import csvParser from 'csv-parser';
import * as XLSX from 'xlsx';
import path from 'path';

export interface ColumnMapping {
  title?: string;
  question?: string;
  answer?: string;
  equipment?: string;
  topic?: string;
  repair_type?: string;
  severity?: string;
  source?: string;
  date_reported?: string;
  tags?: string;
}

export async function parseFile(filePath: string): Promise<{
  columns: string[];
  rows: Record<string, string>[];
  totalRows: number;
  fileName: string;
}> {
  const ext = path.extname(filePath).toLowerCase();
  let rows: Record<string, string>[] = [];

  if (ext === '.csv') {
    rows = await parseCsv(filePath);
  } else if (ext === '.xlsx' || ext === '.xls') {
    rows = parseExcel(filePath);
  } else {
    throw new Error(`Unsupported file format: ${ext}. Use .csv, .xlsx, or .xls`);
  }

  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
  const previewRows = rows.slice(0, 5); // return first 5 for preview

  return {
    columns,
    rows: previewRows,
    totalRows: rows.length,
    fileName: path.basename(filePath),
  };
}

function parseCsv(filePath: string): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    const results: Record<string, string>[] = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row) => results.push(row))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

function parseExcel(filePath: string): Record<string, string>[] {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet, { defval: '' }) as Record<string, string>[];
}

export async function executeImport(
  filePath: string,
  mapping: ColumnMapping
): Promise<{ imported: number; skipped: number; errors: string[] }> {
  const pool = getPool();
  const ext = path.extname(filePath).toLowerCase();

  let rows: Record<string, string>[];
  if (ext === '.csv') {
    rows = await parseCsv(filePath);
  } else {
    rows = parseExcel(filePath);
  }

  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  // Cache for equipment and topic lookups
  const equipmentCache = new Map<string, number>();
  const topicCache = new Map<string, number>();

  // Use a dedicated client for the transaction
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        const title = mapping.title ? (row[mapping.title] || '').trim() : '';
        const question = mapping.question ? (row[mapping.question] || '').trim() : '';
        const answer = mapping.answer ? (row[mapping.answer] || '').trim() : '';

        if (!title && !question) {
          skipped++;
          continue;
        }

        // Resolve equipment
        let equipmentId: number | null = null;
        if (mapping.equipment) {
          const eqName = (row[mapping.equipment] || '').trim();
          if (eqName) {
            if (equipmentCache.has(eqName)) {
              equipmentId = equipmentCache.get(eqName)!;
            } else {
              const eqResult = await client.query('SELECT id FROM equipment WHERE name = $1', [eqName]);
              if (eqResult.rows.length > 0) {
                equipmentId = eqResult.rows[0].id;
              } else {
                const insertResult = await client.query('INSERT INTO equipment (name) VALUES ($1) RETURNING id', [eqName]);
                equipmentId = insertResult.rows[0].id;
              }
              equipmentCache.set(eqName, equipmentId!);
            }
          }
        }

        // Resolve topic
        let topicId: number | null = null;
        if (mapping.topic) {
          const topicName = (row[mapping.topic] || '').trim();
          if (topicName) {
            if (topicCache.has(topicName)) {
              topicId = topicCache.get(topicName)!;
            } else {
              const topicResult = await client.query('SELECT id FROM topics WHERE name = $1', [topicName]);
              if (topicResult.rows.length > 0) {
                topicId = topicResult.rows[0].id;
              } else {
                const insertResult = await client.query('INSERT INTO topics (name) VALUES ($1) RETURNING id', [topicName]);
                topicId = insertResult.rows[0].id;
              }
              topicCache.set(topicName, topicId!);
            }
          }
        }

        const repairType = mapping.repair_type ? (row[mapping.repair_type] || '').trim() : '';
        const severity = mapping.severity ? (row[mapping.severity] || 'medium').trim().toLowerCase() : 'medium';
        const validSeverity = ['low', 'medium', 'high', 'critical'].includes(severity) ? severity : 'medium';
        const source = mapping.source ? (row[mapping.source] || '').trim() : '';
        const dateReported = mapping.date_reported ? (row[mapping.date_reported] || '').trim() : new Date().toISOString().split('T')[0];

        const entryResult = await client.query(
          `INSERT INTO entries (title, question, answer, equipment_id, topic_id, repair_type, severity, source, date_reported)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
          [
            title || question.slice(0, 100),
            question,
            answer,
            equipmentId,
            topicId,
            repairType,
            validSeverity,
            source,
            dateReported,
          ]
        );
        const entryId = entryResult.rows[0].id;

        // Handle tags
        if (mapping.tags) {
          const tagsStr = (row[mapping.tags] || '').trim();
          if (tagsStr) {
            const tags = tagsStr.split(/[,;|]/).map(t => t.trim()).filter(t => t);
            for (const tag of tags) {
              await client.query('INSERT INTO entry_tags (entry_id, tag) VALUES ($1, $2) ON CONFLICT DO NOTHING', [entryId, tag]);
            }
          }
        }

        imported++;
      } catch (err: any) {
        errors.push(`Row ${i + 1}: ${err.message}`);
        skipped++;
      }
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  // Clean up uploaded file
  try {
    fs.unlinkSync(filePath);
  } catch {}

  return { imported, skipped, errors: errors.slice(0, 20) }; // limit error messages
}
