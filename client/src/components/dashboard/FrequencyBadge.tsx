import React from 'react';

interface TrendIndicatorProps {
  trend: 'rising' | 'falling' | 'stable';
}

export function TrendIndicator({ trend }: TrendIndicatorProps) {
  const config = {
    rising: { color: 'var(--color-danger)', symbol: '\u2191', label: 'Rising' },
    falling: { color: 'var(--color-success)', symbol: '\u2193', label: 'Falling' },
    stable: { color: 'var(--color-text-muted)', symbol: '\u2192', label: 'Stable' },
  };
  const c = config[trend];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        fontSize: 'var(--font-size-xs)',
        fontWeight: 500,
        color: c.color,
      }}
    >
      {c.symbol} {c.label}
    </span>
  );
}
