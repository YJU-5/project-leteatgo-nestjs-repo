<<<<<<< HEAD
import { Inject, Injectable } from "@nestjs/common";
import { CreateAuthDto } from "./dto/create-auth.dto";
import { UpdateAuthDto } from "./dto/update-auth.dto";
import { JwtService } from "@nestjs/jwt";
import * as dotenv from "dotenv";
=======
import { Inject, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { JwtService } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
>>>>>>> origin/main

dotenv.config(); // .env 파일을 로드

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  // # 구글로그인, JWT 발급 #
  async googleLogin(user) {
<<<<<<< HEAD
    const { email, name, socialId, deleted, pictureUrl, id } = user;

    const googlePayload = { email, name, socialId, deleted, pictureUrl, id };
=======
    const { email, name, socialId, deleted } = user; // user.serivce의 구글로그인에서 받아온 user값

    const googlePayload = { email, name, socialId, deleted }; // user에서 추출해서 jwt토큰에 넣어줄 정보들
>>>>>>> origin/main

    const googleJwt = {
      token: this.jwtService.sign(googlePayload, {
        // jwt사인하고 로그인하고 jwt 토큰발급
        secret: process.env.JWT_SECRET, // jwt 시크릿번호 환경변수에서 가져오기
<<<<<<< HEAD
        expiresIn: "84h", // jwt토큰 유지시간
=======
        expiresIn: '84h', // jwt토큰 유지시간
>>>>>>> origin/main
      }),
    };
    return googleJwt;
  }

  async kakaoLogin(user) {
<<<<<<< HEAD
    const { email, name, socialId, deleted, id } = user;

    const kakaoPayload = { email, name, socialId, deleted, id };
=======
    const { email, name, socialId, deleted } = user;

    const kakaoPayload = { email, name, socialId, deleted };
>>>>>>> origin/main

    const kakaoJwt = {
      token: this.jwtService.sign(kakaoPayload, {
        secret: process.env.JWT_SECRET,
<<<<<<< HEAD
        expiresIn: "84h",
=======
        expiresIn: '84h',
>>>>>>> origin/main
      }),
    };
    console.log(kakaoJwt);
    return kakaoJwt;
  }

  create(createAuthDto: CreateAuthDto) {
<<<<<<< HEAD
    return "This action adds a new auth";
=======
    return 'This action adds a new auth';
>>>>>>> origin/main
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
<<<<<<< HEAD

  async createTestToken(email: string) {
    const testPayload = {
      email,
      name: "Test User",
      socialId: "test-social-id",
      deleted: false,
    };

    const testJwt = {
      token: this.jwtService.sign(testPayload, {
        secret: process.env.JWT_SECRET,
        expiresIn: "84h",
      }),
    };

    return testJwt;
  }
=======
>>>>>>> origin/main
}
