// OWNLAY User-Scoped Data Service
// Provides per-user/per-workspace data isolation for integrations and real-time data
// This is the CLIENT-SIDE integration management that stores data in localStorage per workspace

import { platformConfigs } from './dataService'

// ============================================
// TYPES
// ============================================

export interface UserIntegration {
    provider: string
    status: 'connected' | 'not_connected' | 'syncing' | 'error'
    connectedAt?: string
    lastSync?: string
    accountId?: string
    accountName?: string
    health?: 'healthy' | 'delayed' | 'error'
    metrics?: {
        campaigns?: number
        adGroups?: number
        ads?: number
        events?: number
    }
}

export interface WorkspaceData {
    integrations: Record<string, UserIntegration>
    lastUpdated: string
}

// ============================================
// CLIENT-SIDE USER DATA SERVICE
// ============================================

const USER_INTEGRATIONS_KEY = 'ownlay_user_integrations'
const WORKSPACE_DATA_KEY = 'ownlay_workspace_data'

// Get current user's workspace ID from stored user data
export function getCurrentWorkspaceId(): string | null {
    try {
        const userData = localStorage.getItem('ownlay_user')
        if (userData) {
            const user = JSON.parse(userData)
            return user.workspace_id || null
        }
    } catch (e) {
        console.error('Failed to get workspace ID:', e)
    }
    return null
}

// Get user-scoped storage key
function getStorageKey(baseKey: string): string {
    const workspaceId = getCurrentWorkspaceId()
    return workspaceId ? `${baseKey}_${workspaceId}` : baseKey
}

// Initialize workspace data if not exists
export function initWorkspaceData(): WorkspaceData {
    const key = getStorageKey(WORKSPACE_DATA_KEY)
    try {
        const existing = localStorage.getItem(key)
        if (existing) {
            return JSON.parse(existing)
        }
    } catch (e) {
        console.error('Failed to parse workspace data:', e)
    }
    
    const initial: WorkspaceData = {
        integrations: {},
        lastUpdated: new Date().toISOString()
    }
    localStorage.setItem(key, JSON.stringify(initial))
    return initial
}

// Get all user integrations
export function getUserIntegrations(): Record<string, UserIntegration> {
    const key = getStorageKey(USER_INTEGRATIONS_KEY)
    try {
        const data = localStorage.getItem(key)
        return data ? JSON.parse(data) : {}
    } catch (e) {
        console.error('Failed to get user integrations:', e)
        return {}
    }
}

// Set user integrations
export function setUserIntegrations(integrations: Record<string, UserIntegration>): void {
    const key = getStorageKey(USER_INTEGRATIONS_KEY)
    localStorage.setItem(key, JSON.stringify(integrations))
}

// Check if user has any connected integrations
export function hasUserConnectedPlatforms(): boolean {
    const integrations = getUserIntegrations()
    return Object.values(integrations).some(i => i.status === 'connected')
}

// Get connected platform names for current user
export function getUserConnectedPlatformNames(): string[] {
    const integrations = getUserIntegrations()
    return Object.entries(integrations)
        .filter(([_, v]) => v.status === 'connected')
        .map(([k, _]) => k)
}

// Get connected platform count
export function getUserConnectedPlatformsCount(): number {
    return getUserConnectedPlatformNames().length
}

// Connect a platform for current user
export function connectUserPlatform(provider: string, accountData?: {
    accountId?: string
    accountName?: string
}): UserIntegration {
    const integrations = getUserIntegrations()
    const now = new Date().toISOString()
    
    const integration: UserIntegration = {
        provider,
        status: 'connected',
        connectedAt: now,
        lastSync: now,
        accountId: accountData?.accountId || generateAccountId(provider),
        accountName: accountData?.accountName || generateAccountName(provider),
        health: 'healthy',
        metrics: generateInitialMetrics(provider)
    }
    
    integrations[provider] = integration
    setUserIntegrations(integrations)
    
    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('integrationConnected', { detail: { provider, integration } }))
    
    return integration
}

// Disconnect a platform for current user
export function disconnectUserPlatform(provider: string): boolean {
    const integrations = getUserIntegrations()
    if (integrations[provider]) {
        delete integrations[provider]
        setUserIntegrations(integrations)
        
        // Dispatch event for UI updates
        window.dispatchEvent(new CustomEvent('integrationDisconnected', { detail: { provider } }))
        return true
    }
    return false
}

// Update sync status
export function updateSyncStatus(provider: string, status: 'syncing' | 'connected' | 'error', metrics?: any): void {
    const integrations = getUserIntegrations()
    if (integrations[provider]) {
        integrations[provider].status = status
        integrations[provider].lastSync = new Date().toISOString()
        if (metrics) {
            integrations[provider].metrics = { ...integrations[provider].metrics, ...metrics }
        }
        if (status === 'connected') {
            integrations[provider].health = 'healthy'
        } else if (status === 'error') {
            integrations[provider].health = 'error'
        }
        setUserIntegrations(integrations)
        
        // Dispatch event for real-time UI updates
        window.dispatchEvent(new CustomEvent('integrationSyncUpdate', { detail: { provider, integration: integrations[provider] } }))
    }
}

