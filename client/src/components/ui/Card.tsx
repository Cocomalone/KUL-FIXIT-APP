import React from 'react';

interface CardProps {
  children: React.ReactNode;
  padding?: string;
  hover?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function Card({ children, padding = 'var(--space-6)', hover, onClick, style }: CardProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding,
        boxShadow: isHovered && hover ? 'var(--shadow-md)' : 'var(--shadow-card)',
        transition: 'box-shadow var(--transition-base), transform var(--transition-base)',
        cursor: onClick ? 'pointer' : 'default',
        transform: isHovered && hover ? 'translateY(-1px)' : 'none',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
