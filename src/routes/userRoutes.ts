import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleWares';
import { getUserProfile, updateUserProfile, changeUserPassword } from '../controllers/userController';


const router = express.Router();

router.get('/profile', authenticateToken, getUserProfile);
router.put('/profile', authenticateToken, updateUserProfile);
router.put('/change-password', authenticateToken, changeUserPassword);

export default router;