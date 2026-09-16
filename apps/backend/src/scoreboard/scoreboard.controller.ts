import { Controller, Get, Param, UseGuards, Sse, MessageEvent, ForbiddenException, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserRole } from '@prisma/client';
import { ScoreboardService } from './scoreboard.service';

@Controller('scoreboard')
export class ScoreboardController {
  constructor(private scoreboardService: ScoreboardService) {}

  // Admins always see the live board; everyone else sees the frozen
  // snapshot while the competition is frozen.
  @Get()
  @UseGuards(AuthGuard('jwt'))
  getScoreboard(@Request() req) {
    if (req.user.role === UserRole.ADMIN) {
      return this.scoreboardService.getLiveScoreboard();
    }
    return this.scoreboardService.getScoreboard();
  }

  @Get('status')
  @UseGuards(AuthGuard('jwt'))
  async getStatus() {
    return { frozen: await this.scoreboardService.isFrozen() };
  }

  // Team stats include each solved challenge's submitted flag text, so this
  // must stay restricted to the team's own members (or an admin) — otherwise
  // any participant could read other teams' correct flags off this endpoint.
  @Get('team/:teamId')
  @UseGuards(AuthGuard('jwt'))
  getTeamStats(@Param('teamId') teamId: string, @Request() req) {
    if (req.user.role !== UserRole.ADMIN && req.user.teamId !== teamId) {
      throw new ForbiddenException('You can only view your own team\'s stats');
    }
    return this.scoreboardService.getTeamStats(teamId);
  }

  // SSE endpoint — no JWT guard because EventSource cannot send Authorization headers.
  // Backed by one shared poll (ScoreboardService.getLiveScoreboardStream) so
  // the DB is queried once per tick no matter how many clients are watching.
  @Sse('live')
  liveScoreboard(): Observable<MessageEvent> {
    return this.scoreboardService.getLiveScoreboardStream().pipe(
      map((scoreboard) => ({
        data: scoreboard,
      })),
    );
  }
}
