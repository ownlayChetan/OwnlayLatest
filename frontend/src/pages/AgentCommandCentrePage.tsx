import { useEffect, useState, useMemo, useCallback } from 'react';
import { useAgentStore } from '@/stores/agentStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { LoadingSpinner, Alert, UpgradeModal, ProBadge } from '@/components/common';
import {
  Cpu,
  Brain,
  Sparkles,
  Shield,
  Workflow,
  Play,
  CheckCircle,
  Clock,
  TrendingUp,
  Zap,
  Crown,
  Lock,
  Image,
  Palette,
  Eye,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import clsx from 'clsx';

// Agent configuration with streamlined info
const agentConfig = {
  researcher: { 
    name: 'Researcher', 
    icon: Brain, 
    color: 'text-blue-600', 
    bg: 'bg-blue-100',
    gradient: 'from-blue-500 to-indigo-500',
    description: 'Market & competitor analysis'
  },
  strategist: { 
    name: 'Strategist', 
    icon: TrendingUp, 
    color: 'text-emerald-600', 
    bg: 'bg-emerald-100',
    gradient: 'from-emerald-500 to-teal-500',
    description: 'Budget & performance optimization'
  },
  creative: { 
    name: 'Creative', 
    icon: Sparkles, 
    color: 'text-purple-600', 
    bg: 'bg-purple-100',
    gradient: 'from-purple-500 to-pink-500',
    description: 'Ad copy & visual generation'
  },
  auditor: { 
    name: 'Auditor', 
    icon: Shield, 
    color: 'text-orange-600', 
    bg: 'bg-orange-100',
    gradient: 'from-orange-500 to-amber-500',
    description: 'Compliance & brand safety'
  },
  orchestrator: { 
    name: 'Orchestrator', 
    icon: Workflow, 
    color: 'text-rose-600', 
    bg: 'bg-rose-100',
    gradient: 'from-rose-500 to-red-500',
    description: 'Pipeline coordination'
  },
};

// Demo activity data
const demoActivities = [
  { id: '1', agent: 'researcher' as const, activityType: 'analyzing' as const, description: 'Competitor pricing analysis', timestamp: new Date().toISOString(), progress: 75 },
  { id: '2', agent: 'strategist' as const, activityType: 'completed' as const, description: 'Budget allocation ready', timestamp: new Date(Date.now() - 5 * 60000).toISOString() },
  { id: '3', agent: 'creative' as const, activityType: 'thinking' as const, description: 'Generating Google Ads copy', timestamp: new Date(Date.now() - 10 * 60000).toISOString(), progress: 45 },
  { id: '4', agent: 'auditor' as const, activityType: 'completed' as const, description: 'Compliance check passed', timestamp: new Date(Date.now() - 15 * 60000).toISOString() },
];

// Demo approvals data
const demoApprovals = [
  { id: '1', type: 'budget' as const, title: 'Increase Google Ads budget +20%', description: 'Strong ROAS performance', agent: 'strategist', riskLevel: 'low' as const, confidence: 0.89, timestamp: new Date().toISOString() },
  { id: '2', type: 'creative' as const, title: 'New Meta headline variant', description: '"Unlock Your Potential"', agent: 'creative', riskLevel: 'low' as const, confidence: 0.92, timestamp: new Date().toISOString() },
  { id: '3', type: 'campaign' as const, title: 'Pause ad set #4521', description: 'CPA 2.5x above target', agent: 'auditor', riskLevel: 'medium' as const, confidence: 0.78, timestamp: new Date().toISOString() },
];

// Demo generated creatives
const demoCreatives = [
  { id: '1', type: 'headline', content: 'Transform Your Business Today', platform: 'Google', status: 'approved', agent: 'creative' },
  { id: '2', type: 'headline', content: 'Unlock Premium Growth', platform: 'Meta', status: 'pending', agent: 'creative' },
  { id: '3', type: 'description', content: 'Join 10,000+ companies scaling with our platform', platform: 'Google', status: 'approved', agent: 'creative' },
  { id: '4', type: 'headline', content: 'The Future of Marketing', platform: 'LinkedIn', status: 'pending', agent: 'creative' },
];

// PRO Gate Component - Redesigned
function ProGate({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-[500px]">
      <div className="text-center max-w-lg">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary-500/30">
          <Lock className="w-10 h-10 text-white" />
        </div>
        <div className="flex items-center justify-center gap-3 mb-4">
          <h2 className="text-2xl font-bold text-neutral-900">Agent Command Centre</h2>
          <ProBadge size="md" variant="gradient" />
        </div>
        <p className="text-neutral-500 mb-8">
          Unlock autonomous AI agents that optimize your campaigns 24/7
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          {[
            { icon: Brain, label: '4 AI Agents' },
            { icon: Eye, label: 'Live Monitoring' },
            { icon: Shield, label: 'Auto Compliance' },
            { icon: Sparkles, label: 'Creative Gen' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
              <item.icon className="w-5 h-5 text-primary-600" />
              <span className="text-sm text-neutral-700">{item.label}</span>
            </div>
          ))}
        </div>
        
        <button
          onClick={onUpgrade}
          className="btn-primary inline-flex items-center px-8 py-3 text-lg"
        >
          <Crown className="w-5 h-5 mr-2" />
          Upgrade to PRO
        </button>
      </div>
    </div>
  );
}

export default function AgentCommandCentrePage() {
  const { subscription, isPro } = useSubscriptionStore();
  const {
    activities,
    approvals,
    runningAgents,
    isLoading,
    error,
    loadActivities,
    loadApprovals,
    approveItem,
    rejectItem,
    runFullCampaign,
    clearError,
  } = useAgentStore();

  const [campaignConfig, setCampaignConfig] = useState({
    productInfo: '',
    brandName: '',
    budget: 10000,
    platforms: ['google', 'meta'],
  });
  
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'activity' | 'approvals' | 'creatives'>('activity');

  // Memoize isPro check
  const isProUser = useMemo(() => isPro(), [subscription]);

  useEffect(() => {
    if (isProUser) {
      loadActivities();
      loadApprovals();
    }
  }, [isProUser, loadActivities, loadApprovals]);

  // Auto-refresh activities
  useEffect(() => {
    if (!isProUser) return;
    const interval = setInterval(() => {
      loadActivities();
    }, 10000);
    return () => clearInterval(interval);
  }, [isProUser, loadActivities]);

  const displayActivities = activities.length > 0 ? activities : demoActivities;
  const displayApprovals = approvals.length > 0 ? approvals : demoApprovals;

  const handleRunCampaign = useCallback(async () => {
    await runFullCampaign({
      ...campaignConfig,
      autoRewrite: true,
    });
  }, [campaignConfig, runFullCampaign]);

  const handleOpenUpgrade = useCallback(() => {
    setUpgradeModalOpen(true);
  }, []);

  // PRO Gate
  if (!isProUser) {
    return (
      <>
        <ProGate onUpgrade={handleOpenUpgrade} />
        <UpgradeModal
          isOpen={upgradeModalOpen}
          onClose={() => setUpgradeModalOpen(false)}
          feature="agents"
          currentPlan={subscription?.plan}
        />
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">Agent Command Centre</h1>
            <p className="text-sm text-neutral-500">Monitor & control AI agents</p>
          </div>
        </div>
        <ProBadge size="sm" variant="primary" />
      </div>

      {error && (
        <Alert type="error" onClose={clearError}>
          {error}
        </Alert>
      )}

      {/* Agent Status Grid - Compact */}
      <div className="grid grid-cols-5 gap-3">
        {Object.entries(agentConfig).map(([key, config]) => {
          const isRunning = runningAgents.has(key);
          const Icon = config.icon;
          
          return (
            <div
              key={key}
              className={clsx(
                'relative p-4 rounded-xl border transition-all cursor-pointer group',
                isRunning 
                  ? 'border-primary-300 bg-primary-50 shadow-sm' 
                  : 'border-neutral-200 bg-white hover:border-primary-200 hover:shadow-sm'
              )}
            >
              <div className={clsx(
                'w-10 h-10 rounded-lg flex items-center justify-center mb-2 bg-gradient-to-br',
                config.gradient
              )}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="font-semibold text-neutral-900 text-sm">{config.name}</p>
              <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">{config.description}</p>
              
              {/* Status indicator */}
              <div className="absolute top-3 right-3">
                {isRunning ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary-500 animate-pulse" />
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Campaign Launch - Compact */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Workflow className="w-5 h-5 text-primary-600" />
            <span className="font-semibold text-neutral-900">Quick Campaign</span>
          </div>
          <span className="text-xs text-neutral-500">Researcher → Strategist → Creative → Auditor</span>
        </div>
        
        <div className="flex gap-3">
          <input
            type="text"
            value={campaignConfig.productInfo}
            onChange={(e) => setCampaignConfig({ ...campaignConfig, productInfo: e.target.value })}
            className="input flex-1"
            placeholder="Product/Service"
          />
          <input
            type="text"
            value={campaignConfig.brandName}
            onChange={(e) => setCampaignConfig({ ...campaignConfig, brandName: e.target.value })}
            className="input w-40"
            placeholder="Brand"
          />
          <input
            type="number"
            value={campaignConfig.budget}
            onChange={(e) => setCampaignConfig({ ...campaignConfig, budget: Number(e.target.value) })}
            className="input w-32"
            placeholder="Budget"
          />
          <button
            onClick={handleRunCampaign}
            disabled={isLoading || !campaignConfig.productInfo || !campaignConfig.brandName}
            className="btn-primary whitespace-nowrap"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : <Play className="w-4 h-4 mr-1" />}
            Run Pipeline
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-neutral-200">
        {[
          { id: 'activity', label: 'Live Activity', icon: Zap },
          { id: 'approvals', label: 'Approvals', icon: Shield, count: displayApprovals.length },
          { id: 'creatives', label: 'Generated Creatives', icon: Palette },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={clsx(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeTab === tab.id
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {displayActivities.slice(0, 6).map((activity) => {
              const config = agentConfig[activity.agent as keyof typeof agentConfig];
              const Icon = config?.icon || Cpu;
              const isComplete = activity.activityType === 'completed';
              
              return (
                <div
                  key={activity.id}
                  className={clsx(
                    'flex items-start gap-3 p-4 rounded-xl border',
                    isComplete ? 'border-green-200 bg-green-50' : 'border-neutral-200 bg-white'
                  )}
                >
                  <div className={clsx(
                    'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br',
                    config?.gradient || 'from-neutral-400 to-neutral-500'
                  )}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-neutral-900">{config?.name}</span>
                      {isComplete ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-neutral-400" />
                      )}
                    </div>
                    <p className="text-sm text-neutral-600 mt-0.5">{activity.description}</p>
                    {activity.progress !== undefined && !isComplete && (
                      <div className="mt-2 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500 transition-all duration-500"
                          style={{ width: `${activity.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Approvals Tab */}
        {activeTab === 'approvals' && (
          <div className="space-y-3">
            {displayApprovals.map((item) => {
              const config = agentConfig[item.agent as keyof typeof agentConfig];
              
              return (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-white border border-neutral-200 rounded-xl">
                  <div className={clsx(
                    'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                    item.riskLevel === 'low' ? 'bg-green-100' :
                    item.riskLevel === 'medium' ? 'bg-amber-100' : 'bg-red-100'
                  )}>
                    {item.riskLevel === 'low' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : item.riskLevel === 'medium' ? (
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    ) : (
                      <Shield className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-neutral-900">{item.title}</span>
                      <span className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded">
                        {config?.name}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-500 mt-0.5">{item.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500">{Math.round(item.confidence * 100)}%</span>
                    <button
                      onClick={() => rejectItem(item.id, 'Rejected by user')}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => approveItem(item.id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
            
            {displayApprovals.length === 0 && (
              <div className="text-center py-12 text-neutral-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-300" />
                <p>No pending approvals</p>
              </div>
            )}
          </div>
        )}

        {/* Creatives Tab - NEW */}
        {activeTab === 'creatives' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-neutral-500">
                AI-generated ad copy and content from Creative Agent
              </p>
              <button className="btn-sm btn-secondary">
                <Layers className="w-4 h-4 mr-1" />
                View Gallery
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {demoCreatives.map((creative) => (
                <div
                  key={creative.id}
                  className={clsx(
                    'p-4 rounded-xl border',
                    creative.status === 'approved' 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-amber-200 bg-amber-50'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={clsx(
                        'text-xs px-2 py-0.5 rounded font-medium',
                        creative.type === 'headline' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-purple-100 text-purple-700'
                      )}>
                        {creative.type}
                      </span>
                      <span className="text-xs text-neutral-500">{creative.platform}</span>
                    </div>
                    <span className={clsx(
                      'text-xs px-2 py-0.5 rounded',
                      creative.status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    )}>
                      {creative.status}
                    </span>
                  </div>
                  <p className="text-neutral-900 font-medium">{creative.content}</p>
                  
                  {creative.status === 'pending' && (
                    <div className="flex gap-2 mt-3">
                      <button className="btn-sm btn-ghost text-red-600 flex-1">Reject</button>
                      <button className="btn-sm btn-primary flex-1">Approve</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
              <div className="flex items-center gap-3 mb-3">
                <Image className="w-5 h-5 text-neutral-400" />
                <span className="font-medium text-neutral-700">Visual Creatives</span>
                <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded">Coming Soon</span>
              </div>
              <p className="text-sm text-neutral-500">
                Image and video generation will be available in a future update. Generated visuals will appear here.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* AI Summary - Compact */}
      <div className="card p-5 bg-gradient-to-br from-primary-50 to-white border border-primary-100">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-primary-600" />
          <span className="font-semibold text-neutral-900">AI Summary</span>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">$48,250</div>
            <p className="text-xs text-neutral-500 mt-1">Potential Savings</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">12</div>
            <p className="text-xs text-neutral-500 mt-1">Growth Opportunities</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">3</div>
            <p className="text-xs text-neutral-500 mt-1">Anomalies Detected</p>
          </div>
        </div>
      </div>
    </div>
  );
}
