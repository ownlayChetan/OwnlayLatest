import { useState } from 'react';
import { Crown, Zap, Shield, BarChart3, Users, Check, X, Sparkles } from 'lucide-react';
import clsx from 'clsx';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: 'agents' | 'analytics' | 'general';
  currentPlan?: string;
}

const FEATURES = {
  agents: {
    title: 'Agent Command Centre',
    subtitle: 'Unlock AI-Powered Marketing Automation',
    description: 'Get access to 4 autonomous AI agents that work 24/7 to optimize your campaigns, analyze competitors, generate creatives, and ensure compliance.',
    icon: Zap,
    benefits: [
      'Researcher Agent - Competitive intelligence & market trends',
      'Strategist Agent - AI-powered budget allocation',
      'Creative Agent - Automated ad copy generation',
      'Auditor Agent - Brand safety & compliance checking',
      'Full campaign orchestration pipeline',
      'Human-in-the-loop approval workflows',
    ],
  },
  analytics: {
    title: 'Advanced Analytics',
    subtitle: 'Deeper Insights, Better Decisions',
    description: 'Unlock advanced analytics features including cohort analysis, attribution modeling, predictive forecasting, and custom reporting dashboards.',
    icon: BarChart3,
    benefits: [
      'Multi-touch attribution modeling',
      'Predictive ROAS forecasting',
      'Cohort analysis & retention metrics',
      'Custom report builder',
      'Data export & API access',
      'Real-time performance alerts',
    ],
  },
  general: {
    title: 'Upgrade to Pro',
    subtitle: 'Supercharge Your Marketing',
    description: 'Unlock the full power of OWNLAY with Pro features designed for growing businesses and agencies.',
    icon: Crown,
    benefits: [
      'AI Agent Command Centre',
      'Advanced Analytics & Reporting',
      'Unlimited campaigns & ad accounts',
      'Priority support',
      'Custom integrations',
      'Team collaboration (up to 10 members)',
    ],
  },
};

const PLANS = [
  {
    id: 'growth',
    name: 'Growth',
    price: 79,
    period: 'month',
    description: 'For growing businesses',
    features: ['Advanced Analytics', '5 Team Members', 'API Access', 'Unlimited Campaigns'],
    recommended: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 199,
    period: 'month',
    description: 'For serious marketers',
    features: ['Everything in Growth', 'AI Agent Command Centre', 'Priority Support', '10 Team Members', 'Custom Integrations'],
    recommended: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: null,
    period: null,
    description: 'For large organizations',
    features: ['Everything in Pro', 'Unlimited Team Members', 'Dedicated Support', 'Custom SLAs', 'On-premise Options'],
    recommended: false,
  },
];

export default function UpgradeModal({ isOpen, onClose, feature, currentPlan }: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');
  const [isLoading, setIsLoading] = useState(false);
  
  if (!isOpen) return null;
  
  const featureInfo = FEATURES[feature];
  const FeatureIcon = featureInfo.icon;

  const handleUpgrade = async (planId: string) => {
    setIsLoading(true);
    // Navigate to pricing page with selected plan
    window.location.href = `/#pricing?plan=${planId}&source=upgrade_modal&feature=${feature}`;
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Modal */}
      <div 
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-lg hover:bg-neutral-100 transition-colors"
        >
          <X className="w-5 h-5 text-neutral-500" />
        </button>

        <div className="flex flex-col lg:flex-row">
          {/* Left Panel - Feature Info */}
          <div className="lg:w-2/5 p-8 bg-gradient-to-br from-primary-600 to-primary-700 text-white">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
              <FeatureIcon className="w-8 h-8" />
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
                PRO FEATURE
              </span>
            </div>
            
            <h2 className="text-2xl font-bold mb-2">{featureInfo.title}</h2>
            <p className="text-primary-100 mb-6">{featureInfo.subtitle}</p>
            <p className="text-sm text-primary-200 mb-8">{featureInfo.description}</p>
            
            <div className="space-y-3">
              {featureInfo.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-green-900" />
                  </div>
                  <span className="text-sm text-primary-100">{benefit}</span>
                </div>
              ))}
            </div>
            
            {/* Trust badges */}
            <div className="mt-8 pt-6 border-t border-white/20">
              <div className="flex items-center gap-4 text-xs text-primary-200">
                <span className="flex items-center gap-1">
                  <Shield className="w-4 h-4" /> SOC 2 Compliant
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" /> 5,000+ Teams
                </span>
              </div>
            </div>
          </div>

          {/* Right Panel - Pricing */}
          <div className="lg:w-3/5 p-8 overflow-y-auto max-h-[70vh] lg:max-h-none">
            <h3 className="text-xl font-bold text-neutral-900 mb-2">Choose Your Plan</h3>
            <p className="text-neutral-500 mb-6">
              {currentPlan && currentPlan !== 'none' ? (
                <>Currently on <span className="font-medium capitalize">{currentPlan}</span> plan</>
              ) : (
                <>Start with a 14-day free trial. No credit card required.</>
              )}
            </p>

            <div className="space-y-4">
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={clsx(
                    'relative p-4 rounded-xl border-2 cursor-pointer transition-all',
                    selectedPlan === plan.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-neutral-200 hover:border-neutral-300',
                    plan.recommended && 'ring-2 ring-primary-500 ring-offset-2'
                  )}
                >
                  {plan.recommended && (
                    <div className="absolute -top-3 left-4">
                      <span className="px-3 py-1 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> RECOMMENDED
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-neutral-900">{plan.name}</h4>
                      <p className="text-sm text-neutral-500">{plan.description}</p>
                    </div>
                    <div className="text-right">
                      {plan.price ? (
                        <>
                          <span className="text-2xl font-bold text-neutral-900">${plan.price}</span>
                          <span className="text-neutral-500">/{plan.period}</span>
                        </>
                      ) : (
                        <span className="text-lg font-semibold text-neutral-900">Custom</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {plan.features.map((feat, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                  
                  {/* Radio indicator */}
                  <div className={clsx(
                    'absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center',
                    selectedPlan === plan.id
                      ? 'border-primary-500 bg-primary-500'
                      : 'border-neutral-300'
                  )}>
                    {selectedPlan === plan.id && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="mt-8 space-y-3">
              <button
                onClick={() => handleUpgrade(selectedPlan)}
                disabled={isLoading}
                className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <Crown className="w-5 h-5" />
                )}
                {selectedPlan === 'enterprise' ? 'Contact Sales' : 'Upgrade Now'}
              </button>
              
              <button
                onClick={onClose}
                className="w-full py-3 text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
              >
                Maybe Later
              </button>
            </div>
            
            <p className="mt-4 text-xs text-center text-neutral-500">
              Cancel anytime. No long-term contracts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
