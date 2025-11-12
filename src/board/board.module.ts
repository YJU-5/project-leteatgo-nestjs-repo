import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardService } from './board.service';
import { BoardController } from './board.controller';
import { Board } from './entities/board.entity';
import { UserModule } from '../user/user.module';
import { S3Module } from '../s3/s3.module';
import { ProfanityModule } from '../profanity/profanity.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Board]),
    UserModule,
    S3Module,
    ProfanityModule,
  ],
  controllers: [BoardController],
  providers: [BoardService],
  exports: [BoardService],
})
export class BoardModule {}
