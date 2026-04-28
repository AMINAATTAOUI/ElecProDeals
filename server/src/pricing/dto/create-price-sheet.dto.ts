import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsArray,
  ValidateNested,
  IsNumber,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { CustomerType } from '../../types/user.types';
import type { PricingRuleOperator } from '../../types/pricing.types';

class CreatePricingRuleDto {
  @IsEnum(['multiply', 'add', 'subtract', 'fixed'])
  operator!: PricingRuleOperator;

  @IsNumber()
  value!: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class CreatePriceSheetDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsEnum(['artisan', 'large_installer', 'wholesaler'])
  appliesTo?: CustomerType;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePricingRuleDto)
  rules?: CreatePricingRuleDto[];
}

export class UpdatePriceSheetDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  appliesTo?: CustomerType | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePricingRuleDto)
  rules?: CreatePricingRuleDto[];
}
