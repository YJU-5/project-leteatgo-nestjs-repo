import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBoardDto {
  @ApiProperty({ description: '게시글 제목', example: '오늘의 점심' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: '게시글 내용',
    example: '맛있는 점심을 먹었습니다.',
  })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({
    description: '공지사항 여부',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isNotice?: boolean;
}
