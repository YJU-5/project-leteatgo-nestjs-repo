import { Module } from '@nestjs/common';
import { ProfanityService } from './profanity.service';
import { ProfanityController } from './profanity.controller';

@Module({
  controllers: [ProfanityController],
  providers: [ProfanityService],
  exports: [ProfanityService],
})
export class ProfanityModule {}

