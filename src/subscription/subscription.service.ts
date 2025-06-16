import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Subscription } from './entities/subscription.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly userService: UserService,
  ) { }

  async create(subscriberId: string, subscribedUserId: string) {
    if (subscriberId === subscribedUserId) {
      throw new ConflictException('자기 자신을 팔로우할 수 없습니다.');
    }

    const user = await this.userService.getProfile(subscriberId)

    const exists = await this.subscriptionRepo.findOne({
      where: {
        subscriber: { id: user.id },
        subscribedUser: { id: subscribedUserId },
      },
    });
    if (exists) {
      throw new ConflictException('이미 팔로우 중입니다.');
    }

    const subscriber = await this.userRepo.findOne({ where: { id: user.id } });
    const subscribedUser = await this.userRepo.findOne({ where: { id: subscribedUserId } });

    if (!subscriber || !subscribedUser) {
      throw new NotFoundException('유저를 찾을 수 없습니다.');
    }

    const subscription = this.subscriptionRepo.create({
      subscriber,
      subscribedUser,
    });
    return this.subscriptionRepo.save(subscription);
  }

  async remove(subscriberId: string, subscribedUserId: string) {

    const user = await this.userService.getProfile(subscriberId)

    const subscription = await this.subscriptionRepo.findOne({
      where: {
        subscriber: { id: user.id },
        subscribedUser: { id: subscribedUserId },
      },
    });
    if (!subscription) {
      throw new NotFoundException('팔로우 관계가 없습니다.');
    }
    await this.subscriptionRepo.remove(subscription);
    return { message: '언팔로우 완료' };
  }

  async findFollowings(userId: string) {

     const user = await this.userService.getProfile(userId)

    const subscriptions = await this.subscriptionRepo.find({
      where: { subscriber: { id: user.id } },
      relations: ['subscribedUser'],
      order: { createdAt: 'DESC' }, // 최근 팔로우 순
    });

    return subscriptions.map(sub => ({
      id: sub.subscribedUser.id,
      name: sub.subscribedUser.name,
      profileImage: sub.subscribedUser.pictureUrl,
      followedAt: `${sub.createdAt.getFullYear()}.${(sub.createdAt.getMonth() + 1).toString().padStart(2, '0')}.${sub.createdAt.getDate().toString().padStart(2, '0')}`,
    }));
  }
}
