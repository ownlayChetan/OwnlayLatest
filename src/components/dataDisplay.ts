// OWNLAY Data Display Components
// Provides UI components that show dynamic data with static fallback indicators

// Data source indicator badge
export const dataSourceBadge = (isLive: boolean, connectedPlatforms?: string[]) => `
<div class="flex items-center gap-2 text-xs">
    ${isLive ? `
        <span class="flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 rounded-full">
            <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            Live Data
        </span>
        ${connectedPlatforms && connectedPlatforms.length > 0 ? `
            <span class="text-gray-400">from ${connectedPlatforms.length} platform${connectedPlatforms.length > 1 ? 's' : ''}</span>
        ` : ''}
    ` : `
        <span class="flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full">
            <i class="fas fa-info-circle text-xs"></i>
            Sample Data
        </span>
        <a href="/app/integrations" class="text-indigo-600 hover:text-indigo-700 hover:underline">Connect platforms for live data</a>
    `}
</div>
`

// KPI tile with data source indicator
export const kpiTileWithSource = (
    label: string, 
    value: string, 
    change?: string, 
    positive?: boolean, 
    icon?: string,
    isLive?: boolean
) => `
<div class="bg-white rounded-xl border ${isLive === false ? 'border-amber-200' : 'border-gray-200'} p-5 ${isLive === false ? 'bg-amber-50/30' : ''}">
    <div class="flex items-center justify-between mb-3">
        <span class="text-sm font-medium text-gray-500">${label}</span>
        ${icon ? `<div class="w-8 h-8 rounded-lg ${isLive === false ? 'bg-amber-100' : 'bg-indigo-100'} flex items-center justify-center"><i class="fas ${icon} ${isLive === false ? 'text-amber-600' : 'text-indigo-600'} text-sm"></i></div>` : ''}
    </div>
    <div class="flex items-end justify-between">
        <div>
            <p class="text-2xl font-bold text-gray-900">${value}</p>
            ${change ? `<p class="text-sm ${positive ? 'text-green-600' : 'text-red-600'} mt-1">
                <i class="fas fa-arrow-${positive ? 'up' : 'down'} mr-1"></i>${change}
            </p>` : ''}
        </div>
        ${isLive === false ? '<span class="text-xs text-amber-600">Sample</span>' : ''}
    </div>
</div>
`

// Empty state for unconnected data
export const emptyDataState = (title: string, description: string, actionUrl?: string, actionLabel?: string) => `
<div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">
    <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
        <i class="fas fa-plug text-gray-400 text-2xl"></i>
    </div>
    <h3 class="text-lg font-semibold text-gray-900 mb-2">${title}</h3>
    <p class="text-gray-600 mb-4 max-w-md mx-auto">${description}</p>
    ${actionUrl ? `
        <a href="${actionUrl}" class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
            <i class="fas fa-link"></i>
            ${actionLabel || 'Connect Platforms'}
        </a>
    ` : ''}
</div>
`

// Sample data banner
export const sampleDataBanner = () => `
<div class="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 mb-6">
    <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            <i class="fas fa-lightbulb text-amber-600"></i>
        </div>
        <div class="flex-1">
            <h4 class="font-semibold text-amber-900 mb-1">You're viewing sample data</h4>
            <p class="text-sm text-amber-700 mb-2">Connect your marketing platforms to see your real data, AI insights, and optimization recommendations.</p>
            <a href="/app/integrations" class="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700">
                <i class="fas fa-plug"></i>
                Connect Platforms
                <i class="fas fa-arrow-right text-xs"></i>
            </a>
        </div>
    </div>
</div>
`

// Platform connection status indicator
export const platformStatusIndicator = (platform: string, icon: string, iconColor: string, isConnected: boolean, lastSync?: string) => `
<div class="flex items-center justify-between p-3 bg-white rounded-lg border ${isConnected ? 'border-green-200' : 'border-gray-200'}">
    <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg ${isConnected ? 'bg-green-100' : 'bg-gray-100'} flex items-center justify-center">
            <i class="${icon} ${isConnected ? iconColor : 'text-gray-400'} text-lg"></i>
        </div>
        <div>
            <p class="font-medium text-gray-900">${platform}</p>
            <p class="text-xs ${isConnected ? 'text-green-600' : 'text-gray-500'}">
                ${isConnected ? `Last sync: ${lastSync || 'Just now'}` : 'Not connected'}
            </p>
        </div>
    </div>
    ${isConnected ? `
        <span class="flex items-center gap-1 text-xs text-green-600">
            <span class="w-2 h-2 bg-green-500 rounded-full"></span>
            Live
        </span>
    ` : `
        <button class="text-xs text-indigo-600 hover:text-indigo-700 font-medium">Connect</button>
    `}
</div>
`

