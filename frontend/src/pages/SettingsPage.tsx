import { useState, useMemo, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { Alert, ProBadge, UpgradeModal } from '@/components/common';
import {
  User,
  Building2,
  Bell,
  Shield,
  CreditCard,
  Save,
  Crown,
  Check,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import clsx from 'clsx';

const tabs = [
  { id: 'profile', name: 'Profile', icon: User },
  { id: 'organization', name: 'Organization', icon: Building2 },
  { id: 'notifications', name: 'Notifications', icon: Bell },
  { id: 'security', name: 'Security', icon: Shield },
  { id: 'billing', name: 'Billing', icon: CreditCard },
];

// Plan features for display
const PLAN_FEATURES = {
  starter: {
    name: 'Starter',
    price: 29,
    features: ['5 campaigns', '2 team members', 'Basic analytics', 'Email support'],
    color: 'gray',
  },
  growth: {
    name: 'Growth',
    price: 79,
    features: ['Unlimited campaigns', '5 team members', 'Advanced analytics', 'API access', 'Priority support'],
    color: 'blue',
  },
  pro: {
    name: 'Pro',
    price: 199,
    features: ['Everything in Growth', 'AI Agent Command Centre', '10 team members', 'Custom integrations', 'Dedicated support'],
    color: 'primary',
  },
  enterprise: {
    name: 'Enterprise',
    price: null,
    features: ['Everything in Pro', 'Unlimited team members', 'Custom SLAs', 'On-premise options', 'White-label'],
    color: 'amber',
  },
};

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const { subscription, isPro, getPlanDisplayName } = useSubscriptionStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    company: user?.company || '',
    timezone: 'America/New_York',
    language: 'en',
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    weeklyReport: true,
    budgetAlerts: true,
    campaignUpdates: true,
    agentActivity: false,
  });

  // Memoize subscription info
  const isProUser = useMemo(() => isPro(), [subscription]);
  const currentPlan = useMemo(() => subscription?.plan || 'none', [subscription]);
  const planDisplayName = useMemo(() => getPlanDisplayName(), [subscription]);

  const handleSave = useCallback(() => {
    // Update user in store
    if (profile.name !== user?.name || profile.company !== user?.company) {
      updateUser({
        name: profile.name,
        company: profile.company,
      });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }, [profile, user, updateUser]);

  // Get current plan info
  const currentPlanInfo = useMemo(() => {
    if (currentPlan === 'none') {
      return { name: 'No Plan', price: 0, features: ['Limited access'], color: 'neutral' };
    }
    return PLAN_FEATURES[currentPlan as keyof typeof PLAN_FEATURES] || PLAN_FEATURES.starter;
  }, [currentPlan]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="section-title">Settings</h1>
        <p className="section-subtitle">Manage your account and preferences</p>
      </div>

      {saved && (
        <Alert type="success">Settings saved successfully!</Alert>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors',
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-600 hover:bg-neutral-100'
                )}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="card p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-neutral-900">Profile Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">Full Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Email Address</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="input"
                      disabled
                    />
                    <p className="text-xs text-neutral-500 mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <label className="label">Company</label>
                    <input
                      type="text"
                      value={profile.company}
                      onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Timezone</label>
                    <select
                      value={profile.timezone}
                      onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                      className="input"
                    >
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                      <option value="Europe/London">London (GMT)</option>
                      <option value="Europe/Paris">Paris (CET)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button onClick={handleSave} className="btn-primary">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Organization Tab */}
            {activeTab === 'organization' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-neutral-900">Organization Settings</h3>
                
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-neutral-900">{user?.company || 'My Organization'}</p>
                      <p className="text-sm text-neutral-500">Organization ID: org_demo123</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isProUser && <ProBadge size="md" variant="gradient" />}
                      <span className={clsx(
                        'badge',
                        isProUser ? 'badge-primary' : 'badge-neutral'
                      )}>
                        {planDisplayName} Plan
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-neutral-900 mb-3">Team Members</h4>
                  <div className="border border-neutral-200 rounded-lg divide-y divide-neutral-200">
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="font-medium text-primary-700">
                            {user?.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900">{user?.name} (You)</p>
                          <p className="text-sm text-neutral-500">{user?.email}</p>
                        </div>
                      </div>
                      <span className="badge badge-primary">Owner</span>
                    </div>
                  </div>
                  <button className="btn-secondary mt-4">
                    Invite Team Member
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-neutral-900">Notification Preferences</h3>
                
                <div className="space-y-4">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                      <div>
                        <p className="font-medium text-neutral-900 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="text-sm text-neutral-500">
                          Receive notifications for {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </p>
                      </div>
                      <button
                        onClick={() => setNotifications({ ...notifications, [key]: !value })}
                        className={clsx(
                          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                          value ? 'bg-primary-600' : 'bg-neutral-300'
                        )}
                      >
                        <span
                          className={clsx(
                            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                            value ? 'translate-x-6' : 'translate-x-1'
                          )}
                        />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex justify-end">
                  <button onClick={handleSave} className="btn-primary">
                    <Save className="w-4 h-4 mr-2" />
                    Save Preferences
                  </button>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-neutral-900">Security Settings</h3>
                
                <div className="space-y-4">
                  <div className="p-4 border border-neutral-200 rounded-lg">
                    <h4 className="font-medium text-neutral-900 mb-2">Change Password</h4>
                    <p className="text-sm text-neutral-500 mb-4">
                      Update your password to keep your account secure
                    </p>
                    <button className="btn-secondary">Change Password</button>
                  </div>

                  <div className="p-4 border border-neutral-200 rounded-lg">
                    <h4 className="font-medium text-neutral-900 mb-2">Two-Factor Authentication</h4>
                    <p className="text-sm text-neutral-500 mb-4">
                      Add an extra layer of security to your account
                    </p>
                    <button className="btn-secondary">Enable 2FA</button>
                  </div>

                  <div className="p-4 border border-neutral-200 rounded-lg">
                    <h4 className="font-medium text-neutral-900 mb-2">Active Sessions</h4>
                    <p className="text-sm text-neutral-500 mb-4">
                      Manage your active login sessions
                    </p>
                    <button className="btn-ghost text-red-600">Sign Out All Devices</button>
                  </div>
                </div>
              </div>
            )}

            {/* Billing Tab - Enhanced with correct plan display */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-neutral-900">Billing & Subscription</h3>
                
                {/* Current Plan Card */}
                <div className={clsx(
                  'p-6 rounded-lg border-2',
                  isProUser 
                    ? 'bg-gradient-to-br from-primary-50 to-white border-primary-200' 
                    : 'bg-gradient-to-br from-neutral-50 to-white border-neutral-200'
                )}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-neutral-500">Current Plan</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-2xl font-bold text-neutral-900">
                          {currentPlanInfo.name}
                        </p>
                        {isProUser && <ProBadge size="md" variant="gradient" />}
                      </div>
                      {currentPlanInfo.price !== null && currentPlanInfo.price > 0 && (
                        <p className="text-sm text-neutral-500 mt-1">
                          ${currentPlanInfo.price}/month
                        </p>
                      )}
                    </div>
                    {isProUser ? (
                      <Crown className="w-10 h-10 text-primary-500" />
                    ) : (
                      <Sparkles className="w-10 h-10 text-neutral-400" />
                    )}
                  </div>
                  
                  {/* Plan Features */}
                  <div className="space-y-2 mb-6">
                    {currentPlanInfo.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Check className={clsx(
                          'w-4 h-4',
                          isProUser ? 'text-primary-600' : 'text-neutral-400'
                        )} />
                        <span className="text-sm text-neutral-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Action Button */}
                  {currentPlan === 'none' || currentPlan === 'starter' ? (
                    <button 
                      onClick={() => setUpgradeModalOpen(true)}
                      className="btn-primary w-full"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade Plan
                    </button>
                  ) : isProUser ? (
                    <button className="btn-secondary w-full">
                      Manage Subscription
                    </button>
                  ) : (
                    <button 
                      onClick={() => setUpgradeModalOpen(true)}
                      className="btn-primary w-full"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to PRO
                    </button>
                  )}
                </div>

                {/* Plan Comparison (for non-pro users) */}
                {!isProUser && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(['growth', 'pro', 'enterprise'] as const).map((planKey) => {
                      const plan = PLAN_FEATURES[planKey];
                      const isCurrentPlan = currentPlan === planKey;
                      const isRecommended = planKey === 'pro';
                      
                      return (
                        <div 
                          key={planKey}
                          className={clsx(
                            'p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md',
                            isCurrentPlan 
                              ? 'border-primary-500 bg-primary-50' 
                              : isRecommended
                              ? 'border-primary-300 hover:border-primary-400'
                              : 'border-neutral-200 hover:border-neutral-300'
                          )}
                          onClick={() => !isCurrentPlan && setUpgradeModalOpen(true)}
                        >
                          {isRecommended && (
                            <div className="flex items-center gap-1 mb-2">
                              <Sparkles className="w-4 h-4 text-primary-600" />
                              <span className="text-xs font-bold text-primary-600">RECOMMENDED</span>
                            </div>
                          )}
                          <h4 className="font-semibold text-neutral-900">{plan.name}</h4>
                          <p className="text-2xl font-bold text-neutral-900 mt-1">
                            {plan.price ? `$${plan.price}` : 'Custom'}
                            {plan.price && <span className="text-sm font-normal text-neutral-500">/mo</span>}
                          </p>
                          <ul className="mt-3 space-y-1">
                            {plan.features.slice(0, 3).map((f, i) => (
                              <li key={i} className="text-xs text-neutral-600 flex items-center gap-1">
                                <Check className="w-3 h-3 text-green-500" />
                                {f}
                              </li>
                            ))}
                          </ul>
                          {isCurrentPlan ? (
                            <span className="mt-3 block text-center text-sm font-medium text-primary-600">
                              Current Plan
                            </span>
                          ) : (
                            <button className="mt-3 w-full text-sm font-medium text-primary-600 hover:text-primary-700">
                              Select Plan →
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Payment Method */}
                <div className="p-4 border border-neutral-200 rounded-lg">
                  <h4 className="font-medium text-neutral-900 mb-2">Payment Method</h4>
                  <p className="text-sm text-neutral-500 mb-4">
                    {isProUser ? 'Visa ending in 4242' : 'No payment method on file'}
                  </p>
                  <button className="btn-secondary">
                    {isProUser ? 'Update Payment Method' : 'Add Payment Method'}
                  </button>
                </div>

                {/* Billing History */}
                <div className="p-4 border border-neutral-200 rounded-lg">
                  <h4 className="font-medium text-neutral-900 mb-2">Billing History</h4>
                  {isProUser ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-600">Jan 2026</span>
                        <span className="text-neutral-900">$199.00</span>
                        <a href="#" className="text-primary-600 hover:underline flex items-center gap-1">
                          Download <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-600">Dec 2025</span>
                        <span className="text-neutral-900">$199.00</span>
                        <a href="#" className="text-primary-600 hover:underline flex items-center gap-1">
                          Download <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-500">No invoices yet</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        feature="general"
        currentPlan={currentPlan}
      />
    </div>
  );
}
