import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from 'src/decorator/public.decorator';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector){
    super()
  }

  // 요청이 들어올 때 이 메서드가 호출되어 인증처리
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // 엔드포인트에 @Public 데코레이터가 있는지 확인
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY,[
      context.getHandler(), // 메서드 수준
      context.getClass(), // 클래스 수준
    ])

    if(isPublic){
      return true // @Public()이 설정된 경우 가드 비활성화 
    }

    return super.canActivate(context)
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if(err || !user){
      // 인증 실패 시 처리 
      throw err || new Error('인증 실패')
    }
    return user
  }
}
