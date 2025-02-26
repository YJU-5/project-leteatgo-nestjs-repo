import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { Injectable } from '@nestjs/common'; // NestJS 서비스(@Injectable()) 설정
import { InjectRepository } from '@nestjs/typeorm'; // TypeORM을 통해 Restaurant 엔티티에 접근
import { Repository } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';

@Injectable() // NestJS 서비스로 등록
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant) // Restaurant 엔티티를 조작하는 TypeORM 레포지토리
    private readonly restaurantRepository: Repository<Restaurant>,
  ) {}

  async getNearbyRestaurants(userLat: number, userLng: number, radius = 3000) { // 사용자의 현재 위치(userLat, userLng)를 받아 반경(radius) 내의 레스토랑을 검색, 미터 단위라 3000 = 3km
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
   console.log("받은 위도:", userLat, "받은 경도:", userLng, "검색 반경:", radius);
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
   console.log("쿼리 결과:", results);
    return results;
}
}