import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import type { NotificationStatus } from '../../types/notification.types';

@Entity('notifications')
export class NotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 255 })
  title!: string;

  @Column({ type: 'text' })
  body!: string;

  @Column({ name: 'target_client_id', type: 'uuid', nullable: true })
  targetClientId!: string | null;

  @Column({ name: 'sent_by_id', type: 'uuid' })
  sentById!: string;

  @Column({ type: 'varchar', length: 20, default: 'sent' })
  status!: NotificationStatus;

  @CreateDateColumn({ name: 'sent_at' })
  sentAt!: Date;
}
