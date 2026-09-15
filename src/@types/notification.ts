/** In-app notifications. Mirrors baliye-node models/notification.ts. */

export interface AppNotification {
  _id: string;
  event: string;
  channel: string;
  status: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationFeed {
  items: AppNotification[];
  unread: number;
}
