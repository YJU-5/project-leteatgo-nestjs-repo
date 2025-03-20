import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthService } from 'src/auth/auth.service';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { KakaoStrategy } from 'src/auth/kakao.strategy';
import { S3Module } from 'src/s3/s3.module';
import { GoogleStrategy } from 'src/auth/google.strategy';
import { UserChatRoomModule } from 'src/user-chat-room/user-chat-room.module';

@Module({
  imports:[TypeOrmModule.forFeature([User]), AuthModule, S3Module,UserChatRoomModule],
  controllers: [UserController],
  providers: [UserService, KakaoStrategy, GoogleStrategy],
  exports:[UserService]
})
export class UserModule {}
