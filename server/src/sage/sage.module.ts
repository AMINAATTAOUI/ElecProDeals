import { Module } from '@nestjs/common';
import { SageService } from './sage.service';

@Module({
  providers: [SageService],
  exports: [SageService],
})
export class SageModule {}