// Get single integration status
export function getUserIntegration(provider: string): UserIntegration | null {
    const integrations = getUserIntegrations()
    return integrations[provider] || null
}

// Get full integration status with platform config
export function getFullIntegrationStatus(provider: string): {
    config: typeof platformConfigs[string]
    status: UserIntegration | null
    isConnected: boolean
} {
    const config = platformConfigs[provider]
    const status = getUserIntegration(provider)
    return {
        config,
        status,
        isConnected: status?.status === 'connected'
    }
}

// Get all integrations with configs
export function getAllIntegrationsWithStatus(): Array<{
    provider: string
    config: typeof platformConfigs[string]
    status: UserIntegration | null
    isConnected: boolean
}> {
    const userIntegrations = getUserIntegrations()
    return Object.keys(platformConfigs).map(provider => ({
        provider,
        config: platformConfigs[provider],
        status: userIntegrations[provider] || null,
        isConnected: userIntegrations[provider]?.status === 'connected' || false
    }))
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateAccountId(provider: string): string {
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

function generateAccountName(provider: string): string {
    const user = JSON.parse(localStorage.getItem('ownlay_user') || '{}')
    const company = user.company || 'My Company'
    const names: Record<string, string> = {
        google_ads: `${company} - Google Ads`,
        meta_ads: `${company} Business Account`,
        tiktok_ads: `${company} TikTok`,
        linkedin_ads: `${company} Ads`,
        shopify: company.toLowerCase().replace(/\s+/g, '-') + '-store',
        stripe: company,
        ga4: `${company} - GA4 Property`,
        mailchimp: `${company} Marketing List`,
        hubspot: `${company} CRM`
    }
    return names[provider] || `${provider} Account`
}

function generateInitialMetrics(provider: string): UserIntegration['metrics'] {
    const config = platformConfigs[provider]
    if (!config) return undefined
    
    if (config.category === 'advertising') {
        return {
            campaigns: Math.floor(Math.random() * 10) + 5,
            adGroups: Math.floor(Math.random() * 30) + 15,
            ads: Math.floor(Math.random() * 100) + 50,
            events: Math.floor(Math.random() * 1000000) + 500000
        }
    } else if (config.category === 'ecommerce') {
        return {
            events: Math.floor(Math.random() * 50000) + 10000
        }
    } else if (config.category === 'analytics') {
        return {
            events: Math.floor(Math.random() * 5000000) + 1000000
        }
    }
    return undefined
}

// Format time ago helper
export function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diff < 60) return 'Just now'
    if (diff < 3600) return Math.floor(diff / 60) + ' min ago'
    if (diff < 86400) return Math.floor(diff / 3600) + ' hours ago'
    return Math.floor(diff / 86400) + ' days ago'
}

// ============================================
// REAL-TIME DATA SIMULATION
// ============================================

// Start real-time sync simulation for connected platforms
export function startRealtimeSync(callback?: (provider: string, data: any) => void): () => void {
    const connectedPlatforms = getUserConnectedPlatformNames()
    if (connectedPlatforms.length === 0) return () => {}
    
    const intervals: number[] = []
    
    connectedPlatforms.forEach(provider => {
        // Random interval between 5-15 seconds for simulated updates
        const interval = window.setInterval(() => {
            const integrations = getUserIntegrations()
            if (integrations[provider] && integrations[provider].status === 'connected') {
                // Simulate small metric updates
                const metrics = integrations[provider].metrics || {}
                metrics.events = (metrics.events || 0) + Math.floor(Math.random() * 100)
                
                integrations[provider].lastSync = new Date().toISOString()
                integrations[provider].metrics = metrics
                setUserIntegrations(integrations)
                
                if (callback) {
                    callback(provider, integrations[provider])
                }
                
                window.dispatchEvent(new CustomEvent('integrationRealtimeUpdate', { 
                    detail: { provider, integration: integrations[provider] } 
                }))
            }
        }, Math.floor(Math.random() * 10000) + 5000)
        
        intervals.push(interval)
    })
    
    // Return cleanup function
    return () => {
        intervals.forEach(id => clearInterval(id))
    }
}

// Export as default module
export default {
    getCurrentWorkspaceId,
    initWorkspaceData,
    getUserIntegrations,
    setUserIntegrations,
    hasUserConnectedPlatforms,
    getUserConnectedPlatformNames,
    getUserConnectedPlatformsCount,
    connectUserPlatform,
    disconnectUserPlatform,
    updateSyncStatus,
    getUserIntegration,
    getFullIntegrationStatus,
    getAllIntegrationsWithStatus,
    formatTimeAgo,
    startRealtimeSync
}
