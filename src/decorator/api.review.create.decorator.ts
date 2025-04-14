import { applyDecorators, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiConsumes } from "@nestjs/swagger";
import { CreateReviewDto } from "src/review/dto/create-review.dto";

export function ApiReviewCreate(){
  return applyDecorators(
    UseInterceptors(FileInterceptor('pictureUrl')),
    ApiConsumes("multipart/form-data"),
    ApiBody({type:CreateReviewDto}),
  );
}