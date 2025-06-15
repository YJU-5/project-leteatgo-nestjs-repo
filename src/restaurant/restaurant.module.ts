import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantService } from './restaurant.service';
import { RestaurantController } from './restaurant.controller';
import { Restaurant } from './entities/restaurant.entity';
import { ChatRoom } from '../chat-room/entities/chat-room.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, ChatRoom])],
  controllers: [RestaurantController],
  providers: [RestaurantService],
})
export class RestaurantModule {}
