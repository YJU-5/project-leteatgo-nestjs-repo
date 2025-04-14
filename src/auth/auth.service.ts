import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { JwtService } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';

dotenv.config(); // .env 파일을 로드

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  // # 구글로그인, JWT 발급 #
  async googleLogin(
    req,
  ): Promise<{ accessToken: string; user: User } | { error: string }> {
    if (!req.user) {
      return { error: '로그인에 실패했습니다.' };
    }

    const { email, name, picture } = req.user;

    // 기존 사용자 확인 또는 새로운 사용자 생성
    let user = await this.userService.findByEmail(email);
    if (!user) {
      user = await this.userService.create({
        email,
        name,
        pictureUrl: picture,
        socialProvider: 'GOOGLE',
        role: 'USER',
        phoneNumber: null,
        birthday: null,
        gender: null,
        socialId: req.user.id || String(Date.now()), // Google ID 또는 임시 ID 생성
      });
    }

    // JWT 토큰 생성
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user,
    };
  }

  async kakaoLogin(user) {
    const { email, name, socialId, deleted } = user;

    const kakaoPayload = { email, name, socialId, deleted };

    const kakaoJwt = {
      token: this.jwtService.sign(kakaoPayload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '84h',
      }),
    };
    return kakaoJwt;
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
