import React, { useRef, useState } from 'react';

interface FileUploadProps {
  onFile: (file: File) => void;
  accept?: string;
}

export function FileUpload({ onFile, accept = '.csv,.xlsx,.xls' }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${dragging ? 'var(--color-primary)' : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-12) var(--space-8)',
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: dragging ? 'var(--color-primary-light)' : 'var(--color-surface)',
        transition: 'all var(--transition-base)',
      }}
    >
      <input ref={inputRef} type="file" accept={accept} onChange={handleChange} style={{ display: 'none' }} />
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke={dragging ? 'var(--color-primary)' : 'var(--color-text-muted)'}
        strokeWidth={1.5}
        style={{ margin: '0 auto var(--space-4)' }}
      >
        <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0 0l-4-4m4 4l4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p style={{ fontWeight: 500, color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>
        Drop your file here or click to browse
      </p>
      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
        Supports CSV, XLSX, and XLS files (up to 10MB)
      </p>
    </div>
  );
}
