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

  // Calculate team-specific flag for challenges 1.3 and 2.3
  private calculateTeamSpecificFlag(
    team: { name: string; member2Name?: string | null },
    absoluteLevel: number,
  ): string {
    const teamSize = team.member2Name ? 2 : 1;
    if (absoluteLevel === 3) {
      const input = `${team.name}|${teamSize}|1|THEEXTRACTION`;
      const hash = crypto.createHash('md5').update(input).digest('hex');
      return `ctf{${hash.substring(0, 8)}}`;
    } else if (absoluteLevel === 6) {
      // Level 2.3: SHA256(teamName+5+THEEXTRACTION)
      const input = `${team.name}5THEEXTRACTION`;
      const hash = crypto.createHash('sha256').update(input).digest('hex');
      return `ctf{${hash.substring(0, 8)}}`;
    }
    return '';
  }

  private getAbsoluteLevel(challenge: { round: { order: number }; order: number }) {
    return (challenge.round.order - 1) * 3 + challenge.order;
  }

  private getAcceptedFlagsForLevel(team: { name: string; member2Name?: string | null }, absoluteLevel: number): string[] {
    const staticFlags: Record<number, string[]> = {
      1: ['ctf{v33r4_n0d3_x92_s3rv3r}'],
      2: ['ctf{k3rn3l_p4th_v4ult91}'],
      4: ['ctf{shadow99_valkyrie_crimson7}'],
      5: ['ctf{minister_staged_treason_88x}'],
      7: ['ctf{k1llsw17ch_0v3rr1d3_p4ck37}'],
      8: ['ctf{d3fus3_l0g1c_b0mb_s41f99}'],
      9: ['ctf{master_a1b2c3_vault}'],
    };

    if (absoluteLevel === 3 || absoluteLevel === 6) {
      return [this.calculateTeamSpecificFlag(team, absoluteLevel).toLowerCase()];
    }

    return staticFlags[absoluteLevel] || [];
  }

  private getDefaultHintsForLevel(absoluteLevel: number): string[] {
    const hints: Record<number, string[]> = {
      1: [
        'The transmission payload is armored in standard transport encoding, but decodes into non-printable binary telemetry rather than plain text.',
        'Standard flag headers always begin with known characters. Compare the first few raw bytes against the expected protocol header to recover the single-byte masking key.',
      ],
      2: [
        'The three pieces originate from separate comms relays: an ancient computer base, a symmetric classical alphabet inversion, and a reversed byte capture.',
        'Resolve Fragment A using base-8 byte values, apply standard Atbash substitution to alphabetical characters in Fragment B, and invert the byte order of the final hex stream before decoding.',
      ],
      3: [
        'The vault lock combines team registration telemetry with mission parameters using a strict pipe-delimited schema.',
        'Construct the lock seed using your exact team name, operational headcount (1 or 2), round index 1, and mission codename separated by pipes. Digest with MD5 and extract the first 8 characters into standard flag format.',
      ],
      4: [
        'Identify each digest family by length and analyze their bit footprints before choosing dictionary recovery tactics.',
        'The three artifacts span 128-bit, 160-bit, and 256-bit cryptographic digest standards. Recover the operational passwords using standard CTF wordlists and join them with underscores.',
      ],
      5: [
        'The artifact is wrapped in byte hex format; stripping the outer representation exposes a modern standard web authentication structure.',
        'Extract the payload segment from the three-part token and inspect the operational claims for encoded operational intelligence. Decode the evidence field to reveal the treason string.',
      ],
      6: [
        'This pattern lock binds your team\'s specific callsign directly to mission constants with zero delimiter padding.',
        'Concatenate your exact team designation, the stage constant 5, and the operation codename THEEXTRACTION. Compute a 256-bit cryptographic digest and extract the leading 8 lowercase hex characters.',
      ],
      7: [
        'The shards are segregated by encoding protocols: raw digital bits, byte hex stream, transport radix-64, and classic alphabetic rotation.',
        'Translate each shard independently into ASCII: parse 8-bit binary, decode raw hex bytes, decode base64, and rotate the final alphabetic cipher by 13 positions before joining 1 through 4.',
      ],
      8: [
        'The defusal payload is wrapped across multiple conversion barriers, terminating in a single-byte masked binary stream.',
        'Strip the hexadecimal representation to reach the transport encoding, decode into raw bytes, and perform a known-plaintext XOR analysis against the standard flag prefix.',
      ],
      9: [
        'Access the designated interactive terminal and trace the multi-stage cryptographic authority chain in real time.',
        'Resolve each authentication layer in the terminal interface sequentially: decode the outer packet to extract the token claim, recover the vault coordinates, and derive the 6-character unlock code.',
      ],
    };

    return hints[absoluteLevel] || [];
  }

  private getHintsForChallenge(
    challenge: { hints: string | null; difficulty: string; round: { order: number }; order: number },
  ): string[] {
    const absoluteLevel = this.getAbsoluteLevel(challenge);
    const dbHints = (challenge.hints || '')
      .split(this.HINT_TIER_SEPARATOR)
      .map((hint) => hint.trim())
      .filter(Boolean);

    if (dbHints.length > 0) {
      return dbHints;
    }

    return this.getDefaultHintsForLevel(absoluteLevel);
  }

  private getHintPenaltyForUse(
    challenge: { difficulty: string; hintPenalty: number | null; round: { order: number } },
    useIndex: number,
  ): number {
    if (challenge.difficulty === 'hard') {
      const roundPenalties: Record<number, number[]> = {
        1: [40, 80],
        2: [80, 120],
        3: [120, 180],
      };
      const penalties = roundPenalties[challenge.round.order] || [80, 120];
      const idx = Math.max(0, Math.min(useIndex - 1, penalties.length - 1));
      return penalties[idx];
    }

    return Math.max(challenge.hintPenalty || 0, 0);
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
    const acceptedFlags = this.getAcceptedFlagsForLevel(team, absoluteLevel);

    let isCorrect = false;
    if (acceptedFlags.length > 0) {
      isCorrect = acceptedFlags.includes(normalizedFlag);
    } else {
      isCorrect = await bcrypt.compare(normalizedFlag, challenge.flagHash);
    }

    if (isCorrect && absoluteLevel === 9) {
      await this.prisma.storyState.upsert({
        where: { id: 'singleton' },
        create: {
          id: 'singleton',
          storyStarted: true,
          storyEnded: false,
        },
        update: {},
      });

      const winnerClaim = await this.prisma.storyState.updateMany({
        where: {
          id: 'singleton',
          round3Winner: null,
        },
        data: {
          storyEnded: true,
          round3Winner: team.id,
          winnerTeamName: team.name,
          winTimestamp: new Date(),
          finalOutcome: 'CITY_SAVED',
        },
      });

      if (winnerClaim.count === 0) {
        const state = await this.prisma.storyState.findUnique({
          where: { id: 'singleton' },
          select: { winnerTeamName: true },
        });

        throw new ForbiddenException(
          `Final vault already solved by ${state?.winnerTeamName || 'another team'}. The kill switch is already disabled.`,
        );
      }
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
    const existingScore = await this.prisma.score.findUnique({ where: { teamId: team.id } });

    if (!existingScore) {
      await this.prisma.score.create({
        data: {
          teamId: team.id,
          totalPoints: 0,
        },
      });
    }

    const currentPoints = existingScore?.totalPoints ?? 0;
    const newTotalPoints = currentPoints - penalty;
    const penaltyApplied = penalty;

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
        storyMessage: `${team.name} unlocked mission intel ${nextHintIndex}/${hintTiers.length} for ${challenge.title}`,
        points: -penaltyApplied,
      },
    });

    const unlockedHints = hintTiers.slice(0, nextHintIndex);

    return {
      success: true,
      alreadyUsed: false,
      hint: unlockedHints[unlockedHints.length - 1],
      unlockedHints,
      hintIndex: nextHintIndex,
      totalHints: hintTiers.length,
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
      currentRound: challengeOrder < 3 ? 1 : challengeOrder < 6 ? 2 : 3,
    };

    if (challengeOrder >= 3) updates.round1Completed = true;
    if (challengeOrder >= 6) updates.round2Completed = true;
    if (challengeOrder === 9) {
      updates.round3Completed = true;
      updates.storyEnding = 'SUCCESS';
      updates.round3Winner = true;
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
      6: `${teamName} unlocked the pattern lock - The Extraction revealed`,
      7: `${teamName} decoded the payload fragments - Attack mechanism understood`,
      8: `${teamName} defused the logic bomb - Mall siege ended`,
      9: `🎉 ${teamName} CRACKED THE MASTER VAULT! THE HOSTAGE CRISIS TERMINATED! 🎉`,
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

