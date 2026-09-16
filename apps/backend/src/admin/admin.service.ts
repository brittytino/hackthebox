import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScoreboardService } from '../scoreboard/scoreboard.service';
import { CreateRoundDto, UpdateRoundStatusDto, CreateChallengeDto, UpdateChallengeDto } from './dto/admin.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private scoreboardService: ScoreboardService,
  ) {}

  // Round Management
  async createRound(dto: CreateRoundDto) {
    return this.prisma.round.create({
      data: dto,
    });
  }

  async updateRoundStatus(roundId: string, dto: UpdateRoundStatusDto) {
    return this.prisma.round.update({
      where: { id: roundId },
      data: { status: dto.status },
    });
  }

  async deleteRound(roundId: string) {
    await this.prisma.round.delete({
      where: { id: roundId },
    });
    return { message: 'Round deleted successfully' };
  }

  // Challenge Management
  async createChallenge(dto: CreateChallengeDto) {
    const flagHash = await bcrypt.hash(dto.flag.toLowerCase(), 10);

    const { flag, ...data } = dto;

    return this.prisma.challenge.create({
      data: {
        ...data,
        flagHash,
      },
    });
  }

  async updateChallenge(challengeId: string, dto: UpdateChallengeDto) {
    const { flag, ...rest } = dto;

    const data: Record<string, unknown> = { ...rest };
    if (flag) {
      data.flagHash = await bcrypt.hash(flag.toLowerCase(), 10);
    }

    return this.prisma.challenge.update({
      where: { id: challengeId },
      data,
    });
  }

  async deleteChallenge(challengeId: string) {
    await this.prisma.challenge.delete({
      where: { id: challengeId },
    });
    return { message: 'Challenge deleted successfully' };
  }

  // User Management
  async updateUserRole(userId: string, role: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role: role as any },
    });
  }

  async deleteUser(userId: string) {
    await this.prisma.user.delete({
      where: { id: userId },
    });
    return { message: 'User deleted successfully' };
  }

  // Statistics
  async getStatistics() {
    const [
      totalUsers,
      totalTeams,
      totalRounds,
      totalChallenges,
      totalSubmissions,
      correctSubmissions,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.team.count(),
      this.prisma.round.count(),
      this.prisma.challenge.count(),
      this.prisma.submission.count(),
      this.prisma.submission.count({ where: { isCorrect: true } }),
    ]);

    return {
      totalUsers,
      totalTeams,
      totalRounds,
      totalChallenges,
      totalSubmissions,
      correctSubmissions,
      successRate: totalSubmissions > 0 ? (correctSubmissions / totalSubmissions) * 100 : 0,
    };
  }

  async getAllSubmissions() {
    return this.prisma.submission.findMany({
      include: {
        user: {
          select: {
            username: true,
            email: true,
          },
        },
        team: {
          select: {
            name: true,
          },
        },
        challenge: {
          select: {
            title: true,
            points: true,
            round: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async resetCompetition() {
    // Delete dependent records first
    await this.prisma.submission.deleteMany({});
    await this.prisma.activity.deleteMany({});
    await this.prisma.storyProgress.deleteMany({});
    await this.prisma.score.deleteMany({});

    // Reset all rounds back to PENDING first, then activate round 1
    await this.prisma.round.updateMany({ data: { status: 'PENDING' } });
    const firstRound = await this.prisma.round.findFirst({ where: { order: 1 } });
    if (firstRound) {
      await this.prisma.round.update({
        where: { id: firstRound.id },
        data: { status: 'ACTIVE' },
      });
    }

    // Re-initialize scores and story progress for all teams, reset currentLevel
    const teams = await this.prisma.team.findMany({ select: { id: true } });
    for (const team of teams) {
      await this.prisma.team.update({
        where: { id: team.id },
        data: { currentLevel: 1 },
      });
      await this.prisma.score.create({
        data: { teamId: team.id, totalPoints: 0 },
      });
      await this.prisma.storyProgress.create({
        data: { teamId: team.id, currentRound: 1 },
      });
    }

    return { message: 'Competition reset successfully. All teams reset to Level 1.' };
  }

  // Score Management
  async adjustTeamScore(teamId: string, points: number, reason: string) {
    const score = await this.prisma.score.findUnique({
      where: { teamId },
    });

    if (!score) {
      throw new NotFoundException('Team score not found');
    }

    const newTotal = score.totalPoints + points;

    await this.prisma.score.update({
      where: { teamId },
      data: { totalPoints: newTotal },
    });

    return {
      message: `Score adjusted by ${points} points. Reason: ${reason}`,
      newTotal,
    };
  }

  async disqualifyTeam(teamId: string, reason: string) {
    // `disqualified` alone is the marker — it's already checked at submit/hint
    // time and filtered out of the public scoreboard. Mutating member roles
    // was a hack that had no reset path on re-qualification.
    await this.prisma.team.update({
      where: { id: teamId },
      data: { disqualified: true },
    });

    return {
      message: `Team disqualified. Reason: ${reason}`,
    };
  }

  async reEnableTeam(teamId: string) {
    await this.prisma.team.update({
      where: { id: teamId },
      data: { disqualified: false },
    });

    return {
      message: 'Team successfully re-enabled and restored to active competition.',
    };
  }

  async freezeTeamScore(teamId: string, freeze: boolean) {
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new NotFoundException('Team not found');

    await this.prisma.team.update({
      where: { id: teamId },
      data: { scoreFrozen: freeze },
    });

    return {
      message: `Score for "${team.name}" is now ${freeze ? 'FROZEN' : 'UNFROZEN'}.`,
      scoreFrozen: freeze,
    };
  }

  async getHintsOverview() {
    const [teams, challenges, hintActivities] = await Promise.all([
      this.prisma.team.findMany({
        include: {
          scores: true,
          members: { select: { username: true } },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.challenge.findMany({
        where: { isActive: true },
        include: { round: { select: { order: true, name: true } } },
        orderBy: [{ round: { order: 'asc' } }, { order: 'asc' }],
      }),
      this.prisma.activity.findMany({
        where: { actionType: 'HINT_USED' },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Unique challenges defensive deduplication
    const uniqueChallenges: typeof challenges = [];
    const seenMap = new Set<string>();
    for (const c of challenges) {
      const key = `${c.round.order}-${c.order}`;
      if (!seenMap.has(key)) {
        seenMap.add(key);
        uniqueChallenges.push(c);
      }
    }

    const challengeCatalog = uniqueChallenges.map((ch) => ({
      id: ch.id,
      title: ch.title,
      roundOrder: ch.round.order,
      order: ch.order,
      points: ch.points,
      hintPenalty: ch.hintPenalty,
      hints: (ch.hints || '').split('||').map((h) => h.trim()).filter(Boolean),
    }));

    const teamHintSummary = teams.map((team) => {
      const teamActivities = hintActivities.filter((a) => a.teamId === team.id);
      const totalPenalties = teamActivities.reduce((acc, curr) => acc + Math.abs(curr.points || 0), 0);
      const currentCh = uniqueChallenges[Math.min(Math.max(0, team.currentLevel - 1), uniqueChallenges.length - 1)] || null;
      const hintsOnCurrent = currentCh
        ? teamActivities.filter((a) => a.challengeId === currentCh.id).length
        : 0;

      return {
        id: team.id,
        name: team.name,
        members: team.members.map((m) => m.username),
        currentLevel: team.currentLevel,
        currentChallenge: currentCh
          ? { id: currentCh.id, title: currentCh.title, roundOrder: currentCh.round.order, order: currentCh.order }
          : null,
        totalPoints: team.scores[0]?.totalPoints || 0,
        scoreFrozen: team.scoreFrozen,
        disqualified: team.disqualified,
        totalHintsUsed: teamActivities.length,
        totalHintPenalty: totalPenalties,
        hintsOnCurrent,
        recentActivities: teamActivities.slice(0, 5),
      };
    });

    return {
      teams: teamHintSummary,
      catalog: challengeCatalog,
    };
  }

  async grantHint(teamId: string, challengeId?: string, free: boolean = true) {
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new NotFoundException('Team not found');

    const challenges = await this.prisma.challenge.findMany({
      where: { isActive: true },
      include: { round: true },
      orderBy: [{ round: { order: 'asc' } }, { order: 'asc' }],
    });

    const targetChallenge = challengeId
      ? challenges.find((c) => c.id === challengeId)
      : challenges[Math.min(Math.max(0, team.currentLevel - 1), challenges.length - 1)];

    if (!targetChallenge) throw new NotFoundException('Challenge not found');

    const hintTiers = (targetChallenge.hints || '').split('||').map((h) => h.trim()).filter(Boolean);
    if (hintTiers.length === 0) {
      throw new NotFoundException('No hints configured for this challenge');
    }

    const existing = await this.prisma.activity.findMany({
      where: { teamId, challengeId: targetChallenge.id, actionType: 'HINT_USED' },
    });

    const nextIndex = existing.length + 1;
    const grantedHint = hintTiers[Math.min(nextIndex - 1, hintTiers.length - 1)];
    const penalty = free ? 0 : (targetChallenge.hintPenalty || 0);

    if (!free && penalty > 0 && !team.scoreFrozen) {
      const score = await this.prisma.score.findUnique({ where: { teamId } });
      const newPoints = Math.max(0, (score?.totalPoints || 0) - penalty);
      await this.prisma.score.upsert({
        where: { teamId },
        create: { teamId, totalPoints: newPoints },
        update: { totalPoints: newPoints },
      });
    }

    const activity = await this.prisma.activity.create({
      data: {
        teamId: team.id,
        teamName: team.name,
        challengeId: targetChallenge.id,
        challengeTitle: targetChallenge.title,
        roundNumber: targetChallenge.round.order,
        levelNumber: challenges.findIndex((c) => c.id === targetChallenge.id) + 1,
        actionType: 'HINT_USED',
        storyMessage: free
          ? `[HQ OVERRIDE] Orbital Intel Dispatch: Administrator authorized classified intel ${Math.min(nextIndex, hintTiers.length)}/${hintTiers.length} for ${targetChallenge.title}`
          : `${team.name} unlocked mission intel ${Math.min(nextIndex, hintTiers.length)}/${hintTiers.length} for ${targetChallenge.title}`,
        points: -penalty,
      },
    });

    return {
      message: `Hint ${Math.min(nextIndex, hintTiers.length)}/${hintTiers.length} dispatched to ${team.name}`,
      hint: grantedHint,
      hintIndex: Math.min(nextIndex, hintTiers.length),
      totalHints: hintTiers.length,
      free,
      penalty,
      activity,
    };
  }

  async resetTeamHints(teamId: string, challengeId?: string, refundPoints: boolean = true) {
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new NotFoundException('Team not found');

    const whereClause: any = { teamId, actionType: 'HINT_USED' };
    if (challengeId) whereClause.challengeId = challengeId;

    const hints = await this.prisma.activity.findMany({ where: whereClause });
    const totalDeducted = hints.reduce((sum, h) => sum + Math.abs(h.points || 0), 0);

    await this.prisma.activity.deleteMany({ where: whereClause });

    if (refundPoints && totalDeducted > 0 && !team.scoreFrozen) {
      await this.prisma.score.update({
        where: { teamId },
        data: { totalPoints: { increment: totalDeducted } },
      });
    }

    return {
      message: `Reset ${hints.length} hint record(s) for ${team.name}.${refundPoints && totalDeducted > 0 ? ` Refunded ${totalDeducted} points.` : ''}`,
      resetCount: hints.length,
      refundedPoints: refundPoints ? totalDeducted : 0,
    };
  }

  async qualifyTeam(teamId: string) {
    await this.prisma.team.update({
      where: { id: teamId },
      data: {
        disqualified: false,
        qualified: true,
        qualifiedAt: new Date(),
      },
    });

    return {
      message: 'Team qualified for next round',
    };
  }

  async qualifyTopTeams(count: number) {
    const topTeams = await this.prisma.score.findMany({
      take: count,
      orderBy: [
        { totalPoints: 'desc' },
        { lastSolved: 'asc' },
      ],
      include: {
        team: true,
      },
    });

    const qualifiedIds: string[] = [];
    for (const score of topTeams) {
      await this.prisma.team.update({
        where: { id: score.teamId },
        data: {
          qualified: true,
          qualifiedAt: new Date(),
        },
      });
      qualifiedIds.push(score.teamId as string);
    }

    return {
      message: `Qualified top ${count} teams`,
      qualifiedTeams: qualifiedIds,
    };
  }

  async freezeScoreboard(freeze: boolean) {
    await this.scoreboardService.setFrozen(freeze);

    return {
      message: `Scoreboard ${freeze ? 'frozen' : 'unfrozen'}`,
      frozen: freeze,
    };
  }

  async exportResults() {
    const [teams, submissions, rounds] = await Promise.all([
      this.prisma.team.findMany({
        include: {
          members: {
            select: {
              username: true,
              email: true,
            },
          },
          scores: true,
        },
      }),
      this.prisma.submission.findMany({
        where: { isCorrect: true },
        include: {
          user: {
            select: {
              username: true,
            },
          },
          team: {
            select: {
              name: true,
            },
          },
          challenge: {
            select: {
              title: true,
              points: true,
              round: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.round.findMany({
        include: {
          challenges: true,
        },
        orderBy: { order: 'asc' },
      }),
    ]);

    return {
      exportDate: new Date().toISOString(),
      teams: teams.map(team => ({
        id: team.id,
        name: team.name,
        members: team.members,
        totalPoints: team.scores[0]?.totalPoints || 0,
        lastSolved: team.scores[0]?.lastSolved,
      })),
      submissions,
      rounds,
      statistics: await this.getStatistics(),
    };
  }

  async exportResultsCSV() {
    const teams = await this.prisma.team.findMany({
      include: {
        members: {
          select: {
            username: true,
            email: true,
          },
        },
        scores: true,
      },
      orderBy: {
        scores: {
          _count: 'desc',
        },
      },
    });

    // Build CSV content
    let csv = 'Rank,Team Name,Members,Total Points,Last Solve Time,Qualified,Status\n';
    
    let rank = 1;
    const sortedTeams = teams
      .map(team => ({
        ...team,
        totalPoints: team.scores[0]?.totalPoints || 0,
        lastSolved: team.scores[0]?.lastSolved || null,
      }))
      .sort((a, b) => {
        if (b.totalPoints !== a.totalPoints) {
          return b.totalPoints - a.totalPoints;
        }
        if (!a.lastSolved) return 1;
        if (!b.lastSolved) return -1;
        return new Date(a.lastSolved).getTime() - new Date(b.lastSolved).getTime();
      });

    for (const team of sortedTeams) {
      const memberNames = team.members.map(m => m.username).join(';');
      const status = team.disqualified ? 'DISQUALIFIED' : 'ACTIVE';
      const lastSolvedStr = team.lastSolved ? new Date(team.lastSolved).toISOString() : 'N/A';
      
      csv += `${rank},"${team.name}","${memberNames}",${team.totalPoints},${lastSolvedStr},${team.qualified},${status}\n`;
      rank++;
    }

    return csv;
  }

  // Game & Round Overrides
  async endGame() {
    const topScore = await this.prisma.score.findFirst({
      orderBy: [
        { totalPoints: 'desc' },
        { lastSolved: 'asc' },
      ],
      include: {
        team: true,
      },
    });

    const winnerTeam = topScore?.team;

    const state = await this.prisma.storyState.upsert({
      where: { id: 'singleton' },
      create: {
        id: 'singleton',
        storyStarted: true,
        storyEnded: true,
        winnerTeamName: winnerTeam?.name || 'OPERATIVE ALLIANCE',
        round3Winner: winnerTeam?.id || null,
        winTimestamp: new Date(),
        finalOutcome: 'CITY_SAVED',
      },
      update: {
        storyEnded: true,
        winnerTeamName: winnerTeam?.name || 'OPERATIVE ALLIANCE',
        round3Winner: winnerTeam?.id || null,
        winTimestamp: new Date(),
        finalOutcome: 'CITY_SAVED',
      },
    });

    return {
      message: 'Game ended successfully. Finale broadcast activated for all teams.',
      winner: winnerTeam?.name || 'OPERATIVE ALLIANCE',
      state,
    };
  }

  async resumeGame() {
    const state = await this.prisma.storyState.upsert({
      where: { id: 'singleton' },
      create: {
        id: 'singleton',
        storyStarted: true,
        storyEnded: false,
      },
      update: {
        storyEnded: false,
      },
    });

    return {
      message: 'Game resumed. Live missions active.',
      state,
    };
  }

  async activateAllRounds() {
    await this.prisma.round.updateMany({
      data: { status: 'ACTIVE' },
    });

    return {
      message: 'All rounds (1, 2, 3) are now ACTIVE.',
    };
  }
}
