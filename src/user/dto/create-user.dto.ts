import { IsDate, IsEmail, IsEnum, IsOptional, IsString, IsTaxId } from "class-validator";

export class CreateUserDto {
    
    // 이름
    @IsString()
    name:string;

    // 이메일
    @IsEmail()
    email:string

    // 전화번호
    @IsOptional()
    @IsString()
    phoneNumber:string;

    // 생년월일 
    @IsOptional()
    @IsString()
    birthday:Date // (yyyy-mm-dd)

    // 성별 
    @IsEnum(['M','F'])
    gender:'M'|'F'

    // 사진 
    @IsOptional()
    @IsString()
    pictureUrl:string;

    // 소셜로그인 제공자 
    @IsEnum(['GOOGLE','KAKO'])
    socialProvider:'GOOGLE' | 'KAKAO'

    // 소셜로그인 ID 
    @IsString()
    socialId:string;
}
