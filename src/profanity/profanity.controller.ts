import { Controller, Post, Body } from "@nestjs/common";
import { ProfanityService } from "./profanity.service";

/**
 * 욕설 필터링 관련 API 엔드포인트를 제공하는 컨트롤러
 */
@Controller("profanity")
export class ProfanityController {
  constructor(private readonly profanityService: ProfanityService) {}

  /**
   * 텍스트의 욕설 여부를 검사하는 엔드포인트
   *
   * @param text - 검사할 텍스트
   * @returns 욕설 여부와 신뢰도를 포함한 객체
   */
  @Post("check")
  async checkProfanity(@Body("text") text: string) {
    return this.profanityService.checkProfanity(text);
  }
}