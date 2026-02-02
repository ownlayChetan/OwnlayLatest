import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { LoadingPage, Alert } from '@/components/common';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Play,
  Pause,
} from 'lucide-react';
import clsx from 'clsx';
import type { Campaign } from '@/types';

// Demo campaigns
const demoCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Summer Sale 2024',
    status: 'active',
    platform: 'Google Ads',
    budget: 15000,
    spent: 12450,
    startDate: '2024-06-01',
    endDate: '2024-08-31',
    objective: 'Conversion',
    metrics: { impressions: 850000, clicks: 24500, conversions: 892, roas: 4.2, ctr: 2.88 },
  },
  {
    id: '2',
    name: 'Brand Awareness Q3',
    status: 'active',
    platform: 'Meta Ads',
    budget: 10000,
    spent: 7800,
    startDate: '2024-07-01',
    objective: 'Awareness',
    metrics: { impressions: 1250000, clicks: 18200, conversions: 425, roas: 3.1, ctr: 1.46 },
  },
  {
    id: '3',
    name: 'Product Launch - New Line',
    status: 'paused',
    platform: 'TikTok',
    budget: 8000,
    spent: 5600,
    startDate: '2024-06-15',
    objective: 'Consideration',
    metrics: { impressions: 620000, clicks: 15800, conversions: 312, roas: 2.8, ctr: 2.55 },
  },
  {
    id: '4',
    name: 'Retargeting - Cart Abandoners',
    status: 'active',
    platform: 'Google Ads',
    budget: 5000,
    spent: 4200,
    startDate: '2024-05-01',
    objective: 'Conversion',
    metrics: { impressions: 180000, clicks: 8900, conversions: 445, roas: 5.8, ctr: 4.94 },
  },
  {
    id: '5',
    name: 'LinkedIn B2B Lead Gen',
    status: 'draft',
    platform: 'LinkedIn',
    budget: 12000,
    spent: 0,
    startDate: '2024-09-01',
    objective: 'Lead Generation',
    metrics: { impressions: 0, clicks: 0, conversions: 0, roas: 0, ctr: 0 },
  },
];

const statusColors = {
  active: 'badge-success',
  paused: 'badge-warning',
  completed: 'badge-neutral',
  draft: 'badge-neutral',
};

const platformColors: Record<string, string> = {
  'Google Ads': 'bg-blue-100 text-blue-700',
  'Meta Ads': 'bg-indigo-100 text-indigo-700',
  TikTok: 'bg-pink-100 text-pink-700',
  LinkedIn: 'bg-sky-100 text-sky-700',
};

export default function CampaignsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => api.getCampaigns(),
    staleTime: 1000 * 60 * 5,
  });

  const campaigns = data?.data || demoCampaigns;

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    const matchesPlatform = platformFilter === 'all' || campaign.platform === platformFilter;
    return matchesSearch && matchesStatus && matchesPlatform;
  });

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Campaigns</h1>
          <p className="section-subtitle">Manage your marketing campaigns across all platforms</p>
        </div>
        <button className="btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          New Campaign
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-auto"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="draft">Draft</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="input w-auto"
          >
            <option value="all">All Platforms</option>
            <option value="Google Ads">Google Ads</option>
            <option value="Meta Ads">Meta Ads</option>
            <option value="TikTok">TikTok</option>
            <option value="LinkedIn">LinkedIn</option>
          </select>
        </div>
      </div>

      {/* Demo notice */}
      {!data?.data && (
        <Alert type="info">
          Viewing sample campaigns. Connect your ad platforms to sync real campaigns.
        </Alert>
      )}

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredCampaigns.map((campaign) => (
          <div key={campaign.id} className="card p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className={clsx('badge', statusColors[campaign.status])}>
                    {campaign.status}
                  </span>
                  <span className={clsx('badge', platformColors[campaign.platform] || 'badge-neutral')}>
                    {campaign.platform}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-neutral-900">{campaign.name}</h3>
                <p className="text-sm text-neutral-500">{campaign.objective}</p>
              </div>
              <button className="btn-ghost btn-sm p-2">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            {/* Budget Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-neutral-600">Budget</span>
                <span className="font-medium">
                  ${campaign.spent.toLocaleString()} / ${campaign.budget.toLocaleString()}
                </span>
              </div>
              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className={clsx(
                    'h-full rounded-full transition-all',
                    (campaign.spent / campaign.budget) > 0.9
                      ? 'bg-red-500'
                      : (campaign.spent / campaign.budget) > 0.7
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  )}
                  style={{ width: `${Math.min((campaign.spent / campaign.budget) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-4 gap-3 text-center">
              <div>
                <p className="text-lg font-semibold text-neutral-900">
                  {(campaign.metrics.impressions / 1000).toFixed(0)}K
                </p>
                <p className="text-xs text-neutral-500">Impressions</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-neutral-900">
                  {(campaign.metrics.clicks / 1000).toFixed(1)}K
                </p>
                <p className="text-xs text-neutral-500">Clicks</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-neutral-900">
                  {campaign.metrics.conversions}
                </p>
                <p className="text-xs text-neutral-500">Conversions</p>
              </div>
              <div>
                <p className={clsx(
                  'text-lg font-semibold',
                  campaign.metrics.roas >= 3 ? 'text-green-600' : campaign.metrics.roas >= 2 ? 'text-yellow-600' : 'text-red-600'
                )}>
                  {campaign.metrics.roas.toFixed(1)}x
                </p>
                <p className="text-xs text-neutral-500">ROAS</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100">
              <div className="text-sm text-neutral-500">
                Started {new Date(campaign.startDate).toLocaleDateString()}
              </div>
              <div className="flex space-x-2">
                {campaign.status === 'active' ? (
                  <button className="btn-sm btn-ghost text-yellow-600">
                    <Pause className="w-4 h-4 mr-1" />
                    Pause
                  </button>
                ) : campaign.status === 'paused' || campaign.status === 'draft' ? (
                  <button className="btn-sm btn-ghost text-green-600">
                    <Play className="w-4 h-4 mr-1" />
                    {campaign.status === 'draft' ? 'Launch' : 'Resume'}
                  </button>
                ) : null}
                <button className="btn-sm btn-primary">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCampaigns.length === 0 && (
        <div className="card p-12 text-center">
          <Filter className="w-12 h-12 mx-auto text-neutral-300 mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 mb-2">No campaigns found</h3>
          <p className="text-neutral-500">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
