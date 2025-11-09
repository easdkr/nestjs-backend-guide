import { UserFinder } from '@api/user/components/user.finder';
import { User } from '@api/user/entities/user.entity';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class UserService {
  constructor(private readonly userFinder: UserFinder) {}

  async findOne(id: number): Promise<User> {
    const user = await this.userFinder.findById(id);

    if (!user || !user.isActive()) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    return user;
  }
}
