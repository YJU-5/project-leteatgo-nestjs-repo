import { Test, TestingModule } from '@nestjs/testing';
import { UserChatRoomController } from './user-chat-room.controller';
import { UserChatRoomService } from './user-chat-room.service';

describe('UserChatRoomController', () => {
  let controller: UserChatRoomController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserChatRoomController],
      providers: [UserChatRoomService],
    }).compile();

    controller = module.get<UserChatRoomController>(UserChatRoomController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
