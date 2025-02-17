import { Test, TestingModule } from '@nestjs/testing';
import { ChatParticipantService } from './chat-participant.service';

describe('ChatParticipantService', () => {
  let service: ChatParticipantService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatParticipantService],
    }).compile();

    service = module.get<ChatParticipantService>(ChatParticipantService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
