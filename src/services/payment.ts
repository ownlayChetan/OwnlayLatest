// OWNLAY Payment Service
// Razorpay Integration with Webhooks - Per Razorpay Documentation
// Reference: https://razorpay.com/docs/webhooks/
// Version: 4.3.0

// ============================================
// PAYMENT CONFIGURATION
// Set RAZORPAY_LIVE_MODE = true when going live
// ============================================
const RAZORPAY_LIVE_MODE = false;

// Credentials - In production, use environment variables
// When RAZORPAY_LIVE_MODE is false, we use mock credentials
const RAZORPAY_KEY_ID = RAZORPAY_LIVE_MODE ? 'rzp_live_XXXXXXXXXX' : 'rzp_test_OWNLAYdemo123';
const RAZORPAY_KEY_SECRET = RAZORPAY_LIVE_MODE ? 'XXXXXXXXXXXXXXXX' : 'test_secret_OWNLAYdemo456';
const RAZORPAY_WEBHOOK_SECRET = RAZORPAY_LIVE_MODE ? 'XXXXXXXXXXXXXXXX' : 'whsec_OWNLAYtest789';

// ============================================
// PLAN DEFINITIONS
// ============================================
export const PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    priceUSD: 29,
    priceINR: 1999,
    yearlyPriceUSD: 24,
    yearlyPriceINR: 1666,
    trialDays: 7, // Only Starter has free trial
    requiresCard: false, // No card required for Starter trial
    features: ['3 users', '3 channel connectors', 'Basic AI insights', '30-day data retention'],
    razorpayPlanIdUSD: 'plan_starter_usd_monthly',
    razorpayPlanIdINR: 'plan_starter_inr_monthly'
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    priceUSD: 79,
    priceINR: 4999,
    yearlyPriceUSD: 66,
    yearlyPriceINR: 4166,
    trialDays: 0, // No free trial
    requiresCard: true,
    features: ['10 users', '7 channel connectors', 'Advanced AI insights', '90-day data retention', 'Campaign Builder'],
    razorpayPlanIdUSD: 'plan_growth_usd_monthly',
    razorpayPlanIdINR: 'plan_growth_inr_monthly'
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    priceUSD: 149,
    priceINR: 9999,
    yearlyPriceUSD: 124,
    yearlyPriceINR: 8333,
    trialDays: 0, // No free trial
    requiresCard: true,
    features: ['25 users', 'Unlimited connectors', 'Full AI suite', '1-year data retention', 'Ad Manager', 'Creative Studio'],
    razorpayPlanIdUSD: 'plan_pro_usd_monthly',
    razorpayPlanIdINR: 'plan_pro_inr_monthly'
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    priceUSD: 0, // Custom pricing
    priceINR: 0,
    yearlyPriceUSD: 0,
    yearlyPriceINR: 0,
    trialDays: 0,
    requiresCard: false, // Contact sales
    features: ['Unlimited everything', 'Custom integrations', 'SSO/SAML', 'White-label', 'Dedicated support'],
    razorpayPlanIdUSD: null,
    razorpayPlanIdINR: null
  }
};

// ============================================
// SUBSCRIPTION STATUS
// ============================================
export type SubscriptionStatus = 
  | 'active'           // Paid and active
  | 'trialing'         // In free trial period
  | 'trial_expired'    // Trial ended, needs payment
  | 'past_due'         // Payment failed, grace period
  | 'cancelled'        // User cancelled
  | 'unpaid';          // No subscription

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEnd?: string;
  cancelledAt?: string;
  razorpaySubscriptionId?: string;
  razorpayCustomerId?: string;
}

// ============================================
// MOCK RAZORPAY GATEWAY
// Replace with real Razorpay SDK calls in production
// ============================================

export interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: 'created' | 'attempted' | 'paid' | 'failed';
  planId: string;
  billingCycle: 'monthly' | 'yearly';
}

export interface PaymentResult {
  success: boolean;
  orderId?: string;
  paymentId?: string;
  subscriptionId?: string;
  error?: string;
}

