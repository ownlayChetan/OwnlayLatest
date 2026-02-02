import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { LoadingSpinner, Alert, UpgradeModal } from '@/components/common';
import {
  Check,
  X,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  Clock,
  Megaphone,
  ShoppingBag,
  BarChart3,
  Mail,
  Activity,
} from 'lucide-react';
import clsx from 'clsx';
import type { Integration } from '@/types';

// Categorized integrations data
const integrationCategories = {
  advertising: {
    title: 'Advertising Platforms',
    icon: Megaphone,
    description: 'Connect your ad accounts to manage campaigns',
  },
  ecommerce: {
    title: 'E-commerce',
    icon: ShoppingBag,
    description: 'Sync your store data and revenue metrics',
  },
  analytics: {
    title: 'Analytics & Tracking',
    icon: BarChart3,
    description: 'Import analytics and conversion data',
  },
  emailCrm: {
    title: 'Email & CRM',
    icon: Mail,
    description: 'Connect your email marketing and CRM tools',
  },
};

// Demo integrations data - categorized
const demoIntegrations: (Integration & { category: string })[] = [
  // Advertising
  {
    id: '1',
    platform: 'Google Ads',
    category: 'advertising',
    status: 'connected',
    lastSync: new Date(Date.now() - 30 * 60000).toISOString(),
    accountName: 'My Business Account',
    metrics: { campaigns: 12, spend: 18500 },
  },
  {
    id: '2',
    platform: 'Meta Ads',
    category: 'advertising',
    status: 'connected',
    lastSync: new Date(Date.now() - 45 * 60000).toISOString(),
    accountName: 'Brand Page',
    metrics: { campaigns: 8, spend: 15200 },
  },
  {
    id: '3',
    platform: 'TikTok Ads',
    category: 'advertising',
    status: 'disconnected',
  },
  {
    id: '4',
    platform: 'LinkedIn Ads',
    category: 'advertising',
    status: 'pending',
  },
  // E-commerce
  {
    id: '5',
    platform: 'Shopify',
    category: 'ecommerce',
    status: 'connected',
    lastSync: new Date(Date.now() - 15 * 60000).toISOString(),
    accountName: 'My Store',
    metrics: { campaigns: 0, spend: 0 },
  },
  {
    id: '9',
    platform: 'WooCommerce',
    category: 'ecommerce',
    status: 'disconnected',
  },
  {
    id: '10',
    platform: 'Stripe',
    category: 'ecommerce',
    status: 'disconnected',
  },
  // Analytics
  {
    id: '6',
    platform: 'Google Analytics',
    category: 'analytics',
    status: 'disconnected',
  },
  {
    id: '11',
    platform: 'Mixpanel',
    category: 'analytics',
    status: 'disconnected',
  },
  {
    id: '12',
    platform: 'Segment',
    category: 'analytics',
    status: 'disconnected',
  },
  // Email & CRM
  {
    id: '7',
    platform: 'Klaviyo',
    category: 'emailCrm',
    status: 'disconnected',
  },
  {
    id: '8',
    platform: 'HubSpot',
    category: 'emailCrm',
    status: 'disconnected',
  },
  {
    id: '13',
    platform: 'Mailchimp',
    category: 'emailCrm',
    status: 'disconnected',
  },
  {
    id: '14',
    platform: 'Salesforce',
    category: 'emailCrm',
    status: 'disconnected',
  },
  {
    id: '15',
    platform: 'Intercom',
    category: 'emailCrm',
    status: 'disconnected',
  },
  {
    id: '16',
    platform: 'ActiveCampaign',
    category: 'emailCrm',
    status: 'disconnected',
  },
];

const platformLogos: Record<string, { color: string; initial: string }> = {
  'Google Ads': { color: 'bg-blue-500', initial: 'G' },
  'Meta Ads': { color: 'bg-blue-600', initial: 'M' },
  'TikTok Ads': { color: 'bg-black', initial: 'T' },
  'LinkedIn Ads': { color: 'bg-blue-700', initial: 'L' },
  Shopify: { color: 'bg-green-500', initial: 'S' },
  WooCommerce: { color: 'bg-purple-600', initial: 'W' },
  Stripe: { color: 'bg-indigo-600', initial: '$' },
  'Google Analytics': { color: 'bg-orange-500', initial: 'GA' },
  Mixpanel: { color: 'bg-purple-500', initial: 'M' },
  Segment: { color: 'bg-emerald-500', initial: 'S' },
  Klaviyo: { color: 'bg-green-600', initial: 'K' },
  HubSpot: { color: 'bg-orange-600', initial: 'H' },
  Mailchimp: { color: 'bg-yellow-500', initial: 'MC' },
  Salesforce: { color: 'bg-sky-500', initial: 'SF' },
  Intercom: { color: 'bg-blue-500', initial: 'I' },
  ActiveCampaign: { color: 'bg-blue-600', initial: 'AC' },
};

