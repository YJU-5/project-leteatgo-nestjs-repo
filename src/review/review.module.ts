import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { Review } from './entities/review.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { S3Module } from 'src/s3/s3.module';
import { UserService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';
import { ChatRoomModule } from 'src/chat-room/chat-room.module';
import { User } from 'src/user/entities/user.entity';
import { ChatRoom } from 'src/chat-room/entities/chat-room.entity';
import { UserChatRoomModule } from 'src/user-chat-room/user-chat-room.module';
import { UserChatRoom } from 'src/user-chat-room/entities/user-chat-room.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Review,User,ChatRoom,UserChatRoom]),S3Module,UserModule,ChatRoomModule,UserChatRoomModule],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
