// OWNLAY Platform Integration Service
// Handles OAuth connections and data fetching from external platforms
// Uses simulation for demo, but structured for real OAuth implementation

export interface OAuthConfig {
    provider: string
    name: string
    icon: string
    iconBg: string
    iconColor: string
    scopes: string[]
    authUrl: string
    tokenUrl: string
    clientId?: string
    redirectUri?: string
}

export interface ConnectedAccount {
    id: string
    provider: string
    accountId: string
    accountName: string
    email?: string
    status: 'connected' | 'disconnected' | 'expired' | 'syncing' | 'error'
    connectedAt: string
    lastSync: string | null
    syncStatus: 'healthy' | 'delayed' | 'error' | null
    permissions: string[]
    metadata?: Record<string, any>
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

export interface SyncJob {
    id: string
    provider: string
    status: 'pending' | 'running' | 'completed' | 'failed'
    startedAt: string
    completedAt?: string
    recordsProcessed: number
    errors: string[]
}

// OAuth configurations for each platform
export const oauthConfigs: Record<string, OAuthConfig> = {
    google_ads: {
        provider: 'google_ads',
        name: 'Google Ads',
        icon: 'fab fa-google',
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-500',
        scopes: ['https://www.googleapis.com/auth/adwords', 'https://www.googleapis.com/auth/userinfo.email'],
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token'
    },
    meta_ads: {
        provider: 'meta_ads',
        name: 'Meta Ads',
        icon: 'fab fa-meta',
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-600',
        scopes: ['ads_read', 'ads_management', 'business_management', 'pages_read_engagement'],
        authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
        tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token'
    },
    tiktok_ads: {
        provider: 'tiktok_ads',
        name: 'TikTok Ads',
        icon: 'fab fa-tiktok',
        iconBg: 'bg-gray-900',
        iconColor: 'text-white',
        scopes: ['advertiser.read', 'campaign.read', 'report.read'],
        authUrl: 'https://ads.tiktok.com/marketing_api/auth',
        tokenUrl: 'https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/'
    },
    linkedin_ads: {
        provider: 'linkedin_ads',
        name: 'LinkedIn Ads',
        icon: 'fab fa-linkedin',
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-700',
        scopes: ['r_ads', 'r_ads_reporting', 'rw_ads'],
        authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
        tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken'
    },
    shopify: {
        provider: 'shopify',
        name: 'Shopify',
        icon: 'fab fa-shopify',
        iconBg: 'bg-green-50',
        iconColor: 'text-green-600',
        scopes: ['read_orders', 'read_products', 'read_customers', 'read_analytics'],
        authUrl: '{shop}.myshopify.com/admin/oauth/authorize',
        tokenUrl: '{shop}.myshopify.com/admin/oauth/access_token'
    },
    stripe: {
        provider: 'stripe',
        name: 'Stripe',
        icon: 'fab fa-stripe',
        iconBg: 'bg-purple-50',
        iconColor: 'text-purple-600',
        scopes: ['read_only'],
        authUrl: 'https://connect.stripe.com/oauth/authorize',
        tokenUrl: 'https://connect.stripe.com/oauth/token'
    },
    ga4: {
        provider: 'ga4',
        name: 'Google Analytics 4',
        icon: 'fas fa-chart-simple',
        iconBg: 'bg-orange-50',
        iconColor: 'text-orange-500',
        scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token'
    },
    mailchimp: {
        provider: 'mailchimp',
        name: 'Mailchimp',
        icon: 'fab fa-mailchimp',
        iconBg: 'bg-yellow-50',
        iconColor: 'text-yellow-600',
        scopes: [],
        authUrl: 'https://login.mailchimp.com/oauth2/authorize',
        tokenUrl: 'https://login.mailchimp.com/oauth2/token'
    },
    hubspot: {
        provider: 'hubspot',
        name: 'HubSpot',
        icon: 'fab fa-hubspot',
        iconBg: 'bg-orange-50',
        iconColor: 'text-orange-600',
        scopes: ['crm.objects.contacts.read', 'crm.objects.deals.read', 'marketing-email'],
        authUrl: 'https://app.hubspot.com/oauth/authorize',
        tokenUrl: 'https://api.hubapi.com/oauth/v1/token'
    }
}

// In-memory storage for demo (would be database in production)
class IntegrationStore {
    private accounts: Map<string, ConnectedAccount> = new Map()
    private metrics: Map<string, PlatformMetrics> = new Map()
    private syncJobs: Map<string, SyncJob[]> = new Map()
    private oauthStates: Map<string, { provider: string; timestamp: number }> = new Map()

    // Generate OAuth state token
    generateState(provider: string): string {
        const state = `ownlay_${provider}_${Date.now()}_${Math.random().toString(36).substring(7)}`
        this.oauthStates.set(state, { provider, timestamp: Date.now() })
        return state
    }

    // Validate OAuth state
    validateState(state: string): string | null {
        const data = this.oauthStates.get(state)
        if (!data) return null
        
        // State expires after 10 minutes
        if (Date.now() - data.timestamp > 600000) {
            this.oauthStates.delete(state)
            return null
        }
        
        this.oauthStates.delete(state)
        return data.provider
    }

