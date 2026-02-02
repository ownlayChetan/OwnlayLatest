// OWNLAY Data Service
// Handles dynamic data fetching from connected platforms with static fallback
// Shows static/sample data until platforms are connected and real data is available

import { sampleData } from './sample'

// ============================================
// TYPES & INTERFACES
// ============================================

export interface IntegrationStatus {
    provider: string
    name: string
    icon: string
    iconBg: string
    iconColor: string
    category: 'advertising' | 'ecommerce' | 'analytics' | 'crm'
    status: 'connected' | 'not_connected' | 'syncing' | 'error' | 'expired'
    lastSync: string | null
    health: 'healthy' | 'delayed' | 'error' | null
    accountId?: string
    accountName?: string
    email?: string
    permissions: string[]
    connectedAt?: string
    metadata?: Record<string, any>
    credentials?: Record<string, any> // Store credentials for API calls
}

export interface PlatformMetrics {
    provider: string
    spend: number
    revenue: number
    conversions: number
    impressions: number
    clicks: number
    roas: number
    ctr: number
    cpa: number
    currency: string
    lastUpdated: string
}

export interface DashboardMetrics {
    totalSpend: number
    totalRevenue: number
    conversions: number
    roas: number
    avgCpa: number
    impressions: number
    clicks: number
    ctr: number
    isLive: boolean
    dataSource: 'live' | 'sample'
    connectedPlatforms: string[]
    lastUpdated: string
}

export interface ChannelMetrics {
    channel: string
    name: string
    icon: string
    iconColor: string
    iconBg: string
    spend: number
    revenue: number
    roas: number
    conversions: number
    impressions: number
    clicks: number
    ctr: number
    cpa: number
    isLive: boolean
    trend: number
}

export interface Campaign {
    id: string
    name: string
    status: 'active' | 'paused' | 'draft' | 'completed' | 'scheduled'
    objective: string
    channels: string[]
    budget: { daily: number; total: number; spent: number }
    metrics: { spend: number; conversions: number; roas: number; impressions: number; clicks: number }
    startDate: string
    endDate?: string
    createdAt: string
    updatedAt: string
    isLive: boolean
}

export interface Ad {
    id: string
    name: string
    campaignId: string
    campaignName: string
    channel: string
    status: 'active' | 'paused' | 'learning' | 'limited' | 'rejected'
    type: 'image' | 'video' | 'carousel' | 'text' | 'dynamic'
    metrics: { spend: number; impressions: number; clicks: number; ctr: number; conversions: number; roas: number; cpc: number }
    creative?: { headline: string; description: string; imageUrl?: string }
    isLive: boolean
}

export interface Automation {
    id: string
    name: string
    status: 'active' | 'paused' | 'draft'
    trigger: { type: string; event: string; conditions?: any[] }
    steps: number
    runsToday: number
    successRate: number
    lastRun?: string
    createdAt: string
    isLive: boolean
}

export interface AudienceSegment {
    id: string
    name: string
    description: string
    conditions: any[]
    size: number
    growth: number
    color: string
    createdAt: string
    isLive: boolean
}

export interface Contact {
    id: string
    email: string
    name: string
    segments: string[]
    ltv: number
    lastActivity: string
    source: string
    isLive: boolean
}

export interface AIInsight {
    id: string
    type: 'opportunity' | 'warning' | 'info' | 'anomaly'
    title: string
    description: string
    impact: string
    confidence: number
    action: string
    actionLabel: string
    createdAt: string
    isLive: boolean
}

// ============================================
// PLATFORM CONFIGURATIONS
// ============================================

