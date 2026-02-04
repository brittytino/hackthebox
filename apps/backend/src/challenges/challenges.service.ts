import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChallengeLevel } from '@prisma/client';

@Injectable()
export class ChallengesService {
  constructor(private prisma: PrismaService) {}

  async getChallenge(level: ChallengeLevel) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { level },
      select: {
        id: true,
        level: true,
        levelNumber: true,
        title: true,
        narrative: true,
        challengeType: true,
        difficulty: true,
        points: true,
        maxAttempts: true,
        hintPenalty: true,
        round: {
          select: {
            roundNumber: true,
            title: true,
            theme: true,
            storyArc: true,
          },
        },
      },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    return challenge;
  }

  async getChallengesByRound(roundNumber: number) {
    const round = await this.prisma.round.findUnique({
      where: { roundNumber },
      include: {
        challenges: {
          where: { isActive: true },
          orderBy: { levelNumber: 'asc' },
          select: {
            id: true,
            level: true,
            levelNumber: true,
            title: true,
            challengeType: true,
            difficulty: true,
            points: true,
            maxAttempts: true,
          },
        },
      },
    });

    if (!round) {
      throw new NotFoundException('Round not found');
    }

    return {
      round: {
        roundNumber: round.roundNumber,
        title: round.title,
        theme: round.theme,
        storyArc: round.storyArc,
      },
      challenges: round.challenges,
    };
  }

  async getAllChallenges() {
    const rounds = await this.prisma.round.findMany({
      include: {
        challenges: {
          where: { isActive: true },
          orderBy: { levelNumber: 'asc' },
          select: {
            id: true,
            level: true,
            levelNumber: true,
            title: true,
            challengeType: true,
            difficulty: true,
            points: true,
          },
        },
      },
      orderBy: { roundNumber: 'asc' },
    });

    return rounds.map((round) => ({
      roundNumber: round.roundNumber,
      title: round.title,
      theme: round.theme,
      challenges: round.challenges,
    }));
  }
}
