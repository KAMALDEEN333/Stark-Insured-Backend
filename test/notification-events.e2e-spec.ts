import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ClaimsService } from '../src/modules/claims/claims.service';
import { PolicyService } from '../src/modules/policy/policy.service';
import { DaoService } from '../src/modules/dao/dao.service';
import { NotificationService } from '../src/modules/notification/notification.service';
import { ClaimsModule } from '../src/modules/claims/claims.module';
import { PolicyModule } from '../src/modules/policy/policy.module';
import { DaoModule } from '../src/modules/dao/dao.module';
import { NotificationModule } from '../src/modules/notification/notification.module';

/**
 * Integration tests for the event-driven notification system.
 * Tests verify that business actions emit events and notifications are created.
 */
describe('Notification Events Integration (e2e)', () => {
    let module: TestingModule;
    let claimsService: ClaimsService;
    let policyService: PolicyService;
    let daoService: DaoService;
    let notificationService: NotificationService;

    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [
                EventEmitterModule.forRoot(),
                ClaimsModule,
                PolicyModule,
                DaoModule,
                NotificationModule,
            ],
        }).compile();

        // Initialize the app to properly register event listeners
        await module.init();

        claimsService = module.get<ClaimsService>(ClaimsService);
        policyService = module.get<PolicyService>(PolicyService);
        daoService = module.get<DaoService>(DaoService);
        notificationService = module.get<NotificationService>(NotificationService);
    });

    afterAll(async () => {
        await module.close();
    });

    beforeEach(() => {
        // Clear notifications before each test
        notificationService.clearAllNotifications();
    });

    describe('Claim Events', () => {
        const userId = 'user-123';
        const claimId = 'claim-456';
        const policyId = 'policy-789';

        it('should create notification when claim is submitted', () => {
            claimsService.submitClaim(claimId, userId, policyId);

            const notifications =
                notificationService.getNotificationsByUserId(userId);

            expect(notifications).toHaveLength(1);
            expect(notifications[0].type).toBe('claim');
            expect(notifications[0].title).toBe('Claim Submitted');
            expect(notifications[0].message).toContain(claimId);
            expect(notifications[0].read).toBe(false);
        });

        it('should create notification when claim is approved', () => {
            claimsService.approveClaim(claimId, userId);

            const notifications =
                notificationService.getNotificationsByUserId(userId);

            expect(notifications).toHaveLength(1);
            expect(notifications[0].type).toBe('claim');
            expect(notifications[0].title).toBe('Claim Approved');
            expect(notifications[0].message).toContain('approved');
        });

        it('should create notification when claim is rejected', () => {
            const reason = 'Insufficient documentation';

            claimsService.rejectClaim(claimId, userId, reason);

            const notifications =
                notificationService.getNotificationsByUserId(userId);

            expect(notifications).toHaveLength(1);
            expect(notifications[0].type).toBe('claim');
            expect(notifications[0].title).toBe('Claim Rejected');
            expect(notifications[0].message).toContain(reason);
        });

        it('should create notification when claim is settled', () => {
            const amount = 1500.5;

            claimsService.settleClaim(claimId, userId, amount);

            const notifications =
                notificationService.getNotificationsByUserId(userId);

            expect(notifications).toHaveLength(1);
            expect(notifications[0].type).toBe('claim');
            expect(notifications[0].title).toBe('Claim Settled');
            expect(notifications[0].message).toContain('1500.50');
        });
    });

    describe('Policy Events', () => {
        const userId = 'user-456';
        const policyId = 'policy-123';

        it('should create notification when policy is issued', () => {
            policyService.issuePolicy(policyId, userId);

            const notifications =
                notificationService.getNotificationsByUserId(userId);

            expect(notifications).toHaveLength(1);
            expect(notifications[0].type).toBe('policy');
            expect(notifications[0].title).toBe('Policy Issued');
            expect(notifications[0].message).toContain(policyId);
        });

        it('should create notification when policy is renewed', () => {
            policyService.renewPolicy(policyId, userId);

            const notifications =
                notificationService.getNotificationsByUserId(userId);

            expect(notifications).toHaveLength(1);
            expect(notifications[0].type).toBe('policy');
            expect(notifications[0].title).toBe('Policy Renewed');
        });

        it('should create notification when policy expires', () => {
            policyService.expirePolicy(policyId, userId);

            const notifications =
                notificationService.getNotificationsByUserId(userId);

            expect(notifications).toHaveLength(1);
            expect(notifications[0].type).toBe('policy');
            expect(notifications[0].title).toBe('Policy Expired');
            expect(notifications[0].message).toContain('renew');
        });

        it('should create notification when policy is cancelled', () => {
            const reason = 'Non-payment';

            policyService.cancelPolicy(policyId, userId, reason);

            const notifications =
                notificationService.getNotificationsByUserId(userId);

            expect(notifications).toHaveLength(1);
            expect(notifications[0].type).toBe('policy');
            expect(notifications[0].title).toBe('Policy Cancelled');
            expect(notifications[0].message).toContain(reason);
        });
    });

    describe('DAO Events', () => {
        const creatorId = 'user-789';
        const proposalId = 'proposal-001';
        const title = 'Increase Coverage Limit';

        it('should create notification when DAO proposal is created', () => {
            daoService.createProposal(proposalId, creatorId, title);

            const notifications =
                notificationService.getNotificationsByUserId(creatorId);

            expect(notifications).toHaveLength(1);
            expect(notifications[0].type).toBe('dao');
            expect(notifications[0].title).toBe('Proposal Created');
            expect(notifications[0].message).toContain(title);
        });

        it('should create notification when DAO proposal passes', () => {
            daoService.finalizeProposal(proposalId, creatorId, true);

            const notifications =
                notificationService.getNotificationsByUserId(creatorId);

            expect(notifications).toHaveLength(1);
            expect(notifications[0].type).toBe('dao');
            expect(notifications[0].title).toBe('Proposal Voting Ended');
            expect(notifications[0].message).toContain('passed');
        });

        it('should create notification when DAO proposal does not pass', () => {
            daoService.finalizeProposal(proposalId, creatorId, false);

            const notifications =
                notificationService.getNotificationsByUserId(creatorId);

            expect(notifications).toHaveLength(1);
            expect(notifications[0].type).toBe('dao');
            expect(notifications[0].title).toBe('Proposal Voting Ended');
            expect(notifications[0].message).toContain('did not pass');
        });
    });

    describe('Cross-module isolation', () => {
        it('should not create notifications for other users', () => {
            const user1 = 'user-1';
            const user2 = 'user-2';

            claimsService.submitClaim('claim-1', user1, 'policy-1');
            policyService.issuePolicy('policy-2', user2);

            const user1Notifications =
                notificationService.getNotificationsByUserId(user1);
            const user2Notifications =
                notificationService.getNotificationsByUserId(user2);

            expect(user1Notifications).toHaveLength(1);
            expect(user1Notifications[0].type).toBe('claim');

            expect(user2Notifications).toHaveLength(1);
            expect(user2Notifications[0].type).toBe('policy');
        });
    });
});
