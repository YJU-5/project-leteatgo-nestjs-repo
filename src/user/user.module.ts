import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthService } from 'src/auth/auth.service';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { GoogleStrategy } from 'src/auth/google.strategy';
import { KakaoStrategy } from 'src/auth/kakao.strategy';

@Module({
  imports:[TypeOrmModule.forFeature([User]), AuthModule],
  controllers: [UserController],
  providers: [UserService, KakaoStrategy],
})
export class UserModule {}
