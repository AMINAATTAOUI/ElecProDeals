import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../types/user.types';
import type { OrderStatus } from '../types/order.types';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.createOrder(user.sub, dto);
  }

  @Get()
  async getMyOrders(@CurrentUser() user: JwtPayload) {
    if (user.role === 'admin' || user.role === 'commercial') {
      return this.ordersService.findAll();
    }
    return this.ordersService.findAllByClient(user.sub);
  }

  @Get(':id')
  async getOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const clientId = user.role === 'client' ? user.sub : undefined;
    return this.ordersService.findOne(id, clientId);
  }

  @Patch(':id/cancel')
  async cancelOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.ordersService.cancelOrder(id, user.sub);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: JwtPayload,
  ) {
    if (user.role !== 'admin' && user.role !== 'commercial') {
      throw new ForbiddenException('Insufficient permissions');
    }
    return this.ordersService.updateStatus(id, dto.status as OrderStatus);
  }
}
