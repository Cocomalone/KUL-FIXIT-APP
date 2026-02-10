import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, SeverityBadge } from '../ui/Badge';

interface TopIssuesProps {
  issues: any[];
}

export function TopIssues({ issues }: TopIssuesProps) {
  const navigate = useNavigate();

  if (issues.length === 0) {
    return (
      <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
        No critical or high severity issues found.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {issues.map((issue, i) => (
        <div
          key={issue.entry_id}
          onClick={() => navigate(`/entry/${issue.entry_id}`)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-4)',
            padding: 'var(--space-4) var(--space-5)',
            borderBottom: i < issues.length - 1 ? '1px solid var(--color-border-light)' : 'none',
            cursor: 'pointer',
            transition: 'background-color var(--transition-fast)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          {/* Rank */}
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 'var(--radius-full)',
              backgroundColor: i < 3 ? 'var(--color-primary-light)' : 'var(--color-bg-secondary)',
              color: i < 3 ? 'var(--color-primary)' : 'var(--color-text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {i + 1}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {issue.title}
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: '2px', alignItems: 'center' }}>
              {issue.equipment_name !== 'Unassigned' && (
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                  {issue.equipment_name}
                </span>
              )}
              {issue.topic_name !== 'Uncategorized' && (
                <Badge size="sm" color={issue.topic_color} bg={`${issue.topic_color}18`}>
                  {issue.topic_name}
                </Badge>
              )}
            </div>
          </div>

          {/* Severity Badge + Date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexShrink: 0 }}>
            {issue.date_reported && (
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                {new Date(issue.date_reported).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            )}
            <SeverityBadge severity={issue.severity} />
          </div>
        </div>
      ))}
    </div>
  );
}
