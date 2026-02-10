import { queryAll, queryOne } from '../db/helpers';

export async function getStats() {
  const stats = await queryOne(`
    SELECT
      (SELECT COUNT(*) FROM entries) as total_entries,
      (SELECT COUNT(*) FROM equipment) as total_equipment,
      (SELECT COUNT(*) FROM topics) as total_topics,
      (SELECT COUNT(*) FROM entries WHERE severity = 'critical') as critical_issues,
      (SELECT EXTRACT(YEAR FROM MIN(date_reported))::int FROM entries) as year_from,
      (SELECT EXTRACT(YEAR FROM MAX(date_reported))::int FROM entries) as year_to
  `);
  return stats || {
    total_entries: 0,
    total_equipment: 0,
    total_topics: 0,
    critical_issues: 0,
    year_from: null,
    year_to: null,
  };
}

export async function getFrequentIssues(limit: number = 10) {
  const rows = await queryAll(`
    SELECT
      e.id as entry_id,
      e.title,
      e.severity,
      e.date_reported,
      COALESCE(eq.name, 'Unassigned') as equipment_name,
      COALESCE(t.name, 'Uncategorized') as topic_name,
      t.color as topic_color
    FROM entries e
    LEFT JOIN equipment eq ON e.equipment_id = eq.id
    LEFT JOIN topics t ON e.topic_id = t.id
    WHERE e.severity IN ('critical', 'high')
    ORDER BY
      CASE e.severity WHEN 'critical' THEN 1 WHEN 'high' THEN 2 ELSE 3 END,
      e.date_reported DESC
    LIMIT ?
  `, [limit]);

  return rows;
}

export async function getTrends(_days?: number) {
  // Issues grouped by year of date_reported
  const issuesByYear = await queryAll(`
    SELECT
      EXTRACT(YEAR FROM date_reported)::int as year,
      COUNT(*)::int as count
    FROM entries
    WHERE date_reported IS NOT NULL
    GROUP BY EXTRACT(YEAR FROM date_reported)
    ORDER BY year
  `);

  // Issues grouped by month across all years
  const issuesByMonth = await queryAll(`
    SELECT
      TO_CHAR(date_reported, 'YYYY-MM') as month,
      COUNT(*)::int as count
    FROM entries
    WHERE date_reported IS NOT NULL
    GROUP BY TO_CHAR(date_reported, 'YYYY-MM')
    ORDER BY month
  `);

  // Equipment breakdown - all entries
  const equipmentBreakdown = await queryAll(`
    SELECT
      COALESCE(eq.name, 'Unassigned') as name,
      COUNT(*)::int as count
    FROM entries e
    LEFT JOIN equipment eq ON e.equipment_id = eq.id
    GROUP BY eq.id, eq.name
    ORDER BY count DESC
  `);

  // Topic breakdown - all entries
  const topicBreakdown = await queryAll(`
    SELECT
      COALESCE(t.name, 'Uncategorized') as name,
      t.color,
      COUNT(*)::int as count
    FROM entries e
    LEFT JOIN topics t ON e.topic_id = t.id
    GROUP BY t.id, t.name, t.color
    ORDER BY count DESC
  `);

  // Severity breakdown
  const severityBreakdown = await queryAll(`
    SELECT
      e.severity as name,
      COUNT(*)::int as count
    FROM entries e
    WHERE e.severity IS NOT NULL AND e.severity != ''
    GROUP BY e.severity
    ORDER BY
      CASE e.severity WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 WHEN 'low' THEN 4 ELSE 5 END
  `);

  return {
    issuesByYear,
    issuesByMonth,
    equipmentBreakdown,
    topicBreakdown,
    severityBreakdown,
  };
}
