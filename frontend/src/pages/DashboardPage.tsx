import { useMemo, memo, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { MetricCard, Alert, ProBadge } from '@/components/common';
import {
  DollarSign,
  TrendingUp,
  Target,
  ShoppingCart,
  Zap,
  ArrowRight,
  Crown,
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { DashboardMetrics, ChannelMetrics, AIInsight } from '@/types';

// ============================================
// STATIC DEMO DATA - Pre-computed for <5ms load
// ============================================

// Memoized demo metrics - computed once at module load
const DEMO_METRICS: DashboardMetrics = {
  totalSpend: 45230,
  totalRevenue: 182450,
  roas: 4.03,
  ctr: 2.8,
  conversions: 1847,
  impressions: 2450000,
  clicks: 68600,
  cpa: 24.49,
  trends: {
    spend: 12.5,
    revenue: 18.3,
    roas: 4.8,
    conversions: 15.2,
  },
};

const DEMO_CHANNELS: ChannelMetrics[] = [
  { platform: 'Google Ads', spend: 18500, revenue: 78400, roas: 4.24, conversions: 782, ctr: 3.1, status: 'active' },
  { platform: 'Meta Ads', spend: 15200, revenue: 62800, roas: 4.13, conversions: 628, ctr: 2.8, status: 'active' },
  { platform: 'TikTok', spend: 8300, revenue: 31200, roas: 3.76, conversions: 312, ctr: 2.4, status: 'active' },
  { platform: 'LinkedIn', spend: 3230, revenue: 10050, roas: 3.11, conversions: 125, ctr: 1.9, status: 'paused' },
];

// Pre-computed chart data - no runtime generation
const CHART_DATA = [
  { date: 'Dec 29', spend: 1450, revenue: 5200 },
  { date: 'Dec 30', spend: 1380, revenue: 4900 },
  { date: 'Dec 31', spend: 1520, revenue: 5400 },
  { date: 'Jan 1', spend: 1200, revenue: 4200 },
  { date: 'Jan 2', spend: 1350, revenue: 4800 },
  { date: 'Jan 3', spend: 1480, revenue: 5100 },
  { date: 'Jan 4', spend: 1550, revenue: 5600 },
  { date: 'Jan 5', spend: 1420, revenue: 5000 },
  { date: 'Jan 6', spend: 1600, revenue: 5800 },
  { date: 'Jan 7', spend: 1480, revenue: 5300 },
  { date: 'Jan 8', spend: 1520, revenue: 5500 },
  { date: 'Jan 9', spend: 1450, revenue: 5100 },
  { date: 'Jan 10', spend: 1380, revenue: 4900 },
  { date: 'Jan 11', spend: 1520, revenue: 5400 },
  { date: 'Jan 12', spend: 1600, revenue: 5700 },
  { date: 'Jan 13', spend: 1550, revenue: 5500 },
  { date: 'Jan 14', spend: 1480, revenue: 5200 },
  { date: 'Jan 15', spend: 1620, revenue: 5900 },
  { date: 'Jan 16', spend: 1580, revenue: 5600 },
  { date: 'Jan 17', spend: 1500, revenue: 5300 },
  { date: 'Jan 18', spend: 1450, revenue: 5100 },
  { date: 'Jan 19', spend: 1520, revenue: 5400 },
  { date: 'Jan 20', spend: 1600, revenue: 5800 },
  { date: 'Jan 21', spend: 1680, revenue: 6100 },
  { date: 'Jan 22', spend: 1720, revenue: 6300 },
  { date: 'Jan 23', spend: 1650, revenue: 5900 },
  { date: 'Jan 24', spend: 1580, revenue: 5600 },
  { date: 'Jan 25', spend: 1620, revenue: 5800 },
  { date: 'Jan 26', spend: 1700, revenue: 6200 },
  { date: 'Jan 27', spend: 1750, revenue: 6400 },
];

const DEMO_INSIGHTS: AIInsight[] = [
  {
    id: '1',
    type: 'opportunity',
    title: 'Increase Google Ads Budget',
    description: 'Google Ads is performing 15% above target ROAS. Consider increasing budget by 20%.',
    impact: '+$12,400 projected revenue',
    platform: 'Google Ads',
    confidence: 0.89,
    actionable: true,
    suggestedAction: 'Increase budget',
    timestamp: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'warning',
    title: 'Meta CPM Rising',
    description: 'Cost per thousand impressions has increased 18% over the past week.',
    impact: '-$3,200 if trend continues',
    platform: 'Meta Ads',
    confidence: 0.76,
    actionable: true,
    suggestedAction: 'Review targeting',
    timestamp: new Date().toISOString(),
  },
  {
    id: '3',
    type: 'anomaly',
    title: 'TikTok CTR Spike',
    description: 'Click-through rate jumped 45% yesterday. New creative may be resonating well.',
    impact: 'Monitor for sustainability',
    platform: 'TikTok',
    confidence: 0.92,
    actionable: false,
    timestamp: new Date().toISOString(),
  },
];

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

// Pre-computed pie data for channel breakdown
const PIE_DATA = DEMO_CHANNELS.map(c => ({
  name: c.platform,
  value: c.spend,
}));

// Channel Health Data - Pre-computed for <5ms load
const CHANNEL_HEALTH = [
  {
    platform: 'Google Ads',
    status: 'healthy',
    score: 92,
    metrics: {
      budgetUtilization: 87,
      costEfficiency: 95,
      conversionRate: 4.2,
      qualityScore: 8.5,
    },
    issues: [],
    recommendations: ['Consider increasing budget by 15% based on strong performance'],
  },
  {
    platform: 'Meta Ads',
    status: 'warning',
    score: 74,
    metrics: {
      budgetUtilization: 92,
      costEfficiency: 68,
      conversionRate: 3.1,
      qualityScore: 7.2,
    },
    issues: ['CPM increased 18% this week', 'Audience overlap detected'],
    recommendations: ['Review ad fatigue', 'Refresh creative assets'],
  },
  {
    platform: 'TikTok',
    status: 'healthy',
    score: 85,
    metrics: {
      budgetUtilization: 78,
      costEfficiency: 89,
      conversionRate: 2.8,
      qualityScore: 8.0,
    },
    issues: [],
    recommendations: ['Scale winning ad sets', 'Test new audience segments'],
  },
  {
    platform: 'LinkedIn',
    status: 'critical',
    score: 52,
    metrics: {
      budgetUtilization: 45,
      costEfficiency: 48,
      conversionRate: 1.2,
      qualityScore: 5.5,
    },
    issues: ['Low budget utilization', 'High CPA', 'Poor engagement'],
    recommendations: ['Pause and review targeting', 'Update ad creative', 'Consider different campaign objective'],
  },
];

// ============================================
// MEMOIZED COMPONENTS - No re-renders
// ============================================

// Memoized chart component
const PerformanceChart = memo(function PerformanceChart() {
  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-neutral-800 mb-4">Performance Overview</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={CHART_DATA}>
            <defs>
              <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              stroke="#9ca3af" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#9ca3af" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
            />
            <Area
              type="monotone"
              dataKey="spend"
              stroke="#8b5cf6"
              strokeWidth={2}
              fill="url(#spendGradient)"
              name="Spend"
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#06b6d4"
              strokeWidth={2}
              fill="url(#revenueGradient)"
              name="Revenue"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

// Memoized channel breakdown chart
const ChannelBreakdown = memo(function ChannelBreakdown() {
  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-neutral-800 mb-4">Spend by Channel</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={PIE_DATA}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
            >
              {PIE_DATA.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-4 mt-4 justify-center">
        {DEMO_CHANNELS.map((channel, idx) => (
          <div key={channel.platform} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[idx % COLORS.length] }}
            />
            <span className="text-sm text-neutral-600">{channel.platform}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

// Memoized insights component
const InsightsPanel = memo(function InsightsPanel({ isProUser }: { isProUser: boolean }) {
  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'text-emerald-600 bg-emerald-50';
      case 'warning': return 'text-amber-600 bg-amber-50';
      case 'anomaly': return 'text-blue-600 bg-blue-50';
      default: return 'text-neutral-600 bg-neutral-50';
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-neutral-800 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          AI Insights
        </h3>
        {isProUser && <ProBadge size="sm" variant="primary" />}
      </div>
      <div className="space-y-3">
        {DEMO_INSIGHTS.map((insight) => (
          <div
            key={insight.id}
            className="p-4 rounded-lg border border-neutral-100 hover:border-primary-200 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getInsightColor(insight.type)}`}>
                    {insight.type.toUpperCase()}
                  </span>
                  <span className="text-xs text-neutral-400">{insight.platform}</span>
                </div>
                <h4 className="font-medium text-neutral-800 mb-1">{insight.title}</h4>
                <p className="text-sm text-neutral-500 mb-2">{insight.description}</p>
                <p className="text-sm font-medium text-primary-600">{insight.impact}</p>
              </div>
              {insight.actionable && (
                <button className="shrink-0 px-3 py-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors flex items-center gap-1">
                  Action <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

// Channel Health Component - NEW
const ChannelHealthPanel = memo(function ChannelHealthPanel() {
  const [expandedChannel, setExpandedChannel] = useState<string | null>(null);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'healthy':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Healthy' };
      case 'warning':
        return { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Warning' };
      case 'critical':
        return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Critical' };
      default:
        return { icon: Activity, color: 'text-neutral-600', bg: 'bg-neutral-100', label: 'Unknown' };
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-neutral-800">Channel Health</h3>
        </div>
        <span className="text-xs text-neutral-500">Real-time monitoring</span>
      </div>

      <div className="space-y-3">
        {CHANNEL_HEALTH.map((channel) => {
          const statusConfig = getStatusConfig(channel.status);
          const StatusIcon = statusConfig.icon;
          const isExpanded = expandedChannel === channel.platform;

          return (
            <div
              key={channel.platform}
              className="border border-neutral-200 rounded-xl overflow-hidden transition-all hover:border-primary-200"
            >
              <div
                className="flex items-center gap-4 p-4 cursor-pointer"
                onClick={() => setExpandedChannel(isExpanded ? null : channel.platform)}
              >
                {/* Status indicator */}
                <div className={`w-10 h-10 rounded-lg ${statusConfig.bg} flex items-center justify-center`}>
                  <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
                </div>

                {/* Platform info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-neutral-900">{channel.platform}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusConfig.bg} ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                  {channel.issues.length > 0 && (
                    <p className="text-xs text-neutral-500 mt-0.5 truncate">
                      {channel.issues[0]}
                    </p>
                  )}
                </div>

                {/* Health score */}
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getScoreColor(channel.score)}`}>
                    {channel.score}
                  </div>
                  <div className="text-xs text-neutral-500">Health Score</div>
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-0 border-t border-neutral-100 bg-neutral-50">
                  {/* Metrics grid */}
                  <div className="grid grid-cols-4 gap-4 py-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-neutral-900">
                        {channel.metrics.budgetUtilization}%
                      </div>
                      <div className="text-xs text-neutral-500">Budget Use</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-neutral-900">
                        {channel.metrics.costEfficiency}%
                      </div>
                      <div className="text-xs text-neutral-500">Cost Efficiency</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-neutral-900">
                        {channel.metrics.conversionRate}%
                      </div>
                      <div className="text-xs text-neutral-500">Conv. Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-neutral-900">
                        {channel.metrics.qualityScore}/10
                      </div>
                      <div className="text-xs text-neutral-500">Quality</div>
                    </div>
                  </div>

                  {/* Issues */}
                  {channel.issues.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs font-medium text-neutral-700 mb-2">Issues Detected</div>
                      <div className="space-y-1">
                        {channel.issues.map((issue, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-red-600">
                            <XCircle className="w-3 h-3" />
                            {issue}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  <div>
                    <div className="text-xs font-medium text-neutral-700 mb-2">Recommendations</div>
                    <div className="space-y-1">
                      {channel.recommendations.map((rec, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-primary-600">
                          <Sparkles className="w-3 h-3" />
                          {rec}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

// Memoized channel table
const ChannelTable = memo(function ChannelTable() {
  return (
    <div className="card overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-100">
        <h3 className="text-lg font-semibold text-neutral-800">Channel Performance</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Platform</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Spend</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Revenue</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">ROAS</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Conv.</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">CTR</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {DEMO_CHANNELS.map((channel) => (
              <tr key={channel.platform} className="hover:bg-neutral-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-neutral-800">
                  {channel.platform}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-neutral-600">
                  ${channel.spend.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-neutral-600">
                  ${channel.revenue.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className={channel.roas >= 4 ? 'text-emerald-600 font-medium' : 'text-neutral-600'}>
                    {channel.roas.toFixed(2)}x
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-neutral-600">
                  {channel.conversions.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-neutral-600">
                  {channel.ctr}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    channel.status === 'active' 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {channel.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { subscription, isPro, getPlanDisplayName } = useSubscriptionStore();

  // Memoize all computed values
  const isProUser = useMemo(() => isPro(), [subscription]);
  const planName = useMemo(() => getPlanDisplayName(), [subscription]);
  const userName = useMemo(() => user?.name?.split(' ')[0] || 'User', [user?.name]);
  const currentTime = useMemo(() => new Date().toLocaleTimeString(), []);

  // Use pre-computed static data - instant load
  const metrics = DEMO_METRICS;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Dashboard</h1>
          <p className="section-subtitle">
            Welcome back, {userName}
            {planName && planName !== 'No Plan' && (
              <span className="ml-2 text-primary-600">({planName})</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isProUser && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 rounded-full">
              <Crown className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-primary-700">Pro</span>
            </div>
          )}
          <div className="text-sm text-neutral-500">
            Last updated: {currentTime}
          </div>
        </div>
      </div>

      {/* Demo Notice */}
      <Alert type="info">
        Viewing sample data. Connect your ad platforms to see real metrics.
      </Alert>

      {/* KPI Cards - Static data, instant render */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Spend"
          value={metrics.totalSpend}
          prefix="$"
          trend={metrics.trends.spend}
          trendLabel="vs last month"
          icon={<DollarSign className="w-6 h-6" />}
        />
        <MetricCard
          title="Revenue"
          value={metrics.totalRevenue}
          prefix="$"
          trend={metrics.trends.revenue}
          trendLabel="vs last month"
          icon={<TrendingUp className="w-6 h-6" />}
        />
        <MetricCard
          title="ROAS"
          value={metrics.roas.toFixed(2)}
          suffix="x"
          trend={metrics.trends.roas}
          icon={<Target className="w-6 h-6" />}
        />
        <MetricCard
          title="Conversions"
          value={metrics.conversions}
          trend={metrics.trends.conversions}
          icon={<ShoppingCart className="w-6 h-6" />}
        />
      </div>

      {/* Charts Row - Memoized components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceChart />
        <ChannelBreakdown />
      </div>

      {/* Channel Health + AI Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChannelHealthPanel />
        <InsightsPanel isProUser={isProUser} />
      </div>

      {/* Channel Performance Table */}
      <ChannelTable />
    </div>
  );
}
