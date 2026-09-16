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
import { Throttle } from '@nestjs/throttler';
import { ChallengesService } from './challenges.service';
import { SubmitChallengeFlagDto } from './dto/submit-flag.dto';

@Controller('challenges')
@UseGuards(AuthGuard('jwt'))
export class ChallengesController {
  constructor(private challengesService: ChallengesService) {}

  @Get('current')
  getCurrentChallenge(@Request() req) {
    return this.challengesService.getCurrentChallenge(req.user.id);
  }

  @Post('submit')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  submitFlag(@Request() req, @Body() body: SubmitChallengeFlagDto) {
    return this.challengesService.submitFlag(
      req.user.id,
      body.challengeId,
      body.flag,
    );
  }

  @Post(':id/hint')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  useHint(@Request() req, @Param('id') challengeId: string) {
    return this.challengesService.useHint(req.user.id, challengeId);
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

