import { Module } from '@nestjs/common';
import { UserChatRoomService } from './user-chat-room.service';
import { UserChatRoomController } from './user-chat-room.controller';

@Module({
  controllers: [UserChatRoomController],
  providers: [UserChatRoomService],
})
export class UserChatRoomModule {}
