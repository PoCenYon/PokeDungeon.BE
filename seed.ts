// seed.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/userModel';
import { generateRandomId } from './src/utils/idUtils';
import { hashPassword } from './src/utils/passwordUtils';

dotenv.config();

const seedAdminUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || '', { dbName: 'poke-dungeon' });

    const adminUserExists = await User.findOne({ email: 'dongwook443@naver.com' });
    if (adminUserExists) {
      console.log('✅ Admin user already exists');
      return;
    }

    const adminUser = new User({
      id: generateRandomId(),
      email: 'dongwook443@naver.com',
      password: await hashPassword('asdf1234@@'),
      region: 'Global',
      role: 'admin',
      is_verified: true
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

seedAdminUser();