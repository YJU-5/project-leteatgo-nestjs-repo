import { ApiOperation, ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, IsOptional, IsEnum, IsDate } from "class-validator";

export class CreateChatRoomDto {

    // 제목
    @ApiProperty({example:'인생술집', description:'제목' })
    @IsString()
    title:string;

    // 설명 
    @ApiProperty({example:'허기진 마음에 공감과 위로가 채워지는 시간', description:'설명'})
    @IsString()
    @IsOptional()
    description:string;
    
    // 주소
    @ApiProperty({example:'경상북도 칠곡군 지천면 금송로 60',description:'주소'})
    @IsString()
    address:string;

    // 위도
    @ApiProperty({example:37.5665,description:'위도'})
    @IsNumber()
    latitube:number;

    // 경도
    @ApiProperty({example:126.9780,description:'경도'})
    @IsNumber()
    longitude:number;

    // 참가 날짜 
    @ApiProperty({example:'2024-02-05',description:'참가 날짜', type:String, format:'date'})
    @IsDate()
    startDate:Date;
    
    // 음식 태그 백엔드 필요 

    // 최대 가격 
    @ApiProperty({example:10000,description:'최대가격'})
    @IsNumber()
    maxPrice:number;

    // 최소가격
    @ApiProperty({example:500,description:'최소가격'})
    @IsNumber()
    minPrice:number;

    // 최소나이
    @ApiProperty({example:20,description:'최소나이'})
    @IsNumber()
    minAge:number

    // 최대나이
    @ApiProperty({example:40,description:'최대나이'})
    @IsNumber()
    maxAge:number

    // 최대참가자수
    @ApiProperty({example:5,description:'최대참가자수'})
    @IsNumber()
    maxParticipants:number

    // 카테고리 백엔드 필요

    // 성별
    @ApiProperty({example:'M',description:'성별'})
    @IsEnum(['M','F','UNSPECIFIED'])
    gender:'M'|'F'|'UNSPECIFIED'
    
    // 첨부이미지
    @ApiProperty({ type: 'string', format: 'binary', required: false, description:'첨부이미지' })
    @IsOptional()
    @IsString()
    pictureUrl:string;
}
