import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GameService {
  constructor(private prisma: PrismaService) {}

  async getState() {
    const state = await this.prisma.storyState.findUnique({ where: { id: 'singleton' } });

    if (!state) {
      return {
        storyStarted: false,
        storyEnded: false,
        round3Winner: null,
        winnerTeamName: null,
        winTimestamp: null,
        finalOutcome: null,
      };
    }

    return state;
  }
}
