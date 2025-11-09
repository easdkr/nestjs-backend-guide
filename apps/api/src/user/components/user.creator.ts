import { CreateUserDto } from '@api/user/dto/create-user.dto';
import { User } from '@api/user/core/user.entity';
import { EntityRepository, MikroORM, Transactional } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserCreator {
  constructor(
    private readonly orm: MikroORM,
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
  ) {}

  @Transactional()
  async create(user: CreateUserDto) {
    const newUser = User.of({
      email: user.email,
      password: user.password,
      nickname: user.nickname,
      birthDate: new Date(user.birthDate),
      gender: user.gender,
      termsAgreedAt: user.termsAgreed ? new Date() : null,
      marketingAgreedAt: user.marketingAgreed ? new Date() : null,
    });

    this.userRepository.getEntityManager().persist(newUser);

    return newUser;
  }
}
