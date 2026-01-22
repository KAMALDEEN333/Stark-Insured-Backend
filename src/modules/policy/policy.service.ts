import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  EventNames,
  PolicyIssuedEvent,
  PolicyRenewedEvent,
  PolicyExpiredEvent,
  PolicyCancelledEvent,
} from '../../events';

/**
 * PolicyService handles policy lifecycle operations.
 * Emits domain events at key lifecycle points for decoupled notification handling.
 */
@Injectable()
export class PolicyService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  /**
   * Issue a new policy.
   */
  issuePolicy(
    policyId: string,
    userId: string,
  ): { policyId: string; status: string } {
    // Business logic would go here

    this.eventEmitter.emit(
      EventNames.POLICY_ISSUED,
      new PolicyIssuedEvent(policyId, userId),
    );

    return { policyId, status: 'issued' };
  }

  /**
   * Renew an existing policy.
   */
  renewPolicy(
    policyId: string,
    userId: string,
  ): { policyId: string; status: string } {
    // Business logic would go here

    this.eventEmitter.emit(
      EventNames.POLICY_RENEWED,
      new PolicyRenewedEvent(policyId, userId),
    );

    return { policyId, status: 'renewed' };
  }

  /**
   * Mark a policy as expired.
   */
  expirePolicy(
    policyId: string,
    userId: string,
  ): { policyId: string; status: string } {
    // Business logic would go here

    this.eventEmitter.emit(
      EventNames.POLICY_EXPIRED,
      new PolicyExpiredEvent(policyId, userId),
    );

    return { policyId, status: 'expired' };
  }

  /**
   * Cancel a policy.
   */
  cancelPolicy(
    policyId: string,
    userId: string,
    reason: string,
  ): { policyId: string; status: string } {
    // Business logic would go here

    this.eventEmitter.emit(
      EventNames.POLICY_CANCELLED,
      new PolicyCancelledEvent(policyId, userId, reason),
    );

    return { policyId, status: 'cancelled' };
  }
}
