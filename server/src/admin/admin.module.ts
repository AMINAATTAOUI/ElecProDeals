import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from '../database/entities/order.entity';
import { UserEntity } from '../database/entities/user.entity';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity, UserEntity])],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
