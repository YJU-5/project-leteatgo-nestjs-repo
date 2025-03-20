import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ChatRoomService } from './chat-room.service';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { UpdateChatRoomDto } from './dto/update-chat-room.dto';
import { RequestWithUser } from 'src/user/request.interface';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiChatCreate } from 'src/decorator/api.chat.create.decorator';
import { Public } from 'src/decorator/public.decorator';
import { S3Service } from 'src/s3/s3.service';
import { ApiOperationDecorator } from 'src/decorator/api.operration.decorator';

@Controller('chat-room')
export class ChatRoomController {
  constructor(
    private readonly chatRoomService: ChatRoomService,
    private readonly s3Service: S3Service,

  ) {}

  // 채팅방 생성 -> HOST 자동으로 참가 -> USER는 참여하고 싶으면 요청하고 참여 
  // 참가한 채팅방과 내가 호스트인 채팅방 구별필요 **
  // 태그, 카테고리 구현 필요
  // 사진은?
  @Post()
  @ApiOperationDecorator('채팅방 생성','# 채팅방 생성',201,'생성 완료')
  @ApiChatCreate()
  @ApiBearerAuth()
  async createChatRoom(
    @Req() req:RequestWithUser,
    @Body() createChatRoomDto: CreateChatRoomDto,
    @UploadedFile() file: Express.Multer.File 
  ) {
    let uploadedUrl:string=''
    if(file){
      uploadedUrl = await this.s3Service.uploadFile(file)
    }
    const socialId = req.user.socialId
    return this.chatRoomService.createChatRoom(createChatRoomDto, socialId, uploadedUrl);
  }

  // 전체 채팅방 조회 (어떤 것을 기준으로 해야할까?)
  @Get()
  @ApiOperationDecorator('전체 채팅방 목록 조회','# 전체 채팅방 목록 조회',201,'조회 완료')
  @Public()
  chatRoomFindAll() {
    return this.chatRoomService.chatRoomFindAll();
  }

  // 특정 채팅방 조회 
  @Get(':id')
  @ApiOperationDecorator('특정 채팅방 조회','# 특정 채팅방 조회',201,'조회 완료')
  @Public()
  chatRoomFindOne(
    @Param('id') chatRoomId :string, 
  ){
    return this.chatRoomService.chatRoomFindOne(chatRoomId)
  }

  // 채팅방 수정 기능 // HOST만 가능 
  @Patch(':id')
  @ApiOperationDecorator('특정 채팅방 수정','# 특정 채팅방 수정',201,'수정 완료')
  @ApiChatCreate()
  @ApiBearerAuth()
  async updateChatRoom(
    @Body() updateChatRoomDto: UpdateChatRoomDto,
    @UploadedFile() file: Express.Multer.File,
    @Param('id') chatRoomId :string, 
  ){
    let uploadedUrl:string=''
    if(file){
      uploadedUrl = await this.s3Service.uploadFile(file)
    }
    return this.chatRoomService.chatRoomUpdate(updateChatRoomDto, chatRoomId, uploadedUrl)
  }

}
