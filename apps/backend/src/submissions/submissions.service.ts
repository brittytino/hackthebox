import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubmissionsService {
  constructor(private prisma: PrismaService) {}

  async getUserSubmissions(userId: string) {
    return this.prisma.submission.findMany({
      where: { userId },
      include: {
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
    });
  }
}
