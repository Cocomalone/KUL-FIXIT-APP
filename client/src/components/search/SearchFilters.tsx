import React, { useState, useEffect } from 'react';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import * as api from '../../services/api';

interface Filters {
  equipment_id: string;
  topic_id: string;
  severity: string;
  date_from: string;
  date_to: string;
}

interface SearchFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onReset: () => void;
}

export const defaultFilters: Filters = {
  equipment_id: '',
  topic_id: '',
  severity: '',
  date_from: '',
  date_to: '',
};

export function SearchFilters({ filters, onChange, onReset }: SearchFiltersProps) {
  const [equipment, setEquipment] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    api.getEquipment().then(setEquipment).catch(() => {});
    api.getTopics().then(setTopics).catch(() => {});
  }, []);

  const hasFilters = Object.values(filters).some((v) => v !== '');

  return (
    <div style={{ marginTop: 'var(--space-4)' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          background: 'none',
          border: 'none',
          color: hasFilters ? 'var(--color-primary)' : 'var(--color-text-secondary)',
          fontSize: 'var(--font-size-sm)',
          fontWeight: 500,
          cursor: 'pointer',
          padding: 'var(--space-1) 0',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M3 4h18M7 9h10M10 14h4" strokeLinecap="round" />
        </svg>
        Filters {hasFilters && `(active)`}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform var(--transition-fast)' }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {expanded && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 'var(--space-4)',
            marginTop: 'var(--space-4)',
            padding: 'var(--space-5)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <Select
            label="Equipment"
            placeholder="All Equipment"
            options={equipment.map((e) => ({ value: e.id, label: e.name }))}
            value={filters.equipment_id}
            onChange={(e) => onChange({ ...filters, equipment_id: e.target.value })}
          />
          <Select
            label="Topic"
            placeholder="All Topics"
            options={topics.map((t) => ({ value: t.id, label: t.name }))}
            value={filters.topic_id}
            onChange={(e) => onChange({ ...filters, topic_id: e.target.value })}
          />
          <Select
            label="Severity"
            placeholder="Any Severity"
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
              { value: 'critical', label: 'Critical' },
            ]}
            value={filters.severity}
            onChange={(e) => onChange({ ...filters, severity: e.target.value })}
          />
          <Input
            label="Date From"
            type="date"
            value={filters.date_from}
            onChange={(e) => onChange({ ...filters, date_from: e.target.value })}
          />
          <Input
            label="Date To"
            type="date"
            value={filters.date_to}
            onChange={(e) => onChange({ ...filters, date_to: e.target.value })}
          />
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <Button variant="ghost" size="sm" onClick={onReset}>
              Reset Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
