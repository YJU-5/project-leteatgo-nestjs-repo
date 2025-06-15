import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ChatRoomService } from './chat-room.service';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { FilterChatRoomDto } from './dto/filter-chat-room.dto';
import { Public } from 'src/decorator/public.decorator';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('chat-room')
@Controller('chat-room')
export class ChatRoomController {
  private readonly logger = new Logger(ChatRoomController.name);

  constructor(private readonly chatRoomService: ChatRoomService) {}

  // 채팅방 생성
  @Post()
  @ApiOperation({ summary: '채팅방 생성' })
  @ApiResponse({ status: 201, description: '채팅방이 생성되었습니다.' })
  createChatRoom(@Req() req, @Body() createChatRoomDto: CreateChatRoomDto) {
    const socialId = req.user.socialId;
    return this.chatRoomService.createChatRoom(createChatRoomDto, socialId);
  }

  // 모든 채팅방 조회
  @Get()
  @Public()
  @ApiOperation({ summary: '모든 채팅방 조회' })
  @ApiResponse({ status: 200, description: '모든 채팅방 목록을 반환합니다.' })
  chatRoomfindAll() {
    return this.chatRoomService.chatRoomfindAll();
  }

  // 위치 기반 채팅방 조회 (필터링 포함)
  @Get('map')
  @Public()
  @ApiOperation({ summary: '위치 기반 채팅방 조회' })
  @ApiResponse({
    status: 200,
    description: '필터링된 채팅방 목록을 반환합니다.',
  })
  async getChatRoomsByLocation(@Query() filterDto: FilterChatRoomDto) {
    this.logger.log(
      `위치 기반 채팅방 조회 요청 - 위도: ${filterDto.latitude}, 경도: ${filterDto.longitude}`,
    );

    if (!filterDto.latitude || !filterDto.longitude) {
      throw new HttpException(
        '위도와 경도는 필수 파라미터입니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const chatRooms =
        await this.chatRoomService.getChatRoomsByLocation(filterDto);
      this.logger.log(`조회된 채팅방 수: ${chatRooms.length}`);
      return chatRooms;
    } catch (error) {
      this.logger.error('채팅방 조회 중 오류 발생:', error.stack);
      throw new HttpException(
        '채팅방 조회 중 오류가 발생했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 필터링된 채팅방 목록 조회
  @Get('filter')
  @Public()
  @ApiOperation({ summary: '필터링된 채팅방 조회' })
  @ApiResponse({
    status: 200,
    description: '필터링된 채팅방 목록을 반환합니다.',
  })
  getFilteredChatRooms(@Query() filterDto: FilterChatRoomDto) {
    return this.chatRoomService.getFilteredChatRooms(filterDto);
  }
}
