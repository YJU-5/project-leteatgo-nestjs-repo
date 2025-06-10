<<<<<<< HEAD
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CommentService } from "./comment.service";
import { CommentController } from "./comment.controller";
import { Comment } from "./entities/comment.entity";
import { UserModule } from "../user/user.module";
import { BoardModule } from "../board/board.module";
import { ProfanityModule } from "../profanity/profanity.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    UserModule,
    BoardModule,
    ProfanityModule,
  ],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService],
=======
import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';

@Module({
  controllers: [CommentController],
  providers: [CommentService],
>>>>>>> origin/main
})
export class CommentModule {}
