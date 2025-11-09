import { RequestUser } from '@api/user/core/request-user';

declare namespace Express {
  export interface Request {
    user: RequestUser;
  }
}
