import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChallengeLevel } from '@prisma/client';

export interface RegisterTeamDto {
  email: string;
  teamName: string;
  member1Name: string;
  member2Name: string;
}

@Injectable()
export class RegistrationService {
  constructor(private prisma: PrismaService) {}

  // Create team after OTP verification
  async registerTeam(dto: RegisterTeamDto): Promise<{
    success: boolean;
    message: string;
    team?: any;
  }> {
    try {
      // Verify OTP was completed
      const otpRecord = await this.prisma.oTP.findFirst({
        where: {
          email: dto.email,
          isVerified: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!otpRecord) {
        return {
          success: false,
          message: 'Email not verified. Please complete OTP verification.',
        };
      }

      // Check if email already has a team
      const existingTeamByEmail = await this.prisma.team.findUnique({
        where: { email: dto.email },
      });

      if (existingTeamByEmail) {
        return {
          success: false,
          message: 'Email already registered with a team',
        };
      }

      // Check if team name is taken
      const existingTeamByName = await this.prisma.team.findUnique({
        where: { name: dto.teamName },
      });

      if (existingTeamByName) {
        return {
          success: false,
          message: 'Team name already taken',
        };
      }

      // Validate team name
      if (
        dto.teamName.length < 3 ||
        dto.teamName.length > 20 ||
        !/^[a-zA-Z0-9_-]+$/.test(dto.teamName)
      ) {
        return {
          success: false,
          message:
            'Team name must be 3-20 characters (letters, numbers, _ and - only)',
        };
      }

      // Validate member names
      if (!dto.member1Name || dto.member1Name.trim().length < 2) {
        return {
          success: false,
          message: 'Member 1 name must be at least 2 characters',
        };
      }

      if (!dto.member2Name || dto.member2Name.trim().length < 2) {
        return {
          success: false,
          message: 'Member 2 name must be at least 2 characters',
        };
      }

      // Create team
      const team = await this.prisma.team.create({
        data: {
          email: dto.email,
          name: dto.teamName,
          member1Name: dto.member1Name.trim(),
          member2Name: dto.member2Name.trim(),
          currentChallenge: ChallengeLevel.LEVEL_1_1,
          registrationTime: new Date(),
        },
      });

      return {
        success: true,
        message: 'Team registered successfully',
        team: {
          id: team.id,
          name: team.name,
          member1: team.member1Name,
          member2: team.member2Name,
          currentChallenge: team.currentChallenge,
        },
      };
    } catch (error) {
      console.error('Registration Error:', error);
      return {
        success: false,
        message: 'Registration failed',
      };
    }
  }

  // Get team info
  async getTeamInfo(teamId: string): Promise<any> {
    try {
      const team = await this.prisma.team.findUnique({
        where: { id: teamId },
        include: {
          submissions: {
            include: {
              challenge: {
                include: {
                  round: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      if (!team) {
        return null;
      }

      // Calculate statistics
      const correctSubmissions = team.submissions.filter((s) => s.isCorrect);
      const challengesSolved = correctSubmissions.length;

      // Get current round info
      const currentLevelNumber = parseInt(
        team.currentChallenge.split('_')[1],
        10,
      );
      const currentRoundNumber = Math.ceil(currentLevelNumber / 3);

      return {
        id: team.id,
        name: team.name,
        email: team.email,
        members: [team.member1Name, team.member2Name],
        stats: {
          totalPoints: team.totalPoints,
          challengesSolved,
          currentChallenge: team.currentChallenge,
          currentRound: currentRoundNumber,
          hintsUsed: team.hintsUsed,
          timeElapsed: team.timeElapsed,
        },
        registrationTime: team.registrationTime,
      };
    } catch (error) {
      console.error('Get Team Info Error:', error);
      return null;
    }
  }

  // Get leaderboard
  async getLeaderboard(limit: number = 10): Promise<any[]> {
    try {
      const teams = await this.prisma.team.findMany({
        where: {
          isActive: true,
        },
        orderBy: [
          { totalPoints: 'desc' },
          { timeElapsed: 'asc' }, // Tiebreaker: faster time wins
        ],
        take: limit,
        select: {
          id: true,
          name: true,
          totalPoints: true,
          currentChallenge: true,
          timeElapsed: true,
          member1Name: true,
          member2Name: true,
          registrationTime: true,
        },
      });

      return teams.map((team, index) => ({
        rank: index + 1,
        teamName: team.name,
        members: [team.member1Name, team.member2Name],
        points: team.totalPoints,
        currentLevel: team.currentChallenge,
        timeElapsed: team.timeElapsed,
      }));
    } catch (error) {
      console.error('Leaderboard Error:', error);
      return [];
    }
  }
}
