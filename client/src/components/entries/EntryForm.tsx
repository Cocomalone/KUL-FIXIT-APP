import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Input, TextArea } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Header } from '../layout/Header';
import * as api from '../../services/api';

export function EntryForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [form, setForm] = useState({
    title: '',
    question: '',
    answer: '',
    equipment_id: '',
    topic_id: '',
    repair_type: '',
    severity: 'medium',
    source: '',
    date_reported: new Date().toISOString().split('T')[0],
    date_resolved: '',
    tags: '',
  });

  const [equipment, setEquipment] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getEquipment().then(setEquipment).catch(() => {});
    api.getTopics().then(setTopics).catch(() => {});

    if (id) {
      api.getEntry(parseInt(id)).then((entry) => {
        setForm({
          title: entry.title || '',
          question: entry.question || '',
          answer: entry.answer || '',
          equipment_id: entry.equipment_id?.toString() || '',
          topic_id: entry.topic_id?.toString() || '',
          repair_type: entry.repair_type || '',
          severity: entry.severity || 'medium',
          source: entry.source || '',
          date_reported: entry.date_reported || '',
          date_resolved: entry.date_resolved || '',
          tags: (entry.tags || []).join(', '),
        });
      }).catch(() => setError('Failed to load entry'));
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.question || !form.answer) {
      setError('Title, question, and answer are required.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        ...form,
        equipment_id: form.equipment_id ? parseInt(form.equipment_id) : null,
        topic_id: form.topic_id ? parseInt(form.topic_id) : null,
        date_resolved: form.date_resolved || null,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      };

      if (isEditing) {
        await api.updateEntry(parseInt(id!), payload);
        navigate(`/entry/${id}`);
      } else {
        const entry = await api.createEntry(payload);
        navigate(`/entry/${entry.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save entry');
    } finally {
      setSubmitting(false);
    }
  };

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      <Header
        title={isEditing ? 'Edit Entry' : 'Add New Entry'}
        subtitle={isEditing ? 'Update this troubleshooting entry' : 'Create a new troubleshooting Q&A entry'}
      />

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {error && (
            <div
              style={{
                padding: 'var(--space-3) var(--space-4)',
                backgroundColor: 'var(--color-danger-light)',
                color: '#F87171',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-sm)',
              }}
            >
              {error}
            </div>
          )}

          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <Input
                label="Title *"
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                placeholder="Brief description of the issue"
              />
              <TextArea
                label="Question / Problem Description *"
                value={form.question}
                onChange={(e) => update('question', e.target.value)}
                placeholder="Describe the problem or question in detail..."
                style={{ minHeight: '120px' }}
              />
              <TextArea
                label="Answer / Solution *"
                value={form.answer}
                onChange={(e) => update('answer', e.target.value)}
                placeholder="Describe the solution or answer..."
                style={{ minHeight: '120px' }}
              />
            </div>
          </Card>

          <Card>
            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
              Classification
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <Select
                label="Equipment"
                placeholder="Select equipment..."
                options={equipment.map((e) => ({ value: e.id, label: e.name }))}
                value={form.equipment_id}
                onChange={(e) => update('equipment_id', e.target.value)}
              />
              <Select
                label="Topic"
                placeholder="Select topic..."
                options={topics.map((t) => ({ value: t.id, label: t.name }))}
                value={form.topic_id}
                onChange={(e) => update('topic_id', e.target.value)}
              />
              <Input
                label="Repair Type"
                value={form.repair_type}
                onChange={(e) => update('repair_type', e.target.value)}
                placeholder="e.g., Replacement, Adjustment, Calibration"
              />
              <Select
                label="Severity"
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                  { value: 'critical', label: 'Critical' },
                ]}
                value={form.severity}
                onChange={(e) => update('severity', e.target.value)}
              />
              <Input
                label="Source"
                value={form.source}
                onChange={(e) => update('source', e.target.value)}
                placeholder="e.g., Manufacturer manual, Tech support call"
              />
              <Input
                label="Tags (comma separated)"
                value={form.tags}
                onChange={(e) => update('tags', e.target.value)}
                placeholder="e.g., motor, overheating, belt"
              />
              <Input
                label="Date Reported"
                type="date"
                value={form.date_reported}
                onChange={(e) => update('date_reported', e.target.value)}
              />
              <Input
                label="Date Resolved"
                type="date"
                value={form.date_resolved}
                onChange={(e) => update('date_resolved', e.target.value)}
              />
            </div>
          </Card>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
            <Button variant="secondary" type="button" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : isEditing ? 'Update Entry' : 'Create Entry'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
