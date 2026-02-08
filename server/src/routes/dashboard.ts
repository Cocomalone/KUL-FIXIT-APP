import { Router, Request, Response } from 'express';
import * as dashboardService from '../services/dashboardService';

const router = Router();

router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const stats = await dashboardService.getStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/frequent', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const issues = await dashboardService.getFrequentIssues(limit);
    res.json(issues);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/trends', async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 90;
    const trends = await dashboardService.getTrends(days);
    res.json(trends);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
