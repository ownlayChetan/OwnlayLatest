import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Plan hierarchy for comparison
// Free plan: 7-day trial for new users with full access (except SOON features)
// Starter, Growth, Pro have specific feature access
const PLAN_HIERARCHY = {
  'none': 0,
  'free': 0.5, // Free 7-day trial with full feature access
  'starter': 1,
  'growth': 2,
  'pro': 3,
  'enterprise': 4,
} as const;

export type PlanType = keyof typeof PLAN_HIERARCHY;

export interface Subscription {
  plan: PlanType;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'expired' | 'none';
  expiresAt?: string;
  trialEndsAt?: string;
  isTrial?: boolean;
  features: {
    dashboard: boolean;
    adManager: boolean;
    campaignBuilder: boolean;
    creativeStudio: boolean;
    agentCommandCentre: boolean;
    advancedAnalytics: boolean;
    integrations: boolean;
    prioritySupport: boolean;
    customIntegrations: boolean;
    teamMembers: number;
    apiAccess: boolean;
  };
}

interface SubscriptionState {
  subscription: Subscription | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  showPlanSelectionModal: boolean;
  
  // Actions
  setSubscriptionFromUser: (plan: PlanType | undefined, trialEndsAt?: string, accountType?: string) => void;
  isPro: () => boolean;
  isGrowthOrAbove: () => boolean;
  isStarterOrAbove: () => boolean;
  isFreeUser: () => boolean;
  hasFeature: (feature: keyof Subscription['features']) => boolean;
  canAccessPage: (page: 'dashboard' | 'agents' | 'analytics' | 'campaigns' | 'integrations' | 'settings') => boolean;
  getPlanDisplayName: () => string;
  isTrialExpired: () => boolean;
  getDaysLeftInTrial: () => number;
  clearSubscription: () => void;
  setShowPlanSelectionModal: (show: boolean) => void;
  checkTrialStatus: () => void;
}

