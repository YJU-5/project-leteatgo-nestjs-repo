import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';
import { KakaoStrategy } from 'src/auth/kakao.strategy';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService,
    private readonly kakaoStrategy : KakaoStrategy,
  ) {}

  // ## 구글로그인 ##
  @Get('google/login')
  @UseGuards(AuthGuard('google'))
  async googleLogin(@Req() req:Request){}

  // ## 구글로그인 리다이렉션 ##
  @Get('google/login/callback')
  @UseGuards(AuthGuard('google'))
  googleLoginCallback(@Req() req:Request) {
    return this.userService.googleLogin(req)
  }

  @Post('kakao/login')
  async kakaoLogin(@Body() body:{access_token:string} ){
    const user = await this.kakaoStrategy.validateKakaoUser(body.access_token)
    // 2025-02-24 17:59:58 {
    //   2025-02-24 17:59:58   socialId: 3935329477,
    //   2025-02-24 17:59:58   name: '김형선',
    //   2025-02-24 17:59:58   email: 'gudtjs1004sd@gmail.com',
    //   2025-02-24 17:59:58   photo: 'http://k.kakaocdn.net/dn/WKHys/btsI7cvS6Od/EHWwMjr623ikm7TarwbjIK/img_640x640.jpg',
    //   2025-02-24 17:59:58   phone_number: '+82 10-3727-0989',
    //   2025-02-24 17:59:58   provider: 'KAKAO',
    //   2025-02-24 17:59:58   gender: 'male',
    //   2025-02-24 17:59:58   birthday: '19981008'
    //   2025-02-24 17:59:58 }
    this.userService.kakaoLogin(user)
  }
  

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