    // Connect an account
    async connectAccount(provider: string, authCode: string, metadata?: Record<string, any>): Promise<ConnectedAccount> {
        const config = oauthConfigs[provider]
        if (!config) throw new Error(`Unknown provider: ${provider}`)

        // Simulate token exchange
        const accountId = `${provider}_${Date.now()}`
        const account: ConnectedAccount = {
            id: accountId,
            provider,
            accountId: this.generateAccountId(provider),
            accountName: this.generateAccountName(provider),
            email: `user@${provider.replace('_', '')}.com`,
            status: 'connected',
            connectedAt: new Date().toISOString(),
            lastSync: null,
            syncStatus: null,
            permissions: config.scopes,
            metadata
        }

        this.accounts.set(accountId, account)
        
        // Trigger initial sync
        await this.syncPlatformData(provider)
        
        return account
    }

    // Disconnect an account
    disconnectAccount(accountId: string): boolean {
        const account = this.accounts.get(accountId)
        if (!account) return false
        
        account.status = 'disconnected'
        this.accounts.delete(accountId)
        this.metrics.delete(account.provider)
        return true
    }

    // Get connected accounts
    getConnectedAccounts(): ConnectedAccount[] {
        return Array.from(this.accounts.values())
    }

    // Get account by provider
    getAccountByProvider(provider: string): ConnectedAccount | undefined {
        return Array.from(this.accounts.values()).find(a => a.provider === provider)
    }

    // Check if provider is connected
    isProviderConnected(provider: string): boolean {
        return Array.from(this.accounts.values()).some(a => a.provider === provider && a.status === 'connected')
    }

    // Get all integration statuses
    getIntegrationStatuses(): Array<{
        provider: string
        name: string
        icon: string
        status: string
        connected_at?: string
        last_sync?: string
        health?: string
        account_id?: string
    }> {
        return Object.keys(oauthConfigs).map(provider => {
            const config = oauthConfigs[provider]
            const account = this.getAccountByProvider(provider)
            
            if (account && account.status === 'connected') {
                return {
                    provider,
                    name: config.name,
                    icon: config.icon,
                    status: 'connected',
                    connected_at: account.connectedAt,
                    last_sync: account.lastSync,
                    health: account.syncStatus || 'healthy',
                    account_id: account.accountId
                }
            }
            
            return {
                provider,
                name: config.name,
                icon: config.icon,
                status: 'not_connected'
            }
        })
    }

    // Sync data from platform
    async syncPlatformData(provider: string): Promise<PlatformMetrics | null> {
        const account = this.getAccountByProvider(provider)
        if (!account) return null

        // Simulate sync delay
        account.status = 'syncing'
        
        // Generate realistic metrics based on platform
        const metrics = this.generatePlatformMetrics(provider)
        this.metrics.set(provider, metrics)
        
        // Update account
        account.lastSync = new Date().toISOString()
        account.status = 'connected'
        account.syncStatus = 'healthy'
        
        return metrics
    }

    // Get metrics for a platform
    getMetrics(provider: string): PlatformMetrics | null {
        return this.metrics.get(provider) || null
    }

    // Get all connected metrics
    getAllConnectedMetrics(): PlatformMetrics[] {
        return Array.from(this.metrics.values())
    }

    // Get aggregated dashboard metrics
    getDashboardMetrics(): {
        totalSpend: number
        totalRevenue: number
        conversions: number
        roas: number
        avgCpa: number
        impressions: number
        clicks: number
        isLive: boolean
        connectedPlatforms: string[]
    } {
        const connectedMetrics = this.getAllConnectedMetrics()
        
        if (connectedMetrics.length === 0) {
            // Return static sample data
            return {
                totalSpend: 124563,
                totalRevenue: 523400,
                conversions: 3847,
                roas: 4.2,
                avgCpa: 32.38,
                impressions: 2450000,
                clicks: 89000,
                isLive: false,
                connectedPlatforms: []
            }
        }

        const totals = connectedMetrics.reduce((acc, m) => ({
            spend: acc.spend + m.spend,
            revenue: acc.revenue + m.revenue,
            conversions: acc.conversions + m.conversions,
            impressions: acc.impressions + m.impressions,
            clicks: acc.clicks + m.clicks
        }), { spend: 0, revenue: 0, conversions: 0, impressions: 0, clicks: 0 })

        return {
            totalSpend: Math.round(totals.spend),
            totalRevenue: Math.round(totals.revenue),
            conversions: totals.conversions,
            roas: Math.round((totals.revenue / totals.spend) * 10) / 10,
            avgCpa: Math.round((totals.spend / totals.conversions) * 100) / 100,
            impressions: totals.impressions,
            clicks: totals.clicks,
            isLive: true,
            connectedPlatforms: connectedMetrics.map(m => m.provider)
        }
    }

    // Helper: Generate account ID based on provider
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

    // Helper: Generate account name
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

    // Helper: Generate realistic metrics for platform
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
}

// Singleton instance
export const integrationStore = new IntegrationStore()

// Export helper functions
export const hasConnectedPlatforms = () => integrationStore.getConnectedAccounts().length > 0
export const getConnectedPlatforms = () => integrationStore.getConnectedAccounts().map(a => a.provider)
export const getDashboardMetrics = () => integrationStore.getDashboardMetrics()
export const getIntegrationStatuses = () => integrationStore.getIntegrationStatuses()