// Feature configuration by plan
// Free: 7-day trial with FULL access to all features (except SOON)
// Starter: Dashboard + Ad Manager ONLY
// Growth: Starter + Campaign Builder + Creative Studio ONLY  
// Pro: Growth + Agent Command Centre + Advanced Analytics
// Integrations: Available to ALL plans
const PLAN_FEATURES: Record<PlanType, Subscription['features']> = {
  'none': {
    dashboard: false,
    adManager: false,
    campaignBuilder: false,
    creativeStudio: false,
    agentCommandCentre: false,
    advancedAnalytics: false,
    integrations: false,
    prioritySupport: false,
    customIntegrations: false,
    teamMembers: 0,
    apiAccess: false,
  },
  'free': {
    // Free trial gets FULL access to all features for 7 days
    dashboard: true,
    adManager: true,
    campaignBuilder: true,
    creativeStudio: true,
    agentCommandCentre: true, // Full access during trial
    advancedAnalytics: true,  // Full access during trial
    integrations: true,
    prioritySupport: false,
    customIntegrations: false,
    teamMembers: 3,
    apiAccess: true,
  },
  'starter': {
    dashboard: true,
    adManager: true,
    campaignBuilder: false, // Not in Starter
    creativeStudio: false, // Not in Starter
    agentCommandCentre: false,
    advancedAnalytics: false,
    integrations: true, // All plans
    prioritySupport: false,
    customIntegrations: false,
    teamMembers: 2,
    apiAccess: false,
  },
  'growth': {
    dashboard: true,
    adManager: true,
    campaignBuilder: true, // Added in Growth
    creativeStudio: true, // Added in Growth
    agentCommandCentre: false,
    advancedAnalytics: false,
    integrations: true,
    prioritySupport: false,
    customIntegrations: false,
    teamMembers: 5,
    apiAccess: true,
  },
  'pro': {
    dashboard: true,
    adManager: true,
    campaignBuilder: true,
    creativeStudio: true,
    agentCommandCentre: true, // Added in Pro
    advancedAnalytics: true, // Added in Pro
    integrations: true,
    prioritySupport: true,
    customIntegrations: true,
    teamMembers: 10,
    apiAccess: true,
  },
  'enterprise': {
    dashboard: true,
    adManager: true,
    campaignBuilder: true,
    creativeStudio: true,
    agentCommandCentre: true,
    advancedAnalytics: true,
    integrations: true,
    prioritySupport: true,
    customIntegrations: true,
    teamMembers: -1, // unlimited
    apiAccess: true,
  },
};

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      subscription: null,
      isLoading: false,
      error: null,
      lastFetched: null,
      showPlanSelectionModal: false,

      setSubscriptionFromUser: (plan: PlanType | undefined, trialEndsAt?: string, _accountType?: string) => {
        // Handle new users without a plan - give them Free Plan (7-day trial with full access)
        let validPlan: PlanType;
        let status: Subscription['status'] = 'active';
        let isTrial = false;
        let trialEnd = trialEndsAt;
        
        if (!plan || plan === 'none') {
          // New user - start Free Plan (7-day trial with full feature access)
          validPlan = 'free';
          status = 'trialing';
          isTrial = true;
          if (!trialEnd) {
            const trialEndDate = new Date();
            trialEndDate.setDate(trialEndDate.getDate() + 7);
            trialEnd = trialEndDate.toISOString();
          }
        } else if ((plan as string) === 'free_trial') {
          // Legacy free_trial users - migrate to new 'free' plan
          validPlan = 'free';
          status = 'trialing';
          isTrial = true;
          trialEnd = trialEndsAt;
        } else if (plan in PLAN_HIERARCHY) {
          validPlan = plan;
          // Check if this is a trial
          if (trialEndsAt) {
            const trialEndDate = new Date(trialEndsAt);
            if (trialEndDate > new Date()) {
              status = 'trialing';
              isTrial = true;
              trialEnd = trialEndsAt;
            }
          }
        } else {
          validPlan = 'none';
        }
        
        const features = PLAN_FEATURES[validPlan];
        
        set({
          subscription: {
            plan: validPlan,
            status,
            features,
            isTrial,
            trialEndsAt: trialEnd,
          },
          lastFetched: Date.now(),
        });
        
        // Check if trial is expired immediately
        get().checkTrialStatus();
      },

      checkTrialStatus: () => {
        const { subscription } = get();
        if (!subscription) return;
        
        if (subscription.isTrial && subscription.trialEndsAt) {
          const trialEndDate = new Date(subscription.trialEndsAt);
          if (trialEndDate <= new Date()) {
            // Trial expired - show plan selection modal
            set({
              subscription: {
                ...subscription,
                status: 'expired',
              },
              showPlanSelectionModal: true,
            });
          }
        }
      },

      isPro: () => {
        const { subscription } = get();
        if (!subscription) return false;
        if (subscription.status === 'expired') return false;
        return PLAN_HIERARCHY[subscription.plan] >= PLAN_HIERARCHY['pro'];
      },

      isGrowthOrAbove: () => {
        const { subscription } = get();
        if (!subscription) return false;
        if (subscription.status === 'expired') return false;
        return PLAN_HIERARCHY[subscription.plan] >= PLAN_HIERARCHY['growth'];
      },

      isStarterOrAbove: () => {
        const { subscription } = get();
        if (!subscription) return false;
        if (subscription.status === 'expired') return false;
        return PLAN_HIERARCHY[subscription.plan] >= PLAN_HIERARCHY['starter'] || 
               subscription.plan === 'free';
      },

      isFreeUser: () => {
        const { subscription } = get();
        if (!subscription) return false;
        return subscription.plan === 'free';
      },

      hasFeature: (feature: keyof Subscription['features']) => {
        const { subscription } = get();
        if (!subscription) return false;
        if (subscription.status === 'expired') return false;
        return !!subscription.features[feature];
      },

      canAccessPage: (page: 'dashboard' | 'agents' | 'analytics' | 'campaigns' | 'integrations' | 'settings') => {
        const { subscription } = get();
        if (!subscription) return false;
        if (subscription.status === 'expired') return false;
        
        switch (page) {
          case 'dashboard':
            return subscription.features.dashboard;
          case 'agents':
            return subscription.features.agentCommandCentre;
          case 'analytics':
            // Basic analytics for all, advanced for Pro+
            return subscription.features.dashboard;
          case 'campaigns':
            return subscription.features.campaignBuilder;
          case 'integrations':
            return true; // All plans can access integrations
          case 'settings':
            return true; // All plans can access settings
          default:
            return true;
        }
      },

      getPlanDisplayName: () => {
        const { subscription } = get();
        if (!subscription) return 'No Plan';
        
        const names: Record<PlanType, string> = {
          'none': 'No Plan',
          'free': 'Free Plan',
          'starter': 'Starter',
          'growth': 'Growth',
          'pro': 'Pro',
          'enterprise': 'Enterprise',
        };
        
        return names[subscription.plan] || 'Unknown';
      },

      isTrialExpired: () => {
        const { subscription } = get();
        if (!subscription) return false;
        if (!subscription.isTrial || !subscription.trialEndsAt) return false;
        return new Date(subscription.trialEndsAt) <= new Date();
      },

      getDaysLeftInTrial: () => {
        const { subscription } = get();
        if (!subscription || !subscription.isTrial || !subscription.trialEndsAt) return 0;
        const trialEnd = new Date(subscription.trialEndsAt);
        const now = new Date();
        const diffTime = trialEnd.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
      },

      clearSubscription: () => {
        set({
          subscription: null,
          lastFetched: null,
          error: null,
          showPlanSelectionModal: false,
        });
      },

      setShowPlanSelectionModal: (show: boolean) => {
        set({ showPlanSelectionModal: show });
      },
    }),
    {
      name: 'ownlay-subscription',
      partialize: (state) => ({
        subscription: state.subscription,
        lastFetched: state.lastFetched,
      }),
    }
  )
);

export default useSubscriptionStore;
