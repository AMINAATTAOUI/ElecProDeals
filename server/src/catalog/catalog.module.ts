import { Module } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { CatalogController } from './catalog.controller';
import { SageModule } from '../sage/sage.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [SageModule, UsersModule],
  controllers: [CatalogController],
  providers: [CatalogService],
})
export class CatalogModule {}