// Razorpay Webhook Event Types (per Razorpay documentation)
// https://razorpay.com/docs/webhooks/payloads/
export type RazorpayWebhookEvent = 
  | 'payment.authorized'       // Payment authorized, ready to capture
  | 'payment.captured'         // Payment captured successfully
  | 'payment.failed'           // Payment failed
  | 'order.paid'              // Order marked as paid
  | 'subscription.activated'   // Subscription activated
  | 'subscription.charged'     // Subscription charged successfully
  | 'subscription.cancelled'   // Subscription cancelled
  | 'subscription.paused'      // Subscription paused
  | 'subscription.resumed'     // Subscription resumed
  | 'subscription.halted'      // Subscription halted due to failures
  | 'subscription.pending';    // Subscription pending

// Razorpay Webhook Payload Structure
export interface RazorpayWebhookPayload {
  entity: 'event';
  account_id: string;
  event: RazorpayWebhookEvent;
  contains: string[];
  created_at: number;
  payload: {
    payment?: {
      entity: {
        id: string;
        entity: string;
        amount: number;
        currency: string;
        status: string;
        order_id: string;
        invoice_id?: string;
        international: boolean;
        method: string;
        amount_refunded: number;
        refund_status?: string;
        captured: boolean;
        description?: string;
        card_id?: string;
        bank?: string;
        wallet?: string;
        vpa?: string;
        email: string;
        contact: string;
        customer_id?: string;
        notes: Record<string, string>;
        fee?: number;
        tax?: number;
        error_code?: string;
        error_description?: string;
        error_source?: string;
        error_step?: string;
        error_reason?: string;
        acquirer_data?: {
          bank_transaction_id?: string;
          rrn?: string;
          authentication_reference_number?: string;
        };
        created_at: number;
      };
    };
    subscription?: {
      entity: {
        id: string;
        entity: string;
        plan_id: string;
        customer_id: string;
        status: string;
        current_start: number;
        current_end: number;
        ended_at?: number;
        quantity: number;
        notes: Record<string, string>;
        charge_at: number;
        offer_id?: string;
        short_url: string;
        has_scheduled_changes: boolean;
        change_scheduled_at?: number;
        source: string;
        payment_method: string;
        created_at: number;
      };
    };
    order?: {
      entity: {
        id: string;
        entity: string;
        amount: number;
        amount_paid: number;
        amount_due: number;
        currency: string;
        receipt: string;
        offer_id?: string;
        status: string;
        attempts: number;
        notes: Record<string, string>;
        created_at: number;
      };
    };
  };
}

// Webhook processing result
export interface WebhookResult {
  success: boolean;
  event?: RazorpayWebhookEvent;
  message: string;
  data?: any;
}

// Mock order storage (in production, use database)
const mockOrders = new Map<string, PaymentOrder>();
const mockSubscriptions = new Map<string, Subscription>();
// Store webhook events for audit trail
const webhookEvents = new Map<string, { event: RazorpayWebhookPayload; processedAt: string; result: WebhookResult }>();

export class PaymentService {
  private isLiveMode: boolean;

  constructor() {
    this.isLiveMode = RAZORPAY_LIVE_MODE;
  }

  // ============================================
  // CREATE ORDER
  // In production: Call Razorpay Orders API
  // ============================================
  async createOrder(
    planId: string,
    billingCycle: 'monthly' | 'yearly',
    currency: 'USD' | 'INR'
  ): Promise<PaymentOrder> {
    const plan = PLANS[planId as keyof typeof PLANS];
    if (!plan) {
      throw new Error('Invalid plan');
    }

    const amount = billingCycle === 'yearly'
      ? (currency === 'INR' ? plan.yearlyPriceINR * 12 : plan.yearlyPriceUSD * 12)
      : (currency === 'INR' ? plan.priceINR : plan.priceUSD);

    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const order: PaymentOrder = {
      id: orderId,
      amount: amount * 100, // Razorpay uses paise/cents
      currency,
      receipt: `receipt_${planId}_${Date.now()}`,
      status: 'created',
      planId,
      billingCycle
    };

    mockOrders.set(orderId, order);

    // In production:
    // const razorpay = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
    // const order = await razorpay.orders.create({ amount, currency, receipt });
    
    return order;
  }

  // ============================================
  // VERIFY PAYMENT
  // In production: Verify signature using Razorpay SDK
  // ============================================
  async verifyPayment(
    orderId: string,
    paymentId: string,
    signature: string
  ): Promise<PaymentResult> {
    const order = mockOrders.get(orderId);
    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    // In mock mode, always succeed for valid orders
    // In production:
    // const generatedSignature = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET)
    //   .update(orderId + '|' + paymentId)
    //   .digest('hex');
    // if (generatedSignature !== signature) {
    //   return { success: false, error: 'Invalid signature' };
    // }

    order.status = 'paid';
    mockOrders.set(orderId, order);

    return {
      success: true,
      orderId,
      paymentId: paymentId || `pay_${Date.now()}`
    };
  }

