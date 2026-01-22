import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import {
  ClaimEventListeners,
  PolicyEventListeners,
  DaoEventListeners,
} from './listeners';

/**
 * NotificationModule handles notification creation via event listeners.
 * Does NOT import business modules - communication is purely event-driven.
 */
@Module({
  providers: [
    NotificationService,
    ClaimEventListeners,
    PolicyEventListeners,
    DaoEventListeners,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
