import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from '../database/entities/order.entity';
import { OrderItemEntity } from '../database/entities/order-item.entity';
import { ProductEntity } from '../database/entities/product.entity';
import type { OrderStatus } from '../types/order.types';
import type { CreateOrderDto } from './dto/order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly ordersRepository: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemsRepository: Repository<OrderItemEntity>,
    @InjectRepository(ProductEntity)
    private readonly productsRepository: Repository<ProductEntity>,
  ) {}

  private generateOrderNumber(): string {
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const random = Math.floor(1000 + Math.random() * 9000);
    return `EPD-${dateStr}-${random}`;
  }

  async createOrder(
    clientId: string,
    dto: CreateOrderDto,
  ): Promise<OrderEntity> {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    const productIds = dto.items.map((i) => i.productId);
    const products = await this.productsRepository.findByIds(productIds);

    if (products.length !== productIds.length) {
      const foundIds = products.map((p) => p.id);
      const missing = productIds.find((id) => !foundIds.includes(id));
      throw new NotFoundException(`Product not found: ${missing}`);
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    const items: OrderItemEntity[] = dto.items.map((itemDto) => {
      const product = productMap.get(itemDto.productId)!;
      const unitPrice = Number(product.publicPrice);
      const lineTotal = unitPrice * itemDto.quantity;

      const item = new OrderItemEntity();
      item.productId = product.id;
      item.productRef = product.sageRef;
      item.productName = product.name;
      item.quantity = itemDto.quantity;
      item.unitPrice = unitPrice;
      item.lineTotal = lineTotal;
      return item;
    });

    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

    const order = new OrderEntity();
    order.orderNumber = this.generateOrderNumber();
    order.clientId = clientId;
    order.commercialId = null;
    order.status = 'pending';
    order.paymentMethod = dto.paymentMethod;
    order.subtotal = subtotal;
    order.total = subtotal;
    order.notes = dto.notes ?? null;
    order.sageOrderRef = null;
    order.items = items;

    return this.ordersRepository.save(order);
  }

  async findAllByClient(clientId: string): Promise<OrderEntity[]> {
    return this.ordersRepository.find({
      where: { clientId },
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(): Promise<OrderEntity[]> {
    return this.ordersRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string, clientId?: string): Promise<OrderEntity> {
    const order = await this.ordersRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    if (clientId && order.clientId !== clientId) {
      throw new ForbiddenException('Access denied');
    }
    return order;
  }

  async cancelOrder(id: string, clientId: string): Promise<OrderEntity> {
    const order = await this.findOne(id, clientId);
    if (!['pending', 'confirmed'].includes(order.status)) {
      throw new BadRequestException(
        `Cannot cancel order with status: ${order.status}`,
      );
    }
    order.status = 'cancelled';
    return this.ordersRepository.save(order);
  }

  async updateStatus(id: string, status: OrderStatus): Promise<OrderEntity> {
    const VALID_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
      pending: ['confirmed'],
      confirmed: ['shipped'],
      shipped: ['delivered'],
    };

    const order = await this.findOne(id);
    const allowed = VALID_TRANSITIONS[order.status];

    if (!allowed || !allowed.includes(status)) {
      throw new BadRequestException(
        `Cannot transition order from '${order.status}' to '${status}'`,
      );
    }

    order.status = status;
    return this.ordersRepository.save(order);
  }
}
