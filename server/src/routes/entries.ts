import { Router, Request, Response } from 'express';
import * as entryService from '../services/entryService';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const options = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
      equipment_id: req.query.equipment_id ? parseInt(req.query.equipment_id as string) : undefined,
      topic_id: req.query.topic_id ? parseInt(req.query.topic_id as string) : undefined,
      severity: req.query.severity as string | undefined,
      repair_type: req.query.repair_type as string | undefined,
      sort_by: req.query.sort_by as string | undefined,
      sort_order: req.query.sort_order as string | undefined,
    };
    const result = await entryService.getAllEntries(options);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const entry = await entryService.getEntryById(parseInt(req.params.id));
    if (!entry) {
      res.status(404).json({ error: 'Entry not found' });
      return;
    }
    res.json(entry);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, question, answer } = req.body;
    if (!title || !question || !answer) {
      res.status(400).json({ error: 'Title, question, and answer are required' });
      return;
    }
    const entry = await entryService.createEntry(req.body);
    res.status(201).json(entry);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const entry = await entryService.updateEntry(parseInt(req.params.id), req.body);
    if (!entry) {
      res.status(404).json({ error: 'Entry not found' });
      return;
    }
    res.json(entry);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await entryService.deleteEntry(parseInt(req.params.id));
    if (!deleted) {
      res.status(404).json({ error: 'Entry not found' });
      return;
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/occurrences', async (req: Request, res: Response) => {
  try {
    const { reported_by, notes } = req.body;
    const occurrence = await entryService.logOccurrence(
      parseInt(req.params.id),
      reported_by || '',
      notes || ''
    );
    if (!occurrence) {
      res.status(404).json({ error: 'Entry not found' });
      return;
    }
    res.status(201).json(occurrence);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
