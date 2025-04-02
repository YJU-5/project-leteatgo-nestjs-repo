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
  async createChatRoom(createChatRoomDto: CreateChatRoomDto , socialId, uploadedUrl) {
    const user = await this.userService.getProfile(socialId)

    const newChatRoom = this.chatRoomRepository.create({
      ...createChatRoomDto,
      hostId: user,
      pictureUrl:uploadedUrl,
      status: 'IN_PROGRESS',
    })
    
    const saveChatRoom = await this.chatRoomRepository.save(newChatRoom)

    // UserChatRoom에 HOST 등록
    this.userChatRoomService.userChatRoomCreateHost(user,saveChatRoom)
    
    return saveChatRoom
  }

    // 채팅방 수정 기능 
    async chatRoomUpdate(updateChatRoomDto: UpdateChatRoomDto, chatRoomId, uploadedUrl){
      // URL이 없으면 사진 URL 반영안함 
      if(uploadedUrl.length<=0){
        await this.chatRoomRepository.update(chatRoomId,{
          ...updateChatRoomDto,
        })
      }else{
        await this.chatRoomRepository.update(chatRoomId,{
          ...updateChatRoomDto,
          pictureUrl:uploadedUrl
        })
      }
      const updatedChatRoom = await this.chatRoomFindOne(chatRoomId)
      return updatedChatRoom
    }

  // 전체 채팅방 조회
  async chatRoomFindAll() {
    const chatRooms = await this.chatRoomRepository.find({
      where:{status:'IN_PROGRESS'}
    })
    return chatRooms
  }

  // 특정 채팅방 조회 
  async chatRoomFindOne(chatRoomId){
    const chatRoom = await this.chatRoomRepository.findOne({where:{id:chatRoomId}})
    return chatRoom
  }
}
