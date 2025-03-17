import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChatParticipantService } from './chat-participant.service';
import { CreateChatParticipantDto } from './dto/create-chat-participant.dto';
import { UpdateChatParticipantDto } from './dto/update-chat-participant.dto';

@Controller('chat-participant')
export class ChatParticipantController {
  constructor(private readonly chatParticipantService: ChatParticipantService) {}
}
