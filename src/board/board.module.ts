import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardService } from './board.service';
import { BoardController } from './board.controller';
import { Board } from './entities/board.entity';
import { S3Service } from '../s3/s3.service';
import { S3Module } from '../s3/s3.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Board]),  // BoardRepository 인식하도록 설정
    S3Module,  // S3 관련 모듈 추가
  ],
  controllers: [BoardController],
  providers: [BoardService, S3Service],  // S3Service 추가
  exports: [BoardService],  // 다른 모듈에서도 BoardService 사용 가능하도록 설정
})
export class BoardModule {}
