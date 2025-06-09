import { Module } from '@nestjs/common';
import { ChatRoomService } from './chat-room.service';
import { ChatRoomController } from './chat-room.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRoom } from './entities/chat-room.entity';
import { UserModule } from 'src/user/user.module';
import { UserChatRoomModule } from 'src/user-chat-room/user-chat-room.module';
import { ChatParticipantModule } from 'src/chat-participant/chat-participant.module';
import { ChatRoomGateway } from './chat-room.gateway';
import { S3Module } from 'src/s3/s3.module';
import { MessageModule } from 'src/message/message.module';

@Module({
  imports:[TypeOrmModule.forFeature([ChatRoom]),UserModule, S3Module, UserChatRoomModule, ChatParticipantModule, MessageModule],
  controllers: [ChatRoomController],
  providers: [ChatRoomService, ChatRoomGateway],
})
export class ChatRoomModule {}