  // ============================================
  // CREATE SUBSCRIPTION
  // ============================================
  async createSubscription(
    userId: string,
    planId: string,
    paymentId?: string
  ): Promise<Subscription> {
    const plan = PLANS[planId as keyof typeof PLANS];
    if (!plan) {
      throw new Error('Invalid plan');
    }

    const now = new Date();
    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    let status: SubscriptionStatus;
    let periodEnd: Date;
    let trialEnd: Date | undefined;

    if (plan.trialDays > 0 && !paymentId) {
      // Start trial (only for Starter plan)
      status = 'trialing';
      trialEnd = new Date(now.getTime() + plan.trialDays * 24 * 60 * 60 * 1000);
      periodEnd = trialEnd;
    } else if (paymentId) {
      // Paid subscription
      status = 'active';
      periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
    } else {
      // No trial, no payment = unpaid
      status = 'unpaid';
      periodEnd = now;
    }

    const subscription: Subscription = {
      id: subscriptionId,
      userId,
      planId,
      status,
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
      trialEnd: trialEnd?.toISOString(),
      razorpaySubscriptionId: `rzp_sub_${subscriptionId}`
    };

    mockSubscriptions.set(userId, subscription);

    return subscription;
  }

  // ============================================
  // GET USER SUBSCRIPTION
  // ============================================
  async getSubscription(userId: string): Promise<Subscription | null> {
    return mockSubscriptions.get(userId) || null;
  }

  // ============================================
  // CHECK IF USER CAN ACCESS FEATURE
  // ============================================
  async canAccessFeature(userId: string, feature: string): Promise<boolean> {
    const subscription = await this.getSubscription(userId);
    
    if (!subscription) return false;
    
    // Active or trialing subscriptions can access features
    if (subscription.status !== 'active' && subscription.status !== 'trialing') {
      return false;
    }

    // Check if trial has expired
    if (subscription.status === 'trialing' && subscription.trialEnd) {
      if (new Date(subscription.trialEnd) < new Date()) {
        return false;
      }
    }

    return true;
  }

  // ============================================
  // CHECK IF USER CAN CONNECT INTEGRATIONS
  // Integrations require a paid plan
  // ============================================
  async canConnectIntegrations(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const subscription = await this.getSubscription(userId);

    if (!subscription) {
      return {
        allowed: false,
        reason: 'Please purchase a plan to connect integrations'
      };
    }

    // Trial users can connect integrations
    if (subscription.status === 'trialing') {
      if (subscription.trialEnd && new Date(subscription.trialEnd) < new Date()) {
        return {
          allowed: false,
          reason: 'Your trial has expired. Please upgrade to continue using integrations.'
        };
      }
      return { allowed: true };
    }

    // Only active paid subscriptions can connect
    if (subscription.status !== 'active') {
      return {
        allowed: false,
        reason: 'Please activate your subscription to connect integrations'
      };
    }

    return { allowed: true };
  }

  // ============================================
  // CANCEL SUBSCRIPTION
  // ============================================
  async cancelSubscription(userId: string): Promise<boolean> {
    const subscription = mockSubscriptions.get(userId);
    if (!subscription) return false;

    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date().toISOString();
    mockSubscriptions.set(userId, subscription);

    return true;
  }

  // ============================================
  // GET RAZORPAY CHECKOUT OPTIONS
  // These options are passed to Razorpay Checkout
  // ============================================
  getCheckoutOptions(
    order: PaymentOrder,
    userEmail: string,
    userName: string
  ): object {
    const plan = PLANS[order.planId as keyof typeof PLANS];

    return {
      key: RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'OWNLAY',
      description: `${plan.name} Plan - ${order.billingCycle === 'yearly' ? 'Annual' : 'Monthly'}`,
      order_id: order.id,
      prefill: {
        name: userName,
        email: userEmail
      },
      theme: {
        color: '#6366f1'
      },
      modal: {
        ondismiss: function() {
          console.log('Payment modal dismissed');
        }
      }
    };
  }

