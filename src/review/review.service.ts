import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { ChatRoom } from 'src/chat-room/entities/chat-room.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly ReviewRepository: Repository<Review>,
    private readonly userService: UserService,
  ) {}


  async create(createReviewDto: CreateReviewDto, socialId:string ,uploadedUrl:string) {

    const user = await this.userService.getProfile(socialId)

  
    return '생성성공';
  }

  findAll() {
    return `This action returns all review`;
  }

  findOne(id: number) {
    return `This action returns a #${id} review`;
  }

  update(id: number, updateReviewDto: UpdateReviewDto) {
    return `This action updates a #${id} review`;
  }

  remove(id: number) {
    return `This action removes a #${id} review`;
  }
}
