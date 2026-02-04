import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OTPService } from './otp.service';
import { JwtStrategy } from './jwt.strategy';
import { RegistrationService } from '../teams/registration.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET') || 'your-secret-key',
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN') || '24h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, OTPService, RegistrationService, JwtStrategy],
  exports: [AuthService, OTPService, RegistrationService],
})
export class AuthModule {}
