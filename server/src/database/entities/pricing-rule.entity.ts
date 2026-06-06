import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import type { PriceSheetEntity } from './price-sheet.entity';

export type PricingRuleOperator = 'multiply' | 'add' | 'subtract' | 'fixed';

@Entity('pricing_rules')
export class PricingRuleEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 20 })
  operator!: PricingRuleOperator;

  @Column({ type: 'decimal', precision: 12, scale: 4 })
  value!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description!: string | null;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder!: number;

  @ManyToOne('PriceSheetEntity', 'rules', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'price_sheet_id' })
  priceSheet!: PriceSheetEntity;
}
