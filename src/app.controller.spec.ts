import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IS_PUBLIC_KEY } from './decorator/public.decorator';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    })
      .useMocker(() => ({}))
      .compile();
    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('health', () => {
    it('should return an ok status', () => {
      expect(appController.healthCheck()).toEqual({ status: 'ok' });
    });

    it('should be accessible without JWT authentication', () => {
      const isPublic = Reflect.getMetadata(
        IS_PUBLIC_KEY,
        appController.healthCheck,
      );

      expect(isPublic).toBe(true);
    });
  });
});
