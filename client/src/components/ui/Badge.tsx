import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  bg?: string;
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}

export function Badge({ children, color, bg, size = 'sm', style }: BadgeProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: size === 'sm' ? '0.125rem 0.5rem' : '0.25rem 0.625rem',
        borderRadius: 'var(--radius-full)',
        fontSize: size === 'sm' ? 'var(--font-size-xs)' : 'var(--font-size-sm)',
        fontWeight: 500,
        color: color || 'var(--color-text-secondary)',
        backgroundColor: bg || 'var(--color-bg-secondary)',
        whiteSpace: 'nowrap',
        lineHeight: 1.4,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: string }) {
  const config: Record<string, { color: string; bg: string }> = {
    low: { color: '#34D399', bg: 'var(--color-success-light)' },
    medium: { color: '#FBBF24', bg: 'var(--color-warning-light)' },
    high: { color: '#FB923C', bg: 'rgba(249, 115, 22, 0.15)' },
    critical: { color: '#F87171', bg: 'var(--color-danger-light)' },
  };
  const c = config[severity] || config.medium;
  return <Badge color={c.color} bg={c.bg}>{severity}</Badge>;
}

export function FrequencyBadge({ count }: { count: number }) {
  if (count < 5) return null;
  const level = count >= 20 ? 'hot' : count >= 10 ? 'warm' : 'mild';
  const config = {
    hot: { color: '#fff', bg: 'var(--freq-hot)', label: 'Frequent' },
    warm: { color: '#fff', bg: 'var(--freq-warm)', label: 'Recurring' },
    mild: { color: '#FBBF24', bg: 'var(--color-warning-light)', label: 'Watch' },
  };
  const c = config[level];
  return (
    <Badge color={c.color} bg={c.bg}>
      {c.label} ({count})
    </Badge>
  );
}
