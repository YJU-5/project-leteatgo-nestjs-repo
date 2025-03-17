import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseInterceptors } from '@nestjs/common';
import { ChatRoomService } from './chat-room.service';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { UpdateChatRoomDto } from './dto/update-chat-room.dto';
import { RequestWithUser } from 'src/user/request.interface';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiChatCreate } from 'src/decorator/api.chat.create.decorator';
import { Public } from 'src/decorator/public.decorator';

@Controller('chat-room')
export class ChatRoomController {
  constructor(private readonly chatRoomService: ChatRoomService) {}

  // 채팅방 생성 -> HOST 자동으로 참가 -> USER는 참여하고 싶으면 요청하고 참여 
  // 참가한 채팅방과 내가 호스트인 채팅방 구별필요 **
  // 태그, 카테고리 구현 필요
  @Post()
  @ApiChatCreate()
  @ApiBearerAuth()
  createChatRoom(
    @Req() req:RequestWithUser,
    @Body() createChatRoomDto: CreateChatRoomDto
  ) {
    console.log(createChatRoomDto);
    const socialId = req.user.socialId
    return this.chatRoomService.createChatRoom(createChatRoomDto, socialId);
  }

  // 전체 채팅방 조회 (어떤 것을 기준으로 해야할까?)
  @Get()
  @Public()
  chatRoomfindAll() {
    return this.chatRoomService.chatRoomfindAll();
  }

  // @@ 게이트웨이에서 처리하는게 나을 듯 @@
  // 채팅방 참여 
  // 서비스로 정보 보내기 -> 서비스에서 게이트웨이로 
  // @Post('join/:id')
  // @ApiBearerAuth()
  // async joinChatRoom(
  //   @Req() req:RequestWithUser,
  //   @Param('id') chatRoomId:string,
  // ){
  //   const socialId = req.user.socialId
  //   this.chatRoomService.joinChatRoom(socialId,chatRoomId)
  // }
}
