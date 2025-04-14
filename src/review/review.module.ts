import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { Review } from './entities/review.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { S3Module } from 'src/s3/s3.module';
import { UserService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';

@Module({
  imports:[TypeOrmModule.forFeature([Review]),S3Module,UserModule],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
