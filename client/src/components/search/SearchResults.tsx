import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from './SearchBar';
import { SearchFilters, defaultFilters } from './SearchFilters';
import { ResultCard } from './ResultCard';
import { Header } from '../layout/Header';
import * as api from '../../services/api';

export function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState(defaultFilters);
  const [results, setResults] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async (q: string, f = filters) => {
    setLoading(true);
    setSearched(true);
    try {
      const params: Record<string, string> = {};
      if (q) params.q = q;
      if (f.equipment_id) params.equipment_id = f.equipment_id;
      if (f.topic_id) params.topic_id = f.topic_id;
      if (f.severity) params.severity = f.severity;
      if (f.date_from) params.date_from = f.date_from;
      if (f.date_to) params.date_to = f.date_to;

      const data = await api.searchEntries(params);
      setResults(data.results || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Search failed:', err);
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Auto-search on filter change
  useEffect(() => {
    if (searched) {
      doSearch(query, filters);
    }
  }, [filters]);

  return (
    <div>
      <Header
        title="Search"
        subtitle="Find troubleshooting solutions across all equipment"
      />

      <SearchBar
        value={query}
        onChange={setQuery}
        onSearch={doSearch}
        autoFocus
      />

      <SearchFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => {
          setFilters(defaultFilters);
        }}
      />

      {/* Results */}
      <div style={{ marginTop: 'var(--space-8)' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--color-text-muted)' }}>
            Searching...
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: 'var(--space-16)',
              color: 'var(--color-text-muted)',
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              style={{ margin: '0 auto var(--space-4)', opacity: 0.4 }}
            >
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" />
            </svg>
            <p style={{ fontWeight: 500 }}>No results found</p>
            <p style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-2)' }}>
              Try different keywords or adjust your filters
            </p>
          </div>
        )}

        {!loading && !searched && (
          <div
            style={{
              textAlign: 'center',
              padding: 'var(--space-16)',
              color: 'var(--color-text-muted)',
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              style={{ margin: '0 auto var(--space-4)', opacity: 0.3 }}
            >
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" />
            </svg>
            <p style={{ fontWeight: 500 }}>Search your troubleshooting database</p>
            <p style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-2)' }}>
              Type a keyword and press Enter, or use filters to browse
            </p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
              {total} result{total !== 1 ? 's' : ''} found
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {results.map((entry) => (
                <ResultCard
                  key={entry.id}
                  entry={entry}
                  onClick={() => navigate(`/entry/${entry.id}`)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
