import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SageService } from './sage.service';
import { ProductEntity } from '../database/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity])],
  providers: [SageService],
  exports: [SageService],
})
export class SageModule {}