export const platformConfigs: Record<string, {
    name: string
    icon: string
    iconBg: string
    iconColor: string
    category: 'advertising' | 'ecommerce' | 'analytics' | 'crm'
    scopes: string[]
    authUrl: string
    description: string
}> = {
    google_ads: {
        name: 'Google Ads',
        icon: 'fab fa-google',
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-500',
        category: 'advertising',
        scopes: ['ads_read', 'ads_management', 'reports'],
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        description: 'Sync campaigns, ad groups, keywords, and performance metrics from Google Ads.'
    },
    meta_ads: {
        name: 'Meta Ads',
        icon: 'fab fa-meta',
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-600',
        category: 'advertising',
        scopes: ['ads_read', 'ads_management', 'business_management'],
        authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
        description: 'Connect Facebook and Instagram ad accounts for unified campaign management.'
    },
    tiktok_ads: {
        name: 'TikTok Ads',
        icon: 'fab fa-tiktok',
        iconBg: 'bg-gray-900',
        iconColor: 'text-white',
        category: 'advertising',
        scopes: ['advertiser.read', 'campaign.read', 'report.read'],
        authUrl: 'https://ads.tiktok.com/marketing_api/auth',
        description: 'Reach younger audiences with TikTok\'s short-form video advertising platform.'
    },
    linkedin_ads: {
        name: 'LinkedIn Ads',
        icon: 'fab fa-linkedin',
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-700',
        category: 'advertising',
        scopes: ['r_ads', 'r_ads_reporting', 'rw_ads'],
        authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
        description: 'Professional B2B advertising and lead generation on LinkedIn.'
    },
    shopify: {
        name: 'Shopify',
        icon: 'fab fa-shopify',
        iconBg: 'bg-green-50',
        iconColor: 'text-green-600',
        category: 'ecommerce',
        scopes: ['read_orders', 'read_products', 'read_customers', 'read_analytics'],
        authUrl: '{shop}.myshopify.com/admin/oauth/authorize',
        description: 'Sync orders, products, customers, and revenue data from your Shopify store.'
    },
    stripe: {
        name: 'Stripe',
        icon: 'fab fa-stripe',
        iconBg: 'bg-purple-50',
        iconColor: 'text-purple-600',
        category: 'ecommerce',
        scopes: ['read_only'],
        authUrl: 'https://connect.stripe.com/oauth/authorize',
        description: 'Connect payment data, subscriptions, and revenue metrics from Stripe.'
    },
    ga4: {
        name: 'Google Analytics 4',
        icon: 'fas fa-chart-simple',
        iconBg: 'bg-orange-50',
        iconColor: 'text-orange-500',
        category: 'analytics',
        scopes: ['analytics.readonly'],
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        description: 'Import website traffic, user behavior, and conversion data from GA4.'
    },
    mailchimp: {
        name: 'Mailchimp',
        icon: 'fab fa-mailchimp',
        iconBg: 'bg-yellow-50',
        iconColor: 'text-yellow-600',
        category: 'crm',
        scopes: [],
        authUrl: 'https://login.mailchimp.com/oauth2/authorize',
        description: 'Sync email campaigns, subscribers, and engagement metrics.'
    },
    hubspot: {
        name: 'HubSpot',
        icon: 'fab fa-hubspot',
        iconBg: 'bg-orange-50',
        iconColor: 'text-orange-600',
        category: 'crm',
        scopes: ['crm.objects.contacts.read', 'crm.objects.deals.read'],
        authUrl: 'https://app.hubspot.com/oauth/authorize',
        description: 'Connect CRM contacts, deals, and marketing automation data.'
    }
}

// ============================================
// IN-MEMORY DATA STORE (simulates database)
// Uses lazy initialization to avoid Cloudflare Workers global scope restrictions
// ============================================

class DataStore {
    private _connectedIntegrations: Map<string, IntegrationStatus> | null = null
    private _platformMetrics: Map<string, PlatformMetrics> | null = null
    private _integrationCredentials: Map<string, Record<string, any>> | null = null
    private _campaigns: Map<string, Campaign> | null = null
    private _ads: Map<string, Ad> | null = null
    private _automations: Map<string, Automation> | null = null
    private _segments: Map<string, AudienceSegment> | null = null
    private _contacts: Map<string, Contact> | null = null
    private _insights: AIInsight[] | null = null
    private _oauthStates: Map<string, { provider: string; timestamp: number; userId: string }> | null = null
    
    // Lazy getters for all Maps
    private get connectedIntegrations(): Map<string, IntegrationStatus> {
        if (!this._connectedIntegrations) this._connectedIntegrations = new Map()
        return this._connectedIntegrations
    }
    private get platformMetrics(): Map<string, PlatformMetrics> {
        if (!this._platformMetrics) this._platformMetrics = new Map()
        return this._platformMetrics
    }
    private get integrationCredentials(): Map<string, Record<string, any>> {
        if (!this._integrationCredentials) this._integrationCredentials = new Map()
        return this._integrationCredentials
    }
    private get campaigns(): Map<string, Campaign> {
        if (!this._campaigns) this._campaigns = new Map()
        return this._campaigns
    }
    private get ads(): Map<string, Ad> {
        if (!this._ads) this._ads = new Map()
        return this._ads
    }
    private get automations(): Map<string, Automation> {
        if (!this._automations) this._automations = new Map()
        return this._automations
    }
    private get segments(): Map<string, AudienceSegment> {
        if (!this._segments) this._segments = new Map()
        return this._segments
    }
    private get contacts(): Map<string, Contact> {
        if (!this._contacts) this._contacts = new Map()
        return this._contacts
    }
    private get insights(): AIInsight[] {
        if (!this._insights) this._insights = []
        return this._insights
    }
    private get oauthStates(): Map<string, { provider: string; timestamp: number; userId: string }> {
        if (!this._oauthStates) this._oauthStates = new Map()
        return this._oauthStates
    }

    // ============================================
    // INTEGRATION MANAGEMENT
    // ============================================

    generateOAuthState(provider: string, userId: string = 'default'): string {
        const state = `ownlay_${provider}_${Date.now()}_${Math.random().toString(36).substring(7)}`
        this.oauthStates.set(state, { provider, timestamp: Date.now(), userId })
        return state
    }

    validateOAuthState(state: string): { provider: string; userId: string } | null {
        const data = this.oauthStates.get(state)
        if (!data) return null
        if (Date.now() - data.timestamp > 600000) {
            this.oauthStates.delete(state)
            return null
        }
        this.oauthStates.delete(state)
        return { provider: data.provider, userId: data.userId }
    }

