// OWNLAY Payment Routes
// Handles payment flow with Razorpay integration and webhooks
// Reference: https://razorpay.com/docs/webhooks/
// Version: 4.8.0 - Full subscription lifecycle

import { Hono } from 'hono';
import { paymentService, PLANS, RazorpayWebhookPayload, RazorpayWebhookEvent } from '../services/payment';
import { createSubscriptionService, PLAN_HIERARCHY } from '../services/subscription';

type Bindings = {
  DB: D1Database;
  AI?: any;
};

const paymentRoutes = new Hono<{ Bindings: Bindings }>();

// ============================================
// CREATE ORDER
// POST /api/v1/payment/create-order
// ============================================
paymentRoutes.post('/create-order', async (c) => {
  try {
    const { planId, billingCycle = 'monthly', currency = 'USD' } = await c.req.json();

    if (!planId || !PLANS[planId as keyof typeof PLANS]) {
      return c.json({ success: false, error: 'Invalid plan' }, 400);
    }

    const plan = PLANS[planId as keyof typeof PLANS];

    // Enterprise requires contact sales
    if (planId === 'enterprise') {
      return c.json({
        success: false,
        error: 'Please contact sales for Enterprise plan',
        contactSales: true
      }, 400);
    }

    const order = await paymentService.createOrder(planId, billingCycle, currency);

    return c.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        planId: order.planId,
        planName: plan.name,
        billingCycle: order.billingCycle
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    return c.json({ success: false, error: 'Failed to create order' }, 500);
  }
});

// ============================================
// VERIFY PAYMENT
// POST /api/v1/payment/verify
// ============================================
paymentRoutes.post('/verify', async (c) => {
  try {
    const {
      orderId,
      paymentId,
      signature,
      userId,
      planId: requestPlanId  // Get planId from request if available
    } = await c.req.json();

    const result = await paymentService.verifyPayment(orderId, paymentId, signature);

    if (!result.success) {
      return c.json({ success: false, error: result.error }, 400);
    }

    // Get planId from request body or default to starter
    const planId = requestPlanId || 'starter';
    
    // Create subscription after successful payment
    const subscription = await paymentService.createSubscription(
      userId,
      planId,
      paymentId
    );

    return c.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        planId: subscription.planId,
        currentPeriodEnd: subscription.currentPeriodEnd
      }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    return c.json({ success: false, error: 'Payment verification failed' }, 500);
  }
});

// ============================================
// START FREE TRIAL (Starter Plan Only)
// POST /api/v1/payment/start-trial
// ============================================
paymentRoutes.post('/start-trial', async (c) => {
  try {
    const { userId, planId } = await c.req.json();

    // Only starter plan has free trial
    if (planId !== 'starter') {
      return c.json({
        success: false,
        error: 'Free trial is only available for Starter plan'
      }, 400);
    }

    const subscription = await paymentService.createSubscription(userId, planId);

    return c.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        planId: subscription.planId,
        trialEnd: subscription.trialEnd,
        message: 'Your 7-day free trial has started!'
      }
    });
  } catch (error) {
    console.error('Start trial error:', error);
    return c.json({ success: false, error: 'Failed to start trial' }, 500);
  }
});

// ============================================
// GET SUBSCRIPTION STATUS
// GET /api/v1/payment/subscription/:userId
// ============================================
paymentRoutes.get('/subscription/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const subscription = await paymentService.getSubscription(userId);

    if (!subscription) {
      return c.json({
        success: true,
        subscription: null,
        hasActiveSubscription: false
      });
    }

    const plan = PLANS[subscription.planId as keyof typeof PLANS];

    return c.json({
      success: true,
      subscription: {
        id: subscription.id,
        planId: subscription.planId,
        planName: plan?.name || subscription.planId,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        trialEnd: subscription.trialEnd,
        isTrialing: subscription.status === 'trialing'
      },
      hasActiveSubscription: subscription.status === 'active' || subscription.status === 'trialing'
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    return c.json({ success: false, error: 'Failed to get subscription' }, 500);
  }
});

