import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SubmitChallengeFlagDto {
  @IsString()
  @IsNotEmpty()
  challengeId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  flag: string;
}
