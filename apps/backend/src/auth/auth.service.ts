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
    const { username, password, teamName, participant1Name, participant2Name } = dto;
    const cleanUsername = username.trim();
    const cleanEmail =
      dto.email?.trim() ||
      `${cleanUsername.toLowerCase().replace(/[^a-z0-9_.-]/g, '')}@theextraction.local`;

    // Check if username already taken
    const existingByUsername = await this.prisma.user.findFirst({
      where: { username: { equals: cleanUsername, mode: 'insensitive' } },
    });
    if (existingByUsername) {
      throw new ConflictException('Username already taken. Please choose a different username.');
    }

    // Check if email already registered and verified
    const existingUser = await this.prisma.user.findFirst({
      where: { email: { equals: cleanEmail, mode: 'insensitive' } },
      include: { team: true },
    });

    if (existingUser?.isVerified) {
      throw new ConflictException('An account with this username already exists. Please login.');
    }

    // Clean up orphaned team from a previous incomplete registration attempt
    if (existingUser?.team) {
      this.logger.log(`Cleaning up prior incomplete registration for ${cleanEmail}`);
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
        member2Name: participant2Name || null,
      },
    });

    // Initialize score
    await this.prisma.score.create({ data: { teamId: team.id, totalPoints: 0 } });

    // Initialize story progress
    await this.prisma.storyProgress.create({ data: { teamId: team.id, currentRound: 1 } });

    // Create or update user — mark as verified immediately
    let user: any;
    if (existingUser) {
      user = await this.prisma.user.update({
        where: { id: existingUser.id },
        data: { passwordHash, isVerified: true, teamId: team.id, username: cleanUsername },
      });
    } else {
      user = await this.prisma.user.create({
        data: {
          email: cleanEmail,
          passwordHash,
          isVerified: true,
          teamId: team.id,
          username: cleanUsername,
        },
      });
    }

    const token = this.generateToken(user.id);
    this.logger.log(`Team registered: ${teamName} (username: ${cleanUsername})`);

    return {
      success: true,
      message: 'Team registered successfully. Welcome to The Extraction!',
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        teamName: team.name,
      },
      team: {
        id: team.id,
        name: team.name,
        member1Name: participant1Name,
        member2Name: participant2Name || null,
      },
    };
  }

  // Login for returning teams (by username or email)
  async login(dto: LoginDto) {
    const identifier = (dto.username || dto.email || '').trim();
    if (!identifier) {
      throw new BadRequestException('Username is required');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: identifier, mode: 'insensitive' } },
          { email: { equals: identifier, mode: 'insensitive' } },
        ],
        isVerified: true,
      },
      include: { team: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const token = this.generateToken(user.id);
    this.logger.log(`Login: ${identifier} (${user.username || user.email})`);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
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
