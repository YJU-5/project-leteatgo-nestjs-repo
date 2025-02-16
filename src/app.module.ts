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

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmModuleOptions), UserModule, ChatRoomModule, BoardModule, LikeModule, CommentModule, SubscriptionModule, NotificationModule, RestaurantModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
