import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Header } from '../layout/Header';
import { TrendChart } from './TrendChart';
import { TopIssues } from './TopIssues';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import * as api from '../../services/api';

const COLORS = ['#D97757', '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#6366F1', '#14B8A6', '#EF4444', '#F97316'];

export function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [frequent, setFrequent] = useState<any[]>([]);
  const [trends, setTrends] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getDashboardStats(),
      api.getFrequentIssues(10),
      api.getTrends(90),
    ]).then(([s, f, t]) => {
      setStats(s);
      setFrequent(f);
      setTrends(t);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ padding: 'var(--space-10)', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading dashboard...</div>;
  }

  const statCards = [
    { label: 'Total Entries', value: stats?.total_entries || 0, color: 'var(--color-primary)' },
    { label: 'Equipment', value: stats?.total_equipment || 0, color: 'var(--color-info)' },
    { label: 'Topics', value: stats?.total_topics || 0, color: '#8B5CF6' },
    { label: 'This Month', value: stats?.entries_this_month || 0, color: 'var(--color-success)' },
    { label: 'Occurrences', value: stats?.total_occurrences || 0, color: 'var(--color-warning)' },
  ];

  return (
    <div>
      <Header
        title="Dashboard"
        subtitle="Overview of troubleshooting activity and recurring issues"
      />

      {/* Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-8)',
        }}
      >
        {statCards.map((stat) => (
          <Card key={stat.label} padding="var(--space-5)">
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>
              {stat.label}
            </div>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: stat.color }}>
              {stat.value}
            </div>
          </Card>
        ))}
      </div>

      {/* Top Recurring Issues */}
      <Card padding="0" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ padding: 'var(--space-5) var(--space-5) 0' }}>
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>Top Recurring Issues</h3>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
            Most frequently occurring problems in the last 90 days
          </p>
        </div>
        <TopIssues issues={frequent} />
      </Card>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        <Card>
          <TrendChart
            data={trends?.occurrenceTrend || []}
            title="Occurrences Over Time"
            color="#D97757"
          />
        </Card>
        <Card>
          <TrendChart
            data={trends?.entryTrend || []}
            title="New Entries Added"
            color="#3B82F6"
          />
        </Card>
      </div>

      {/* Breakdowns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
        {/* Equipment Breakdown */}
        <Card>
          <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
            By Equipment
          </h4>
          {(trends?.equipmentBreakdown || []).length === 0 ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
              No data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trends?.equipmentBreakdown || []} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {(trends?.equipmentBreakdown || []).map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Topic Breakdown */}
        <Card>
          <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
            By Topic
          </h4>
          {(trends?.topicBreakdown || []).length === 0 ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
              No data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trends?.topicBreakdown || []} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {(trends?.topicBreakdown || []).map((item: any, i: number) => (
                    <Cell key={i} fill={item.color || COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  );
}
