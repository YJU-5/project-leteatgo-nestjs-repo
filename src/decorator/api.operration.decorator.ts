import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';


export function ApiOperationDecorator(
      // 타입지정
  summary: string, // API의 간략한 설명
  description: string, // API에 대한 자세한 설명
  status: number, // HTTP 상태 코드
  responseDescription: string, // API 응답에 대한 설명
){
// 메서드를 소유한 프로토타입 객체에 적용(target), 메서드 이름(key), 작성해준 기능(descriptor)
  // 데코레이터 인자로 전달받는 값들 target, key, descriptor
  return applyDecorators(
    ApiOperation({ summary, description }),
    ApiResponse({ status, description: responseDescription }),
  );
}