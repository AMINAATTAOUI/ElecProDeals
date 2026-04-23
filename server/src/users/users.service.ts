import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import type { User, ClientUser, CommercialUser, AdminUser } from '../types/user.types';

/**
 * UsersService — POC with mock data.
 * Replace with TypeORM/PostgreSQL implementation in production.
 */
@Injectable()
export class UsersService {
  private readonly users: User[] = [
    {
      id: 'user-client-001',
      email: 'client@demo.fr',
      passwordHash: bcrypt.hashSync('password123', 10),
      role: 'client',
      firstName: 'Jean',
      lastName: 'Martin',
      companyName: 'Martin Électricité SARL',
      siret: '12345678901234',
      isActive: true,
      customerType: 'artisan',
      pricingSheetId: 'sheet-artisan-standard',
      isPaymentDeferred: false,
      assignedCommercialId: 'user-commercial-001',
      createdAt: new Date('2026-01-15'),
    } as ClientUser,
    {
      id: 'user-client-002',
      email: 'gros-installateur@demo.fr',
      passwordHash: bcrypt.hashSync('password123', 10),
      role: 'client',
      firstName: 'Sophie',
      lastName: 'Bernard',
      companyName: 'BTP Électrique Nord SAS',
      siret: '98765432109876',
      isActive: true,
      customerType: 'large_installer',
      pricingSheetId: 'sheet-large-installer',
      isPaymentDeferred: true,
      assignedCommercialId: 'user-commercial-001',
      createdAt: new Date('2026-01-20'),
    } as ClientUser,
    {
      id: 'user-commercial-001',
      email: 'commercial@demo.fr',
      passwordHash: bcrypt.hashSync('password123', 10),
      role: 'commercial',
      firstName: 'Marie',
      lastName: 'Dupont',
      companyName: 'ElecProDeals',
      siret: '11111111111111',
      isActive: true,
      assignedClientIds: ['user-client-001', 'user-client-002'],
      createdAt: new Date('2025-12-01'),
    } as CommercialUser,
    {
      id: 'user-admin-001',
      email: 'admin@demo.fr',
      passwordHash: bcrypt.hashSync('password123', 10),
      role: 'admin',
      firstName: 'Admin',
      lastName: 'Système',
      companyName: 'ElecProDeals',
      siret: '00000000000000',
      isActive: true,
      createdAt: new Date('2025-11-01'),
    } as AdminUser,
  ];

  findByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email === email.toLowerCase().trim());
  }

  findById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  toPublicProfile(user: User): Omit<User, 'passwordHash'> {
    const { passwordHash: _, ...profile } = user;
    return profile;
  }
}
