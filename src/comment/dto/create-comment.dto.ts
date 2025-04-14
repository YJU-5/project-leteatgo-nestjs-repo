import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: '댓글 내용' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({ description: '게시글 ID' })
  @IsNotEmpty()
  @IsUUID()
  boardId: string;

  @ApiProperty({ description: '사용자 ID' })
  @IsNotEmpty()
  @IsUUID()
  userId: string;
}
