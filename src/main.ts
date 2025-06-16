import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { ValidationPipe } from '@nestjs/common';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //Swagger
  const config = new DocumentBuilder()
    .setTitle("메인 API")
    .setDescription("메인 API 문서")
    .setVersion("1.0")
    .addTag("main", "메인 API")
    // jwt 토큰인증헤더에 넣어줄 때
    .addBearerAuth() // 컨트롤러에 ApiBeareAuth()이걸 하면 인증하면 됨
    .setTermsOfService(
      "https://inpa.tistory.com/entry/WEB-%F0%9F%8C%90-HTTP-%EB%A9%94%EC%84%9C%EB%93%9C-%EC%A2%85%EB%A5%98-%ED%86%B5%EC%8B%A0-%EA%B3%BC%EC%A0%95-%F0%9F%92%AF-%EC%B4%9D%EC%A0%95%EB%A6%AC"
    )
    // 서버도 추가 됨 즉, 실제 테스트 용도, 배포 용도
    // .addServer('http://localhost:3002', 'develop')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  // JWT 전역가드 설정
  const reflector = new Reflector();
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  app.setGlobalPrefix('api');

  //Cors
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3005',
      'http://localhost:3001',
      'https://accounts.google.com',
      'https://oauth2.googleapis.com',
      // 'http://leteatgo-alb-113785780.ap-northeast-2.elb.amazonaws.com',
      // 'https://matchash.shop', // 도메인 연결 후
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders:
      'Content-Type, Accept, Authorization, X-Requested-With, Origin',
    exposedHeaders: ['Authorization'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });


  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
