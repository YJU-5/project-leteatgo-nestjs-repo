import { Module } from '@nestjs/common';
import { ChatParticipantService } from './chat-participant.service';
import { ChatParticipantController } from './chat-participant.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatParticipant } from './entities/chat-participant.entity';

@Module({
  imports:[TypeOrmModule.forFeature([ChatParticipant])],
  controllers: [ChatParticipantController],
  providers: [ChatParticipantService],
  exports:[ChatParticipantService]
})
export class ChatParticipantModule {}
