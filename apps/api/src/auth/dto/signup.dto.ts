import {
  IsEmail,
  IsString,
  MinLength,
  Matches,
  IsDateString,
  IsEnum,
  IsBoolean,
  ValidateIf,
} from 'class-validator';
import { Gender } from '../entities/user.entity';

export class SignupDto {
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  email: string;

  @IsString()
  @MinLength(8, { message: '패스워드는 최소 8자 이상이어야 합니다.' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      '패스워드는 대문자, 소문자, 숫자, 특수문자를 각각 하나 이상 포함해야 합니다.',
  })
  password: string;

  @IsString()
  @MinLength(2, { message: '닉네임은 최소 2자 이상이어야 합니다.' })
  nickname: string;

  @IsDateString({}, { message: '올바른 날짜 형식이 아닙니다.' })
  birthDate: string;

  @IsEnum(Gender, { message: '올바른 성별 값이 아닙니다.' })
  gender: Gender;

  @IsBoolean({ message: '이용약관 동의 여부는 필수입니다.' })
  termsAgreed: boolean;

  @ValidateIf((o) => o.marketingAgreed !== undefined)
  @IsBoolean({ message: '마케팅 정보 동의 여부는 boolean 값이어야 합니다.' })
  marketingAgreed?: boolean;
}

