import mongoose, { Schema, Document } from 'mongoose';

// User 인터페이스 정의
interface IUser extends Document {
  id: string;               // 6자리 랜덤 숫자
  email: string;            // 이메일
  password: string;         // 암호화된 비밀번호
  created_at: Date;         // 계정 생성 날짜
  region: string;           // 유저 접속 지역
  warning_count: number;    // 경고 누적 횟수
  last_login?: Date;        // 마지막 로그인 시간 (추천)
  is_verified: boolean;     // 이메일 인증 여부 (추천)
  role: string;             // 유저 역할 (일반, 관리자 등 - 추천)
  verification_token?: string; // 인증 토큰 (추천)
  nickname?: string;         // 닉네임
  favoritePokemon?: string;  // 가장 좋아하는 포켓몬
}

// MongoDB 스키마 정의
const UserSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true }, // 6자리 랜덤 숫자
  email: { type: String, required: true, unique: true }, // 이메일
  password: { type: String, required: true }, // 암호화된 비밀번호
  created_at: { type: Date, default: Date.now }, // 계정 생성 날짜
  region: { type: String, required: true, default: 'Unknown' }, // 유저 접속 지역
  warning_count: { type: Number, default: 0 },
  last_login: { type: Date },
  is_verified: { type: Boolean, default: false },
  role: { type: String, default: 'user' },
  verification_token: { type: String },
  nickname: { type: String, default: 'Unknown' },
  favoritePokemon: { type: String, default: 'Unknown' },
});

// User 모델 생성
const User = mongoose.model<IUser>('User', UserSchema);

export default User;