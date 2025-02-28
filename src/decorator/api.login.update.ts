import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';
//File 받기위한 데코레이터
export function ApiLoginUpdate() {
  return applyDecorators(
    UseInterceptors(FileInterceptor('pictureUrl')), // 기본적으로 dto의 이름이 설정됨
    ApiConsumes('multipart/form-data'), // Swagger 문서화
    ApiBody({ type: UpdateUserDto }), // Swagger 문서화
  );
}
