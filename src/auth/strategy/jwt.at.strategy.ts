import { ExtractJwt, Strategy, Inject } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, ForbiddenException } from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../../types';
import { AuthService } from '../auth.service';
import { LoggerService } from '../../logger/logger.service';
// import { TripleDesDecryptPayload, tokenType } from ;
import { tokenType, TripleDesDecryptPayload } from '../auth.processor.types';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { PrismaService } from '../../prisma/prisma.service';
import { Request } from 'express';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly redisService: RedisService,
    private readonly logger: LoggerService, // @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly prisma: PrismaService,
  ) {
    const extractJwtFromCookie = (req) => {
      let token = null;
      if (req && req.signedCookies) {
        token = req.signedCookies['jwt-accestoken'];
      }
      return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    };
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // jwtFromRequest: extractJwtFromCookie,
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKey: configService.get<string>('jwtKey.at_publicKey'),
    });
    this.redis = this.redisService.getClient();
  }

  async validate(
    req: Request,
    payload: JwtPayload,
  ): Promise<JwtPayload | boolean> {
    if (!payload) {
      return false;
    }
    const userSession = await this.prisma.session.findUnique({
      where: {
        id: payload.did,
      },
    });
    if (!userSession || !userSession.hashedAt || !userSession.hashedRt) {
      // no session found
      throw new ForbiddenException(
        'this session is not found, please login again, or you loggedout',
      );
      return false;
    }
    const accessToken = req?.get('authorization')?.replace('Bearer', '').trim();
    if (userSession.hashedAt !== accessToken) {
      // at is not matched with device id
      throw new ForbiddenException(
        'Access token expired due to new session appear',
      );
    }

    return payload;
  }
}
