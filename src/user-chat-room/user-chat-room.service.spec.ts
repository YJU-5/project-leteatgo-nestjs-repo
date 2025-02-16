import { Test, TestingModule } from '@nestjs/testing';
import { UserChatRoomService } from './user-chat-room.service';

describe('UserChatRoomService', () => {
  let service: UserChatRoomService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserChatRoomService],
    }).compile();

    service = module.get<UserChatRoomService>(UserChatRoomService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
