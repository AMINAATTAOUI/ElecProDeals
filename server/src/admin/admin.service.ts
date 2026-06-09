import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from '../database/entities/order.entity';
import { UserEntity } from '../database/entities/user.entity';

export interface DashboardStats {
  ordersToday: number;
  revenueThisMonth: number;
  activeClients: number;
  pendingOrders: number;
}

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly ordersRepo: Repository<OrderEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
  ) {}

  async getDashboardStats(): Promise<DashboardStats> {
    const [ordersToday, revenueResult, activeClients, pendingOrders] =
      await Promise.all([
        this.ordersRepo
          .createQueryBuilder('o')
          .where('DATE(o.created_at) = CURRENT_DATE')
          .getCount(),

        // TODO: logique CA à confirmer avec le client
        // Actuellement : toutes commandes sauf cancelled
        // Option A (actuel) : pending + confirmed + shipped + delivered
        // Option B : delivered uniquement (CA réalisé)
        // Décision en attente feedback client
        this.ordersRepo
          .createQueryBuilder('o')
          .select('COALESCE(SUM(o.total), 0)', 'revenue')
          .where(
            'EXTRACT(YEAR FROM o.created_at) = EXTRACT(YEAR FROM NOW()) AND EXTRACT(MONTH FROM o.created_at) = EXTRACT(MONTH FROM NOW())',
          )
          .andWhere("o.status NOT IN ('cancelled')")
          .getRawOne<{ revenue: string }>(),

        this.usersRepo.count({
          where: { role: 'client' as const, isActive: true },
        }),

        this.ordersRepo.count({
          where: [{ status: 'pending' }, { status: 'confirmed' }],
        }),
      ]);

    return {
      ordersToday,
      revenueThisMonth: parseFloat(revenueResult?.revenue ?? '0'),
      activeClients,
      pendingOrders,
    };
  }
}
