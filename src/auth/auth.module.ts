import { Module, CacheModule } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/jwt.at.strategy';
import { AuthController } from './auth.controller';
import { RtStrategy } from './strategy/jwt.rt.strategy';

@Module({
  imports: [
    UserModule,
    CacheModule.register({}),
    PassportModule,
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
