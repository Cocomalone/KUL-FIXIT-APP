import { Router, Request, Response } from 'express';
import { queryAll, queryOne, run } from '../db/helpers';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const rows = await queryAll(`
      SELECT e.*,
        (SELECT COUNT(*) FROM entries WHERE equipment_id = e.id) as entry_count
      FROM equipment e
      ORDER BY e.name
    `);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, model, manufacturer, category } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }
    const result = await run(
      'INSERT INTO equipment (name, model, manufacturer, category) VALUES (?, ?, ?, ?)',
      [name, model || '', manufacturer || '', category || '']
    );
    const equipment = await queryOne('SELECT * FROM equipment WHERE id = ?', [result.lastId]);
    res.status(201).json(equipment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, model, manufacturer, category } = req.body;
    const result = await run(
      'UPDATE equipment SET name = ?, model = ?, manufacturer = ?, category = ? WHERE id = ?',
      [name, model || '', manufacturer || '', category || '', parseInt(req.params.id)]
    );
    if (result.changes === 0) {
      res.status(404).json({ error: 'Equipment not found' });
      return;
    }
    const equipment = await queryOne('SELECT * FROM equipment WHERE id = ?', [parseInt(req.params.id)]);
    res.json(equipment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await run('DELETE FROM equipment WHERE id = ?', [parseInt(req.params.id)]);
    if (result.changes === 0) {
      res.status(404).json({ error: 'Equipment not found' });
      return;
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
