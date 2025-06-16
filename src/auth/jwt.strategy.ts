import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import * as dotenv from "dotenv";


// .env 파일을 로드
dotenv.config();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }
  async validate(payload: any) {
    // 프론트엔드에서 보낸 jwt 정보를 추출해서 컨트롤러의 req로 보내줌
    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      socialId: String(payload.socialId),
      deleted: payload.deleted,
      pictureUrl: payload.pictureUrl,
    };
  }
}

