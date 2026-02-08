import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--font-size-base)',
  color: 'var(--color-text)',
  backgroundColor: 'var(--color-surface)',
  outline: 'none',
  transition: 'border-color var(--transition-fast)',
};

export function Input({ label, error, style, ...props }: InputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      {label && (
        <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
          {label}
        </label>
      )}
      <input
        style={{
          ...inputStyle,
          ...(error ? { borderColor: 'var(--color-danger)' } : {}),
          ...style,
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--color-primary)';
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? 'var(--color-danger)' : 'var(--color-border)';
          props.onBlur?.(e);
        }}
        {...props}
      />
      {error && <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-danger)' }}>{error}</span>}
    </div>
  );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function TextArea({ label, error, style, ...props }: TextAreaProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      {label && (
        <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
          {label}
        </label>
      )}
      <textarea
        style={{
          ...inputStyle,
          minHeight: '100px',
          resize: 'vertical',
          ...(error ? { borderColor: 'var(--color-danger)' } : {}),
          ...style,
        }}
        onFocus={(e) => { e.target.style.borderColor = 'var(--color-primary)'; }}
        onBlur={(e) => { e.target.style.borderColor = error ? 'var(--color-danger)' : 'var(--color-border)'; }}
        {...props}
      />
      {error && <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-danger)' }}>{error}</span>}
    </div>
  );
}
