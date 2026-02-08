import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge, SeverityBadge, FrequencyBadge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Header } from '../layout/Header';
import * as api from '../../services/api';

export function EntryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showOccurrenceModal, setShowOccurrenceModal] = useState(false);
  const [occReportedBy, setOccReportedBy] = useState('');
  const [occNotes, setOccNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      api.getEntry(parseInt(id)).then(setEntry).catch(() => {}).finally(() => setLoading(false));
    }
  }, [id]);

  const handleLogOccurrence = async () => {
    if (!id) return;
    setSubmitting(true);
    try {
      await api.logOccurrence(parseInt(id), { reported_by: occReportedBy, notes: occNotes });
      const updated = await api.getEntry(parseInt(id));
      setEntry(updated);
      setShowOccurrenceModal(false);
      setOccReportedBy('');
      setOccNotes('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 'var(--space-10)', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading...</div>;
  }

  if (!entry) {
    return (
      <div style={{ padding: 'var(--space-10)', textAlign: 'center' }}>
        <p>Entry not found.</p>
        <Button variant="secondary" onClick={() => navigate('/')} style={{ marginTop: 'var(--space-4)' }}>
          Back to Search
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Header
        title={entry.title}
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate(`/edit/${entry.id}`)}>
              Edit
            </Button>
            <Button variant="primary" onClick={() => setShowOccurrenceModal(true)}>
              Log Occurrence
            </Button>
          </>
        }
      />

      {/* Meta badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
        <SeverityBadge severity={entry.severity} />
        <FrequencyBadge count={entry.occurrence_count || 0} />
        {entry.equipment_name && <Badge>{entry.equipment_name} {entry.equipment_model ? `(${entry.equipment_model})` : ''}</Badge>}
        {entry.topic_name && <Badge color={entry.topic_color} bg={`${entry.topic_color}18`}>{entry.topic_name}</Badge>}
        {entry.repair_type && <Badge>{entry.repair_type}</Badge>}
        {entry.tags?.map((tag: string) => <Badge key={tag}>{tag}</Badge>)}
      </div>

      {/* Question & Answer */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        <Card>
          <div style={{ marginBottom: 'var(--space-2)' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Question / Problem
            </span>
          </div>
          <p style={{ lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{entry.question}</p>
        </Card>

        <Card>
          <div style={{ marginBottom: 'var(--space-2)' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-success)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Answer / Solution
            </span>
          </div>
          <p style={{ lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{entry.answer}</p>
        </Card>
      </div>

      {/* Details */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 'var(--space-4)',
          marginTop: 'var(--space-6)',
          padding: 'var(--space-5)',
          backgroundColor: 'var(--color-bg-secondary)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: '2px' }}>Source</div>
          <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>{entry.source || 'N/A'}</div>
        </div>
        <div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: '2px' }}>Date Reported</div>
          <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>{entry.date_reported ? new Date(entry.date_reported).toLocaleDateString() : 'N/A'}</div>
        </div>
        <div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: '2px' }}>Date Resolved</div>
          <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>{entry.date_resolved ? new Date(entry.date_resolved).toLocaleDateString() : 'N/A'}</div>
        </div>
        <div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: '2px' }}>Total Occurrences</div>
          <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>{entry.occurrence_count || 0}</div>
        </div>
      </div>

      {/* Occurrence History */}
      {entry.occurrences && entry.occurrences.length > 0 && (
        <div style={{ marginTop: 'var(--space-8)' }}>
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
            Occurrence History
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {entry.occurrences.map((occ: any) => (
              <div
                key={occ.id}
                style={{
                  padding: 'var(--space-4)',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border-light)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  {occ.notes && <p style={{ fontSize: 'var(--font-size-sm)' }}>{occ.notes}</p>}
                  {occ.reported_by && (
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      Reported by: {occ.reported_by}
                    </p>
                  )}
                </div>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                  {new Date(occ.occurred_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Back button */}
      <div style={{ marginTop: 'var(--space-8)' }}>
        <Button variant="ghost" onClick={() => navigate(-1)}>
          &larr; Back
        </Button>
      </div>

      {/* Log Occurrence Modal */}
      <Modal isOpen={showOccurrenceModal} onClose={() => setShowOccurrenceModal(false)} title="Log Occurrence">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            Record that this problem has occurred again. This helps track recurring issues.
          </p>
          <Input
            label="Reported By"
            value={occReportedBy}
            onChange={(e) => setOccReportedBy(e.target.value)}
            placeholder="Your name"
          />
          <Input
            label="Notes (optional)"
            value={occNotes}
            onChange={(e) => setOccNotes(e.target.value)}
            placeholder="Any additional context..."
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
            <Button variant="secondary" onClick={() => setShowOccurrenceModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleLogOccurrence} disabled={submitting}>
              {submitting ? 'Logging...' : 'Log Occurrence'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
