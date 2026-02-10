import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Header } from '../layout/Header';
import { TrendChart } from './TrendChart';
import { TopIssues } from './TopIssues';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import * as api from '../../services/api';

const COLORS = ['#D4A843', '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#6366F1', '#14B8A6', '#EF4444', '#F97316'];

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#EF4444',
  high: '#F59E0B',
  medium: '#3B82F6',
  low: '#10B981',
};

export function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [frequent, setFrequent] = useState<any[]>([]);
  const [trends, setTrends] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getDashboardStats(),
      api.getFrequentIssues(10),
      api.getTrends(),
    ]).then(([s, f, t]) => {
      setStats(s);
      setFrequent(f);
      setTrends(t);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ padding: 'var(--space-10)', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading dashboard...</div>;
  }

  const yearRange = stats?.year_from && stats?.year_to
    ? `${stats.year_from}-${stats.year_to}`
    : '--';

  const statCards = [
    { label: 'Total Entries', value: stats?.total_entries || 0, color: 'var(--color-primary)' },
    { label: 'Equipment', value: stats?.total_equipment || 0, color: 'var(--color-info)' },
    { label: 'Topics', value: stats?.total_topics || 0, color: '#A78BFA' },
    { label: 'Critical Issues', value: stats?.critical_issues || 0, color: '#EF4444' },
    { label: 'Years Covered', value: yearRange, color: 'var(--color-success)' },
  ];

  // Format yearly data for bar chart
  const yearlyData = (trends?.issuesByYear || []).map((d: any) => ({
    name: String(d.year),
    count: d.count,
  }));

  // Format monthly data for area chart
  const monthlyData = (trends?.issuesByMonth || []).map((d: any) => ({
    date: d.month,
    count: d.count,
  }));

  return (
    <div>
      <Header
        title="Dashboard"
        subtitle="Overview of troubleshooting activity from 2019 to 2025"
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

      {/* Top Critical & High Severity Issues */}
      <Card padding="0" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ padding: 'var(--space-5) var(--space-5) 0' }}>
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>Top Critical & High Severity Issues</h3>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
            Most important troubleshooting entries by severity
          </p>
        </div>
        <TopIssues issues={frequent} />
      </Card>

      {/* Charts Row 1 - Issues by Year + Monthly Trend */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        {/* Issues by Year - Bar Chart */}
        <Card>
          <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
            Issues Reported by Year
          </h4>
          {yearlyData.length === 0 ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
              No data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={yearlyData}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#A0A0A0' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#A0A0A0' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#2A2A2A', border: '1px solid #3A3A3A', borderRadius: 8, color: '#E8E5E0' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {yearlyData.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Monthly Trend - Area Chart */}
        <Card>
          <TrendChart
            data={monthlyData}
            title="Monthly Trend"
            color="#3B82F6"
            dateKey="date"
            formatDate={(d: string) => {
              const [year, month] = d.split('-');
              const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              return `${monthNames[parseInt(month, 10) - 1]} '${year.slice(2)}`;
            }}
          />
        </Card>
      </div>

      {/* Charts Row 2 - Severity + Equipment + Topic */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        {/* Severity Breakdown */}
        <Card>
          <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
            By Severity
          </h4>
          {(trends?.severityBreakdown || []).length === 0 ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
              No data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trends?.severityBreakdown || []}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#A0A0A0' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#A0A0A0' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#2A2A2A', border: '1px solid #3A3A3A', borderRadius: 8, color: '#E8E5E0' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {(trends?.severityBreakdown || []).map((item: any, i: number) => (
                    <Cell key={i} fill={SEVERITY_COLORS[item.name] || COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

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
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={trends?.equipmentBreakdown || []} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11, fill: '#A0A0A0' }} allowDecimals={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#A0A0A0' }} width={110} />
                <Tooltip contentStyle={{ backgroundColor: '#2A2A2A', border: '1px solid #3A3A3A', borderRadius: 8, color: '#E8E5E0' }} />
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
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={trends?.topicBreakdown || []} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11, fill: '#A0A0A0' }} allowDecimals={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#A0A0A0' }} width={110} />
                <Tooltip contentStyle={{ backgroundColor: '#2A2A2A', border: '1px solid #3A3A3A', borderRadius: 8, color: '#E8E5E0' }} />
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
