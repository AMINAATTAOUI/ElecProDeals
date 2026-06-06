import { IsString, IsNotEmpty, IsUUID, IsOptional, MaxLength } from 'class-validator';

export class SendNotificationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @IsString()
  @IsNotEmpty()
  body!: string;

  @IsOptional()
  @IsUUID()
  targetClientId?: string | null;
}
