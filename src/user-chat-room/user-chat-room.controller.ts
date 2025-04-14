import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserChatRoomService } from './user-chat-room.service';
import { CreateUserChatRoomDto } from './dto/create-user-chat-room.dto';
import { UpdateUserChatRoomDto } from './dto/update-user-chat-room.dto';

@Controller('user-chat-room')
export class UserChatRoomController {
  constructor(private readonly userChatRoomService: UserChatRoomService) {}
}
