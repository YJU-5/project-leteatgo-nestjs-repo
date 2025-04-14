import { Module } from '@nestjs/common';
import { ChatRoomService } from './chat-room.service';
import { ChatRoomController } from './chat-room.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRoom } from './entities/chat-room.entity';
import { UserModule } from 'src/user/user.module';
import { UserChatRoomModule } from 'src/user-chat-room/user-chat-room.module';
import { ChatParticipantModule } from 'src/chat-participant/chat-participant.module';
import { ChatRoomGateway } from './chat-room.gateway';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatRoom]),
    UserModule,
    UserChatRoomModule,
    ChatParticipantModule,
    JwtModule,
  ],
  controllers: [ChatRoomController],
  providers: [ChatRoomService, ChatRoomGateway],
  exports: [ChatRoomService],
})
export class ChatRoomModule {}
