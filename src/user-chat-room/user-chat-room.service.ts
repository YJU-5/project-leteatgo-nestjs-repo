import { Injectable } from '@nestjs/common';
import { CreateUserChatRoomDto } from './dto/create-user-chat-room.dto';
import { UpdateUserChatRoomDto } from './dto/update-user-chat-room.dto';

@Injectable()
export class UserChatRoomService {
  create(createUserChatRoomDto: CreateUserChatRoomDto) {
    return 'This action adds a new userChatRoom';
  }

  findAll() {
    return `This action returns all userChatRoom`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userChatRoom`;
  }

  update(id: number, updateUserChatRoomDto: UpdateUserChatRoomDto) {
    return `This action updates a #${id} userChatRoom`;
  }

  remove(id: number) {
    return `This action removes a #${id} userChatRoom`;
  }
}