  // ============================================
  // WEBHOOK SIGNATURE VERIFICATION
  // Per Razorpay docs: https://razorpay.com/docs/webhooks/validate-webhooks/
  // ============================================
  async verifyWebhookSignature(
    payload: string,
    signature: string
  ): Promise<boolean> {
    if (!this.isLiveMode) {
      // In mock mode, accept signature if it matches our mock pattern
      // Format: sha256=mock_signature_{timestamp}
      return signature.startsWith('sha256=mock_signature_') || signature === RAZORPAY_WEBHOOK_SECRET;
    }

    // In production, verify using HMAC SHA256
    // const crypto = require('crypto');
    // const expectedSignature = crypto
    //   .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
    //   .update(payload)
    //   .digest('hex');
    // return expectedSignature === signature;
    
    return true; // Placeholder for production implementation
  }

  // ============================================
  // PROCESS WEBHOOK EVENT
  // Per Razorpay docs: https://razorpay.com/docs/webhooks/
  // ============================================
  async processWebhook(
    payload: RazorpayWebhookPayload,
    signature: string
  ): Promise<WebhookResult> {
    const eventId = `${payload.event}_${payload.created_at}`;
    
    // Check for duplicate events
    if (webhookEvents.has(eventId)) {
      return {
        success: true,
        event: payload.event,
        message: 'Event already processed (idempotent)'
      };
    }

    // Process based on event type
    let result: WebhookResult;

    switch (payload.event) {
      case 'payment.authorized':
        result = await this.handlePaymentAuthorized(payload);
        break;
      
      case 'payment.captured':
        result = await this.handlePaymentCaptured(payload);
        break;
      
      case 'payment.failed':
        result = await this.handlePaymentFailed(payload);
        break;
      
      case 'order.paid':
        result = await this.handleOrderPaid(payload);
        break;
      
      case 'subscription.activated':
        result = await this.handleSubscriptionActivated(payload);
        break;
      
      case 'subscription.charged':
        result = await this.handleSubscriptionCharged(payload);
        break;
      
      case 'subscription.cancelled':
        result = await this.handleSubscriptionCancelled(payload);
        break;
      
      case 'subscription.halted':
        result = await this.handleSubscriptionHalted(payload);
        break;
      
      default:
        result = {
          success: true,
          event: payload.event,
          message: `Unhandled event type: ${payload.event}`
        };
    }

    // Store webhook event for audit trail
    webhookEvents.set(eventId, {
      event: payload,
      processedAt: new Date().toISOString(),
      result
    });

    return result;
  }

  // ============================================
  // WEBHOOK EVENT HANDLERS
  // ============================================

  private async handlePaymentAuthorized(payload: RazorpayWebhookPayload): Promise<WebhookResult> {
    const payment = payload.payload.payment?.entity;
    if (!payment) {
      return { success: false, event: 'payment.authorized', message: 'Missing payment entity' };
    }

    console.log(`[Webhook] Payment authorized: ${payment.id} for order ${payment.order_id}`);
    
    // Auto-capture the payment (in production, you might want to verify first)
    // In mock mode, we just acknowledge the event
    
    return {
      success: true,
      event: 'payment.authorized',
      message: `Payment ${payment.id} authorized. Amount: ${payment.amount / 100} ${payment.currency}`,
      data: {
        paymentId: payment.id,
        orderId: payment.order_id,
        amount: payment.amount,
        currency: payment.currency,
        email: payment.email
      }
    };
  }

  private async handlePaymentCaptured(payload: RazorpayWebhookPayload): Promise<WebhookResult> {
    const payment = payload.payload.payment?.entity;
    if (!payment) {
      return { success: false, event: 'payment.captured', message: 'Missing payment entity' };
    }

    console.log(`[Webhook] Payment captured: ${payment.id}`);

    // Find the order and update its status
    const order = mockOrders.get(payment.order_id);
    if (order) {
      order.status = 'paid';
      mockOrders.set(payment.order_id, order);
    }

    return {
      success: true,
      event: 'payment.captured',
      message: `Payment ${payment.id} captured successfully`,
      data: {
        paymentId: payment.id,
        orderId: payment.order_id,
        amount: payment.amount,
        fee: payment.fee,
        tax: payment.tax
      }
    };
  }

