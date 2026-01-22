import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationService } from '../notification.service';
import { EventNames } from '../../../events';
import {
  ClaimSubmittedEvent,
  ClaimApprovedEvent,
  ClaimRejectedEvent,
  ClaimSettledEvent,
} from '../../../events/claim';

/**
 * Event listeners for claim-related notifications.
 * Maps domain events to user notifications.
 */
@Injectable()
export class ClaimEventListeners {
  private readonly logger = new Logger(ClaimEventListeners.name);

  constructor(private readonly notificationService: NotificationService) {}

  @OnEvent(EventNames.CLAIM_SUBMITTED)
  handleClaimSubmitted(event: ClaimSubmittedEvent): void {
    this.logger.debug(
      `Handling claim.submitted event for claim ${event.claimId}`,
    );

    this.notificationService.createNotification({
      userId: event.userId,
      type: 'claim',
      title: 'Claim Submitted',
      message: `Your claim (ID: ${event.claimId}) has been submitted and is under review.`,
    });
  }

  @OnEvent(EventNames.CLAIM_APPROVED)
  handleClaimApproved(event: ClaimApprovedEvent): void {
    this.logger.debug(
      `Handling claim.approved event for claim ${event.claimId}`,
    );

    this.notificationService.createNotification({
      userId: event.userId,
      type: 'claim',
      title: 'Claim Approved',
      message: `Great news! Your claim (ID: ${event.claimId}) has been approved.`,
    });
  }

  @OnEvent(EventNames.CLAIM_REJECTED)
  handleClaimRejected(event: ClaimRejectedEvent): void {
    this.logger.debug(
      `Handling claim.rejected event for claim ${event.claimId}`,
    );

    this.notificationService.createNotification({
      userId: event.userId,
      type: 'claim',
      title: 'Claim Rejected',
      message: `Your claim (ID: ${event.claimId}) has been rejected. Reason: ${event.reason}`,
    });
  }

  @OnEvent(EventNames.CLAIM_SETTLED)
  handleClaimSettled(event: ClaimSettledEvent): void {
    this.logger.debug(
      `Handling claim.settled event for claim ${event.claimId}`,
    );

    this.notificationService.createNotification({
      userId: event.userId,
      type: 'claim',
      title: 'Claim Settled',
      message: `Your claim (ID: ${event.claimId}) has been settled. Amount: $${event.amount.toFixed(2)}`,
    });
  }
}
