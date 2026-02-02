import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import {
  Crown,
  Check,
  Sparkles,
  Zap,
  LayoutGrid,
  Megaphone,
  Target,
  Cpu,
  BarChart3,
  Building2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import clsx from 'clsx';

interface PlanSelectionModalProps {
  isOpen: boolean;
  onClose?: () => void;
  isTrialExpired?: boolean;
  isAgencyUser?: boolean;
}

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$29',
    period: '/month',
    description: 'Dashboard + Ad Manager',
    icon: Zap,
    color: 'from-blue-500 to-cyan-500',
    features: [
      { name: 'Unified Dashboard', icon: LayoutGrid, included: true },
      { name: 'Ad Manager', icon: Megaphone, included: true },
      { name: 'Campaign Builder', icon: Target, included: false },
      { name: 'Creative Studio', icon: Sparkles, included: false },
      { name: 'Agent Command Centre', icon: Cpu, included: false, badge: 'PRO' },
      { name: 'Advanced Analytics', icon: BarChart3, included: false, badge: 'PRO' },
    ],
    teamMembers: '2 team members',
    forAgencies: false,
  },
  {
    id: 'growth',
    name: 'Growth',
    price: '$79',
    period: '/month',
    description: 'Starter + Campaigns + Creative',
    icon: Target,
    color: 'from-teal-500 to-emerald-500',
    popular: true,
    features: [
      { name: 'Unified Dashboard', icon: LayoutGrid, included: true },
      { name: 'Ad Manager', icon: Megaphone, included: true },
      { name: 'Campaign Builder', icon: Target, included: true },
      { name: 'Creative Studio', icon: Sparkles, included: true },
      { name: 'Agent Command Centre', icon: Cpu, included: false, badge: 'PRO' },
      { name: 'Advanced Analytics', icon: BarChart3, included: false, badge: 'PRO' },
    ],
    teamMembers: '5 team members',
    forAgencies: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$149',
    period: '/month',
    description: 'Full access including AI Agents',
    icon: Crown,
    color: 'from-amber-500 to-orange-500',
    features: [
      { name: 'Unified Dashboard', icon: LayoutGrid, included: true },
      { name: 'Ad Manager', icon: Megaphone, included: true },
      { name: 'Campaign Builder', icon: Target, included: true },
      { name: 'Creative Studio', icon: Sparkles, included: true },
      { name: 'Agent Command Centre', icon: Cpu, included: true },
      { name: 'Advanced Analytics', icon: BarChart3, included: true },
    ],
    teamMembers: '10 team members',
    forAgencies: true, // Agencies can only select Pro
  },
];

export default function PlanSelectionModal({ 
  isOpen, 
  onClose, 
  isTrialExpired = false,
  isAgencyUser = false,
}: PlanSelectionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>(isAgencyUser ? 'pro' : 'growth');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setShowPlanSelectionModal } = useSubscriptionStore();

  if (!isOpen) return null;

  const handleSelectPlan = async (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      // Navigate to payment page with selected plan
      navigate(`/settings?tab=billing&plan=${selectedPlan}`);
      setShowPlanSelectionModal(false);
      if (onClose) onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPlans = isAgencyUser 
    ? plans.filter(p => p.forAgencies) 
    : plans;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-purple-600 px-8 py-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            {isTrialExpired ? (
              <AlertTriangle className="w-8 h-8 text-yellow-300" />
            ) : (
              <Sparkles className="w-8 h-8 text-yellow-300" />
            )}
            <h2 className="text-2xl font-bold">
              {isTrialExpired ? 'Your Free Trial Has Expired' : 'Choose Your Plan'}
            </h2>
          </div>
          <p className="text-white/80 max-w-xl">
            {isTrialExpired 
              ? 'To continue accessing your dashboard and features, please select a plan below.'
              : isAgencyUser
                ? 'As an agency, you have access to our Pro plan with all features included.'
                : 'Select the plan that best fits your needs. You can upgrade anytime.'}
          </p>
          {isTrialExpired && (
            <div className="mt-4 flex items-center gap-2 text-yellow-200">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Trial ended • Select a plan to continue</span>
            </div>
          )}
        </div>

        {/* Plans Grid */}
        <div className="p-8">
          {isAgencyUser && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
              <Building2 className="w-5 h-5 text-amber-600" />
              <p className="text-sm text-amber-800">
                <strong>Agency Account:</strong> You have exclusive access to our Pro plan with all features and priority support.
              </p>
            </div>
          )}

          <div className={clsx(
            'grid gap-6',
            filteredPlans.length === 1 ? 'grid-cols-1 max-w-md mx-auto' : 'grid-cols-1 md:grid-cols-3'
          )}>
            {filteredPlans.map((plan) => {
              const Icon = plan.icon;
              const isSelected = selectedPlan === plan.id;
              
              return (
                <div
                  key={plan.id}
                  onClick={() => handleSelectPlan(plan.id)}
                  className={clsx(
                    'relative rounded-2xl p-6 cursor-pointer transition-all duration-300',
                    'border-2',
                    isSelected
                      ? 'border-primary-500 bg-primary-50/50 shadow-lg shadow-primary-500/20'
                      : 'border-neutral-200 hover:border-primary-300 hover:shadow-md'
                  )}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-primary-600 to-purple-600 text-white text-xs font-bold rounded-full">
                      MOST POPULAR
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <div className={clsx(
                      'w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br',
                      plan.color
                    )}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-neutral-900">{plan.name}</h3>
                      <p className="text-sm text-neutral-500">{plan.description}</p>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-bold text-neutral-900">{plan.price}</span>
                    <span className="text-neutral-500">{plan.period}</span>
                  </div>

                  <div className="space-y-2.5 mb-4">
                    {plan.features.map((feature) => {
                      const FeatureIcon = feature.icon;
                      const featureBadge = (feature as any).badge;
                      return (
                        <div
                          key={feature.name}
                          className={clsx(
                            'flex items-center gap-2 text-sm',
                            feature.included ? 'text-neutral-700' : 'text-neutral-400'
                          )}
                        >
                          {feature.included ? (
                            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <div className="w-4 h-4 flex-shrink-0" />
                          )}
                          <FeatureIcon className="w-4 h-4" />
                          <span className={!feature.included ? 'line-through' : ''}>
                            {feature.name}
                          </span>
                          {!feature.included && featureBadge && (
                            <span className="ml-auto text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded font-medium">
                              {featureBadge}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-4 border-t border-neutral-200">
                    <span className="text-sm text-neutral-500">{plan.teamMembers}</span>
                  </div>

                  {/* Selection indicator */}
                  <div className={clsx(
                    'absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                    isSelected
                      ? 'border-primary-500 bg-primary-500'
                      : 'border-neutral-300'
                  )}>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-neutral-500">
              All plans include Integrations access • Cancel anytime
            </p>
            <button
              onClick={handleContinue}
              disabled={isLoading}
              className={clsx(
                'px-8 py-3 rounded-xl font-semibold text-white transition-all',
                'bg-gradient-to-r from-primary-600 to-purple-600',
                'hover:from-primary-500 hover:to-purple-500',
                'shadow-lg shadow-primary-500/30',
                isLoading && 'opacity-70 cursor-not-allowed'
              )}
            >
              {isLoading ? 'Processing...' : `Continue with ${plans.find(p => p.id === selectedPlan)?.name}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
