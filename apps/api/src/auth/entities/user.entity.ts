import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import * as bcrypt from 'bcrypt';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

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

  get termsAgreed(): boolean {
    return this.termsAgreedAt !== null;
  }

  get marketingAgreed(): boolean {
    return this.marketingAgreedAt !== null;
  }

  async verifyPassword(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.password);
  }

  async changePassword(plainPassword: string): Promise<void> {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(plainPassword, salt);
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

  softDelete(): void {
    this.deletedAt = new Date();
  }

  isActive(): boolean {
    return this.deletedAt === null;
  }
}

