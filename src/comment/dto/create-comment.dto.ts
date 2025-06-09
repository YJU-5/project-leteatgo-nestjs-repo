import { IsString, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateCommentDto {
  @ApiProperty({
    example: "맛있어 보이네요! 저도 가보고 싶어요.",
    description: "댓글 내용",
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
