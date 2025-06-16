import { Controller, Get, Post, Body, Patch, Req, UploadedFile, Param } from '@nestjs/common';
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

  // ## 구글로그인 ##
  @Post('google/login')
  @ApiOperationDecorator('구글 로그인','# 구글 로그인',201,'성공적 로그인 완료')
  @ApiLoginBody()
  @Public()
  async googleLogin(@Body() body:{access_token:string}){
    // body: 프론트에서 받아온 액세스 코드 
    
    const user = await this.googleStraetgy.validateGoogleUser(body.access_token) // 액세스 코드를 구글 인증전략에 보낸다 
    
    // 인증전략을 마치고 받은 user의 데이터를 유저서비스의 googleLogin에 보내준다 
    // 구글로그인 완료 후 토큰이 발급되면 이 URL로 신청한 프론트엔드에 jwt토큰을 보내준다 
    return await this.userService.googleLogin(user)
  }

  // ## 카카오 로그인 ## 
  @Post('kakao/login')
  @ApiOperationDecorator('카카오 로그인','# 카카오 로그인',201,'성공적 로그인 완료')
  @ApiLoginBody()
  @Public()
  async kakaoLogin(@Body() body:{access_token:string} ){
    // body: 프론트에서 받아온 액세스 코드 
    const user = await this.kakaoStrategy.validateKakaoUser(body.access_token) // 액세스 코드를 카카오 인증전략에 보낸다

    // 인증전략을 마치고 받은 user의 데이터를 유저서비스의 kakaologin에 보내준다 
    // 카카오로그인 완료 후 토큰이 발급되면 이 URL로 신청한 프론트엔드에 jwt토큰을 보내준다 
    return await this.userService.kakaoLogin(user)
  }

  // 회원 탈퇴(비활성화) ## 
  @Patch('/deactivate')
  @ApiOperationDecorator('회원 탈퇴','# 회원 탈퇴',201,'회원 탈퇴 완료')
  @ApiBearerAuth()
  async deactivateUser(@Req() req:RequestWithUser){

    // 프론트엔드에서 회원탈퇴 요청을 하였을 때 req로 jwt에 들어있는 정보를 추출 
    const socialId = req.user.socialId // jwt에 들어있는 소셜아이디 추출 

    // userService의 deactivateUser에 추출한 소셜아이디 전송 
    return await this.userService.deactivateUser(socialId)
  }
  
  // 유저 복구(활성화)
  @Patch('/restore')
  @ApiOperationDecorator('회원 정보 복구','# 회원 정보 복구',201,'회원 정보 복구 완료')
  @ApiBearerAuth()
  async restoreUser(@Req() req:RequestWithUser){

    // 프론트엔드에서 회원복구 요청을 하였을 때 req로 jwt에 들어있는 정보를 추출 
    const socialId = req.user.socialId
    
    // userService의 restoreUser에 추출한 소셜아이디 전송 
    return this.userService.restoreUser(socialId)
  }

  // 본인 회원 정보 조회 
  @Get()
  @ApiOperationDecorator('본인 회원 정보 조회','# 본인 회원 정보 조회',201,'조회 완료')
  @ApiBearerAuth()
  async getProfile(@Req() req:RequestWithUser) {
    
    // 프론트엔드에서 회원복구 요청을 하였을 때 req로 jwt에 들어있는 정보를 추출 
    const socialId = req.user.socialId

    // userService의 getProfile에 추출한 소셜아이디 전송 
    return this.userService.getProfile(socialId)
  }

  @Get(':id')
  @ApiOperationDecorator('회원 정보 조회','# 회원 정보 조회',201,'조회 완료')
  @ApiBearerAuth()
  getuserProfile(@Param('id') userid:string){
    return this.userService.getProfile(userid)
  }

  // 회원 정보 수정 
  @Patch()
  @ApiOperationDecorator('본인 회원 정보 수정','# 본인 회원 정보 수정',201,'수정 완료')
  @ApiBearerAuth()
  @ApiLoginUpdate()
  async updateProfile(
    @Req() req:RequestWithUser, // jwt 토큰정보
    @Body() updateUserDto: UpdateUserDto, // 프론트엔드에서 어떤 정보를 어떻게 받아올지 
    @UploadedFile() file: Express.Multer.File // 파일 받아오기 
  ){
    
    let uploadedUrl:string =''
    if(file){
      uploadedUrl = await this.s3Service.uploadFile(file) // s3에 이미지 올리고 받아온 이미지 URL
    }
    const socialId = req.user.socialId // 소셜아이디 추출

    // 업데이트할 정보들을 userSerivce.updateProfile에 전송 
    return this.userService.updateProfile(
      socialId,
      updateUserDto,
      uploadedUrl,
    )
  }

  // 내가 개최한 채팅 목록 
  @Get('hosted')
  @ApiOperationDecorator('내가 개최한 채팅 목록 조회','# 개최한 채팅 목록 조회',201,'조회 완료')
  @ApiBearerAuth()
  async chatRoomFindJoined(
    @Req() req:RequestWithUser,
  ){
    // 프론트엔드에서 내가 개최한 채팅목록 요청을 하였을 때 req로 jwt에 들어있는 정보를 추출 
    const socialId = req.user.socialId// jwt에 들어있는 소셜아이디 추출 

    // 소셜아이디로 유저정보 가져옴 
    const user = await this.userService.getProfile(socialId)
    
    // 유저아이디를 userChatRoomService의 userChatRoomHosted로 보냄 
    const hostChatList = await this.userChatRoomService.userChatRoomHosted(user.id)
  
    // 채팅목록 
    return hostChatList
  }

  // 내가 참가한 채팅 목록
  @Get('joined')
  @ApiOperationDecorator('내가 참가한 채팅 목록 조회','# 내가 참가한 채팅 목록 조회',201,'조회 완료')
  @ApiBearerAuth()
  async chatRoomFindHosted(
    @Req() req:RequestWithUser,
  ){
    // 프론트엔드에서 내가 참가한 채팅목록 요청을 하였을 때 req로 jwt에 들어있는 정보를 추출 
    const socialId = req.user.socialId
    
    // socailId를 이용해서 DB에서 유저정보를 가져옴 
    const user = await this.userService.getProfile(socialId)

    // 유저아이디를 userChatRoomService의 userChatRoomJoin로 보냄  
    const userChatJoinList = await this.userChatRoomService.userChatRoomJoin(user.id)

    return userChatJoinList
  }
}
