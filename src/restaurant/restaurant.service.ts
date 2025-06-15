import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { Injectable } from '@nestjs/common'; // NestJS 서비스(@Injectable()) 설정
import { InjectRepository } from '@nestjs/typeorm'; // TypeORM을 통해 Restaurant 엔티티에 접근
import { Repository } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { ChatRoom } from '../chat-room/entities/chat-room.entity';

@Injectable() // NestJS 서비스로 등록
export class RestaurantService {
  private sampleRestaurants = [
    {
      restaurantId: '1',
      restaurantName: '맛있는 한식당',
      latitude: 37.5665,
      longitude: 126.978,
      chatRoom: {
        title: '맛있는 한식 모임',
        description: '전통 한식을 함께 즐겨요',
        startDate: '2024-04-20',
        price: 25000,
      },
    },
    {
      restaurantId: '2',
      restaurantName: '이탈리안 레스토랑',
      latitude: 37.5668,
      longitude: 126.9785,
      chatRoom: {
        title: '파스타 러버',
        description: '파스타와 와인 한잔',
        startDate: '2024-04-21',
        price: 35000,
      },
    },
    {
      restaurantId: '3',
      restaurantName: '일식당',
      latitude: 37.5662,
      longitude: 126.9775,
      chatRoom: {
        title: '스시 모임',
        description: '신선한 스시를 함께',
        startDate: '2024-04-22',
        price: 40000,
      },
    },
  ];

  constructor(
    @InjectRepository(Restaurant) // Restaurant 엔티티를 조작하는 TypeORM 레포지토리
    private readonly restaurantRepository: Repository<Restaurant>,
    @InjectRepository(ChatRoom)
    private chatRoomRepository: Repository<ChatRoom>,
  ) {}

  async getNearbyRestaurants(userLat: number, userLng: number, radius = 3000) {
    // 사용자의 현재 위치(userLat, userLng)를 받아 반경(radius) 내의 레스토랑을 검색, 미터 단위라 3000 = 3km
    //   return this.restaurantRepository.query( // SQL 쿼리 실행
    //     `
    //     SELECT *,
    //            ST_DistanceSphere( -- 두 지점(A, B) 간의 거리(미터 단위)를 계산
    //              ST_MakePoint(longitude, latitude), -- 데이터베이스에 저장된 각 Restaurant의 좌표를 PostGIS 포인트로 변환
    //              ST_MakePoint($1, $2) -- 사용자의 현재 좌표를 Point로 변환
    //            ) AS distance
    //     FROM restaurant
    //     WHERE ST_DistanceSphere( -- 반경 radius미터(기본 3km) 이내의 레스토랑만 선택
    //              ST_MakePoint(longitude, latitude),
    //              ST_MakePoint($1, $2)
    //            ) <= $3
    //     ORDER BY distance ASC; -- 가장 가까운 순서대로 정렬
    //     `,
    //     [userLng, userLat, radius], // 사용자 좌표와 반경 필터
    //   );
    // }
    console.log(
      '받은 위도:',
      userLat,
      '받은 경도:',
      userLng,
      '검색 반경:',
      radius,
    );
    const results = await this.restaurantRepository.query(
      `
     SELECT *, 
            ST_DistanceSphere(
              ST_MakePoint(longitude, latitude), 
              ST_MakePoint($2, $1)
            ) AS distance
     FROM restaurant
     WHERE ST_DistanceSphere(
              ST_MakePoint(longitude, latitude), 
              ST_MakePoint($2, $1)
            ) <= $3
     ORDER BY distance ASC;
     `,
      [userLat, userLng, radius], // 위도(userLat) 먼저, 경도(userLng) 나중
    );
    console.log('쿼리 결과:', results);
    return results;
  }

  async getAllRestaurants() {
    // 실제 DB 조회 로직 구현 전까지는 샘플 데이터 반환
    return this.sampleRestaurants;
  }
}
