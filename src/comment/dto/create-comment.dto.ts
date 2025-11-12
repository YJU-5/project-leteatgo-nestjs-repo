import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    description: '댓글 내용',
    example: '정말 맛있어 보이네요!',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
