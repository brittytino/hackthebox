import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ChallengesService } from './challenges.service';
import { ChallengeValidatorService } from './challenge-validator.service';
import { ChallengeLevel } from '@prisma/client';

@Controller('challenges')
export class ChallengesController {
  constructor(
    private challengesService: ChallengesService,
    private validatorService: ChallengeValidatorService,
  ) {}

  // Get all challenges (public for viewing structure)
  @Get()
  getAllChallenges() {
    return this.challengesService.getAllChallenges();
  }

  // Get challenges by round
  @Get('round/:roundNumber')
  getChallengesByRound(@Param('roundNumber') roundNumber: string) {
    return this.challengesService.getChallengesByRound(parseInt(roundNumber));
  }

  // Get specific challenge
  @Get(':level')
  getChallenge(@Param('level') level: ChallengeLevel) {
    return this.challengesService.getChallenge(level);
  }

  // Submit answer
  @Post('submit')
  async submitAnswer(
    @Body()
    body: {
      teamId: string;
      challengeLevel: ChallengeLevel;
      answer: string;
    },
  ) {
    return this.validatorService.validateAnswer(
      body.teamId,
      body.challengeLevel,
      body.answer,
    );
  }

  // Request hint
  @Post('hint')
  async getHint(
    @Body()
    body: {
      teamId: string;
      challengeLevel: ChallengeLevel;
    },
  ) {
    return this.validatorService.getHint(body.teamId, body.challengeLevel);
  }
}
