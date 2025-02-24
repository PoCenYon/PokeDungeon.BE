import { Router } from 'express';
import { register, login, sendVerificationEmail, verifyEmail } from '../controllers/authController';
import { requireAdmin } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/send-verification-email', sendVerificationEmail);
router.get('/verify-email', verifyEmail);
router.get('/admin/dashboard', requireAdmin, (req, res) => {
  res.status(200).json({ message: '관리자 대시보드에 접근하였습니다.' });
});

export default router;