import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserEntity } from '../database/entities/user.entity';
import { OrderEntity } from '../database/entities/order.entity';
import { NotificationEntity } from '../database/entities/notification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, OrderEntity, NotificationEntity]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
