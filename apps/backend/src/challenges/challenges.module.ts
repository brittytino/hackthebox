import { Module } from '@nestjs/common';
import { ChallengesController } from './challenges.controller';
import { ChallengesService } from './challenges.service';
import { ChallengeValidatorService } from './challenge-validator.service';

@Module({
  controllers: [ChallengesController],
  providers: [ChallengesService, ChallengeValidatorService],
  exports: [ChallengesService, ChallengeValidatorService],
})
export class ChallengesModule {}
