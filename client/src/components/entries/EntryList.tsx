import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ResultCard } from '../search/ResultCard';
import { SearchFilters, defaultFilters } from '../search/SearchFilters';
import { Button } from '../ui/Button';
import { Header } from '../layout/Header';
import { Card } from '../ui/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import * as api from '../../services/api';

const COLORS = ['#D4A843', '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#6366F1', '#14B8A6', '#EF4444', '#F97316'];

export function BrowsePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [entries, setEntries] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [timeline, setTimeline] = useState<{ year: number; count: number }[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);

  // Read label from URL for timeline chart title (e.g., "Conche", "critical", "2023")
  const dashboardLabel = searchParams.get('label') || '';

  // Pre-populate ALL filters from URL query params (e.g. /browse?equipment_id=3&severity=critical)
  const initialFilters = {
    ...defaultFilters,
    equipment_id: searchParams.get('equipment_id') || '',
    topic_id: searchParams.get('topic_id') || '',
    severity: searchParams.get('severity') || '',
    date_from: searchParams.get('date_from') || '',
    date_to: searchParams.get('date_to') || '',
  };
  const [filters, setFilters] = useState(initialFilters);

  // Determine if we arrived from a dashboard click (has meaningful filters)
  const hasUrlFilters = !!(
    searchParams.get('equipment_id') ||
    searchParams.get('topic_id') ||
    searchParams.get('severity') ||
    searchParams.get('date_from')
  );

  const loadEntries = async (p: number, f = filters) => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: p.toString(), limit: '20' };
      if (f.equipment_id) params.equipment_id = f.equipment_id;
      if (f.topic_id) params.topic_id = f.topic_id;
      if (f.severity) params.severity = f.severity;
      if (f.date_from) params.date_from = f.date_from;
      if (f.date_to) params.date_to = f.date_to;

      const data = await api.getEntries(params);
      setEntries(data.entries || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setPage(p);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load timeline data when arriving from dashboard with filters
  useEffect(() => {
    if (hasUrlFilters) {
      setTimelineLoading(true);
      const params: Record<string, string> = {};
      if (initialFilters.equipment_id) params.equipment_id = initialFilters.equipment_id;
      if (initialFilters.topic_id) params.topic_id = initialFilters.topic_id;
      if (initialFilters.severity) params.severity = initialFilters.severity;
      // Don't pass date filters to timeline — we want the full year-by-year view even when filtering by date
      api.getFilteredTimeline(params)
        .then((data) => setTimeline(data || []))
        .catch(console.error)
        .finally(() => setTimelineLoading(false));
    }
  }, []);

  useEffect(() => {
    loadEntries(1, filters);
  }, []);

  useEffect(() => {
    loadEntries(1, filters);
  }, [filters]);

  // Build a descriptive title for the timeline chart
  const getTimelineTitle = () => {
    if (dashboardLabel) {
      const label = decodeURIComponent(dashboardLabel);
      // Capitalize first letter for severity labels
      const displayLabel = label.charAt(0).toUpperCase() + label.slice(1);
      return `${displayLabel} — Issues by Year`;
    }
    return 'Issues by Year';
  };

  return (
    <div>
      <Header
        title="Browse Entries"
        subtitle={`${total} troubleshooting entries`}
        actions={
          <Button onClick={() => navigate('/add')}>
            + Add Entry
          </Button>
        }
      />

      {/* Timeline chart — only shown when arriving from dashboard click */}
      {hasUrlFilters && timeline.length > 0 && (
        <Card style={{ marginBottom: 'var(--space-6)' }}>
          <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 'var(--space-1)' }}>
            {getTimelineTitle()}
          </h4>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>
            Distribution of issues over time for this category
          </p>
          {timelineLoading ? (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
              Loading timeline...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={timeline.map((d) => ({ name: String(d.year), count: d.count }))}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#A0A0A0' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#A0A0A0' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#2A2A2A', border: '1px solid #3A3A3A', borderRadius: 8, color: '#E8E5E0' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {timeline.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      )}

      <SearchFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(defaultFilters)}
      />

      <div style={{ marginTop: 'var(--space-6)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--color-text-muted)' }}>Loading...</div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--color-text-muted)' }}>
            <p>No entries yet.</p>
            <Button variant="secondary" onClick={() => navigate('/add')} style={{ marginTop: 'var(--space-4)' }}>
              Add your first entry
            </Button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {entries.map((entry) => (
                <ResultCard key={entry.id} entry={entry} onClick={() => navigate(`/entry/${entry.id}`)} />
              ))}
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
                <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => loadEntries(page - 1)}>
                  Previous
                </Button>
                <span style={{ display: 'flex', alignItems: 'center', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                  Page {page} of {totalPages}
                </span>
                <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => loadEntries(page + 1)}>
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
