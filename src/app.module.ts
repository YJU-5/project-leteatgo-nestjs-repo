<<<<<<< HEAD
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { typeOrmModuleOptions } from "./configs/typeorm.config";
import { UserModule } from "./user/user.module";
import { ChatRoomModule } from "./chat-room/chat-room.module";
import { BoardModule } from "./board/board.module";
import { LikeModule } from "./like/like.module";
import { CommentModule } from "./comment/comment.module";
import { SubscriptionModule } from "./subscription/subscription.module";
import { NotificationModule } from "./notification/notification.module";
import { RestaurantModule } from "./restaurant/restaurant.module";
import { ReviewModule } from "./review/review.module";
import { CategoryModule } from "./category/category.module";
import { TagModule } from "./tag/tag.module";
import { UserChatRoomModule } from "./user-chat-room/user-chat-room.module";
import { MessageModule } from "./message/message.module";
import { ChatParticipantModule } from "./chat-participant/chat-participant.module";
import { AuthModule } from "./auth/auth.module";
import { ConfigModule } from "@nestjs/config";
import { S3Module } from "./s3/s3.module";
import { ChatRoomGateway } from "./chat-room/chat-room.gateway";
import { ProfanityModule } from "./profanity/profanity.module";
=======
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmModuleOptions } from './configs/typeorm.config';
import { UserModule } from './user/user.module';
import { ChatRoomModule } from './chat-room/chat-room.module';
import { BoardModule } from './board/board.module';
import { LikeModule } from './like/like.module';
import { CommentModule } from './comment/comment.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { NotificationModule } from './notification/notification.module';
import { RestaurantModule } from './restaurant/restaurant.module';
import { ReviewModule } from './review/review.module';
import { CategoryModule } from './category/category.module';
import { TagModule } from './tag/tag.module';
import { UserChatRoomModule } from './user-chat-room/user-chat-room.module';
import { MessageModule } from './message/message.module';
import { ChatParticipantModule } from './chat-participant/chat-participant.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { S3Module } from './s3/s3.module';
import { ChatRoomGateway } from './chat-room/chat-room.gateway';
>>>>>>> origin/main

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(typeOrmModuleOptions),
    UserModule,
    ChatRoomModule,
    ReviewModule,
    CategoryModule,
    TagModule,
    UserChatRoomModule,
    MessageModule,
    ChatParticipantModule,
    BoardModule,
    LikeModule,
    CommentModule,
    SubscriptionModule,
    NotificationModule,
    RestaurantModule,
    AuthModule,
    S3Module,
<<<<<<< HEAD
    ProfanityModule,
=======
>>>>>>> origin/main
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
