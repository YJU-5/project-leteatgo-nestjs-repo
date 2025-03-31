import { Injectable } from '@nestjs/common';
import { CreateUserChatRoomDto } from './dto/create-user-chat-room.dto';
import { UpdateUserChatRoomDto } from './dto/update-user-chat-room.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserChatRoom } from './entities/user-chat-room.entity';
import { privateDecrypt } from 'crypto';
import { Repository } from 'typeorm';

@Injectable()
export class UserChatRoomService {
  constructor(
    @InjectRepository(UserChatRoom)
    private readonly userChatRoomRepository:Repository<UserChatRoom>,

  ){}
  
  // 채팅방 나가면 비활성화  
  async setUserChatRoomLeave(userId, chatRoomId){
    await this.userChatRoomRepository.update({userId,chatRoomId},{
      isActive:true
    })
  }

  // 유저가 연결을 끊을 때 (페이지를 나가거나 닫거나 이동하거나 나간것과는 다름 )
  async setUserChatRoomDisconnet(userId,chatRoomId){
    await this.userChatRoomRepository.update({userId,chatRoomId},{
      isOnline:false
    })
  }

  // 유저가 연결 끊긴 방에 재접속 할 때 
  async setUserChatRoomOnline(userId,chatRoomId){
    await this.userChatRoomRepository.update({userId,chatRoomId},{
      isOnline:true
    })
  }

  // 유저 채팅 참여 목록 HOST 만들기 
  async userChatRoomCreateHost(userId, chatRoomId){
    const createHost = this.userChatRoomRepository.create({
      chatRoomId:chatRoomId,
      userId:userId,
      role:'HOST'
    })
    console.log('createHost',createHost); // 완료 

    const saveHost = await this.userChatRoomRepository.save(createHost)
    return saveHost
  }

  // 유저 채팅 참여 목록 USER 만들기 
  async userChatRoomCreateUser(userId,chatRoomId){
    // 만들지를 못함 
    const createUser = this.userChatRoomRepository.create({
      chatRoomId:chatRoomId,
      userId:userId,
      role:'USER'
    })
    const saveUser = await this.userChatRoomRepository.save(createUser)
    return saveUser
  }

  // 유저 채팅 참여 목록 가져오기 
  async userChatRoomGet(userId,chatRoomId){
    // 릴레이션으로 찾을 때는 이름 잘 확인하고 찾아라 
    const user = await this.userChatRoomRepository.findOne({
      where:{
        userId:{id:userId},
        chatRoomId:{id:chatRoomId} 
      },
      relations:['userId','chatRoomId']
    })

    return user ?? null ; // 찾지 못하면 null 반환 
  }
  
  // 유저 채팅 비활성화 -> 활성화
  async userChatRoomActiveUpdate(userId,chatRoomId){
    this.userChatRoomRepository.update({userId,chatRoomId},{
      isActive:false
    })
  }


  // 내가 개최한 채팅 목록 
  // 여러개도 가능함?
  async userChatRoomHosted(userId){
    const hostChatList = await this.userChatRoomRepository.find({
      where:{
        userId:{id:userId},
        role:'HOST'
      },
      relations:['userId','chatRoomId']
    })

    // chatRoomId 목록만 추출 
    const chatRoomList = hostChatList.map(item=> item.chatRoomId)

    return chatRoomList
  }

  // 내가 참가한 채팅 목록
  async userChatRoomJoin(userId){
  const userChatList = await this.userChatRoomRepository.find({
    where:{
      userId:{id:userId},
      role:'USER',
    },
    relations:['userId','chatRoomId']
  })
  const chatRoomList = userChatList.map(item=> item.chatRoomId)

  return chatRoomList
  }

  // 채팅방 참여자 목록 
  async getRoomParticipants(chatRoomId){
    const participants = await this.userChatRoomRepository.find({
      where:{
        chatRoomId:{id:chatRoomId},
        isActive:false,
      },
      relations:['userId','chatRoomId']
    })

    const users = participants.map(user =>({
      name:user.userId.name,
      pictureUrl:user.userId.pictureUrl,
      role:user.userId.role,
    }))
    return users
  }

}
