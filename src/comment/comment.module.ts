import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { Comment } from './entities/comment.entity';
import { BoardModule } from '../board/board.module';
import { UserModule } from '../user/user.module';
import { ProfanityModule } from '../profanity/profanity.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    BoardModule,
    UserModule,
    ProfanityModule,
  ],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService],
})
export class CommentModule {}
