import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { OrderStatus, PaymentMethod } from '../../types/order.types';
import { OrderItemEntity } from './order-item.entity';

@Entity('orders')
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'order_number', unique: true, length: 30 })
  orderNumber!: string;

  @Column({ name: 'client_id', type: 'varchar', length: 36 })
  clientId!: string;

  @Column({ name: 'commercial_id', type: 'varchar', length: 36, nullable: true })
  commercialId!: string | null;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status!: OrderStatus;

  @Column({ name: 'payment_method', type: 'varchar', length: 20 })
  paymentMethod!: PaymentMethod;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total!: number;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ name: 'sage_order_ref', type: 'varchar', length: 100, nullable: true })
  sageOrderRef!: string | null;

  @OneToMany(() => OrderItemEntity, (item) => item.order, {
    cascade: true,
    eager: true,
  })
  items!: OrderItemEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
