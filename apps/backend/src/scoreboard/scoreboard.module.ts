import { Module } from '@nestjs/common';
import { ScoreboardController } from './scoreboard.controller';
import { ScoreboardService } from './scoreboard.service';
import { RegistrationService } from '../teams/registration.service';

@Module({
  controllers: [ScoreboardController],
  providers: [ScoreboardService, RegistrationService],
  exports: [ScoreboardService],
})
export class ScoreboardModule {}
