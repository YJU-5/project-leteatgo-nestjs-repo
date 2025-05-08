import { Module } from '@nestjs/common';
import { UserChatRoomService } from './user-chat-room.service';
import { UserChatRoomController } from './user-chat-room.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserChatRoom } from './entities/user-chat-room.entity';
import { Review } from 'src/review/entities/review.entity';

@Module({
  imports:[TypeOrmModule.forFeature([UserChatRoom,Review])],
  controllers: [UserChatRoomController],
  providers: [UserChatRoomService],
  exports:[UserChatRoomService]
})
export class UserChatRoomModule {}
