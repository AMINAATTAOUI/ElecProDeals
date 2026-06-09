import { ForbiddenException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { UserEntity } from '../database/entities/user.entity';

const mockUser = (role = 'client'): Partial<UserEntity> => ({
  id: 'user-uuid-1',
  email: 'client@demo.fr',
  role: role as UserEntity['role'],
  firstName: 'Jean',
  lastName: 'Dupont',
  companyName: 'Elec SARL',
  isActive: true,
  pricingSheetId: null,
  assignedCommercialId: null,
});

const mockUsersService = {
  findAll: jest.fn().mockResolvedValue([mockUser()]),
  update: jest.fn().mockImplementation((id: string, dto: object) =>
    Promise.resolve({ ...mockUser(), ...dto }),
  ),
  deleteUser: jest.fn().mockResolvedValue({ deleted: true }),
  exportUserData: jest.fn().mockResolvedValue({
    profile: mockUser(),
    orders: [],
    exportedAt: new Date().toISOString(),
  }),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(UsersController);
  });

  it('findAll returns list of users', async () => {
    const result = await controller.findAll();
    expect(result).toHaveLength(1);
    expect(mockUsersService.findAll).toHaveBeenCalled();
  });

  it('update delegates to service', async () => {
    const result = await controller.update('user-uuid-1', { isActive: false });
    expect(mockUsersService.update).toHaveBeenCalledWith('user-uuid-1', { isActive: false });
    expect(result).toMatchObject({ isActive: false });
  });

  it('deleteUser delegates to service', async () => {
    const result = await controller.deleteUser('user-uuid-1');
    expect(result).toEqual({ deleted: true });
  });

  it('exportData grants access to own account', async () => {
    const req = { user: { id: 'user-uuid-1', role: 'client' } };
    const result = await controller.exportData('user-uuid-1', req);
    expect(result).toHaveProperty('profile');
    expect(result).toHaveProperty('orders');
    expect(result).toHaveProperty('exportedAt');
  });

  it('exportData throws ForbiddenException when client accesses another account', () => {
    const req = { user: { id: 'other-uuid', role: 'client' } };
    expect(() => controller.exportData('user-uuid-1', req)).toThrow(ForbiddenException);
  });

  it('exportData allows admin to access any account', async () => {
    const req = { user: { id: 'admin-uuid', role: 'admin' } };
    const result = await controller.exportData('user-uuid-1', req);
    expect(result).toHaveProperty('profile');
  });
});
