import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateChatRoomDto } from 'src/chat-room/dto/create-chat-room.dto';
//File 받기위한 데코레이터
export function ApiChatCreate() {
  return applyDecorators(
    UseInterceptors(FileInterceptor('pictureUrl')), // 기본적으로 dto의 이름이 설정됨
    ApiConsumes('multipart/form-data'), // Swagger 문서화
    ApiBody({ type: CreateChatRoomDto }), // Swagger 문서화
  );
}
