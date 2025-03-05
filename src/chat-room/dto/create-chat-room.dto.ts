import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, IsOptional } from "class-validator";

export class CreateChatRoomDto {

    // 제목
    @ApiProperty({example:'chatName'})
    @IsString()
    name:string;

    // 설명 
    @ApiProperty({example:'description', required: false})
    @IsString()
    @IsOptional()
    description:string;
    
    // 주소

    // 위도

    // 경도

    // 날짜 

    // 음식 태그 

    // 평균 가격 
    @ApiProperty({example:10000,required: false})
    @IsNumber()
    price:number;

    // 최소나이
    @ApiProperty({example:20,required: false})
    @IsNumber()
    minAge:number

    // 최대나이
    @ApiProperty({example:40,required: false})
    @IsNumber()
    maxAge:number

    // 최대참가자수
    @ApiProperty({example:5,required: false})
    @IsNumber()
    maXparticipants:number

    // 카테고리 

    // 성별

    // 첨부이미지
    @ApiProperty({ type: 'string', format: 'binary', required: false })
    @IsOptional()
    @IsString()
    pictureUrl:string;

}
