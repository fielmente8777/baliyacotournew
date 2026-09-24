/** In-app notifications. Mirrors baliye-node models/notification.ts. */

export interface AppNotification {
  _id: string;
  event: string;
  channel: string;
  status: string;
  title: string;
  message: string;
  isRead: boolean;
  /** Extra context from the event, e.g. which order it's about. */
  meta?: { orderId?: string; status?: string; [key: string]: unknown };
  createdAt: string;
}

export interface NotificationFeed {
  items: AppNotification[];
  unread: number;
}
