import { Module } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { CatalogController } from './catalog.controller';
import { SageModule } from '../sage/sage.module';
import { UsersModule } from '../users/users.module';
import { PricingModule } from '../pricing/pricing.module';

@Module({
  imports: [SageModule, UsersModule, PricingModule],
  controllers: [CatalogController],
  providers: [CatalogService],
})
export class CatalogModule {}
