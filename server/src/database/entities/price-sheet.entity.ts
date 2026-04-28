import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PricingRuleEntity } from './pricing-rule.entity';
import type { CustomerType } from '../../types/user.types';

@Entity('price_sheets')
export class PriceSheetEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 255 })
  name!: string;

  /** null = feuille individuelle (assignée par client ID) */
  @Column({ name: 'applies_to', type: 'varchar', length: 30, nullable: true })
  appliesTo!: CustomerType | null;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @OneToMany(() => PricingRuleEntity, (rule) => rule.priceSheet, {
    cascade: true,
    eager: true,
  })
  rules!: PricingRuleEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
