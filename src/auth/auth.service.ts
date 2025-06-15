import {
  Inject,
  Injectable,
  forwardRef,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { JwtService } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { ConfigService } from '@nestjs/config';

dotenv.config(); // .env 파일을 로드

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // # 구글로그인, JWT 발급 #
  async googleLogin(req) {
    if (!req.headers.authorization) {
      throw new UnauthorizedException('액세스 토큰이 필요합니다.');
    }

    const accessToken = req.headers.authorization.replace('Bearer ', '');

    try {
      // Google API로 사용자 정보 가져오기
      const response = await fetch(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      if (!response.ok) {
        throw new Error('Failed to fetch user info from Google');
      }

      const userData = await response.json();
      console.log('Google user data:', userData);

      // UserService를 통해 사용자 처리
      const user = await this.userService.googleLogin({
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
        socialId: userData.id,
      });

      return {
        accessToken: this.jwtService.sign({ email: user.email }),
      };
    } catch (error) {
      console.error('Google login error:', error);
      throw new UnauthorizedException('구글 로그인 실패: ' + error.message);
    }
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

  async googleTokenLogin(accessToken: string) {
    try {
      // Google API로 사용자 정보 가져오기
      const response = await fetch(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      if (!response.ok) {
        throw new Error('Failed to fetch user info from Google');
      }

      const userData = await response.json();
      console.log('Google user data:', userData);

      // UserService를 통해 사용자 처리
      const user = await this.userService.googleLogin({
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
        socialId: userData.id,
      });

      // JWT 토큰 생성
      return {
        accessToken: this.jwtService.sign({ email: user.email }),
      };
    } catch (error) {
      console.error('Google token login error:', error);
      throw new UnauthorizedException('구글 로그인 실패: ' + error.message);
    }
  }

  async googleAuthCallback(code: string) {
    try {
      // Google OAuth token endpoint로 인증 코드 교환
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          client_id: this.configService.get('GOOGLE_CLIENT_ID'),
          client_secret: this.configService.get('GOOGLE_CLIENT_SECRET'),
          redirect_uri: this.configService.get('GOOGLE_CALLBACK_URL'),
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.text();
        console.error('Google token exchange error:', errorData);
        throw new Error('Failed to exchange authorization code');
      }

      const { access_token } = await tokenResponse.json();

      // Google API로 사용자 정보 가져오기
      const userInfoResponse = await fetch(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: { Authorization: `Bearer ${access_token}` },
        },
      );

      if (!userInfoResponse.ok) {
        throw new Error('Failed to fetch user info from Google');
      }

      const userData = await userInfoResponse.json();
      console.log('Google user data:', userData);

      // UserService를 통해 사용자 처리
      const user = await this.userService.googleLogin({
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
        socialId: userData.id,
      });

      // JWT 토큰 생성
      return {
        accessToken: this.jwtService.sign({ email: user.email }),
      };
    } catch (error) {
      console.error('Google auth callback error:', error);
      throw new UnauthorizedException('구글 로그인 실패: ' + error.message);
    }
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
