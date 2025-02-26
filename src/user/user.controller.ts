import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';
import { KakaoStrategy } from 'src/auth/kakao.strategy';
import { Public } from 'src/decorator/public.decorator';
import { RequestWithUser } from './request.interface';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService,
    private readonly kakaoStrategy : KakaoStrategy,
  ) {}

  // ## 구글로그인 ##
  @Get('google/login')
  @Public()
  @UseGuards(AuthGuard('google'))
  async googleLogin(@Req() req:Request){}

  // ## 구글로그인 리다이렉션 ##
  @Get('google/login/callback')
  @Public()
  @UseGuards(AuthGuard('google'))
  googleLoginCallback(@Req() req:Request) {
    return this.userService.googleLogin(req)
  }

  // ## 카카오 로그인 ## 
  @Post('kakao/login')
  @Public()
  async kakaoLogin(@Body() body:{access_token:string} ){
    const user = await this.kakaoStrategy.validateKakaoUser(body.access_token)
    return await this.userService.kakaoLogin(user)
  }

  // 유저 탈퇴(비활성화) ## 
  @Patch()
  async deactivateUser(@Req() req:RequestWithUser){
    const socialId = req.user.socialId
    return await this.userService.deactivateUser(socialId)
  }
  
  // 유저 복구(활성화)
  @Patch('/restore')
  async restoreUser(@Req() req:RequestWithUser){
    const socialId = req.user.socialId
    return this.userService.restoreUser(socialId)
  }

  // 본인 회원 정보 조회 
  @Get()
  async getProfile(@Req() req:RequestWithUser) {
    const socialId = req.user.socialId
    return this.userService.getProfile(socialId)
  }

  // 회원 정보 수정 
  @Patch()
  async updateProfile(@Req() req:RequestWithUser){
    const socialId = req.user.socialId
    return this.userService.updateProfile(socialId)
  }
}
