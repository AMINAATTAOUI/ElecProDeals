import { IsNotEmpty, MinLength } from 'class-validator';

export class RefreshTokenDto {
  @IsNotEmpty()
  @MinLength(10)
  refreshToken!: string;
}
