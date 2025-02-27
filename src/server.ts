import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler';
import userRoutes from './routes/userRoutes';

dotenv.config();
const app = express();

// app.use(cors({ origin: 'https://poke-dungeon.vercel.app', credentials: true }));
// ✅ CORS 설정
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // 프론트엔드 URL을 허용
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // 허용할 HTTP 메서드
  credentials: true // 쿠키 및 인증 정보를 허용 (필요한 경우)
}));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

mongoose.connect(process.env.MONGO_URI || '', { dbName: 'poke-dungeon' })
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection failed:', err));

// ✅ **에러 처리 미들웨어 (맨 아래에 추가해야 함)**
app.use(errorHandler);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});