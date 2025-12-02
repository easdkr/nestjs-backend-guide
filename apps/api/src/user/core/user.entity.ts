import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import bcrypt from 'bcrypt';
import { Gender } from './gender.enum';
import { Role } from './role.enum';
import { UserCreationArgs } from './user-creation.args';

@Entity()
export class User {
  @PrimaryKey()
  id: number;

  @Property({ type: 'text', unique: true })
  email: string;

  @Property({ type: 'text' })
  password: string;

  @Property({ type: 'text' })
  nickname: string;

  @Property({ type: 'date' })
  birthDate: Date;

  @Property({ type: 'text' })
  gender: Gender;

  @Property({ type: 'text', default: Role.USER })
  role: Role = Role.USER;

  @Property({ nullable: true, type: 'timestamp with time zone' })
  termsAgreedAt: Date | null = null;

  @Property({ nullable: true, type: 'timestamp with time zone' })
  marketingAgreedAt: Date | null = null;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Property({ nullable: true, type: 'timestamp with time zone' })
  deletedAt: Date | null = null;

  static of(args: UserCreationArgs): User {
    const user = new User();
    user.email = args.email;
    user.hashPassword(args.password);
    user.nickname = args.nickname;
    user.birthDate = args.birthDate;
    user.gender = args.gender;
    user.termsAgreedAt = args.termsAgreedAt;
    user.marketingAgreedAt = args.marketingAgreedAt;
    return user;
  }

  get termsAgreed(): boolean {
    return this.termsAgreedAt !== null;
  }

  get marketingAgreed(): boolean {
    return this.marketingAgreedAt !== null;
  }

  hashPassword(plainPassword: string): void {
    const salt = bcrypt.genSaltSync(10);
    this.password = bcrypt.hashSync(plainPassword, salt);
  }

  verifyPassword(plainPassword: string): boolean {
    return bcrypt.compareSync(plainPassword, this.password);
  }

  changePassword(plainPassword: string): void {
    this.hashPassword(plainPassword);
  }

  updateProfile(data: Partial<User>): void {
    if (data.nickname !== undefined) {
      this.nickname = data.nickname;
    }
    if (data.birthDate !== undefined) {
      this.birthDate = data.birthDate;
    }
    if (data.gender !== undefined) {
      this.gender = data.gender;
    }
    if (data.termsAgreedAt !== undefined) {
      this.termsAgreedAt = data.termsAgreedAt;
    }
    if (data.marketingAgreedAt !== undefined) {
      this.marketingAgreedAt = data.marketingAgreedAt;
    }
  }

  delete(): void {
    this.deletedAt = new Date();
  }

  isActive(): boolean {
    return this.deletedAt === null;
  }

  isAdmin(): boolean {
    return this.role === Role.ADMIN;
  }

  hasRole(role: Role): boolean {
    return this.role === role;
  }
}
