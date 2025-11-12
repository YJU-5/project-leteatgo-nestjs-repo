import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from 'src/decorator/public.decorator';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  // 요청이 들어올 때 이 메서드가 호출되어 인증처리
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // 엔드포인트에 @Public 데코레이터가 있는지 확인
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(), // 메서드 수준
      context.getClass(), // 클래스 수준
    ]);

    if (isPublic) {
      return true; // @Public()이 설정된 경우 가드 비활성화
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err) {
      if (err.name === 'UnauthorizedException') {
        throw err;
      }
      throw new UnauthorizedException(err.message);
    }

    if (!user) {
      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException(
          'JWT 토큰이 만료되었습니다. 다시 로그인해주세요.',
        );
      }

      if (info?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('유효하지 않은 JWT 토큰입니다.');
      }

      throw new UnauthorizedException('JWT 인증 실패');
    }

    return user;
  }
}
