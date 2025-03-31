import { Controller, Get, Post, Body, Patch, Req, UploadedFile } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { KakaoStrategy } from 'src/auth/kakao.strategy';
import { Public } from 'src/decorator/public.decorator';
import { RequestWithUser } from './request.interface';
import { ApiOperationDecorator } from 'src/decorator/api.operration.decorator';
import { ApiLoginBody } from 'src/decorator/api.login.body.decorator';
import { ApiBearerAuth} from '@nestjs/swagger';
import { ApiLoginUpdate } from 'src/decorator/api.login.update.decorator';
import { S3Service } from 'src/s3/s3.service';
import { GoogleStrategy } from 'src/auth/google.strategy';
import { UserChatRoomService } from 'src/user-chat-room/user-chat-room.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly kakaoStrategy : KakaoStrategy,
    private readonly s3Service : S3Service,
    private readonly googleStraetgy: GoogleStrategy,
    private readonly userChatRoomService: UserChatRoomService
  ) {}

  // ## 구글로그인 ## ## TEST ##TEST
  @Post('google/login')
  @ApiOperationDecorator('구글 로그인','# 구글 로그인',201,'성공적 로그인 완료')
  @ApiLoginBody()
  @Public()
  async googleLogin(@Body() body:{access_token:string}){
    const user = await this.googleStraetgy.validateGoogleUser(body.access_token)
    return await this.userService.googleLogin(user)
  }

  // ## 카카오 로그인 ## 
  // 만들때 두개가 만들어진다 
  @Post('kakao/login')
  @ApiOperationDecorator('카카오 로그인','# 카카오 로그인',201,'성공적 로그인 완료')
  @ApiLoginBody()
  @Public()
  async kakaoLogin(@Body() body:{access_token:string} ){
    const user = await this.kakaoStrategy.validateKakaoUser(body.access_token)
    return await this.userService.kakaoLogin(user)
  }

  // 유저 탈퇴(비활성화) ## 
  @Patch('/deactivate')
  @ApiOperationDecorator('회원 탈퇴','# 회원 탈퇴',201,'회원 탈퇴 완료')
  @ApiBearerAuth()
  async deactivateUser(@Req() req:RequestWithUser){
    const socialId = req.user.socialId
    return await this.userService.deactivateUser(socialId)
  }
  
  // 유저 복구(활성화)
  @Patch('/restore')
  @ApiOperationDecorator('회원 정보 복구','# 회원 정보 복구',201,'회원 정보 복구 완료')
  @ApiBearerAuth()
  async restoreUser(@Req() req:RequestWithUser){
    const socialId = req.user.socialId
    return this.userService.restoreUser(socialId)
  }

  // 본인 회원 정보 조회 
  @Get()
  @ApiOperationDecorator('본인 회원 정보 조회','# 본인 회원 정보 조회',201,'조회 완료')
  @ApiBearerAuth()
  async getProfile(@Req() req:RequestWithUser) {
    const socialId = req.user.socialId
    console.log(req.user);
    return this.userService.getProfile(socialId)
  }

  // 회원 정보 수정 
  @Patch()
  @ApiOperationDecorator('본인 회원 정보 수정','# 본인 회원 정보 수정',201,'수정 완료')
  @ApiBearerAuth()
  @ApiLoginUpdate()
  async updateProfile(
    @Req() req:RequestWithUser,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File 
  ){
    let uploadedUrl:string =''
    if(file){
      uploadedUrl = await this.s3Service.uploadFile(file)
    }
    const socialId = req.user.socialId // 소셜아이디 추출
    return this.userService.updateProfile(
      socialId,
      updateUserDto,
      uploadedUrl,
    )
  }

  // 토큰을 사용해 유저목록을 가져오고 유저 아이디를 이용해서 추출하기 

  // 내가 개최한 채팅 목록 
  
  @Get('hosted')
  @ApiOperationDecorator('내가 개최한 채팅 목록 조회','# 개최한 채팅 목록 조회',201,'조회 완료')
  @ApiBearerAuth()
  async chatRoomFindJoined(
    @Req() req:RequestWithUser,
  ){
    const socialId = req.user.socialId
    const user = await this.userService.getProfile(socialId)
    const hostChatList = await this.userChatRoomService.userChatRoomHosted(user.id)
  
    return hostChatList
  }

  // 내가 참가한 채팅 목록
  // chat-pa는 어디 써야 할까 
  // 우선 chat-room으로 하기 
  @Get('joined')
  @ApiOperationDecorator('내가 참가한 채팅 목록 조회','# 내가 참가한 채팅 목록 조회',201,'조회 완료')
  @ApiBearerAuth()
  async chatRoomFindHosted(
    @Req() req:RequestWithUser,
  ){
    const socialId = req.user.socialId
    const user = await this.userService.getProfile(socialId)
    const userChatJoinList = await this.userChatRoomService.userChatRoomJoin(user.id)

    return userChatJoinList
  }
}
