import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
// # 수정 : 사진, 주소,  
export class UpdateUserDto {
    @ApiProperty({ example: 'your name', required: false })
    @IsString()
    name: string;

    @ApiProperty({ example: 'your phoneNumber', required: false })
    @IsString()
    phoneNumber: string;

    @ApiProperty({ example: 'your description', required: false })
    @IsString()
    description: string;

    @ApiProperty({ type: 'string', format: 'binary', required: false })
    pictureUrl?: Express.Multer.File;
}