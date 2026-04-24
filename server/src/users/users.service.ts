import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../database/entities/user.entity';

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

  toPublicProfile(user: UserEntity): Omit<UserEntity, 'passwordHash'> {
    const { passwordHash: _, ...profile } = user;
    return profile;
  }
}
