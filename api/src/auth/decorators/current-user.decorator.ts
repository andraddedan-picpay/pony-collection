import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserData } from '../types/user-data';

export const CurrentUser = createParamDecorator(
  (_data, ctx: ExecutionContext): UserData => {
    const request = ctx.switchToHttp().getRequest<{ user: UserData }>();
    return request.user;
  },
);