// ============================================
// CHECK INTEGRATION ACCESS
// GET /api/v1/payment/can-integrate/:userId
// This endpoint checks if a user can connect integrations.
// It checks both server-side mock subscription storage AND
// client-side localStorage (passed via headers/cookies).
// ============================================
paymentRoutes.get('/can-integrate/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const result = await paymentService.canConnectIntegrations(userId);
    const subscription = await paymentService.getSubscription(userId);

    // If server-side check passes, return success
    if (result.allowed) {
      return c.json({
        success: true,
        canConnect: true,
        reason: null,
        plan: subscription?.planId || null,
        status: subscription?.status || null
      });
    }

    // If no server subscription found, check if client passed plan info via cookie
    // This is a fallback for demo/development mode
    const planCookie = c.req.header('X-User-Plan');
    const statusCookie = c.req.header('X-Subscription-Status');
    
    if (planCookie && planCookie !== 'none') {
      // User has a plan from localStorage
      if (statusCookie === 'active' || statusCookie === 'trialing') {
        return c.json({
          success: true,
          canConnect: true,
          reason: null,
          plan: planCookie,
          status: statusCookie
        });
      }
    }

    return c.json({
      success: true,
      canConnect: result.allowed,
      reason: result.reason,
      plan: subscription?.planId || null,
      status: subscription?.status || null
    });
  } catch (error) {
    console.error('Check integration access error:', error);
    return c.json({ success: false, canConnect: false, error: 'Failed to check access' }, 500);
  }
});

