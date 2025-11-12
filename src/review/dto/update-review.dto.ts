import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateReviewDto } from './create-review.dto';
import { IsArray, IsInt, IsNumber, IsOptional, IsString, IsUrl, Max, Min } from "class-validator";

export class UpdateReviewDto extends PartialType(CreateReviewDto) {

    //평가내용
    @ApiProperty({ description: '리뷰 내용', example: '정말 친절하고 유쾌하신 분이에요!' })
    @IsString()
    description: string;
  
  
    //친절함
    @ApiProperty({ description: '친절함', example:5})
    @IsInt()
    @Min(1)
    @Max(5)
    kindness:number;
  
    //유머
    @ApiProperty({ description: '유머', example:4})
    @IsInt()
    @Min(1)
    @Max(5) 
    humor:number;
  
    //적극성
    @ApiProperty({ description: '적극성', example:4})
    @IsInt()
    @Min(1)
    @Max(5)
    activeness:number;
  
    //요리
    @ApiProperty({ description: '요리', example:2})
    @IsInt()
    @Min(1)
    @Max(5)
    cook:number;
  
    //약속수준
    @ApiProperty({ description: '약속수준', example:3})
    @IsInt()
    @Min(1)
    @Max(5)
    compliance:number;
  
    // 첨부이미지
    @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' } })
    @IsOptional()
    @IsString()
    pictureUrl: string[];

}
