import {
  Controller,
  Get,
  Param,
  Query,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { Observable, interval } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { RegistrationService } from '../teams/registration.service';

@Controller('scoreboard')
export class ScoreboardController {
  constructor(private registrationService: RegistrationService) {}

  // Get leaderboard
  @Get()
  async getScoreboard(@Query('limit') limit?: string) {
    const leaderboard = await this.registrationService.getLeaderboard(
      limit ? parseInt(limit) : 10,
    );
    return { success: true, leaderboard };
  }

  // Get team stats
  @Get('team/:teamId')
  async getTeamStats(@Param('teamId') teamId: string) {
    const team = await this.registrationService.getTeamInfo(teamId);
    if (!team) {
      return { success: false, message: 'Team not found' };
    }
    return { success: true, team };
  }

  // Real-time leaderboard (Server-Sent Events)
  @Sse('live')
  liveScoreboard(): Observable<MessageEvent> {
    return interval(5000).pipe(
      switchMap(() => this.registrationService.getLeaderboard(10)),
      map((leaderboard) => ({
        data: { leaderboard },
      })),
    );
  }
}