// Channel performance row with live indicator
export const channelRow = (
    channel: string,
    icon: string,
    iconColor: string,
    spend: string,
    impressions: string,
    clicks: string,
    conversions: string,
    roas: string,
    isLive: boolean
) => `
<tr class="hover:bg-gray-50 ${isLive ? '' : 'bg-amber-50/30'}">
    <td class="px-6 py-4">
        <div class="flex items-center gap-2">
            <i class="${icon} ${iconColor}"></i>
            <span class="font-medium text-gray-900">${channel}</span>
            ${!isLive ? '<span class="text-xs text-amber-600">(sample)</span>' : ''}
        </div>
    </td>
    <td class="px-6 py-4 text-right">${spend}</td>
    <td class="px-6 py-4 text-right">${impressions}</td>
    <td class="px-6 py-4 text-right">${clicks}</td>
    <td class="px-6 py-4 text-right">${conversions}</td>
    <td class="px-6 py-4 text-right"><span class="${parseFloat(roas) >= 3 ? 'text-green-600' : 'text-amber-600'} font-semibold">${roas}x</span></td>
</tr>
`

// Interactive campaign card with full functionality
export const interactiveCampaignCard = (
    name: string,
    status: string,
    channels: string[],
    spend: string,
    conversions: string,
    roas: string,
    isLive: boolean = false,
    campaignId?: string
) => {
    const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
        active: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
        paused: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
        completed: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
        draft: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' }
    }
    
    const statusStyle = statusColors[status] || statusColors.draft
    
    const channelIcons: Record<string, string> = {
        google: '<i class="fab fa-google text-blue-500"></i>',
        meta: '<i class="fab fa-meta text-blue-600"></i>',
        tiktok: '<i class="fab fa-tiktok"></i>',
        linkedin: '<i class="fab fa-linkedin text-blue-700"></i>',
        google_ads: '<i class="fab fa-google text-blue-500"></i>',
        meta_ads: '<i class="fab fa-meta text-blue-600"></i>',
        tiktok_ads: '<i class="fab fa-tiktok"></i>',
        linkedin_ads: '<i class="fab fa-linkedin text-blue-700"></i>'
    }
    
    return `
    <div class="bg-white rounded-xl border ${isLive ? 'border-gray-200' : 'border-amber-200'} p-5 card-hover transition-all cursor-pointer" onclick="openCampaignModal('${campaignId || name}')">
        <div class="flex items-start justify-between mb-4">
            <div>
                <h4 class="font-semibold text-gray-900 mb-1">${name}</h4>
                <div class="flex items-center gap-1">
                    ${channels.map(ch => channelIcons[ch] || '').join('')}
                </div>
            </div>
            <span class="flex items-center gap-1.5 px-2.5 py-1 ${statusStyle.bg} ${statusStyle.text} text-xs font-medium rounded-full">
                <span class="w-1.5 h-1.5 ${statusStyle.dot} rounded-full"></span>
                ${status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        </div>
        <div class="grid grid-cols-3 gap-4 text-center pt-4 border-t border-gray-100">
            <div>
                <p class="text-lg font-semibold text-gray-900">${spend}</p>
                <p class="text-xs text-gray-500">Spend</p>
            </div>
            <div>
                <p class="text-lg font-semibold text-gray-900">${conversions}</p>
                <p class="text-xs text-gray-500">Conversions</p>
            </div>
            <div>
                <p class="text-lg font-semibold ${parseFloat(roas) >= 3 ? 'text-green-600' : 'text-amber-600'}">${roas}</p>
                <p class="text-xs text-gray-500">ROAS</p>
            </div>
        </div>
        ${!isLive ? '<div class="mt-3 text-center"><span class="text-xs text-amber-600">Sample campaign</span></div>' : ''}
    </div>
    `
}

// Export all
export default {
    dataSourceBadge,
    kpiTileWithSource,
    emptyDataState,
    sampleDataBanner,
    platformStatusIndicator,
    channelRow,
    interactiveCampaignCard
}
