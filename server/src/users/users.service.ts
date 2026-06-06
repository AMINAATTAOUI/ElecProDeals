import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../database/entities/user.entity';
import { OrderEntity } from '../database/entities/order.entity';
import { NotificationEntity } from '../database/entities/notification.entity';
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

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
    @InjectRepository(OrderEntity)
    private readonly ordersRepo: Repository<OrderEntity>,
    @InjectRepository(NotificationEntity)
    private readonly notificationsRepo: Repository<NotificationEntity>,
  ) {}

  async findAll(): Promise<Omit<UserEntity, 'passwordHash'>[]> {
    const users = await this.usersRepo.find({ order: { createdAt: 'DESC' } });
    return users.map((u) => this.toPublicProfile(u));
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.usersRepo.findOne({
      where: { email: email.toLowerCase().trim(), isActive: true },
    });
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.usersRepo.findOne({ where: { id } });
  }

  async update(
    id: string,
    dto: UpdateUserDto,
  ): Promise<Omit<UserEntity, 'passwordHash'>> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);

    if (dto.pricingSheetId !== undefined)
      user.pricingSheetId = dto.pricingSheetId ?? null;
    if (dto.isActive !== undefined) user.isActive = dto.isActive;
    if (dto.isPaymentDeferred !== undefined)
      user.isPaymentDeferred = dto.isPaymentDeferred;
    if (dto.assignedCommercialId !== undefined)
      user.assignedCommercialId = dto.assignedCommercialId ?? null;

    await this.usersRepo.save(user);
    return this.toPublicProfile(user);
  }

  async deleteUser(id: string): Promise<{ deleted: true }> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    // RGPD — hard delete: supprimer toutes les données personnelles liées
    await this.notificationsRepo.delete({ sentById: id });
    await this.notificationsRepo.delete({ targetClientId: id });
    await this.ordersRepo.delete({ clientId: id });
    await this.usersRepo.delete({ id });
    return { deleted: true };
  }

  async exportUserData(id: string): Promise<object> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    const orders = await this.ordersRepo.find({ where: { clientId: id } });
    const { passwordHash: _passwordHash, ...profile } = user;
    return { profile, orders, exportedAt: new Date().toISOString() };
  }

  toPublicProfile(user: UserEntity): Omit<UserEntity, 'passwordHash'> {
    const { passwordHash: _passwordHash, ...profile } = user;
    return profile;
  }
}
