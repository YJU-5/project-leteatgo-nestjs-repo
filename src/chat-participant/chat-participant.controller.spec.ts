import { Test, TestingModule } from '@nestjs/testing';
import { ChatParticipantController } from './chat-participant.controller';
import { ChatParticipantService } from './chat-participant.service';

describe('ChatParticipantController', () => {
  let controller: ChatParticipantController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatParticipantController],
      providers: [ChatParticipantService],
    }).compile();

    controller = module.get<ChatParticipantController>(ChatParticipantController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