// ============================================
// CANCEL SUBSCRIPTION (Enhanced)
// POST /api/v1/payment/cancel
// ============================================
paymentRoutes.post('/cancel', async (c) => {
  try {
    const { userId, immediate = false, reason } = await c.req.json();
    
    // Try DB-based subscription service first
    const db = c.env?.DB;
    if (db) {
      const subscriptionService = createSubscriptionService(db);
      const result = await subscriptionService.cancelSubscription(userId, { immediate, reason });
      
      if (result.success) {
        return c.json({
          success: true,
          message: immediate 
            ? 'Subscription cancelled immediately' 
            : 'Subscription will be cancelled at end of billing period',
          details: result.details
        });
      }
    }
    
    // Fallback to mock service
    const cancelled = await paymentService.cancelSubscription(userId);
    return c.json({
      success: cancelled,
      message: cancelled ? 'Subscription cancelled' : 'No subscription found'
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return c.json({ success: false, error: 'Failed to cancel subscription' }, 500);
  }
});

// ============================================
// UPGRADE SUBSCRIPTION
// POST /api/v1/payment/upgrade
// ============================================
paymentRoutes.post('/upgrade', async (c) => {
  try {
    const { userId, newPlanId, paymentId } = await c.req.json();
    
    if (!userId || !newPlanId) {
      return c.json({ success: false, error: 'userId and newPlanId are required' }, 400);
    }
    
    const db = c.env?.DB;
    if (!db) {
      // Mock mode - use in-memory service
      await paymentService.createSubscription(userId, newPlanId, paymentId);
      return c.json({
        success: true,
        message: `Upgraded to ${newPlanId} plan`,
        immediate: true
      });
    }
    
    const subscriptionService = createSubscriptionService(db);
    const result = await subscriptionService.upgradeSubscription(userId, newPlanId, { paymentId });
    
    if (!result.success) {
      return c.json({ success: false, error: result.error }, 400);
    }
    
    return c.json({
      success: true,
      message: `Successfully upgraded to ${newPlanId}`,
      subscription: result.subscription,
      calculation: result.calculation,
      immediate: true
    });
  } catch (error) {
    console.error('Upgrade subscription error:', error);
    return c.json({ success: false, error: 'Failed to upgrade subscription' }, 500);
  }
});

// ============================================
// DOWNGRADE SUBSCRIPTION
// POST /api/v1/payment/downgrade
// ============================================
paymentRoutes.post('/downgrade', async (c) => {
  try {
    const { userId, newPlanId, immediate = false, reason } = await c.req.json();
    
    if (!userId || !newPlanId) {
      return c.json({ success: false, error: 'userId and newPlanId are required' }, 400);
    }
    
    const db = c.env?.DB;
    if (!db) {
      // Mock mode
      await paymentService.createSubscription(userId, newPlanId);
      return c.json({
        success: true,
        message: `Downgraded to ${newPlanId} plan`,
        effectiveAt: new Date().toISOString()
      });
    }
    
    const subscriptionService = createSubscriptionService(db);
    const result = await subscriptionService.downgradeSubscription(userId, newPlanId, { immediate, reason });
    
    if (!result.success) {
      return c.json({ success: false, error: result.error }, 400);
    }
    
    return c.json({
      success: true,
      message: immediate 
        ? `Immediately downgraded to ${newPlanId}`
        : `Will downgrade to ${newPlanId} at end of billing period`,
      subscription: result.subscription,
      calculation: result.calculation,
      effectiveAt: result.calculation?.effectiveAt
    });
  } catch (error) {
    console.error('Downgrade subscription error:', error);
    return c.json({ success: false, error: 'Failed to downgrade subscription' }, 500);
  }
});

// ============================================
// REACTIVATE SUBSCRIPTION
// POST /api/v1/payment/reactivate
// ============================================
paymentRoutes.post('/reactivate', async (c) => {
  try {
    const { userId } = await c.req.json();
    
    if (!userId) {
      return c.json({ success: false, error: 'userId is required' }, 400);
    }
    
    const db = c.env?.DB;
    if (!db) {
      return c.json({ success: false, error: 'Database not available' }, 500);
    }
    
    const subscriptionService = createSubscriptionService(db);
    const result = await subscriptionService.reactivateSubscription(userId);
    
    if (!result.success) {
      return c.json({ success: false, error: result.error }, 400);
    }
    
    return c.json({
      success: true,
      message: 'Subscription reactivated successfully',
      subscription: result.subscription
    });
  } catch (error) {
    console.error('Reactivate subscription error:', error);
    return c.json({ success: false, error: 'Failed to reactivate subscription' }, 500);
  }
});

// ============================================
// GET SUBSCRIPTION DETAILS (Enhanced)
// GET /api/v1/payment/subscription-details/:userId
// ============================================
paymentRoutes.get('/subscription-details/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    const db = c.env?.DB;
    if (!db) {
      // Fallback to mock service
      const subscription = await paymentService.getSubscription(userId);
      return c.json({ success: true, subscription, source: 'mock' });
    }
    
    const subscriptionService = createSubscriptionService(db);
    const subscription = await subscriptionService.getSubscription(userId);
    
    if (!subscription) {
      return c.json({
        success: true,
        subscription: null,
        hasActiveSubscription: false
      });
    }
    
    const plan = PLANS[subscription.planId as keyof typeof PLANS];
    
    return c.json({
      success: true,
      subscription: {
        ...subscription,
        planName: plan?.name || subscription.planId,
        planFeatures: plan?.features || [],
        isTrialing: subscription.status === 'trialing',
        isCancelling: subscription.cancelAtPeriodEnd,
        canUpgrade: PLAN_HIERARCHY[subscription.planId] < PLAN_HIERARCHY['enterprise'],
        canDowngrade: PLAN_HIERARCHY[subscription.planId] > PLAN_HIERARCHY['starter']
      },
      hasActiveSubscription: ['active', 'trialing'].includes(subscription.status),
      source: 'database'
    });
  } catch (error) {
    console.error('Get subscription details error:', error);
    return c.json({ success: false, error: 'Failed to get subscription details' }, 500);
  }
});

