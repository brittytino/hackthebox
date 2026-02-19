import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // Register: create user + team directly, no OTP needed
  async register(dto: RegisterDto) {
    const { email, password, teamName, participant1Name, participant2Name } = dto;

    // Check if email already registered and verified
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      include: { team: true },
    });

    if (existingUser?.isVerified) {
      throw new ConflictException('Email already registered. Please login.');
    }

    // Clean up orphaned team from a previous incomplete registration attempt
    if (existingUser?.team) {
      this.logger.log(`Cleaning up prior incomplete registration for ${email}`);
      await this.prisma.storyProgress.deleteMany({ where: { teamId: existingUser.team.id } });
      await this.prisma.score.deleteMany({ where: { teamId: existingUser.team.id } });
      await this.prisma.user.update({ where: { id: existingUser.id }, data: { teamId: null } });
      await this.prisma.team.delete({ where: { id: existingUser.team.id } });
    }

    // Check team name availability
    const existingTeam = await this.prisma.team.findUnique({ where: { name: teamName } });
    if (existingTeam) {
      throw new ConflictException('Team name already taken. Choose a different name.');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Create team
    const team = await this.prisma.team.create({
      data: {
        name: teamName,
        member1Name: participant1Name,
        member2Name: participant2Name,
      },
    });

    // Initialize score
    await this.prisma.score.create({ data: { teamId: team.id, totalPoints: 0 } });

    // Initialize story progress
    await this.prisma.storyProgress.create({ data: { teamId: team.id, currentRound: 1 } });

    // Create or update user â€” mark as verified immediately
    let user: any;
    if (existingUser) {
      user = await this.prisma.user.update({
        where: { id: existingUser.id },
        data: { passwordHash, isVerified: true, teamId: team.id, username: teamName },
      });
    } else {
      user = await this.prisma.user.create({
        data: {
          email,
          passwordHash,
          isVerified: true,
          teamId: team.id,
          username: teamName,
        },
      });
    }

    const token = this.generateToken(user.id);
    this.logger.log(`Team registered: ${teamName} (${email})`);

    return {
      success: true,
      message: 'Team registered successfully. Welcome to Operation Cipher Strike!',
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        teamName: team.name,
      },
      team: {
        id: team.id,
        name: team.name,
        member1Name: participant1Name,
        member2Name: participant2Name,
      },
    };
  }

  // Login for returning teams
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email, isVerified: true },
      include: { team: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user.id);
    this.logger.log(`Login: ${dto.email}`);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        teamName: user.team?.name,
      },
      team: user.team,
    };
  }

  private generateToken(userId: string): string {
    return this.jwtService.sign({ sub: userId });
  }
}
