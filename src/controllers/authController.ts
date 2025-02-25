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

/**  이메일 전송 함수*/
const sendEmail = async (to: string, subject: string, text: string) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // 서비스 대신 명시적으로 설정
    port: 465,              // Gmail의 SSL 포트
    secure: true,           // SSL을 사용하므로 true로 설정
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // 앱 비밀번호 사용
    },
  });

  await transporter.sendMail({
    from: `"PokeDungeon" <${process.env.EMAIL_USER}>`, // 이메일 발신자
    to,                      // 수신자
    subject,                 // 이메일 제목
    html: `
      <div style="font-family: Arial, sans-serif; font-size: 16px;">
        <p>안녕하세요,</p>
        <p>계정을 인증하려면 본문의 링크를 클릭하세요</p>
        <hr />
        <p style="font-size: 12px; color: #555;">본 이메일은 PokeDungeon에서 발송되었습니다.</p>
      </div>
    `,
    text,                    // 텍스트 내용 (스팸 방지용으로 HTML과 함께 사용)
    headers: {
      'X-Mailer': 'NodeMailer',
      'X-Priority': '3', // 일반 우선순위
    },
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

    res.status(200).json({ message: '이메일이 인증되었습니다. 이제 로그인할 수 있습니다.' });
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
    const verificationToken = crypto.randomBytes(20).toString('hex'); // 이메일 인증 토큰 생성

    const newUser = new User({
      id: generateRandomId(),
      email,
      password: hashedPassword,
      region,
      role: 'user',
      is_verified: false,
      verification_token: verificationToken // 인증 토큰 저장
    });

    await newUser.save();

    // 이메일 인증 링크 전송
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    await sendEmail(email, '이메일 인증', `계정을 인증하려면 다음 링크를 클릭하세요: ${verificationLink}`);

    res.status(201).json({ message: '회원가입이 완료되었습니다. 이메일을 확인해 주세요.' });
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
      { expiresIn: '12h' }
    );


    res.status(200).json({ message: '로그인 성공', token });
  } catch (error) {
    res.status(500).json({ message: '로그인 중 오류가 발생했습니다.', error });
  }
};