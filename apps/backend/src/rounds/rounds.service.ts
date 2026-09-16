import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RoundStatus } from '@prisma/client';

@Injectable()
export class RoundsService {
  constructor(private prisma: PrismaService) {}

  async getCurrentRound() {
    const activeRound = await this.prisma.round.findFirst({
      where: { status: RoundStatus.ACTIVE },
      include: {
        challenges: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            description: true,
            points: true,
            order: true,
            hints: true,
            maxAttempts: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    });

    if (!activeRound) {
      return null;
    }

    const uniqueCh: typeof activeRound.challenges = [];
    const seen = new Set<number>();
    for (const c of activeRound.challenges) {
      if (!seen.has(c.order)) {
        seen.add(c.order);
        uniqueCh.push(c);
      }
    }
    activeRound.challenges = uniqueCh;

    return activeRound;
  }

  async getAllRounds() {
    const list = await this.prisma.round.findMany({
      include: {
        challenges: {
          select: {
            id: true,
            title: true,
            points: true,
            order: true,
            isActive: true,
            maxAttempts: true,
            hintPenalty: true,
            difficulty: true,
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    return list.map((round) => {
      const uniqueCh: typeof round.challenges = [];
      const seen = new Set<number>();
      for (const c of round.challenges) {
        if (!seen.has(c.order)) {
          seen.add(c.order);
          uniqueCh.push(c);
        }
      }
      return { ...round, challenges: uniqueCh };
    });
  }

  async getRound(roundId: string) {
    const round = await this.prisma.round.findUnique({
      where: { id: roundId },
      include: {
        challenges: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            description: true,
            storyContext: true,
            characterMessage: true,
            points: true,
            maxAttempts: true,
            order: true,
            hints: true,
            hintPenalty: true,
            isActive: true,
            difficulty: true,
            createdAt: true,
            updatedAt: true,
            // flagHash / teamFlagTemplate deliberately excluded — this is
            // reachable by any authenticated participant, not just admins.
          },
        },
      },
    });

    if (!round) {
      throw new NotFoundException('Round not found');
    }

    return round;
  }
}
