import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { ApiConsumes, ApiBody, ApiParam } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateReviewDto } from 'src/review/dto/create-review.dto';

export function ApiReviewCreate() {
  return applyDecorators(
      UseInterceptors(FilesInterceptor('pictureUrl')), // 기본적으로 dto의 이름이 설정됨
      ApiConsumes('multipart/form-data'), // Swagger 문서화
      ApiBody({ type: CreateReviewDto }), // Swagger 문서화
  );
}

