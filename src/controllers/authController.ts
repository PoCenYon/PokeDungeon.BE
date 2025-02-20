import { Request, Response } from 'express';
import User from '../models/userModel';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword
    });

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      res.status(404).json({ message: 'User not found' }); // ✅ return 제거
      return; // <-- 함수 실행 종료를 위해 return 사용
    }

    const isMatch = await bcrypt.compare(password, user.get('password') as string);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid password' });
      return;
    }

    const token = jwt.sign({ id: user.get('id') }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '1h'
    });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error });
  }
};