import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUpload } from './FileUpload';
import { ColumnMapper } from './ColumnMapper';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Header } from '../layout/Header';
import * as api from '../../services/api';

type Step = 'upload' | 'map' | 'result';

export function ImportWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('upload');
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');

  // Upload state
  const [preview, setPreview] = useState<any>(null);

  // Mapping state
  const [mapping, setMapping] = useState<Record<string, string>>({});

  // Result state
  const [result, setResult] = useState<any>(null);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setError('');
    try {
      const data = await api.uploadFile(file);
      setPreview(data);
      // Auto-guess mapping based on column names
      const guessedMapping: Record<string, string> = {};
      const lower = data.columns.map((c: string) => c.toLowerCase());
      const guesses: [string, string[]][] = [
        ['title', ['title', 'name', 'subject', 'issue']],
        ['question', ['question', 'problem', 'description', 'symptom', 'symptoms']],
        ['answer', ['answer', 'solution', 'resolution', 'fix', 'remedy']],
        ['equipment', ['equipment', 'machine', 'device', 'asset']],
        ['topic', ['topic', 'category', 'type', 'area']],
        ['severity', ['severity', 'priority', 'level']],
        ['source', ['source', 'origin', 'reference', 'manual']],
        ['date_reported', ['date', 'date_reported', 'reported', 'created']],
        ['tags', ['tags', 'keywords', 'labels']],
      ];
      for (const [field, keywords] of guesses) {
        const idx = lower.findIndex((c: string) => keywords.some((k) => c.includes(k)));
        if (idx !== -1) {
          guessedMapping[field] = data.columns[idx];
        }
      }
      setMapping(guessedMapping);
      setStep('map');
    } catch (err: any) {
      setError(err.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleExecuteImport = async () => {
    if (!mapping.title && !mapping.question) {
      setError('You must map at least the Title or Question column.');
      return;
    }
    setImporting(true);
    setError('');
    try {
      const data = await api.executeImport(preview.filePath, mapping);
      setResult(data);
      setStep('result');
    } catch (err: any) {
      setError(err.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const stepLabels = ['Upload File', 'Map Columns', 'Results'];
  const currentIdx = step === 'upload' ? 0 : step === 'map' ? 1 : 2;

  return (
    <div>
      <Header
        title="Import Data"
        subtitle="Bulk import troubleshooting entries from CSV or Excel files"
      />

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-8)' }}>
        {stepLabels.map((label, i) => (
          <div
            key={label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 'var(--radius-full)',
                backgroundColor: i <= currentIdx ? 'var(--color-primary)' : 'var(--color-border)',
                color: i <= currentIdx ? '#fff' : 'var(--color-text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
              }}
            >
              {i < currentIdx ? '\u2713' : i + 1}
            </div>
            <span
              style={{
                fontSize: 'var(--font-size-sm)',
                fontWeight: i === currentIdx ? 600 : 400,
                color: i === currentIdx ? 'var(--color-text)' : 'var(--color-text-muted)',
              }}
            >
              {label}
            </span>
            {i < 2 && (
              <div style={{ width: 32, height: 1, backgroundColor: 'var(--color-border)', margin: '0 var(--space-2)' }} />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div
          style={{
            padding: 'var(--space-3) var(--space-4)',
            backgroundColor: 'var(--color-danger-light)',
            color: '#991B1B',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-sm)',
            marginBottom: 'var(--space-5)',
          }}
        >
          {error}
        </div>
      )}

      {/* Step: Upload */}
      {step === 'upload' && (
        <div>
          <FileUpload onFile={handleFileUpload} />
          {uploading && (
            <p style={{ textAlign: 'center', marginTop: 'var(--space-4)', color: 'var(--color-text-muted)' }}>
              Uploading and parsing file...
            </p>
          )}
        </div>
      )}

      {/* Step: Map */}
      {step === 'map' && preview && (
        <div>
          <Card style={{ marginBottom: 'var(--space-5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>
                File: {preview.fileName}
              </span>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                {preview.totalRows} rows found
              </span>
            </div>
          </Card>

          <Card>
            <ColumnMapper
              columns={preview.columns}
              mapping={mapping}
              onChange={setMapping}
              previewRows={preview.rows}
            />
          </Card>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-6)' }}>
            <Button variant="secondary" onClick={() => { setStep('upload'); setPreview(null); }}>
              Back
            </Button>
            <Button onClick={handleExecuteImport} disabled={importing}>
              {importing ? 'Importing...' : `Import ${preview.totalRows} Rows`}
            </Button>
          </div>
        </div>
      )}

      {/* Step: Result */}
      {step === 'result' && result && (
        <Card>
          <div style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-success-light)',
                color: 'var(--color-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--space-4)',
                fontSize: '1.5rem',
              }}
            >
              {'\u2713'}
            </div>
            <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
              Import Complete
            </h3>
            <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-5)' }}>
              {result.imported} entries imported{result.skipped > 0 ? `, ${result.skipped} skipped` : ''}
            </p>

            {result.errors.length > 0 && (
              <div
                style={{
                  textAlign: 'left',
                  padding: 'var(--space-4)',
                  backgroundColor: 'var(--color-warning-light)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 'var(--space-5)',
                }}
              >
                <p style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-2)' }}>
                  Warnings:
                </p>
                {result.errors.map((err: string, i: number) => (
                  <p key={i} style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{err}</p>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-3)' }}>
              <Button variant="secondary" onClick={() => { setStep('upload'); setPreview(null); setResult(null); setMapping({}); }}>
                Import More
              </Button>
              <Button onClick={() => navigate('/browse')}>
                Browse Entries
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
