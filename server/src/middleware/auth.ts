import { Request, Response, NextFunction } from 'express';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Allow auth routes through without authentication
  if (req.path.startsWith('/api/auth/')) {
    return next();
  }

  if ((req.session as any)?.authenticated) {
    return next();
  }

  res.status(401).json({ error: 'Authentication required' });
}
