import { Injectable, Logger } from '@nestjs/common';
import {
  Notification,
  CreateNotificationDto,
} from './entities/notification.entity';

/**
 * NotificationService handles notification creation and retrieval.
 * Uses in-memory storage for demonstration (replace with TypeORM in production).
 */
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  /** In-memory notification store (replace with database in production) */
  private readonly notifications: Notification[] = [];

  /**
   * Create a new notification.
   */
  createNotification(dto: CreateNotificationDto): Notification {
    const notification: Notification = {
      id: this.generateId(),
      userId: dto.userId,
      type: dto.type,
      title: dto.title,
      message: dto.message,
      read: false,
      createdAt: new Date(),
    };

    this.notifications.push(notification);

    this.logger.log(
      `Notification created for user ${dto.userId}: ${dto.title}`,
    );

    return notification;
  }

  /**
   * Get all notifications for a user.
   */
  getNotificationsByUserId(userId: string): Notification[] {
    return this.notifications.filter(n => n.userId === userId);
  }

  /**
   * Get all notifications (for testing purposes).
   */
  getAllNotifications(): Notification[] {
    return [...this.notifications];
  }

  /**
   * Clear all notifications (for testing purposes).
   */
  clearAllNotifications(): void {
    this.notifications.length = 0;
  }

  /**
   * Generate a simple UUID-like ID.
   */
  private generateId(): string {
    return `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
