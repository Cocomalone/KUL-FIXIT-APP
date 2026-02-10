import { Router, Request, Response } from 'express';

const router = Router();

const APP_PASSWORD = process.env.APP_PASSWORD || 'kulfyx2025';

router.post('/login', (req: Request, res: Response) => {
  const { password } = req.body;
  if (password === APP_PASSWORD) {
    (req.session as any).authenticated = true;
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

router.get('/check', (req: Request, res: Response) => {
  if ((req.session as any)?.authenticated) {
    res.json({ authenticated: true });
  } else {
    res.status(401).json({ authenticated: false });
  }
});

router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: 'Failed to logout' });
    } else {
      res.json({ success: true });
    }
  });
});

export default router;
