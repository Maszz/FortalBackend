import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
export const GetCurrentUserCookie = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest() as Request;
    return data ? request.signedCookies?.[data] : request.signedCookies;
  },
);
