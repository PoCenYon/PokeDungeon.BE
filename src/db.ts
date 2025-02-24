import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || '', {
      dbName: 'poke-dungeon',
      serverSelectionTimeoutMS: 5000, // 5초 내에 연결하지 못하면 오류 발생
      socketTimeoutMS: 45000, // 소켓 타임아웃 설정
    });
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  }
};