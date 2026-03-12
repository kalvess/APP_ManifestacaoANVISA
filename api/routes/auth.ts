import { Router, type Response } from 'express';
import { requireAuth, type AuthRequest } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * GET /api/auth/me
 * Returns the current user profile
 */
router.get('/me', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Here we could fetch additional profile data from public.usuarios table
    // For now, return the user object from Supabase Auth
    res.status(200).json({ user: req.user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

export default router;