// ============================================
// CALCULATE PLAN CHANGE
// POST /api/v1/payment/calculate-change
// Preview upgrade/downgrade without committing
// ============================================
paymentRoutes.post('/calculate-change', async (c) => {
  try {
    const { userId, newPlanId } = await c.req.json();
    
    if (!userId || !newPlanId) {
      return c.json({ success: false, error: 'userId and newPlanId are required' }, 400);
    }
    
    const db = c.env?.DB;
    if (!db) {
      return c.json({ success: false, error: 'Database not available' }, 500);
    }
    
    const subscriptionService = createSubscriptionService(db);
    const currentSub = await subscriptionService.getSubscription(userId);
    
    if (!currentSub) {
      return c.json({ success: false, error: 'No active subscription found' }, 400);
    }
    
    const currentLevel = PLAN_HIERARCHY[currentSub.planId] || 0;
    const newLevel = PLAN_HIERARCHY[newPlanId] || 0;
    
    if (currentLevel === newLevel) {
      return c.json({ success: false, error: 'Already on this plan' }, 400);
    }
    
    const isUpgrade = newLevel > currentLevel;
    
    if (isUpgrade) {
      const calculation = subscriptionService.calculateUpgrade(
        currentSub.planId,
        newPlanId,
        new Date(currentSub.currentPeriodEnd),
        currentSub.billingCycle as 'monthly' | 'yearly',
        currentSub.currency as 'USD' | 'INR'
      );
      
      return c.json({
        success: true,
        changeType: 'upgrade',
        immediate: true,
        calculation,
        summary: {
          fromPlan: currentSub.planId,
          toPlan: newPlanId,
          prorationCredit: calculation.prorationCredit / 100,
          newPlanCharge: calculation.newPlanCharge / 100,
          netCharge: calculation.netCharge / 100,
          currency: currentSub.currency,
          effectiveAt: 'Immediately'
        }
      });
    } else {
      const calculation = subscriptionService.calculateDowngrade(
        currentSub.planId,
        newPlanId,
        new Date(currentSub.currentPeriodEnd),
        currentSub.billingCycle as 'monthly' | 'yearly',
        currentSub.currency as 'USD' | 'INR'
      );
      
      return c.json({
        success: true,
        changeType: 'downgrade',
        immediate: false,
        calculation,
        summary: {
          fromPlan: currentSub.planId,
          toPlan: newPlanId,
          creditAmount: calculation.creditAmount / 100,
          unusedDays: calculation.unusedDays,
          currency: currentSub.currency,
          effectiveAt: calculation.effectiveAt.toISOString()
        }
      });
    }
  } catch (error) {
    console.error('Calculate change error:', error);
    return c.json({ success: false, error: 'Failed to calculate plan change' }, 500);
  }
});

// ============================================
// GET SUBSCRIPTION HISTORY
// GET /api/v1/payment/history/:userId
// ============================================
paymentRoutes.get('/history/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    const db = c.env?.DB;
    if (!db) {
      return c.json({ success: true, history: [], source: 'mock' });
    }
    
    const subscriptionService = createSubscriptionService(db);
    const subscription = await subscriptionService.getSubscription(userId);
    
    return c.json({
      success: true,
      history: subscription?.history || [],
      subscriptionId: subscription?.id
    });
  } catch (error) {
    console.error('Get subscription history error:', error);
    return c.json({ success: false, error: 'Failed to get history' }, 500);
  }
});

// ============================================
// GET PLANS
// GET /api/v1/payment/plans
// ============================================
paymentRoutes.get('/plans', async (c) => {
  const currency = c.req.query('currency') || 'USD';
  const userId = c.req.query('userId');

  // Get current subscription if userId provided
  let currentPlan: string | null = null;
  let currentStatus: string | null = null;
  
  if (userId) {
    const db = c.env?.DB;
    if (db) {
      const subscriptionService = createSubscriptionService(db);
      const subscription = await subscriptionService.getSubscription(userId);
      if (subscription) {
        currentPlan = subscription.planId;
        currentStatus = subscription.status;
      }
    } else {
      const subscription = await paymentService.getSubscription(userId);
      if (subscription) {
        currentPlan = subscription.planId;
        currentStatus = subscription.status;
      }
    }
  }

  const plans = Object.values(PLANS).map(plan => {
    const planLevel = PLAN_HIERARCHY[plan.id] || 0;
    const currentLevel = currentPlan ? (PLAN_HIERARCHY[currentPlan] || 0) : 0;
    const isCurrentPlan = currentPlan === plan.id && currentStatus && ['active', 'trialing'].includes(currentStatus);
    const isUpgrade = currentLevel > 0 && planLevel > currentLevel;
    const isDowngrade = currentLevel > 0 && planLevel < currentLevel;
    
    let ctaLabel = plan.id === 'enterprise' 
      ? 'Contact Sales' 
      : plan.trialDays > 0 
        ? 'Start 7-Day Free Trial' 
        : 'Get Started';
    
    if (isCurrentPlan) {
      ctaLabel = 'Current Plan';
    } else if (isUpgrade) {
      ctaLabel = 'Upgrade';
    } else if (isDowngrade) {
      ctaLabel = 'Downgrade';
    }
    
    return {
      id: plan.id,
      name: plan.name,
      price: currency === 'INR' ? plan.priceINR : plan.priceUSD,
      yearlyPrice: currency === 'INR' ? plan.yearlyPriceINR : plan.yearlyPriceUSD,
      currency,
      trialDays: plan.trialDays,
      requiresCard: plan.requiresCard,
      features: plan.features,
      hasTrial: plan.trialDays > 0,
      ctaLabel,
      isCurrentPlan,
      isUpgrade,
      isDowngrade,
      level: planLevel
    };
  });

  return c.json({
    success: true,
    plans,
    currency,
    currentPlan,
    currentStatus
  });
});

