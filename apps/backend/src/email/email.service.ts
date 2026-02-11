import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendOTP(email: string, otp: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.configService.get('SMTP_FROM', 'noreply@hackthebox.com'),
        to: email,
        subject: '🔐 Operation Cipher Strike - Your OTP Code',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
                padding: 20px;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background: rgba(255,255,255,0.05);
                border-radius: 15px;
                padding: 40px;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.1);
              }
              .header {
                text-align: center;
                color: #00ff88;
                font-size: 28px;
                font-weight: bold;
                margin-bottom: 20px;
                text-shadow: 0 0 10px rgba(0,255,136,0.5);
              }
              .subtitle {
                color: #ffffff;
                text-align: center;
                font-size: 16px;
                margin-bottom: 30px;
                opacity: 0.9;
              }
              .otp-box {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 30px;
                border-radius: 10px;
                text-align: center;
                margin: 30px 0;
                box-shadow: 0 10px 40px rgba(0,0,0,0.4);
              }
              .otp-code {
                font-size: 48px;
                font-weight: bold;
                color: #ffffff;
                letter-spacing: 8px;
                text-shadow: 0 0 20px rgba(255,255,255,0.5);
              }
              .message {
                color: #ffffff;
                line-height: 1.6;
                margin: 20px 0;
                opacity: 0.9;
              }
              .warning {
                background: rgba(255,59,48,0.1);
                border-left: 4px solid #ff3b30;
                padding: 15px;
                margin: 20px 0;
                color: #ff6b6b;
                border-radius: 5px;
              }
              .mission-brief {
                background: rgba(0,255,136,0.1);
                border-left: 4px solid #00ff88;
                padding: 15px;
                margin: 20px 0;
                color: #00ff88;
                border-radius: 5px;
              }
              .footer {
                text-align: center;
                color: #888;
                font-size: 12px;
                margin-top: 30px;
                border-top: 1px solid rgba(255,255,255,0.1);
                padding-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                🎯 OPERATION CIPHER STRIKE
              </div>
              <div class="subtitle">
                CERT-In Tamil Nadu Division<br>
                Security Clearance Required
              </div>
              
              <div class="message">
                <strong>Agent,</strong><br><br>
                Your security clearance code has been generated. Use this 6-digit OTP to complete your registration for <strong>Operation Cipher Strike</strong>.
              </div>
              
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
              </div>
              
              <div class="warning">
                ⚠️ <strong>SECURITY NOTICE:</strong><br>
                • This code expires in <strong>10 minutes</strong><br>
                • Maximum 3 verification attempts allowed<br>
                • Do not share this code with anyone
              </div>
              
              <div class="mission-brief">
                📋 <strong>MISSION BRIEFING:</strong><br>
                <em>"February 14, 2026, 23:59:59 IST. Saravana Subramanian's Operation BLACKOUT threatens 50,000+ tech employees. Veera Raghavan needs your cyber skills. Time is running out."</em>
              </div>
              
              <div class="footer">
                Coimbatore Tech Hub | February 1, 2026<br>
                If you didn't request this code, please ignore this email.<br>
                <strong>Operation Cipher Strike</strong> - Hack The Box 2026
              </div>
            </div>
          </body>
          </html>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`OTP sent successfully to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send OTP to ${email}:`, error);
      return false;
    }
  }

  async sendWelcomeEmail(
    email: string,
    teamName: string,
    member1: string,
    member2: string,
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.configService.get('SMTP_FROM', 'noreply@hackthebox.com'),
        to: email,
        subject: '🎖️ Welcome to Operation Cipher Strike!',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
                padding: 20px;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background: rgba(255,255,255,0.05);
                border-radius: 15px;
                padding: 40px;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.1);
              }
              .header {
                text-align: center;
                color: #00ff88;
                font-size: 28px;
                font-weight: bold;
                margin-bottom: 20px;
              }
              .team-info {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 25px;
                border-radius: 10px;
                margin: 25px 0;
                color: #ffffff;
              }
              .team-name {
                font-size: 24px;
                font-weight: bold;
                text-align: center;
                margin-bottom: 15px;
                text-shadow: 0 0 10px rgba(255,255,255,0.3);
              }
              .members {
                display: flex;
                justify-content: space-around;
                margin-top: 15px;
              }
              .member {
                text-align: center;
              }
              .briefing {
                background: rgba(0,255,136,0.1);
                border-left: 4px solid #00ff88;
                padding: 20px;
                margin: 20px 0;
                color: #ffffff;
                border-radius: 5px;
              }
              .message {
                color: #ffffff;
                line-height: 1.8;
                margin: 20px 0;
                opacity: 0.95;
              }
              .cta-button {
                background: linear-gradient(135deg, #00ff88, #00d4ff);
                color: #000;
                padding: 15px 40px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: bold;
                display: inline-block;
                margin: 20px auto;
                text-align: center;
                box-shadow: 0 5px 20px rgba(0,255,136,0.4);
              }
              .footer {
                text-align: center;
                color: #888;
                font-size: 12px;
                margin-top: 30px;
                border-top: 1px solid rgba(255,255,255,0.1);
                padding-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                ✅ REGISTRATION CONFIRMED
              </div>
              
              <div class="team-info">
                <div class="team-name">TEAM: ${teamName}</div>
                <div class="members">
                  <div class="member">
                    <div>👤 AGENT 1</div>
                    <div><strong>${member1}</strong></div>
                  </div>
                  <div class="member">
                    <div>👤 AGENT 2</div>
                    <div><strong>${member2}</strong></div>
                  </div>
                </div>
              </div>
              
              <div class="briefing">
                <strong>📋 MISSION BRIEFING</strong><br><br>
                <strong>Code Name:</strong> Operation Cipher Strike<br>
                <strong>Location:</strong> Coimbatore Tech Hub + CODISSIA Industrial Park<br>
                <strong>Threat Level:</strong> CRITICAL<br>
                <strong>Hostages:</strong> 1,200 civilians<br>
                <strong>Deadline:</strong> February 14, 2026, 23:59:59 IST<br><br>
                <strong>Objective:</strong> Help Veera Raghavan stop Saravana Subramanian's Operation BLACKOUT and save 50,000+ tech employees.
              </div>
              
              <div class="message">
                <strong>Welcome to the team, Agents.</strong><br><br>
                
                <em>"11 months ago, I captured a terrorist but lost a part of myself. Today, his brother has taken 1,200 people hostage in a shopping mall. They're inside. I'm inside. But I can't do this alone. I need cyber operatives who can think fast, decode faster, and stay calm under pressure. That's you."</em><br><br>
                
                <strong>— Veera Raghavan</strong><br>
                <em>Former RAW Field Agent | Operation Leader</em><br><br>
                
                You are now part of an elite cyber unit supporting Veera's ground operation. Every challenge you solve helps him rescue hostages and prevent a cyber attack that could cripple India's industrial software sector.<br><br>
                
                <strong>Your first mission begins when you enter the competition dashboard.</strong>
              </div>
              
              <div style="text-align: center;">
                <a href="${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}/dashboard" class="cta-button">
                  🚀 ENTER DASHBOARD
                </a>
              </div>
              
              <div class="footer">
                <strong>Event Details:</strong><br>
                Date: ${this.configService.get('EVENT_DATE', 'TBD')}<br>
                Structure: 3 Rounds × 3 Levels = 9 Challenges<br>
                Progression: Strictly Linear (no skipping)<br><br>
                <em>"Save the city. Stop Operation BLACKOUT. Give Veera his redemption."</em>
              </div>
            </div>
          </body>
          </html>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Welcome email sent to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}:`, error);
      return false;
    }
  }
}
