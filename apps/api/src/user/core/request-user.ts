import type { Role } from './role.enum';

export interface RequestUser {
  id: number;
  email: string;
  role: Role;
}
