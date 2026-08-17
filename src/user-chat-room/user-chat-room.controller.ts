import { Controller } from '@nestjs/common';
import { UserChatRoomService } from './user-chat-room.service';

@Controller('user-chat-room')
export class UserChatRoomController {
  constructor(private readonly userChatRoomService: UserChatRoomService) {}
}
