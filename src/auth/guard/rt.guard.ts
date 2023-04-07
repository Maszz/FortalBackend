import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export class RtGuard extends AuthGuard('jwt-refresh') {
  canActivate(context: ExecutionContext) {
    // Add your custom authentication logic here
    // for example, call super.logIn(request) to establish a session.

    return super.canActivate(context);
  }
  /**
   * should cast any type no matter what , this methods use generic<t = any> .
   * @param err
   * @param user
   * @param info
   * @returns
   */
  handleRequest(err, user, info) {
    // You can throw an exception based on either "info" or "err" arguments

    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
