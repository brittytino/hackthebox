import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// These answers live only on the server. The master-vault.html page never
// receives them until a participant has genuinely passed the prior layer.
const LAYER1_EXPECTED_BASE64 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
const LAYER2_JWT_PAYLOAD = 'eyJ2YXVsdF9rZXkiOiI0Mi0xNy04OSIsImRhdGEiOiJrbGxzd2l0Y2gifQ';
const VAULT_KEY = '42-17-89';
const FINAL_CODE = 'a1b2c3';
const FINAL_FLAG = 'CTF{MASTER_a1b2c3_VAULT}';

// Absolute level of "Level 3.3: The Master Vault" — see ChallengesService.getAbsoluteLevel
const MASTER_VAULT_ABSOLUTE_LEVEL = 9;

@Injectable()
export class VaultService {
  constructor(private prisma: PrismaService) {}

  async verifyLayer(userId: string, layer: number, rawValue: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { team: true },
    });

    if (!user || !user.team) {
      throw new NotFoundException('Team not found');
    }

    if (user.team.currentLevel < MASTER_VAULT_ABSOLUTE_LEVEL) {
      throw new ForbiddenException('The Master Vault has not been unlocked for your team yet');
    }

    const value = (rawValue || '').trim();

    switch (layer) {
      case 1:
        return { correct: value === LAYER1_EXPECTED_BASE64 };

      case 2: {
        const normalized = value.toLowerCase();
        return {
          correct: value.includes('eyJ') || normalized.includes(LAYER2_JWT_PAYLOAD.toLowerCase()),
        };
      }

      case 3:
        return { correct: value === VAULT_KEY || value.toLowerCase().includes('42') };

      case 4:
        return { correct: value === VAULT_KEY };

      case 5: {
        const correct = value.toLowerCase() === FINAL_CODE;
        return correct ? { correct: true, flag: FINAL_FLAG } : { correct: false };
      }

      default:
        return { correct: false };
    }
  }
}
