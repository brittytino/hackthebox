import { Controller, Get, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import { StoryService } from './story.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '@prisma/client';

@Controller('story')
export class StoryController {
  constructor(private storyService: StoryService) {}

  @Get('progress')
  @UseGuards(JwtAuthGuard)
  async getProgress(@Request() req) {
    const teamId = req.user.teamId;
    if (!teamId) {
      return { error: 'You must be part of a team to view story progress' };
    }
    return this.storyService.getTeamProgress(teamId);
  }

  @Get('state')
  async getStoryState() {
    return this.storyService.getStoryState();
  }

  @Get('round/:roundNumber')
  @UseGuards(JwtAuthGuard)
  async getRoundContent(@Request() req, @Param('roundNumber') roundNumber: string) {
    const teamId = req.user.teamId;
    if (!teamId) {
      return { error: 'You must be part of a team' };
    }

    const round = parseInt(roundNumber);
    const canAccess = await this.storyService.canAccessRound(teamId, round);

    if (!canAccess) {
      return {
        error: 'Round locked',
        message: 'Complete previous rounds to unlock this round',
      };
    }

    return this.storyService.getRoundChallengeContent(round);
  }

  @Post('submit/round1')
  @UseGuards(JwtAuthGuard)
  async submitRound1(@Request() req, @Body() solution: any) {
    const teamId = req.user.teamId;
    if (!teamId) {
      return { error: 'You must be part of a team' };
    }
    return this.storyService.submitRound1Solution(teamId, solution);
  }

  @Post('submit/round2')
  @UseGuards(JwtAuthGuard)
  async submitRound2(@Request() req, @Body() solution: any) {
    const teamId = req.user.teamId;
    if (!teamId) {
      return { error: 'You must be part of a team' };
    }
    return this.storyService.submitRound2Solution(teamId, solution);
  }

  @Post('submit/round3')
  @UseGuards(JwtAuthGuard)
  async submitRound3(@Request() req, @Body() body: { flag: string }) {
    const teamId = req.user.teamId;
    if (!teamId) {
      return { error: 'You must be part of a team' };
    }
    return this.storyService.submitRound3Flag(teamId, body.flag);
  }

  // Admin endpoints
  @Post('admin/start')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async startStory() {
    return this.storyService.startStory();
  }

  @Post('admin/end')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async endStory(@Body() body: { outcome: 'CITY_SAVED' | 'BREACH_EXECUTED' }) {
    return this.storyService.triggerStoryEnding(body.outcome);
  }

  @Post('admin/reset')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async resetStory() {
    return this.storyService.resetStory();
  }

  @Get('admin/all-progress')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.JUDGE)
  async getAllProgress() {
    return this.storyService.getAllTeamsProgress();
  }
}
