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
@Controller('user')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Get('google/login')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: '구글 로그인' })
  @ApiResponse({ status: 200, description: '구글 로그인 페이지로 리다이렉트' })
  async googleAuth(@Req() req) {}

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: '구글 로그인 콜백' })
  @ApiResponse({ status: 200, description: '로그인 성공 및 JWT 토큰 발급' })
  async googleAuthRedirect(@Req() req, @Res() res) {
    const result = await this.authService.googleLogin(req);

    if ('error' in result) {
      throw new UnauthorizedException(result.error);
    }

    // 로그인 성공시 프론트엔드로 리다이렉트 (토큰과 함께)
    res.redirect(
      `${process.env.FRONTEND_URL}/auth/callback?token=${result.accessToken}`,
    );
  }

  @Get('profile')
  @ApiOperation({ summary: '사용자 프로필 조회' })
  @ApiResponse({ status: 200, description: '사용자 프로필 정보 반환' })
  getProfile(@Req() req) {
    return req.user;
  }
}
