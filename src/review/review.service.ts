import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { ChatRoom } from 'src/chat-room/entities/chat-room.entity';
import { S3Service } from 'src/s3/s3.service';
import { UserChatRoom } from 'src/user-chat-room/entities/user-chat-room.entity';


@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    private readonly userService: UserService,
    @InjectRepository(ChatRoom)
    private readonly ChatRoomRepository: Repository<ChatRoom>,
    @InjectRepository(UserChatRoom)
    private readonly userChatRoomRepository: Repository<UserChatRoom>,
    private readonly s3Service: S3Service,

  ) { }


  //리뷰 작성
  async create(createReviewDto: CreateReviewDto, socialId: string, uploadedUrls, roomid: string) {

    //평가한 유저
    const user = await this.userService.getProfile(socialId)

    //평가받은 유저가 개최한 개최내역과 역할이 host == 방장
    const reviewee = await this.userChatRoomRepository.findOne({
      where: {
        chatRoomId: { id: roomid },
        role: 'HOST',
      },
      relations: ['userId', 'chatRoomId'],
    })
    if (!reviewee || !reviewee.chatRoomId.id || !reviewee.userId.id) {
      throw new NotFoundException('채팅방과 host 를 찾을 수 없습니다');
    }

    //채팅방 아이디
    const chatRoomId = reviewee.chatRoomId.id;

    // 리뷰받는사람
    const host = reviewee.userId.id;

    // 리뷰 작성자가 채팅방 멤버인지 확인
    const reviewerMembership = await this.userChatRoomRepository.findOne({
      where: {
        chatRoomId: { id: roomid },
        userId: { id: user.id },
      },
    });
    if (!reviewerMembership) {
      throw new ForbiddenException('채팅방 멤버만 리뷰를 작성할 수 있습니다');
    }

    //중복리뷰 방지
    const existingReview = await this.reviewRepository.findOne({
      where: {
        chatRoom: { id: chatRoomId },
        reviewer: { id: user.id },
        reviewee: { id: host },
      },
    });
    if (existingReview) {
      throw new BadRequestException('이미 이 채팅방에서 해당 사용자를 평가했습니다');
    }

    const review = this.reviewRepository.create({
      chatRoom: { id: chatRoomId }, //어느채팅방이냐
      reviewer: { id: user.id }, // 누가 리뷰를 했느냐
      reviewee: { id: host }, //누가 리뷰를 받았느냐
      description: createReviewDto.description,
      kindness: createReviewDto.kindness,
      humor: createReviewDto.humor,
      activeness: createReviewDto.activeness,
      cook: createReviewDto.cook,
      compliance: createReviewDto.compliance,
      pictureUrl: uploadedUrls || null,
      isActive: 1,
    });


    return this.reviewRepository.save(review);
  }

  //전체 리뷰 찾기
  async findAll() {
    return this.reviewRepository.find();
  }


  //특정 리뷰찾기
  findOne(id: string) {
    return this.ChatRoomRepository.findOne(
      { where: { id } }
    );
  }

  async getMyReviews(socialId: string) {
    const user = await this.userService.getProfile(socialId)

    const revies = await this.reviewRepository.find({
      where: { reviewer: { id: user.id } },
      relations: ['reviewee', 'chatRoom'],
      order: { createdAt: 'DESC' }
    });
    const response = revies.map(review => ({
      id: review.id,                                  // 리뷰 id
      title: review.description,                       // 리뷰 제목 (필드명 확인)
      createdAt: review.createdAt,                     // 리뷰 작성 시간
      pictureUrl: review.pictureUrl,                   // 리뷰 사진 (배열)
      address: review.chatRoom.address,                // 리뷰를 남긴 방의 주소
      chatRoomId: review.chatRoom.id                   // 리뷰를 남긴 방의 id
    }));
    return response;
  }



  //채팅방에 작성한 리뷰와 채팅방정보 
  async findRoomReview(id: string) {
    const roomreview = await this.ChatRoomRepository.findOne({ where: { id }, relations: ['reviews', 'reviews.reviewer'] })
    const response = {
      id: roomreview.id,
      title: roomreview.title,
      createdAt: roomreview.createdAt,
      price: roomreview.price,
      pictureUrl: roomreview.pictureUrl,
      address: roomreview.address,
      maxAge: roomreview.maxAge,
      minAge: roomreview.minAge,
      gender: roomreview.gender,
      reviews: (roomreview.reviews || []).map((review) => ({
        id: review.id,
        name: review.reviewer?.name || "익명",
        content: review.description,
        profile: review.reviewer?.pictureUrl || "/gitb.png",
        reviewUrl: review.pictureUrl,
      }))
    }
    console.log(response);
    return response;
  }

  // 리뷰수정
  async update(id: string, updateReviewDto: UpdateReviewDto, uploadedUrl: string[]) {
    const review = await this.reviewRepository.findOne({ where: { id } });

    if (!review) {
      throw new NotFoundException(`Review with id ${id} not found`);
    }


    const oldImages = review.pictureUrl || []; // 기존 DB에 저장된 이미지들
    const newImages = uploadedUrl; // S3에서 새로 업로드된 이미지들

    let finalImages: string[] = []
    let deletedImages: string[] = []

    if (oldImages.length === 0) { //수정할 사진이 없다면
      finalImages = newImages;
    } else {
      deletedImages = oldImages.filter( //삭제할 이미지 찾기
        (url: string) => !newImages.includes(url),
      );

      if (deletedImages.length > 0) { //삭제할 이미지 있으면 s3에서 삭제
        await Promise.all(
          deletedImages.map(url => this.s3Service.deleteFile(url))
        )
      }

      finalImages = oldImages.filter(
        (url: string) => newImages.includes(url),
      );

      const newOnlyImages = newImages.filter(url => !oldImages.includes(url));
      finalImages = [...finalImages, ...newOnlyImages];
    }

    // ✅ 리뷰 내용 및 이미지 목록 업데이트
    await this.reviewRepository.update(id, {
      ...updateReviewDto,
      pictureUrl: finalImages,
    });

    return { message: `리뷰 ${id}번이 성공적으로 수정되었습니다.` };
  }


  //삭제
  async remove(id: string) {

    //삭제할 글이 있는지 확인
    const removeReview = await this.reviewRepository.findOne({
      where: { id }
    })

    //삭제할 글이 없으면 오류
    if (!removeReview) throw new NotFoundException('리뷰가 존재하지 않습니다.')

    //이미지가 2개 이상이어서 배열에 넣어주기
    const pictureUrls: string[] = removeReview.pictureUrl;

    //s3에있는 사진들 삭제
    if (pictureUrls && pictureUrls.length > 0) {
      await Promise.all(
        pictureUrls.map((url) => this.s3Service.deleteFile(url))
      )
    }

    //db에서 삭제
    await this.reviewRepository.remove(removeReview);

    return { message: '리뷰 및 이미지 삭제 완료' };
  }

  async getAverages(socialId: string) {

    //유저정보 
    const user = await this.userService.getProfile(socialId)

    const reviews = await this.reviewRepository.find({
      where: { reviewee: { id: user.id } }
    });

    const calculateAverage = (reviews: any[], key: string): number => {
      if (reviews.length === 0) return 0;
      const sum = reviews.reduce((acc, curr) => acc + curr[key], 0);
      return Number((sum / reviews.length).toFixed(1));
    };

    const averages = [
      calculateAverage(reviews, 'kindness'),
      calculateAverage(reviews, 'humor'),
      calculateAverage(reviews, 'activeness'),
      calculateAverage(reviews, 'cook'),
      calculateAverage(reviews, 'compliance')
    ];


    return averages
  }
}
