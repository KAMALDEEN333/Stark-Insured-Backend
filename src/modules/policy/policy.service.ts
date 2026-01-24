import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Cache } from 'cache-manager';
import { Policy } from './entities/policy.entity';
import { PolicyStateMachineService } from './services/policy-state-machine.service';

@Injectable()
export class PolicyService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(Policy)
    private readonly policyRepository: Repository<Policy>,
    private readonly stateMachine: PolicyStateMachineService,
  ) {}

  async createPolicy(dto: any, userId: string) {
    const policy = await this.policyRepository.save({
      ...dto,
      createdBy: userId,
    });
    
    // Invalidate analytics cache
    await this.cacheManager.del('analytics_dashboard'); 
    return policy;
  }

  // FIXED: Added missing methods required by PolicyController
  async getPolicy(id: string) {
    const policy = await this.policyRepository.findOne({ where: { id } as any });
    if (!policy) throw new NotFoundException(`Policy with ID ${id} not found`);
    return policy;
  }

  async getAvailableTransitions(id: string) {
    const policy = await this.getPolicy(id);
    return this.stateMachine.getAvailableActions(policy.status);
  }

  async getAuditTrail(id: string) {
    // Placeholder for audit trail logic
    return [];
  }

  async transitionPolicy(id: string, action: any, userId: string, roles: string[], reason?: string) {
    const policy = await this.getPolicy(id);
    const transition = this.stateMachine.executeTransition(
      policy.status,
      action,
      roles,
      reason,
    );

    policy.status = transition.to;
    await this.policyRepository.save(policy);
    
    // Invalidate cache on status change
    await this.cacheManager.del('analytics_dashboard');
    return policy;
  }
  // ... existing code ...
  // PASTE HERE (Inside the class)
  async getUserStats(walletAddress: string) {
    const policies = await this.policyRepository.find({ 
      where: { 
        // We query the relationship. TypeORM matches this to the User's ID.
        user: { id: walletAddress } as any, 
        status: PolicyStatus.ACTIVE 
      },
      // We must load the relation to access user details if needed, 
      // but for ID filtering, the 'where' above is usually enough.
    });

    // Since 'coverageAmount' doesn't exist, we sum 'premium' as a fallback
    // If you add a coverageAmount column later, change 'premium' to 'coverageAmount' here.
    const totalValue = policies.reduce((sum, p) => sum + (Number(p.premium) || 0), 0);

    return { activeCount: policies.length, totalValue };
  }
} // <--- The file must end with this closing brace