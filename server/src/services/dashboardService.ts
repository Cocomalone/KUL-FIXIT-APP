import { queryAll, queryOne } from '../db/helpers';

export async function getStats() {
  const stats = await queryOne(`
    SELECT
      (SELECT COUNT(*) FROM entries) as total_entries,
      (SELECT COUNT(*) FROM equipment) as total_equipment,
      (SELECT COUNT(*) FROM topics) as total_topics,
      (SELECT COUNT(*) FROM entries WHERE date_reported >= CURRENT_DATE - INTERVAL '30 days') as entries_this_month,
      (SELECT COUNT(*) FROM occurrence_log) as total_occurrences
  `);
  return stats || {
    total_entries: 0,
    total_equipment: 0,
    total_topics: 0,
    entries_this_month: 0,
    total_occurrences: 0,
  };
}

export async function getFrequentIssues(limit: number = 10) {
  const rows = await queryAll(`
    SELECT
      e.id as entry_id,
      e.title,
      e.severity,
      COALESCE(eq.name, 'Unassigned') as equipment_name,
      COALESCE(t.name, 'Uncategorized') as topic_name,
      t.color as topic_color,
      COUNT(o.id)::int as occurrence_count,
      SUM(CASE WHEN o.occurred_at >= NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END)::int as recent_count,
      SUM(CASE WHEN o.occurred_at >= NOW() - INTERVAL '60 days' AND o.occurred_at < NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END)::int as previous_count
    FROM entries e
    JOIN occurrence_log o ON o.entry_id = e.id
    LEFT JOIN equipment eq ON e.equipment_id = eq.id
    LEFT JOIN topics t ON e.topic_id = t.id
    GROUP BY e.id, e.title, e.severity, eq.name, t.name, t.color
    HAVING COUNT(o.id) > 0
    ORDER BY SUM(CASE WHEN o.occurred_at >= NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) DESC, COUNT(o.id) DESC
    LIMIT ?
  `, [limit]);

  return rows.map((row: any) => ({
    ...row,
    trend: row.recent_count > row.previous_count
      ? 'rising'
      : row.recent_count < row.previous_count
        ? 'falling'
        : 'stable',
  }));
}

export async function getTrends(days: number = 90) {
  const daysStr = String(days);

  // Occurrences per day over the period
  const occurrenceTrend = await queryAll(`
    SELECT occurred_at::DATE as date, COUNT(*)::int as count
    FROM occurrence_log
    WHERE occurred_at >= NOW() - (? || ' days')::INTERVAL
    GROUP BY occurred_at::DATE
    ORDER BY date
  `, [daysStr]);

  // New entries per day
  const entryTrend = await queryAll(`
    SELECT created_at::DATE as date, COUNT(*)::int as count
    FROM entries
    WHERE created_at >= NOW() - (? || ' days')::INTERVAL
    GROUP BY created_at::DATE
    ORDER BY date
  `, [daysStr]);

  // Top equipment by occurrence count
  const equipmentBreakdown = await queryAll(`
    SELECT
      COALESCE(eq.name, 'Unassigned') as name,
      COUNT(o.id)::int as count
    FROM occurrence_log o
    JOIN entries e ON o.entry_id = e.id
    LEFT JOIN equipment eq ON e.equipment_id = eq.id
    WHERE o.occurred_at >= NOW() - (? || ' days')::INTERVAL
    GROUP BY eq.id, eq.name
    ORDER BY count DESC
    LIMIT 10
  `, [daysStr]);

  // Top topics by occurrence count
  const topicBreakdown = await queryAll(`
    SELECT
      COALESCE(t.name, 'Uncategorized') as name,
      t.color,
      COUNT(o.id)::int as count
    FROM occurrence_log o
    JOIN entries e ON o.entry_id = e.id
    LEFT JOIN topics t ON e.topic_id = t.id
    WHERE o.occurred_at >= NOW() - (? || ' days')::INTERVAL
    GROUP BY t.id, t.name, t.color
    ORDER BY count DESC
    LIMIT 10
  `, [daysStr]);

  // Severity breakdown
  const severityBreakdown = await queryAll(`
    SELECT
      e.severity as name,
      COUNT(o.id)::int as count
    FROM occurrence_log o
    JOIN entries e ON o.entry_id = e.id
    WHERE o.occurred_at >= NOW() - (? || ' days')::INTERVAL
    GROUP BY e.severity
    ORDER BY count DESC
  `, [daysStr]);

  return {
    occurrenceTrend,
    entryTrend,
    equipmentBreakdown,
    topicBreakdown,
    severityBreakdown,
  };
}
