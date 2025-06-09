import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ){}

  async saveMessage(roomId, userId, content){

    // 채팅룸 게이트웨이에서 roomId, userId, content(message)를 받아서 
    // message로 정리 
    const message = this.messageRepository.create({
      userId:userId,
      chatRoomId:roomId,
      message:content,
    })

    // 메세지 DB에 저장 
    return await this.messageRepository.save(message)
  }

  async getMessage(roomId):Promise<Message[]>{
    // 채팅룸 게이트웨이에서 roomId를 받아서 
    const messages = await this.messageRepository.find({
      where:{chatRoomId:{id:roomId}}, // chatRoomId의 아이디가 roomId와 일치한 방의 메세지
      order:{createdAt:'ASC'}, // 옛날 순 
      relations:['userId'] // 메세지 보낸 사용자 아이디 
    })

    return messages
  }

}
