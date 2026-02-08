import { Router, Request, Response } from 'express';
import { searchEntries } from '../services/searchService';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const options = {
      query: (req.query.q as string) || '',
      equipment_id: req.query.equipment_id ? parseInt(req.query.equipment_id as string) : undefined,
      topic_id: req.query.topic_id ? parseInt(req.query.topic_id as string) : undefined,
      severity: req.query.severity as string | undefined,
      repair_type: req.query.repair_type as string | undefined,
      date_from: req.query.date_from as string | undefined,
      date_to: req.query.date_to as string | undefined,
      limit: parseInt(req.query.limit as string) || 20,
      offset: parseInt(req.query.offset as string) || 0,
    };
    const result = await searchEntries(options);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
