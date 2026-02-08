import { Router, Request, Response } from 'express';
import { queryAll, queryOne, run } from '../db/helpers';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const rows = await queryAll(`
      SELECT t.*,
        (SELECT COUNT(*) FROM entries WHERE topic_id = t.id) as entry_count
      FROM topics t
      ORDER BY t.name
    `);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, color } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }
    const result = await run(
      'INSERT INTO topics (name, description, color) VALUES (?, ?, ?)',
      [name, description || '', color || '#6B7280']
    );
    const topic = await queryOne('SELECT * FROM topics WHERE id = ?', [result.lastId]);
    res.status(201).json(topic);
  } catch (err: any) {
    if (err.code === '23505' || (err.message && err.message.toLowerCase().includes('unique'))) {
      res.status(409).json({ error: 'Topic already exists' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, description, color } = req.body;
    const result = await run(
      'UPDATE topics SET name = ?, description = ?, color = ? WHERE id = ?',
      [name, description || '', color || '#6B7280', parseInt(req.params.id)]
    );
    if (result.changes === 0) {
      res.status(404).json({ error: 'Topic not found' });
      return;
    }
    const topic = await queryOne('SELECT * FROM topics WHERE id = ?', [parseInt(req.params.id)]);
    res.json(topic);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await run('DELETE FROM topics WHERE id = ?', [parseInt(req.params.id)]);
    if (result.changes === 0) {
      res.status(404).json({ error: 'Topic not found' });
      return;
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
