import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestUser } from '../../user/types/request-user.type';

export const User = createParamDecorator(
  (data: keyof RequestUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Express.Request>();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
