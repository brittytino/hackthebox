import { Controller, Get, Param, UseGuards, Sse, MessageEvent } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable, interval } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ScoreboardService } from './scoreboard.service';

@Controller('scoreboard')
export class ScoreboardController {
  constructor(private scoreboardService: ScoreboardService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  getScoreboard() {
    return this.scoreboardService.getScoreboard();
  }

  @Get('team/:teamId')
  @UseGuards(AuthGuard('jwt'))
  getTeamStats(@Param('teamId') teamId: string) {
    return this.scoreboardService.getTeamStats(teamId);
  }

  // SSE endpoint — no JWT guard because EventSource cannot send Authorization headers
  @Sse('live')
  liveScoreboard(): Observable<MessageEvent> {
    return interval(5000).pipe(
      switchMap(() => this.scoreboardService.getScoreboard()),
      map((scoreboard) => ({
        data: scoreboard,
      })),
    );
  }
}
