export type NotificationStatus = 'sent' | 'failed';

export interface Notification {
  id: string;
  title: string;
  body: string;
  targetClientId: string | null;
  sentById: string;
  status: NotificationStatus;
  sentAt: Date;
}

export interface SendNotificationDto {
  title: string;
  body: string;
  targetClientId?: string | null;
}
