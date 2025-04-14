import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix 제거
  // app.setGlobalPrefix('api');

  //Swagger
  const config = new DocumentBuilder()
    .setTitle('메인 API')
    .setDescription('메인 API 문서')
    .setVersion('1.0')
    .addTag('main', '메인 API')
    .addBearerAuth()
    .setTermsOfService(
      'https://inpa.tistory.com/entry/WEB-%F0%9F%8C%90-HTTP-%EB%A9%94%EC%84%9C%EB%93%9C-%EC%A2%85%EB%A5%98-%ED%86%B5%EC%8B%A0-%EA%B3%BC%EC%A0%95-%F0%9F%92%AF-%EC%B4%9D%EC%A0%95%EB%A6%AC',
    )
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  // JWT 가드는 app.module.ts에서 전역으로 설정되어 있으므로 여기서는 제거
  // app.useGlobalGuards(new JwtAuthGuard(new Reflector()))

  // CORS 설정 추가
  app.enableCors({
    origin: ['http://localhost:3005', 'http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
