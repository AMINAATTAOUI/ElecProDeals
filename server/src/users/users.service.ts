import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../database/entities/user.entity';
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

  async update(id: string, dto: UpdateUserDto): Promise<Omit<UserEntity, 'passwordHash'>> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);

    if (dto.pricingSheetId !== undefined) user.pricingSheetId = dto.pricingSheetId ?? null;
    if (dto.isActive !== undefined) user.isActive = dto.isActive;
    if (dto.isPaymentDeferred !== undefined) user.isPaymentDeferred = dto.isPaymentDeferred;
    if (dto.assignedCommercialId !== undefined) user.assignedCommercialId = dto.assignedCommercialId ?? null;

    await this.usersRepo.save(user);
    return this.toPublicProfile(user);
  }

  toPublicProfile(user: UserEntity): Omit<UserEntity, 'passwordHash'> {
    const { passwordHash: _, ...profile } = user;
    return profile;
  }
}
