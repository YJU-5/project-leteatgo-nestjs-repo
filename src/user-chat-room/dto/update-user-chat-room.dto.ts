import { PartialType } from '@nestjs/swagger';
import { CreateUserChatRoomDto } from './create-user-chat-room.dto';

export class UpdateUserChatRoomDto extends PartialType(CreateUserChatRoomDto) {}
