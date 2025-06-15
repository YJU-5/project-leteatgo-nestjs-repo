import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common'; // NestJS의 컨트롤러 관련 데코레이터 가져오기
import { RestaurantService } from './restaurant.service'; // RestaurantService 서비스 가져오기 (실제 데이터 처리 로직 담당)
import { CreateRestaurantDto } from './dto/create-restaurant.dto'; // DTO 가져오기
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';

@Controller('restaurant') // 이 컨트롤러의 엔드포인트는 /restaurant
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {} // 서비스(restaurantService)를 의존성 주입, 데이터베이스 조회 및 처리는 서비스(RestaurantService)에서 담당

  @Get('all')
  async getAllRestaurants() {
    return this.restaurantService.getAllRestaurants();
  }

  @Get('nearby') // GET /restaurant/nearby 요청이 들어오면 실행됨
  async getNearbyRestaurants(
    @Query('lat') lat: string, // URL에서 lat(위도), lng(경도)를 쿼리스트링으로 받아옴
    @Query('lng') lng: string,
    @Query('radius') radius: string = '3000', // 기본 반경 3km, radius가 없으면 기본값 3000m(3km) 사용
  ) {
    // 받은 값을 숫자로 변환
    const userLat = parseFloat(lat); // 위도와 경도를 문자열 → 숫자로 변환
    const userLng = parseFloat(lng);
    const searchRadius = parseInt(radius, 10); // 반경(radius)을 정수로 변환
    return this.restaurantService.getNearbyRestaurants(
      userLat,
      userLng,
      searchRadius,
    ); // 서비스의 getNearbyRestaurants를 호출, 레스토랑 조회, 클라이언트가 정보를 받을 수 있게끔 응답
  }
}
