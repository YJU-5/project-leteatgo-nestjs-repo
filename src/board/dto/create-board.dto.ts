<<<<<<< HEAD
import { IsString, IsNotEmpty } from "class-validator";

export class CreateBoardDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  files?: Express.Multer.File[]; // 여러 파일을 받을 수 있도록 수정
}
=======
export class CreateBoardDto {}
>>>>>>> origin/main
