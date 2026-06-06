import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PricingService } from './pricing.service';
import { PricingController } from './pricing.controller';
import { PriceSheetEntity } from '../database/entities/price-sheet.entity';
import { PricingRuleEntity } from '../database/entities/pricing-rule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PriceSheetEntity, PricingRuleEntity])],
  providers: [PricingService],
  controllers: [PricingController],
  exports: [PricingService],
})
export class PricingModule {}
