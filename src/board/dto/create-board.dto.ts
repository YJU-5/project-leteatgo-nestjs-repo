import { IsString, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateBoardDto {
  @ApiProperty({
    description: '사진첩 제목',
    example: '홍대 이탈리안 레스토랑 모임 후기',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: '사진첩 내용',
    example: '오늘 새로 오픈한 이탈리안 레스토랑에서 6명이 모였습니다!',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
