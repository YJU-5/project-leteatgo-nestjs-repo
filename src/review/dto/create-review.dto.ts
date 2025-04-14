import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, Max, Min } from "class-validator";

export class CreateReviewDto {

  //평가내용
  @ApiProperty({ description: '리뷰 내용', example: '정말 친절하고 유쾌하신 분이에요!' })
  @IsString()
  description: string;

  //사진
  @ApiProperty({ type: 'string', format: 'binary', required: false, description:'첨부이미지' })
  @IsNumber()
  pictureurl:string;

  //친절함
  @ApiProperty({ description: '친절함', example:5})
  @IsNumber()
  @Min(1)
  @Max(5)
  kindness:number;

  //유머
  @ApiProperty({ description: '유머', example:4})
  @IsNumber()
  @Min(1)
  @Max(5) 
  humor:number;

  //적극성
  @ApiProperty({ description: '적극성', example:4})
  @IsNumber()
  @Min(1)
  @Max(5)
  activeness:number;

  //요리
  @ApiProperty({ description: '요리', example:2})
  @IsNumber()
  @Min(1)
  @Max(5)
  cook:number;

  //약속수준
  @ApiProperty({ description: '약속수준', example:3})
  @IsNumber()
  @Min(1)
  @Max(5)
  compliance:number;

}
