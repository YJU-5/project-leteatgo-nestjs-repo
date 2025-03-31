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
    console.log(roomId,userId,content);

    const message = this.messageRepository.create({
      userId:userId,
      chatRoomId:roomId,
      message:content,
    })
    return await this.messageRepository.save(message)
  }

  async getMessage(roomId):Promise<Message[]>{
    const messages = await this.messageRepository.find({
      where:{chatRoomId:{id:roomId}},
      order:{createdAt:'ASC'},
      relations:['userId']
    })

    return messages
  }

}
