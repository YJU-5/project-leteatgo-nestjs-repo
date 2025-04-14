import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ApiOperationDecorator } from 'src/decorator/api.operration.decorator';
import { ApiReviewCreate } from 'src/decorator/api.review.create.decorator';
import { Public } from 'src/decorator/public.decorator';
import { S3Service } from 'src/s3/s3.service';
import { RequestWithUser } from 'src/user/request.interface';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('review')
export class ReviewController {
  constructor(
    private readonly reviewService: ReviewService,
    private readonly s3Service: S3Service,
  ) {}

  @Post()
  @ApiOperationDecorator('리뷰생성','# 리뷰 생성',201,'생성완료')
  @ApiReviewCreate()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async create(
    @Req() req:RequestWithUser,
    @Body() createReviewDto: CreateReviewDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if(!req.user){
      throw new UnauthorizedException('사용자 인증 실패');
    }

    const uploadedUrl = file ? await this.s3Service.uploadFile(file): '';

    const socialId = req.user.socialId

    return this.reviewService.create(createReviewDto,socialId,uploadedUrl);
  }

  @Get()
  findAll() {
    return this.reviewService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewService.update(+id, updateReviewDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reviewService.remove(+id);
  }
}
