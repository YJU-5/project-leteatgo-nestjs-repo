import { Injectable } from '@nestjs/common';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { UpdateChatRoomDto } from './dto/update-chat-room.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatRoom } from './entities/chat-room.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { UserChatRoomService } from 'src/user-chat-room/user-chat-room.service';
import { ChatRoomGateway } from './chat-room.gateway';
import { ChatParticipantService } from 'src/chat-participant/chat-participant.service';

@Injectable()
export class ChatRoomService {
  constructor(
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepository:Repository<ChatRoom>,
    private readonly userService: UserService,
    private readonly userChatRoomService: UserChatRoomService,
  ){}

  // 채팅방 생성 
  // 태그, 카테고리 구현 필요 
  async createChatRoom(createChatRoomDto: CreateChatRoomDto , socialId) {
    const user = await this.userService.getProfile(socialId)
    const newChatRoom =this.chatRoomRepository.create({
      ...createChatRoomDto,
      hostId: user,
      status: 'IN_PROGRESS',
    })
    
    const saveChatRoom = await this.chatRoomRepository.save(newChatRoom)

    // UserChatRoom에 HOST 등록
    this.userChatRoomService.userChatRoomCreateHost(user,saveChatRoom)
    
    return saveChatRoom
  }

  // 전체 채팅방 조회
  async chatRoomfindAll() {
    const chatRooms = await this.chatRoomRepository.find()
    return chatRooms
  }
}
