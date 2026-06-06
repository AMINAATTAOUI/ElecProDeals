import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import type { OrderEntity } from './order.entity';

@Entity('order_items')
export class OrderItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'order_id' })
  orderId!: string;

  @ManyToOne('OrderEntity', 'items', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order!: OrderEntity;

  @Column({ name: 'product_id', type: 'varchar', length: 36 })
  productId!: string;

  @Column({ name: 'product_ref', length: 100 })
  productRef!: string;

  @Column({ name: 'product_name', length: 255 })
  productName!: string;

  @Column({ type: 'smallint' })
  quantity!: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
  unitPrice!: number;

  @Column({ name: 'line_total', type: 'decimal', precision: 10, scale: 2 })
  lineTotal!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
