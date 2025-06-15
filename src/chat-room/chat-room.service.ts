import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatRoom } from './entities/chat-room.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { UserChatRoomService } from 'src/user-chat-room/user-chat-room.service';
import { FilterChatRoomDto } from './dto/filter-chat-room.dto';

@Injectable()
export class ChatRoomService {
  private readonly logger = new Logger(ChatRoomService.name);

  constructor(
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepository: Repository<ChatRoom>,
    private readonly userService: UserService,
    private readonly userChatRoomService: UserChatRoomService,
  ) {}

  // 채팅방 생성
  async createChatRoom(createChatRoomDto, socialId) {
    const user = await this.userService.getProfile(socialId);
    const newChatRoom = this.chatRoomRepository.create({
      ...createChatRoomDto,
      hostId: user,
      status: 'IN_PROGRESS',
    });

    const saveChatRoom = await this.chatRoomRepository.save(newChatRoom);
    await this.userChatRoomService.userChatRoomCreateHost(user, saveChatRoom);
    return saveChatRoom;
  }

  // 모든 채팅방 조회
  async chatRoomfindAll() {
    return this.chatRoomRepository.find({
      relations: ['hostId', 'categories'],
      where: { isActive: 1 },
    });
  }

  // 위치 기반 채팅방 조회 (필터링 포함)
  async getChatRoomsByLocation(filterDto: FilterChatRoomDto) {
    try {
      this.logger.log(
        `Starting getChatRoomsByLocation with params: ${JSON.stringify(filterDto)}`,
      );

      const {
        latitude,
        longitude,
        minDistance = 0,
        maxDistance = 10,
        minPrice,
        maxPrice,
        minAge,
        maxAge,
        categories,
      } = filterDto;

      this.logger.log(
        `Building query with lat: ${latitude}, lng: ${longitude}`,
      );

      // PostGIS를 사용한 거리 계산 쿼리
      const query = this.chatRoomRepository
        .createQueryBuilder('chatRoom')
        .select([
          'chatRoom.id',
          'chatRoom.title',
          'chatRoom.description',
          'chatRoom.status',
          'chatRoom.startDate',
          'chatRoom.maxParticipants',
          'chatRoom.gender',
          'chatRoom.pictureUrl',
          'chatRoom.minAge',
          'chatRoom.maxAge',
          'chatRoom.latitude',
          'chatRoom.longitude',
          'chatRoom.address',
          'chatRoom.averagePrice',
          'chatRoom.isActive',
        ])
        .addSelect(['host.id', 'host.name', 'host.pictureUrl'])
        .addSelect(['category.id', 'category.name'])
        .addSelect(
          `ST_Distance(
            ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
            ST_SetSRID(ST_MakePoint(chatRoom.longitude::numeric, chatRoom.latitude::numeric), 4326)::geography
          ) / 1000`,
          'distance',
        )
        .leftJoin('chatRoom.hostId', 'host')
        .leftJoin('chatRoom.categories', 'category')
        .where('chatRoom.isActive = :isActive', { isActive: 1 });

      // 임시로 PostGIS 없이 기본 쿼리 실행
      const basicQuery = this.chatRoomRepository
        .createQueryBuilder('chatRoom')
        .select([
          'chatRoom.id',
          'chatRoom.title',
          'chatRoom.description',
          'chatRoom.status',
          'chatRoom.startDate',
          'chatRoom.maxParticipants',
          'chatRoom.gender',
          'chatRoom.pictureUrl',
          'chatRoom.minAge',
          'chatRoom.maxAge',
          'chatRoom.latitude',
          'chatRoom.longitude',
          'chatRoom.address',
          'chatRoom.averagePrice',
          'chatRoom.isActive',
        ])
        .leftJoin('chatRoom.hostId', 'host')
        .leftJoin('chatRoom.categories', 'category')
        .where('chatRoom.isActive = :isActive', { isActive: 1 });

      this.logger.log('Executing basic query without PostGIS');
      const chatRooms = await basicQuery.getMany();

      // 거리 계산을 JavaScript로 수행
      const result = chatRooms.map((room) => {
        const distance = this.calculateDistance(
          Number(latitude),
          Number(longitude),
          Number(room.latitude),
          Number(room.longitude),
        );
        return { ...room, distance };
      });

      // 거리로 정렬
      result.sort((a, b) => a.distance - b.distance);

      this.logger.log(`Found ${result.length} chat rooms`);
      return result;
    } catch (error) {
      this.logger.error('Error in getChatRoomsByLocation:', error);
      this.logger.error('Error stack:', error.stack);
      throw new HttpException(
        `채팅방 조회 중 오류가 발생했습니다: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Haversine formula를 사용한 거리 계산
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // 지구의 반경 (km)
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(value: number): number {
    return (value * Math.PI) / 180;
  }

  // 필터링된 채팅방 조회
  async getFilteredChatRooms(filterDto: FilterChatRoomDto) {
    const query = this.chatRoomRepository
      .createQueryBuilder('chatRoom')
      .select([
        'chatRoom.id',
        'chatRoom.title',
        'chatRoom.description',
        'chatRoom.status',
        'chatRoom.startDate',
        'chatRoom.maxParticipants',
        'chatRoom.gender',
        'chatRoom.pictureUrl',
        'chatRoom.minAge',
        'chatRoom.maxAge',
        'chatRoom.latitude',
        'chatRoom.longitude',
        'chatRoom.address',
        'chatRoom.averagePrice',
        'chatRoom.isActive',
        'chatRoom.createdAt',
        'chatRoom.updatedAt',
        'hostId.id',
        'hostId.name',
        'hostId.email',
        'hostId.pictureUrl',
        'categories.id',
        'categories.name',
      ])
      .leftJoin('chatRoom.hostId', 'hostId')
      .leftJoin('chatRoom.categories', 'categories')
      .where('chatRoom.isActive = :isActive', { isActive: 1 });

    // 위치 기반(거리 기반) 필터 추가
    if (
      filterDto.latitude !== undefined &&
      filterDto.longitude !== undefined &&
      filterDto.minDistance !== undefined &&
      filterDto.maxDistance !== undefined
    ) {
      query.andWhere(
        `ST_DistanceSphere(
          ST_MakePoint(chatRoom.longitude, chatRoom.latitude),
          ST_MakePoint(:lng, :lat)
        ) BETWEEN :minDist AND :maxDist`,
        {
          lng: filterDto.longitude,
          lat: filterDto.latitude,
          minDist: filterDto.minDistance * 1000, // km → m
          maxDist: filterDto.maxDistance * 1000, // km → m
        },
      );
    }

    if (filterDto.categories && filterDto.categories.length > 0) {
      query.andWhere('categories.name IN (:...categories)', {
        categories: filterDto.categories,
      });
    }

    if (filterDto.status) {
      query.andWhere('chatRoom.status = :status', { status: filterDto.status });
    }

    if (filterDto.gender) {
      query.andWhere('chatRoom.gender = :gender', { gender: filterDto.gender });
    }

    if (filterDto.minAge) {
      query.andWhere('chatRoom.minAge >= :minAge', {
        minAge: filterDto.minAge,
      });
    }

    if (filterDto.maxAge) {
      query.andWhere('chatRoom.maxAge <= :maxAge', {
        maxAge: filterDto.maxAge,
      });
    }

    if (filterDto.minPrice) {
      query.andWhere('chatRoom.averagePrice >= :minPrice', {
        minPrice: filterDto.minPrice,
      });
    }

    if (filterDto.maxPrice) {
      query.andWhere('chatRoom.averagePrice <= :maxPrice', {
        maxPrice: filterDto.maxPrice,
      });
    }

    return query.getMany();
  }
}
