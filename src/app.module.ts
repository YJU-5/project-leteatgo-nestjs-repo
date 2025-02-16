import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmModuleOptions } from './configs/typeorm.config';
import { UserModule } from './user/user.module';
import { ChatRoomModule } from './chat-room/chat-room.module';
import { ReviewModule } from './review/review.module';
import { CategoryModule } from './category/category.module';
import { TagModule } from './tag/tag.module';
import { UserChatRoomModule } from './user-chat-room/user-chat-room.module';
import { MessageModule } from './message/message.module';
import { ChatParticipantModule } from './chat-participant/chat-participant.module';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmModuleOptions), UserModule, ChatRoomModule, ReviewModule, CategoryModule, TagModule, UserChatRoomModule, MessageModule, ChatParticipantModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
