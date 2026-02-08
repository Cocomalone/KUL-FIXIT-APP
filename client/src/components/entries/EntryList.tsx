import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResultCard } from '../search/ResultCard';
import { SearchFilters, defaultFilters } from '../search/SearchFilters';
import { Button } from '../ui/Button';
import { Header } from '../layout/Header';
import * as api from '../../services/api';

export function BrowsePage() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(defaultFilters);

  const loadEntries = async (p: number, f = filters) => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: p.toString(), limit: '20' };
      if (f.equipment_id) params.equipment_id = f.equipment_id;
      if (f.topic_id) params.topic_id = f.topic_id;
      if (f.severity) params.severity = f.severity;

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

  useEffect(() => {
    loadEntries(1);
  }, []);

  useEffect(() => {
    loadEntries(1, filters);
  }, [filters]);

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
