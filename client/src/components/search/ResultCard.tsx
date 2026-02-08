import React from 'react';
import { Card } from '../ui/Card';
import { Badge, SeverityBadge, FrequencyBadge } from '../ui/Badge';

interface ResultCardProps {
  entry: any;
  onClick: () => void;
}

export function ResultCard({ entry, onClick }: ResultCardProps) {
  return (
    <Card hover onClick={onClick}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
          <h3
            style={{
              fontSize: 'var(--font-size-base)',
              fontWeight: 600,
              color: 'var(--color-text)',
              flex: 1,
              lineHeight: 1.4,
            }}
            dangerouslySetInnerHTML={{
              __html: entry.title_snippet || entry.title,
            }}
          />
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexShrink: 0 }}>
            <SeverityBadge severity={entry.severity} />
            <FrequencyBadge count={entry.occurrence_count || 0} />
          </div>
        </div>

        {/* Snippet / Question preview */}
        {(entry.snippet || entry.question) && (
          <p
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.6,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
            dangerouslySetInnerHTML={{
              __html: entry.question_snippet || entry.snippet || entry.question.slice(0, 200),
            }}
          />
        )}

        {/* Meta row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', alignItems: 'center' }}>
          {entry.equipment_name && (
            <Badge>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35" />
              </svg>
              {entry.equipment_name}
            </Badge>
          )}
          {entry.topic_name && (
            <Badge
              color={entry.topic_color || 'var(--color-text-secondary)'}
              bg={`${entry.topic_color}18` || 'var(--color-bg-secondary)'}
            >
              {entry.topic_name}
            </Badge>
          )}
          {entry.date_reported && (
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              {new Date(entry.date_reported).toLocaleDateString()}
            </span>
          )}
          {entry.tags?.map((tag: string) => (
            <Badge key={tag} size="sm">{tag}</Badge>
          ))}
        </div>
      </div>
    </Card>
  );
}
