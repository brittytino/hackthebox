import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, RoundStatus, RoundType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class ChallengesService {
  constructor(private prisma: PrismaService) {}

  private readonly HINT_TIER_SEPARATOR = '||';

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
    return score?.totalPoints ?? 0;
  }

  // Computes a team-bound flag from an admin-configured template like
  // "md5:{team}|{size}|1|THEEXTRACTION" or "sha256:{team}5THEEXTRACTION".
  // Nothing about which challenges are team-specific, or what their formula
  // is, lives in application code — it's entirely a DB field admins set.
  private computeTeamFlag(
    template: string,
    team: { name: string; member2Name?: string | null },
  ): string | null {
    const match = template.match(/^(md5|sha1|sha256):(.+)$/);
    if (!match) return null;

    const [, algo, pattern] = match;
    const teamSize = team.member2Name ? 2 : 1;
    const seed = pattern.replace(/\{team\}/g, team.name).replace(/\{size\}/g, String(teamSize));

    const hash = crypto.createHash(algo).update(seed).digest('hex');
    return `ctf{${hash.substring(0, 8)}}`;
  }

  private async isFlagCorrect(
    challenge: { flagHash: string; teamFlagTemplate: string | null },
    team: { name: string; member2Name?: string | null },
    normalizedFlag: string,
  ): Promise<boolean> {
    if (challenge.teamFlagTemplate) {
      const expected = this.computeTeamFlag(challenge.teamFlagTemplate, team);
      return expected !== null && normalizedFlag === expected.toLowerCase();
    }

    return bcrypt.compare(normalizedFlag, challenge.flagHash);
  }

  private getHintsForChallenge(challenge: { hints: string | null }): string[] {
    return (challenge.hints || '')
      .split(this.HINT_TIER_SEPARATOR)
      .map((hint) => hint.trim())
      .filter(Boolean);
  }

  // Each hint tier costs the challenge's configured hintPenalty, scaled by
  // which tier is being unlocked (1st hint = 1x, 2nd = 2x, ...). Fully
  // DB-driven — an admin editing hintPenalty in the panel changes this
  // immediately, for every challenge and every difficulty.
  private getHintPenaltyForUse(challenge: { hintPenalty: number | null }, useIndex: number): number {
    const base = Math.max(challenge.hintPenalty || 0, 0);
    return base * Math.max(useIndex, 1);
  }

  private isFinalChallengeOfRound(
    sequence: Array<{ roundId: string; order: number }>,
    challenge: { roundId: string; order: number },
  ): boolean {
    const roundChallenges = sequence.filter((c) => c.roundId === challenge.roundId);
    const maxOrder = Math.max(...roundChallenges.map((c) => c.order));
    return challenge.order === maxOrder;
  }

  private getStoryMessage(teamName: string, challenge: { title: string }, isLastOverall: boolean): string {
    if (isLastOverall) {
      return `🎉 ${teamName} CRACKED THE FINAL CHALLENGE — "${challenge.title}"! THE HOSTAGE CRISIS TERMINATED! 🎉`;
    }
    return `${teamName} solved "${challenge.title}"`;
  }

  private async updateStoryProgress(
    tx: Prisma.TransactionClient,
    teamId: string,
    solvedRoundOrder: number,
    isLastOverall: boolean,
  ) {
    const progress = await tx.storyProgress.findUnique({ where: { teamId } });
    if (!progress) return;

    const updates: Prisma.StoryProgressUpdateInput = { currentRound: solvedRoundOrder };

    if (solvedRoundOrder > 1) updates.round1Completed = true;
    if (solvedRoundOrder > 2) updates.round2Completed = true;
    if (isLastOverall) {
      updates.round3Completed = true;
      updates.storyEnding = 'SUCCESS';
      updates.round3Winner = true;
    }

    await tx.storyProgress.update({ where: { teamId }, data: updates });
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
      const solvedCount = await this.prisma.submission.count({
        where: { teamId: team.id, isCorrect: true },
      });

      return {
        challenge: null,
        progress: {
          currentLevel,
          totalLevels,
          attemptsUsed: 0,
          maxAttempts: null,
          isSolved: true,
          completedAll: true,
          challengesSolved: solvedCount,
        },
        team: {
          id: team.id,
          name: team.name,
          currentPoints: team.scores[0]?.totalPoints || 0,
        },
      };
    }

    if (challenge.round.status !== RoundStatus.ACTIVE) {
      return {
        challenge: null,
        waitingForRound: { name: challenge.round.name, order: challenge.round.order },
        progress: { currentLevel, totalLevels, attemptsUsed: 0, maxAttempts: null, isSolved: false },
        team: {
          id: team.id,
          name: team.name,
          currentPoints: team.scores[0]?.totalPoints ?? 0,
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
        hints: this.getHintsForChallenge(challenge)[0] || '',
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
        currentPoints: team.scores[0]?.totalPoints ?? 0,
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

    if (team.disqualified) {
      throw new ForbiddenException('Your team has been disqualified from the competition');
    }

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

    if (challenge.round.status !== RoundStatus.ACTIVE) {
      throw new ForbiddenException('This round is not active yet');
    }

    // Check if already solved (authoritative source: ChallengeSolve, not Submission)
    const existingSolve = await this.prisma.challengeSolve.findUnique({
      where: { teamId_challengeId: { teamId: team.id, challengeId: challenge.id } },
    });

    if (existingSolve) {
      throw new BadRequestException('Challenge already solved');
    }

    // Check attempt limit (team-scoped, matches the team-based progression model)
    const priorAttempts = await this.prisma.submission.count({
      where: { teamId: team.id, challengeId: challenge.id },
    });

    if (challenge.maxAttempts && priorAttempts >= challenge.maxAttempts) {
      throw new BadRequestException(`Maximum attempts (${challenge.maxAttempts}) exceeded`);
    }

    const normalizedFlag = flag.trim().toLowerCase();
    const isCorrect = await this.isFlagCorrect(challenge, team, normalizedFlag);

    if (!isCorrect) {
      await this.prisma.submission.create({
        data: {
          userId: user.id,
          teamId: team.id,
          challengeId: challenge.id,
          submittedFlag: flag,
          isCorrect: false,
          points: 0,
          attempts: priorAttempts + 1,
        },
      });

      return {
        success: false,
        isCorrect: false,
        message: 'Incorrect flag. Try again.',
        attemptsRemaining: challenge.maxAttempts ? challenge.maxAttempts - priorAttempts - 1 : null,
      };
    }

    const isFinalOfRound = this.isFinalChallengeOfRound(sequence, challenge);
    const isCatchTheFlagFinal = challenge.round.type === RoundType.CATCH_THE_FLAG && isFinalOfRound;
    const nextLevel = team.currentLevel + 1;
    const isLastOverall = nextLevel > sequence.length;

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Atomically claim this solve for this team. If a concurrent duplicate
        // request for the same team+challenge races in, Postgres's unique
        // constraint rejects the second insert and the whole transaction
        // rolls back — the team can never be scored twice for one solve.
        await tx.challengeSolve.create({ data: { teamId: team.id, challengeId: challenge.id } });

        let awardedPoints = challenge.points;

        if (isCatchTheFlagFinal) {
          await tx.storyState.upsert({
            where: { id: 'singleton' },
            create: { id: 'singleton', storyStarted: true, storyEnded: false },
            update: {},
          });

          const winnerClaim = await tx.storyState.updateMany({
            where: { id: 'singleton', round3Winner: null },
            data: {
              storyEnded: true,
              round3Winner: team.id,
              winnerTeamName: team.name,
              winTimestamp: new Date(),
              finalOutcome: 'CITY_SAVED',
            },
          });

          if (winnerClaim.count === 0) {
            const state = await tx.storyState.findUnique({
              where: { id: 'singleton' },
              select: { winnerTeamName: true },
            });
            throw new ForbiddenException(
              `Final vault already solved by ${state?.winnerTeamName || 'another team'}. The kill switch is already disabled.`,
            );
          }

          // First-solver bonus, as promised by the challenge description.
          awardedPoints = challenge.points * 2;
        }

        await tx.submission.create({
          data: {
            userId: user.id,
            teamId: team.id,
            challengeId: challenge.id,
            submittedFlag: flag,
            isCorrect: true,
            points: awardedPoints,
            attempts: priorAttempts + 1,
          },
        });

        await tx.score.upsert({
          where: { teamId: team.id },
          create: { teamId: team.id, totalPoints: awardedPoints, lastSolved: new Date() },
          update: { totalPoints: { increment: awardedPoints }, lastSolved: new Date() },
        });

        await tx.team.update({ where: { id: team.id }, data: { currentLevel: nextLevel } });

        await this.updateStoryProgress(tx, team.id, challenge.round.order, isLastOverall);

        await tx.activity.create({
          data: {
            teamId: team.id,
            teamName: team.name,
            challengeId: challenge.id,
            challengeTitle: challenge.title,
            roundNumber: challenge.round.order,
            levelNumber: sequence.findIndex((c) => c.id === challenge.id) + 1,
            actionType: 'SOLVED',
            storyMessage: this.getStoryMessage(team.name, challenge, isLastOverall),
            points: awardedPoints,
          },
        });

        return { awardedPoints };
      });

      return {
        success: true,
        isCorrect: true,
        message: isCatchTheFlagFinal
          ? 'Correct! First-solve bonus applied — Challenge solved!'
          : 'Correct! Challenge solved!',
        points: result.awardedPoints,
        nextLevel,
        hasMoreChallenges: !isLastOverall,
        gameCompleted: isLastOverall,
      };
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException('Challenge already solved');
      }
      throw error;
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

    if (team.disqualified) {
      throw new ForbiddenException('Your team has been disqualified from the competition');
    }

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

    if (challenge.round.status !== RoundStatus.ACTIVE) {
      throw new ForbiddenException('This round is not active yet');
    }

    const hintTiers = this.getHintsForChallenge(challenge);

    if (hintTiers.length === 0) {
      throw new BadRequestException('No hint available for this challenge');
    }

    const existingHintUses = await this.prisma.activity.findMany({
      where: {
        teamId: team.id,
        challengeId: challenge.id,
        actionType: 'HINT_USED',
      },
      orderBy: { createdAt: 'asc' },
    });

    const hintsUsed = existingHintUses.length;

    if (hintsUsed >= hintTiers.length) {
      const teamPoints = await this.getTeamPoints(team.id);
      return {
        success: true,
        alreadyUsed: true,
        hint: hintTiers[Math.max(0, hintTiers.length - 1)],
        unlockedHints: hintTiers,
        hintIndex: hintTiers.length,
        totalHints: hintTiers.length,
        penaltyApplied: 0,
        teamPoints,
      };
    }

    const nextHintIndex = hintsUsed + 1;
    const penalty = this.getHintPenaltyForUse(challenge, nextHintIndex);

    const newTotalPoints = await this.prisma.$transaction(async (tx) => {
      const score = await tx.score.upsert({
        where: { teamId: team.id },
        create: { teamId: team.id, totalPoints: -penalty },
        update: { totalPoints: { decrement: penalty } },
      });

      // Never let a hint push the score below zero.
      const clampedTotal = Math.max(score.totalPoints, 0);
      if (clampedTotal !== score.totalPoints) {
        await tx.score.update({ where: { teamId: team.id }, data: { totalPoints: clampedTotal } });
      }

      await tx.activity.create({
        data: {
          teamId: team.id,
          teamName: team.name,
          challengeId: challenge.id,
          challengeTitle: challenge.title,
          roundNumber: challenge.round.order,
          levelNumber: team.currentLevel,
          actionType: 'HINT_USED',
          storyMessage: `${team.name} unlocked mission intel ${nextHintIndex}/${hintTiers.length} for ${challenge.title}`,
          points: -penalty,
        },
      });

      return clampedTotal;
    });

    const unlockedHints = hintTiers.slice(0, nextHintIndex);

    return {
      success: true,
      alreadyUsed: false,
      hint: unlockedHints[unlockedHints.length - 1],
      unlockedHints,
      hintIndex: nextHintIndex,
      totalHints: hintTiers.length,
      penaltyApplied: penalty,
      teamPoints: newTotalPoints,
    };
  }

  // Get all challenges — flagHash/teamFlagTemplate are never selected here,
  // this is reachable by any authenticated participant, not just admins.
  async getAllChallenges() {
    return this.prisma.challenge.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
        description: true,
        storyContext: true,
        characterMessage: true,
        points: true,
        maxAttempts: true,
        order: true,
        hintPenalty: true,
        isActive: true,
        difficulty: true,
        createdAt: true,
        updatedAt: true,
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

  async getLeaderboard(limit = 10) {
    const scores = await this.prisma.score.findMany({
      where: { team: { disqualified: false } },
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
            submissions: {
              where: { isCorrect: true },
              select: { challengeId: true },
            },
          },
        },
      },
    });

    return scores.map((score, index) => {
      const distinctSolves = new Set(score.team.submissions.map((s) => s.challengeId)).size;
      return {
        rank: index + 1,
        teamId: score.team.id,
        teamName: score.team.name,
        points: score.totalPoints,
        totalPoints: score.totalPoints,
        currentLevel: score.team.currentLevel,
        challengesSolved: distinctSolves,
        solvedChallenges: distinctSolves,
        lastSolved: score.lastSolved,
      };
    });
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