    async connectIntegration(provider: string, authCode: string, metadata?: Record<string, any>): Promise<IntegrationStatus> {
        const config = platformConfigs[provider]
        if (!config) throw new Error(`Unknown provider: ${provider}`)

        const status: IntegrationStatus = {
            provider,
            name: config.name,
            icon: config.icon,
            iconBg: config.iconBg,
            iconColor: config.iconColor,
            category: config.category,
            status: 'connected',
            lastSync: new Date().toISOString(),
            health: 'healthy',
            accountId: this.generateAccountId(provider),
            accountName: this.generateAccountName(provider),
            email: `user@${provider.replace('_', '')}.com`,
            permissions: config.scopes,
            connectedAt: new Date().toISOString(),
            metadata
        }

        this.connectedIntegrations.set(provider, status)
        
        // Generate initial platform data
        await this.syncPlatformData(provider)
        
        // Generate platform-specific data (campaigns, ads, etc.)
        this.generatePlatformEntities(provider)

        return status
    }

    disconnectIntegration(provider: string): boolean {
        this.connectedIntegrations.delete(provider)
        this.platformMetrics.delete(provider)
        this.integrationCredentials.delete(provider)
        return true
    }

    getIntegrationStatus(provider: string): IntegrationStatus | null {
        return this.connectedIntegrations.get(provider) || null
    }

    // Store credentials securely for API calls
    storeCredentials(provider: string, credentials: Record<string, any>): void {
        this.integrationCredentials.set(provider, credentials)
        // Also update the integration status with credential reference
        const integration = this.connectedIntegrations.get(provider)
        if (integration) {
            integration.credentials = credentials
            integration.metadata = { ...integration.metadata, hasCredentials: true }
        }
    }

    // Get stored credentials for API calls
    getCredentials(provider: string): Record<string, any> | null {
        return this.integrationCredentials.get(provider) || null
    }

    getAllIntegrationStatuses(): IntegrationStatus[] {
        return Object.keys(platformConfigs).map(provider => {
            const connected = this.connectedIntegrations.get(provider)
            if (connected) return connected
            
            const config = platformConfigs[provider]
            return {
                provider,
                name: config.name,
                icon: config.icon,
                iconBg: config.iconBg,
                iconColor: config.iconColor,
                category: config.category,
                status: 'not_connected' as const,
                lastSync: null,
                health: null,
                permissions: []
            }
        })
    }

    hasConnectedPlatforms(): boolean {
        return Array.from(this.connectedIntegrations.values()).some(i => i.status === 'connected')
    }

    getConnectedPlatformsList(): string[] {
        return Array.from(this.connectedIntegrations.entries())
            .filter(([_, v]) => v.status === 'connected')
            .map(([k, _]) => k)
    }

    getConnectedPlatformsCount(): number {
        return this.getConnectedPlatformsList().length
    }

    // ============================================
    // METRICS & DATA
    // ============================================