  private async handlePaymentFailed(payload: RazorpayWebhookPayload): Promise<WebhookResult> {
    const payment = payload.payload.payment?.entity;
    if (!payment) {
      return { success: false, event: 'payment.failed', message: 'Missing payment entity' };
    }

    console.log(`[Webhook] Payment failed: ${payment.id} - ${payment.error_description}`);

    // Update order status
    const order = mockOrders.get(payment.order_id);
    if (order) {
      order.status = 'failed';
      mockOrders.set(payment.order_id, order);
    }

    return {
      success: true,
      event: 'payment.failed',
      message: `Payment ${payment.id} failed: ${payment.error_description}`,
      data: {
        paymentId: payment.id,
        orderId: payment.order_id,
        errorCode: payment.error_code,
        errorDescription: payment.error_description,
        errorReason: payment.error_reason
      }
    };
  }

  private async handleOrderPaid(payload: RazorpayWebhookPayload): Promise<WebhookResult> {
    const order = payload.payload.order?.entity;
    const payment = payload.payload.payment?.entity;
    
    if (!order) {
      return { success: false, event: 'order.paid', message: 'Missing order entity' };
    }

    console.log(`[Webhook] Order paid: ${order.id}`);

    // Update our local order record
    const localOrder = mockOrders.get(order.id);
    if (localOrder) {
      localOrder.status = 'paid';
      mockOrders.set(order.id, localOrder);
      
      // Create/update subscription based on the order
      const userId = order.notes?.userId;
      if (userId && payment) {
        await this.createSubscription(userId, localOrder.planId, payment.id);
      }
    }

    return {
      success: true,
      event: 'order.paid',
      message: `Order ${order.id} marked as paid`,
      data: {
        orderId: order.id,
        amountPaid: order.amount_paid,
        paymentId: payment?.id
      }
    };
  }

  private async handleSubscriptionActivated(payload: RazorpayWebhookPayload): Promise<WebhookResult> {
    const subscription = payload.payload.subscription?.entity;
    if (!subscription) {
      return { success: false, event: 'subscription.activated', message: 'Missing subscription entity' };
    }

    console.log(`[Webhook] Subscription activated: ${subscription.id}`);

    // Update local subscription
    const userId = subscription.notes?.userId;
    if (userId) {
      const localSub = mockSubscriptions.get(userId);
      if (localSub) {
        localSub.status = 'active';
        localSub.razorpaySubscriptionId = subscription.id;
        mockSubscriptions.set(userId, localSub);
      }
    }

    return {
      success: true,
      event: 'subscription.activated',
      message: `Subscription ${subscription.id} activated`,
      data: {
        subscriptionId: subscription.id,
        planId: subscription.plan_id,
        status: subscription.status,
        currentEnd: new Date(subscription.current_end * 1000).toISOString()
      }
    };
  }

  private async handleSubscriptionCharged(payload: RazorpayWebhookPayload): Promise<WebhookResult> {
    const subscription = payload.payload.subscription?.entity;
    const payment = payload.payload.payment?.entity;
    
    if (!subscription) {
      return { success: false, event: 'subscription.charged', message: 'Missing subscription entity' };
    }

    console.log(`[Webhook] Subscription charged: ${subscription.id}`);

    // Extend subscription period
    const userId = subscription.notes?.userId;
    if (userId) {
      const localSub = mockSubscriptions.get(userId);
      if (localSub) {
        localSub.currentPeriodEnd = new Date(subscription.current_end * 1000).toISOString();
        localSub.status = 'active';
        mockSubscriptions.set(userId, localSub);
      }
    }

    return {
      success: true,
      event: 'subscription.charged',
      message: `Subscription ${subscription.id} charged successfully`,
      data: {
        subscriptionId: subscription.id,
        paymentId: payment?.id,
        chargeAt: new Date(subscription.charge_at * 1000).toISOString(),
        currentEnd: new Date(subscription.current_end * 1000).toISOString()
      }
    };
  }

  private async handleSubscriptionCancelled(payload: RazorpayWebhookPayload): Promise<WebhookResult> {
    const subscription = payload.payload.subscription?.entity;
    if (!subscription) {
      return { success: false, event: 'subscription.cancelled', message: 'Missing subscription entity' };
    }

    console.log(`[Webhook] Subscription cancelled: ${subscription.id}`);

    const userId = subscription.notes?.userId;
    if (userId) {
      await this.cancelSubscription(userId);
    }

    return {
      success: true,
      event: 'subscription.cancelled',
      message: `Subscription ${subscription.id} cancelled`,
      data: {
        subscriptionId: subscription.id,
        endedAt: subscription.ended_at ? new Date(subscription.ended_at * 1000).toISOString() : null
      }
    };
  }

