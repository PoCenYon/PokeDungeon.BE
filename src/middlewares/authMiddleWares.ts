import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined;
  if (!token) {
    res.status(401).json({ message: '토큰이 없습니다.' });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET || 'secret';
    const user = jwt.verify(token, secret) as jwt.JwtPayload;
    req.body.user = user;
    next();
  } catch (err) {
    res.status(403).json({ message: '토큰이 유효하지 않습니다.' });
  }
};