import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../supabase';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  if (!supabaseAdmin) return res.status(500).json({ error: 'Server misconfigured: supabaseAdmin is null' });

  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.user = user; // Attach authenticated user to the request
  next();
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  if (!supabaseAdmin) return next();

  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    if (user) {
      req.user = user;
    }
  }
  next();
};
