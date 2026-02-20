import { IsNotEmpty, IsString, IsNumber, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { RoundType, RoundStatus } from '@prisma/client';

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
}

export class UpdateChallengeDto {
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

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
