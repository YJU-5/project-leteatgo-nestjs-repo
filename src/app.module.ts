import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmModuleOptions } from './configs/typeorm.config';
import { UserModule } from './user/user.module';
import { ChatRoomModule } from './chat-room/chat-room.module';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmModuleOptions), UserModule, ChatRoomModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
