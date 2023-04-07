import {
  Controller,
  Post,
  UseGuards,
  Req,
  Get,
  Body,
  UsePipes,
  ValidationPipe,
  Res,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { RtGuard } from './guard/rt.guard';
import {
  SignUpDto,
  SignInRequestDto,
  TokenDto,
  TokenDtoWithUserId,
  UserFromJwtDto,
} from './auth.dto';
import { GetCurrentUser } from './decorators/getCurrentUser.decorator';
import { Request, Response } from 'express';
import { GetCurrentUserCookie } from './decorators/getCurrentUserCookie.decorator';
import { UseCookie, UseCookieContext } from './decorators/UseCookie.decorator';
import {
  ApiProperty,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiTags,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';

export class AcessDeniedResponse {
  @ApiProperty()
  message: string;
  @ApiProperty()
  statusCode: number;
  @ApiProperty()
  error: string;
}

export class UnAuthorizedResponse {
  @ApiProperty()
  message: string;
  @ApiProperty()
  statusCode: number;
}
/**
 *  All use set cookies header when login from non browser fetch system should use storage to store accses token
 * then passing it via authorization header
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('/signup')
  @ApiCreatedResponse({
    description: 'Return Token',
    type: TokenDtoWithUserId,
  })
  async register(@Body() req: SignUpDto): Promise<TokenDtoWithUserId> {
    const {
      username,
      realName,
      email,
      password,
      deviceId,
      manufacturer,
      platform,
    } = req;
    const validatedDto = {
      username,
      realName,
      email,
      password,
      deviceId,
      manufacturer,
      platform,
    };
    const { access_token, refresh_token, id } =
      await this.authService.signUpLocal(validatedDto);

    return { userId: req.username, access_token, refresh_token, id: id };
  }

  @Post('/signin')
  @HttpCode(200)
  @ApiOkResponse({
    description: 'Return Token',
    type: TokenDtoWithUserId,
  })
  async login(
    @Body() req: SignInRequestDto,
  ): Promise<TokenDtoWithUserId & { onboarding: boolean }> {
    const { username, password, deviceId, manufacturer, platform } = req;
    const validatedDto = {
      username,
      password,
      deviceId,
      manufacturer,
      platform,
    };
    // console.log(validatedDto);
    const response = this.authService.signinLocal(validatedDto);
    const { access_token, refresh_token, onboarding, id } = await response;
    // console.log(rawReq.csrfToken());
    // useAccesTokenCookie(access_token);
    // useRefreshTokenCookie(refresh_token);

    return {
      userId: req.username,
      access_token,
      refresh_token,
      onboarding,
      id: id,
    };
  }
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('/logout')
  @ApiOkResponse({
    description: 'Return Token',
    type: Boolean,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @HttpCode(200)
  async logout(@GetCurrentUser('did') devId: string): Promise<boolean> {
    return this.authService.logout(devId);
  }

  @UseGuards(RtGuard)
  @ApiBearerAuth()
  @Post('/refresh')
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnAuthorizedResponse,
  })
  @ApiForbiddenResponse({
    description: 'Access denied',
    type: AcessDeniedResponse,
  })
  @ApiOkResponse({
    description: 'Return Token',
    type: TokenDto,
  })
  async refresh(
    @GetCurrentUser('sub') userId: string,
    // @GetCurrentUser('id') username: string,
    @GetCurrentUser('did') devId: string,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ): Promise<TokenDto> {
    // console.log(devId);
    const { access_token, refresh_token } =
      await this.authService.refreshTokens({
        userId: userId,
        rt: refreshToken,
        devId: devId,
      });

    return { access_token, refresh_token };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Return User',
    type: UserFromJwtDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @Get('/me')
  getProfile(@Req() req: Request) {
    return req.user;
  }
}
