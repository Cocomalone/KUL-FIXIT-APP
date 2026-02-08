import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const styles: Record<string, React.CSSProperties> = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontWeight: 500,
    transition: 'all var(--transition-fast)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    lineHeight: 1,
  },
  primary: {
    backgroundColor: 'var(--color-primary)',
    color: '#fff',
  },
  secondary: {
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'var(--color-text-secondary)',
  },
  danger: {
    backgroundColor: 'var(--color-danger)',
    color: '#fff',
  },
  sm: { padding: '0.375rem 0.75rem', fontSize: 'var(--font-size-sm)' },
  md: { padding: '0.5rem 1rem', fontSize: 'var(--font-size-sm)' },
  lg: { padding: '0.625rem 1.25rem', fontSize: 'var(--font-size-base)' },
  disabled: { opacity: 0.5, cursor: 'not-allowed' },
};

export function Button({ variant = 'primary', size = 'md', style, disabled, ...props }: ButtonProps) {
  return (
    <button
      style={{
        ...styles.base,
        ...styles[variant],
        ...styles[size],
        ...(disabled ? styles.disabled : {}),
        ...style,
      }}
      disabled={disabled}
      {...props}
    />
  );
}
