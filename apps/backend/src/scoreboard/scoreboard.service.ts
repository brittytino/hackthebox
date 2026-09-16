import { Injectable } from '@nestjs/common';
import { Observable, interval } from 'rxjs';
import { shareReplay, switchMap } from 'rxjs/operators';
import { PrismaService } from '../prisma/prisma.service';

const FROZEN_FLAG_KEY = 'scoreboard_frozen';
const FROZEN_SNAPSHOT_KEY = 'scoreboard_frozen_snapshot';

@Injectable()
export class ScoreboardService {
  // One shared poll for every SSE subscriber, however many there are — the
  // DB gets queried once per tick regardless of whether 1 or 500 clients are
  // watching the live scoreboard, instead of once per connected client.
  private readonly liveScoreboard$: Observable<Awaited<ReturnType<ScoreboardService['getScoreboard']>>> =
    interval(5000).pipe(
      switchMap(() => this.getScoreboard()),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

  constructor(private prisma: PrismaService) {}

  getLiveScoreboardStream() {
    return this.liveScoreboard$;
  }

  // Always live, disqualified teams excluded — what participants/spectators see.
  async getLiveScoreboard() {
    const scores = await this.prisma.score.findMany({
      where: { team: { disqualified: false } },
      include: {
        team: {
          include: {
            members: {
              select: {
                username: true,
              },
            },
            submissions: {
              where: { isCorrect: true },
              select: {
                challengeId: true,
              },
            },
          },
        },
      },
      orderBy: [
        { totalPoints: 'desc' },
        { lastSolved: 'asc' },
      ],
    });

    return scores.map((score, index) => {
      const distinctSolves = new Set(score.team.submissions.map((s) => s.challengeId)).size;
      return {
        rank: index + 1,
        teamId: score.teamId,
        teamName: score.team.name,
        totalPoints: score.totalPoints,
        points: score.totalPoints,
        currentLevel: score.team.currentLevel,
        challengesSolved: distinctSolves,
        solvedChallenges: distinctSolves,
        lastSolved: score.lastSolved,
        memberCount: score.team.members.length,
        members: score.team.members.map((m) => m.username),
      };
    });
  }

  // What the public scoreboard endpoint should actually return: the frozen
  // snapshot while frozen, live data otherwise. Admins always get getLiveScoreboard().
  // Keeps the same array shape callers already expect — freeze status is
  // exposed separately via isFrozen() so this never becomes a breaking change.
  async getScoreboard() {
    const frozenFlag = await this.prisma.systemConfig.findUnique({ where: { key: FROZEN_FLAG_KEY } });

    if (frozenFlag?.value === 'true') {
      const snapshot = await this.prisma.systemConfig.findUnique({ where: { key: FROZEN_SNAPSHOT_KEY } });
      if (snapshot) {
        try {
          return JSON.parse(snapshot.value);
        } catch {
          // fall through to live data if the stored snapshot is somehow invalid
        }
      }
    }

    return this.getLiveScoreboard();
  }

  async isFrozen() {
    const frozenFlag = await this.prisma.systemConfig.findUnique({ where: { key: FROZEN_FLAG_KEY } });
    return frozenFlag?.value === 'true';
  }

  async setFrozen(freeze: boolean) {
    if (freeze) {
      const liveScores = await this.getLiveScoreboard();
      await this.prisma.systemConfig.upsert({
        where: { key: FROZEN_SNAPSHOT_KEY },
        create: { key: FROZEN_SNAPSHOT_KEY, value: JSON.stringify(liveScores) },
        update: { value: JSON.stringify(liveScores) },
      });
    }

    await this.prisma.systemConfig.upsert({
      where: { key: FROZEN_FLAG_KEY },
      create: { key: FROZEN_FLAG_KEY, value: freeze.toString() },
      update: { value: freeze.toString() },
    });
  }

  async getTeamStats(teamId: string) {
    const score = await this.prisma.score.findUnique({
      where: { teamId },
      include: {
        team: {
          include: {
            submissions: {
              where: { isCorrect: true },
              include: {
                challenge: {
                  select: {
                    id: true,
                    title: true,
                    points: true,
                    order: true,
                    round: {
                      select: {
                        name: true,
                        order: true,
                      },
                    },
                  },
                },
                user: {
                  select: {
                    username: true,
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });

    if (!score) {
      return {
        teamId,
        totalPoints: 0,
        solvedChallenges: 0,
        challengesSolved: 0,
        submissions: [],
      };
    }

    const distinctSolves = new Set(score.team.submissions.map((s) => s.challengeId)).size;

    return {
      teamId,
      teamName: score.team.name,
      totalPoints: score.totalPoints,
      points: score.totalPoints,
      currentLevel: score.team.currentLevel,
      solvedChallenges: distinctSolves,
      challengesSolved: distinctSolves,
      lastSolved: score.lastSolved,
      submissions: score.team.submissions,
    };
  }
}
