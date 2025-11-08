import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  email: string;

  @IsString({ message: '패스워드는 필수입니다.' })
  password: string;
}

