import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsArray,
  IsString,
  IsEnum,
} from 'class-validator';

export class FilterChatRoomDto {
  @ApiProperty({ description: '현재 위치의 위도' })
  @IsNumber()
  latitude: number;

  @ApiProperty({ description: '현재 위치의 경도' })
  @IsNumber()
  longitude: number;

  @ApiProperty({ description: '최소 거리 (km)', required: false })
  @IsOptional()
  @IsNumber()
  minDistance?: number;

  @ApiProperty({ description: '최대 거리 (km)', required: false })
  @IsOptional()
  @IsNumber()
  maxDistance?: number;

  @ApiProperty({ description: '최소 가격', required: false })
  @IsOptional()
  @IsNumber()
  minPrice?: number;

  @ApiProperty({ description: '최대 가격', required: false })
  @IsOptional()
  @IsNumber()
  maxPrice?: number;

  @ApiProperty({ description: '최소 나이', required: false })
  @IsOptional()
  @IsNumber()
  minAge?: number;

  @ApiProperty({ description: '최대 나이', required: false })
  @IsOptional()
  @IsNumber()
  maxAge?: number;

  @ApiProperty({
    description: '카테고리 목록',
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @ApiProperty({
    description: '성별 필터',
    required: false,
    enum: ['M', 'F', 'UNSPECIFIED'],
  })
  @IsOptional()
  @IsEnum(['M', 'F', 'UNSPECIFIED'])
  gender?: 'M' | 'F' | 'UNSPECIFIED';

  @ApiProperty({
    description: '채팅방 상태',
    required: false,
    enum: ['IN_PROGRESS', 'COMPLETED'],
  })
  @IsOptional()
  @IsEnum(['IN_PROGRESS', 'COMPLETED'])
  status?: 'IN_PROGRESS' | 'COMPLETED';
}