const statusConfig = {
  connected: { color: 'text-green-600', bg: 'bg-green-100', label: 'Connected', icon: Check },
  disconnected: { color: 'text-neutral-500', bg: 'bg-neutral-100', label: 'Not Connected', icon: X },
  error: { color: 'text-red-600', bg: 'bg-red-100', label: 'Error', icon: AlertCircle },
  pending: { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Pending', icon: Clock },
};

// Integration Card Component
function IntegrationCard({ 
  integration, 
  onConnect, 
  onDisconnect, 
  onSync,
  isConnecting,
  isSyncing,
}: {
  integration: Integration & { category: string };
  onConnect: (platform: string) => void;
  onDisconnect: (platform: string) => void;
  onSync: (platform: string) => void;
  isConnecting: boolean;
  isSyncing: boolean;
}) {
  const logo = platformLogos[integration.platform] || { color: 'bg-neutral-500', initial: '?' };
  const status = statusConfig[integration.status];
  const StatusIcon = status.icon;
  const isConnected = integration.status === 'connected';

  return (
    <div className="card p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div
          className={clsx(
            'w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm',
            logo.color
          )}
        >
          {logo.initial}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-neutral-900 text-sm">{integration.platform}</h3>
          <div className={clsx('flex items-center gap-1 text-xs', status.color)}>
            <StatusIcon className="w-3 h-3" />
            <span>{status.label}</span>
          </div>
        </div>
      </div>

      {isConnected && integration.accountName && (
        <div className="mb-3 p-2 bg-neutral-50 rounded-lg">
          <p className="text-xs text-neutral-600 truncate">
            <span className="font-medium">Account:</span> {integration.accountName}
          </p>
          {integration.lastSync && (
            <p className="text-xs text-neutral-400 mt-0.5">
              Synced: {new Date(integration.lastSync).toLocaleTimeString()}
            </p>
          )}
        </div>
      )}

      <div className="flex gap-2">
        {isConnected ? (
          <>
            <button
              onClick={() => onSync(integration.platform)}
              disabled={isSyncing}
              className="btn-sm btn-secondary flex-1 text-xs"
            >
              {isSyncing ? (
                <LoadingSpinner size="sm" />
              ) : (
                <RefreshCw className="w-3 h-3 mr-1" />
              )}
              Sync
            </button>
            <button
              onClick={() => onDisconnect(integration.platform)}
              className="btn-sm btn-ghost text-red-600 text-xs"
            >
              Disconnect
            </button>
          </>
        ) : (
          <button
            onClick={() => onConnect(integration.platform)}
            disabled={isConnecting}
            className="btn-sm btn-primary flex-1 text-xs"
          >
            {isConnecting ? (
              <LoadingSpinner size="sm" />
            ) : (
              <ExternalLink className="w-3 h-3 mr-1" />
            )}
            Connect
          </button>
        )}
      </div>
    </div>
  );
}

export default function IntegrationsPage() {
  useAuthStore(); // Keep auth context active
  const { subscription } = useSubscriptionStore();
  const queryClient = useQueryClient();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Memoize subscription check - allow if user has any active plan (not 'none')
  const hasActiveSubscription = useMemo(() => {
    if (!subscription) return false;
    return subscription.plan !== 'none' && subscription.status !== 'none';
  }, [subscription]);

  const { data } = useQuery({
    queryKey: ['integrations'],
    queryFn: () => api.getIntegrations(),
    staleTime: 1000 * 60 * 5,
  });

  const connectMutation = useMutation({
    mutationFn: (platform: string) => api.connectIntegration(platform),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: (platform: string) => api.disconnectIntegration(platform),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });

  const syncMutation = useMutation({
    mutationFn: (platform: string) => api.syncIntegration(platform),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });

  const integrations = data?.data?.map((i: Integration) => ({
    ...i,
    category: demoIntegrations.find(d => d.platform === i.platform)?.category || 'advertising'
  })) || demoIntegrations;

  const handleConnect = async (platform: string) => {
    if (!hasActiveSubscription) {
      setUpgradeModalOpen(true);
      return;
    }
    connectMutation.mutate(platform);
  };

  const connectedCount = integrations.filter((i: Integration) => i.status === 'connected').length;

  // Group integrations by category
  const groupedIntegrations = useMemo(() => {
    const groups: Record<string, typeof integrations> = {};
    for (const cat of Object.keys(integrationCategories)) {
      groups[cat] = integrations.filter((i: Integration & { category: string }) => i.category === cat);
    }
    return groups;
  }, [integrations]);

  // Filter integrations if a category is selected
  const displayedCategories = activeCategory 
    ? [activeCategory] 
    : Object.keys(integrationCategories);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Integrations</h1>
          <p className="section-subtitle">
            Connect your marketing platforms and data sources
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm">
            <Activity className="w-4 h-4" />
            {connectedCount} connected
          </div>
        </div>
      </div>

      {/* Demo Notice */}
      {!data?.data && (
        <Alert type="info">
          Viewing sample integrations. Connect real platforms to sync your data.
        </Alert>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveCategory(null)}
          className={clsx(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            !activeCategory
              ? 'bg-primary-100 text-primary-700'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          )}
        >
          All
        </button>
        {Object.entries(integrationCategories).map(([key, cat]) => {
          const Icon = cat.icon;
          const count = groupedIntegrations[key]?.filter((i: Integration) => i.status === 'connected').length || 0;
          return (
            <button
              key={key}
              onClick={() => setActiveCategory(key === activeCategory ? null : key)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                activeCategory === key
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              )}
            >
              <Icon className="w-4 h-4" />
              {cat.title}
              {count > 0 && (
                <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Categorized Integrations */}
      <div className="space-y-8">
        {displayedCategories.map((categoryKey) => {
          const category = integrationCategories[categoryKey as keyof typeof integrationCategories];
          const categoryIntegrations = groupedIntegrations[categoryKey] || [];
          const Icon = category.icon;

          return (
            <div key={categoryKey}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-neutral-900">{category.title}</h2>
                  <p className="text-sm text-neutral-500">{category.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {categoryIntegrations.map((integration: Integration & { category: string }) => (
                  <IntegrationCard
                    key={integration.id}
                    integration={integration}
                    onConnect={handleConnect}
                    onDisconnect={(p) => disconnectMutation.mutate(p)}
                    onSync={(p) => syncMutation.mutate(p)}
                    isConnecting={connectMutation.isPending}
                    isSyncing={syncMutation.isPending}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        feature="general"
        currentPlan={subscription?.plan}
      />
    </div>
  );
}
