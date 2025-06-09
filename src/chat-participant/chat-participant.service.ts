import { Injectable } from '@nestjs/common';
import { CreateChatParticipantDto } from './dto/create-chat-participant.dto';
import { UpdateChatParticipantDto } from './dto/update-chat-participant.dto';
import { ChatParticipant } from './entities/chat-participant.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { privateDecrypt } from 'crypto';
import { Repository } from 'typeorm';

@Injectable()
export class ChatParticipantService {
  constructor(
    @InjectRepository(ChatParticipant)
    private readonly chatParticipant: Repository<ChatParticipant>,
  ){}

  // 참가한 채팅방 목록 만들기
  async chatParticipantCreateUser(userId,chatRoomId){
    const createUser = await this.chatParticipant.create({
      chatRoomId: chatRoomId,
      userId:userId,
    })
    console.log(createUser);
    await this.chatParticipant.save(createUser)
  }

  // 참가한 채팅방 목록 가져오기 
  async chatParticipantGetUser(userId,chatRoomId){
      const getUser = await this.chatParticipant.findOne({
        where:{
          userId:{id:userId},
          chatRoomId:{id:chatRoomId},
        },
        relations:['userId','chatRoomId']
      })
      return getUser ?? null;
  }

  // 참가한 채팅방 목록 삭제 
  async chatParticipantDeleteUser(userId,chatRoomId){
    const deleteUser = await this.chatParticipant.delete({
      userId:userId,
      chatRoomId:chatRoomId,
    })
  }
}
