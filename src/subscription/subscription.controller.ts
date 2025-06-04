import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { Public } from 'src/decorator/public.decorator';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { RequestWithUser } from 'src/user/request.interface';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) { }

  @Post(':targetUserId')
  @ApiBearerAuth()
  @ApiOperation({ summary: '팔로우', description: '상대방을 팔로우합니다.' })
  @ApiParam({ name: 'targetUserId', type: String, description: '팔로우할 유저의 ID' })
  @ApiResponse({ status: 201, description: '팔로우 성공' })
  async follow(
    @Param('targetUserId') targetUserId: string,
    @Req() req: RequestWithUser,
  ) {
    const myId = req.user.socialId; // JWT에서 추출

    return this.subscriptionService.create(myId, targetUserId);
  }

  @Delete(':targetUserId')
  @ApiBearerAuth() // JWT 인증 필요
  @ApiOperation({ summary: '언팔로우', description: '상대방을 언팔로우합니다.' })
  @ApiParam({ name: 'targetUserId', type: String, description: '언팔로우할 유저의 ID' })
  @ApiResponse({ status: 200, description: '언팔로우 성공' })
  async unfollow(
    @Param('targetUserId') targetUserId: string,
    @Req() req: RequestWithUser,
  ) {

    const myId = req.user.socialId;

    return this.subscriptionService.remove(myId, targetUserId);
  }

  @Get('')
  @ApiBearerAuth() // JWT 인증 필요
  @ApiResponse({ status: 200, description: '언팔로우 성공' })
  async getFollowings(
    @Req() req: RequestWithUser
   ) {

    const myId = req.user.socialId;

    return this.subscriptionService.findFollowings(myId);
  }
}
