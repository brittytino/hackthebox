import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class ChallengesService {
  constructor(private prisma: PrismaService) {}

  // Calculate team-specific flag for challenges 1.3 and 2.3
  private calculateTeamSpecificFlag(
    teamName: string,
    challengeOrder: number,
  ): string {
    if (challengeOrder === 3) {
      // Level 1.3: MD5(teamName|2|1|CIPHER2026)
      const input = `${teamName}|2|1|CIPHER2026`;
      const hash = crypto.createHash('md5').update(input).digest('hex');
      return `ctf{${hash.substring(0, 8)}}`;
    } else if (challengeOrder === 6) {
      // Level 2.3: SHA256(teamName+5+CIPHER2026)
      const input = `${teamName}5CIPHER2026`;
      const hash = crypto.createHash('sha256').update(input).digest('hex');
      return `ctf{${hash.substring(0, 8)}}`;
    }
    return '';
  }

  // Get current challenge for a team (based on linear progression)
  async getCurrentChallenge(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        team: {
          include: {
            storyProgress: true,
            scores: true,
          },
        },
      },
    });

    if (!user || !user.team) {
      throw new NotFoundException('Team not found');
    }

    const team = user.team;
    const currentLevel = team.currentLevel;

    // Find the challenge for the current level
    const challenge = await this.prisma.challenge.findFirst({
      where: {
        order: currentLevel,
        isActive: true,
      },
      include: {
        round: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
            order: true,
          },
        },
      },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    // Get submission count for this team and challenge
    const submissions = await this.prisma.submission.findMany({
      where: {
        teamId: team.id,
        challengeId: challenge.id,
      },
    });

    const attemptsUsed = submissions.length;
    const isSolved = submissions.some((s) => s.isCorrect);

    return {
      challenge: {
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        storyContext: challenge.storyContext,
        characterMessage: challenge.characterMessage,
        points: challenge.points,
        difficulty: challenge.difficulty,
        order: challenge.order,
        hints: challenge.hints,
        hintPenalty: challenge.hintPenalty,
        maxAttempts: challenge.maxAttempts,
        round: challenge.round,
      },
      progress: {
        currentLevel,
        totalLevels: 9,
        attemptsUsed,
        maxAttempts: challenge.maxAttempts,
        isSolved,
      },
      team: {
        name: team.name,
        currentPoints: team.scores[0]?.totalPoints || 0,
      },
    };
  }

  // Submit flag for a challenge
  async submitFlag(userId: string, challengeId: string, flag: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { team: true },
    });

    if (!user || !user.team) {
      throw new NotFoundException('Team not found');
    }

    const team = user.team;

    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
      include: { round: true },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    // Check if this is the current challenge for the team
    if (challenge.order !== team.currentLevel) {
      throw new ForbiddenException('You must solve challenges in order');
    }

    // Check if already solved
    const existingSolved = await this.prisma.submission.findFirst({
      where: {
        teamId: team.id,
        challengeId: challenge.id,
        isCorrect: true,
      },
    });

    if (existingSolved) {
      throw new BadRequestException('Challenge already solved');
    }

    // Check attempt limit
    const submissions = await this.prisma.submission.findMany({
      where: {
        teamId: team.id,
        challengeId: challenge.id,
      },
    });

    if (
      challenge.maxAttempts &&
      submissions.length >= challenge.maxAttempts
    ) {
      throw new BadRequestException('Maximum attempts exceeded');
    }

    // Verify flag
    let isCorrect = false;

    // Check if this is a team-specific challenge
    const isTeamSpecific = await bcrypt.compare(
      '__TEAM_SPECIFIC__',
      challenge.flagHash,
    );

    if (isTeamSpecific) {
      // Calculate the team's specific flag
      const expectedFlag = this.calculateTeamSpecificFlag(
        team.name,
        challenge.order,
      );
      isCorrect = flag.toLowerCase() === expectedFlag.toLowerCase();
    } else {
      // Normal flag verification
      isCorrect = await bcrypt.compare(flag.toLowerCase(), challenge.flagHash);
    }

    // Create submission
    const submission = await this.prisma.submission.create({
      data: {
        userId: user.id,
        teamId: team.id,
        challengeId: challenge.id,
        submittedFlag: flag,
        isCorrect,
        points: isCorrect ? challenge.points : 0,
        attempts: submissions.length + 1,
      },
    });

    if (isCorrect) {
      // Update team score
      await this.prisma.score.upsert({
        where: { teamId: team.id },
        create: {
          teamId: team.id,
          totalPoints: challenge.points,
          lastSolved: new Date(),
        },
        update: {
          totalPoints: {
            increment: challenge.points,
          },
          lastSolved: new Date(),
        },
      });

      // Move team to next level
      const nextLevel = team.currentLevel + 1;
      await this.prisma.team.update({
        where: { id: team.id },
        data: {
          currentLevel: nextLevel,
        },
      });

      // Update story progress
      await this.updateStoryProgress(team.id, challenge.order);

      // Create activity log
      await this.prisma.activity.create({
        data: {
          teamId: team.id,
          teamName: team.name,
          challengeId: challenge.id,
          challengeTitle: challenge.title,
          roundNumber: challenge.round.order,
          levelNumber: challenge.order,
          actionType: 'SOLVED',
          storyMessage: this.getStoryMessage(team.name, challenge.order),
          points: challenge.points,
        },
      });

      return {
        success: true,
        isCorrect: true,
        message: 'Correct! Challenge solved!',
        points: challenge.points,
        nextLevel: nextLevel,
        hasMoreChallenges: nextLevel <= 9,
      };
    } else {
      return {
        success: false,
        isCorrect: false,
        message: 'Incorrect flag. Try again.',
        attemptsRemaining: challenge.maxAttempts
          ? challenge.maxAttempts - submissions.length - 1
          : null,
      };
    }
  }

  // Get all challenges (admin only or for overview)
  async getAllChallenges() {
    return this.prisma.challenge.findMany({
      where: {
        isActive: true,
      },
      include: {
        round: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
            order: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  // Update story progress based on challenge completion
  private async updateStoryProgress(teamId: string, challengeOrder: number) {
    const progress = await this.prisma.storyProgress.findUnique({
      where: { teamId },
    });

    if (!progress) return;

    const updates: any = {
      currentRound: Math.ceil(challengeOrder / 3),
    };

    if (challengeOrder === 3) updates.round1Completed = true;
    if (challengeOrder === 6) updates.round2Completed = true;
    if (challengeOrder === 9) {
      updates.round3Completed = true;
      updates.round3Winner = true;
      updates.storyEnding = 'SUCCESS';
    }

    await this.prisma.storyProgress.update({
      where: { teamId },
      data: updates,
    });
  }

  // Get story message for activity feed
  private getStoryMessage(teamName: string, level: number): string {
    const messages = {
      1: `${teamName} decoded the intercepted transmission - Command center located`,
      2: `${teamName} unlocked Server Room ER-42 with fragmented access codes`,
      3: `${teamName} cracked the time-locked vault - Attack plans recovered`,
      4: `${teamName} broke through the corrupted hash trail - Home Minister exposed!`,
      5: `${teamName} infiltrated admin panel via JWT token - Evidence collected`,
      6: `${teamName} unlocked the pattern lock - Operation BLACKOUT revealed`,
      7: `${teamName} decoded the payload fragments - Attack mechanism understood`,
      8: `${teamName} defused the logic bomb - Mall siege ended`,
      9: `🎉 ${teamName} CRACKED THE MASTER VAULT! OPERATION BLACKOUT TERMINATED! 🎉`,
    };

    return messages[level] || `${teamName} completed level ${level}`;
  }

  async getLeaderboard(limit = 10) {
    const scores = await this.prisma.score.findMany({
      take: limit,
      orderBy: [{ totalPoints: 'desc' }, { lastSolved: 'asc' }],
      include: {
        team: {
          select: {
            id: true,
            name: true,
            member1Name: true,
            member2Name: true,
            currentLevel: true,
          },
        },
      },
    });

    return scores.map((score, index) => ({
      rank: index + 1,
      teamId: score.team.id,
      teamName: score.team.name,
      points: score.totalPoints,
      currentLevel: score.team.currentLevel,
      lastSolved: score.lastSolved,
    }));
  }

  async getRecentActivity(limit = 20) {
    return this.prisma.activity.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        teamName: true,
        challengeTitle: true,
        roundNumber: true,
        levelNumber: true,
        actionType: true,
        storyMessage: true,
        points: true,
        createdAt: true,
      },
    });
  }
}

