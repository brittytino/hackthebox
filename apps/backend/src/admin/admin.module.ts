import { Module } from '@nestjs/common';
import { ScoreboardModule } from '../scoreboard/scoreboard.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [ScoreboardModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
