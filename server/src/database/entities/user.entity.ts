import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { UserRole, CustomerType } from '../../types/user.types';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, length: 255 })
  email!: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash!: string;

  @Column({ type: 'varchar', length: 20 })
  role!: UserRole;

  @Column({ name: 'first_name', length: 100 })
  firstName!: string;

  @Column({ name: 'last_name', length: 100 })
  lastName!: string;

  @Column({ name: 'company_name', length: 255 })
  companyName!: string;

  @Column({ length: 14 })
  siret!: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  // Client-specific fields (nullable for non-client roles)
  @Column({
    name: 'customer_type',
    type: 'varchar',
    length: 30,
    nullable: true,
  })
  customerType!: CustomerType | null;

  @Column({
    name: 'pricing_sheet_id',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  pricingSheetId!: string | null;

  @Column({ name: 'is_payment_deferred', default: false })
  isPaymentDeferred!: boolean;

  @Column({
    name: 'assigned_commercial_id',
    type: 'varchar',
    length: 36,
    nullable: true,
  })
  assignedCommercialId!: string | null;

  // Commercial-specific fields
  @Column({ name: 'assigned_client_ids', type: 'simple-array', nullable: true })
  assignedClientIds!: string[] | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
