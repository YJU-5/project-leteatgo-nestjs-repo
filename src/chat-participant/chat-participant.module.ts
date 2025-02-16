import { Module } from '@nestjs/common';
import { ChatParticipantService } from './chat-participant.service';
import { ChatParticipantController } from './chat-participant.controller';

@Module({
  controllers: [ChatParticipantController],
  providers: [ChatParticipantService],
})
export class ChatParticipantModule {}
