import { Module } from "@nestjs/common";
import { ProfanityService } from "./profanity.service";
import { ProfanityController } from "./profanity.controller";

@Module({
  providers: [ProfanityService],
  controllers: [ProfanityController],
  exports: [ProfanityService],
})
export class ProfanityModule {}
