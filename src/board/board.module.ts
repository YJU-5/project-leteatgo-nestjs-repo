<<<<<<< HEAD
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BoardService } from "./board.service";
import { BoardController } from "./board.controller";
import { Board } from "./entities/board.entity";
import { S3Module } from "../s3/s3.module";
import { UserModule } from "../user/user.module";
import { User } from "../user/entities/user.entity";
import { Like } from "../like/entities/like.entity";
import { Comment } from "../comment/entities/comment.entity";
import { ProfanityModule } from "../profanity/profanity.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Board, User, Like, Comment]),
    S3Module,
    UserModule,
    ProfanityModule,
  ],
  controllers: [BoardController],
  providers: [BoardService],
  exports: [BoardService],
=======
import { Module } from '@nestjs/common';
import { BoardService } from './board.service';
import { BoardController } from './board.controller';

@Module({
  controllers: [BoardController],
  providers: [BoardService],
>>>>>>> origin/main
})
export class BoardModule {}
