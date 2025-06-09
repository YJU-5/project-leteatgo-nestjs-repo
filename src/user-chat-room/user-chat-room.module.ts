import { Module } from '@nestjs/common';
import { UserChatRoomService } from './user-chat-room.service';
import { UserChatRoomController } from './user-chat-room.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserChatRoom } from './entities/user-chat-room.entity';

@Module({
  imports:[TypeOrmModule.forFeature([UserChatRoom])],
  controllers: [UserChatRoomController],
  providers: [UserChatRoomService],
  exports:[UserChatRoomService]
})
export class UserChatRoomModule {}
