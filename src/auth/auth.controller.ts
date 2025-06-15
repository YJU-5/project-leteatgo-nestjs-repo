import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { Public } from '../decorator/public.decorator';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Get('google/login')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: '구글 로그인' })
  @ApiResponse({ status: 200, description: '구글 로그인 페이지로 리다이렉트' })
  async googleAuth(@Req() req) {}

  @Public()
  @Post('google/callback')
  @ApiOperation({ summary: '구글 로그인 콜백' })
  @ApiResponse({ status: 200, description: '로그인 성공 및 JWT 토큰 발급' })
  async googleAuthRedirect(@Body() body: { code: string }) {
    if (!body.code) {
      throw new UnauthorizedException('인증 코드가 필요합니다.');
    }

    try {
      console.log(
        'Received Google auth code:',
        body.code.substring(0, 10) + '...',
      );
      const result = await this.authService.googleAuthCallback(body.code);
      console.log('Google auth successful, returning token');
      return result;
    } catch (error) {
      console.error('Google callback error:', error);
      throw new UnauthorizedException('구글 로그인 실패: ' + error.message);
    }
  }

  @Public()
  @Post('google/token')
  @ApiOperation({ summary: '구글 액세스 토큰으로 로그인' })
  @ApiResponse({ status: 200, description: '로그인 성공 및 JWT 토큰 발급' })
  async googleTokenLogin(@Body() body: { access_token: string }) {
    if (!body.access_token) {
      throw new UnauthorizedException('액세스 토큰이 필요합니다.');
    }

    try {
      const result = await this.authService.googleTokenLogin(body.access_token);
      return result;
    } catch (error) {
      throw new UnauthorizedException('구글 로그인 실패: ' + error.message);
    }
  }

  @Public()
  @Post('google/token/chunk')
  @ApiOperation({ summary: '구글 액세스 토큰 청크 처리' })
  @ApiResponse({ status: 200, description: '토큰 청크 처리 완료' })
  async handleTokenChunk(
    @Body()
    body: {
      chunk: string;
      index: number;
      total: number;
      isLast: boolean;
    },
  ) {
    if (!body.chunk) {
      throw new UnauthorizedException('토큰 청크가 필요합니다.');
    }

    try {
      // 마지막 청크인 경우에만 처리 진행
      if (body.isLast) {
        // 임시 저장된 모든 청크를 조합하여 완전한 토큰 생성
        const result = await this.authService.googleTokenLogin(body.chunk);
        return result;
      }

      // 중간 청크는 성공 응답만 반환
      return { success: true };
    } catch (error) {
      throw new UnauthorizedException('구글 로그인 실패: ' + error.message);
    }
  }

  @Get('profile')
  @ApiOperation({ summary: '사용자 프로필 조회' })
  @ApiResponse({ status: 200, description: '사용자 프로필 정보 반환' })
  getProfile(@Req() req) {
    return req.user;
  }
}
