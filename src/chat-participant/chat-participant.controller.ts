import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChatParticipantService } from './chat-participant.service';
import { CreateChatParticipantDto } from './dto/create-chat-participant.dto';
import { UpdateChatParticipantDto } from './dto/update-chat-participant.dto';

@Controller('chat-participant')
export class ChatParticipantController {
  constructor(private readonly chatParticipantService: ChatParticipantService) {}

  @Post()
  create(@Body() createChatParticipantDto: CreateChatParticipantDto) {
    return this.chatParticipantService.create(createChatParticipantDto);
  }

  @Get()
  findAll() {
    return this.chatParticipantService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatParticipantService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChatParticipantDto: UpdateChatParticipantDto) {
    return this.chatParticipantService.update(+id, updateChatParticipantDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatParticipantService.remove(+id);
  }
}
