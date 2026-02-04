import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class OTPService {
  private transporter: nodemailer.Transporter;

  constructor(private prisma: PrismaService) {
    // Configure email transporter
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Generate 6-digit OTP
  private generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  // Send OTP to email
  async sendOTP(email: string): Promise<{ success: boolean; message: string }> {
    try {
      // Check if email already registered
      const existingTeam = await this.prisma.team.findUnique({
        where: { email },
      });

      if (existingTeam) {
        return {
          success: false,
          message: 'Email already registered',
        };
      }

      // Check for recent OTP attempts (rate limiting)
      const recentOTP = await this.prisma.oTP.findFirst({
        where: {
          email,
          createdAt: {
            gte: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes
          },
        },
      });

      if (recentOTP && recentOTP.attempts >= 3) {
        return {
          success: false,
          message: 'Too many attempts. Please wait 2 minutes.',
        };
      }

      // Generate and hash OTP
      const otp = this.generateOTP();
      const otpHash = await bcrypt.hash(otp, 10);

      // Save OTP to database
      await this.prisma.oTP.create({
        data: {
          email,
          otpHash,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        },
      });

      // Send email
      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: '🎯 HACK-THE-BOX: Your OTP Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fff; padding: 30px; border-radius: 10px;">
            <h1 style="color: #00ff41; text-align: center;">🔐 Operation Cipher Strike</h1>
            <h2 style="text-align: center; color: #fff;">Your OTP Code</h2>
            <div style="background: #1a1a1a; border: 2px solid #00ff41; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <p style="font-size: 16px; color: #aaa; margin-bottom: 10px;">Your verification code:</p>
              <h1 style="font-size: 48px; letter-spacing: 10px; color: #00ff41; margin: 10px 0;">${otp}</h1>
            </div>
            <p style="color: #ccc; line-height: 1.6;">
              <strong>MISSION BRIEFING:</strong><br>
              You've been recruited for Operation Cipher Strike - an elite cybersecurity competition.<br><br>
              <strong>⏱️ Code expires in:</strong> 10 minutes<br>
              <strong>🔒 Max attempts:</strong> 3<br><br>
              Enter this code to complete your registration and join the fight against CipherMaster!
            </p>
            <div style="border-top: 1px solid #333; margin-top: 20px; padding-top: 20px; text-align: center; color: #666; font-size: 12px;">
              <p>🚨 If you didn't request this code, please ignore this email.</p>
              <p>CERT-In Tamil Nadu Division | Coimbatore Tech Hub</p>
            </div>
          </div>
        `,
      });

      return {
        success: true,
        message: 'OTP sent successfully',
      };
    } catch (error) {
      console.error('OTP Send Error:', error);
      return {
        success: false,
        message: 'Failed to send OTP',
      };
    }
  }

  // Verify OTP
  async verifyOTP(
    email: string,
    otp: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Find latest OTP for email
      const otpRecord = await this.prisma.oTP.findFirst({
        where: {
          email,
          isVerified: false,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!otpRecord) {
        return {
          success: false,
          message: 'No OTP found. Please request a new one.',
        };
      }

      // Check expiry
      if (new Date() > otpRecord.expiresAt) {
        return {
          success: false,
          message: 'OTP expired. Please request a new one.',
        };
      }

      // Check attempts
      if (otpRecord.attempts >= 3) {
        return {
          success: false,
          message: 'Maximum attempts exceeded. Request a new OTP.',
        };
      }

      // Verify OTP
      const isValid = await bcrypt.compare(otp, otpRecord.otpHash);

      if (!isValid) {
        // Increment attempts
        await this.prisma.oTP.update({
          where: { id: otpRecord.id },
          data: {
            attempts: otpRecord.attempts + 1,
          },
        });

        return {
          success: false,
          message: `Invalid OTP. ${2 - otpRecord.attempts} attempts remaining.`,
        };
      }

      // Mark as verified
      await this.prisma.oTP.update({
        where: { id: otpRecord.id },
        data: {
          isVerified: true,
        },
      });

      return {
        success: true,
        message: 'OTP verified successfully',
      };
    } catch (error) {
      console.error('OTP Verify Error:', error);
      return {
        success: false,
        message: 'Verification failed',
      };
    }
  }
}
