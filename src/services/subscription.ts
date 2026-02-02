// OWNLAY Subscription Lifecycle Service
// Full subscription management with upgrade/downgrade/cancellation
// Version: 4.8.0 - Enterprise-grade subscription handling

import { PLANS } from './payment';

// ============================================
// PLAN HIERARCHY & PRICING
// ============================================
export const PLAN_HIERARCHY: Record<string, number> = {
  'none': 0,
  'starter': 1,
  'growth': 2,
  'pro': 3,
  'enterprise': 4
};

export const PLAN_MRR: Record<string, { USD: number; INR: number }> = {
  'starter': { USD: 2900, INR: 199900 }, // in cents/paise
  'growth': { USD: 7900, INR: 499900 },
  'pro': { USD: 14900, INR: 999900 },
  'enterprise': { USD: 0, INR: 0 } // Custom
};

// ============================================
// SUBSCRIPTION TYPES
// ============================================
export type SubscriptionAction = 
  | 'created'
  | 'upgraded'
  | 'downgraded'
  | 'cancelled'
  | 'reactivated'
  | 'renewed'
  | 'expired'
  | 'trial_started'
  | 'trial_ended'
  | 'payment_failed'
  | 'payment_succeeded';

export interface SubscriptionChange {
  userId: string;
  fromPlan: string | null;
  toPlan: string;
  action: SubscriptionAction;
  effectiveAt: Date;
  scheduledAt?: Date;
  prorationAmount: number; // credit (+) or charge (-)
  revenueImpact: number; // MRR change
  reason?: string;
}

export interface DowngradeCalculation {
  currentPlan: string;
  newPlan: string;
  currentPeriodEnd: Date;
  effectiveAt: Date; // When downgrade takes effect
  creditAmount: number; // Amount to credit
  unusedDays: number;
  immediateChange: boolean;
}

export interface UpgradeCalculation {
  currentPlan: string;
  newPlan: string;
  effectiveAt: Date; // Immediate
  prorationCredit: number; // Credit from current plan
  newPlanCharge: number; // Amount to charge
  netCharge: number; // prorationCredit - newPlanCharge
  immediateChange: boolean;
}

export interface CancellationDetails {
  subscriptionId: string;
  userId: string;
  currentPlan: string;
  effectiveAt: Date;
  revenueImpact: number; // Lost MRR
  canReactivate: boolean;
  reactivateUntil: Date;
  reason?: string;
}

export interface SubscriptionWithHistory {
  id: string;
  userId: string;
  planId: string;
  status: string;
  billingCycle: string;
  currency: string;
  priceAmount: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEnd?: string;
  cancelledAt?: string;
  cancelAtPeriodEnd: boolean;
  history: SubscriptionHistoryEntry[];
}

export interface SubscriptionHistoryEntry {
  id: string;
  action: SubscriptionAction;
  fromPlan?: string;
  toPlan?: string;
  fromStatus?: string;
  toStatus?: string;
  prorationAmount: number;
  revenueImpact: number;
  effectiveAt: string;
  reason?: string;
}

// ============================================
// SUBSCRIPTION LIFECYCLE SERVICE
// ============================================
export class SubscriptionLifecycleService {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  // ============================================
  // GET SUBSCRIPTION
  // ============================================
  async getSubscription(userId: string): Promise<SubscriptionWithHistory | null> {
    try {
      const sub = await this.db.prepare(`
        SELECT * FROM user_subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1
      `).bind(userId).first();

      if (!sub) return null;

      const history = await this.db.prepare(`
        SELECT * FROM subscription_history 
        WHERE subscription_id = ? 
        ORDER BY created_at DESC 
        LIMIT 20
      `).bind(sub.id).all();

      return {
        id: sub.id as string,
        userId: sub.user_id as string,
        planId: sub.plan_id as string,
        status: sub.status as string,
        billingCycle: sub.billing_cycle as string,
        currency: sub.currency as string,
        priceAmount: sub.price_amount as number,
        currentPeriodStart: sub.current_period_start as string,
        currentPeriodEnd: sub.current_period_end as string,
        trialEnd: sub.trial_end as string | undefined,
        cancelledAt: sub.cancelled_at as string | undefined,
        cancelAtPeriodEnd: (sub.cancel_at_period_end as number) === 1,
        history: (history.results || []).map((h: any) => ({
          id: h.id,
          action: h.action,
          fromPlan: h.from_plan,
          toPlan: h.to_plan,
          fromStatus: h.from_status,
          toStatus: h.to_status,
          prorationAmount: h.proration_amount || 0,
          revenueImpact: h.revenue_impact || 0,
          effectiveAt: h.effective_at,
          reason: h.reason
        }))
      };
    } catch (error) {
      console.error('Get subscription error:', error);
      return null;
    }
  }

