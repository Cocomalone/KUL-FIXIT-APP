import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Header } from '../layout/Header';
import * as api from '../../services/api';

export function EquipmentPage() {
  const [equipment, setEquipment] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEqModal, setShowEqModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [eqForm, setEqForm] = useState({ name: '', model: '', manufacturer: '', category: '' });
  const [topicForm, setTopicForm] = useState({ name: '', description: '', color: '#6B7280' });
  const [tab, setTab] = useState<'equipment' | 'topics'>('equipment');

  const loadData = async () => {
    setLoading(true);
    try {
      const [eq, tp] = await Promise.all([api.getEquipment(), api.getTopics()]);
      setEquipment(eq);
      setTopics(tp);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleAddEquipment = async () => {
    if (!eqForm.name) return;
    await api.createEquipment(eqForm);
    setEqForm({ name: '', model: '', manufacturer: '', category: '' });
    setShowEqModal(false);
    loadData();
  };

  const handleAddTopic = async () => {
    if (!topicForm.name) return;
    await api.createTopic(topicForm);
    setTopicForm({ name: '', description: '', color: '#6B7280' });
    setShowTopicModal(false);
    loadData();
  };

  return (
    <div>
      <Header
        title="Equipment & Topics"
        subtitle="Manage equipment and topic categories"
        actions={
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <Button variant="secondary" onClick={() => setShowTopicModal(true)}>+ Topic</Button>
            <Button onClick={() => setShowEqModal(true)}>+ Equipment</Button>
          </div>
        }
      />

      {/* Tab selector */}
      <div style={{ display: 'flex', gap: 'var(--space-1)', marginBottom: 'var(--space-6)', borderBottom: '1px solid var(--color-border)' }}>
        {(['equipment', 'topics'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: 'var(--space-3) var(--space-5)',
              border: 'none',
              borderBottom: `2px solid ${tab === t ? 'var(--color-primary)' : 'transparent'}`,
              backgroundColor: 'transparent',
              color: tab === t ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              fontWeight: tab === t ? 600 : 400,
              fontSize: 'var(--font-size-sm)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              textTransform: 'capitalize',
            }}
          >
            {t} ({t === 'equipment' ? equipment.length : topics.length})
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--color-text-muted)' }}>Loading...</div>
      ) : tab === 'equipment' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
          {equipment.map((eq) => (
            <Card key={eq.id} padding="var(--space-5)">
              <div style={{ fontWeight: 600, marginBottom: 'var(--space-1)' }}>{eq.name}</div>
              {eq.model && <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Model: {eq.model}</div>}
              {eq.manufacturer && <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Mfr: {eq.manufacturer}</div>}
              <div style={{ marginTop: 'var(--space-3)', display: 'flex', gap: 'var(--space-2)' }}>
                {eq.category && <Badge>{eq.category}</Badge>}
                <Badge>{eq.entry_count || 0} entries</Badge>
              </div>
            </Card>
          ))}
          {equipment.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 'var(--space-10)', color: 'var(--color-text-muted)' }}>
              No equipment added yet
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
          {topics.map((tp) => (
            <Card key={tp.id} padding="var(--space-5)">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                <div style={{ width: 12, height: 12, borderRadius: 'var(--radius-full)', backgroundColor: tp.color }} />
                <span style={{ fontWeight: 600 }}>{tp.name}</span>
              </div>
              {tp.description && <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{tp.description}</div>}
              <Badge style={{ marginTop: 'var(--space-3)' }}>{tp.entry_count || 0} entries</Badge>
            </Card>
          ))}
        </div>
      )}

      {/* Add Equipment Modal */}
      <Modal isOpen={showEqModal} onClose={() => setShowEqModal(false)} title="Add Equipment">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input label="Name *" value={eqForm.name} onChange={(e) => setEqForm({ ...eqForm, name: e.target.value })} placeholder="Equipment name" />
          <Input label="Model" value={eqForm.model} onChange={(e) => setEqForm({ ...eqForm, model: e.target.value })} placeholder="Model number" />
          <Input label="Manufacturer" value={eqForm.manufacturer} onChange={(e) => setEqForm({ ...eqForm, manufacturer: e.target.value })} placeholder="Manufacturer name" />
          <Input label="Category" value={eqForm.category} onChange={(e) => setEqForm({ ...eqForm, category: e.target.value })} placeholder="e.g., CNC, Conveyor, Press" />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
            <Button variant="secondary" onClick={() => setShowEqModal(false)}>Cancel</Button>
            <Button onClick={handleAddEquipment}>Add Equipment</Button>
          </div>
        </div>
      </Modal>

      {/* Add Topic Modal */}
      <Modal isOpen={showTopicModal} onClose={() => setShowTopicModal(false)} title="Add Topic">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input label="Name *" value={topicForm.name} onChange={(e) => setTopicForm({ ...topicForm, name: e.target.value })} placeholder="Topic name" />
          <Input label="Description" value={topicForm.description} onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })} placeholder="Brief description" />
          <div>
            <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Color</label>
            <input type="color" value={topicForm.color} onChange={(e) => setTopicForm({ ...topicForm, color: e.target.value })} style={{ width: 48, height: 32, border: 'none', cursor: 'pointer' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
            <Button variant="secondary" onClick={() => setShowTopicModal(false)}>Cancel</Button>
            <Button onClick={handleAddTopic}>Add Topic</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
