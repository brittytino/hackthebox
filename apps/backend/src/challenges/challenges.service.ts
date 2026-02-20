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

  private async getChallengeSequence() {
    const challenges = await this.prisma.challenge.findMany({
      where: { isActive: true },
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
      orderBy: [
        { round: { order: 'asc' } },
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    const uniqueByStage = new Map<string, (typeof challenges)[number]>();

    for (const challenge of challenges) {
      const stageKey = `${challenge.round.order}-${challenge.order}`;
      if (!uniqueByStage.has(stageKey)) {
        uniqueByStage.set(stageKey, challenge);
      }
    }

    return Array.from(uniqueByStage.values()).sort((a, b) => {
      if (a.round.order !== b.round.order) {
        return a.round.order - b.round.order;
      }
      return a.order - b.order;
    });
  }

  private async getTeamPoints(teamId: string) {
    const score = await this.prisma.score.findUnique({ where: { teamId } });
    return score?.totalPoints || 0;
  }

  // Calculate team-specific flag for challenges 1.3 and 2.3
  private calculateTeamSpecificFlag(
    teamName: string,
    absoluteLevel: number,
  ): string {
    if (absoluteLevel === 3) {
      // Level 1.3: MD5(teamName|2|1|CIPHER2026)
      const input = `${teamName}|2|1|CIPHER2026`;
      const hash = crypto.createHash('md5').update(input).digest('hex');
      return `ctf{${hash.substring(0, 8)}}`;
    } else if (absoluteLevel === 6) {
      // Level 2.3: SHA256(teamName+5+CIPHER2026)
      const input = `${teamName}5CIPHER2026`;
      const hash = crypto.createHash('sha256').update(input).digest('hex');
      return `ctf{${hash.substring(0, 8)}}`;
    }
    return '';
  }

  private getAbsoluteLevel(challenge: { round: { order: number }; order: number }) {
    return (challenge.round.order - 1) * 3 + challenge.order;
  }

  private getAcceptedFlagsForLevel(teamName: string, absoluteLevel: number): string[] {
    const staticFlags: Record<number, string[]> = {
      1: ['ctf{server.room-er42,east-wing}'],
      2: ['ctf#accessgranted'],
      4: ['ctf{pas+pas+pas+42}'],
      5: ['ctf{rdfnc6okbay5cayzid3g1dcf}'],
      7: ['ctf{blackout.feb14.payload}'],
      8: ['ctf{defusal.killswitch.overrode}'],
      9: ['ctf{master_a1b2c3_vault}'],
    };

    if (absoluteLevel === 3 || absoluteLevel === 6) {
      return [this.calculateTeamSpecificFlag(teamName, absoluteLevel).toLowerCase()];
    }

    return staticFlags[absoluteLevel] || [];
  }

  private getDefaultHintForLevel(absoluteLevel: number): string {
    const hints: Record<number, string> = {
      1: 'Decode strictly in this order: Base64 → ROT13 → Reverse. If your output looks readable too early, you likely skipped a step.',
      2: 'Decode A, B, and C independently, then concatenate exactly as A+B+C. For Fragment C, use Caesar shift -7.',
      3: 'Use MD5(teamName|2|1|CIPHER2026), then take the first 8 lowercase hex characters and wrap as CTF{xxxxxxxx}.',
      4: 'All three hashes map to the same common password. Take first 3 letters from each result and submit as CTF{xxx+xxx+xxx+42}.',
      5: 'Hex decode first, split JWT by dots, Base64 decode payload only, extract secret, reverse it exactly, then submit.',
      6: 'Compute SHA256(teamName + "5" + "CIPHER2026"), take first 8 lowercase hex chars, then submit as CTF{xxxxxxxx}.',
      7: 'Decode each fragment independently (Binary/Hex/Base64/ROT13) and concatenate in strict order 1→2→3→4.',
      8: 'Keep the decode chain exact: Hex → Base64 → ROT13 → Binary → ASCII. The final output is directly the flag text.',
      9: 'Decode layer1 hex → Base64 → JSON token → JWT payload, then ROT13 the vault_key to get the 6-character code.',
    };

    return hints[absoluteLevel] || '';
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
    const sequence = await this.getChallengeSequence();
    const totalLevels = sequence.length;
    const challenge = sequence[currentLevel - 1];

    if (!challenge) {
      return {
        challenge: null,
        progress: {
          currentLevel,
          totalLevels,
          attemptsUsed: 0,
          maxAttempts: null,
          isSolved: true,
          completedAll: true,
        },
        team: {
          name: team.name,
          currentPoints: team.scores[0]?.totalPoints || 0,
        },
      };
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
        hints:
          this.getDefaultHintForLevel(this.getAbsoluteLevel(challenge)) ||
          challenge.hints,
        hintPenalty: challenge.hintPenalty,
        maxAttempts: challenge.maxAttempts,
        round: challenge.round,
      },
      progress: {
        currentLevel,
        totalLevels,
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

    const sequence = await this.getChallengeSequence();
    const activeChallenge = sequence[team.currentLevel - 1];

    if (!activeChallenge) {
      throw new BadRequestException('All challenges already completed');
    }

    if (challengeId !== activeChallenge.id) {
      throw new ForbiddenException('You must solve the current active challenge');
    }

    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
      include: { round: true },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    const absoluteLevel = this.getAbsoluteLevel(challenge);

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
    const normalizedFlag = flag.trim().toLowerCase();
    const acceptedFlags = this.getAcceptedFlagsForLevel(team.name, absoluteLevel);

    let isCorrect = false;
    if (acceptedFlags.length > 0) {
      isCorrect = acceptedFlags.includes(normalizedFlag);
    } else {
      isCorrect = await bcrypt.compare(normalizedFlag, challenge.flagHash);
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
      await this.updateStoryProgress(team.id, absoluteLevel);

      // Create activity log
      await this.prisma.activity.create({
        data: {
          teamId: team.id,
          teamName: team.name,
          challengeId: challenge.id,
          challengeTitle: challenge.title,
          roundNumber: challenge.round.order,
          levelNumber: absoluteLevel,
          actionType: 'SOLVED',
          storyMessage: this.getStoryMessage(team.name, absoluteLevel),
          points: challenge.points,
        },
      });

      return {
        success: true,
        isCorrect: true,
        message: 'Correct! Challenge solved!',
        points: challenge.points,
        nextLevel: nextLevel,
        hasMoreChallenges: nextLevel <= sequence.length,
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

  async useHint(userId: string, challengeId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { team: true },
    });

    if (!user || !user.team) {
      throw new NotFoundException('Team not found');
    }

    const team = user.team;
    const sequence = await this.getChallengeSequence();
    const activeChallenge = sequence[team.currentLevel - 1];

    if (!activeChallenge) {
      throw new BadRequestException('All challenges already completed');
    }

    if (challengeId !== activeChallenge.id) {
      throw new ForbiddenException('Hint can only be used for current active challenge');
    }

    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
      include: { round: true },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    const absoluteLevel = this.getAbsoluteLevel(challenge);
    const hintText =
      this.getDefaultHintForLevel(absoluteLevel) || challenge.hints || '';

    if (!hintText) {
      throw new BadRequestException('No hint available for this challenge');
    }

    const existingHintUse = await this.prisma.activity.findFirst({
      where: {
        teamId: team.id,
        challengeId: challenge.id,
        actionType: 'HINT_USED',
      },
    });

    if (existingHintUse) {
      const teamPoints = await this.getTeamPoints(team.id);
      return {
        success: true,
        alreadyUsed: true,
        hint: hintText,
        penaltyApplied: 0,
        teamPoints,
      };
    }

    const penalty = Math.max(challenge.hintPenalty || 0, 0);
    const existingScore = await this.prisma.score.findUnique({ where: { teamId: team.id } });

    if (!existingScore) {
      await this.prisma.score.create({
        data: {
          teamId: team.id,
          totalPoints: 0,
        },
      });
    }

    const currentPoints = existingScore?.totalPoints || 0;
    const newTotalPoints = Math.max(currentPoints - penalty, 0);
    const penaltyApplied = currentPoints - newTotalPoints;

    await this.prisma.score.update({
      where: { teamId: team.id },
      data: {
        totalPoints: newTotalPoints,
      },
    });

    await this.prisma.activity.create({
      data: {
        teamId: team.id,
        teamName: team.name,
        challengeId: challenge.id,
        challengeTitle: challenge.title,
        roundNumber: challenge.round.order,
        levelNumber: team.currentLevel,
        actionType: 'HINT_USED',
        storyMessage: `${team.name} used mission intel for ${challenge.title}`,
        points: -penaltyApplied,
      },
    });

    return {
      success: true,
      alreadyUsed: false,
      hint: hintText,
      penaltyApplied,
      teamPoints: newTotalPoints,
    };
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
      orderBy: [
        { round: { order: 'asc' } },
        { order: 'asc' },
      ],
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

