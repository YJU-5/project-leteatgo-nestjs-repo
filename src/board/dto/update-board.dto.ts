import { PartialType } from '@nestjs/swagger';
import { CreateBoardDto } from './create-board.dto';
import { IsOptional, IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBoardDto extends PartialType(CreateBoardDto) {
  @ApiProperty({
    description: '남아있는 기존 이미지 URL 목록 (JSON 문자열)',
    example: '["https://bucket.s3.region.amazonaws.com/image1.jpg"]',
    required: false,
  })
  @IsOptional()
  @IsString()
  existingImageUrls?: string;
}
