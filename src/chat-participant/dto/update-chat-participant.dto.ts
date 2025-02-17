import { PartialType } from '@nestjs/swagger';
import { CreateChatParticipantDto } from './create-chat-participant.dto';

export class UpdateChatParticipantDto extends PartialType(CreateChatParticipantDto) {}
