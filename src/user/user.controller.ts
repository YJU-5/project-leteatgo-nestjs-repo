import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';
import { KakaoStrategy } from 'src/auth/kakao.strategy';
import { Public } from 'src/decorator/public.decorator';
import { RequestWithUser } from './request.interface';
import { ApiOperationDecorator } from 'src/decorator/api.operration.decorator';
import { ApiLoginBody } from 'src/decorator/api.login.body.decorator';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { ApiLoginUpdate } from 'src/decorator/api.login.update.decorator';
import { S3Service } from 'src/s3/s3.service';
import { GoogleStrategy } from 'src/auth/google.strategy';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly kakaoStrategy: KakaoStrategy,
    private readonly s3Service: S3Service,
    private readonly googleStraetgy: GoogleStrategy,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Return all users.' })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiResponse({ status: 200, description: 'Return the user.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  @Post(':id/profile-picture')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Update user profile picture' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The profile picture has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async updateProfilePicture(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const picture_url = file.path;
    return this.userService.updateProfilePicture(+id, picture_url);
  }

  // ## 구글로그인 ## ## TEST ##TEST
  @Post('google/login')
  @ApiOperationDecorator(
    '구글 로그인',
    '# 구글 로그인',
    201,
    '성공적 로그인 완료',
  )
  @ApiLoginBody()
  @Public()
  async googleLogin(@Body() body: { access_token: string }) {
    const user = await this.googleStraetgy.validateGoogleUser(
      body.access_token,
    );
    return await this.userService.googleLogin(user);
  }

  // ## 카카오 로그인 ##
  @Post('kakao/login')
  @ApiOperationDecorator(
    '카카오 로그인',
    '# 카카오 로그인',
    201,
    '성공적 로그인 완료',
  )
  @ApiLoginBody()
  @Public()
  async kakaoLogin(@Body() body: { access_token: string }) {
    const user = await this.kakaoStrategy.validateKakaoUser(body.access_token);
    return await this.userService.kakaoLogin(user);
  }

  // 유저 탈퇴(비활성화) ##
  @Patch('/deactivate')
  @ApiOperationDecorator('회원 탈퇴', '# 회원 탈퇴', 201, '회원 탈퇴 완료')
  @ApiBearerAuth()
  async deactivateUser(@Req() req: RequestWithUser) {
    const socialId = req.user.socialId;
    return await this.userService.deactivateUser(socialId);
  }

  // 유저 복구(활성화)
  @Patch('/restore')
  @ApiOperationDecorator(
    '회원 정보 복구',
    '# 회원 정보 복구',
    201,
    '회원 정보 복구 완료',
  )
  @ApiBearerAuth()
  async restoreUser(@Req() req: RequestWithUser) {
    const socialId = req.user.socialId;
    return this.userService.restoreUser(socialId);
  }

  // 본인 회원 정보 조회
  @Get()
  @ApiOperationDecorator(
    '본인 회원 정보 조회',
    '# 본인 회원 정보 조회',
    201,
    '조회 완료',
  )
  @ApiBearerAuth()
  async getProfile(@Req() req: RequestWithUser) {
    const socialId = req.user.socialId;
    console.log(req.user);
    return this.userService.getProfile(socialId);
  }

  // 회원 정보 수정
  @Patch()
  @ApiOperationDecorator(
    '본인 회원 정보 수정',
    '# 본인 회원 정보 수정',
    201,
    '수정 완료',
  )
  @ApiBearerAuth()
  @ApiLoginUpdate()
  async updateProfile(
    @Req() req: RequestWithUser,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    let uploadedUrl: string = '';
    if (file) {
      uploadedUrl = await this.s3Service.uploadFile(file);
    }
    const socialId = req.user.socialId; // 소셜아이디 추출
    return this.userService.updateProfile(socialId, updateUserDto, uploadedUrl);
  }
}
