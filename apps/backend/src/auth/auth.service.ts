 import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcrypt';
import {
  RegisterDto,
  LoginDto,
  SendOTPDto,
  VerifyOTPDto,
  CreateTeamDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  // Step 1: Send OTP to email
  async sendOTP(dto: SendOTPDto) {
    const { email } = dto;

    // Check if email already registered
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.isVerified) {
      throw new ConflictException('Email already registered');
    }

    // Check OTP log for rate limiting
    const otpLog = await this.prisma.oTPLog.findFirst({
      where: { email },
    });

    if (otpLog) {
      // Check if blocked
      if (otpLog.blockedUntil && otpLog.blockedUntil > new Date()) {
        const remainingMinutes = Math.ceil(
          (otpLog.blockedUntil.getTime() - Date.now()) / 60000,
        );
        throw new BadRequestException(
          `Too many attempts. Try again in ${remainingMinutes} minutes`,
        );
      }

      // Check if too many attempts in short time
      if (
        otpLog.attempts >= 3 &&
        otpLog.lastAttempt &&
        Date.now() - otpLog.lastAttempt.getTime() < 3600000
      ) {
        // Block for 1 hour
        await this.prisma.oTPLog.update({
          where: { id: otpLog.id },
          data: {
            blockedUntil: new Date(Date.now() + 3600000),
          },
        });
        throw new BadRequestException('Too many attempts. Blocked for 1 hour');
      }
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store or update user with OTP
    if (existingUser) {
      await this.prisma.user.update({
        where: { email },
        data: {
          otpHash,
          otpExpiry,
        },
      });
    } else {
      await this.prisma.user.create({
        data: {
          email,
          otpHash,
          otpExpiry,
          isVerified: false,
        },
      });
    }

    // Update OTP log
    if (otpLog) {
      await this.prisma.oTPLog.update({
        where: { id: otpLog.id },
        data: {
          attempts: otpLog.attempts + 1,
          lastAttempt: new Date(),
        },
      });
    } else {
      await this.prisma.oTPLog.create({
        data: {
          email,
          attempts: 1,
          lastAttempt: new Date(),
        },
      });
    }

    // Send OTP via email
    const emailSent = await this.emailService.sendOTP(email, otp);

    if (!emailSent) {
      throw new BadRequestException('Failed to send OTP email');
    }

    this.logger.log(`OTP sent to ${email}`);

    return {
      success: true,
      message: 'OTP sent to your email',
      expiresIn: '10 minutes',
    };
  }

  // Step 2: Verify OTP
  async verifyOTP(dto: VerifyOTPDto) {
    const { email, otp } = dto;

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { team: true },
    });

    if (!user || !user.otpHash || !user.otpExpiry) {
      throw new BadRequestException('Invalid OTP request');
    }

    // Check if OTP expired
    if (user.otpExpiry < new Date()) {
      throw new BadRequestException('OTP expired. Request a new one');
    }

    // Verify OTP
    const isValid = await bcrypt.compare(otp, user.otpHash);

    if (!isValid) {
      throw new BadRequestException('Invalid OTP');
    }

    // Initialize story progress if not already done
    if (user.teamId) {
      const existingProgress = await this.prisma.storyProgress.findFirst({
        where: { teamId: user.teamId },
      });
      if (!existingProgress) {
        await this.prisma.storyProgress.create({
          data: { teamId: user.teamId, currentRound: 1 },
        });
      }
    }

    // Mark as verified
    await this.prisma.user.update({
      where: { email },
      data: {
        isVerified: true,
        otpHash: null,
        otpExpiry: null,
      },
    });

    // Reset OTP log attempts
    await this.prisma.oTPLog.updateMany({
      where: { email },
      data: { attempts: 0, blockedUntil: null },
    });

    this.logger.log(`OTP verified for ${email}`);

    const token = this.generateToken(user.id);

    return {
      success: true,
      message: 'OTP verified successfully',
      email,
      verified: true,
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        teamName: user.team?.name,
      },
    };
  }

  // Step 3: Create Team
  async createTeam(dto: CreateTeamDto) {
    const { email, teamName, member1Name, member2Name } = dto;

    // Verify user exists and is verified
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { team: true },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.isVerified) {
      throw new BadRequestException('Email not verified');
    }

    if (user.team) {
      throw new ConflictException('User already has a team');
    }

    // Check if team name already exists
    const existingTeam = await this.prisma.team.findUnique({
      where: { name: teamName },
    });

    if (existingTeam) {
      throw new ConflictException('Team name already taken');
    }

    // Create team
    const team = await this.prisma.team.create({
      data: {
        name: teamName,
        member1Name,
        member2Name,
      },
    });

    // Update user with team
    await this.prisma.user.update({
      where: { email },
      data: {
        teamId: team.id,
        username: teamName, // Use team name as username
      },
    });

    // Initialize score
    await this.prisma.score.create({
      data: {
        teamId: team.id,
        totalPoints: 0,
      },
    });

    // Initialize story progress
    await this.prisma.storyProgress.create({
      data: {
        teamId: team.id,
        currentRound: 1,
      },
    });

    // Send welcome email
    await this.emailService.sendWelcomeEmail(
      email,
      teamName,
      member1Name,
      member2Name,
    );

    // Generate JWT token
    const token = this.generateToken(user.id);

    this.logger.log(`Team created: ${teamName}`);

    return {
      success: true,
      message: 'Team created successfully',
      access_token: token,
      team: {
        id: team.id,
        name: team.name,
        member1Name,
        member2Name,
      },
      user: {
        id: user.id,
        email: user.email,
        username: teamName,
        role: user.role,
      },
    };
  }

  // Login (for returning teams)
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: dto.email,
        isVerified: true,
      },
      include: {
        team: true,
      },
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

  // Register: Step 1 - collect info, create team, send OTP
  async register(dto: RegisterDto) {
    const { email, password, teamName, participant1Name, participant2Name } = dto;

    // Check if email already registered and verified
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser?.isVerified) {
      throw new ConflictException('Email already registered. Please login.');
    }

    // Check if team name is taken by a different user's verified team
    const existingTeam = await this.prisma.team.findUnique({
      where: { name: teamName },
    });

    if (existingTeam) {
      throw new ConflictException('Team name already taken. Choose a different team name.');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create team
    const team = await this.prisma.team.create({
      data: {
        name: teamName,
        member1Name: participant1Name,
        member2Name: participant2Name,
      },
    });

    // Initialize score for team
    await this.prisma.score.create({
      data: {
        teamId: team.id,
        totalPoints: 0,
      },
    });

    // Create or update user
    if (existingUser) {
      await this.prisma.user.update({
        where: { id: existingUser.id },
        data: { passwordHash, otpHash, otpExpiry, teamId: team.id },
      });
    } else {
      await this.prisma.user.create({
        data: {
          email,
          passwordHash,
          isVerified: false,
          otpHash,
          otpExpiry,
          teamId: team.id,
        },
      });
    }

    // Send OTP - if email fails, return OTP in response so UI can display it
    const emailResult = await this.emailService.sendOTP(email, otp);

    const response: any = {
      success: true,
      email,
      teamName,
    };

    if (emailResult.sent) {
      response.message = 'OTP sent to your email. Check your inbox.';
    } else {
      // SMTP blocked (likely network/firewall) – surface OTP so flow can continue
      response.message = 'Email delivery is blocked on this network. Your OTP is shown below.';
      response.devOtp = emailResult.devOtp;
    }

    return response;
  }

  private generateToken(userId: string): string {
    return this.jwtService.sign({ sub: userId });
  }
}

