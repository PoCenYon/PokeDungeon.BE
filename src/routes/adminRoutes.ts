import { Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../middlewares/authMiddleWares';
import router from './authRoutes';

router.get('/admin/dashboard', authenticateToken, (req: Request, res: Response, next: NextFunction): void => {
  res.status(200).json({ message: `관리자 ${req.body.user.email}님 환영합니다!` });
});