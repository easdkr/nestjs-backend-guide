import { Gender, User } from '@api/user/entities/user.entity';

export class UserResponseDto {
  id: number;
  email: string;
  nickname: string;
  birthDate: Date;
  gender: Gender;
  termsAgreed: boolean;
  marketingAgreed: boolean;
  createdAt: Date;
  updatedAt: Date;

  static from(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      birthDate: user.birthDate,
      gender: user.gender,
      termsAgreed: user.termsAgreed,
      marketingAgreed: user.marketingAgreed,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
