import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import * as dotenv from 'dotenv';

// .env 파일을 로드
dotenv.config();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(){
        super({
            jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration:false,
            secretOrKey:process.env.JWT_SECRET,
        })
    }
    async validate(payload:any){
        // jwt에서 전역으로 정보를 받아서 어떻게 보내줄지 
        return{email:payload.email, name: payload.name, socialId:String(payload.socialId), deleted:payload.deleted}
    }
}