import React from 'react';
import { Select } from '../ui/Select';

const DB_FIELDS = [
  { value: '', label: 'Skip this column' },
  { value: 'title', label: 'Title' },
  { value: 'question', label: 'Question / Problem' },
  { value: 'answer', label: 'Answer / Solution' },
  { value: 'equipment', label: 'Equipment Name' },
  { value: 'topic', label: 'Topic' },
  { value: 'repair_type', label: 'Repair Type' },
  { value: 'severity', label: 'Severity' },
  { value: 'source', label: 'Source' },
  { value: 'date_reported', label: 'Date Reported' },
  { value: 'tags', label: 'Tags' },
];

interface ColumnMapperProps {
  columns: string[];
  mapping: Record<string, string>;
  onChange: (mapping: Record<string, string>) => void;
  previewRows: Record<string, string>[];
}

export function ColumnMapper({ columns, mapping, onChange, previewRows }: ColumnMapperProps) {
  const handleChange = (dbField: string, csvColumn: string) => {
    const newMapping = { ...mapping };
    // Remove previous mapping for this db field
    for (const [key, val] of Object.entries(newMapping)) {
      if (val === csvColumn && key !== dbField) {
        delete newMapping[key];
      }
    }
    if (csvColumn) {
      newMapping[dbField] = csvColumn;
    } else {
      delete newMapping[dbField];
    }
    onChange(newMapping);
  };

  // Invert mapping: csvColumn -> dbField for the selects
  const invertedMapping: Record<string, string> = {};
  for (const [dbField, csvCol] of Object.entries(mapping)) {
    invertedMapping[csvCol] = dbField;
  }

  return (
    <div>
      <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
        Map your columns to database fields
      </h3>
      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-5)' }}>
        Match each column from your file to the corresponding field. At minimum, map either Title or Question.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {columns.map((col) => (
          <div
            key={col}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              gap: 'var(--space-4)',
              alignItems: 'center',
              padding: 'var(--space-3) var(--space-4)',
              backgroundColor: 'var(--color-bg-secondary)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div>
              <div style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>{col}</div>
              {previewRows[0] && (
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                  e.g., {previewRows[0][col]}
                </div>
              )}
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth={2}>
              <path d="M5 12h14m-4-4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <select
              value={invertedMapping[col] || ''}
              onChange={(e) => handleChange(e.target.value, col)}
              style={{
                padding: '0.375rem 0.5rem',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-sm)',
                backgroundColor: 'var(--color-surface)',
              }}
            >
              {DB_FIELDS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
