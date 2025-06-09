import { Injectable } from "@nestjs/common";

@Injectable()
export class ProfanityService {
  // AI 서비스의 URL (Docker 네트워크 내에서의 통신)
  private readonly aiServiceUrl = "http://ai-service:8000";

  /**
   * 텍스트의 욕설 여부를 검사하는 메서드
   *
   * @param text - 검사할 텍스트
   * @returns 욕설 여부와 신뢰도를 포함한 객체
   * @throws Error - AI 서비스 통신 실패 시
   */
  async checkProfanity(
    text: string
  ): Promise<{ is_profanity: boolean; confidence: number }> {
    try {
      // AI 서비스로 HTTP POST 요청
      const response = await fetch(`${this.aiServiceUrl}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      // HTTP 응답 상태 확인
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 응답 데이터 반환
      return await response.json();
    } catch (error) {
      console.error("Error checking profanity:", error);
      throw new Error("Failed to check profanity");
    }
  }
}
