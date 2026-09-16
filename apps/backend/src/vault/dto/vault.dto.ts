import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class VerifyVaultLayerDto {
  @IsIn([1, 2, 3, 4, 5])
  layer: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  value: string;
}
