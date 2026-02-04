import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { ChallengeLevel } from '@prisma/client';

@Injectable()
export class ChallengeValidatorService {
  constructor(private prisma: PrismaService) {}

  // Validate challenge answer
  async validateAnswer(
    teamId: string,
    challengeLevel: ChallengeLevel,
    answer: string,
  ): Promise<{
    success: boolean;
    message: string;
    points?: number;
    nextLevel?: ChallengeLevel;
  }> {
    try {
      // Get team and challenge
      const team = await this.prisma.team.findUnique({
        where: { id: teamId },
        include: {
          submissions: {
            where: { challengeId: { not: undefined } },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!team) {
        return { success: false, message: 'Team not found' };
      }

      // Check if team is on the correct challenge
      if (team.currentChallenge !== challengeLevel) {
        return {
          success: false,
          message: 'You must complete challenges in order',
        };
      }

      // Get challenge
      const challenge = await this.prisma.challenge.findUnique({
        where: { level: challengeLevel },
      });

      if (!challenge) {
        return { success: false, message: 'Challenge not found' };
      }

      // Check if already solved
      const alreadySolved = await this.prisma.submission.findFirst({
        where: {
          teamId,
          challengeId: challenge.id,
          isCorrect: true,
        },
      });

      if (alreadySolved) {
        return {
          success: false,
          message: 'Challenge already completed',
        };
      }

      // Count attempts for this challenge
      const attempts = await this.prisma.submission.count({
        where: {
          teamId,
          challengeId: challenge.id,
        },
      });

      if (attempts >= challenge.maxAttempts) {
        return {
          success: false,
          message: `Maximum attempts (${challenge.maxAttempts}) exceeded`,
        };
      }

      // Special validation for Level 2.3 (team-specific hash)
      let isCorrect = false;
      if (challengeLevel === ChallengeLevel.LEVEL_2_3) {
        isCorrect = await this.validateTeamSpecificChallenge(team.name, answer);
      } else {
        // Standard validation
        isCorrect = await bcrypt.compare(answer, challenge.answerHash);
      }

      // Calculate time taken
      const timeTaken = Math.floor(
        (Date.now() - team.registrationTime.getTime()) / 1000,
      );

      // Create submission record
      const submission = await this.prisma.submission.create({
        data: {
          teamId,
          challengeId: challenge.id,
          submittedAnswer: answer,
          isCorrect,
          pointsAwarded: isCorrect ? challenge.points : 0,
          attemptNumber: attempts + 1,
          timeTaken,
        },
      });

      if (!isCorrect) {
        return {
          success: false,
          message: `Incorrect answer. ${challenge.maxAttempts - attempts - 1} attempts remaining.`,
        };
      }

      // Calculate next level
      const nextLevel = this.getNextLevel(challengeLevel);

      // Update team progress
      await this.prisma.team.update({
        where: { id: teamId },
        data: {
          currentChallenge: nextLevel,
          totalPoints: team.totalPoints + challenge.points,
          timeElapsed: timeTaken,
        },
      });

      // Check if this is the final challenge
      if (challengeLevel === ChallengeLevel.LEVEL_3_3) {
        // Check if first team to complete
        const completedTeams = await this.prisma.submission.count({
          where: {
            challengeId: challenge.id,
            isCorrect: true,
          },
        });

        const bonusPoints = completedTeams === 1 ? challenge.points : 0; // Double points for first team

        if (bonusPoints > 0) {
          await this.prisma.team.update({
            where: { id: teamId },
            data: {
              totalPoints: team.totalPoints + challenge.points + bonusPoints,
            },
          });
        }

        return {
          success: true,
          message:
            completedTeams === 1
              ? '🎉 CONGRATULATIONS! You are the FIRST team to save Coimbatore! Operation BLACKOUT ABORTED! Double points awarded!'
              : '✅ Challenge completed! Operation BLACKOUT stopped!',
          points: challenge.points + bonusPoints,
        };
      }

      return {
        success: true,
        message: '✅ Correct! Moving to next challenge...',
        points: challenge.points,
        nextLevel,
      };
    } catch (error) {
      console.error('Challenge Validation Error:', error);
      return {
        success: false,
        message: 'Validation failed',
      };
    }
  }

  // Validate team-specific challenge (Level 2.3)
  private async validateTeamSpecificChallenge(
    teamName: string,
    answer: string,
  ): Promise<boolean> {
    // Expected format: HTB{first_8_chars_of_sha256}
    const regex = /^HTB\{([a-f0-9]{8})\}$/i;
    const match = answer.match(regex);

    if (!match) {
      return false;
    }

    const submittedHash = match[1].toLowerCase();

    // Calculate expected hash
    const input = `${teamName}25CIPHER2026`; // Round 2, 5 challenges solved
    const expectedHash = crypto
      .createHash('sha256')
      .update(input)
      .digest('hex')
      .substring(0, 8);

    return submittedHash === expectedHash;
  }

  // Get next challenge level
  private getNextLevel(current: ChallengeLevel): ChallengeLevel | null {
    const levels = [
      ChallengeLevel.LEVEL_1_1,
      ChallengeLevel.LEVEL_1_2,
      ChallengeLevel.LEVEL_1_3,
      ChallengeLevel.LEVEL_2_1,
      ChallengeLevel.LEVEL_2_2,
      ChallengeLevel.LEVEL_2_3,
      ChallengeLevel.LEVEL_3_1,
      ChallengeLevel.LEVEL_3_2,
      ChallengeLevel.LEVEL_3_3,
    ];

    const currentIndex = levels.indexOf(current);
    return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
  }

  // Get hint (with penalty)
  async getHint(
    teamId: string,
    challengeLevel: ChallengeLevel,
  ): Promise<{ success: boolean; hint?: string; penalty?: number }> {
    try {
      const team = await this.prisma.team.findUnique({
        where: { id: teamId },
      });

      if (!team) {
        return { success: false };
      }

      const challenge = await this.prisma.challenge.findUnique({
        where: { level: challengeLevel },
      });

      if (!challenge || !challenge.hintText) {
        return { success: false };
      }

      // Check if hint already used for this challenge
      const hintUsed = await this.prisma.submission.findFirst({
        where: {
          teamId,
          challengeId: challenge.id,
          usedHint: true,
        },
      });

      if (hintUsed) {
        return {
          success: true,
          hint: challenge.hintText,
          penalty: 0, // Already penalized
        };
      }

      // Deduct points
      await this.prisma.team.update({
        where: { id: teamId },
        data: {
          totalPoints: Math.max(0, team.totalPoints - challenge.hintPenalty),
          hintsUsed: team.hintsUsed + 1,
        },
      });

      // Mark hint as used
      await this.prisma.submission.create({
        data: {
          teamId,
          challengeId: challenge.id,
          submittedAnswer: '__HINT_REQUEST__',
          isCorrect: false,
          pointsAwarded: -challenge.hintPenalty,
          attemptNumber: 0,
          timeTaken: 0,
          usedHint: true,
        },
      });

      return {
        success: true,
        hint: challenge.hintText,
        penalty: challenge.hintPenalty,
      };
    } catch (error) {
      console.error('Get Hint Error:', error);
      return { success: false };
    }
  }
}
