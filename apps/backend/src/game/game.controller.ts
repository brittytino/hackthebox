import { Controller, Get } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(private gameService: GameService) {}

  // Single source of truth for "has anyone won yet" — read from the same
  // StoryState row that ChallengesService.submitFlag atomically claims.
  @Get('state')
  getState() {
    return this.gameService.getState();
  }
}
