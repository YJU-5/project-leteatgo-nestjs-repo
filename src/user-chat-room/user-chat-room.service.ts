import { Injectable } from '@nestjs/common';
import { CreateUserChatRoomDto } from './dto/create-user-chat-room.dto';
import { UpdateUserChatRoomDto } from './dto/update-user-chat-room.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserChatRoom } from './entities/user-chat-room.entity';
import { privateDecrypt } from 'crypto';
import { Repository } from 'typeorm';
import { Review } from 'src/review/entities/review.entity';

@Injectable()
export class UserChatRoomService {
  constructor(
    @InjectRepository(UserChatRoom)
    private readonly userChatRoomRepository: Repository<UserChatRoom>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,

  ) { }

  // 채팅방 나가면 비활성화  
  async setUserChatRoomLeave(userId, chatRoomId) {
    // 채팅룸 게이트웨이에서 userId와 chatRoomId를 받아와서 유저 온라인 비활성화 isOnline: true 이면 유저가 아직 채팅방에 있는 상태임
    await this.userChatRoomRepository.update({ userId, chatRoomId }, {
      isActive: true
    })
  }

  // 유저가 연결을 끊을 때 (페이지를 나가거나 닫거나 이동하거나 나간것과는 다름 )
  async setUserChatRoomDisconnet(userId, chatRoomId) {
    // 채팅룸 게이트웨이에서 userId와 chatRoomId를 받아와서 유저 온라인 비활성화 isOnline: false 이면 유저가 나간 상태임
    await this.userChatRoomRepository.update({ userId, chatRoomId }, {
      isOnline: false
    })
  }

  // 유저가 연결 끊긴 방에 재접속 할 때 
  async setUserChatRoomOnline(userId, chatRoomId) {
    // 채팅룸 게이트웨이에서 userId와 chatRoomId를 받아와서 유저 활성화 isOnline: true 이면 유저가 접속 한 상태임
    await this.userChatRoomRepository.update({ userId, chatRoomId }, {
      isOnline: true
    })
  }

  // 유저 채팅 참여 목록 HOST 만들기 
  async userChatRoomCreateHost(userId, chatRoomId) {
    // chat-room service에서 userId, chatRoomId를 받는다 

    // chatRoomId와 userId와 만드는 사람이니까 역할을 # HOST # 로 지정해준다 
    const createHost = this.userChatRoomRepository.create({
      chatRoomId: chatRoomId,
      userId: userId,
      role: 'HOST'
    })

    // 실제 생성 
    const saveHost = await this.userChatRoomRepository.save(createHost)
    return saveHost
  }

  // 유저 채팅 참여 목록 USER 만들기 
  async userChatRoomCreateUser(userId, chatRoomId) {
    // 채팅룸 게이트웨이에서 userId와 chatRoomId를 받아와서 유저 활성화 isActive: true 이면 유저가 나간 상태임

    // 유저정보 정리 
    const createUser = this.userChatRoomRepository.create({
      chatRoomId: chatRoomId,
      userId: userId,
      role: 'USER'
    })

    // 유저정보 실제 생성 
    const saveUser = await this.userChatRoomRepository.save(createUser)
    return saveUser
  }

  // 유저 채팅 참여 목록 가져오기 
  async userChatRoomGet(userId, chatRoomId) {
    // 채팅룸 게이트웨이에서 userId와 chatRoomId를 받아와서 유저 채팅 참여 목록 가져오기 
    const user = await this.userChatRoomRepository.findOne({
      where: {
        userId: { id: userId },
        chatRoomId: { id: chatRoomId }
      },
      relations: ['userId', 'chatRoomId']
    })

    console.log('user', user); // 몇개를 가지고 오냐

    return user ?? null; // 찾지 못하면 null 반환 
  }

  // 유저 채팅 비활성화 -> 활성화
  async userChatRoomActiveUpdate(userId, chatRoomId) {
    // 채팅룸 게이트웨이에서 userId와 chatRoomId를 받아와서 유저 활성화 isActive: true 이면 유저가 나간 상태임
    this.userChatRoomRepository.update({ userId, chatRoomId }, {
      isActive: false
    })
  }

  // 내가 개최한 채팅 목록 
  async userChatRoomHosted(userId) {
    // user.controller.ts 에서 받아온 userId로 role(역할)이 HOST인 유저를 찾는다 
    const hostChatList = await this.userChatRoomRepository.find({
      where: {
        userId: { id: userId },
        role: 'HOST'
      },
      relations: ['userId', 'chatRoomId'] // userChatRoom과 조인되어있는 userId, chatRoomId에서 정보에서 찾는다 
    })

    // 여러 배열로 되어있는 목록을 나눔  
    const chatRoomList = hostChatList.map(item => item.chatRoomId)

    return chatRoomList
  }

  // 내가 참가한 채팅 목록
  async userChatRoomJoin(userId: string) {
    const userChatList = await this.userChatRoomRepository.find({
      where: {
        userId: { id: userId },
        role: 'USER',
      },
      relations: ['userId', 'chatRoomId'],
    });

    const chatRoomList = await Promise.all(
      userChatList.map(async (item) => {
        const chatRoom = item.chatRoomId;

        const [completed, reviews] = await Promise.all([
          this.reviewRepository.exists({
            where: {
              chatRoom: { id: chatRoom.id },
              reviewer: { id: userId },
            },
          }),
          this.reviewRepository.count({
            where: {
              chatRoom: { id: chatRoom.id },
            },
          }),
        ]);

        return {
          ...chatRoom,
          completed: completed,
          reviews,
        };
      }),
    );

    return chatRoomList;
  }

  // 채팅방 참여자 목록 
  async getRoomParticipants(chatRoomId) {
    // 채팅룸 게이트웨이에서 chatRoomId를 가져오고 그걸로 참여자 목록을 가져옴 
    const participants = await this.userChatRoomRepository.find({
      where: {
        chatRoomId: { id: chatRoomId },
        isActive: false,
      },
      relations: ['userId', 'chatRoomId'] // userId, chatRoomId 조인한 값을 참조 
    })

    return participants
  }

}