import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { UserModule } from 'src/user/user.module';
import * as dotenv from 'dotenv';
import { GoogleStrategy } from './google.strategy';

// .env 파일을 로드
dotenv.config();

@Module({
  imports: [
    forwardRef(() => UserModule),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET, // 보안필요
      signOptions: { expiresIn: '84h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
