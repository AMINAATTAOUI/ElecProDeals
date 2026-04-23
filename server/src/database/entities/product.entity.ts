import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { StockStatus } from '../../types/product.types';

@Entity('products')
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'sage_ref', unique: true, length: 100 })
  sageRef!: string;

  @Column({ length: 255 })
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ length: 100 })
  category!: string;

  @Column({ name: 'public_price', type: 'decimal', precision: 10, scale: 2 })
  publicPrice!: number;

  @Column({ length: 50 })
  unit!: string;

  @Column({ name: 'stock_status', type: 'varchar', length: 20, default: 'available' })
  stockStatus!: StockStatus;

  @Column({ name: 'estimated_delivery_days', type: 'smallint', nullable: true })
  estimatedDeliveryDays!: number | null;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
