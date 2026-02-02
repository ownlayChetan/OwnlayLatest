import { useState } from 'react';
import { MetricCard } from '@/components/common';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import {
  Download,
  TrendingUp,
  Users,
  Globe,
  Target,
  DollarSign,
  Eye,
  MousePointerClick,
} from 'lucide-react';
import clsx from 'clsx';

// Demo data
const performanceData = Array.from({ length: 12 }, (_, i) => ({
  month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
  spend: 8000 + Math.random() * 4000,
  revenue: 32000 + Math.random() * 16000,
  conversions: 200 + Math.floor(Math.random() * 150),
}));

const platformComparison = [
  { platform: 'Google Ads', spend: 18500, revenue: 78400, roas: 4.24 },
  { platform: 'Meta Ads', spend: 15200, revenue: 62800, roas: 4.13 },
  { platform: 'TikTok', spend: 8300, revenue: 31200, roas: 3.76 },
  { platform: 'LinkedIn', spend: 3230, revenue: 10050, roas: 3.11 },
];

const funnelData = [
  { stage: 'Impressions', value: 2450000, percentage: 100 },
  { stage: 'Clicks', value: 68600, percentage: 2.8 },
  { stage: 'Add to Cart', value: 12400, percentage: 18.1 },
  { stage: 'Checkout', value: 5800, percentage: 46.8 },
  { stage: 'Purchase', value: 1847, percentage: 31.8 },
];

const demographicsData = [
  { age: '18-24', male: 12, female: 15 },
  { age: '25-34', male: 28, female: 32 },
  { age: '35-44', male: 22, female: 18 },
  { age: '45-54', male: 14, female: 12 },
  { age: '55+', male: 8, female: 6 },
];

const geoData = [
  { country: 'United States', revenue: 89400, percentage: 49 },
  { country: 'United Kingdom', revenue: 32100, percentage: 18 },
  { country: 'Canada', revenue: 24500, percentage: 13 },
  { country: 'Australia', revenue: 18200, percentage: 10 },
  { country: 'Germany', revenue: 18250, percentage: 10 },
];

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('30d');
  const [selectedPlatform, setSelectedPlatform] = useState('all');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Analytics</h1>
          <p className="section-subtitle">Deep dive into your marketing performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input w-auto"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="12m">Last 12 months</option>
          </select>
          <button className="btn-secondary">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Platform Tabs */}
      <div className="flex space-x-1 bg-neutral-100 p-1 rounded-lg w-fit">
        {['all', 'Google Ads', 'Meta Ads', 'TikTok', 'LinkedIn'].map((platform) => (
          <button
            key={platform}
            onClick={() => setSelectedPlatform(platform)}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              selectedPlatform === platform
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            )}
          >
            {platform === 'all' ? 'All Platforms' : platform}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <MetricCard title="Impressions" value="2.45M" icon={<Eye className="w-5 h-5" />} />
        <MetricCard title="Clicks" value="68.6K" icon={<MousePointerClick className="w-5 h-5" />} />
        <MetricCard title="CTR" value="2.8%" icon={<Target className="w-5 h-5" />} />
        <MetricCard title="CPM" value="$18.45" prefix="$" icon={<DollarSign className="w-5 h-5" />} />
        <MetricCard title="CPC" value="$0.66" prefix="$" icon={<DollarSign className="w-5 h-5" />} />
        <MetricCard title="Engagement" value="4.2%" icon={<TrendingUp className="w-5 h-5" />} />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Over Time */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Performance Over Time</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="month" stroke="#71717a" fontSize={12} />
                <YAxis yAxisId="left" stroke="#71717a" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="#71717a" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e4e4e7',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="spend"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Spend ($)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Revenue ($)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Comparison */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Platform Comparison</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformComparison} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis type="number" stroke="#71717a" fontSize={12} />
                <YAxis dataKey="platform" type="category" stroke="#71717a" fontSize={12} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e4e4e7',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="spend" fill="#8b5cf6" name="Spend ($)" />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Funnel & Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Conversion Funnel</h3>
          <div className="space-y-3">
            {funnelData.map((stage, index) => (
              <div key={stage.stage}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-neutral-900">{stage.stage}</span>
                  <span className="text-neutral-500">
                    {stage.value.toLocaleString()} ({stage.percentage}%)
                  </span>
                </div>
                <div className="h-8 bg-neutral-100 rounded overflow-hidden">
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${(stage.value / funnelData[0].value) * 100}%`,
                      backgroundColor: COLORS[index % COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-neutral-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-neutral-900">0.075%</p>
              <p className="text-xs text-neutral-500">Overall CVR</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">53.2%</p>
              <p className="text-xs text-neutral-500">Cart Abandonment</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">$98.72</p>
              <p className="text-xs text-neutral-500">AOV</p>
            </div>
          </div>
        </div>

        {/* Demographics */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-primary-600" />
            Audience Demographics
          </h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demographicsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="age" stroke="#71717a" fontSize={12} />
                <YAxis stroke="#71717a" fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="male" fill="#6366f1" name="Male %" />
                <Bar dataKey="female" fill="#ec4899" name="Female %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-8 mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500" />
              <span className="text-sm text-neutral-600">Male: 52%</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-pink-500" />
              <span className="text-sm text-neutral-600">Female: 48%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Geographic Performance */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
          <Globe className="w-5 h-5 mr-2 text-primary-600" />
          Geographic Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {geoData.map((country, index) => (
            <div key={country.country} className="p-4 bg-neutral-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">
                  {['🇺🇸', '🇬🇧', '🇨🇦', '🇦🇺', '🇩🇪'][index]}
                </span>
                <span className="font-medium text-neutral-900 text-sm truncate">
                  {country.country}
                </span>
              </div>
              <p className="text-xl font-bold text-neutral-900">
                ${(country.revenue / 1000).toFixed(1)}K
              </p>
              <div className="mt-2">
                <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500"
                    style={{ width: `${country.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-1">{country.percentage}% of total</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
