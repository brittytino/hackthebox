import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

interface Round1Artifacts {
  systemTarget: string;
  darkweaveCode: string;
  credentialHash: string;
}

interface Round2Artifacts {
  masterKey: string;
  backdoorLocation: string;
}

@Injectable()
export class StoryService {
  private readonly ROUND1_SOLUTIONS = {
    systemTarget: 'UKKADAM_WATER_TREATMENT',
    darkweaveCode: 'DARKWEAVE_2026_COIMB',
    credentialHash: 'a1b2c3d4e5f6',
  };

  private readonly ROUND2_SOLUTIONS = {
    masterKey: 'SCCC_MASTER_KEY_7F8E9D0A',
    backdoorLocation: 'SCCC_VPN_NODE_47',
  };

  private readonly ROUND3_FLAG = 'HTB{COIMBATORE_DARKWEAVE_DEACTIVATED_2026}';

  constructor(private prisma: PrismaService) {}

  async initializeStoryProgress(teamId: string) {
    const existing = await this.prisma.storyProgress.findUnique({
      where: { teamId },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.storyProgress.create({
      data: {
        teamId,
        currentRound: 1,
      },
    });
  }

  async getTeamProgress(teamId: string) {
    const progress = await this.prisma.storyProgress.findUnique({
      where: { teamId },
      include: {
        team: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!progress) {
      return this.initializeStoryProgress(teamId);
    }

    return {
      ...progress,
      round1Artifacts: progress.round1Artifacts ? JSON.parse(progress.round1Artifacts) : null,
      round2Artifacts: progress.round2Artifacts ? JSON.parse(progress.round2Artifacts) : null,
    };
  }

  async getAllTeamsProgress() {
    const allProgress = await this.prisma.storyProgress.findMany({
      include: {
        team: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return allProgress.map(progress => ({
      ...progress,
      round1Artifacts: progress.round1Artifacts ? JSON.parse(progress.round1Artifacts) : null,
      round2Artifacts: progress.round2Artifacts ? JSON.parse(progress.round2Artifacts) : null,
    }));
  }

  async submitRound1Solution(teamId: string, solution: Round1Artifacts) {
    const progress = await this.getTeamProgress(teamId);

    if (progress.currentRound !== 1) {
      throw new ForbiddenException('Round 1 already completed or not accessible');
    }

    // Validate solution
    const isCorrect =
      solution.systemTarget === this.ROUND1_SOLUTIONS.systemTarget &&
      solution.darkweaveCode === this.ROUND1_SOLUTIONS.darkweaveCode &&
      solution.credentialHash === this.ROUND1_SOLUTIONS.credentialHash;

    if (!isCorrect) {
      return {
        success: false,
        message: 'Decoding incomplete or incorrect. Review the intercepted messages.',
      };
    }

    // Update progress
    await this.prisma.storyProgress.update({
      where: { teamId },
      data: {
        round1Completed: true,
        currentRound: 2,
        round1Artifacts: JSON.stringify(solution),
      },
    });

    return {
      success: true,
      message: 'Round 1 completed. You have unlocked access to the compromised VPN.',
      nextRound: 2,
    };
  }

  async submitRound2Solution(teamId: string, solution: Round2Artifacts) {
    const progress = await this.getTeamProgress(teamId);

    if (!progress.round1Completed) {
      throw new ForbiddenException('You must complete Round 1 first');
    }

    if (progress.currentRound !== 2) {
      throw new ForbiddenException('Round 2 already completed or not accessible');
    }

    // Validate solution
    const isCorrect =
      solution.masterKey === this.ROUND2_SOLUTIONS.masterKey &&
      solution.backdoorLocation === this.ROUND2_SOLUTIONS.backdoorLocation;

    if (!isCorrect) {
      return {
        success: false,
        message: 'Hash cracking incomplete or token invalid. Review the VPN logs.',
      };
    }

    // Update progress
    await this.prisma.storyProgress.update({
      where: { teamId },
      data: {
        round2Completed: true,
        currentRound: 3,
        round2Artifacts: JSON.stringify(solution),
      },
    });

    return {
      success: true,
      message: 'Round 2 completed. SCCC network access granted. The countdown has begun.',
      nextRound: 3,
    };
  }

  async submitRound3Flag(teamId: string, flag: string) {
    const progress = await this.getTeamProgress(teamId);

    if (!progress.round1Completed || !progress.round2Completed) {
      throw new ForbiddenException('You must complete Rounds 1 and 2 first');
    }

    if (progress.currentRound !== 3) {
      throw new ForbiddenException('Round 3 not accessible');
    }

    // Validate flag
    const isCorrect = flag.trim() === this.ROUND3_FLAG;

    if (!isCorrect) {
      return {
        success: false,
        message: 'Invalid deactivation code. The countdown continues.',
      };
    }

    // Check if there's already a winner
    const storyState = await this.getStoryState();
    
    if (storyState.round3Winner) {
      return {
        success: false,
        message: `The kill switch has already been disabled by ${storyState.winnerTeamName}. Coimbatore is safe.`,
        alreadyWon: true,
      };
    }

    // This team is the winner!
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      select: { name: true },
    });

    if (!team) {
      return { success: false, message: 'Team not found' };
    }

    await this.prisma.$transaction([
      this.prisma.storyProgress.update({
        where: { teamId },
        data: {
          round3Completed: true,
          round3Winner: true,
          storyEnding: 'SUCCESS',
        },
      }),
      this.prisma.storyState.upsert({
        where: { id: 'singleton' },
        create: {
          id: 'singleton',
          storyStarted: true,
          storyEnded: true,
          round3Winner: teamId,
          winnerTeamName: team.name,
          winTimestamp: new Date(),
          finalOutcome: 'CITY_SAVED',
        },
        update: {
          storyEnded: true,
          round3Winner: teamId,
          winnerTeamName: team.name,
          winTimestamp: new Date(),
          finalOutcome: 'CITY_SAVED',
        },
      }),
    ]);

    return {
      success: true,
      winner: true,
      message: `🎉 MISSION COMPLETE! ${team.name} has successfully disabled the kill switch. Coimbatore is saved!`,
      finalOutcome: 'CITY_SAVED',
    };
  }

  async getStoryState() {
    const state = await this.prisma.storyState.findUnique({
      where: { id: 'singleton' },
    });

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

  async startStory() {
    await this.prisma.storyState.upsert({
      where: { id: 'singleton' },
      create: {
        id: 'singleton',
        storyStarted: true,
      },
      update: {
        storyStarted: true,
      },
    });

    return { message: 'Story has begun. Operation DARKWEAVE is active.' };
  }

  async triggerStoryEnding(outcome: 'CITY_SAVED' | 'BREACH_EXECUTED') {
    await this.prisma.storyState.upsert({
      where: { id: 'singleton' },
      create: {
        id: 'singleton',
        storyStarted: true,
        storyEnded: true,
        finalOutcome: outcome,
      },
      update: {
        storyEnded: true,
        finalOutcome: outcome,
      },
    });

    return {
      message: outcome === 'CITY_SAVED' 
        ? 'Story ended: Coimbatore saved!' 
        : 'Story ended: Breach executed. Coimbatore in chaos.',
      outcome,
    };
  }

  async resetStory() {
    await this.prisma.$transaction([
      this.prisma.storyProgress.deleteMany({}),
      this.prisma.storyState.deleteMany({}),
    ]);

    return { message: 'Story reset successfully' };
  }

  // Helper method to check round accessibility
  async canAccessRound(teamId: string, roundNumber: number): Promise<boolean> {
    const progress = await this.getTeamProgress(teamId);

    if (roundNumber === 1) return true;
    if (roundNumber === 2) return progress.round1Completed;
    if (roundNumber === 3) return progress.round1Completed && progress.round2Completed;

    return false;
  }

  // Get challenge content based on round
  async getRoundChallengeContent(roundNumber: number) {
    const challenges = {
      1: {
        title: 'ROUND 1: THE LEAK',
        description: 'Decode intercepted communications to discover the breach',
        story: `Coimbatore Police cybercrime division has intercepted encrypted chat logs between a Municipal Corporation engineer and an unknown handler. The messages were encrypted using a home-grown cipher. Your task: Decode these messages to uncover critical information about the compromised infrastructure.`,
        encryptedMessages: [
          {
            id: 1,
            content: 'VNNBEBZ_XBGRV_TVRGZAGR',
            hint: 'Simple substitution cipher - think Caesar',
          },
          {
            id: 2,
            content: 'EBVNXGBXG_2026_EQKZO',
            hint: 'Same cipher as message 1',
          },
          {
            id: 3,
            content: 'b1o2p3q4r5s6',
            hint: 'Direct credential fragment',
          },
        ],
        requiredOutputs: ['systemTarget', 'darkweaveCode', 'credentialHash'],
      },
      2: {
        title: 'ROUND 2: THE BREACH',
        description: 'Crack the access codes and expose the backdoor',
        story: `Using the decoded intelligence, you've traced the breach to Ukkadam Water Treatment Plant's maintenance VPN. The attackers left password hashes and encrypted tokens in system logs. You must crack these to obtain the SCCC Master Key and locate the backdoor.`,
        hashedCredentials: [
          {
            id: 1,
            hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
            hint: 'SHA256 hash of common password',
          },
          {
            id: 2,
            encryptedToken: 'U0NDQ19NQVNURVJfS0VZXzdGOEU5RDBB',
            hint: 'Base64 encoding',
          },
          {
            id: 3,
            logFragment: 'U0NDQ19WUE5fTk9ERV80Nw==',
            hint: 'Base64 encoding',
          },
        ],
        requiredOutputs: ['masterKey', 'backdoorLocation'],
      },
      3: {
        title: 'ROUND 3: THE COUNTDOWN',
        description: 'Disable the kill switch before midnight',
        story: `You've breached the SCCC network. Ransomware is scheduled to trigger at midnight, causing city-wide chaos. The kill switch can only be disabled once. Only ONE team can prevent disaster. Find the deactivation code.`,
        finalChallenge: {
          systemAccess: true,
          timeLimit: 'Before midnight',
          hint: 'The flag format follows standard HTB convention',
        },
        requiredOutput: 'flag',
      },
    };

    return challenges[roundNumber] || null;
  }
}
