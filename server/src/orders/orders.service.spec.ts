import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { OrderEntity } from '../database/entities/order.entity';
import { OrderItemEntity } from '../database/entities/order-item.entity';
import { ProductEntity } from '../database/entities/product.entity';

const mockOrder = (overrides: Partial<OrderEntity> = {}): OrderEntity => ({
  id: 'order-uuid-1',
  orderNumber: 'EPD-20260101-1234',
  clientId: 'client-uuid-1',
  commercialId: null,
  status: 'pending',
  paymentMethod: 'deferred',
  subtotal: 100,
  total: 100,
  notes: null,
  sageOrderRef: null,
  items: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const mockProduct = (): ProductEntity =>
  ({
    id: 'product-uuid-1',
    sageRef: 'REF-001',
    name: 'Câble 2.5mm²',
    publicPrice: 10,
    isActive: true,
  }) as ProductEntity;

function makeRepo(overrides: Partial<Record<string, jest.Mock>> = {}) {
  return {
    findOne: jest.fn(),
    find: jest.fn(),
    findByIds: jest.fn(),
    save: jest.fn((e) => Promise.resolve(e)),
    count: jest.fn(),
    ...overrides,
  };
}

describe('OrdersService', () => {
  let service: OrdersService;
  let ordersRepo: ReturnType<typeof makeRepo>;
  let productsRepo: ReturnType<typeof makeRepo>;

  beforeEach(async () => {
    ordersRepo = makeRepo();
    productsRepo = makeRepo();
    const itemsRepo = makeRepo();

    const module = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(OrderEntity), useValue: ordersRepo },
        { provide: getRepositoryToken(OrderItemEntity), useValue: itemsRepo },
        { provide: getRepositoryToken(ProductEntity), useValue: productsRepo },
      ],
    }).compile();

    service = module.get(OrdersService);
  });

  describe('createOrder', () => {
    it('throws BadRequestException when items array is empty', async () => {
      await expect(
        service.createOrder('client-1', {
          items: [],
          paymentMethod: 'deferred',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException when product does not exist', async () => {
      productsRepo.findByIds.mockResolvedValue([]);
      await expect(
        service.createOrder('client-1', {
          items: [{ productId: 'missing-id', quantity: 1 }],
          paymentMethod: 'deferred',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('creates order and computes total from product price', async () => {
      const product = mockProduct();
      productsRepo.findByIds.mockResolvedValue([product]);
      ordersRepo.save.mockImplementation((o: OrderEntity) =>
        Promise.resolve(o),
      );

      const result = await service.createOrder('client-1', {
        items: [{ productId: product.id, quantity: 3 }],
        paymentMethod: 'deferred',
      });

      expect(result.total).toBe(30);
      expect(result.clientId).toBe('client-1');
      expect(result.status).toBe('pending');
    });
  });

  describe('cancelOrder', () => {
    it('cancels a pending order', async () => {
      const order = mockOrder({ status: 'pending' });
      ordersRepo.findOne.mockResolvedValue(order);

      const result = await service.cancelOrder(order.id, order.clientId);
      expect(result.status).toBe('cancelled');
    });

    it('throws BadRequestException when cancelling a delivered order', async () => {
      const order = mockOrder({ status: 'delivered' });
      ordersRepo.findOne.mockResolvedValue(order);

      await expect(
        service.cancelOrder(order.id, order.clientId),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws ForbiddenException when client does not own the order', async () => {
      const order = mockOrder({ clientId: 'owner-uuid' });
      ordersRepo.findOne.mockResolvedValue(order);

      await expect(
        service.cancelOrder(order.id, 'other-client'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateStatus', () => {
    it.each([
      ['pending', 'confirmed'],
      ['confirmed', 'shipped'],
      ['shipped', 'delivered'],
    ] as const)('allows transition %s → %s', async (from, to) => {
      const order = mockOrder({ status: from });
      ordersRepo.findOne.mockResolvedValue(order);

      const result = await service.updateStatus(order.id, to);
      expect(result.status).toBe(to);
    });

    it('throws BadRequestException on invalid transition pending → delivered', async () => {
      const order = mockOrder({ status: 'pending' });
      ordersRepo.findOne.mockResolvedValue(order);

      await expect(service.updateStatus(order.id, 'delivered')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException on transition from delivered (terminal)', async () => {
      const order = mockOrder({ status: 'delivered' });
      ordersRepo.findOne.mockResolvedValue(order);

      await expect(service.updateStatus(order.id, 'shipped')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws NotFoundException when order does not exist', async () => {
      ordersRepo.findOne.mockResolvedValue(null);

      await expect(
        service.updateStatus('ghost-id', 'confirmed'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
