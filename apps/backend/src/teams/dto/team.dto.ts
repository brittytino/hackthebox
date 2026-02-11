import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  member1Name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  member2Name: string;
}

export class JoinTeamDto {
  @IsString()
  @IsNotEmpty()
  teamId: string;
}
