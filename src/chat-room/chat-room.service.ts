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
      this.logger.debug(`Received filter DTO: ${JSON.stringify(filterDto)}`);

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

      // 거리 필터
      if (maxDistance) {
        query.andWhere(
          `ST_DWithin(
            ST_SetSRID(ST_MakePoint(chatRoom.longitude::numeric, chatRoom.latitude::numeric), 4326)::geography,
            ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
            :maxDistance * 1000
          )`,
          { latitude, longitude, maxDistance },
        );
      }

      // 가격 필터
      if (minPrice !== undefined) {
        query.andWhere('chatRoom.averagePrice >= :minPrice', { minPrice });
      }
      if (maxPrice !== undefined) {
        query.andWhere('chatRoom.averagePrice <= :maxPrice', { maxPrice });
      }

      // 나이 필터
      if (minAge !== undefined) {
        query.andWhere('chatRoom.minAge >= :minAge', { minAge });
      }
      if (maxAge !== undefined) {
        query.andWhere('chatRoom.maxAge <= :maxAge', { maxAge });
      }

      // 카테고리 필터
      if (categories && categories.length > 0) {
        query.andWhere('category.name IN (:...categories)', { categories });
      }

      // 거리순으로 정렬
      query.orderBy('distance', 'ASC');

      this.logger.debug(`Generated SQL query: ${query.getSql()}`);

      const chatRooms = await query.getRawAndEntities();

      this.logger.debug(`Found ${chatRooms.entities.length} chat rooms`);

      // 결과를 가공하여 거리 정보 포함
      const result = chatRooms.entities.map((room, index) => ({
        ...room,
        distance: parseFloat(chatRooms.raw[index].distance) || null,
      }));

      return result;
    } catch (error) {
      this.logger.error('채팅방 조회 중 오류 발생:', error);
      this.logger.error('Error stack:', error.stack);
      if (error.message.includes('permission denied')) {
        throw new HttpException(
          'PostGIS 확장 기능에 대한 권한이 없습니다.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        `채팅방 조회 중 오류가 발생했습니다: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 필터링된 채팅방 조회
  async getFilteredChatRooms(filterDto: FilterChatRoomDto) {
    const query = this.chatRoomRepository
      .createQueryBuilder('chatRoom')
      .leftJoinAndSelect('chatRoom.hostId', 'hostId')
      .leftJoinAndSelect('chatRoom.categories', 'categories')
      .where('chatRoom.isActive = :isActive', { isActive: 1 });

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

    return query.getMany();
  }
}
