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

  // ## 채팅방 생성 ##
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
    // jwt토큰으로 소셜아이디 추출 
    const socialId = req.user.socialId
    // 프론트에서 입력되어야하는 값을 정리한 dto와 소셜아이디, 사진 업로드 url을 createChatRoom에 보냄
    return this.chatRoomService.createChatRoom(createChatRoomDto, socialId, uploadedUrl);
  }

  // 전체 채팅방 조회
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
    // 프론트에서 받아온 chatRoomId를 이용하여 특정 채팅방을 찾는다
    return this.chatRoomService.chatRoomFindOne(chatRoomId)
  }

  // 채팅방 수정 기능 
  @Patch(':id')
  @ApiOperationDecorator('특정 채팅방 수정','# 특정 채팅방 수정',201,'수정 완료')
  @ApiChatCreate()
  @ApiBearerAuth()
  async updateChatRoom(
    @Body() updateChatRoomDto: UpdateChatRoomDto,
    @UploadedFile() file: Express.Multer.File,
    @Param('id') chatRoomId :string, 
  ){
    // S3에 이미지를 올리고 URL을 받아오는 로직
    let uploadedUrl:string=''
    if(file){
      uploadedUrl = await this.s3Service.uploadFile(file)
    }

    // dto, chatRoom, uploadedUrl을 chatRoomUpdate에 넘겨준다
    return this.chatRoomService.chatRoomUpdate(updateChatRoomDto, chatRoomId, uploadedUrl)
  }

}
