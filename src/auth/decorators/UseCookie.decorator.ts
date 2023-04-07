import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request, Response } from 'express';

export const UseCookie = createParamDecorator(
  (useCookieContext: UseCookieContext, ctx: ExecutionContext) => {
    const response = ctx.switchToHttp().getResponse() as Response;
    let useCookie: (key?: string, value?: string) => void;
    if (useCookieContext == UseCookieContext.clearTokens) {
      useCookie = (key: string) => {
        return response.clearCookie(key);
      };
    } else {
      useCookie = (value: string) => {
        return response.cookie(useCookieContext, value, {
          // signed: true,
          // httpOnly: true,
          /**
           * use this when want use authorization header with Cookies
           */
        });
      };
    }

    return useCookie;
  },
);

export enum UseCookieContext {
  accessToken = 'jwt-accestoken',
  refreshToken = 'jwt-refreshtoken',
  clearTokens = 'jwt-clearToken',
}
