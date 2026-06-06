import { api } from './api';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  targetClientId: string | null;
  sentById: string;
  status: 'sent' | 'failed';
  sentAt: string;
}

export const notificationsService = {
  async getNotifications(): Promise<AppNotification[]> {
    const { data } = await api.get<AppNotification[]>('/notifications');
    return data;
  },
};
