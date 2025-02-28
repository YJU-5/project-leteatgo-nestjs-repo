
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { VerifiedCallback } from 'passport-jwt';
import * as dotenv from 'dotenv';

dotenv.config(); // .env 파일을 로드

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
        clientID:process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:3001/user/google/login/callback',
        scope: [
          'email', 
          'profile',
          'https://www.googleapis.com/auth/userinfo.profile',
          'https://www.googleapis.com/auth/user.birthday.read',
          'https://www.googleapis.com/auth/user.gender.read',
          ],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done:VerifiedCallback): Promise<any> {
    // profile 객체에서 소셜 로그인 고유 ID를 추출
    // 필요 : 휴대폰 번호를 받으려면 앱 검수를 실시하여야함
    // https://developers.google.com/identity/protocols/oauth2/production-readiness/brand-verification?hl=ko : 앱검수 
    try{
      const { id, displayName, emails, photos  } = profile;

      const response = await fetch("https://people.googleapis.com/v1/people/me?personFields=birthdays,genders,phoneNumbers", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}` // 여기에 액세스 토큰 사용
        }
      });
      const data = await response.json();

      const user = {
        socialId: id,
        name: displayName,
        email: emails[0].value,
        photo:photos[0].value,
        provider:'GOOGLE',
        gender: data.genders?.[0].value || null,
        birthday: data.birthdays?.[0]?.date || null,
      }

      done(null,user)

    }catch(error){
      throw error
    }
  }
}
