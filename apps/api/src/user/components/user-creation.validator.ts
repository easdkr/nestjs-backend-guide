import { UserFinder } from '@api/user/components/user.finder';
import { ConflictException, Injectable } from '@nestjs/common';

@Injectable()
export class UserCreationValidator {
  constructor(private readonly userFinder: UserFinder) {}

  async validate(args: { email: string }) {
    const existingUser = await this.userFinder.findByEmail(args.email);

    if (existingUser) {
      throw new ConflictException('이미 존재하는 이메일입니다.');
    }
  }
}
