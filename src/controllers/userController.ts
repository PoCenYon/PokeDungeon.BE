import { Request, Response } from 'express';
import User from '../models/userModel';
import { comparePassword, hashPassword } from '../utils/passwordUtils';

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.body.user.id);
    if (!user) res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    else {
      res.json({ id: user.id, email: user.email, nickname: user.nickname, favoritePokemon: user.favoritePokemon });
    }
  } catch (error) {
    res.status(500).json({ message: '사용자 정보 불러오기 실패', error });
  }
};

export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  const { nickname, favoritePokemon } = req.body;

  try {
    const user = await User.findById(req.body.user.id);
    if (!user) res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    else {
      user.nickname = nickname;
      user.favoritePokemon = favoritePokemon;
      await user.save();

      res.json({ message: '프로필이 수정되었습니다.' });
    }
  } catch (error) {
    res.status(500).json({ message: '프로필 수정 중 오류 발생', error });
  }
};

export const changeUserPassword = async (req: Request, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.body.user.id);
    if (!user) res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    else {
      const isMatch = await comparePassword(currentPassword, user.password);
      if (!isMatch) res.status(401).json({ message: '현재 비밀번호가 일치하지 않습니다.' });

      user.password = await hashPassword(newPassword);
      await user.save();

      res.json({ message: '비밀번호가 변경되었습니다.' });
    }
  } catch (error) {
    res.status(500).json({ message: '비밀번호 변경 중 오류 발생', error });
  }
};