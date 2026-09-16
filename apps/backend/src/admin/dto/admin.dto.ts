import { IsNotEmpty, IsString, IsNumber, IsEnum, IsOptional, IsBoolean, Matches } from 'class-validator';
import { RoundType, RoundStatus } from '@prisma/client';

// "algo:template" — algo is md5|sha1|sha256, template may use {team} and {size}
const TEAM_FLAG_TEMPLATE_PATTERN = /^(md5|sha1|sha256):.+$/;

export class CreateRoundDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(RoundType)
  type: RoundType;

  @IsNumber()
  order: number;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateRoundStatusDto {
  @IsEnum(RoundStatus)
  status: RoundStatus;
}

export class CreateChallengeDto {
  @IsString()
  @IsNotEmpty()
  roundId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  points: number;

  @IsString()
  @IsNotEmpty()
  flag: string;

  @IsNumber()
  order: number;

  @IsNumber()
  @IsOptional()
  maxAttempts?: number;

  @IsString()
  @IsOptional()
  hints?: string;

  @IsNumber()
  @IsOptional()
  hintPenalty?: number;

  @IsString()
  @IsOptional()
  difficulty?: string;

  @IsString()
  @IsOptional()
  storyContext?: string;

  @IsString()
  @IsOptional()
  characterMessage?: string;

  // Only for challenges whose flag depends on the solving team's identity.
  // Leave unset for a normal fixed-flag challenge.
  @IsString()
  @IsOptional()
  @Matches(TEAM_FLAG_TEMPLATE_PATTERN, {
    message: 'teamFlagTemplate must look like "md5:{team}|{size}|..." (algo: md5, sha1, or sha256)',
  })
  teamFlagTemplate?: string;
}

export class UpdateChallengeDto {
  @IsString()
  @IsOptional()
  roundId?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  storyContext?: string;

  @IsString()
  @IsOptional()
  characterMessage?: string;

  @IsNumber()
  @IsOptional()
  points?: number;

  // A new plaintext answer. Re-hashed server-side into flagHash — never
  // stored or echoed back in plaintext.
  @IsString()
  @IsOptional()
  flag?: string;

  @IsString()
  @IsOptional()
  @Matches(TEAM_FLAG_TEMPLATE_PATTERN, {
    message: 'teamFlagTemplate must look like "md5:{team}|{size}|..." (algo: md5, sha1, or sha256)',
  })
  teamFlagTemplate?: string;

  @IsNumber()
  @IsOptional()
  hintPenalty?: number;

  @IsString()
  @IsOptional()
  difficulty?: string;

  @IsString()
  @IsOptional()
  hints?: string;

  @IsNumber()
  @IsOptional()
  maxAttempts?: number;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
