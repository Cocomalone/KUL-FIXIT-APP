import type { Pool } from 'pg';

export async function initializeSchema(pool: Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS equipment (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      model TEXT DEFAULT '',
      manufacturer TEXT DEFAULT '',
      category TEXT DEFAULT '',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS topics (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT DEFAULT '',
      color TEXT DEFAULT '#6B7280',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS entries (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      equipment_id INTEGER REFERENCES equipment(id) ON DELETE SET NULL,
      topic_id INTEGER REFERENCES topics(id) ON DELETE SET NULL,
      repair_type TEXT DEFAULT '',
      severity TEXT DEFAULT 'medium' CHECK(severity IN ('low', 'medium', 'high', 'critical')),
      source TEXT DEFAULT '',
      date_reported DATE DEFAULT CURRENT_DATE,
      date_resolved DATE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS entry_tags (
      entry_id INTEGER NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
      tag TEXT NOT NULL,
      PRIMARY KEY (entry_id, tag)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS occurrence_log (
      id SERIAL PRIMARY KEY,
      entry_id INTEGER NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
      occurred_at TIMESTAMP DEFAULT NOW(),
      reported_by TEXT DEFAULT '',
      notes TEXT DEFAULT ''
    )
  `);

  // Indexes
  await pool.query('CREATE INDEX IF NOT EXISTS idx_entries_equipment ON entries(equipment_id)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_entries_topic ON entries(topic_id)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_entries_severity ON entries(severity)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_entries_date_reported ON entries(date_reported)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_occurrence_entry ON occurrence_log(entry_id)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_occurrence_date ON occurrence_log(occurred_at)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_entry_tags_tag ON entry_tags(tag)');

  // Seed default topics if empty
  const result = await pool.query('SELECT COUNT(*)::int as count FROM topics');
  const topicCount = result.rows[0].count;

  if (topicCount === 0) {
    const defaultTopics = [
      ['Electrical', 'Electrical systems, wiring, power supply issues', '#3B82F6'],
      ['Mechanical', 'Mechanical components, bearings, gears, belts', '#10B981'],
      ['Hydraulic', 'Hydraulic systems, pumps, valves, fluid issues', '#8B5CF6'],
      ['Pneumatic', 'Air systems, compressors, pneumatic controls', '#F59E0B'],
      ['Software/PLC', 'PLC programming, HMI, software errors', '#EC4899'],
      ['Safety', 'Safety systems, interlocks, emergency stops', '#EF4444'],
      ['Preventive Maintenance', 'Scheduled maintenance, inspections', '#6366F1'],
      ['Calibration', 'Sensor calibration, measurement accuracy', '#14B8A6'],
    ];
    for (const [name, desc, color] of defaultTopics) {
      await pool.query('INSERT INTO topics (name, description, color) VALUES ($1, $2, $3)', [name, desc, color]);
    }
  }
}
