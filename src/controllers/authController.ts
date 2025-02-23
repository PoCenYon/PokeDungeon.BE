import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import User from '../models/userModel';
import { comparePassword, hashPassword } from '../utils/passwordUtils';
import { generateRandomId } from '../utils/idUtils';

export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password, region } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: '이미 사용 중인 이메일입니다.' });
      return;
    }

    const hashedPassword = await hashPassword(password);
    const newUser = new User({
      id: generateRandomId(),
      email,
      password: hashedPassword,
      region
    });

    await newUser.save();
    res.status(201).json({ message: '회원가입이 완료되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: '회원가입 중 오류가 발생했습니다.', error });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
      return;
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
      return;
    }

    // 마지막 로그인 시간 업데이트
    user.last_login = new Date();
    await user.save();

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '1h'
    });

    res.status(200).json({ message: '로그인 성공', token });
  } catch (error) {
    res.status(500).json({ message: '로그인 중 오류가 발생했습니다.', error });
  }
};