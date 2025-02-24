import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler';

dotenv.config();
const app = express();

app.use(cors({ origin: 'https://poke-dungeon.vercel.app', credentials: true }));
app.use(express.json());
app.use('/api/auth', authRoutes);

mongoose.connect(process.env.MONGO_URI || '', { dbName: 'poke-dungeon' })
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection failed:', err));

// ✅ **에러 처리 미들웨어 (맨 아래에 추가해야 함)**
app.use(errorHandler);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});