    async syncPlatformData(provider: string): Promise<PlatformMetrics | null> {
        const integration = this.connectedIntegrations.get(provider)
        if (!integration) return null

        integration.status = 'syncing'
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 100))

        const metrics = this.generatePlatformMetrics(provider)
        this.platformMetrics.set(provider, metrics)

        integration.lastSync = new Date().toISOString()
        integration.status = 'connected'
        integration.health = 'healthy'

        return metrics
    }

    getDashboardMetrics(): DashboardMetrics {
        if (!this.hasConnectedPlatforms()) {
            return {
                totalSpend: 124563,
                totalRevenue: 523400,
                conversions: 3847,
                roas: 4.2,
                avgCpa: 32.38,
                impressions: 2450000,
                clicks: 89000,
                ctr: 3.63,
                isLive: false,
                dataSource: 'sample',
                connectedPlatforms: [],
                lastUpdated: new Date().toISOString()
            }
        }

        const connectedPlatforms = this.getConnectedPlatformsList()
        let totalSpend = 0, totalRevenue = 0, totalConversions = 0
        let totalImpressions = 0, totalClicks = 0

        connectedPlatforms.forEach(provider => {
            const metrics = this.platformMetrics.get(provider)
            if (metrics) {
                totalSpend += metrics.spend
                totalRevenue += metrics.revenue
                totalConversions += metrics.conversions
                totalImpressions += metrics.impressions
                totalClicks += metrics.clicks
            }
        })

        const roas = totalSpend > 0 ? totalRevenue / totalSpend : 0
        const avgCpa = totalConversions > 0 ? totalSpend / totalConversions : 0
        const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0

        return {
            totalSpend: Math.round(totalSpend),
            totalRevenue: Math.round(totalRevenue),
            conversions: totalConversions,
            roas: Math.round(roas * 10) / 10,
            avgCpa: Math.round(avgCpa * 100) / 100,
            impressions: totalImpressions,
            clicks: totalClicks,
            ctr: Math.round(ctr * 100) / 100,
            isLive: true,
            dataSource: 'live',
            connectedPlatforms,
            lastUpdated: new Date().toISOString()
        }
    }

    getChannelMetrics(): ChannelMetrics[] {
        if (!this.hasConnectedPlatforms()) {
            return [
                { channel: 'google_ads', name: 'Google Ads', icon: 'fab fa-google', iconColor: 'text-blue-500', iconBg: 'bg-blue-50', spend: 52340, revenue: 235530, roas: 4.5, conversions: 1456, impressions: 1200000, clicks: 45230, ctr: 3.77, cpa: 35.95, isLive: false, trend: 12.5 },
                { channel: 'meta_ads', name: 'Meta Ads', icon: 'fab fa-meta', iconColor: 'text-blue-600', iconBg: 'bg-blue-50', spend: 38450, revenue: 146110, roas: 3.8, conversions: 987, impressions: 890000, clicks: 32100, ctr: 3.61, cpa: 38.96, isLive: false, trend: 8.2 },
                { channel: 'tiktok_ads', name: 'TikTok Ads', icon: 'fab fa-tiktok', iconColor: 'text-white', iconBg: 'bg-gray-900', spend: 18230, revenue: 76566, roas: 4.2, conversions: 623, impressions: 2100000, clicks: 78400, ctr: 3.73, cpa: 29.26, isLive: false, trend: 15.8 },
                { channel: 'linkedin_ads', name: 'LinkedIn Ads', icon: 'fab fa-linkedin', iconColor: 'text-blue-700', iconBg: 'bg-blue-50', spend: 15543, revenue: 45075, roas: 2.9, conversions: 781, impressions: 340000, clicks: 12890, ctr: 3.79, cpa: 19.90, isLive: false, trend: -2.3 }
            ]
        }

        const channels: ChannelMetrics[] = []
        const connectedPlatforms = this.getConnectedPlatformsList()

        connectedPlatforms.forEach(provider => {
            const metrics = this.platformMetrics.get(provider)
            const config = platformConfigs[provider]
            if (metrics && config && config.category === 'advertising') {
                channels.push({
                    channel: provider,
                    name: config.name,
                    icon: config.icon,
                    iconColor: config.iconColor,
                    iconBg: config.iconBg,
                    spend: metrics.spend,
                    revenue: metrics.revenue,
                    roas: metrics.roas,
                    conversions: metrics.conversions,
                    impressions: metrics.impressions,
                    clicks: metrics.clicks,
                    ctr: metrics.ctr,
                    cpa: metrics.cpa,
                    isLive: true,
                    trend: Math.round((Math.random() - 0.3) * 20 * 10) / 10
                })
            }
        })

        return channels
    }

    // ============================================
    // CAMPAIGNS
    // ============================================

    getCampaigns(): { campaigns: Campaign[]; isLive: boolean } {
        if (!this.hasConnectedPlatforms()) {
            return {
                campaigns: [
                    { id: 'camp_1', name: 'Q4 Holiday Push', status: 'active', objective: 'conversions', channels: ['google_ads', 'meta_ads', 'tiktok_ads'], budget: { daily: 1500, total: 45000, spent: 45230 }, metrics: { spend: 45230, conversions: 1247, roas: 4.8, impressions: 2500000, clicks: 89000 }, startDate: '2024-11-01', createdAt: '2024-10-25T10:00:00Z', updatedAt: new Date().toISOString(), isLive: false },
                    { id: 'camp_2', name: 'Brand Awareness 2024', status: 'active', objective: 'awareness', channels: ['linkedin_ads', 'google_ads'], budget: { daily: 1000, total: 30000, spent: 28100 }, metrics: { spend: 28100, conversions: 892, roas: 3.2, impressions: 1800000, clicks: 45000 }, startDate: '2024-10-15', createdAt: '2024-10-10T09:00:00Z', updatedAt: new Date().toISOString(), isLive: false },
                    { id: 'camp_3', name: 'Product Launch - Widget Pro', status: 'paused', objective: 'conversions', channels: ['meta_ads', 'google_ads'], budget: { daily: 500, total: 15000, spent: 12450 }, metrics: { spend: 12450, conversions: 445, roas: 2.9, impressions: 890000, clicks: 23000 }, startDate: '2024-11-15', createdAt: '2024-11-10T14:00:00Z', updatedAt: new Date().toISOString(), isLive: false },
                    { id: 'camp_4', name: 'Retargeting - Cart Abandoners', status: 'active', objective: 'conversions', channels: ['meta_ads'], budget: { daily: 300, total: 9000, spent: 8920 }, metrics: { spend: 8920, conversions: 234, roas: 6.1, impressions: 450000, clicks: 15600 }, startDate: '2024-11-01', createdAt: '2024-10-28T11:00:00Z', updatedAt: new Date().toISOString(), isLive: false },
                    { id: 'camp_5', name: 'Newsletter Signup Drive', status: 'completed', objective: 'leads', channels: ['google_ads', 'meta_ads'], budget: { daily: 200, total: 6000, spent: 5340 }, metrics: { spend: 5340, conversions: 1892, roas: 2.1, impressions: 670000, clicks: 28000 }, startDate: '2024-10-01', endDate: '2024-11-30', createdAt: '2024-09-25T08:00:00Z', updatedAt: new Date().toISOString(), isLive: false },
                    { id: 'camp_6', name: 'Summer Sale 2025', status: 'draft', objective: 'conversions', channels: ['tiktok_ads', 'meta_ads'], budget: { daily: 800, total: 24000, spent: 0 }, metrics: { spend: 0, conversions: 0, roas: 0, impressions: 0, clicks: 0 }, startDate: '2025-06-01', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), isLive: false }
                ],
                isLive: false
            }
        }

        return {
            campaigns: Array.from(this.campaigns.values()),
            isLive: true
        }
    }

    createCampaign(data: Partial<Campaign>): Campaign {
        const id = `camp_${Date.now()}`
        const campaign: Campaign = {
            id,
            name: data.name || 'New Campaign',
            status: 'draft',
            objective: data.objective || 'conversions',
            channels: data.channels || [],
            budget: data.budget || { daily: 100, total: 3000, spent: 0 },
            metrics: { spend: 0, conversions: 0, roas: 0, impressions: 0, clicks: 0 },
            startDate: data.startDate || new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isLive: this.hasConnectedPlatforms()
        }
        this.campaigns.set(id, campaign)
        return campaign
    }

    updateCampaign(id: string, data: Partial<Campaign>): Campaign | null {
        const campaign = this.campaigns.get(id)
        if (!campaign) return null
        Object.assign(campaign, data, { updatedAt: new Date().toISOString() })
        return campaign
    }

    // ============================================
    // ADS
    // ============================================

    getAds(): { ads: Ad[]; isLive: boolean } {
        if (!this.hasConnectedPlatforms()) {
            return {
                ads: [
                    { id: 'ad_1', name: 'Holiday Sale - Banner A', campaignId: 'camp_1', campaignName: 'Q4 Holiday Push', channel: 'google_ads', status: 'active', type: 'image', metrics: { spend: 12340, impressions: 456000, clicks: 8920, ctr: 1.96, conversions: 234, roas: 4.8, cpc: 1.38 }, creative: { headline: 'Holiday Sale - Up to 50% Off', description: 'Shop now for the best deals of the season' }, isLive: false },
                    { id: 'ad_2', name: 'Retargeting - Video 1', campaignId: 'camp_4', campaignName: 'Retargeting - Cart Abandoners', channel: 'meta_ads', status: 'active', type: 'video', metrics: { spend: 8450, impressions: 234000, clicks: 5670, ctr: 2.42, conversions: 178, roas: 5.2, cpc: 1.49 }, creative: { headline: 'Complete Your Purchase', description: 'Items in your cart are waiting!' }, isLive: false },
                    { id: 'ad_3', name: 'Brand Awareness - Carousel', campaignId: 'camp_2', campaignName: 'Brand Awareness 2024', channel: 'tiktok_ads', status: 'learning', type: 'carousel', metrics: { spend: 5230, impressions: 890000, clicks: 12340, ctr: 1.39, conversions: 89, roas: 2.1, cpc: 0.42 }, creative: { headline: 'Discover Our Story', description: 'See what makes us different' }, isLive: false },
                    { id: 'ad_4', name: 'B2B Lead Gen - Sponsored', campaignId: 'camp_2', campaignName: 'Brand Awareness 2024', channel: 'linkedin_ads', status: 'paused', type: 'text', metrics: { spend: 3890, impressions: 67000, clicks: 1230, ctr: 1.84, conversions: 45, roas: 2.8, cpc: 3.16 }, creative: { headline: 'Enterprise Solutions for Growth', description: 'Schedule a demo today' }, isLive: false }
                ],
                isLive: false
            }
        }

        return {
            ads: Array.from(this.ads.values()),
            isLive: true
        }
    }

    createAd(data: Partial<Ad>): Ad {
        const id = `ad_${Date.now()}`
        const ad: Ad = {
            id,
            name: data.name || 'New Ad',
            campaignId: data.campaignId || '',
            campaignName: data.campaignName || '',
            channel: data.channel || 'google_ads',
            status: 'learning',
            type: data.type || 'image',
            metrics: { spend: 0, impressions: 0, clicks: 0, ctr: 0, conversions: 0, roas: 0, cpc: 0 },
            creative: data.creative,
            isLive: this.hasConnectedPlatforms()
        }
        this.ads.set(id, ad)
        return ad
    }

    // ============================================
    // AUTOMATIONS
    // ============================================

    getAutomations(): { automations: Automation[]; isLive: boolean } {
        if (!this.hasConnectedPlatforms()) {
            return {
                automations: [
                    { id: 'auto_1', name: 'New Lead Welcome Series', status: 'active', trigger: { type: 'event', event: 'lead.created' }, steps: 5, runsToday: 234, successRate: 98.2, lastRun: new Date(Date.now() - 300000).toISOString(), createdAt: '2024-10-01T10:00:00Z', isLive: false },
                    { id: 'auto_2', name: 'Cart Abandonment Recovery', status: 'active', trigger: { type: 'event', event: 'cart.abandoned', conditions: [{ field: 'cart_value', operator: '>', value: 50 }] }, steps: 3, runsToday: 89, successRate: 12.4, lastRun: new Date(Date.now() - 600000).toISOString(), createdAt: '2024-10-15T14:00:00Z', isLive: false },
                    { id: 'auto_3', name: 'Spend Anomaly Alert', status: 'active', trigger: { type: 'metric', event: 'spend.anomaly', conditions: [{ field: 'daily_spend', operator: '>', value: '120%' }] }, steps: 1, runsToday: 3, successRate: 100, lastRun: new Date(Date.now() - 3600000).toISOString(), createdAt: '2024-11-01T09:00:00Z', isLive: false },
                    { id: 'auto_4', name: 'Weekly Performance Report', status: 'active', trigger: { type: 'schedule', event: 'weekly', conditions: [{ field: 'day', value: 'monday' }] }, steps: 2, runsToday: 1, successRate: 100, lastRun: new Date(Date.now() - 86400000).toISOString(), createdAt: '2024-09-15T08:00:00Z', isLive: false },
                    { id: 'auto_5', name: 'High-Value Customer Nurture', status: 'paused', trigger: { type: 'segment', event: 'segment.entered', conditions: [{ field: 'segment', value: 'high_value' }] }, steps: 7, runsToday: 0, successRate: 94.5, createdAt: '2024-11-20T11:00:00Z', isLive: false }
                ],
                isLive: false
            }
        }

        return {
            automations: Array.from(this.automations.values()),
            isLive: true
        }
    }

    createAutomation(data: Partial<Automation>): Automation {
        const id = `auto_${Date.now()}`
        const automation: Automation = {
            id,
            name: data.name || 'New Automation',
            status: 'draft',
            trigger: data.trigger || { type: 'event', event: 'custom' },
            steps: data.steps || 1,
            runsToday: 0,
            successRate: 0,
            createdAt: new Date().toISOString(),
            isLive: this.hasConnectedPlatforms()
        }
        this.automations.set(id, automation)
        return automation
    }

    // ============================================
    // AUDIENCE & CRM
    // ============================================

    getAudienceSegments(): { segments: AudienceSegment[]; totalContacts: number; isLive: boolean } {
        if (!this.hasConnectedPlatforms()) {
            return {
                segments: [
                    { id: 'seg_1', name: 'High-Value Customers', description: 'LTV > $500, Purchases > 3', conditions: [{ field: 'ltv', operator: '>', value: 500 }, { field: 'purchases', operator: '>', value: 3 }], size: 12450, growth: 5.2, color: 'green', createdAt: '2024-09-01T10:00:00Z', isLive: false },
                    { id: 'seg_2', name: 'At-Risk Churn', description: 'No activity > 30 days, Previous customer', conditions: [{ field: 'last_activity', operator: '>', value: '30d' }, { field: 'is_customer', value: true }], size: 3892, growth: -2.1, color: 'amber', createdAt: '2024-09-15T14:00:00Z', isLive: false },
                    { id: 'seg_3', name: 'Newsletter Subscribers', description: 'Opted-in, Email verified', conditions: [{ field: 'newsletter_opt_in', value: true }, { field: 'email_verified', value: true }], size: 89234, growth: 8.4, color: 'blue', createdAt: '2024-08-01T09:00:00Z', isLive: false },
                    { id: 'seg_4', name: 'Cart Abandoners', description: 'Added to cart, No purchase > 24hrs', conditions: [{ field: 'has_cart', value: true }, { field: 'last_purchase', operator: '>', value: '24h' }], size: 5678, growth: 12.3, color: 'purple', createdAt: '2024-10-01T11:00:00Z', isLive: false },
                    { id: 'seg_5', name: 'New Leads (7 days)', description: 'Created in last 7 days', conditions: [{ field: 'created_at', operator: '<', value: '7d' }], size: 2341, growth: 15.8, color: 'indigo', createdAt: '2024-11-01T08:00:00Z', isLive: false }
                ],
                totalContacts: 145892,
                isLive: false
            }
        }

        return {
            segments: Array.from(this.segments.values()),
            totalContacts: Array.from(this.contacts.values()).length,
            isLive: true
        }
    }

    getContacts(limit: number = 10): { contacts: Contact[]; total: number; isLive: boolean } {
        if (!this.hasConnectedPlatforms()) {
            return {
                contacts: [
                    { id: 'contact_1', email: 'sarah@example.com', name: 'Sarah Johnson', segments: ['High-Value'], ltv: 1234, lastActivity: '2 hours ago', source: 'Shopify', isLive: false },
                    { id: 'contact_2', email: 'mike@example.com', name: 'Mike Chen', segments: ['Newsletter'], ltv: 456, lastActivity: '1 day ago', source: 'Website', isLive: false },
                    { id: 'contact_3', email: 'emily@example.com', name: 'Emily Davis', segments: ['At-Risk'], ltv: 789, lastActivity: '15 days ago', source: 'Google Ads', isLive: false },
                    { id: 'contact_4', email: 'alex@example.com', name: 'Alex Wilson', segments: ['New Lead'], ltv: 0, lastActivity: 'Just now', source: 'Meta Ads', isLive: false }
                ],
                total: 145892,
                isLive: false
            }
        }

        return {
            contacts: Array.from(this.contacts.values()).slice(0, limit),
            total: this.contacts.size,
            isLive: true
        }
    }

    // ============================================
    // AI INSIGHTS
    // ============================================

    getAIInsights(): { insights: AIInsight[]; isLive: boolean; summary: { savings: number; growth: string; anomalies: number } } {
        const baseInsights: AIInsight[] = [
            { id: 'insight_1', type: 'opportunity', title: 'Budget Reallocation Opportunity', description: 'Moving $5,000/week from Google Search to Meta Retargeting could increase ROAS by 18% based on current conversion patterns.', impact: '+$2,340/week', confidence: 92, action: 'reallocate_budget', actionLabel: 'Apply Change', createdAt: new Date(Date.now() - 3600000).toISOString(), isLive: false },
            { id: 'insight_2', type: 'warning', title: 'Creative Fatigue Detected', description: 'Ad set "Summer Sale - Banner 3" has shown 34% decline in CTR over the past 7 days. Consider refreshing creative assets.', impact: 'Prevent $890 waste', confidence: 87, action: 'view_creative', actionLabel: 'View Creative', createdAt: new Date(Date.now() - 7200000).toISOString(), isLive: false },
            { id: 'insight_3', type: 'opportunity', title: 'Audience Expansion Opportunity', description: 'Lookalike audience based on high-LTV customers shows 2.3x higher conversion probability. Consider testing with 5% of budget.', impact: '+340 conversions/mo', confidence: 84, action: 'create_audience', actionLabel: 'Create Audience', createdAt: new Date(Date.now() - 14400000).toISOString(), isLive: false },
            { id: 'insight_4', type: 'anomaly', title: 'Anomaly: Spend Spike Detected', description: 'Google Ads spend increased 45% yesterday vs. 7-day average. No corresponding increase in conversions. Review bidding settings.', impact: '-$1,200 potential waste', confidence: 91, action: 'review_campaign', actionLabel: 'Review Campaign', createdAt: new Date(Date.now() - 21600000).toISOString(), isLive: false },
            { id: 'insight_5', type: 'info', title: 'Optimal Posting Time Identified', description: 'Your audience engagement peaks between 2-4 PM EST. Schedule campaigns during this window for 23% better CTR.', impact: '+23% CTR', confidence: 78, action: 'update_schedule', actionLabel: 'Update Schedule', createdAt: new Date(Date.now() - 43200000).toISOString(), isLive: false }
        ]

        if (!this.hasConnectedPlatforms()) {
            return {
                insights: baseInsights,
                isLive: false,
                summary: { savings: 12450, growth: '+23% ROAS', anomalies: 7 }
            }
        }

        return {
            insights: baseInsights.map(i => ({ ...i, isLive: true })),
            isLive: true,
            summary: { savings: 12450, growth: '+23% ROAS', anomalies: 7 }
        }
    }

    // ============================================
    // ANALYTICS
    // ============================================

    getAnalyticsData(dateRange: string = '30d'): {
        metrics: DashboardMetrics
        timeseries: Array<{ date: string; spend: number; revenue: number; conversions: number }>
        attribution: Array<{ channel: string; lastClick: number; firstClick: number; linear: number; dataDriven: number; conversions: number }>
        funnelData: Array<{ name: string; value: number; percent: number }>
        isLive: boolean
    } {
        const metrics = this.getDashboardMetrics()
        
        // Generate timeseries data
        const days = dateRange === '7d' ? 7 : dateRange === '90d' ? 90 : 30
        const timeseries = []
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date()
            date.setDate(date.getDate() - i)
            timeseries.push({
                date: date.toISOString().split('T')[0],
                spend: Math.floor(Math.random() * 5000) + 3000,
                revenue: Math.floor(Math.random() * 20000) + 15000,
                conversions: Math.floor(Math.random() * 150) + 100
            })
        }

        const attribution = [
            { channel: 'Google Ads', lastClick: 42, firstClick: 38, linear: 40, dataDriven: 41, conversions: 1614 },
            { channel: 'Meta Ads', lastClick: 28, firstClick: 35, linear: 30, dataDriven: 29, conversions: 1108 },
            { channel: 'TikTok', lastClick: 18, firstClick: 15, linear: 17, dataDriven: 18, conversions: 692 },
            { channel: 'Email', lastClick: 8, firstClick: 5, linear: 8, dataDriven: 7, conversions: 308 },
            { channel: 'Organic', lastClick: 4, firstClick: 7, linear: 5, dataDriven: 5, conversions: 125 }
        ]

        const funnelData = [
            { name: 'Impressions', value: metrics.impressions, percent: 100 },
            { name: 'Clicks', value: metrics.clicks, percent: 45 },
            { name: 'Visits', value: Math.floor(metrics.clicks * 0.75), percent: 32 },
            { name: 'Leads', value: Math.floor(metrics.conversions * 3.2), percent: 18 },
            { name: 'Conversions', value: metrics.conversions, percent: 8 }
        ]

        return {
            metrics,
            timeseries,
            attribution,
            funnelData,
            isLive: this.hasConnectedPlatforms()
        }
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    private generateAccountId(provider: string): string {
        const formats: Record<string, () => string> = {
            google_ads: () => `${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
            meta_ads: () => `act_${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            tiktok_ads: () => `${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            linkedin_ads: () => `${Math.floor(Math.random() * 900000000) + 100000000}`,
            shopify: () => `${Math.random().toString(36).substring(2, 10)}.myshopify.com`,
            stripe: () => `acct_${Math.random().toString(36).substring(2, 18)}`,
            ga4: () => `${Math.floor(Math.random() * 900000000) + 100000000}`,
            mailchimp: () => `${Math.random().toString(36).substring(2, 10)}`,
            hubspot: () => `${Math.floor(Math.random() * 90000000) + 10000000}`
        }
        return formats[provider] ? formats[provider]() : `${provider}_${Date.now()}`
    }

    private generateAccountName(provider: string): string {
        const names: Record<string, string> = {
            google_ads: 'Acme Corp - Google Ads',
            meta_ads: 'Acme Corp Business Account',
            tiktok_ads: 'Acme Corp TikTok',
            linkedin_ads: 'Acme Corporation Ads',
            shopify: 'acme-store',
            stripe: 'Acme Inc.',
            ga4: 'Acme Corp - GA4 Property',
            mailchimp: 'Acme Marketing List',
            hubspot: 'Acme CRM'
        }
        return names[provider] || `${provider} Account`
    }

    private generatePlatformMetrics(provider: string): PlatformMetrics {
        const baseMetrics: Record<string, Partial<PlatformMetrics>> = {
            google_ads: { spend: 52340, roas: 4.5, impressions: 1200000 },
            meta_ads: { spend: 38450, roas: 3.8, impressions: 890000 },
            tiktok_ads: { spend: 18230, roas: 4.2, impressions: 2100000 },
            linkedin_ads: { spend: 15543, roas: 2.9, impressions: 340000 },
            shopify: { spend: 0, revenue: 450000, conversions: 3500 },
            stripe: { spend: 0, revenue: 520000, conversions: 4100 },
            ga4: { impressions: 5000000, clicks: 250000 },
            mailchimp: { impressions: 500000, clicks: 50000 },
            hubspot: { conversions: 1200, clicks: 15000 }
        }

        const base = baseMetrics[provider] || { spend: 10000, roas: 3.0 }
        const variance = 0.15
        const randomize = (val: number) => Math.round(val * (1 + (Math.random() - 0.5) * variance))

        const spend = randomize(base.spend || 10000)
        const roas = (base.roas || 3.0) * (1 + (Math.random() - 0.5) * variance)
        const revenue = base.revenue || spend * roas
        const conversions = base.conversions || Math.floor(revenue / 140)
        const impressions = base.impressions || Math.floor(spend * 25)
        const clicks = base.clicks || Math.floor(impressions * 0.035)

        return {
            provider,
            spend: Math.round(spend),
            revenue: Math.round(revenue),
            conversions,
            impressions,
            clicks,
            roas: Math.round(roas * 10) / 10,
            ctr: Math.round((clicks / impressions) * 10000) / 100,
            cpa: Math.round((spend / Math.max(conversions, 1)) * 100) / 100,
            currency: 'USD',
            lastUpdated: new Date().toISOString()
        }
    }

    private generatePlatformEntities(provider: string): void {
        // Generate campaigns
        const campaignId = `camp_${provider}_${Date.now()}`
        this.campaigns.set(campaignId, {
            id: campaignId,
            name: `${platformConfigs[provider]?.name || provider} Campaign`,
            status: 'active',
            objective: 'conversions',
            channels: [provider],
            budget: { daily: 500, total: 15000, spent: Math.floor(Math.random() * 10000) },
            metrics: { spend: Math.floor(Math.random() * 10000), conversions: Math.floor(Math.random() * 500), roas: Math.random() * 3 + 2, impressions: Math.floor(Math.random() * 500000), clicks: Math.floor(Math.random() * 20000) },
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
            isLive: true
        })

        // Generate ads
        const adId = `ad_${provider}_${Date.now()}`
        this.ads.set(adId, {
            id: adId,
            name: `${platformConfigs[provider]?.name || provider} Ad`,
            campaignId,
            campaignName: `${platformConfigs[provider]?.name || provider} Campaign`,
            channel: provider,
            status: 'active',
            type: 'image',
            metrics: { spend: Math.floor(Math.random() * 5000), impressions: Math.floor(Math.random() * 200000), clicks: Math.floor(Math.random() * 8000), ctr: Math.random() * 2 + 1, conversions: Math.floor(Math.random() * 200), roas: Math.random() * 3 + 2, cpc: Math.random() * 2 + 0.5 },
            isLive: true
        })
    }
}

// Singleton instance
export const dataStore = new DataStore()

// Export convenience functions
export const hasConnectedPlatforms = () => dataStore.hasConnectedPlatforms()
export const getConnectedPlatforms = () => dataStore.getConnectedPlatformsList()
export const getDashboardMetrics = () => dataStore.getDashboardMetrics()
export const getChannelMetrics = () => dataStore.getChannelMetrics()
export const getIntegrationStatuses = () => dataStore.getAllIntegrationStatuses()
export const getCampaigns = () => dataStore.getCampaigns()
export const getAds = () => dataStore.getAds()
export const getAutomations = () => dataStore.getAutomations()
export const getAudienceSegments = () => dataStore.getAudienceSegments()
export const getContacts = (limit?: number) => dataStore.getContacts(limit)
export const getAIInsights = () => dataStore.getAIInsights()
export const getAnalyticsData = (dateRange?: string) => dataStore.getAnalyticsData(dateRange)
export const connectPlatform = (provider: string, code: string, metadata?: any) => dataStore.connectIntegration(provider, code, metadata)
export const disconnectPlatform = (provider: string) => dataStore.disconnectIntegration(provider)
export const generateOAuthState = (provider: string, userId?: string) => dataStore.generateOAuthState(provider, userId)
export const validateOAuthState = (state: string) => dataStore.validateOAuthState(state)
export const storeCredentials = (provider: string, credentials: Record<string, any>) => dataStore.storeCredentials(provider, credentials)
export const getCredentials = (provider: string) => dataStore.getCredentials(provider)

export default dataStore
