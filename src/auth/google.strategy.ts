import { Injectable } from "@nestjs/common";
import axios from "axios";

@Injectable()
export class GoogleStrategy {
  async validateGoogleUser(accessToken: string) {
    // user.controller.ts의 구글로그인 에서 받아온 access_token

    try {
      // 기본 사용자 정보 가져오기
      const response = await axios.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const googleResponse = response.data;
      let additionalInfo = {
        gender: null,
        birthday: null,
      };

      try {
        // People API 호출은 선택적으로 처리
        const responseGooglePeople = await axios.get(
          "https://people.googleapis.com/v1/people/me?personFields=birthdays,genders",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const { genders, birthdays } = responseGooglePeople.data;
        additionalInfo = {
          gender: genders?.[0]?.value || null,
          birthday: birthdays?.[0]?.date || null,
        };
      } catch (peopleApiError) {
        console.log(
          "People API 호출 실패 (선택적 정보):",
          peopleApiError.message
        );
      }

      // 구글 로그인 서버에 요청하고 받은 정보들을 user로 정리
      const user = {
        socialId: googleResponse.sub,
        name: googleResponse.name,
        email: googleResponse.email,
        photo: googleResponse.picture || null,
        provider: "GOOGLE",
        ...additionalInfo,
      };
      // return으로 user.controller.ts의 구글로그인에 정보를 보내준다
      return user;
    } catch (error) {
      console.error(
        "Google 로그인 에러:",
        error.response?.data || error.message
      );
      throw new Error(
        "구글 로그인 정보를 가져오는데 실패했습니다. 액세스 토큰을 확인해주세요."
      );
    }
  }
}
