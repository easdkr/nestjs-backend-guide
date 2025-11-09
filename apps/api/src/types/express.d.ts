import { RequestUser } from '@api/user/types/request-user.type';

declare namespace Express {
  export interface Request {
    user: RequestUser;
  }
}
