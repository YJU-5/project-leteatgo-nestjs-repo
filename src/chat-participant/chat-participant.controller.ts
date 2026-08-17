import { Controller } from '@nestjs/common';
import { ChatParticipantService } from './chat-participant.service';

@Controller('chat-participant')
export class ChatParticipantController {
  constructor(private readonly chatParticipantService: ChatParticipantService) {}
}
