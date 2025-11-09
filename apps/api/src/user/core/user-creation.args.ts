import { ExcludeMethod } from '@libs/common/utils/types/constructors';
import type { User } from './user.entity';

export type UserCreationArgs = Omit<
  ExcludeMethod<User>,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
  | 'termsAgreed'
  | 'marketingAgreed'
>;
