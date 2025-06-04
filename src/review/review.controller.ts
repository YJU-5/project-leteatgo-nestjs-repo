import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Req, UseGuards, UnauthorizedException, InternalServerErrorException, UploadedFiles, ValidationPipe, BadRequestException, NotFoundException } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ApiOperationDecorator } from 'src/decorator/api.operration.decorator';
import { ApiReviewCreate } from 'src/decorator/api.review.create.decorator';
import { Public } from 'src/decorator/public.decorator';
import { S3Service } from 'src/s3/s3.service';
import { RequestWithUser } from 'src/user/request.interface';
import { ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { UserService } from 'src/user/user.service';
import { UserChatRoomService } from 'src/user-chat-room/user-chat-room.service';
import { isUUID } from 'class-validator';
import { AuthGuard } from '@nestjs/passport';


@Controller('review')
export class ReviewController {
  constructor(
    private readonly reviewService: ReviewService,
    private readonly userService: UserService,
    private readonly s3Service: S3Service,
    private readonly userChatRoomService: UserChatRoomService
  ) { }

  @Get('/userreview')
  @ApiOperationDecorator('유저가 작성한 리뷰조회', '# 유저가 작성한 리뷰조회', 201, '유저가 작성한 리뷰조회완료')
  @ApiBearerAuth()
  getMyReviews(@Req() req: RequestWithUser,) {
    if (!req.user) {
      throw new UnauthorizedException('사용자 인증 실패');
    }

    const socialId = req.user.socialId;

    console.log('들어왔음');
    return this.reviewService.getMyReviews(socialId);
  }

  @Post(':roomid')
  @ApiOperationDecorator('리뷰생성', '# 리뷰 생성', 201, '생성완료')
  @ApiReviewCreate()
  @ApiBearerAuth()
  async create(
    @Param('roomid') roomid: string,
    @Req() req: RequestWithUser,
    @Body() createReviewDto: CreateReviewDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {

    if (!req.user) {
      throw new UnauthorizedException('사용자 인증 실패');
    }


    let uploadedUrls: string[] = [];
    if (files && files.length > 0) {
      try {
        uploadedUrls = await Promise.all(
          files.map((file) => this.s3Service.uploadFile(file)),
        )

      } catch (error) {
        console.error('S3 업로드 에러:', error);
        throw new InternalServerErrorException('파일 업로드 실패');
      }
    }

    const socialId = req.user.socialId;

    return this.reviewService.create(createReviewDto, socialId, uploadedUrls, roomid);
  }

  @Get()
  @ApiOperationDecorator('리뷰조회', '# 리뷰조회', 201, '리뷰조회')
  @Public()
  findAll() {
    return this.reviewService.findAll();
  }

  @Get(':id')
  @ApiOperationDecorator('특정리뷰조회', '# 특정리뷰조회', 201, '특정리뷰조회')
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.reviewService.findOne(id);
  }

  @Get('/room/:roomid')
  @ApiOperationDecorator('유저가작성한리뷰조회', '# 유저가작성한리뷰조회', 201, '유저가작성한리뷰조회')
  @ApiBearerAuth()
  findRoomReview(@Param('roomid') id: string,) {

    return this.reviewService.findRoomReview(id);
  }

  @Patch(':id')
  @ApiOperationDecorator('특정리뷰수정', '# 특정리뷰수정', 201, '수정완료')
  @ApiReviewCreate()
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {

    let uploadedUrls: string[] = [];
    if (files && files.length > 0) {
      try {
        uploadedUrls = await Promise.all(
          files.map((file) => this.s3Service.uploadFile(file)),
        )

      } catch (error) {

        throw new InternalServerErrorException('파일 업로드 실패');
      }
    }
    return this.reviewService.update(id, updateReviewDto, uploadedUrls);
  }

  @Delete(':id')
  @ApiOperationDecorator('리뷰삭제', '# 리뷰삭제', 201, '삭제완료')
  @Public()
  remove(@Param('id') id: string) {
    return this.reviewService.remove(id);
  }



}