  private async handleSubscriptionHalted(payload: RazorpayWebhookPayload): Promise<WebhookResult> {
    const subscription = payload.payload.subscription?.entity;
    if (!subscription) {
      return { success: false, event: 'subscription.halted', message: 'Missing subscription entity' };
    }

    console.log(`[Webhook] Subscription halted: ${subscription.id}`);

    const userId = subscription.notes?.userId;
    if (userId) {
      const localSub = mockSubscriptions.get(userId);
      if (localSub) {
        localSub.status = 'past_due';
        mockSubscriptions.set(userId, localSub);
      }
    }

    return {
      success: true,
      event: 'subscription.halted',
      message: `Subscription ${subscription.id} halted due to payment failures`,
      data: {
        subscriptionId: subscription.id,
        status: 'halted'
      }
    };
  }

  // ============================================
  // GET WEBHOOK EVENTS (for debugging/audit)
  // ============================================
  getWebhookEvents(): Array<{ eventId: string; event: RazorpayWebhookPayload; processedAt: string; result: WebhookResult }> {
    return Array.from(webhookEvents.entries()).map(([eventId, data]) => ({
      eventId,
      ...data
    }));
  }

  // ============================================
  // SIMULATE WEBHOOK (for testing/demo)
  // ============================================
  async simulateWebhook(
    eventType: RazorpayWebhookEvent,
    orderId?: string,
    userId?: string
  ): Promise<WebhookResult> {
    const timestamp = Math.floor(Date.now() / 1000);
    
    const basePayload: RazorpayWebhookPayload = {
      entity: 'event',
      account_id: 'acc_OWNLAYtest123',
      event: eventType,
      contains: [],
      created_at: timestamp,
      payload: {}
    };

    // Build event-specific payload
    switch (eventType) {
      case 'payment.captured':
      case 'payment.authorized':
        basePayload.contains = ['payment'];
        basePayload.payload.payment = {
          entity: {
            id: `pay_${Date.now()}`,
            entity: 'payment',
            amount: 2900,
            currency: 'USD',
            status: eventType === 'payment.captured' ? 'captured' : 'authorized',
            order_id: orderId || `order_${Date.now()}`,
            international: false,
            method: 'card',
            amount_refunded: 0,
            captured: eventType === 'payment.captured',
            email: 'demo@ownlay.com',
            contact: '+1234567890',
            notes: { userId: userId || 'demo_user' },
            created_at: timestamp
          }
        };
        break;

      case 'order.paid':
        basePayload.contains = ['order', 'payment'];
        basePayload.payload.order = {
          entity: {
            id: orderId || `order_${Date.now()}`,
            entity: 'order',
            amount: 2900,
            amount_paid: 2900,
            amount_due: 0,
            currency: 'USD',
            receipt: `receipt_${Date.now()}`,
            status: 'paid',
            attempts: 1,
            notes: { userId: userId || 'demo_user' },
            created_at: timestamp
          }
        };
        basePayload.payload.payment = {
          entity: {
            id: `pay_${Date.now()}`,
            entity: 'payment',
            amount: 2900,
            currency: 'USD',
            status: 'captured',
            order_id: orderId || `order_${Date.now()}`,
            international: false,
            method: 'card',
            amount_refunded: 0,
            captured: true,
            email: 'demo@ownlay.com',
            contact: '+1234567890',
            notes: { userId: userId || 'demo_user' },
            created_at: timestamp
          }
        };
        break;

      case 'subscription.activated':
        basePayload.contains = ['subscription'];
        basePayload.payload.subscription = {
          entity: {
            id: `sub_${Date.now()}`,
            entity: 'subscription',
            plan_id: 'plan_starter_usd_monthly',
            customer_id: `cust_${Date.now()}`,
            status: 'active',
            current_start: timestamp,
            current_end: timestamp + (30 * 24 * 60 * 60),
            quantity: 1,
            notes: { userId: userId || 'demo_user' },
            charge_at: timestamp + (30 * 24 * 60 * 60),
            short_url: 'https://rzp.io/i/demo',
            has_scheduled_changes: false,
            source: 'api',
            payment_method: 'card',
            created_at: timestamp
          }
        };
        break;
    }

    return this.processWebhook(basePayload, `sha256=mock_signature_${timestamp}`);
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
