import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { OTPService } from './otp.service';
import { RegistrationService } from '../teams/registration.service';

@Controller('auth')
export class AuthController {
  constructor(
    private otpService: OTPService,
    private registrationService: RegistrationService,
  ) {}

  // Step 1: Request OTP
  @Post('request-otp')
  async requestOTP(@Body() body: { email: string }) {
    return this.otpService.sendOTP(body.email);
  }

  // Step 2: Verify OTP
  @Post('verify-otp')
  async verifyOTP(@Body() body: { email: string; otp: string }) {
    return this.otpService.verifyOTP(body.email, body.otp);
  }

  // Step 3: Register Team
  @Post('register-team')
  async registerTeam(
    @Body()
    body: {
      email: string;
      teamName: string;
      member1Name: string;
      member2Name: string;
    },
  ) {
    return this.registrationService.registerTeam(body);
  }

  // Get team info
  @Get('team/:teamId')
  async getTeam(@Param('teamId') teamId: string) {
    const team = await this.registrationService.getTeamInfo(teamId);
    if (!team) {
      return { success: false, message: 'Team not found' };
    }
    return { success: true, team };
  }
}
