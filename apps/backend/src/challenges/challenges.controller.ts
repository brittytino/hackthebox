import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChallengesService } from './challenges.service';

@Controller('challenges')
@UseGuards(AuthGuard('jwt'))
export class ChallengesController {
  constructor(private challengesService: ChallengesService) {}

  @Get('current')
  getCurrentChallenge(@Request() req) {
    return this.challengesService.getCurrentChallenge(req.user.id);
  }

  @Post('submit')
  submitFlag(
    @Request() req,
    @Body() body: { challengeId: string; flag: string },
  ) {
    return this.challengesService.submitFlag(
      req.user.id,
      body.challengeId,
      body.flag,
    );
  }

  @Get('leaderboard')
  getLeaderboard() {
    return this.challengesService.getLeaderboard();
  }

  @Get('activity')
  getActivity() {
    return this.challengesService.getRecentActivity();
  }

  @Get('all')
  getAllChallenges() {
    return this.challengesService.getAllChallenges();
  }
}