  // ============================================
  // CREATE SUBSCRIPTION
  // ============================================
  async createSubscription(
    userId: string,
    planId: string,
    options: {
      billingCycle?: 'monthly' | 'yearly';
      currency?: 'USD' | 'INR';
      startTrial?: boolean;
      paymentId?: string;
    } = {}
  ): Promise<SubscriptionWithHistory | null> {
    const plan = PLANS[planId as keyof typeof PLANS];
    if (!plan) throw new Error('Invalid plan');

    const now = new Date();
    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const { billingCycle = 'monthly', currency = 'USD', startTrial = false, paymentId } = options;

    let status: string;
    let periodEnd: Date;
    let trialEnd: Date | null = null;

    if (startTrial && plan.trialDays > 0) {
      status = 'trialing';
      trialEnd = new Date(now.getTime() + plan.trialDays * 24 * 60 * 60 * 1000);
      periodEnd = trialEnd;
    } else if (paymentId) {
      status = 'active';
      periodEnd = billingCycle === 'yearly' 
        ? new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
        : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    } else {
      status = 'unpaid';
      periodEnd = now;
    }

    const priceAmount = this.getPriceInCents(planId, billingCycle, currency);

    try {
      await this.db.prepare(`
        INSERT INTO user_subscriptions (
          id, user_id, plan_id, status, billing_cycle, currency, price_amount,
          current_period_start, current_period_end, trial_end, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        subscriptionId,
        userId,
        planId,
        status,
        billingCycle,
        currency,
        priceAmount,
        now.toISOString(),
        periodEnd.toISOString(),
        trialEnd?.toISOString() || null,
        now.toISOString(),
        now.toISOString()
      ).run();

      // Update user's plan
      await this.db.prepare(`
        UPDATE users SET plan = ?, updated_at = ? WHERE id = ?
      `).bind(planId, now.toISOString(), userId).run();

      // Log history
      await this.logHistory(subscriptionId, userId, {
        action: startTrial ? 'trial_started' : 'created',
        toPlan: planId,
        toStatus: status,
        revenueImpact: status === 'active' ? priceAmount : 0
      });

      return this.getSubscription(userId);
    } catch (error) {
      console.error('Create subscription error:', error);
      throw error;
    }
  }

  // ============================================
  // CALCULATE UPGRADE
  // ============================================
  calculateUpgrade(
    currentPlan: string,
    newPlan: string,
    currentPeriodEnd: Date,
    billingCycle: 'monthly' | 'yearly',
    currency: 'USD' | 'INR'
  ): UpgradeCalculation {
    const now = new Date();
    const currentPrice = this.getPriceInCents(currentPlan, billingCycle, currency);
    const newPrice = this.getPriceInCents(newPlan, billingCycle, currency);

    // Calculate unused portion of current plan
    const periodLength = billingCycle === 'yearly' ? 365 : 30;
    const periodStart = new Date(currentPeriodEnd.getTime() - periodLength * 24 * 60 * 60 * 1000);
    const totalDays = Math.ceil((currentPeriodEnd.getTime() - periodStart.getTime()) / (24 * 60 * 60 * 1000));
    const usedDays = Math.ceil((now.getTime() - periodStart.getTime()) / (24 * 60 * 60 * 1000));
    const unusedDays = Math.max(0, totalDays - usedDays);

    const prorationCredit = Math.floor((currentPrice / totalDays) * unusedDays);
    const newPlanCharge = newPrice;
    const netCharge = newPlanCharge - prorationCredit;

    return {
      currentPlan,
      newPlan,
      effectiveAt: now, // Upgrades are immediate
      prorationCredit,
      newPlanCharge,
      netCharge,
      immediateChange: true
    };
  }

  // ============================================
  // CALCULATE DOWNGRADE
  // ============================================
  calculateDowngrade(
    currentPlan: string,
    newPlan: string,
    currentPeriodEnd: Date,
    billingCycle: 'monthly' | 'yearly',
    currency: 'USD' | 'INR'
  ): DowngradeCalculation {
    const now = new Date();
    const currentPrice = this.getPriceInCents(currentPlan, billingCycle, currency);

    // Calculate unused portion
    const periodLength = billingCycle === 'yearly' ? 365 : 30;
    const periodStart = new Date(currentPeriodEnd.getTime() - periodLength * 24 * 60 * 60 * 1000);
    const totalDays = Math.ceil((currentPeriodEnd.getTime() - periodStart.getTime()) / (24 * 60 * 60 * 1000));
    const usedDays = Math.ceil((now.getTime() - periodStart.getTime()) / (24 * 60 * 60 * 1000));
    const unusedDays = Math.max(0, totalDays - usedDays);

    const creditAmount = Math.floor((currentPrice / totalDays) * unusedDays);

    return {
      currentPlan,
      newPlan,
      currentPeriodEnd,
      effectiveAt: currentPeriodEnd, // Downgrades take effect at period end
      creditAmount,
      unusedDays,
      immediateChange: false
    };
  }

  // ============================================
  // UPGRADE SUBSCRIPTION
  // ============================================
  async upgradeSubscription(
    userId: string,
    newPlanId: string,
    options: {
      paymentId?: string;
      immediate?: boolean;
    } = {}
  ): Promise<{ success: boolean; subscription?: SubscriptionWithHistory; calculation?: UpgradeCalculation; error?: string }> {
    const currentSub = await this.getSubscription(userId);
    if (!currentSub) {
      return { success: false, error: 'No active subscription found' };
    }

    const currentLevel = PLAN_HIERARCHY[currentSub.planId] || 0;
    const newLevel = PLAN_HIERARCHY[newPlanId] || 0;

    if (newLevel <= currentLevel) {
      return { success: false, error: 'New plan must be higher than current plan for upgrade' };
    }

    const calculation = this.calculateUpgrade(
      currentSub.planId,
      newPlanId,
      new Date(currentSub.currentPeriodEnd),
      currentSub.billingCycle as 'monthly' | 'yearly',
      currentSub.currency as 'USD' | 'INR'
    );

    const now = new Date();
    const newPeriodEnd = currentSub.billingCycle === 'yearly'
      ? new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
      : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    try {
      await this.db.prepare(`
        UPDATE user_subscriptions 
        SET plan_id = ?, status = 'active', price_amount = ?,
            current_period_start = ?, current_period_end = ?,
            cancel_at_period_end = 0, updated_at = ?
        WHERE id = ?
      `).bind(
        newPlanId,
        this.getPriceInCents(newPlanId, currentSub.billingCycle as any, currentSub.currency as any),
        now.toISOString(),
        newPeriodEnd.toISOString(),
        now.toISOString(),
        currentSub.id
      ).run();

      // Update user's plan
      await this.db.prepare(`
        UPDATE users SET plan = ?, updated_at = ? WHERE id = ?
      `).bind(newPlanId, now.toISOString(), userId).run();

      // Log history
      const mrrChange = this.getPriceInCents(newPlanId, 'monthly', currentSub.currency as any) -
                       this.getPriceInCents(currentSub.planId, 'monthly', currentSub.currency as any);

      await this.logHistory(currentSub.id, userId, {
        action: 'upgraded',
        fromPlan: currentSub.planId,
        toPlan: newPlanId,
        fromStatus: currentSub.status,
        toStatus: 'active',
        prorationAmount: -calculation.netCharge,
        revenueImpact: mrrChange
      });

      // Create event for real-time processing
      await this.createEvent(currentSub.id, userId, 'subscription.upgraded', {
        fromPlan: currentSub.planId,
        toPlan: newPlanId,
        calculation
      });

      return { 
        success: true, 
        subscription: await this.getSubscription(userId) || undefined,
        calculation
      };
    } catch (error) {
      console.error('Upgrade subscription error:', error);
      return { success: false, error: 'Failed to upgrade subscription' };
    }
  }

  // ============================================
  // DOWNGRADE SUBSCRIPTION
  // ============================================
  async downgradeSubscription(
    userId: string,
    newPlanId: string,
    options: {
      immediate?: boolean;
      reason?: string;
    } = {}
  ): Promise<{ success: boolean; subscription?: SubscriptionWithHistory; calculation?: DowngradeCalculation; error?: string }> {
    const currentSub = await this.getSubscription(userId);
    if (!currentSub) {
      return { success: false, error: 'No active subscription found' };
    }

    const currentLevel = PLAN_HIERARCHY[currentSub.planId] || 0;
    const newLevel = PLAN_HIERARCHY[newPlanId] || 0;

    if (newLevel >= currentLevel) {
      return { success: false, error: 'New plan must be lower than current plan for downgrade' };
    }

    const calculation = this.calculateDowngrade(
      currentSub.planId,
      newPlanId,
      new Date(currentSub.currentPeriodEnd),
      currentSub.billingCycle as 'monthly' | 'yearly',
      currentSub.currency as 'USD' | 'INR'
    );

    const now = new Date();

    try {
      if (options.immediate) {
        // Immediate downgrade
        await this.db.prepare(`
          UPDATE user_subscriptions 
          SET plan_id = ?, price_amount = ?,
              current_period_start = ?, current_period_end = ?,
              updated_at = ?
          WHERE id = ?
        `).bind(
          newPlanId,
          this.getPriceInCents(newPlanId, currentSub.billingCycle as any, currentSub.currency as any),
          now.toISOString(),
          new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          now.toISOString(),
          currentSub.id
        ).run();

        await this.db.prepare(`
          UPDATE users SET plan = ?, updated_at = ? WHERE id = ?
        `).bind(newPlanId, now.toISOString(), userId).run();
      } else {
        // Schedule downgrade at period end
        await this.db.prepare(`
          UPDATE user_subscriptions 
          SET updated_at = ?
          WHERE id = ?
        `).bind(now.toISOString(), currentSub.id).run();

        // Create scheduled event
        await this.createEvent(currentSub.id, userId, 'subscription.downgrade_scheduled', {
          fromPlan: currentSub.planId,
          toPlan: newPlanId,
          effectiveAt: calculation.effectiveAt.toISOString()
        });
      }

      // Log history
      const mrrChange = this.getPriceInCents(newPlanId, 'monthly', currentSub.currency as any) -
                       this.getPriceInCents(currentSub.planId, 'monthly', currentSub.currency as any);

      await this.logHistory(currentSub.id, userId, {
        action: 'downgraded',
        fromPlan: currentSub.planId,
        toPlan: newPlanId,
        fromStatus: currentSub.status,
        toStatus: currentSub.status,
        prorationAmount: calculation.creditAmount,
        revenueImpact: mrrChange,
        reason: options.reason,
        scheduledAt: options.immediate ? undefined : calculation.effectiveAt
      });

      return { 
        success: true, 
        subscription: await this.getSubscription(userId) || undefined,
        calculation
      };
    } catch (error) {
      console.error('Downgrade subscription error:', error);
      return { success: false, error: 'Failed to downgrade subscription' };
    }
  }

  // ============================================
  // CANCEL SUBSCRIPTION
  // ============================================
  async cancelSubscription(
    userId: string,
    options: {
      immediate?: boolean;
      reason?: string;
    } = {}
  ): Promise<{ success: boolean; details?: CancellationDetails; error?: string }> {
    const currentSub = await this.getSubscription(userId);
    if (!currentSub) {
      return { success: false, error: 'No active subscription found' };
    }

    if (currentSub.status === 'cancelled') {
      return { success: false, error: 'Subscription is already cancelled' };
    }

    const now = new Date();
    const periodEnd = new Date(currentSub.currentPeriodEnd);
    const mrrLoss = this.getPriceInCents(currentSub.planId, 'monthly', currentSub.currency as any);

    try {
      if (options.immediate) {
        // Immediate cancellation
        await this.db.prepare(`
          UPDATE user_subscriptions 
          SET status = 'cancelled', cancelled_at = ?, cancel_at_period_end = 0, updated_at = ?
          WHERE id = ?
        `).bind(now.toISOString(), now.toISOString(), currentSub.id).run();

        await this.db.prepare(`
          UPDATE users SET plan = 'none', updated_at = ? WHERE id = ?
        `).bind(now.toISOString(), userId).run();
      } else {
        // Cancel at period end
        await this.db.prepare(`
          UPDATE user_subscriptions 
          SET cancel_at_period_end = 1, cancelled_at = ?, updated_at = ?
          WHERE id = ?
        `).bind(now.toISOString(), now.toISOString(), currentSub.id).run();
      }

      // Log history
      await this.logHistory(currentSub.id, userId, {
        action: 'cancelled',
        fromPlan: currentSub.planId,
        fromStatus: currentSub.status,
        toStatus: options.immediate ? 'cancelled' : currentSub.status,
        revenueImpact: -mrrLoss,
        reason: options.reason,
        scheduledAt: options.immediate ? undefined : periodEnd
      });

      // Create event
      await this.createEvent(currentSub.id, userId, 'subscription.cancelled', {
        immediate: options.immediate,
        reason: options.reason,
        effectiveAt: options.immediate ? now.toISOString() : periodEnd.toISOString()
      });

      const details: CancellationDetails = {
        subscriptionId: currentSub.id,
        userId,
        currentPlan: currentSub.planId,
        effectiveAt: options.immediate ? now : periodEnd,
        revenueImpact: mrrLoss,
        canReactivate: true,
        reactivateUntil: new Date(periodEnd.getTime() + 30 * 24 * 60 * 60 * 1000),
        reason: options.reason
      };

      return { success: true, details };
    } catch (error) {
      console.error('Cancel subscription error:', error);
      return { success: false, error: 'Failed to cancel subscription' };
    }
  }

  // ============================================
  // REACTIVATE SUBSCRIPTION
  // ============================================
  async reactivateSubscription(userId: string): Promise<{ success: boolean; subscription?: SubscriptionWithHistory; error?: string }> {
    const currentSub = await this.getSubscription(userId);
    if (!currentSub) {
      return { success: false, error: 'No subscription found' };
    }

    if (currentSub.status !== 'cancelled' && !currentSub.cancelAtPeriodEnd) {
      return { success: false, error: 'Subscription is not cancelled' };
    }

    const now = new Date();

    try {
      await this.db.prepare(`
        UPDATE user_subscriptions 
        SET status = 'active', cancelled_at = NULL, cancel_at_period_end = 0, updated_at = ?
        WHERE id = ?
      `).bind(now.toISOString(), currentSub.id).run();

      await this.db.prepare(`
        UPDATE users SET plan = ?, updated_at = ? WHERE id = ?
      `).bind(currentSub.planId, now.toISOString(), userId).run();

      // Log history
      await this.logHistory(currentSub.id, userId, {
        action: 'reactivated',
        toPlan: currentSub.planId,
        fromStatus: 'cancelled',
        toStatus: 'active',
        revenueImpact: this.getPriceInCents(currentSub.planId, 'monthly', currentSub.currency as any)
      });

      return { success: true, subscription: await this.getSubscription(userId) || undefined };
    } catch (error) {
      console.error('Reactivate subscription error:', error);
      return { success: false, error: 'Failed to reactivate subscription' };
    }
  }

  // ============================================
  // PROCESS SCHEDULED CHANGES
  // Called by background task processor
  // ============================================
  async processScheduledChanges(): Promise<{ processed: number; errors: number }> {
    const now = new Date();
    let processed = 0;
    let errors = 0;

    try {
      // Process subscriptions that should be cancelled at period end
      const cancellingSubscriptions = await this.db.prepare(`
        SELECT * FROM user_subscriptions 
        WHERE cancel_at_period_end = 1 
        AND current_period_end <= ?
        AND status != 'cancelled'
      `).bind(now.toISOString()).all();

      for (const sub of cancellingSubscriptions.results || []) {
        try {
          await this.db.prepare(`
            UPDATE user_subscriptions SET status = 'cancelled', updated_at = ? WHERE id = ?
          `).bind(now.toISOString(), sub.id).run();

          await this.db.prepare(`
            UPDATE users SET plan = 'none', updated_at = ? WHERE id = ?
          `).bind(now.toISOString(), sub.user_id).run();

          processed++;
        } catch (e) {
          errors++;
        }
      }

      // Process expired trials
      const expiredTrials = await this.db.prepare(`
        SELECT * FROM user_subscriptions 
        WHERE status = 'trialing' 
        AND trial_end <= ?
      `).bind(now.toISOString()).all();

      for (const sub of expiredTrials.results || []) {
        try {
          await this.db.prepare(`
            UPDATE user_subscriptions SET status = 'trial_expired', updated_at = ? WHERE id = ?
          `).bind(now.toISOString(), sub.id).run();

          await this.logHistory(sub.id as string, sub.user_id as string, {
            action: 'trial_ended',
            fromStatus: 'trialing',
            toStatus: 'trial_expired'
          });

          processed++;
        } catch (e) {
          errors++;
        }
      }

      // Process scheduled downgrades
      const scheduledEvents = await this.db.prepare(`
        SELECT * FROM subscription_events 
        WHERE event_type = 'subscription.downgrade_scheduled'
        AND status = 'pending'
        AND JSON_EXTRACT(payload, '$.effectiveAt') <= ?
      `).bind(now.toISOString()).all();

      for (const event of scheduledEvents.results || []) {
        try {
          const payload = JSON.parse(event.payload as string);
          
          await this.db.prepare(`
            UPDATE user_subscriptions 
            SET plan_id = ?, price_amount = ?, updated_at = ?
            WHERE id = ?
          `).bind(
            payload.toPlan,
            this.getPriceInCents(payload.toPlan, 'monthly', 'USD'),
            now.toISOString(),
            event.subscription_id
          ).run();

          await this.db.prepare(`
            UPDATE users SET plan = ?, updated_at = ? WHERE id = ?
          `).bind(payload.toPlan, now.toISOString(), event.user_id).run();

          await this.db.prepare(`
            UPDATE subscription_events SET status = 'completed', processed_at = ? WHERE id = ?
          `).bind(now.toISOString(), event.id).run();

          processed++;
        } catch (e) {
          errors++;
        }
      }
    } catch (error) {
      console.error('Process scheduled changes error:', error);
    }

    return { processed, errors };
  }

  // ============================================
  // HELPER METHODS
  // ============================================
  private getPriceInCents(planId: string, billingCycle: 'monthly' | 'yearly', currency: 'USD' | 'INR'): number {
    const plan = PLANS[planId as keyof typeof PLANS];
    if (!plan) return 0;

    if (billingCycle === 'yearly') {
      return currency === 'INR' ? plan.yearlyPriceINR * 12 * 100 : plan.yearlyPriceUSD * 12 * 100;
    }
    return currency === 'INR' ? plan.priceINR * 100 : plan.priceUSD * 100;
  }

  private async logHistory(
    subscriptionId: string,
    userId: string,
    data: {
      action: SubscriptionAction;
      fromPlan?: string;
      toPlan?: string;
      fromStatus?: string;
      toStatus?: string;
      prorationAmount?: number;
      revenueImpact?: number;
      reason?: string;
      scheduledAt?: Date;
    }
  ): Promise<void> {
    const historyId = `subhist_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    try {
      await this.db.prepare(`
        INSERT INTO subscription_history (
          id, subscription_id, user_id, action, from_plan, to_plan,
          from_status, to_status, proration_amount, revenue_impact,
          effective_at, scheduled_at, reason, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        historyId,
        subscriptionId,
        userId,
        data.action,
        data.fromPlan || null,
        data.toPlan || null,
        data.fromStatus || null,
        data.toStatus || null,
        data.prorationAmount || 0,
        data.revenueImpact || 0,
        new Date().toISOString(),
        data.scheduledAt?.toISOString() || null,
        data.reason || null,
        new Date().toISOString()
      ).run();
    } catch (error) {
      console.error('Log history error:', error);
    }
  }

  private async createEvent(
    subscriptionId: string,
    userId: string,
    eventType: string,
    payload: any
  ): Promise<void> {
    const eventId = `subevt_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    try {
      await this.db.prepare(`
        INSERT INTO subscription_events (id, subscription_id, user_id, event_type, payload, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        eventId,
        subscriptionId,
        userId,
        eventType,
        JSON.stringify(payload),
        new Date().toISOString()
      ).run();
    } catch (error) {
      console.error('Create event error:', error);
    }
  }
}

// Factory function
export function createSubscriptionService(db: D1Database): SubscriptionLifecycleService {
  return new SubscriptionLifecycleService(db);
}
