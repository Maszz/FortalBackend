import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { SignUpDto, SignInRequestDto, TokenDto } from './auth.dto';
import { ConfigService } from '@nestjs/config';
import { JwtPayloadForSign } from '../types';
import { Request } from 'express';
import { TripleDES, enc } from 'crypto-js';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from 'prisma/prisma-client';

import {
  tokenType,
  ArgonHashPayload,
  TripleDesDecryptPayload,
} from './auth.processor.types';

@Injectable()
export class AuthService {
  private atPrivateKey: string;
  private rtPrivateKey: string;
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.atPrivateKey = this.configService.get<string>('jwtKey.at_privateKey');
    this.rtPrivateKey = this.configService.get<string>('jwtKey.rt_privateKey');
  }

  async signUpLocal(authDto: SignUpDto): Promise<TokenDto & { id: string }> {
    const hash = await this.hashData(authDto.password);

    const newUser = await this.prisma.user
      .create({
        data: {
          username: authDto.username,
          email: authDto.email,
          profile: {
            create: {
              realName: authDto.realName,
            },
          },
          userSecret: {
            create: {
              hashpw: hash,
            },
          },
          Session: {
            create: {
              hashedAt: null,
              hashedRt: null,
              Devices: {
                connectOrCreate: {
                  where: {
                    deviceId: authDto.deviceId,
                  },
                  create: {
                    deviceId: authDto.deviceId,
                    platform: authDto.platform,
                    manufacturer: authDto.manufacturer,
                  },
                },
              },
            },
          },
        },
      })
      .catch((error) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new ForbiddenException('Credentials incorrect');
          }
        }
        throw error;
      });
    // first session for this user only have 1 in query result
    const session = await this.prisma.session.findMany({
      where: { userId: newUser.id },
    });
    const tokens = await this.getTokens({
      sub: newUser.id,
      devId: session[0].id,
      isRefresh: false,
    });
    await this.updateRefreshTokenHash({
      at: tokens.access_token,
      rt: tokens.refresh_token,
      devId: session[0].id,
    });

    return { ...tokens, id: newUser.id };
  }
  async signinLocal(
    dto: SignInRequestDto,
  ): Promise<TokenDto & { onboarding: boolean; id: string }> {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
      include: {
        userSecret: true,
      },
    });

    if (!user) throw new ForbiddenException('Access Denied(User)');

    const passwordMatches = await argon.verify(
      user.userSecret.hashpw,
      dto.password,
    );
    if (!passwordMatches) throw new ForbiddenException('Access Denied');

    // Check user login from new Device or not ,if new device then create new session for it.
    const sessionRef = await this.prisma.session.findMany({
      where: {
        Devices: {
          is: {
            deviceId: dto.deviceId,
          },
        },
        userId: user.id,
      },
    });
    let tokens: TokenDto;
    let session: string;
    if (sessionRef[0]) {
      tokens = await this.getTokens({
        sub: user.id,
        devId: sessionRef[0].id,
        isRefresh: false,
      });
      session = sessionRef[0].id;
    }
    if (sessionRef.length === 0) {
      // const hashRt = await this.hashData(tokens.refresh_token);

      const newSession = await this.prisma.session.create({
        data: {
          Devices: {
            connectOrCreate: {
              where: {
                deviceId: dto.deviceId,
              },
              create: {
                platform: dto.platform,
                manufacturer: dto.manufacturer,
                deviceId: dto.deviceId,
              },
            },
          },
          user: {
            connect: {
              id: user.id,
            },
          },
          hashedAt: null,
          hashedRt: null,
        },
      });
      tokens = await this.getTokens({
        sub: user.id,
        devId: newSession.id,
        isRefresh: false,
      });
      session = newSession.id;
    }

    await this.updateRefreshTokenHash({
      at: tokens.access_token,
      rt: tokens.refresh_token,
      devId: session,
    });

    return { ...tokens, onboarding: user.onboarding, id: user.id };
  }
  /**
   * Multi device support
   * @TODO - create 1-to-many relation between user and session
   *       - remove userId from jwtpayload (don't need it), this day include it cause of
   *         logout use it for query secret table. when have session table can use sub to query rt
   *          from session table directly
   *       - update logout logic to use session table
   * @FINISH
   */
  async logout(devId: string): Promise<boolean> {
    await this.prisma.session.updateMany({
      where: {
        hashedRt: {
          not: null,
        },
        id: devId,
      },
      data: { hashedRt: null, hashedAt: null },
    });
    return true;
  }

  async getTokens(payload: {
    sub: string;
    devId: string;
    isRefresh?: boolean;
  }): Promise<TokenDto> {
    const at = this.jwtService.signAsync(
      { sub: payload.sub, did: payload.devId },
      {
        expiresIn: '20m',
        algorithm: 'RS256',
        privateKey: this.atPrivateKey,
      },
    );
    const rt = this.jwtService.signAsync(
      { sub: payload.sub, did: payload.devId },
      {
        expiresIn: '1d',
        algorithm: 'RS256',
        privateKey: this.rtPrivateKey,
      },
    );

    return {
      access_token: await at,
      refresh_token: await rt,
    };
  }
  async refreshTokens(params: {
    userId: string;
    rt: string;
    devId: string;
  }): Promise<TokenDto> {
    const { userId, rt, devId } = params;
    const session = await this.prisma.session.findUnique({
      where: { id: devId },
    });
    // console.log(session);
    if (!session || !session.hashedRt)
      throw new ForbiddenException('Access Denied');

    const rtMatches = await argon.verify(session.hashedRt, rt);
    if (!rtMatches) throw new ForbiddenException('Access Denied');

    // when session come from refresh controller don't need to decrypt username because it need to re encrypt
    // to pass with payload anyway
    const tokens = await this.getTokens({
      sub: userId,
      devId: devId,
      isRefresh: true,
    });
    await this.updateRefreshTokenHash({
      at: tokens.access_token,
      rt: tokens.refresh_token,
      devId: devId,
    });

    return tokens;
  }

  async updateRefreshTokenHash(params: {
    at: string;
    rt: string;
    devId: string;
  }): Promise<void> {
    /**
     * At - don't need to hash because it's short lived and frequently use to verify
     */
    const { at, rt, devId } = params;
    const hash = await this.hashData(rt);

    // console.log(ref);
    await this.prisma.session.update({
      where: { id: devId },
      data: { hashedRt: hash, hashedAt: at },
    });
  }

  async hashData(data: string): Promise<string> {
    const hashed = await argon.hash(data);
    return hashed;
  }

  async decryptJwtPayload(payload: TripleDesDecryptPayload) {
    const secret =
      payload.type === tokenType.accessToken
        ? this.atPrivateKey
        : this.rtPrivateKey;

    const decrypted = TripleDES.decrypt(payload.data, secret);

    return decrypted.toString(enc.Utf8);
  }
}
