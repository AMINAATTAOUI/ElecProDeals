import { IsOptional, IsString, IsBoolean, IsUUID } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsUUID()
  pricingSheetId?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isPaymentDeferred?: boolean;

  @IsOptional()
  @IsString()
  assignedCommercialId?: string | null;
}