// ============================================
// RAZORPAY WEBHOOK ENDPOINT
// POST /api/v1/payment/webhook
// Per Razorpay docs: https://razorpay.com/docs/webhooks/
// ============================================
paymentRoutes.post('/webhook', async (c) => {
  try {
    // Get raw body for signature verification
    const rawBody = await c.req.text();
    
    // Get Razorpay signature from headers
    // Per docs: x-razorpay-signature header contains the signature
    const signature = c.req.header('x-razorpay-signature') || 
                     c.req.header('X-Razorpay-Signature') || 
                     '';

    // Verify signature
    const isValid = await paymentService.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.error('[Webhook] Invalid signature');
      return c.json({ 
        success: false, 
        error: 'Invalid webhook signature' 
      }, 401);
    }

    // Parse the webhook payload
    const payload: RazorpayWebhookPayload = JSON.parse(rawBody);
    
    console.log(`[Webhook] Received event: ${payload.event}`);
    
    // Process the webhook event
    const result = await paymentService.processWebhook(payload, signature);
    
    if (result.success) {
      // Return 200 OK to acknowledge receipt (required by Razorpay)
      return c.json({
        success: true,
        event: result.event,
        message: result.message
      });
    } else {
      // Return error but still 200 to prevent retries for handled errors
      return c.json({
        success: false,
        event: result.event,
        message: result.message
      });
    }
  } catch (error) {
    console.error('[Webhook] Processing error:', error);
    // Return 500 to trigger retry by Razorpay
    return c.json({ 
      success: false, 
      error: 'Webhook processing failed' 
    }, 500);
  }
});

// ============================================
// SIMULATE WEBHOOK (for testing/demo)
// POST /api/v1/payment/webhook/simulate
// ============================================
paymentRoutes.post('/webhook/simulate', async (c) => {
  try {
    const { eventType, orderId, userId } = await c.req.json();
    
    if (!eventType) {
      return c.json({ 
        success: false, 
        error: 'eventType is required' 
      }, 400);
    }

    const validEvents: RazorpayWebhookEvent[] = [
      'payment.authorized',
      'payment.captured',
      'payment.failed',
      'order.paid',
      'subscription.activated',
      'subscription.charged',
      'subscription.cancelled',
      'subscription.halted'
    ];

    if (!validEvents.includes(eventType as RazorpayWebhookEvent)) {
      return c.json({ 
        success: false, 
        error: `Invalid event type. Valid types: ${validEvents.join(', ')}` 
      }, 400);
    }

    const result = await paymentService.simulateWebhook(
      eventType as RazorpayWebhookEvent,
      orderId,
      userId
    );

    return c.json({
      success: true,
      simulation: true,
      result
    });
  } catch (error) {
    console.error('[Webhook Simulate] Error:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to simulate webhook' 
    }, 500);
  }
});

// ============================================
// GET WEBHOOK EVENTS (audit trail)
// GET /api/v1/payment/webhook/events
// ============================================
paymentRoutes.get('/webhook/events', async (c) => {
  try {
    const events = paymentService.getWebhookEvents();
    
    return c.json({
      success: true,
      events: events.slice(-50), // Return last 50 events
      total: events.length
    });
  } catch (error) {
    console.error('[Webhook Events] Error:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to get webhook events' 
    }, 500);
  }
});

export { paymentRoutes };
