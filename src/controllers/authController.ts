import jwt from 'jsonwebtoken';
import User from '../models/userModel';
import { comparePassword, hashPassword } from '../utils/passwordUtils';
import { generateRandomId } from '../utils/idUtils';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const { role } = req.body.user; // JWT에서 role 정보를 가져옴

  if (role !== 'admin') {
    res.status(403).json({ message: '접근 권한이 없습니다.' });
    return;
  }

  next();
};

export const sendVerificationEmail = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
      return;
    }

    const token = crypto.randomBytes(20).toString('hex'); // 인증 토큰 생성
    user.verification_token = token;
    user.is_verified = false;
    await user.save();

    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    await sendEmail(email, '이메일 인증', `계정을 인증하려면 다음 링크를 클릭하세요: ${verificationLink}`);

    res.status(200).json({ message: '이메일로 인증 링크가 전송되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: '이메일 전송 중 오류가 발생했습니다.', error });
  }
};

// 이메일 전송 함수
const sendEmail = async (to: string, subject: string, text: string) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text
  });
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.query;

  try {
    const user = await User.findOne({ verification_token: token });
    if (!user) {
      res.status(404).json({ message: '유효하지 않은 인증 토큰입니다.' });
      return;
    }

    user.is_verified = true;
    user.verification_token = undefined;
    await user.save();

    res.status(200).json({ message: '이메일이 인증되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: '이메일 인증 중 오류가 발생했습니다.', error });
  }
};

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

    // ✅ JWT 토큰 발급 (여기에 추가)
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret', // .env에 JWT_SECRET 추가 필요
      { expiresIn: '1h' }
    );


    res.status(200).json({ message: '로그인 성공', token });
  } catch (error) {
    res.status(500).json({ message: '로그인 중 오류가 발생했습니다.', error });
  }
};