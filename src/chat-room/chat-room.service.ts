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
    private readonly chatRoomRepository: Repository<ChatRoom>,
    private readonly userService: UserService,
    private readonly userChatRoomService: UserChatRoomService,
  ) { }

  // 채팅방 생성 
  // 태그, 카테고리 구현 필요 
  async createChatRoom(createChatRoomDto: CreateChatRoomDto, socialId, uploadedUrl) {

    // chat-room 컨트롤러에서 받은 소셜아이디로 유저를 찾는다
    const user = await this.userService.getProfile(socialId)

    // dto, user, url 정보를 정리       
    const newChatRoom = this.chatRoomRepository.create({
      ...createChatRoomDto,
      hostId: user, // host아이디를 user목록으로 정해준다 엔티티에 가보면 조인이 되어있어서 그대로 넣어주는 것 
      pictureUrl: uploadedUrl,
      status: 'IN_PROGRESS', // 진행중인 채팅방이라고 디폴트 값으로 정해줌 
    })

    // 실제 채팅방 생성 
    const saveChatRoom = await this.chatRoomRepository.save(newChatRoom)

    // UserChatRoom에 HOST 등록
    this.userChatRoomService.userChatRoomCreateHost(user, saveChatRoom)

    return saveChatRoom
  }

  // 채팅방 수정 기능 
  async chatRoomUpdate(updateChatRoomDto: UpdateChatRoomDto, chatRoomId, uploadedUrl) {
    // chat-room.controller에서 받아온 dto, chatRoomId, uploadUrl
    
    // uploadUrl 없으면 사진 URL 반영안함 
    if (uploadedUrl.length <= 0) {
      await this.chatRoomRepository.update(chatRoomId, {
        ...updateChatRoomDto,
      })
    } else { // 그게 아니면 사진URL도 반영한다 
      await this.chatRoomRepository.update(chatRoomId, {
        ...updateChatRoomDto,
        pictureUrl: uploadedUrl
      })
    }

    // 업데이트된 목록 가져오기 
    const updatedChatRoom = await this.chatRoomFindOne(chatRoomId)
    return updatedChatRoom
  }

  // 전체 채팅방 조회
  // 작성자 필요 
  // 채팅방 아이디 => 그 채팅방에 소속되어있고 HOST인 사람 
  async chatRoomFindAll() {
    const chatRooms = await this.chatRoomRepository.find({
      where: { status: 'IN_PROGRESS' }, // 현재 진행중인 채팅방
      relations: ['hostId', 'userChatRooms', 'categories'] // 만든사람의 정보, 참가자 정보, 카테고리 정보도 같이 불러오기
    })
    return chatRooms
  }

  // 특정 채팅방 조회 
  async chatRoomFindOne(chatRoomId) {
    // 가져온 chatRoomId로 여기에 해당하는 채팅방 조회 
    const chatRoom = await this.chatRoomRepository.findOne({ 
      where: { id: chatRoomId },
      relations:['hostId']
     })
    return chatRoom
  }
}
