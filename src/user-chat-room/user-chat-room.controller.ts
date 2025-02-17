import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserChatRoomService } from './user-chat-room.service';
import { CreateUserChatRoomDto } from './dto/create-user-chat-room.dto';
import { UpdateUserChatRoomDto } from './dto/update-user-chat-room.dto';

@Controller('user-chat-room')
export class UserChatRoomController {
  constructor(private readonly userChatRoomService: UserChatRoomService) {}

  @Post()
  create(@Body() createUserChatRoomDto: CreateUserChatRoomDto) {
    return this.userChatRoomService.create(createUserChatRoomDto);
  }

  @Get()
  findAll() {
    return this.userChatRoomService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userChatRoomService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserChatRoomDto: UpdateUserChatRoomDto) {
    return this.userChatRoomService.update(+id, updateUserChatRoomDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userChatRoomService.remove(+id);
  }
}
