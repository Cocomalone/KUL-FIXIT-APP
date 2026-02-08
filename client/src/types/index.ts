export interface Equipment {
  id: number;
  name: string;
  model: string;
  manufacturer: string;
  category: string;
  created_at: string;
}

export interface Topic {
  id: number;
  name: string;
  description: string;
  color: string;
  created_at: string;
}

export interface Entry {
  id: number;
  title: string;
  question: string;
  answer: string;
  equipment_id: number | null;
  topic_id: number | null;
  repair_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  date_reported: string;
  date_resolved: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  equipment_name?: string;
  equipment_model?: string;
  topic_name?: string;
  topic_color?: string;
  tags?: string[];
  occurrence_count?: number;
}

export interface Occurrence {
  id: number;
  entry_id: number;
  occurred_at: string;
  reported_by: string;
  notes: string;
}

export interface SearchResult extends Entry {
  rank: number;
  snippet: string;
}

export interface DashboardStats {
  total_entries: number;
  total_equipment: number;
  total_topics: number;
  entries_this_month: number;
  total_occurrences: number;
}

export interface FrequentIssue {
  entry_id: number;
  title: string;
  equipment_name: string;
  topic_name: string;
  occurrence_count: number;
  recent_count: number;
  previous_count: number;
  trend: 'rising' | 'falling' | 'stable';
}

export interface TrendData {
  date: string;
  count: number;
}

export interface ImportMapping {
  [dbField: string]: string; // maps DB field name to CSV column name
}

export interface ImportPreview {
  columns: string[];
  rows: Record<string, string>[];
  totalRows: number;
  fileName: string;
}

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}
