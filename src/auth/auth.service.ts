import { Inject, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { JwtService } from '@nestjs/jwt';
import * as dotenv from 'dotenv';

dotenv.config(); // .env 파일을 로드

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
  ){}

  // # 구글로그인, JWT 발급 #
  async googleLogin(req){
    const {email, name, socialId} = req.user

    const googlePayload = {email, name, socialId}

    const googleJwt ={
      token: this.jwtService.sign(googlePayload,{
        secret: process.env.JWT_SECRET,
        expiresIn: '84h',
      })
    }
    return googleJwt
  }

  async kakaoLogin(user){
    const {email, name, socialId} = user 

    const kakaoPayload = {email, name, socialId}

    const kakaoJwt ={
      token : this.jwtService.sign(kakaoPayload,{
        secret: process.env.JWT_SECRET,
        expiresIn: '84h',
      })
    } 
    return kakaoJwt
  }

  create(createAuthDto: CreateAuthDto) {
    return 'This action adds a new auth';
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
