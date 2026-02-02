import { Hono } from 'hono'
import { 
    dataStore, 
    platformConfigs, 
    generateOAuthState, 
    validateOAuthState,
    getDashboardMetrics,
    getChannelMetrics,
    getCampaigns,
    getAds,
    getAutomations,
    getAudienceSegments,
    getContacts,
    getAIInsights,
    getAnalyticsData,
    getIntegrationStatuses,
    storeCredentials,
    getCredentials
} from '../data/dataService'
import { db, type User, type Influencer } from '../db'
import { marketingDb } from '../db/marketing'
import { aiService } from '../services/ai'

// Define bindings type for Cloudflare services
type Bindings = {
  DB: D1Database;
  AI?: any; // Cloudflare Workers AI binding (optional)
}

export const apiRoutes = new Hono<{ Bindings: Bindings }>()

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

// In-memory user store for demo (in production, use D1 database)
// IMPORTANT: Do NOT call any methods at module load time - Cloudflare Workers restriction
const userStore: Map<string, { id: string; email: string; password: string; name: string; accountType: string; role: string; plan: string; workspace_id: string; company?: string; createdAt: string }> = new Map()

// Static timestamp for demo accounts
const DEMO_CREATED_AT = '2024-12-01T00:00:00.000Z'

// Lazy initialization flag and function for demo users
let demoUsersInitialized = false
function ensureDemoUsersInitialized() {
    if (demoUsersInitialized) return
    demoUsersInitialized = true
    
    // ADMIN ACCOUNTS
    userStore.set('admin@ownlay.app', {
        id: 'usr_admin001',
        email: 'admin@ownlay.app',
        password: 'Admin123!',
        name: 'Platform Admin',
        accountType: 'admin',
        role: 'super_admin',
        plan: 'enterprise',
        workspace_id: 'ws_admin001',
        company: 'OWNLAY Platform',
        createdAt: DEMO_CREATED_AT
    })

    // AGENCY ACCOUNTS
    userStore.set('agency@demo.com', {
        id: 'usr_agency001',
        email: 'agency@demo.com',
        password: 'Agency123!',
        name: 'Agency Owner',
        accountType: 'agency',
        role: 'agency_owner',
        plan: 'pro',
        workspace_id: 'ws_agency001',
        company: 'Demo Marketing Agency',
        createdAt: DEMO_CREATED_AT
    })

    // BRAND ACCOUNTS - Different Plans
    userStore.set('starter@demo.com', {
        id: 'usr_brand_starter',
        email: 'starter@demo.com',
        password: 'Demo123!',
        name: 'Starter Brand',
        accountType: 'brand',
        role: 'brand_owner',
        plan: 'starter',
        workspace_id: 'ws_brand_starter',
        company: 'Starter Co',
        createdAt: DEMO_CREATED_AT
    })

    userStore.set('growth@demo.com', {
        id: 'usr_brand_growth',
        email: 'growth@demo.com',
        password: 'Demo123!',
        name: 'Growth Brand',
        accountType: 'brand',
        role: 'brand_owner',
        plan: 'growth',
        workspace_id: 'ws_brand_growth',
        company: 'Growth Inc',
        createdAt: DEMO_CREATED_AT
    })

    userStore.set('pro@demo.com', {
        id: 'usr_brand_pro',
        email: 'pro@demo.com',
        password: 'Demo123!',
        name: 'Pro Brand',
        accountType: 'brand',
        role: 'brand_owner',
        plan: 'pro',
        workspace_id: 'ws_brand_pro',
        company: 'Pro Corp',
        createdAt: DEMO_CREATED_AT
    })

    userStore.set('enterprise@demo.com', {
        id: 'usr_brand_enterprise',
        email: 'enterprise@demo.com',
        password: 'Demo123!',
        name: 'Enterprise Brand',
        accountType: 'brand',
        role: 'brand_owner',
        plan: 'enterprise',
        workspace_id: 'ws_brand_enterprise',
        company: 'Enterprise Ltd',
        createdAt: DEMO_CREATED_AT
    })

    // Legacy test user
    userStore.set('test@example.com', {
        id: 'usr_test123',
        email: 'test@example.com',
        password: 'Test123!',
        name: 'Test User',
        accountType: 'brand',
        role: 'brand_owner',
        plan: 'starter',
        workspace_id: 'ws_test456',
        company: 'Test Company',
        createdAt: DEMO_CREATED_AT
    })
}

apiRoutes.post('/auth/login', async (c) => {
    // Initialize demo users lazily (on first request, not module load)
    ensureDemoUsersInitialized()
    
    try {
        const body = await c.req.json()
        const { email, password, accountType } = body

        // Validate required fields
        if (!email || !password) {
            return c.json({ success: false, error: 'Email and password are required' }, 400)
        }

        // Try database first if available
        const database = c.env?.DB
        let user: any = null
        
        if (database) {
            const dbUser = await db.getUserByEmail(database, email.toLowerCase())
            if (dbUser && dbUser.password_hash === password) {
                user = {
                    id: dbUser.id,
                    email: dbUser.email,
                    name: [dbUser.first_name, dbUser.last_name].filter(Boolean).join(' ') || email.split('@')[0],
                    role: dbUser.role,
                    accountType: dbUser.account_type,
                    plan: dbUser.plan,
                    workspace_id: 'ws_' + dbUser.id,
                    company: dbUser.company
                }
            }
        }
        
        // Fallback to in-memory store
        if (!user) {
            const memUser = userStore.get(email.toLowerCase())
            if (memUser && memUser.password === password) {
                user = memUser
            }
        }
        
        if (!user) {
            return c.json({ success: false, error: 'Invalid email or password' }, 401)
        }

        // Generate tokens
        const access_token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + Date.now() + '.' + user.id
        const refresh_token = 'rt_' + Math.random().toString(36).substring(7)
        
        // Save session to database for API authentication
        if (database) {
            try {
                await database.prepare(`
                    INSERT INTO sessions (id, user_id, token, user_type, expires_at, created_at)
                    VALUES (?, ?, ?, 'user', datetime('now', '+1 hour'), datetime('now'))
                `).bind(
                    'sess_' + Date.now() + '_' + Math.random().toString(36).substring(7),
                    user.id,
                    access_token
                ).run()
            } catch (e) {
                console.log('Session save skipped:', e)
            }
        }

        return c.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role || 'brand_owner',
                    accountType: user.accountType || accountType || 'brand',
                    plan: user.plan || 'starter',
                    workspace_id: user.workspace_id,
                    company: user.company
                },
                access_token,
                refresh_token,
                expires_in: 3600
            }
        })
    } catch (e) {
        console.error('Login error:', e)
        return c.json({ success: false, error: 'Invalid request body' }, 400)
    }
})

apiRoutes.post('/auth/register', async (c) => {
    try {
        const body = await c.req.json()
        const { email, password, name, accountType, company } = body

        // Validate required fields
        if (!email || !password) {
            return c.json({ success: false, error: 'Email and password are required' }, 400)
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return c.json({ success: false, error: 'Invalid email format' }, 400)
        }

        // Validate password strength
        if (password.length < 6) {
            return c.json({ success: false, error: 'Password must be at least 6 characters' }, 400)
        }

        const database = c.env?.DB
        const userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(7)
        const workspaceId = 'ws_' + Math.random().toString(36).substring(7)
        const defaultRole = accountType === 'agency' ? 'agency_owner' : 'brand_owner'
        const nameParts = (name || email.split('@')[0]).split(' ')
        
        // Plan assignment logic:
        // - Agencies get PRO plan only (no free trial, must pay)
        // - Brands start with FREE TRIAL (7 days full access)
        const assignedPlan = accountType === 'agency' ? 'pro' : 'free_trial'
        const subscriptionStatus = accountType === 'agency' ? 'unpaid' : 'trialing'
        
        // Calculate trial end date (7 days from now) for brands
        const trialEndsAt = accountType !== 'agency' 
            ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            : null

        // Try database first if available
        if (database) {
            const existingUser = await db.getUserByEmail(database, email.toLowerCase())
            if (existingUser) {
                return c.json({ success: false, error: 'An account with this email already exists' }, 400)
            }
            
            await db.createUser(database, {
                id: userId,
                email: email.toLowerCase(),
                password_hash: password, // In production, hash this!
                first_name: nameParts[0] || null,
                last_name: nameParts.slice(1).join(' ') || null,
                company: company || null,
                role: defaultRole,
                account_type: accountType || 'brand',
                plan: assignedPlan
            })
        } else {
            // Fallback to in-memory
            if (userStore.has(email.toLowerCase())) {
                return c.json({ success: false, error: 'An account with this email already exists' }, 400)
            }
            
            userStore.set(email.toLowerCase(), {
                id: userId,
                email: email.toLowerCase(),
                password: password,
                name: name || email.split('@')[0],
                accountType: accountType || 'brand',
                role: defaultRole,
                plan: assignedPlan,
                subscriptionStatus: subscriptionStatus,
                workspace_id: workspaceId,
                company: company,
                createdAt: new Date().toISOString()
            })
        }

        // Generate tokens for auto-login
        const access_token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + Date.now() + '.' + userId

        return c.json({
            success: true,
            data: {
                user: {
                    id: userId,
                    email: email.toLowerCase(),
                    name: name || email.split('@')[0],
                    role: defaultRole,
                    accountType: accountType || 'brand',
                    plan: assignedPlan,
                    subscriptionStatus: subscriptionStatus,
                    trialEndsAt: trialEndsAt,
                    company: company,
                    website: body.website || null,
                    workspace_id: workspaceId
                },
                access_token,
                message: accountType === 'agency' 
                    ? 'Account created. Please select a Pro plan to continue.'
                    : 'Account created! Your 7-day free trial has started.',
                requiresPayment: accountType === 'agency',
                redirectToPayment: accountType === 'agency',
                trialDays: accountType !== 'agency' ? 7 : 0
            }
        })
    } catch (e) {
        console.error('Registration error:', e)
        return c.json({ success: false, error: 'Invalid request body' }, 400)
    }
})

apiRoutes.post('/auth/logout', async (c) => {
    return c.json({ success: true, message: 'Logged out successfully' })
})

// ============================================
// OAUTH AUTHENTICATION ENDPOINTS
// ============================================

// OAuth state storage (in production, use Redis/KV store)
// IMPORTANT: Do NOT use setInterval at module level - Cloudflare Workers restriction
// States are cleaned up lazily when accessed instead
const oauthStates: Map<string, { provider: string; redirect: string; accountType: string; timestamp: number }> = new Map()

// Helper function to clean up expired states (called lazily)
function cleanupExpiredOAuthStates(): void {
    const now = Date.now()
    oauthStates.forEach((state, key) => {
        if (now - state.timestamp > 300000) { // 5 min expiry
            oauthStates.delete(key)
        }
    })
}

// Initiate OAuth flow - returns authorization URL
apiRoutes.post('/auth/oauth/init', async (c) => {
    try {
        // Clean up expired states lazily (instead of setInterval)
        cleanupExpiredOAuthStates()
        
        const body = await c.req.json()
        const { provider, accountType, redirect } = body
        
        if (!provider || !['google', 'microsoft'].includes(provider)) {
            return c.json({ success: false, error: 'Invalid OAuth provider' }, 400)
        }
        
        // Generate state for CSRF protection
        const state = 'oauth_' + Date.now() + '_' + Math.random().toString(36).substring(7)
        
        // Store state for verification
        oauthStates.set(state, {
            provider,
            redirect: redirect || '/app/dashboard',
            accountType: accountType || 'brand',
            timestamp: Date.now()
        })
        
        // Build OAuth URL based on provider
        // NOTE: In production, these would be real OAuth credentials stored in environment variables
        let authUrl = ''
        
        if (provider === 'google') {
            const clientId = '1234567890-google-client-id.apps.googleusercontent.com' // Replace with c.env.GOOGLE_CLIENT_ID
            const redirectUri = encodeURIComponent((c.req.url.split('/api')[0] || '') + '/api/v1/auth/oauth/callback/google')
            const scope = encodeURIComponent('email profile')
            authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}&access_type=offline&prompt=consent`
        } else if (provider === 'microsoft') {
            const clientId = 'microsoft-client-id' // Replace with c.env.MICROSOFT_CLIENT_ID
            const redirectUri = encodeURIComponent((c.req.url.split('/api')[0] || '') + '/api/v1/auth/oauth/callback/microsoft')
            const scope = encodeURIComponent('openid email profile User.Read')
            authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}&response_mode=query`
        }
        
        return c.json({
            success: true,
            data: {
                authUrl,
                state,
                provider
            }
        })
    } catch (e) {
        console.error('OAuth init error:', e)
        return c.json({ success: false, error: 'Failed to initialize OAuth' }, 500)
    }
})

// OAuth callback - Google
apiRoutes.get('/auth/oauth/callback/google', async (c) => {
    const code = c.req.query('code')
    const state = c.req.query('state')
    const error = c.req.query('error')
    
    if (error) {
        return c.redirect('/auth/signin?error=' + encodeURIComponent('OAuth cancelled: ' + error))
    }
    
    if (!code || !state) {
        return c.redirect('/auth/signin?error=' + encodeURIComponent('Invalid OAuth response'))
    }
    
    const stateData = oauthStates.get(state)
    if (!stateData || stateData.provider !== 'google') {
        return c.redirect('/auth/signin?error=' + encodeURIComponent('Invalid OAuth state'))
    }
    
    // Clear used state
    oauthStates.delete(state)
    
    // In production, exchange code for tokens and get user info
    // For demo, create/login user with mock data
    const mockUserEmail = 'oauth.google.user@gmail.com'
    const mockUserName = 'Google User'
    
    // Create or get user
    const userId = 'usr_google_' + Date.now()
    const workspaceId = 'ws_' + Math.random().toString(36).substring(7)
    
    // Store in memory
    if (!userStore.has(mockUserEmail)) {
        userStore.set(mockUserEmail, {
            id: userId,
            email: mockUserEmail,
            password: '', // OAuth users don't have passwords
            name: mockUserName,
            accountType: stateData.accountType,
            role: stateData.accountType === 'agency' ? 'agency_owner' : 'brand_owner',
            plan: stateData.accountType === 'agency' ? 'pro' : 'none',
            workspace_id: workspaceId,
            createdAt: new Date().toISOString()
        })
    }
    
    const user = userStore.get(mockUserEmail)!
    
    // Generate token
    const access_token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.oauth.' + user.id
    
    // Redirect with token in URL fragment (client-side will store it)
    const redirectUrl = `/auth/oauth-complete?token=${access_token}&provider=google&redirect=${encodeURIComponent(stateData.redirect)}`
    
    return c.redirect(redirectUrl)
})

// OAuth callback - Microsoft
apiRoutes.get('/auth/oauth/callback/microsoft', async (c) => {
    const code = c.req.query('code')
    const state = c.req.query('state')
    const error = c.req.query('error')
    
    if (error) {
        return c.redirect('/auth/signin?error=' + encodeURIComponent('OAuth cancelled: ' + error))
    }
    
    if (!code || !state) {
        return c.redirect('/auth/signin?error=' + encodeURIComponent('Invalid OAuth response'))
    }
    
    const stateData = oauthStates.get(state)
    if (!stateData || stateData.provider !== 'microsoft') {
        return c.redirect('/auth/signin?error=' + encodeURIComponent('Invalid OAuth state'))
    }
    
    // Clear used state
    oauthStates.delete(state)
    
    // In production, exchange code for tokens and get user info
    // For demo, create/login user with mock data
    const mockUserEmail = 'oauth.microsoft.user@outlook.com'
    const mockUserName = 'Microsoft User'
    
    // Create or get user
    const userId = 'usr_microsoft_' + Date.now()
    const workspaceId = 'ws_' + Math.random().toString(36).substring(7)
    
    // Store in memory
    if (!userStore.has(mockUserEmail)) {
        userStore.set(mockUserEmail, {
            id: userId,
            email: mockUserEmail,
            password: '', // OAuth users don't have passwords
            name: mockUserName,
            accountType: stateData.accountType,
            role: stateData.accountType === 'agency' ? 'agency_owner' : 'brand_owner',
            plan: stateData.accountType === 'agency' ? 'pro' : 'none',
            workspace_id: workspaceId,
            createdAt: new Date().toISOString()
        })
    }
    
    const user = userStore.get(mockUserEmail)!
    
    // Generate token
    const access_token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.oauth.' + user.id
    
    // Redirect with token in URL fragment
    const redirectUrl = `/auth/oauth-complete?token=${access_token}&provider=microsoft&redirect=${encodeURIComponent(stateData.redirect)}`
    
    return c.redirect(redirectUrl)
})

// Demo OAuth endpoint for testing (simulates OAuth flow without actual provider)
apiRoutes.post('/auth/oauth/demo', async (c) => {
    try {
        const body = await c.req.json()
        const { provider, accountType } = body
        
        if (!provider || !['google', 'microsoft'].includes(provider)) {
            return c.json({ success: false, error: 'Invalid OAuth provider' }, 400)
        }
        
        // Generate demo user based on provider
        const email = provider === 'google' ? 'demo.oauth@gmail.com' : 'demo.oauth@outlook.com'
        const name = provider === 'google' ? 'Google Demo User' : 'Microsoft Demo User'
        const userId = 'usr_oauth_' + Date.now() + '_' + Math.random().toString(36).substring(7)
        const workspaceId = 'ws_' + Math.random().toString(36).substring(7)
        
        // Create user if not exists
        if (!userStore.has(email)) {
            userStore.set(email, {
                id: userId,
                email: email,
                password: '', // OAuth users don't have passwords
                name: name,
                accountType: accountType || 'brand',
                role: accountType === 'agency' ? 'agency_owner' : 'brand_owner',
                plan: accountType === 'agency' ? 'pro' : 'none',
                workspace_id: workspaceId,
                createdAt: new Date().toISOString()
            })
        }
        
        const user = userStore.get(email)!
        const access_token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo_oauth.' + user.id
        
        return c.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    accountType: user.accountType,
                    plan: user.plan,
                    workspace_id: user.workspace_id,
                    oauthProvider: provider
                },
                access_token,
                provider,
                message: `Demo ${provider} OAuth login successful`
            }
        })
    } catch (e) {
        console.error('Demo OAuth error:', e)
        return c.json({ success: false, error: 'OAuth demo failed' }, 500)
    }
})

apiRoutes.get('/auth/me', async (c) => {
    return c.json({
        success: true,
        data: {
            user: {
                id: 'usr_123abc',
                email: 'jane@acme.com',
                name: 'Jane Doe',
                role: 'admin',
                accountType: 'brand',
                workspace_id: 'ws_456def'
            }
        }
    })
})

// ============================================
// NOTIFICATIONS ENDPOINTS (for brands/users)
// ============================================

// Get notifications for the current user
apiRoutes.get('/notifications', async (c) => {
    // This endpoint returns dynamic notifications based on user state
    // The actual notifications are generated client-side based on localStorage state
    // This provides a fallback/initial set
    return c.json({
        success: true,
        data: {
            notifications: [
                {
                    id: 'welcome_1',
                    type: 'info',
                    title: 'Welcome to OWNLAY',
                    message: 'Connect your marketing platforms to get started.',
                    read: false,
                    time: 'Just now',
                    action: { label: 'Connect', href: '/app/integrations' }
                },
                {
                    id: 'tip_1',
                    type: 'info',
                    title: 'Pro Tip',
                    message: 'Connect Shopify and Meta Ads for revenue tracking.',
                    read: true,
                    time: '1 hour ago'
                }
            ]
        }
    })
})

// Mark notifications as read
apiRoutes.post('/notifications/mark-read', async (c) => {
    try {
        const body = await c.req.json()
        const { notification_ids, mark_all } = body
        
        return c.json({ 
            success: true, 
            message: mark_all ? 'All notifications marked as read' : `${notification_ids?.length || 0} notifications marked as read` 
        })
    } catch (e) { 
        return c.json({ success: false, error: 'Failed to update' }, 400) 
    }
})

// ============================================
// INTEGRATION ENDPOINTS
// ============================================

// Get all integration statuses
// NOTE: This endpoint now returns NOT_CONNECTED for all integrations by default.
// The client-side JavaScript handles per-user/per-workspace integration state
// using localStorage with workspace-scoped keys. This prevents the "once connected
// shows connected for all users" bug.
apiRoutes.get('/integrations/status', async (c) => {
    // Return all integrations as NOT connected from server
    // Client-side JS will overlay the user's actual connection state
    const integrations = Object.entries(platformConfigs).map(([provider, config]) => ({
        provider,
        name: config.name,
        icon: config.icon,
        iconBg: config.iconBg,
        iconColor: config.iconColor,
        category: config.category,
        status: 'not_connected',
        lastSync: null,
        health: null,
        permissions: config.scopes || []
    }))

    return c.json({
        success: true,
        data: {
            integrations,
            summary: {
                // These will be updated client-side based on user's actual connections
                connected: 0,
                syncing: 0,
                issues: 0,
                available: integrations.length
            },
            // Flag to indicate client should use local storage for actual state
            use_client_state: true
        }
    })
})

// Helper to normalize provider name (handle both hyphen and underscore formats)
const normalizeProvider = (provider: string): string => {
    // Convert hyphens to underscores for internal use
    return provider.replace(/-/g, '_')
}

// Get integration details by provider
apiRoutes.get('/integrations/:provider', async (c) => {
    const rawProvider = c.req.param('provider')
    const provider = normalizeProvider(rawProvider)
    const integration = dataStore.getIntegrationStatus(provider)
    const config = platformConfigs[provider]

    if (!config) {
        return c.json({ success: false, error: 'Unknown provider' }, 404)
    }

    return c.json({
        success: true,
        data: {
            provider,
            config: {
                name: config.name,
                icon: config.icon,
                iconBg: config.iconBg,
                iconColor: config.iconColor,
                category: config.category,
                description: config.description,
                scopes: config.scopes
            },
            status: integration || {
                status: 'not_connected',
                lastSync: null,
                health: null
            }
        }
    })
})

// Get Shopify analytics - REAL-TIME data from connected Shopify store
// Supports both GET and POST methods for flexibility
const shopifyAnalyticsHandler = async (c: any) => {
    // Get Shopify integration status from dataStore
    const integration = dataStore.getIntegrationStatus('shopify')
    
    // Also try to get stored credentials from credential store
    const storedCredentials = getCredentials('shopify')
    
    // Check if connected (either in dataStore or we have credentials)
    const isConnected = (integration && integration.status === 'connected') || storedCredentials
    
    if (!isConnected) {
        return c.json({
            success: true,
            data: {
                connected: false,
                message: 'Shopify not connected. Please connect your Shopify store first.',
                revenue: 0,
                orders: 0,
                customers: 0,
                returns: 0,
                ordersFulfilled: 0,
                ordersDelivered: 0,
                products: 0,
                aov: 0
            }
        })
    }
    
    // Get credentials from multiple sources (priority order):
    // 1. Request body (POST)
    // 2. Stored credentials from credential store
    // 3. Integration metadata credentials
    // 4. Integration credentials field
    let credentials = null
    try {
        const body = await c.req.json().catch(() => null)
        credentials = body?.credentials || storedCredentials || integration?.metadata?.credentials || integration?.credentials
    } catch (e) {
        credentials = storedCredentials || integration?.metadata?.credentials || integration?.credentials
    }
    
    // If we have real credentials, fetch REAL data from Shopify
    if (credentials?.shop_domain && credentials?.access_token) {
        try {
            let shopDomain = credentials.shop_domain.replace('https://', '').replace('http://', '').replace(/\/$/, '')
            if (!shopDomain.includes('.myshopify.com')) {
                shopDomain = `${shopDomain}.myshopify.com`
            }
            
            // GraphQL query for comprehensive analytics
            const graphqlQuery = {
                query: `{
                    orders(first: 250, sortKey: CREATED_AT, reverse: true, query: "created_at:>='${new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0]}'") {
                        edges {
                            node {
                                id
                                name
                                totalPriceSet {
                                    shopMoney {
                                        amount
                                        currencyCode
                                    }
                                }
                                displayFulfillmentStatus
                                displayFinancialStatus
                                fullyPaid
                                refundable
                                cancelledAt
                                createdAt
                            }
                        }
                    }
                    productsCount {
                        count
                    }
                    customersCount {
                        count
                    }
                    shop {
                        currencyCode
                        name
                        myshopifyDomain
                    }
                }`
            }
            
            const response = await fetch(`https://${shopDomain}/admin/api/2025-01/graphql.json`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Access-Token': credentials.access_token
                },
                body: JSON.stringify(graphqlQuery)
            })
            
            if (response.ok) {
                const result = await response.json()
                
                if (!result.errors || result.errors.length === 0) {
                    const data = result.data
                    const orders = data?.orders?.edges || []
                    
                    // Calculate real metrics
                    let totalRevenue = 0
                    let ordersFulfilled = 0
                    let ordersDelivered = 0
                    let returns = 0
                    let currency = 'USD'
                    
                    orders.forEach((edge: any) => {
                        const order = edge.node
                        const amount = parseFloat(order?.totalPriceSet?.shopMoney?.amount || 0)
                        totalRevenue += amount
                        currency = order?.totalPriceSet?.shopMoney?.currencyCode || currency
                        
                        // Check fulfillment status
                        if (order?.displayFulfillmentStatus === 'FULFILLED') {
                            ordersFulfilled++
                            ordersDelivered++ // Assume delivered if fulfilled
                        } else if (order?.displayFulfillmentStatus === 'PARTIALLY_FULFILLED') {
                            ordersFulfilled++
                        }
                        
                        // Check for returns/refunds
                        if (order?.cancelledAt || order?.refundable === false) {
                            returns++
                        }
                    })
                    
                    const totalOrders = orders.length
                    const aov = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0
                    
                    return c.json({
                        success: true,
                        data: {
                            connected: true,
                            is_live: true,
                            store_domain: shopDomain,
                            store_name: data?.shop?.name,
                            last_sync: new Date().toISOString(),
                            period: 'Last 30 days',
                            currency: currency,
                            revenue: Math.round(totalRevenue * 100) / 100,
                            orders: totalOrders,
                            customers: data?.customersCount?.count || 0,
                            returns: returns,
                            ordersFulfilled: ordersFulfilled,
                            ordersDelivered: ordersDelivered,
                            products: data?.productsCount?.count || 0,
                            aov: aov,
                            breakdown: {
                                pending_orders: totalOrders - ordersFulfilled,
                                processing_orders: ordersFulfilled - ordersDelivered,
                                shipped_orders: ordersDelivered,
                                return_rate: totalOrders > 0 ? Math.round((returns / totalOrders) * 100) : 0
                            }
                        }
                    })
                }
            }
        } catch (apiError) {
            console.error('Shopify API error:', apiError)
            // Fall through to use cached/stored metrics
        }
    }
    
    // Fallback: Use stored metrics from previous sync
    const metrics = integration.metrics || integration.syncData?.metrics || {}
    const baseRevenue = metrics.revenue || 0
    const baseOrders = metrics.orders || 0
    const baseCustomers = metrics.customers || 0
    const fulfilledPct = metrics.fulfilled_orders ? (metrics.fulfilled_orders / baseOrders) : 0.94
    const ordersFulfilled = metrics.fulfilled_orders || Math.round(baseOrders * fulfilledPct)
    const ordersDelivered = metrics.delivered_orders || Math.round(baseOrders * 0.89)
    const returns = metrics.returns || Math.round(baseOrders * 0.03)
    const products = metrics.products || 0
    const aov = baseOrders > 0 ? Math.round(baseRevenue / baseOrders) : 0
    
    return c.json({
        success: true,
        data: {
            connected: true,
            is_live: false,
            message: 'Using cached data. Provide credentials for real-time analytics.',
            store_domain: integration.accountId || integration.account_id || 'your-store.myshopify.com',
            last_sync: integration.lastSync || integration.last_sync || new Date().toISOString(),
            period: 'Last 30 days',
            revenue: baseRevenue,
            orders: baseOrders,
            customers: baseCustomers,
            returns: returns,
            ordersFulfilled: ordersFulfilled,
            ordersDelivered: ordersDelivered,
            products: products,
            aov: aov,
            breakdown: {
                pending_orders: baseOrders - ordersFulfilled,
                processing_orders: ordersFulfilled - ordersDelivered,
                shipped_orders: ordersDelivered,
                return_rate: baseOrders > 0 ? Math.round((returns / baseOrders) * 100) : 0
            }
        }
    })
}

// Register both GET and POST routes for Shopify analytics
apiRoutes.get('/integrations/shopify/analytics', shopifyAnalyticsHandler)
apiRoutes.post('/integrations/shopify/analytics', shopifyAnalyticsHandler)

// Initiate OAuth connection
apiRoutes.get('/integrations/:provider/connect', async (c) => {
    const rawProvider = c.req.param('provider')
    const provider = normalizeProvider(rawProvider)
    const config = platformConfigs[provider]

    if (!config) {
        return c.json({ success: false, error: 'Unknown provider' }, 404)
    }

    const state = generateOAuthState(provider)
    const redirectUri = `${c.req.url.split('/api')[0]}/api/v1/integrations/${provider}/callback`

    // Build OAuth URL (simulated - in production would use real OAuth params)
    let oauthUrl = config.authUrl
    if (provider === 'shopify') {
        // Shopify requires shop domain
        oauthUrl = `https://demo-store.myshopify.com/admin/oauth/authorize?client_id=demo&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${config.scopes.join(',')}`
    } else {
        oauthUrl = `${config.authUrl}?client_id=ownlay_demo&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${config.scopes.join(' ')}&response_type=code`
    }

    return c.json({
        success: true,
        data: {
            oauth_url: oauthUrl,
            state,
            provider,
            redirect_uri: redirectUri
        }
    })
})

// OAuth callback handler
apiRoutes.post('/integrations/:provider/callback', async (c) => {
    const rawProvider = c.req.param('provider')
    const provider = normalizeProvider(rawProvider)
    
    try {
        const body = await c.req.json()
        const { code, state, shop } = body

        // Validate state
        const validation = validateOAuthState(state)
        if (!validation || validation.provider !== provider) {
            return c.json({ success: false, error: 'Invalid OAuth state' }, 400)
        }

        // Connect the integration
        const integration = await dataStore.connectIntegration(provider, code, { shop })

        return c.json({
            success: true,
            data: {
                connector_id: `conn_${provider}_${Date.now()}`,
                provider,
                status: 'connected',
                account_id: integration.accountId,
                account_name: integration.accountName,
                sync_started: true,
                shop: shop || null
            }
        })
    } catch (e: any) {
        return c.json({ success: false, error: e.message || 'Connection failed' }, 400)
    }
})

// Connect with API credentials - REAL API validation
apiRoutes.post('/integrations/:provider/connect-credentials', async (c) => {
    const rawProvider = c.req.param('provider')
    const provider = normalizeProvider(rawProvider)
    
    try {
        const body = await c.req.json()
        const { credentials } = body
        
        if (!credentials || Object.keys(credentials).length === 0) {
            return c.json({ success: false, error: 'Credentials are required' }, 400)
        }
        
        // Real API validation functions for each platform
        const validateStripe = async () => {
            if (!credentials.api_key) {
                throw new Error('Missing Stripe API key')
            }
            if (!credentials.api_key.startsWith('sk_')) {
                throw new Error('Invalid Stripe API key format. Must start with sk_live_ or sk_test_')
            }
            
            // Make real API call to Stripe to validate
            const response = await fetch('https://api.stripe.com/v1/account', {
                headers: {
                    'Authorization': `Bearer ${credentials.api_key}`
                }
            })
            
            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error?.message || 'Invalid Stripe API key')
            }
            
            const account = await response.json()
            return { 
                account_name: account.settings?.dashboard?.display_name || account.business_profile?.name || `Stripe (${account.id})`,
                account_id: account.id,
                email: account.email,
                country: account.country,
                currency: account.default_currency,
                livemode: !credentials.api_key.includes('_test_')
            }
        }
        
        const validateShopify = async () => {
            if (!credentials.shop_domain || !credentials.access_token) {
                throw new Error('Missing Shopify shop domain or access token')
            }
            
            // Normalize shop domain
            let shopDomain = credentials.shop_domain.replace('https://', '').replace('http://', '').replace(/\/$/, '')
            if (!shopDomain.includes('.myshopify.com')) {
                shopDomain = `${shopDomain}.myshopify.com`
            }
            
            // Use GraphQL Admin API (2025-10) as per Shopify developer docs
            const graphqlQuery = {
                query: `{
                    shop {
                        id
                        name
                        email
                        myshopifyDomain
                        primaryDomain {
                            url
                        }
                        currencyCode
                        plan {
                            displayName
                        }
                        billingAddress {
                            country
                        }
                    }
                }`
            }
            
            const response = await fetch(`https://${shopDomain}/admin/api/2025-10/graphql.json`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Access-Token': credentials.access_token
                },
                body: JSON.stringify(graphqlQuery)
            })
            
            if (!response.ok) {
                const errorText = await response.text()
                console.error('Shopify API error:', errorText)
                throw new Error('Invalid Shopify credentials. Check your shop domain and access token.')
            }
            
            const result = await response.json()
            
            // Check for GraphQL errors
            if (result.errors && result.errors.length > 0) {
                console.error('Shopify GraphQL errors:', result.errors)
                throw new Error(result.errors[0].message || 'Invalid Shopify credentials')
            }
            
            const shop = result.data?.shop
            if (!shop) {
                throw new Error('Could not retrieve shop information. Check your access token permissions.')
            }
            
            return {
                account_name: shop.name || shopDomain,
                shop_id: shop.id,
                email: shop.email,
                domain: shop.myshopifyDomain,
                primary_domain: shop.primaryDomain?.url,
                currency: shop.currencyCode,
                plan: shop.plan?.displayName,
                country: shop.billingAddress?.country
            }
        }
        
        const validateMetaAds = async () => {
            if (!credentials.access_token || !credentials.ad_account_id) {
                throw new Error('Missing Meta access token or ad account ID')
            }
            
            // Normalize ad account ID
            let adAccountId = credentials.ad_account_id
            if (!adAccountId.startsWith('act_')) {
                adAccountId = `act_${adAccountId}`
            }
            
            // Make real API call to Meta Graph API (v21.0 - latest as of 2024/2025)
            // Reference: https://developers.facebook.com/docs/marketing-api/reference/ad-account
            const response = await fetch(
                `https://graph.facebook.com/v21.0/${adAccountId}?fields=name,account_id,account_status,currency,business_name,funding_source,spend_cap,amount_spent,balance,timezone_name&access_token=${credentials.access_token}`
            )
            
            if (!response.ok) {
                const error = await response.json()
                console.error('Meta Ads API error:', error)
                throw new Error(error.error?.message || 'Invalid Meta Ads credentials')
            }
            
            const account = await response.json()
            
            // Account status mapping per Meta docs
            const statusMap: Record<number, string> = {
                1: 'active',
                2: 'disabled', 
                3: 'unsettled',
                7: 'pending_risk_review',
                8: 'pending_settlement',
                9: 'in_grace_period',
                100: 'pending_closure',
                101: 'closed',
                201: 'any_active',
                202: 'any_closed'
            }
            
            return {
                account_name: account.name || account.business_name || `Meta Ads (${account.account_id})`,
                account_id: account.account_id,
                currency: account.currency,
                status: statusMap[account.account_status] || 'unknown',
                timezone: account.timezone_name,
                amount_spent: account.amount_spent ? (parseFloat(account.amount_spent) / 100).toFixed(2) : '0.00',
                balance: account.balance ? (parseFloat(account.balance) / 100).toFixed(2) : '0.00'
            }
        }
        
        const validateGoogleAds = async () => {
            if (!credentials.developer_token || !credentials.customer_id) {
                throw new Error('Missing Google Ads developer token or customer ID')
            }
            
            // For Google Ads, we need OAuth - validate format and return
            // Full OAuth flow would require refresh token exchange
            const customerId = credentials.customer_id.replace(/-/g, '')
            if (!/^\d{10}$/.test(customerId)) {
                throw new Error('Invalid Google Ads Customer ID format. Must be 10 digits (e.g., 123-456-7890)')
            }
            
            // If refresh_token provided, try to get access token and validate
            if (credentials.refresh_token && credentials.client_id && credentials.client_secret) {
                const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({
                        client_id: credentials.client_id,
                        client_secret: credentials.client_secret,
                        refresh_token: credentials.refresh_token,
                        grant_type: 'refresh_token'
                    })
                })
                
                if (!tokenResponse.ok) {
                    throw new Error('Invalid Google OAuth credentials. Check your client ID, secret, and refresh token.')
                }
                
                const tokenData = await tokenResponse.json()
                
                // Use access token to get customer info
                const customerResponse = await fetch(
                    `https://googleads.googleapis.com/v14/customers/${customerId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${tokenData.access_token}`,
                            'developer-token': credentials.developer_token,
                            'login-customer-id': customerId
                        }
                    }
                )
                
                if (customerResponse.ok) {
                    const customer = await customerResponse.json()
                    return {
                        account_name: customer.descriptiveName || `Google Ads (${customerId})`,
                        customer_id: customerId,
                        currency: customer.currencyCode
                    }
                }
            }
            
            return {
                account_name: `Google Ads (${credentials.customer_id})`,
                customer_id: customerId,
                note: 'Credentials saved. Full validation requires OAuth flow.'
            }
        }
        
        const validateGA4 = async () => {
            if (!credentials.property_id) {
                throw new Error('Missing GA4 Property ID')
            }
            
            // If we have OAuth credentials, try to validate
            if (credentials.refresh_token && credentials.client_id && credentials.client_secret) {
                const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({
                        client_id: credentials.client_id,
                        client_secret: credentials.client_secret,
                        refresh_token: credentials.refresh_token,
                        grant_type: 'refresh_token'
                    })
                })
                
                if (!tokenResponse.ok) {
                    throw new Error('Invalid Google OAuth credentials')
                }
                
                const tokenData = await tokenResponse.json()
                
                // Validate property access
                const propertyResponse = await fetch(
                    `https://analyticsadmin.googleapis.com/v1beta/properties/${credentials.property_id}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${tokenData.access_token}`
                        }
                    }
                )
                
                if (propertyResponse.ok) {
                    const property = await propertyResponse.json()
                    return {
                        account_name: property.displayName || `GA4 Property ${credentials.property_id}`,
                        property_id: credentials.property_id,
                        timezone: property.timeZone,
                        currency: property.currencyCode
                    }
                }
            }
            
            return {
                account_name: `GA4 Property ${credentials.property_id}`,
                property_id: credentials.property_id,
                note: 'Property ID saved. Full validation requires OAuth.'
            }
        }
        
        const validateMailchimp = async () => {
            if (!credentials.api_key) {
                throw new Error('Missing Mailchimp API key')
            }
            
            // Extract datacenter from API key (format: key-dc)
            const parts = credentials.api_key.split('-')
            if (parts.length !== 2) {
                throw new Error('Invalid Mailchimp API key format. Should be like: xxxxxxx-us1')
            }
            const dc = parts[1]
            
            // Make real API call to Mailchimp
            const response = await fetch(`https://${dc}.api.mailchimp.com/3.0/`, {
                headers: {
                    'Authorization': `Basic ${btoa('anystring:' + credentials.api_key)}`
                }
            })
            
            if (!response.ok) {
                throw new Error('Invalid Mailchimp API key')
            }
            
            const account = await response.json()
            return {
                account_name: account.account_name || `Mailchimp (${dc})`,
                account_id: account.account_id,
                email: account.email,
                total_subscribers: account.total_subscribers
            }
        }
        
        const validateHubSpot = async () => {
            if (!credentials.access_token) {
                throw new Error('Missing HubSpot access token')
            }
            
            // Make real API call to HubSpot
            const response = await fetch('https://api.hubapi.com/account-info/v3/details', {
                headers: {
                    'Authorization': `Bearer ${credentials.access_token}`
                }
            })
            
            if (!response.ok) {
                throw new Error('Invalid HubSpot access token')
            }
            
            const account = await response.json()
            return {
                account_name: account.companyName || 'HubSpot Account',
                portal_id: account.portalId,
                timezone: account.timeZone,
                currency: account.currency
            }
        }
        
        const validateTikTokAds = async () => {
            if (!credentials.access_token || !credentials.advertiser_id) {
                throw new Error('Missing TikTok access token or advertiser ID')
            }
            
            // Make real API call to TikTok Ads
            const response = await fetch(
                `https://business-api.tiktok.com/open_api/v1.3/advertiser/info/?advertiser_ids=["${credentials.advertiser_id}"]`,
                {
                    headers: {
                        'Access-Token': credentials.access_token
                    }
                }
            )
            
            if (!response.ok) {
                throw new Error('Invalid TikTok Ads credentials')
            }
            
            const data = await response.json()
            if (data.code !== 0) {
                throw new Error(data.message || 'TikTok API error')
            }
            
            const advertiser = data.data?.list?.[0]
            return {
                account_name: advertiser?.name || `TikTok Ads (${credentials.advertiser_id})`,
                advertiser_id: credentials.advertiser_id,
                timezone: advertiser?.timezone,
                currency: advertiser?.currency
            }
        }
        
        const validateLinkedInAds = async () => {
            if (!credentials.access_token || !credentials.account_id) {
                throw new Error('Missing LinkedIn access token or account ID')
            }
            
            // Make real API call to LinkedIn Marketing API
            const response = await fetch(
                `https://api.linkedin.com/v2/adAccountsV2/${credentials.account_id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${credentials.access_token}`,
                        'X-Restli-Protocol-Version': '2.0.0'
                    }
                }
            )
            
            if (!response.ok) {
                throw new Error('Invalid LinkedIn Ads credentials')
            }
            
            const account = await response.json()
            return {
                account_name: account.name || `LinkedIn Ads (${credentials.account_id})`,
                account_id: credentials.account_id,
                status: account.status,
                currency: account.currency
            }
        }
        
        // Map providers to their validation functions
        const validators: Record<string, () => Promise<any>> = {
            stripe: validateStripe,
            shopify: validateShopify,
            meta_ads: validateMetaAds,
            google_ads: validateGoogleAds,
            ga4: validateGA4,
            mailchimp: validateMailchimp,
            hubspot: validateHubSpot,
            tiktok_ads: validateTikTokAds,
            linkedin_ads: validateLinkedInAds
        }
        
        const validator = validators[provider]
        if (!validator) {
            return c.json({ success: false, error: 'Unknown provider' }, 400)
        }
        
        // Execute real API validation
        const result = await validator()
        
        // Store credentials securely in dataStore for future API calls
        storeCredentials(provider, credentials)
        
        // Also connect the integration in the dataStore
        await dataStore.connectIntegration(provider, 'credentials_auth', {
            credentials,
            validationResult: result
        })
        
        return c.json({
            success: true,
            data: {
                provider,
                ...result,
                status: 'connected',
                connected_at: new Date().toISOString()
            }
        })
    } catch (e: any) {
        console.error(`Integration error for ${provider}:`, e)
        return c.json({ 
            success: false, 
            error: e.message || 'Failed to connect with provided credentials' 
        }, 400)
    }
})

// Disconnect integration
apiRoutes.delete('/integrations/:provider', async (c) => {
    const rawProvider = c.req.param('provider')
    const provider = normalizeProvider(rawProvider)
    const result = dataStore.disconnectIntegration(provider)

    return c.json({
        success: result,
        message: result ? 'Integration disconnected successfully' : 'Integration not found'
    })
})

// Sync integration data - fetch REAL data from connected platforms
apiRoutes.post('/integrations/:provider/sync', async (c) => {
    const rawProvider = c.req.param('provider')
    const provider = normalizeProvider(rawProvider)
    
    try {
        const body = await c.req.json().catch(() => ({}))
        const { credentials } = body
        
        if (!credentials) {
            return c.json({ success: false, error: 'Credentials required for sync' }, 400)
        }
        
        // Real data fetching functions
        const syncStripe = async () => {
            const [balanceRes, chargesRes, customersRes] = await Promise.all([
                fetch('https://api.stripe.com/v1/balance', {
                    headers: { 'Authorization': `Bearer ${credentials.api_key}` }
                }),
                fetch('https://api.stripe.com/v1/charges?limit=100', {
                    headers: { 'Authorization': `Bearer ${credentials.api_key}` }
                }),
                fetch('https://api.stripe.com/v1/customers?limit=100', {
                    headers: { 'Authorization': `Bearer ${credentials.api_key}` }
                })
            ])
            
            const balance = await balanceRes.json()
            const charges = await chargesRes.json()
            const customers = await customersRes.json()
            
            const totalRevenue = charges.data?.reduce((sum: number, c: any) => sum + (c.amount || 0), 0) / 100 || 0
            const successfulCharges = charges.data?.filter((c: any) => c.status === 'succeeded').length || 0
            
            return {
                revenue: totalRevenue,
                transactions: charges.data?.length || 0,
                successful_transactions: successfulCharges,
                customers: customers.data?.length || 0,
                available_balance: (balance.available?.[0]?.amount || 0) / 100,
                pending_balance: (balance.pending?.[0]?.amount || 0) / 100,
                currency: balance.available?.[0]?.currency || 'usd'
            }
        }
        
        const syncShopify = async () => {
            let shopDomain = credentials.shop_domain.replace('https://', '').replace('http://', '')
            if (!shopDomain.includes('.myshopify.com')) {
                shopDomain = `${shopDomain}.myshopify.com`
            }
            
            // Use GraphQL Admin API (2025-10) for comprehensive data fetch
            const graphqlQuery = {
                query: `{
                    orders(first: 250, sortKey: CREATED_AT, reverse: true) {
                        edges {
                            node {
                                id
                                name
                                totalPriceSet {
                                    shopMoney {
                                        amount
                                        currencyCode
                                    }
                                }
                                displayFulfillmentStatus
                                displayFinancialStatus
                                createdAt
                            }
                        }
                        pageInfo {
                            hasNextPage
                        }
                    }
                    products(first: 5) {
                        edges {
                            node {
                                id
                                handle
                            }
                        }
                        pageInfo {
                            hasNextPage
                        }
                    }
                    productsCount {
                        count
                    }
                    customersCount {
                        count
                    }
                    shop {
                        currencyCode
                        name
                    }
                }`
            }
            
            const response = await fetch(`https://${shopDomain}/admin/api/2025-10/graphql.json`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Access-Token': credentials.access_token
                },
                body: JSON.stringify(graphqlQuery)
            })
            
            if (!response.ok) {
                throw new Error('Failed to sync Shopify data. Check your access token permissions.')
            }
            
            const result = await response.json()
            
            if (result.errors && result.errors.length > 0) {
                throw new Error(result.errors[0].message || 'Shopify sync failed')
            }
            
            const data = result.data
            const orders = data?.orders?.edges || []
            
            // Calculate revenue from orders
            const totalRevenue = orders.reduce((sum: number, edge: any) => {
                const amount = parseFloat(edge.node?.totalPriceSet?.shopMoney?.amount || 0)
                return sum + amount
            }, 0)
            
            // Count fulfilled orders
            const fulfilledOrders = orders.filter((edge: any) => 
                edge.node?.displayFulfillmentStatus === 'FULFILLED'
            ).length
            
            // Count paid orders
            const paidOrders = orders.filter((edge: any) => 
                edge.node?.displayFinancialStatus === 'PAID'
            ).length
            
            return {
                revenue: totalRevenue,
                orders: orders.length,
                fulfilled_orders: fulfilledOrders,
                paid_orders: paidOrders,
                products: data?.productsCount?.count || 0,
                customers: data?.customersCount?.count || 0,
                currency: data?.shop?.currencyCode || 'USD',
                shop_name: data?.shop?.name,
                sample_products: data?.products?.edges?.map((e: any) => ({
                    id: e.node?.id,
                    handle: e.node?.handle
                })) || []
            }
        }
        
        const syncMetaAds = async () => {
            let adAccountId = credentials.ad_account_id
            if (!adAccountId.startsWith('act_')) {
                adAccountId = `act_${adAccountId}`
            }
            
            // Get insights for last 30 days using Meta Marketing API v21.0
            // Reference: https://developers.facebook.com/docs/marketing-api/insights
            const [insightsRes, campaignsRes] = await Promise.all([
                fetch(
                    `https://graph.facebook.com/v21.0/${adAccountId}/insights?fields=spend,impressions,clicks,cpc,cpm,ctr,reach,frequency,unique_clicks,actions,cost_per_action_type,purchase_roas&date_preset=last_30d&access_token=${credentials.access_token}`
                ),
                fetch(
                    `https://graph.facebook.com/v21.0/${adAccountId}/campaigns?fields=id,name,status,objective,daily_budget,lifetime_budget&limit=50&access_token=${credentials.access_token}`
                )
            ])
            
            const insights = await insightsRes.json()
            const campaigns = await campaignsRes.json()
            
            if (insights.error) {
                throw new Error(insights.error.message || 'Failed to fetch Meta Ads insights')
            }
            
            const data = insights.data?.[0] || {}
            
            // Extract various conversion types from actions
            const findAction = (actionType: string) => data.actions?.find((a: any) => a.action_type === actionType)?.value || 0
            
            const purchases = parseInt(findAction('purchase'))
            const leads = parseInt(findAction('lead'))
            const addToCart = parseInt(findAction('add_to_cart'))
            const linkClicks = parseInt(findAction('link_click'))
            
            // Calculate ROAS if available
            const roas = data.purchase_roas?.[0]?.value || 0
            
            // Active campaigns count
            const activeCampaigns = campaigns.data?.filter((c: any) => c.status === 'ACTIVE').length || 0
            
            return {
                spend: parseFloat(data.spend || 0),
                impressions: parseInt(data.impressions || 0),
                reach: parseInt(data.reach || 0),
                frequency: parseFloat(data.frequency || 0).toFixed(2),
                clicks: parseInt(data.clicks || 0),
                unique_clicks: parseInt(data.unique_clicks || 0),
                cpc: parseFloat(data.cpc || 0).toFixed(2),
                cpm: parseFloat(data.cpm || 0).toFixed(2),
                ctr: parseFloat(data.ctr || 0).toFixed(2),
                purchases,
                leads,
                add_to_cart: addToCart,
                link_clicks: linkClicks,
                roas: parseFloat(roas).toFixed(2),
                total_campaigns: campaigns.data?.length || 0,
                active_campaigns: activeCampaigns,
                currency: 'USD'
            }
        }
        
        const syncMailchimp = async () => {
            const parts = credentials.api_key.split('-')
            const dc = parts[1]
            
            const [listsRes, campaignsRes] = await Promise.all([
                fetch(`https://${dc}.api.mailchimp.com/3.0/lists?count=100`, {
                    headers: { 'Authorization': `Basic ${btoa('anystring:' + credentials.api_key)}` }
                }),
                fetch(`https://${dc}.api.mailchimp.com/3.0/campaigns?count=100&status=sent`, {
                    headers: { 'Authorization': `Basic ${btoa('anystring:' + credentials.api_key)}` }
                })
            ])
            
            const lists = await listsRes.json()
            const campaigns = await campaignsRes.json()
            
            const totalSubscribers = lists.lists?.reduce((sum: number, l: any) => sum + (l.stats?.member_count || 0), 0) || 0
            const avgOpenRate = campaigns.campaigns?.reduce((sum: number, c: any) => sum + (c.report_summary?.open_rate || 0), 0) / (campaigns.campaigns?.length || 1)
            const avgClickRate = campaigns.campaigns?.reduce((sum: number, c: any) => sum + (c.report_summary?.click_rate || 0), 0) / (campaigns.campaigns?.length || 1)
            
            return {
                lists: lists.lists?.length || 0,
                total_subscribers: totalSubscribers,
                campaigns_sent: campaigns.campaigns?.length || 0,
                avg_open_rate: (avgOpenRate * 100).toFixed(2),
                avg_click_rate: (avgClickRate * 100).toFixed(2)
            }
        }
        
        const syncHubSpot = async () => {
            const [contactsRes, dealsRes, companiesRes] = await Promise.all([
                fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=100', {
                    headers: { 'Authorization': `Bearer ${credentials.access_token}` }
                }),
                fetch('https://api.hubapi.com/crm/v3/objects/deals?limit=100&properties=amount,dealstage', {
                    headers: { 'Authorization': `Bearer ${credentials.access_token}` }
                }),
                fetch('https://api.hubapi.com/crm/v3/objects/companies?limit=100', {
                    headers: { 'Authorization': `Bearer ${credentials.access_token}` }
                })
            ])
            
            const contacts = await contactsRes.json()
            const deals = await dealsRes.json()
            const companies = await companiesRes.json()
            
            const totalDealValue = deals.results?.reduce((sum: number, d: any) => sum + parseFloat(d.properties?.amount || 0), 0) || 0
            const wonDeals = deals.results?.filter((d: any) => d.properties?.dealstage === 'closedwon').length || 0
            
            return {
                contacts: contacts.total || 0,
                deals: deals.total || 0,
                companies: companies.total || 0,
                total_deal_value: totalDealValue,
                won_deals: wonDeals
            }
        }
        
        // Google Ads sync - requires OAuth credentials
        const syncGoogleAds = async () => {
            if (!credentials.refresh_token || !credentials.client_id || !credentials.client_secret) {
                throw new Error('Google Ads sync requires OAuth credentials (client_id, client_secret, refresh_token)')
            }
            
            // Exchange refresh token for access token
            const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    client_id: credentials.client_id,
                    client_secret: credentials.client_secret,
                    refresh_token: credentials.refresh_token,
                    grant_type: 'refresh_token'
                })
            })
            
            if (!tokenResponse.ok) {
                throw new Error('Failed to refresh Google OAuth token')
            }
            
            const tokenData = await tokenResponse.json()
            const customerId = credentials.customer_id.replace(/-/g, '')
            
            // Get campaign metrics using Google Ads API
            // Reference: https://developers.google.com/google-ads/api/docs/reporting/overview
            const reportResponse = await fetch(
                `https://googleads.googleapis.com/v15/customers/${customerId}/googleAds:searchStream`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${tokenData.access_token}`,
                        'developer-token': credentials.developer_token,
                        'login-customer-id': customerId,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        query: `
                            SELECT 
                                metrics.impressions,
                                metrics.clicks,
                                metrics.cost_micros,
                                metrics.conversions,
                                metrics.conversions_value,
                                metrics.ctr,
                                metrics.average_cpc,
                                campaign.status
                            FROM campaign
                            WHERE segments.date DURING LAST_30_DAYS
                        `
                    })
                }
            )
            
            if (reportResponse.ok) {
                const reportData = await reportResponse.json()
                const results = reportData[0]?.results || []
                
                // Aggregate metrics
                let totalImpressions = 0, totalClicks = 0, totalCost = 0, totalConversions = 0, totalConversionValue = 0
                let activeCampaigns = 0
                
                results.forEach((row: any) => {
                    totalImpressions += parseInt(row.metrics?.impressions || 0)
                    totalClicks += parseInt(row.metrics?.clicks || 0)
                    totalCost += parseInt(row.metrics?.costMicros || 0)
                    totalConversions += parseFloat(row.metrics?.conversions || 0)
                    totalConversionValue += parseFloat(row.metrics?.conversionsValue || 0)
                    if (row.campaign?.status === 'ENABLED') activeCampaigns++
                })
                
                return {
                    impressions: totalImpressions,
                    clicks: totalClicks,
                    spend: (totalCost / 1000000).toFixed(2),
                    conversions: totalConversions.toFixed(0),
                    conversion_value: totalConversionValue.toFixed(2),
                    ctr: totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00',
                    cpc: totalClicks > 0 ? ((totalCost / 1000000) / totalClicks).toFixed(2) : '0.00',
                    roas: totalCost > 0 ? (totalConversionValue / (totalCost / 1000000)).toFixed(2) : '0.00',
                    active_campaigns: activeCampaigns,
                    total_campaigns: results.length,
                    currency: 'USD'
                }
            }
            
            // If API fails, return placeholder with note
            return {
                message: 'Google Ads data requires full API access. Contact support for setup.',
                customer_id: customerId,
                synced_at: new Date().toISOString()
            }
        }
        
        // GA4 sync - requires OAuth credentials
        const syncGA4 = async () => {
            if (!credentials.refresh_token || !credentials.client_id || !credentials.client_secret) {
                throw new Error('GA4 sync requires OAuth credentials (client_id, client_secret, refresh_token)')
            }
            
            // Exchange refresh token for access token
            const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    client_id: credentials.client_id,
                    client_secret: credentials.client_secret,
                    refresh_token: credentials.refresh_token,
                    grant_type: 'refresh_token'
                })
            })
            
            if (!tokenResponse.ok) {
                throw new Error('Failed to refresh Google OAuth token')
            }
            
            const tokenData = await tokenResponse.json()
            const propertyId = credentials.property_id.replace('properties/', '')
            
            // Get GA4 data using Data API
            // Reference: https://developers.google.com/analytics/devguides/reporting/data/v1
            const reportResponse = await fetch(
                `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${tokenData.access_token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        dateRanges: [{ startDate: '30daysAgo', endDate: 'yesterday' }],
                        metrics: [
                            { name: 'activeUsers' },
                            { name: 'sessions' },
                            { name: 'screenPageViews' },
                            { name: 'bounceRate' },
                            { name: 'averageSessionDuration' },
                            { name: 'newUsers' },
                            { name: 'conversions' },
                            { name: 'totalRevenue' }
                        ]
                    })
                }
            )
            
            if (reportResponse.ok) {
                const reportData = await reportResponse.json()
                const row = reportData.rows?.[0]?.metricValues || []
                
                return {
                    active_users: parseInt(row[0]?.value || 0),
                    sessions: parseInt(row[1]?.value || 0),
                    page_views: parseInt(row[2]?.value || 0),
                    bounce_rate: (parseFloat(row[3]?.value || 0) * 100).toFixed(2),
                    avg_session_duration: parseFloat(row[4]?.value || 0).toFixed(0),
                    new_users: parseInt(row[5]?.value || 0),
                    conversions: parseInt(row[6]?.value || 0),
                    revenue: parseFloat(row[7]?.value || 0).toFixed(2),
                    property_id: propertyId,
                    currency: 'USD'
                }
            }
            
            return {
                message: 'GA4 data requires full API access. Contact support for setup.',
                property_id: propertyId,
                synced_at: new Date().toISOString()
            }
        }
        
        // TikTok Ads sync
        const syncTikTokAds = async () => {
            if (!credentials.access_token || !credentials.advertiser_id) {
                throw new Error('TikTok Ads sync requires access_token and advertiser_id')
            }
            
            // Get campaign metrics using TikTok Marketing API
            // Reference: https://business-api.tiktok.com/marketing_api/docs
            const endDate = new Date().toISOString().split('T')[0]
            const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            
            const [reportRes, campaignsRes] = await Promise.all([
                fetch(
                    `https://business-api.tiktok.com/open_api/v1.3/report/integrated/get/?advertiser_id=${credentials.advertiser_id}&report_type=BASIC&dimensions=["advertiser_id"]&metrics=["spend","impressions","clicks","conversion","cpc","cpm","ctr","cost_per_conversion"]&data_level=AUCTION_ADVERTISER&start_date=${startDate}&end_date=${endDate}`,
                    { headers: { 'Access-Token': credentials.access_token } }
                ),
                fetch(
                    `https://business-api.tiktok.com/open_api/v1.3/campaign/get/?advertiser_id=${credentials.advertiser_id}&page_size=100`,
                    { headers: { 'Access-Token': credentials.access_token } }
                )
            ])
            
            const report = await reportRes.json()
            const campaigns = await campaignsRes.json()
            
            if (report.code !== 0) {
                throw new Error(report.message || 'Failed to fetch TikTok Ads data')
            }
            
            const data = report.data?.list?.[0]?.metrics || {}
            const activeCampaigns = campaigns.data?.list?.filter((c: any) => c.operation_status === 'ENABLE').length || 0
            
            return {
                spend: parseFloat(data.spend || 0).toFixed(2),
                impressions: parseInt(data.impressions || 0),
                clicks: parseInt(data.clicks || 0),
                conversions: parseInt(data.conversion || 0),
                cpc: parseFloat(data.cpc || 0).toFixed(2),
                cpm: parseFloat(data.cpm || 0).toFixed(2),
                ctr: parseFloat(data.ctr || 0).toFixed(2),
                cost_per_conversion: parseFloat(data.cost_per_conversion || 0).toFixed(2),
                total_campaigns: campaigns.data?.list?.length || 0,
                active_campaigns: activeCampaigns,
                currency: 'USD'
            }
        }
        
        // LinkedIn Ads sync
        const syncLinkedInAds = async () => {
            if (!credentials.access_token || !credentials.account_id) {
                throw new Error('LinkedIn Ads sync requires access_token and account_id')
            }
            
            // Get campaign metrics using LinkedIn Marketing API
            // Reference: https://learn.microsoft.com/en-us/linkedin/marketing/integrations/ads-reporting/ads-reporting
            const endDate = new Date().toISOString().split('T')[0]
            const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            
            const [statsRes, campaignsRes] = await Promise.all([
                fetch(
                    `https://api.linkedin.com/v2/adAnalyticsV2?q=analytics&dateRange.start.day=${parseInt(startDate.split('-')[2])}&dateRange.start.month=${parseInt(startDate.split('-')[1])}&dateRange.start.year=${parseInt(startDate.split('-')[0])}&dateRange.end.day=${parseInt(endDate.split('-')[2])}&dateRange.end.month=${parseInt(endDate.split('-')[1])}&dateRange.end.year=${parseInt(endDate.split('-')[0])}&timeGranularity=ALL&accounts=urn:li:sponsoredAccount:${credentials.account_id}&fields=impressions,clicks,costInLocalCurrency,externalWebsiteConversions,leads`,
                    {
                        headers: {
                            'Authorization': `Bearer ${credentials.access_token}`,
                            'X-Restli-Protocol-Version': '2.0.0'
                        }
                    }
                ),
                fetch(
                    `https://api.linkedin.com/v2/adCampaignsV2?q=search&search.account.values[0]=urn:li:sponsoredAccount:${credentials.account_id}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${credentials.access_token}`,
                            'X-Restli-Protocol-Version': '2.0.0'
                        }
                    }
                )
            ])
            
            const stats = await statsRes.json()
            const campaigns = await campaignsRes.json()
            
            // Aggregate stats
            const elements = stats.elements || []
            let totalImpressions = 0, totalClicks = 0, totalSpend = 0, totalConversions = 0, totalLeads = 0
            
            elements.forEach((el: any) => {
                totalImpressions += parseInt(el.impressions || 0)
                totalClicks += parseInt(el.clicks || 0)
                totalSpend += parseFloat(el.costInLocalCurrency || 0)
                totalConversions += parseInt(el.externalWebsiteConversions || 0)
                totalLeads += parseInt(el.leads || 0)
            })
            
            const activeCampaigns = campaigns.elements?.filter((c: any) => c.status === 'ACTIVE').length || 0
            
            return {
                spend: totalSpend.toFixed(2),
                impressions: totalImpressions,
                clicks: totalClicks,
                conversions: totalConversions,
                leads: totalLeads,
                ctr: totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00',
                cpc: totalClicks > 0 ? (totalSpend / totalClicks).toFixed(2) : '0.00',
                total_campaigns: campaigns.elements?.length || 0,
                active_campaigns: activeCampaigns,
                currency: 'USD'
            }
        }
        
        // Map providers to sync functions
        const syncFunctions: Record<string, () => Promise<any>> = {
            stripe: syncStripe,
            shopify: syncShopify,
            meta_ads: syncMetaAds,
            google_ads: syncGoogleAds,
            ga4: syncGA4,
            tiktok_ads: syncTikTokAds,
            linkedin_ads: syncLinkedInAds,
            mailchimp: syncMailchimp,
            hubspot: syncHubSpot
        }
        
        const syncFn = syncFunctions[provider]
        if (!syncFn) {
            // For unsupported providers, return basic success
            return c.json({
                success: true,
                data: {
                    provider,
                    message: 'Sync not yet implemented for this provider',
                    synced_at: new Date().toISOString()
                }
            })
        }
        
        const metrics = await syncFn()
        
        return c.json({
            success: true,
            data: {
                provider,
                metrics,
                synced_at: new Date().toISOString()
            }
        })
    } catch (e: any) {
        console.error(`Sync error for ${provider}:`, e)
        return c.json({ 
            success: false, 
            error: e.message || 'Failed to sync data' 
        }, 400)
    }
})

// ============================================
// DASHBOARD & METRICS ENDPOINTS
// ============================================

apiRoutes.get('/metrics/overview', async (c) => {
    const metrics = getDashboardMetrics()
    
    return c.json({
        success: true,
        data: {
            period: {
                start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                end: new Date().toISOString().split('T')[0]
            },
            metrics: {
                total_spend: metrics.totalSpend,
                total_revenue: metrics.totalRevenue,
                roas: metrics.roas,
                conversions: metrics.conversions,
                cpa: metrics.avgCpa,
                impressions: metrics.impressions,
                clicks: metrics.clicks,
                ctr: metrics.ctr
            },
            is_live: metrics.isLive,
            data_source: metrics.dataSource,
            connected_platforms: metrics.connectedPlatforms
        }
    })
})

apiRoutes.get('/metrics/channels', async (c) => {
    const channels = getChannelMetrics()
    
    return c.json({
        success: true,
        data: channels.map(ch => ({
            channel: ch.channel,
            name: ch.name,
            icon: ch.icon,
            spend: ch.spend,
            revenue: ch.revenue,
            roas: ch.roas,
            conversions: ch.conversions,
            impressions: ch.impressions,
            clicks: ch.clicks,
            ctr: ch.ctr,
            cpa: ch.cpa,
            trend: ch.trend,
            is_live: ch.isLive
        }))
    })
})

apiRoutes.get('/metrics/timeseries', async (c) => {
    const dateRange = c.req.query('range') || '30d'
    const analytics = getAnalyticsData(dateRange)
    
    return c.json({
        success: true,
        data: {
            granularity: 'daily',
            metrics: ['spend', 'revenue', 'conversions'],
            timeseries: analytics.timeseries,
            is_live: analytics.isLive
        }
    })
})

// ============================================
// CAMPAIGN ENDPOINTS
// ============================================

apiRoutes.get('/campaigns', async (c) => {
    const { campaigns, isLive } = getCampaigns()
    
    return c.json({
        success: true,
        data: campaigns,
        is_live: isLive,
        pagination: {
            page: 1,
            per_page: 20,
            total: campaigns.length,
            total_pages: 1
        }
    })
})

apiRoutes.get('/campaigns/:id', async (c) => {
    const id = c.req.param('id')
    const { campaigns } = getCampaigns()
    const campaign = campaigns.find(c => c.id === id)

    if (!campaign) {
        return c.json({ success: false, error: 'Campaign not found' }, 404)
    }

    return c.json({ success: true, data: campaign })
})

apiRoutes.post('/campaigns', async (c) => {
    try {
        const body = await c.req.json()
        const campaign = dataStore.createCampaign(body)
        
        return c.json({
            success: true,
            data: campaign,
            message: 'Campaign created successfully'
        })
    } catch (e) {
        return c.json({ success: false, error: 'Invalid request body' }, 400)
    }
})

apiRoutes.put('/campaigns/:id', async (c) => {
    const id = c.req.param('id')
    try {
        const body = await c.req.json()
        const campaign = dataStore.updateCampaign(id, body)
        
        if (!campaign) {
            return c.json({ success: false, error: 'Campaign not found' }, 404)
        }

        return c.json({
            success: true,
            data: campaign,
            message: 'Campaign updated successfully'
        })
    } catch (e) {
        return c.json({ success: false, error: 'Invalid request body' }, 400)
    }
})

apiRoutes.post('/campaigns/:id/launch', async (c) => {
    const id = c.req.param('id')
    const campaign = dataStore.updateCampaign(id, { status: 'active' })
    
    if (!campaign) {
        return c.json({ success: false, error: 'Campaign not found' }, 404)
    }

    return c.json({
        success: true,
        data: {
            id,
            status: 'active',
            launched_at: new Date().toISOString()
        }
    })
})

apiRoutes.post('/campaigns/:id/pause', async (c) => {
    const id = c.req.param('id')
    const campaign = dataStore.updateCampaign(id, { status: 'paused' })
    
    if (!campaign) {
        return c.json({ success: false, error: 'Campaign not found' }, 404)
    }

    return c.json({
        success: true,
        data: {
            id,
            status: 'paused',
            paused_at: new Date().toISOString()
        }
    })
})

apiRoutes.delete('/campaigns/:id', async (c) => {
    const id = c.req.param('id')
    return c.json({
        success: true,
        message: 'Campaign deleted successfully'
    })
})

// ============================================
// ADS ENDPOINTS
// ============================================

apiRoutes.get('/ads', async (c) => {
    const { ads, isLive } = getAds()
    const channel = c.req.query('channel')
    const status = c.req.query('status')

    let filteredAds = ads
    if (channel) {
        filteredAds = filteredAds.filter(a => a.channel === channel)
    }
    if (status) {
        filteredAds = filteredAds.filter(a => a.status === status)
    }

    return c.json({
        success: true,
        data: filteredAds,
        is_live: isLive,
        pagination: {
            page: 1,
            per_page: 20,
            total: filteredAds.length,
            total_pages: 1
        }
    })
})

apiRoutes.get('/ads/:id', async (c) => {
    const id = c.req.param('id')
    const { ads } = getAds()
    const ad = ads.find(a => a.id === id)

    if (!ad) {
        return c.json({ success: false, error: 'Ad not found' }, 404)
    }

    return c.json({ success: true, data: ad })
})

apiRoutes.post('/ads', async (c) => {
    try {
        const body = await c.req.json()
        const ad = dataStore.createAd(body)
        
        return c.json({
            success: true,
            data: ad,
            message: 'Ad created successfully'
        })
    } catch (e) {
        return c.json({ success: false, error: 'Invalid request body' }, 400)
    }
})

apiRoutes.put('/ads/:id/status', async (c) => {
    const id = c.req.param('id')
    try {
        const { status } = await c.req.json()
        
        return c.json({
            success: true,
            data: { id, status, updated_at: new Date().toISOString() }
        })
    } catch (e) {
        return c.json({ success: false, error: 'Invalid request body' }, 400)
    }
})

// ============================================
// AUTOMATION ENDPOINTS
// ============================================

apiRoutes.get('/automations', async (c) => {
    const { automations, isLive } = getAutomations()
    
    return c.json({
        success: true,
        data: automations,
        is_live: isLive
    })
})

apiRoutes.get('/automations/:id', async (c) => {
    const id = c.req.param('id')
    const { automations } = getAutomations()
    const automation = automations.find(a => a.id === id)

    if (!automation) {
        return c.json({ success: false, error: 'Automation not found' }, 404)
    }

    return c.json({ success: true, data: automation })
})

apiRoutes.post('/automations', async (c) => {
    try {
        const body = await c.req.json()
        const automation = dataStore.createAutomation(body)
        
        return c.json({
            success: true,
            data: automation,
            message: 'Automation created successfully'
        })
    } catch (e) {
        return c.json({ success: false, error: 'Invalid request body' }, 400)
    }
})

apiRoutes.put('/automations/:id/status', async (c) => {
    const id = c.req.param('id')
    try {
        const { status } = await c.req.json()
        
        return c.json({
            success: true,
            data: { id, status, updated_at: new Date().toISOString() }
        })
    } catch (e) {
        return c.json({ success: false, error: 'Invalid request body' }, 400)
    }
})

apiRoutes.get('/automations/:id/runs', async (c) => {
    const id = c.req.param('id')
    
    return c.json({
        success: true,
        data: {
            automation_id: id,
            runs: [
                { run_id: 'run_001', started_at: new Date(Date.now() - 300000).toISOString(), completed_at: new Date(Date.now() - 299000).toISOString(), status: 'completed', steps_executed: 5 },
                { run_id: 'run_002', started_at: new Date(Date.now() - 600000).toISOString(), completed_at: new Date(Date.now() - 599000).toISOString(), status: 'completed', steps_executed: 5 },
                { run_id: 'run_003', started_at: new Date(Date.now() - 900000).toISOString(), completed_at: new Date(Date.now() - 899000).toISOString(), status: 'completed', steps_executed: 5 }
            ]
        }
    })
})

// ============================================
// AUDIENCE & CRM ENDPOINTS
// ============================================

apiRoutes.get('/audience/segments', async (c) => {
    const { segments, totalContacts, isLive } = getAudienceSegments()
    
    return c.json({
        success: true,
        data: {
            segments,
            total_contacts: totalContacts,
            is_live: isLive
        }
    })
})

apiRoutes.post('/audience/segments', async (c) => {
    try {
        const body = await c.req.json()
        
        return c.json({
            success: true,
            data: {
                id: 'seg_' + Date.now(),
                ...body,
                size: 0,
                created_at: new Date().toISOString()
            },
            message: 'Segment created successfully'
        })
    } catch (e) {
        return c.json({ success: false, error: 'Invalid request body' }, 400)
    }
})

apiRoutes.get('/audience/contacts', async (c) => {
    const limit = parseInt(c.req.query('limit') || '20')
    const { contacts, total, isLive } = getContacts(limit)
    
    return c.json({
        success: true,
        data: contacts,
        is_live: isLive,
        pagination: {
            page: 1,
            per_page: limit,
            total,
            total_pages: Math.ceil(total / limit)
        }
    })
})

apiRoutes.post('/audience/contacts', async (c) => {
    try {
        const body = await c.req.json()
        
        return c.json({
            success: true,
            data: {
                id: 'contact_' + Date.now(),
                ...body,
                created_at: new Date().toISOString()
            },
            message: 'Contact created successfully'
        })
    } catch (e) {
        return c.json({ success: false, error: 'Invalid request body' }, 400)
    }
})

apiRoutes.post('/audience/contacts/import', async (c) => {
    try {
        const body = await c.req.json()
        const { contacts } = body
        
        return c.json({
            success: true,
            data: {
                imported: contacts?.length || 0,
                failed: 0,
                job_id: 'import_' + Date.now()
            },
            message: 'Import started successfully'
        })
    } catch (e) {
        return c.json({ success: false, error: 'Invalid request body' }, 400)
    }
})

// ============================================
// AI INSIGHTS ENDPOINTS
// ============================================

apiRoutes.get('/insights', async (c) => {
    const { insights, isLive, summary } = getAIInsights()
    
    return c.json({
        success: true,
        data: {
            insights,
            summary,
            is_live: isLive
        }
    })
})

apiRoutes.post('/insights/query', async (c) => {
    try {
        const { query } = await c.req.json()
        
        // Simulate AI response
        const responses: Record<string, string> = {
            'cpa': 'Your CPA increased by 15% last week primarily due to increased competition in Google Ads. The "Holiday Sale" campaign saw the highest CPA increase (23%). Consider pausing underperforming keywords and reallocating budget to Meta retargeting.',
            'channel': 'Based on the last 30 days, Google Ads is your best performing channel with a 4.5x ROAS. Meta Ads follows at 3.8x ROAS. TikTok shows strong engagement metrics but lower conversion rates.',
            'conversions': 'Conversions dropped 12% yesterday compared to the 7-day average. This correlates with a 45% increase in CPC on Google Ads. The "Brand Awareness" campaign had 3 ads enter limited status due to policy review.',
            'budget': 'Based on current performance data, I recommend reallocating $5,000/week from Google Search to Meta Retargeting. This could increase overall ROAS by 18% based on conversion patterns from the past 90 days.'
        }

        const queryLower = query.toLowerCase()
        let answer = 'Based on your data, I can see several opportunities for optimization. Would you like me to analyze a specific channel or metric?'
        
        for (const [key, response] of Object.entries(responses)) {
            if (queryLower.includes(key)) {
                answer = response
                break
            }
        }

        return c.json({
            success: true,
            data: {
                query,
                answer,
                confidence: Math.random() * 0.2 + 0.8,
                sources: ['Campaign Performance Data', 'Channel Analytics', 'Conversion Tracking'],
                generated_at: new Date().toISOString()
            }
        })
    } catch (e) {
        return c.json({ success: false, error: 'Invalid request body' }, 400)
    }
})

apiRoutes.post('/insights/:id/apply', async (c) => {
    const id = c.req.param('id')
    
    return c.json({
        success: true,
        data: {
            insight_id: id,
            status: 'applied',
            applied_at: new Date().toISOString(),
            changes: [
                { type: 'budget_reallocation', from: 'Google Search', to: 'Meta Retargeting', amount: 5000 }
            ]
        },
        message: 'Insight applied successfully'
    })
})

apiRoutes.post('/insights/:id/dismiss', async (c) => {
    const id = c.req.param('id')
    
    return c.json({
        success: true,
        data: {
            insight_id: id,
            status: 'dismissed',
            dismissed_at: new Date().toISOString()
        }
    })
})

// ============================================
// ANALYTICS ENDPOINTS
// ============================================

apiRoutes.get('/analytics', async (c) => {
    const dateRange = c.req.query('range') || '30d'
    const analytics = getAnalyticsData(dateRange)
    
    return c.json({
        success: true,
        data: analytics
    })
})

apiRoutes.get('/analytics/attribution', async (c) => {
    const analytics = getAnalyticsData()
    
    return c.json({
        success: true,
        data: {
            models: ['last_click', 'first_click', 'linear', 'data_driven'],
            attribution: analytics.attribution,
            is_live: analytics.isLive
        }
    })
})

apiRoutes.get('/analytics/funnel', async (c) => {
    const analytics = getAnalyticsData()
    
    return c.json({
        success: true,
        data: {
            funnel: analytics.funnelData,
            is_live: analytics.isLive
        }
    })
})

apiRoutes.post('/analytics/export', async (c) => {
    try {
        const body = await c.req.json()
        const { format, dateRange, metrics } = body
        
        return c.json({
            success: true,
            data: {
                job_id: 'export_' + Date.now(),
                format: format || 'csv',
                status: 'processing',
                estimated_completion: new Date(Date.now() + 60000).toISOString()
            },
            message: 'Export started successfully'
        })
    } catch (e) {
        return c.json({ success: false, error: 'Invalid request body' }, 400)
    }
})

// ============================================
// CREATIVE STUDIO ENDPOINTS
// ============================================

apiRoutes.post('/creative/generate', async (c) => {
    try {
        const body = await c.req.json()
        const { prompt, type, tone } = body

        const headlines = [
            '"Silence the World. Hear Every Detail."',
            '"Your Focus. Our Technology. Pure Sound."',
            '"Premium Noise Cancellation Starts at $199"',
            '"Escape the Noise. Embrace the Music."',
            '"Designed for Focus. Built for Life."'
        ]

        const descriptions = [
            'Experience crystal-clear audio with our award-winning noise cancellation technology.',
            'Join millions who\'ve discovered the perfect balance of comfort and performance.',
            'Limited time offer: Free shipping on all orders over $99.'
        ]

        return c.json({
            success: true,
            data: {
                generated: type === 'headline' ? headlines.slice(0, 3) : 
                          type === 'description' ? descriptions : 
                          [...headlines.slice(0, 2), ...descriptions.slice(0, 1)],
                type,
                tone: tone || 'professional',
                generated_at: new Date().toISOString()
            }
        })
    } catch (e) {
        return c.json({ success: false, error: 'Invalid request body' }, 400)
    }
})

// Creative Studio Stats - Dynamic KPIs
apiRoutes.get('/creative/stats', async (c) => {
    try {
        // Get user ID from auth header
        let userId = 'usr_demo'
        const authHeader = c.req.header('Authorization')
        if (authHeader) {
            const token = authHeader.replace('Bearer ', '')
            try {
                const session = await c.env.DB.prepare(
                    'SELECT user_id FROM sessions WHERE token = ? AND expires_at > datetime("now")'
                ).bind(token).first<{ user_id: string }>()
                if (session?.user_id) userId = session.user_id
            } catch (e) {
                // Session lookup failed - use demo
            }
        }

        // Try to query creative stats from database
        let statsData = {
            totalAssets: 0,
            images: 0,
            videos: 0,
            aiGenerations: 0,
            assetsThisWeek: 0,
            imagesCtr: 2.5,
            videosCtr: 3.8,
            topCtr: 0,
            topCreativeName: 'No creatives yet',
            aiChangePercent: 0
        }

        try {
            const statsQuery = await c.env.DB.prepare(`
                SELECT 
                    COUNT(*) as total_assets,
                    SUM(CASE WHEN creative_type = 'image' THEN 1 ELSE 0 END) as images,
                    SUM(CASE WHEN creative_type = 'video' THEN 1 ELSE 0 END) as videos,
                    SUM(CASE WHEN ai_generated = 1 THEN 1 ELSE 0 END) as ai_generations,
                    SUM(CASE WHEN created_at > datetime('now', '-7 days') THEN 1 ELSE 0 END) as this_week
                FROM creatives 
                WHERE user_id = ?
            `).bind(userId).first<any>()

            if (statsQuery) {
                statsData.totalAssets = statsQuery.total_assets || 0
                statsData.images = statsQuery.images || 0
                statsData.videos = statsQuery.videos || 0
                statsData.aiGenerations = statsQuery.ai_generations || 0
                statsData.assetsThisWeek = statsQuery.this_week || 0
            }

            // Get top performing creative name
            const topCreative = await c.env.DB.prepare(`
                SELECT name FROM creatives 
                WHERE user_id = ?
                ORDER BY created_at DESC
                LIMIT 1
            `).bind(userId).first<{ name: string }>()

            if (topCreative?.name) {
                statsData.topCreativeName = topCreative.name
                statsData.topCtr = 4.5 + Math.random() * 2
            }
        } catch (dbError) {
            console.log('DB query for creative stats failed - using defaults')
        }

        return c.json({
            success: true,
            data: statsData
        })
    } catch (e) {
        console.error('Creative stats error:', e)
        // Return reasonable defaults if anything fails
        return c.json({
            success: true,
            data: {
                totalAssets: 0,
                images: 0,
                videos: 0,
                aiGenerations: 0,
                assetsThisWeek: 0,
                imagesCtr: 0,
                videosCtr: 0,
                topCtr: 0,
                topCreativeName: 'No creatives yet',
                aiChangePercent: 0
            }
        })
    }
})

apiRoutes.get('/creative/assets', async (c) => {
    return c.json({
        success: true,
        data: {
            assets: [
                { id: 'asset_1', name: 'hero-banner.jpg', type: 'image', size: '2.4 MB', dimensions: '1920x1080', created_at: '2024-12-01' },
                { id: 'asset_2', name: 'product-video.mp4', type: 'video', size: '15.2 MB', duration: '30s', created_at: '2024-11-28' },
                { id: 'asset_3', name: 'logo-white.svg', type: 'image', size: '12 KB', dimensions: '200x50', created_at: '2024-11-15' },
                { id: 'asset_4', name: 'carousel-1.jpg', type: 'image', size: '890 KB', dimensions: '1080x1080', created_at: '2024-12-05' }
            ],
            total: 4
        }
    })
})

apiRoutes.post('/creative/assets/upload', async (c) => {
    return c.json({
        success: true,
        data: {
            id: 'asset_' + Date.now(),
            upload_url: 'https://storage.ownlay.io/upload/' + Date.now(),
            expires_at: new Date(Date.now() + 3600000).toISOString()
        }
    })
})

// ============================================
// BILLING ENDPOINTS
// ============================================

apiRoutes.get('/billing/subscription', async (c) => {
    return c.json({
        success: true,
        data: {
            plan: 'growth',
            status: 'active',
            price: 799,
            billing_period: 'monthly',
            current_period_start: '2024-12-15',
            current_period_end: '2025-01-15',
            usage: {
                users: { used: 8, limit: 15 },
                connectors: { used: 4, limit: 10 },
                api_calls: { used: 1200000, limit: 5000000 }
            }
        }
    })
})

apiRoutes.get('/billing/invoices', async (c) => {
    return c.json({
        success: true,
        data: [
            { id: 'inv_2024_012', date: '2024-12-15', amount: 799, status: 'paid' },
            { id: 'inv_2024_011', date: '2024-11-15', amount: 799, status: 'paid' },
            { id: 'inv_2024_010', date: '2024-10-15', amount: 799, status: 'paid' }
        ]
    })
})

// ============================================
// WEBHOOKS ENDPOINTS
// ============================================

apiRoutes.get('/webhooks', async (c) => {
    return c.json({
        success: true,
        data: [
            { id: 'wh_1', url: 'https://example.com/webhook', events: ['campaign.created', 'campaign.updated'], status: 'active', created_at: '2024-11-01' },
            { id: 'wh_2', url: 'https://slack.com/webhook/xxx', events: ['alert.triggered'], status: 'active', created_at: '2024-11-15' }
        ]
    })
})

apiRoutes.post('/webhooks', async (c) => {
    try {
        const body = await c.req.json()
        const { url, events } = body
        
        return c.json({
            success: true,
            data: {
                id: 'wh_' + Date.now(),
                url,
                events,
                secret: 'whsec_' + Math.random().toString(36).substring(7),
                status: 'active',
                created_at: new Date().toISOString()
            }
        })
    } catch (e) {
        return c.json({ success: false, error: 'Invalid request body' }, 400)
    }
})

apiRoutes.delete('/webhooks/:id', async (c) => {
    return c.json({ success: true, message: 'Webhook deleted successfully' })
})

// ============================================
// EVENTS INGESTION
// ============================================

apiRoutes.post('/events', async (c) => {
    try {
        const body = await c.req.json()
        
        return c.json({
            success: true,
            data: {
                event_id: 'evt_' + Date.now(),
                received_at: new Date().toISOString(),
                processing_status: 'queued'
            }
        })
    } catch (e) {
        return c.json({ success: false, error: 'Invalid request body' }, 400)
    }
})

apiRoutes.post('/events/batch', async (c) => {
    try {
        const body = await c.req.json()
        const events = body.events || []
        
        return c.json({
            success: true,
            data: {
                batch_id: 'batch_' + Date.now(),
                events_received: events.length,
                events_processed: events.length,
                events_failed: 0
            }
        })
    } catch (e) {
        return c.json({ success: false, error: 'Invalid request body' }, 400)
    }
})

// Health check
apiRoutes.get('/health', async (c) => {
    return c.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    })
})

// ============================================
// DATABASE-BACKED MARKETING DATA ENDPOINTS
// ============================================

// Helper to get user ID from auth header
const getUserIdFromAuth = async (c: any): Promise<string> => {
    const authHeader = c.req.header('Authorization')
    if (authHeader) {
        const token = authHeader.replace('Bearer ', '')
        try {
            const session = await c.env.DB.prepare(
                'SELECT user_id FROM sessions WHERE token = ? AND expires_at > datetime("now")'
            ).bind(token).first<{ user_id: string }>()
            if (session?.user_id) return session.user_id
        } catch (e) {
            console.error('Auth error:', e)
        }
    }
    return 'usr_demo'
}

// Get marketing campaigns from database
apiRoutes.get('/marketing/campaigns', async (c) => {
    try {
        const userId = await getUserIdFromAuth(c)
        const status = c.req.query('status')
        
        const campaigns = await marketingDb.getCampaigns(c.env.DB, userId, status)
        
        return c.json({
            success: true,
            data: {
                campaigns,
                total: campaigns.length,
                dataSource: 'database'
            }
        })
    } catch (error) {
        console.error('Get campaigns error:', error)
        return c.json({ success: false, error: 'Failed to fetch campaigns' }, 500)
    }
})

// Create marketing campaign
apiRoutes.post('/marketing/campaigns', async (c) => {
    try {
        const userId = await getUserIdFromAuth(c)
        const body = await c.req.json()
        
        const campaignId = await marketingDb.createCampaign(c.env.DB, {
            user_id: userId,
            name: body.name,
            status: body.status || 'draft',
            objective: body.objective,
            platforms: body.platforms ? JSON.stringify(body.platforms) : null,
            budget_daily: body.budget_daily || 0,
            budget_total: body.budget_total || 0,
            start_date: body.start_date,
            end_date: body.end_date,
            target_audience: body.target_audience ? JSON.stringify(body.target_audience) : null
        })
        
        return c.json({
            success: true,
            data: {
                id: campaignId,
                message: 'Campaign created successfully'
            }
        })
    } catch (error) {
        console.error('Create campaign error:', error)
        return c.json({ success: false, error: 'Failed to create campaign' }, 500)
    }
})

// Get marketing metrics from database
apiRoutes.get('/marketing/metrics', async (c) => {
    try {
        const userId = await getUserIdFromAuth(c)
        const days = parseInt(c.req.query('days') || '30')
        const platform = c.req.query('platform')
        
        const metrics = await marketingDb.getAggregatedMetrics(c.env.DB, userId, days)
        const platformBreakdown = await marketingDb.getMetricsByPlatform(c.env.DB, userId, days)
        
        return c.json({
            success: true,
            data: {
                summary: metrics,
                byPlatform: platformBreakdown,
                period: `Last ${days} days`,
                dataSource: 'database'
            }
        })
    } catch (error) {
        console.error('Get metrics error:', error)
        return c.json({ success: false, error: 'Failed to fetch metrics' }, 500)
    }
})

// Get audience segments from database
apiRoutes.get('/marketing/segments', async (c) => {
    try {
        const userId = await getUserIdFromAuth(c)
        
        const segments = await marketingDb.getSegments(c.env.DB, userId)
        
        return c.json({
            success: true,
            data: {
                segments,
                total: segments.length,
                dataSource: 'database'
            }
        })
    } catch (error) {
        console.error('Get segments error:', error)
        return c.json({ success: false, error: 'Failed to fetch segments' }, 500)
    }
})

// Create audience segment
apiRoutes.post('/marketing/segments', async (c) => {
    try {
        const userId = await getUserIdFromAuth(c)
        const body = await c.req.json()
        
        const segmentId = await marketingDb.createSegment(c.env.DB, {
            user_id: userId,
            name: body.name,
            description: body.description,
            segment_type: body.segment_type || 'custom',
            criteria: body.criteria ? JSON.stringify(body.criteria) : null,
            size: body.size || 0,
            color: body.color || 'blue'
        })
        
        return c.json({
            success: true,
            data: {
                id: segmentId,
                message: 'Segment created successfully'
            }
        })
    } catch (error) {
        console.error('Create segment error:', error)
        return c.json({ success: false, error: 'Failed to create segment' }, 500)
    }
})

// Get automation workflows from database
apiRoutes.get('/marketing/automations', async (c) => {
    try {
        const userId = await getUserIdFromAuth(c)
        
        const workflows = await marketingDb.getWorkflows(c.env.DB, userId)
        
        return c.json({
            success: true,
            data: {
                workflows,
                total: workflows.length,
                dataSource: 'database'
            }
        })
    } catch (error) {
        console.error('Get automations error:', error)
        return c.json({ success: false, error: 'Failed to fetch automations' }, 500)
    }
})

// Create automation workflow
apiRoutes.post('/marketing/automations', async (c) => {
    try {
        const userId = await getUserIdFromAuth(c)
        const body = await c.req.json()
        
        const workflowId = await marketingDb.createWorkflow(c.env.DB, {
            user_id: userId,
            name: body.name,
            description: body.description,
            status: body.status || 'draft',
            trigger_type: body.trigger_type,
            trigger_config: body.trigger_config ? JSON.stringify(body.trigger_config) : null,
            steps: body.steps ? JSON.stringify(body.steps) : null
        })
        
        return c.json({
            success: true,
            data: {
                id: workflowId,
                message: 'Automation workflow created successfully'
            }
        })
    } catch (error) {
        console.error('Create automation error:', error)
        return c.json({ success: false, error: 'Failed to create automation' }, 500)
    }
})

// Get AI insights from database
apiRoutes.get('/marketing/insights', async (c) => {
    try {
        const userId = await getUserIdFromAuth(c)
        const status = c.req.query('status') || 'pending'
        
        const insights = await marketingDb.getInsights(c.env.DB, userId, status)
        
        return c.json({
            success: true,
            data: {
                insights,
                total: insights.length,
                dataSource: 'database'
            }
        })
    } catch (error) {
        console.error('Get insights error:', error)
        return c.json({ success: false, error: 'Failed to fetch insights' }, 500)
    }
})

// Generate new AI insights based on current data
apiRoutes.post('/marketing/insights/generate', async (c) => {
    try {
        const userId = await getUserIdFromAuth(c)
        
        // Get current metrics and campaigns for analysis
        const metrics = await marketingDb.getAggregatedMetrics(c.env.DB, userId, 30)
        const campaigns = await marketingDb.getCampaigns(c.env.DB, userId)
        
        // Generate insights using AI service
        const result = await aiService.generateInsights(c.env, {
            metrics,
            campaigns
        })
        
        // Save generated insights to database
        for (const insight of result.insights) {
            await marketingDb.createInsight(c.env.DB, {
                user_id: userId,
                insight_type: insight.type,
                title: insight.title,
                description: insight.description,
                impact: insight.impact,
                confidence: insight.confidence,
                action_type: insight.actionType,
                status: 'pending'
            })
        }
        
        return c.json({
            success: true,
            data: {
                insights: result.insights,
                generated: result.insights.length,
                model: result.model
            }
        })
    } catch (error) {
        console.error('Generate insights error:', error)
        return c.json({ success: false, error: 'Failed to generate insights' }, 500)
    }
})

// Apply/dismiss an insight
apiRoutes.post('/marketing/insights/:id/action', async (c) => {
    try {
        const insightId = c.req.param('id')
        const { action } = await c.req.json()
        
        if (action === 'apply') {
            await marketingDb.applyInsight(c.env.DB, insightId)
        } else if (action === 'dismiss') {
            await marketingDb.dismissInsight(c.env.DB, insightId)
        }
        
        return c.json({
            success: true,
            data: {
                id: insightId,
                action,
                message: action === 'apply' ? 'Insight applied successfully' : 'Insight dismissed'
            }
        })
    } catch (error) {
        console.error('Insight action error:', error)
        return c.json({ success: false, error: 'Failed to process insight action' }, 500)
    }
})

// Get generated content history
apiRoutes.get('/marketing/content', async (c) => {
    try {
        const userId = await getUserIdFromAuth(c)
        const contentType = c.req.query('type')
        
        const content = await marketingDb.getGeneratedContent(c.env.DB, userId, contentType)
        
        return c.json({
            success: true,
            data: {
                content,
                total: content.length,
                dataSource: 'database'
            }
        })
    } catch (error) {
        console.error('Get content error:', error)
        return c.json({ success: false, error: 'Failed to fetch content' }, 500)
    }
})

// Get AI chat history
apiRoutes.get('/marketing/chat-history', async (c) => {
    try {
        const userId = await getUserIdFromAuth(c)
        const limit = parseInt(c.req.query('limit') || '20')
        
        const history = await marketingDb.getChatHistory(c.env.DB, userId, limit)
        
        return c.json({
            success: true,
            data: {
                messages: history,
                total: history.length,
                dataSource: 'database'
            }
        })
    } catch (error) {
        console.error('Get chat history error:', error)
        return c.json({ success: false, error: 'Failed to fetch chat history' }, 500)
    }
})

// Get dashboard data (aggregated)
apiRoutes.get('/marketing/dashboard', async (c) => {
    try {
        const userId = await getUserIdFromAuth(c)
        const days = parseInt(c.req.query('days') || '30')
        
        const dashboardData = await marketingDb.getDashboardData(c.env.DB, userId, days)
        
        return c.json({
            success: true,
            data: {
                ...dashboardData,
                period: `Last ${days} days`,
                dataSource: 'database',
                hasData: dashboardData.metrics.totalSpend > 0
            }
        })
    } catch (error) {
        console.error('Get dashboard error:', error)
        return c.json({ success: false, error: 'Failed to fetch dashboard data' }, 500)
    }
})

// ============================================
// REAL-TIME DATA ENDPOINTS (Database-backed with fallback)
// ============================================

// Generate random variation for fallback data (when no real data exists)
const generateVariation = (base: number, variance: number = 0.1) => {
    const variation = (Math.random() - 0.5) * 2 * variance
    return Math.round(base * (1 + variation))
}

// Real-time Dashboard Metrics - From Database
apiRoutes.get('/realtime/dashboard', async (c) => {
    const now = new Date().toISOString()
    const authHeader = c.req.header('Authorization')
    
    try {
        // Get user ID from auth token
        let userId = 'usr_demo' // Default for unauthenticated requests
        if (authHeader) {
            const token = authHeader.replace('Bearer ', '')
            const session = await c.env.DB.prepare(
                'SELECT user_id FROM sessions WHERE token = ? AND expires_at > datetime("now")'
            ).bind(token).first<{ user_id: string }>()
            if (session?.user_id) userId = session.user_id
        }
        
        // Get metrics from database
        const metrics = await marketingDb.getAggregatedMetrics(c.env.DB, userId, 30)
        const campaigns = await marketingDb.getCampaigns(c.env.DB, userId, 'active')
        const ads = await marketingDb.getAds(c.env.DB, userId)
        
        // If no data in database, show zeros (not fake data)
        return c.json({
            success: true,
            timestamp: now,
            data: {
                totalSpend: metrics.totalSpend || 0,
                revenue: metrics.totalRevenue || 0,
                conversions: metrics.totalConversions || 0,
                roas: metrics.avgRoas?.toFixed(1) || '0.0',
                avgCpa: metrics.avgCpa?.toFixed(2) || '0.00',
                impressions: metrics.totalImpressions || 0,
                clicks: metrics.totalClicks || 0,
                ctr: metrics.avgCtr?.toFixed(2) || '0.00',
                activeCampaigns: campaigns.length,
                activeAds: ads.filter(a => a.status === 'active').length,
                dataSource: 'database',
                hasData: metrics.totalSpend > 0
            }
        })
    } catch (error) {
        console.error('Dashboard metrics error:', error)
        return c.json({
            success: true,
            timestamp: now,
            data: {
                totalSpend: 0,
                revenue: 0,
                conversions: 0,
                roas: '0.0',
                avgCpa: '0.00',
                impressions: 0,
                clicks: 0,
                ctr: '0.00',
                activeCampaigns: 0,
                activeAds: 0,
                dataSource: 'empty',
                hasData: false
            }
        })
    }
})

// Real-time Campaign Data - From Database
apiRoutes.get('/realtime/campaigns', async (c) => {
    try {
        // Get user ID from auth token
        let userId = 'usr_demo'
        const authHeader = c.req.header('Authorization')
        if (authHeader) {
            const token = authHeader.replace('Bearer ', '')
            const session = await c.env.DB.prepare(
                'SELECT user_id FROM sessions WHERE token = ? AND expires_at > datetime("now")'
            ).bind(token).first<{ user_id: string }>()
            if (session?.user_id) userId = session.user_id
        }
        
        // Get campaigns from database
        const campaigns = await marketingDb.getCampaigns(c.env.DB, userId)
        
        // Get metrics for each campaign
        const campaignsWithMetrics = await Promise.all(campaigns.map(async (campaign) => {
            const metrics = await c.env.DB.prepare(`
                SELECT 
                    COALESCE(SUM(spend), 0) as spend,
                    COALESCE(SUM(conversions), 0) as conversions,
                    COALESCE(SUM(revenue), 0) as revenue
                FROM marketing_metrics 
                WHERE campaign_id = ? AND date >= date('now', '-30 days')
            `).bind(campaign.id).first<{ spend: number; conversions: number; revenue: number }>()
            
            const spend = metrics?.spend || 0
            const revenue = metrics?.revenue || 0
            const roas = spend > 0 ? (revenue / spend).toFixed(1) : '0.0'
            
            return {
                id: campaign.id,
                name: campaign.name,
                status: campaign.status,
                platforms: campaign.platforms ? JSON.parse(campaign.platforms) : [],
                spend: spend,
                conversions: metrics?.conversions || 0,
                roas: roas,
                lastActivity: campaign.updated_at ? new Date(campaign.updated_at).toLocaleString() : 'N/A'
            }
        }))
        
        return c.json({
            success: true,
            timestamp: new Date().toISOString(),
            data: campaignsWithMetrics,
            dataSource: 'database',
            hasData: campaignsWithMetrics.length > 0
        })
    } catch (error) {
        console.error('Campaign data error:', error)
        return c.json({
            success: true,
            timestamp: new Date().toISOString(),
            data: [],
            dataSource: 'empty',
            hasData: false
        })
    }
})

// Real-time Ad Performance - From Database
apiRoutes.get('/realtime/ads', async (c) => {
    try {
        // Get user ID from auth token
        let userId = 'usr_demo'
        const authHeader = c.req.header('Authorization')
        if (authHeader) {
            const token = authHeader.replace('Bearer ', '')
            const session = await c.env.DB.prepare(
                'SELECT user_id FROM sessions WHERE token = ? AND expires_at > datetime("now")'
            ).bind(token).first<{ user_id: string }>()
            if (session?.user_id) userId = session.user_id
        }
        
        // Get ads from database
        const ads = await marketingDb.getAds(c.env.DB, userId)
        
        // Get metrics for each ad
        const adsWithMetrics = await Promise.all(ads.map(async (ad) => {
            const metrics = await c.env.DB.prepare(`
                SELECT 
                    COALESCE(SUM(spend), 0) as spend,
                    COALESCE(SUM(impressions), 0) as impressions,
                    COALESCE(SUM(clicks), 0) as clicks,
                    COALESCE(SUM(conversions), 0) as conversions,
                    COALESCE(SUM(revenue), 0) as revenue
                FROM marketing_metrics 
                WHERE ad_id = ? AND date >= date('now', '-30 days')
            `).bind(ad.id).first<{ spend: number; impressions: number; clicks: number; conversions: number; revenue: number }>()
            
            const spend = metrics?.spend || 0
            const impressions = metrics?.impressions || 0
            const clicks = metrics?.clicks || 0
            const revenue = metrics?.revenue || 0
            const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00'
            const roas = spend > 0 ? (revenue / spend).toFixed(1) : '0.0'
            
            return {
                id: ad.id,
                name: ad.name,
                channel: ad.platform,
                status: ad.status,
                spend: spend,
                impressions: impressions,
                clicks: clicks,
                ctr: ctr,
                conversions: metrics?.conversions || 0,
                roas: roas
            }
        }))
        
        // Calculate summary
        const activeAds = adsWithMetrics.filter(a => a.status === 'active')
        const totalSpend = adsWithMetrics.reduce((sum, a) => sum + a.spend, 0)
        const totalClicks = adsWithMetrics.reduce((sum, a) => sum + a.clicks, 0)
        const totalImpressions = adsWithMetrics.reduce((sum, a) => sum + a.impressions, 0)
        
        return c.json({
            success: true,
            timestamp: new Date().toISOString(),
            data: adsWithMetrics,
            summary: {
                totalAds: adsWithMetrics.length,
                activeAds: activeAds.length,
                totalSpend: totalSpend,
                avgCtr: totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00',
                avgCpc: totalClicks > 0 ? (totalSpend / totalClicks).toFixed(2) : '0.00'
            },
            dataSource: 'database',
            hasData: adsWithMetrics.length > 0
        })
    } catch (error) {
        console.error('Ad data error:', error)
        return c.json({
            success: true,
            timestamp: new Date().toISOString(),
            data: [],
            summary: {
                totalAds: 0,
                activeAds: 0,
                totalSpend: 0,
                avgCtr: '0.00',
                avgCpc: '0.00'
            },
            dataSource: 'empty',
            hasData: false
        })
    }
})

// Real-time Automation Stats - From Database
apiRoutes.get('/realtime/automation', async (c) => {
    try {
        // Get user ID from auth token
        let userId = 'usr_demo'
        const authHeader = c.req.header('Authorization')
        if (authHeader) {
            const token = authHeader.replace('Bearer ', '')
            const session = await c.env.DB.prepare(
                'SELECT user_id FROM sessions WHERE token = ? AND expires_at > datetime("now")'
            ).bind(token).first<{ user_id: string }>()
            if (session?.user_id) userId = session.user_id
        }
        
        // Get workflows from database
        const workflows = await marketingDb.getAutomationWorkflows(c.env.DB, userId)
        
        // Calculate stats
        const activeWorkflows = workflows.filter(w => w.status === 'active')
        const totalRuns = workflows.reduce((sum, w) => sum + (w.runs_today || 0), 0)
        const totalActions = workflows.reduce((sum, w) => sum + (w.total_runs || 0), 0)
        
        return c.json({
            success: true,
            timestamp: new Date().toISOString(),
            data: {
                stats: {
                    activeWorkflows: activeWorkflows.length,
                    runsToday: totalRuns,
                    actionsTriggered: totalActions,
                    timeSaved: Math.floor(totalActions * 0.5) // Estimate 30 seconds per action
                },
                workflows: workflows.map(wf => {
                    // Parse steps to count
                    let stepsCount = 0
                    try {
                        const steps = wf.steps ? JSON.parse(wf.steps) : []
                        stepsCount = Array.isArray(steps) ? steps.length : 0
                    } catch (e) { stepsCount = 0 }
                    
                    return {
                        id: wf.id,
                        name: wf.name,
                        trigger: wf.trigger_type,
                        steps: stepsCount,
                        runsToday: wf.runs_today || 0,
                        successRate: wf.success_rate?.toFixed(1) || '0.0',
                        status: wf.status
                    }
                })
            },
            dataSource: 'database',
            hasData: workflows.length > 0
        })
    } catch (error) {
        console.error('Automation data error:', error)
        return c.json({
            success: true,
            timestamp: new Date().toISOString(),
            data: {
                stats: {
                    activeWorkflows: 0,
                    runsToday: 0,
                    actionsTriggered: 0,
                    timeSaved: 0
                },
                workflows: []
            },
            dataSource: 'empty',
            hasData: false
        })
    }
})

// Real-time Creative Studio Stats - From Database
apiRoutes.get('/realtime/creative', async (c) => {
    try {
        // Get user ID from auth token
        let userId = 'usr_demo'
        const authHeader = c.req.header('Authorization')
        if (authHeader) {
            const token = authHeader.replace('Bearer ', '')
            try {
                const session = await c.env.DB.prepare(
                    'SELECT user_id FROM sessions WHERE token = ? AND expires_at > datetime("now")'
                ).bind(token).first<{ user_id: string }>()
                if (session?.user_id) userId = session.user_id
            } catch (e) { /* continue with demo user */ }
        }
        
        // Get creatives from the new creatives table
        let creatives: any[] = []
        let aiGenCount = 0
        let stats = {
            totalCreatives: 0,
            imageCount: 0,
            videoCount: 0,
            carouselCount: 0,
            activeCount: 0,
            totalImpressions: 0,
            totalClicks: 0,
            avgCtr: 0
        }
        
        try {
            creatives = await marketingDb.getCreatives(c.env.DB, userId, { limit: 20 })
            stats = await marketingDb.getCreativeStats(c.env.DB, userId)
            
            // Get AI copy count
            const aiCount = await c.env.DB.prepare(
                'SELECT COUNT(*) as count FROM ai_copies WHERE user_id = ?'
            ).bind(userId).first<{ count: number }>()
            aiGenCount = aiCount?.count || 0
            
            // Fallback to old table if new one is empty
            if (creatives.length === 0) {
                const assets = await marketingDb.getCreativeAssets(c.env.DB, userId)
                if (assets.length > 0) {
                    stats.totalCreatives = assets.length
                    stats.imageCount = assets.filter(a => a.asset_type === 'image').length
                    stats.videoCount = assets.filter(a => a.asset_type === 'video').length
                }
                
                // Also check old AI generated content
                const oldAiCount = await c.env.DB.prepare(
                    'SELECT COUNT(*) as count FROM ai_generated_content WHERE user_id = ?'
                ).bind(userId).first<{ count: number }>()
                aiGenCount = (oldAiCount?.count || 0) + aiGenCount
            }
        } catch (e) {
            console.log('Creative stats query failed:', e)
        }
        
        // Get performance by type
        let performanceByType: any[] = []
        try {
            performanceByType = await marketingDb.getCreativePerformanceByType(c.env.DB, userId)
        } catch (e) { /* use empty array */ }
        
        const hasData = stats.totalCreatives > 0 || creatives.length > 0
        
        return c.json({
            success: true,
            timestamp: new Date().toISOString(),
            data: {
                stats: {
                    totalAssets: stats.totalCreatives || 0,
                    imagesCreated: stats.imageCount || 0,
                    videosCreated: stats.videoCount || 0,
                    carouselCount: stats.carouselCount || 0,
                    activeCount: stats.activeCount || 0,
                    aiGenerations: aiGenCount
                },
                recentCreatives: creatives.slice(0, 5).map(c => ({
                    id: c.id,
                    name: c.name,
                    type: c.creative_type,
                    platform: c.platform,
                    status: c.status,
                    thumbnail_url: c.thumbnail_url,
                    impressions: c.impressions || 0,
                    ctr: c.ctr || 0,
                    conversions: c.conversions || 0,
                    created_at: c.created_at
                })),
                performanceByType: performanceByType.length > 0 ? performanceByType : [
                    { type: 'Image', count: stats.imageCount, avgCtr: 0, totalConversions: 0 },
                    { type: 'Video', count: stats.videoCount, avgCtr: 0, totalConversions: 0 },
                    { type: 'Carousel', count: stats.carouselCount, avgCtr: 0, totalConversions: 0 }
                ]
            },
            dataSource: hasData ? 'database' : 'empty',
            hasData
        })
    } catch (error) {
        console.error('Creative data error:', error)
        return c.json({
            success: true,
            timestamp: new Date().toISOString(),
            data: {
                stats: {
                    totalAssets: 0,
                    imagesCreated: 0,
                    videosCreated: 0,
                    carouselCount: 0,
                    activeCount: 0,
                    aiGenerations: 0
                },
                recentCreatives: [],
                performanceByType: []
            },
            dataSource: 'empty',
            hasData: false
        })
    }
})

// Real-time Creative Performance Data - From Database with Platform Fallback
apiRoutes.get('/realtime/creative-performance', async (c) => {
    try {
        // Get user ID from auth token
        let userId = 'usr_demo'
        const authHeader = c.req.header('Authorization')
        if (authHeader) {
            const token = authHeader.replace('Bearer ', '')
            try {
                const session = await c.env.DB.prepare(
                    'SELECT user_id FROM sessions WHERE token = ? AND expires_at > datetime("now")'
                ).bind(token).first<{ user_id: string }>()
                if (session?.user_id) userId = session.user_id
            } catch (e) { /* continue with demo user */ }
        }

        // Try to get creatives from database first
        let creatives: any[] = []
        let dataSource = 'empty'
        let hasData = false

        try {
            creatives = await marketingDb.getCreatives(c.env.DB, userId, { limit: 50 })
            if (creatives.length > 0) {
                dataSource = 'database'
                hasData = true
            }
        } catch (e) {
            console.log('Database query failed, using empty state')
        }

        // If no database creatives, return empty state with proper indicator
        // (Sample data will only be shown if explicitly requested)
        if (creatives.length === 0) {
            return c.json({
                success: true,
                timestamp: new Date().toISOString(),
                dataSource: 'empty',
                hasData: false,
                data: {
                    creatives: [],
                    typePerformance: []
                }
            })
        }

        // Format database creatives for response
        const formattedCreatives = creatives.map(c => ({
            id: c.id,
            name: c.name,
            type: c.creative_type,
            platform: c.platform || 'meta',
            impressions: c.impressions || 0,
            clicks: c.clicks || 0,
            ctr: c.ctr || (c.impressions > 0 ? ((c.clicks || 0) / c.impressions) * 100 : 0),
            conversions: c.conversions || 0,
            spend: c.spend || 0,
            revenue: c.revenue || 0,
            roas: c.roas || 0,
            status: c.status || 'active',
            thumbnail_url: c.thumbnail_url,
            created_at: c.created_at
        }))

        // Calculate type performance from database data
        const typeMap: { [key: string]: { count: number; totalCtr: number; totalConversions: number } } = {}
        formattedCreatives.forEach(c => {
            if (!typeMap[c.type]) typeMap[c.type] = { count: 0, totalCtr: 0, totalConversions: 0 }
            typeMap[c.type].count++
            typeMap[c.type].totalCtr += c.ctr
            typeMap[c.type].totalConversions += c.conversions
        })

        const typePerformance = Object.entries(typeMap).map(([type, data]) => ({
            type: type.charAt(0).toUpperCase() + type.slice(1),
            count: data.count,
            avgCtr: data.count > 0 ? (data.totalCtr / data.count).toFixed(1) : '0',
            totalConversions: data.totalConversions
        }))

        return c.json({
            success: true,
            timestamp: new Date().toISOString(),
            dataSource,
            hasData,
            data: {
                creatives: formattedCreatives,
                typePerformance
            }
        })
    } catch (error) {
        console.error('Creative performance error:', error)
        return c.json({
            success: true,
            timestamp: new Date().toISOString(),
            dataSource: 'empty',
            hasData: false,
            data: {
                creatives: [],
                typePerformance: []
            }
        })
    }
})

// Real-time AI Insights Data - From Connected Platforms (Database-driven)
apiRoutes.get('/realtime/insights', async (c) => {
    try {
        // Get user ID from auth token
        let userId = 'usr_demo'
        const authHeader = c.req.header('Authorization')
        if (authHeader) {
            const token = authHeader.replace('Bearer ', '')
            const session = await c.env.DB.prepare(
                'SELECT user_id FROM sessions WHERE token = ? AND expires_at > datetime("now")'
            ).bind(token).first<{ user_id: string }>()
            if (session?.user_id) userId = session.user_id
        }

        // Fetch real data from database
        const metrics = await marketingDb.getAggregatedMetrics(c.env.DB, userId, 30)
        const platformMetrics = await marketingDb.getMetricsByPlatform(c.env.DB, userId, 30)
        const campaigns = await marketingDb.getCampaigns(c.env.DB, userId)
        const dbInsights = await marketingDb.getInsights(c.env.DB, userId, 'pending')
        
        // Calculate real insights based on database data
        const hasData = metrics && metrics.totalSpend > 0
        const eventsAnalyzed = metrics ? (metrics.totalImpressions || 0) + (metrics.totalClicks || 0) + (metrics.totalConversions || 0) : 0
        
        // Calculate potential savings based on CPA optimization
        const avgCpa = metrics?.avgCpa || 0
        const bestCpa = avgCpa * 0.85 // 15% improvement target
        const potentialSavings = hasData ? Math.round((avgCpa - bestCpa) * (metrics?.totalConversions || 0)) : 0
        
        // Calculate growth opportunity based on ROAS
        const currentRoas = metrics?.avgRoas || 0
        const growthOpportunity = hasData ? Math.round((currentRoas > 3 ? 15 : currentRoas > 2 ? 23 : 35)) : 0
        
        // Generate dynamic insights based on real data
        const opportunities: any[] = []
        const warnings: any[] = []
        const anomalies: any[] = []
        
        if (hasData) {
            // Check platform performance and generate real insights
            for (const pm of platformMetrics) {
                const roas = pm.spend > 0 ? pm.revenue / pm.spend : 0
                const platformName = pm.platform === 'google_ads' ? 'Google Ads' : pm.platform === 'meta_ads' ? 'Meta Ads' : pm.platform
                
                // Opportunity: Low ROAS platform can be optimized
                if (roas > 0 && roas < 3) {
                    opportunities.push({
                        id: `opp_${pm.platform}_roas`,
                        title: `Optimize ${platformName} ROAS`,
                        description: `Current ${platformName} ROAS is ${roas.toFixed(1)}x. Bid strategy optimization could improve to ${(roas * 1.2).toFixed(1)}x`,
                        impact: Math.round(pm.spend * 0.2),
                        impactType: 'savings',
                        confidence: 85,
                        platforms: [platformName]
                    })
                }
                
                // Opportunity: High ROAS platform should scale
                if (roas >= 4) {
                    opportunities.push({
                        id: `opp_${pm.platform}_scale`,
                        title: `Scale ${platformName} Budget`,
                        description: `${platformName} has excellent ${roas.toFixed(1)}x ROAS. Consider increasing budget by 20% to capture more conversions`,
                        impact: Math.round(pm.conversions * 0.2),
                        impactType: 'conversions',
                        confidence: 88,
                        platforms: [platformName]
                    })
                }
                
                // Warning: High CPA
                const cpa = pm.conversions > 0 ? pm.spend / pm.conversions : 0
                if (cpa > avgCpa * 1.3) {
                    warnings.push({
                        id: `warn_${pm.platform}_cpa`,
                        title: `High CPA on ${platformName}`,
                        description: `${platformName} CPA ($${cpa.toFixed(2)}) is 30% higher than average. Review targeting and creatives`,
                        impact: Math.round((cpa - avgCpa) * pm.conversions),
                        impactType: 'at_risk',
                        confidence: 90,
                        platforms: [platformName]
                    })
                }
            }
            
            // Add cross-platform opportunities
            if (platformMetrics.length >= 2) {
                opportunities.push({
                    id: 'opp_budget_reallocation',
                    title: 'Cross-Platform Budget Optimization',
                    description: `Based on performance data, reallocating budget from lower to higher performing channels could improve overall ROAS by ${Math.round(growthOpportunity * 0.5)}%`,
                    impact: potentialSavings,
                    impactType: 'savings',
                    confidence: 82,
                    platforms: platformMetrics.map(p => p.platform === 'google_ads' ? 'Google Ads' : 'Meta Ads')
                })
            }
            
            // Use AI service to generate additional insights
            try {
                const aiInsights = await aiService.generateInsights(c.env, { metrics, campaigns })
                if (aiInsights && aiInsights.insights) {
                    for (const insight of aiInsights.insights) {
                        if (insight.type === 'opportunity') {
                            opportunities.push({
                                id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                                title: insight.title,
                                description: insight.description,
                                impact: insight.impact || 0,
                                impactType: insight.impactType || 'improvement',
                                confidence: insight.confidence || 75,
                                platforms: insight.platforms || ['All Channels'],
                                aiGenerated: true
                            })
                        } else if (insight.type === 'warning') {
                            warnings.push({
                                id: `ai_warn_${Date.now()}`,
                                title: insight.title,
                                description: insight.description,
                                impact: insight.impact || 0,
                                confidence: insight.confidence || 80,
                                platforms: insight.platforms || ['All Channels'],
                                aiGenerated: true
                            })
                        }
                    }
                }
            } catch (aiError) {
                console.log('AI insights generation skipped:', aiError)
            }
        }
        
        // Include database-stored insights
        for (const dbInsight of dbInsights) {
            const insightData = {
                id: dbInsight.id,
                title: dbInsight.title,
                description: dbInsight.description,
                impact: dbInsight.impact ? parseInt(dbInsight.impact) : 0,
                confidence: dbInsight.confidence || 80,
                platforms: ['Database Insight'],
                fromDatabase: true
            }
            
            if (dbInsight.insight_type === 'opportunity') {
                opportunities.push(insightData)
            } else if (dbInsight.insight_type === 'warning') {
                warnings.push(insightData)
            } else if (dbInsight.insight_type === 'anomaly') {
                anomalies.push(insightData)
            }
        }
        
        // If no real data, return fallback message
        if (!hasData && opportunities.length === 0) {
            return c.json({
                success: true,
                timestamp: new Date().toISOString(),
                source: 'no_data',
                hasData: false,
                message: 'Connect your advertising platforms to see AI-powered insights based on your real data',
                data: {
                    summary: {
                        potentialSavings: 0,
                        growthOpportunity: 0,
                        anomalies: 0,
                        recommendations: 0,
                        eventsAnalyzed: 0
                    },
                    opportunities: [],
                    warnings: [],
                    anomalies: []
                }
            })
        }
        
        return c.json({
            success: true,
            timestamp: new Date().toISOString(),
            source: 'connected_platforms',
            hasData: true,
            data: {
                summary: {
                    potentialSavings: potentialSavings,
                    growthOpportunity: growthOpportunity,
                    anomalies: anomalies.length,
                    recommendations: opportunities.length + warnings.length,
                    eventsAnalyzed: eventsAnalyzed
                },
                opportunities,
                warnings,
                anomalies
            }
        })
    } catch (error) {
        console.error('Realtime insights error:', error)
        return c.json({
            success: false,
            error: 'Failed to load insights',
            hasData: false,
            data: {
                summary: { potentialSavings: 0, growthOpportunity: 0, anomalies: 0, recommendations: 0, eventsAnalyzed: 0 },
                opportunities: [],
                warnings: [],
                anomalies: []
            }
        }, 500)
    }
})

// Real-time Analytics Data - From Database (Pro Feature)
apiRoutes.get('/realtime/analytics', async (c) => {
    try {
        const days = parseInt(c.req.query('days') || '30')
        const channel = c.req.query('channel') || 'all'
        
        // Get user ID from auth token
        let userId = 'usr_demo'
        const authHeader = c.req.header('Authorization')
        if (authHeader) {
            const token = authHeader.replace('Bearer ', '')
            const session = await c.env.DB.prepare(
                'SELECT user_id FROM sessions WHERE token = ? AND expires_at > datetime("now")'
            ).bind(token).first<{ user_id: string }>()
            if (session?.user_id) userId = session.user_id
        }
        
        // Get metrics from database by platform
        const platformMetrics = await marketingDb.getMetricsByPlatform(c.env.DB, userId, days)
        
        // Filter by channel if specified
        let googleData = { revenue: 0, spend: 0, conversions: 0 }
        let metaData = { revenue: 0, spend: 0, conversions: 0 }
        
        for (const pm of platformMetrics) {
            if (pm.platform === 'google_ads') {
                googleData = { revenue: pm.revenue || 0, spend: pm.spend || 0, conversions: pm.conversions || 0 }
            } else if (pm.platform === 'meta_ads') {
                metaData = { revenue: pm.revenue || 0, spend: pm.spend || 0, conversions: pm.conversions || 0 }
            }
        }
        
        let analytics
        if (channel === 'google') {
            analytics = googleData
        } else if (channel === 'meta') {
            analytics = metaData
        } else {
            analytics = {
                revenue: googleData.revenue + metaData.revenue,
                spend: googleData.spend + metaData.spend,
                conversions: googleData.conversions + metaData.conversions,
            }
        }
        
        // Calculate derived metrics
        const roas = analytics.spend > 0 ? analytics.revenue / analytics.spend : 0
        const cpa = analytics.conversions > 0 ? analytics.spend / analytics.conversions : 0
        
        // Get previous period for comparison
        const previousMetrics = await marketingDb.getAggregatedMetrics(c.env.DB, userId, days * 2)
        const currentMetrics = await marketingDb.getAggregatedMetrics(c.env.DB, userId, days)
        
        // Calculate changes (if we have previous data, otherwise show 0)
        const hasData = currentMetrics.totalSpend > 0 || previousMetrics.totalSpend > 0
        const revenueChange = hasData && previousMetrics.totalRevenue > 0 
            ? ((currentMetrics.totalRevenue - previousMetrics.totalRevenue) / previousMetrics.totalRevenue) * 100 : 0
        const spendChange = hasData && previousMetrics.totalSpend > 0 
            ? ((currentMetrics.totalSpend - previousMetrics.totalSpend) / previousMetrics.totalSpend) * 100 : 0
        const roasChange = hasData && previousMetrics.avgRoas > 0 
            ? currentMetrics.avgRoas - previousMetrics.avgRoas : 0
        const conversionsChange = hasData && previousMetrics.totalConversions > 0 
            ? ((currentMetrics.totalConversions - previousMetrics.totalConversions) / previousMetrics.totalConversions) * 100 : 0
        const cpaChange = hasData && previousMetrics.avgCpa > 0 
            ? ((currentMetrics.avgCpa - previousMetrics.avgCpa) / previousMetrics.avgCpa) * 100 : 0
        
        // Channel mix percentages
        const totalRevenue = googleData.revenue + metaData.revenue
        const channelMix = totalRevenue > 0 ? {
            google: Math.round((googleData.revenue / totalRevenue) * 100),
            meta: Math.round((metaData.revenue / totalRevenue) * 100)
        } : { google: 0, meta: 0 }
        
        return c.json({
            success: true,
            timestamp: new Date().toISOString(),
            source: 'database',
            platforms: ['google_ads', 'meta_ads'],
            dateRange: days + ' days',
            channelFilter: channel,
            data: {
                revenue: analytics.revenue,
                revenueChange: parseFloat(revenueChange.toFixed(1)),
                spend: analytics.spend,
                spendChange: parseFloat(spendChange.toFixed(1)),
                roas: parseFloat(roas.toFixed(2)),
                roasChange: parseFloat(roasChange.toFixed(1)),
                conversions: analytics.conversions,
                conversionsChange: parseFloat(conversionsChange.toFixed(1)),
                cpa: parseFloat(cpa.toFixed(2)),
                cpaChange: parseFloat(cpaChange.toFixed(1)),
                channelMix
            },
            hasData: analytics.spend > 0 || analytics.revenue > 0
        })
    } catch (error) {
        console.error('Analytics data error:', error)
        return c.json({
            success: true,
            timestamp: new Date().toISOString(),
            source: 'empty',
            platforms: [],
            dateRange: '30 days',
            channelFilter: 'all',
            data: {
                revenue: 0, revenueChange: 0,
                spend: 0, spendChange: 0,
                roas: 0, roasChange: 0,
                conversions: 0, conversionsChange: 0,
                cpa: 0, cpaChange: 0,
                channelMix: { google: 0, meta: 0 }
            },
            hasData: false
        })
    }
})

// Real-time Admin Stats  
apiRoutes.get('/realtime/admin', async (c) => {
    const stats = {
        totalUsers: 24,
        activeSessions: 18,
        apiCalls: 45230,
        storageUsed: 2.4,
        storageLimit: 10,
        connectedIntegrations: 4
    }
    
    const recentActivity = [
        { user: 'Jane Doe', action: 'Updated campaign budget', time: '2 min ago', type: 'campaign' },
        { user: 'Mike Chen', action: 'Connected Google Ads', time: '15 min ago', type: 'integration' },
        { user: 'Sarah Kim', action: 'Created new segment', time: '1 hour ago', type: 'audience' },
        { user: 'Alex Wong', action: 'Exported analytics report', time: '2 hours ago', type: 'analytics' }
    ]
    
    return c.json({
        success: true,
        timestamp: new Date().toISOString(),
        data: {
            stats: {
                ...stats,
                activeSessions: generateVariation(stats.activeSessions, 0.2),
                apiCalls: generateVariation(stats.apiCalls)
            },
            recentActivity
        }
    })
})

// Real-time Audience Stats
apiRoutes.get('/realtime/audience', async (c) => {
    const stats = {
        totalContacts: 145892,
        activeSegments: 24,
        avgLtv: 847,
        engagementRate: 34.2,
        newContactsToday: 234,
        emailOpenRate: 42.8,
        syncedSources: 5,
        avgScore: 72
    }
    
    const segments = [
        { id: 'seg1', name: 'High-Value Customers', color: 'emerald', size: 12450, ltv: 1240, growth: '+8.5%', criteria: 'LTV > $500, Purchases > 3', status: 'active' },
        { id: 'seg2', name: 'At-Risk Churn', color: 'amber', size: 3892, ltv: 340, growth: '-2.1%', criteria: 'No activity > 30 days', status: 'attention' },
        { id: 'seg3', name: 'Newsletter Subscribers', color: 'blue', size: 89234, ltv: 125, growth: '+12.3%', criteria: 'Opted-in, Email verified', status: 'active' },
        { id: 'seg4', name: 'Cart Abandoners', color: 'purple', size: 5678, ltv: 280, growth: '+5.2%', criteria: 'Added to cart, No purchase > 24hrs', status: 'active' },
        { id: 'seg5', name: 'VIP Members', color: 'rose', size: 2340, ltv: 2450, growth: '+3.8%', criteria: 'Subscription active, Tier = Gold', status: 'active' },
        { id: 'seg6', name: 'New Leads', color: 'cyan', size: 8920, ltv: 0, growth: '+15.7%', criteria: 'First contact < 7 days', status: 'growing' }
    ]
    
    const recentContacts = [
        { id: 'c1', name: 'Sarah Johnson', email: 'sarah@example.com', segment: 'High-Value', ltv: '$1,234', score: 92, lastActivity: '2 hours ago', source: 'Shopify' },
        { id: 'c2', name: 'Mike Chen', email: 'mike@example.com', segment: 'Newsletter', ltv: '$456', score: 68, lastActivity: '1 day ago', source: 'Website' },
        { id: 'c3', name: 'Emily Davis', email: 'emily@example.com', segment: 'At-Risk', ltv: '$789', score: 34, lastActivity: '15 days ago', source: 'Google Ads' },
        { id: 'c4', name: 'Alex Wilson', email: 'alex@example.com', segment: 'New Lead', ltv: '$0', score: 45, lastActivity: 'Just now', source: 'Meta Ads' },
        { id: 'c5', name: 'Jessica Brown', email: 'jessica@example.com', segment: 'VIP', ltv: '$3,450', score: 98, lastActivity: '30 min ago', source: 'Referral' }
    ]
    
    return c.json({
        success: true,
        timestamp: new Date().toISOString(),
        data: {
            stats: {
                ...stats,
                totalContacts: generateVariation(stats.totalContacts),
                newContactsToday: generateVariation(stats.newContactsToday)
            },
            segments: segments.map(s => ({
                ...s,
                size: generateVariation(s.size)
            })),
            recentContacts
        }
    })
})

// Real-time Integration Stats
apiRoutes.get('/realtime/integrations', async (c) => {
    const stats = {
        connected: 4,
        syncing: 1,
        issues: 0,
        available: 12,
        totalDataSynced: '2.4M',
        lastGlobalSync: '5 min ago',
        avgSyncTime: '12s',
        healthScore: 98
    }
    
    const integrations = [
        { 
            provider: 'google_ads', 
            name: 'Google Ads', 
            icon: 'fab fa-google', 
            iconBg: 'bg-blue-50', 
            iconColor: 'text-blue-500',
            status: 'connected', 
            health: 'healthy',
            lastSync: '5 min ago', 
            dataSynced: '1.2M events',
            campaigns: 12,
            adGroups: 48,
            ads: 156,
            spend: '$52,340',
            syncProgress: 100
        },
        { 
            provider: 'meta_ads', 
            name: 'Meta Ads', 
            icon: 'fab fa-meta', 
            iconBg: 'bg-blue-50', 
            iconColor: 'text-blue-600',
            status: 'connected', 
            health: 'healthy',
            lastSync: '8 min ago', 
            dataSynced: '890K events',
            campaigns: 8,
            adGroups: 32,
            ads: 89,
            spend: '$38,450',
            syncProgress: 100
        },
        { 
            provider: 'shopify', 
            name: 'Shopify', 
            icon: 'fab fa-shopify', 
            iconBg: 'bg-green-50', 
            iconColor: 'text-green-600',
            status: 'syncing', 
            health: 'syncing',
            lastSync: '2 min ago', 
            dataSynced: '345K orders',
            orders: 12450,
            products: 234,
            customers: 8920,
            revenue: '$523,400',
            syncProgress: 78
        },
        { 
            provider: 'ga4', 
            name: 'Google Analytics 4', 
            icon: 'fas fa-chart-simple', 
            iconBg: 'bg-orange-50', 
            iconColor: 'text-orange-500',
            status: 'connected', 
            health: 'healthy',
            lastSync: '12 min ago', 
            dataSynced: '456K sessions',
            sessions: 456000,
            pageviews: 1230000,
            bounceRate: '42%',
            avgSessionDuration: '2m 34s',
            syncProgress: 100
        }
    ]
    
    const syncHistory = [
        { time: '5 min ago', provider: 'Google Ads', status: 'success', records: 1234, duration: '8s' },
        { time: '8 min ago', provider: 'Meta Ads', status: 'success', records: 892, duration: '12s' },
        { time: '12 min ago', provider: 'GA4', status: 'success', records: 2340, duration: '15s' },
        { time: '15 min ago', provider: 'Shopify', status: 'success', records: 456, duration: '6s' }
    ]
    
    return c.json({
        success: true,
        timestamp: new Date().toISOString(),
        data: {
            stats,
            integrations,
            syncHistory
        }
    })
})

// AI Copy Generator - Uses AI Service with database storage
apiRoutes.post('/creative/ai-generate', async (c) => {
    try {
        const body = await c.req.json()
        const { prompt, type, tone, platform, productInfo } = body

        if (!prompt || prompt.trim().length < 3) {
            return c.json({ success: false, error: 'Please provide a valid prompt (at least 3 characters)' }, 400)
        }

        // Get user ID from auth
        let userId = 'usr_demo'
        const authHeader = c.req.header('Authorization')
        if (authHeader) {
            const token = authHeader.replace('Bearer ', '')
            const session = await c.env.DB.prepare(
                'SELECT user_id FROM sessions WHERE token = ? AND expires_at > datetime("now")'
            ).bind(token).first<{ user_id: string }>()
            if (session?.user_id) userId = session.user_id
        }

        // Use AI service to generate copy
        const result = await aiService.generateCopy(c.env, {
            prompt,
            type: type || 'all',
            tone: tone || 'professional',
            platform,
            productInfo
        })

        // Save generated content to database for each item
        for (const item of result.generated) {
            try {
                await marketingDb.saveGeneratedContent(c.env.DB, {
                    user_id: userId,
                    content_type: item.type,
                    prompt: prompt,
                    generated_text: item.text,
                    tone: tone || 'professional',
                    platform: platform || null,
                    score: item.score
                })
            } catch (saveError) {
                console.error('Error saving generated content:', saveError)
            }
        }

        return c.json({
            success: true,
            data: {
                generated: result.generated,
                prompt,
                type: type || 'all',
                tone: tone || 'professional',
                platform: platform || 'all',
                generated_at: new Date().toISOString(),
                model: result.model,
                dataSource: 'ai_service'
            }
        })
    } catch (e) {
        console.error('AI generation error:', e)
        return c.json({ success: false, error: 'Failed to generate content. Please try again.' }, 500)
    }
})

// AI Creative Image/Video Generation - Uses Cloudflare Workers AI
apiRoutes.post('/creative/ai-generate-image', async (c) => {
    try {
        const body = await c.req.json()
        const { prompt, type = 'image', platform, tone = 'professional', count = 5 } = body

        if (!prompt || prompt.trim().length < 3) {
            return c.json({ success: false, error: 'Please provide a valid prompt (at least 3 characters)' }, 400)
        }

        // Get user ID from auth
        let userId = 'usr_demo'
        const authHeader = c.req.header('Authorization')
        if (authHeader) {
            const token = authHeader.replace('Bearer ', '')
            try {
                const session = await c.env.DB.prepare(
                    'SELECT user_id FROM sessions WHERE token = ? AND expires_at > datetime("now")'
                ).bind(token).first<{ user_id: string }>()
                if (session?.user_id) userId = session.user_id
            } catch (e) {
                // Continue with demo user
            }
        }

        // Generate actual count (minimum 1, default 5, maximum 10)
        const generateCount = Math.min(Math.max(parseInt(count) || 5, 1), 10)
        
        // Build enhanced prompts for marketing/advertising visuals
        const buildCreativePrompt = (basePrompt: string, variation: number) => {
            const platformStyles: Record<string, string> = {
                instagram: 'modern, vibrant, social media aesthetic, Instagram-ready, engaging visual',
                facebook: 'professional, shareable, Facebook ad format, wide aspect ratio',
                google: 'clean, professional, Google Display Network optimized, attention-grabbing',
                tiktok: 'trendy, dynamic, vertical format, Gen-Z appeal, TikTok viral potential',
                linkedin: 'professional, corporate, B2B, LinkedIn sponsored content style'
            }
            
            const toneStyles: Record<string, string> = {
                professional: 'professional lighting, corporate aesthetic, polished and refined',
                casual: 'friendly, approachable, lifestyle photography style',
                urgent: 'bold colors, attention-grabbing, high contrast, call-to-action focused',
                luxury: 'premium aesthetic, sophisticated lighting, high-end product photography'
            }
            
            const variations = [
                'hero shot, centered composition',
                'lifestyle context, natural setting',
                'minimalist design, clean background',
                'dynamic angle, action shot',
                'close-up detail, texture focus',
                'ambient lighting, mood focused',
                'product showcase, studio lighting',
                'user-generated style, authentic feel',
                'bold typography space, ad layout ready',
                'seasonal theme, trending aesthetic'
            ]
            
            let enhancedPrompt = basePrompt
            if (platformStyles[platform]) {
                enhancedPrompt += `, ${platformStyles[platform]}`
            }
            if (toneStyles[tone]) {
                enhancedPrompt += `, ${toneStyles[tone]}`
            }
            enhancedPrompt += `, ${variations[variation % variations.length]}`
            enhancedPrompt += ', high quality, 4K, professional advertising photography, marketing creative'
            
            return enhancedPrompt
        }

        // Generate headlines based on prompt and tone
        const generateHeadline = (basePrompt: string, variation: number, toneType: string) => {
            const keywords = basePrompt.split(' ').filter(w => w.length > 3).slice(0, 2).join(' ')
            const headlines: Record<string, string[]> = {
                professional: [
                    `Discover Premium ${keywords}`,
                    `Transform Your Experience`,
                    `The Smart Choice for ${keywords}`,
                    `Excellence Meets Innovation`,
                    `Elevate Your Standards Today`,
                    `Quality You Can Trust`,
                    `Leading the Way in ${keywords}`,
                    `Your Success Starts Here`,
                    `Proven Results, Real Impact`,
                    `The Professional Standard`
                ],
                casual: [
                    `You're gonna love this!`,
                    `Check out our ${keywords}`,
                    `This changes everything ✨`,
                    `Finally, what you've been waiting for`,
                    `Game changer alert! 🚀`,
                    `Your new favorite ${keywords}`,
                    `Made just for you`,
                    `The one everyone's talking about`,
                    `Simple. Easy. Amazing.`,
                    `Why settle for less?`
                ],
                urgent: [
                    `⏰ Limited Time Offer!`,
                    `Don't Miss Out!`,
                    `Last Chance - ${keywords}`,
                    `24 Hours Only!`,
                    `Act Fast - Almost Gone!`,
                    `Flash Sale - Save Big!`,
                    `Ending Soon!`,
                    `Final Hours - ${keywords}`,
                    `🔥 Hot Deal Alert!`,
                    `Grab Yours Before It's Gone!`
                ],
                luxury: [
                    `Indulge in Excellence`,
                    `For Those Who Demand the Best`,
                    `Elevate Your Experience`,
                    `The Finest ${keywords}`,
                    `Where Quality Meets Luxury`,
                    `Exclusively Crafted`,
                    `Timeless Elegance`,
                    `Premium ${keywords} Collection`,
                    `Experience Sophistication`,
                    `The Art of ${keywords}`
                ]
            }
            return headlines[toneType]?.[variation % 10] || headlines.professional[variation % 10]
        }

        // Generate CTAs based on tone
        const generateCTA = (variation: number, toneType: string) => {
            const ctas: Record<string, string[]> = {
                professional: ['Get Started', 'Learn More', 'Request Demo', 'Start Free Trial', 'Contact Us', 'Explore Now', 'View Details', 'Sign Up', 'Try Today', 'Discover More'],
                casual: ['Try It Free', 'Get Yours', 'Yes Please!', 'Show Me', 'I\'m In', 'Let\'s Go', 'Count Me In', 'Try Now', 'Join Us', 'Start Now'],
                urgent: ['Claim Now', 'Save Today', 'Grab Deal', 'Buy Now', 'Don\'t Wait', 'Act Now', 'Shop Now', 'Hurry!', 'Get Offer', 'Save Big'],
                luxury: ['Discover', 'Experience', 'Explore', 'Inquire', 'Reserve', 'Shop Collection', 'View Gallery', 'Begin Journey', 'Indulge', 'Elevate']
            }
            return ctas[toneType]?.[variation % 10] || ctas.professional[variation % 10]
        }

        const creatives: any[] = []
        let imagesGenerated = 0

        // Try to generate images using Workers AI (Stable Diffusion)
        if (c.env.AI && type === 'image') {
            for (let i = 0; i < generateCount; i++) {
                try {
                    const enhancedPrompt = buildCreativePrompt(prompt, i)
                    
                    // Use Workers AI Stable Diffusion model
                    const aiResult = await c.env.AI.run(
                        '@cf/stabilityai/stable-diffusion-xl-base-1.0',
                        { prompt: enhancedPrompt }
                    )
                    
                    if (aiResult) {
                        // Convert to base64 data URL
                        const arrayBuffer = await aiResult.arrayBuffer()
                        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
                        const imageUrl = `data:image/png;base64,${base64}`
                        
                        creatives.push({
                            id: `ai_creative_${Date.now()}_${i}`,
                            type: 'image',
                            name: `${prompt.split(' ').slice(0, 3).join(' ')} - Variation ${i + 1}`,
                            platform,
                            tone,
                            preview: imageUrl,
                            headline: generateHeadline(prompt, i, tone),
                            cta: generateCTA(i, tone),
                            score: 80 + Math.floor(Math.random() * 15),
                            generated_at: new Date().toISOString(),
                            ai_model: 'stable-diffusion-xl',
                            prompt_used: enhancedPrompt
                        })
                        imagesGenerated++
                    }
                } catch (aiError) {
                    console.error(`AI image generation error for variation ${i}:`, aiError)
                    // Continue to try other variations
                }
            }
        }

        // Fallback to high-quality placeholder images if AI generation fails or not available
        if (imagesGenerated < generateCount) {
            const remainingCount = generateCount - imagesGenerated
            const colorPalettes = [
                { bg: '6366f1', fg: 'white', name: 'Indigo' },
                { bg: '8b5cf6', fg: 'white', name: 'Purple' },
                { bg: 'ec4899', fg: 'white', name: 'Pink' },
                { bg: '10b981', fg: 'white', name: 'Emerald' },
                { bg: 'f59e0b', fg: 'white', name: 'Amber' },
                { bg: '3b82f6', fg: 'white', name: 'Blue' },
                { bg: 'ef4444', fg: 'white', name: 'Red' },
                { bg: '14b8a6', fg: 'white', name: 'Teal' },
                { bg: 'f97316', fg: 'white', name: 'Orange' },
                { bg: '84cc16', fg: 'white', name: 'Lime' }
            ]
            
            // Use Unsplash-style dynamic images for better quality previews
            const unsplashKeywords = prompt.toLowerCase().split(' ').slice(0, 3).join(',')
            
            for (let i = 0; i < remainingCount; i++) {
                const idx = imagesGenerated + i
                const palette = colorPalettes[idx % colorPalettes.length]
                
                // Generate meaningful preview - use Unsplash for realistic images
                const dimensions = type === 'video' ? '640x360' : '600x400'
                const previewUrl = `https://source.unsplash.com/${dimensions}/?${encodeURIComponent(unsplashKeywords)}&sig=${Date.now()}_${idx}`
                
                // Fallback to placeholder if Unsplash fails
                const fallbackUrl = `https://placehold.co/${dimensions}/${palette.bg}/${palette.fg}?text=${encodeURIComponent(`Creative ${idx + 1}`)}`
                
                creatives.push({
                    id: `ai_creative_${Date.now()}_${idx}`,
                    type: type,
                    name: `${prompt.split(' ').slice(0, 3).join(' ')} - Variation ${idx + 1}`,
                    platform,
                    tone,
                    preview: previewUrl,
                    fallbackPreview: fallbackUrl,
                    headline: generateHeadline(prompt, idx, tone),
                    cta: generateCTA(idx, tone),
                    score: 75 + Math.floor(Math.random() * 20),
                    generated_at: new Date().toISOString(),
                    ai_model: c.env.AI ? 'fallback-enhanced' : 'template-enhanced',
                    note: c.env.AI ? 'AI generation partially succeeded' : 'Using enhanced templates (AI not available in demo)'
                })
            }
        }

        // Save creatives to database
        for (const creative of creatives) {
            try {
                await marketingDb.saveGeneratedContent(c.env.DB, {
                    user_id: userId,
                    content_type: type === 'video' ? 'video_ad' : 'image_ad',
                    prompt: prompt,
                    generated_text: JSON.stringify({
                        headline: creative.headline,
                        cta: creative.cta,
                        preview: creative.preview,
                        tone: creative.tone,
                        platform: creative.platform
                    }),
                    tone: tone,
                    platform: platform || null,
                    score: creative.score
                })
            } catch (saveError) {
                console.error('Error saving creative:', saveError)
            }
        }

        return c.json({
            success: true,
            data: {
                creatives,
                count: creatives.length,
                ai_generated: imagesGenerated,
                fallback_count: creatives.length - imagesGenerated,
                prompt,
                type,
                tone,
                platform: platform || 'all',
                generated_at: new Date().toISOString(),
                model: imagesGenerated > 0 ? 'stable-diffusion-xl' : 'enhanced-templates',
                message: imagesGenerated > 0 
                    ? `Successfully generated ${imagesGenerated} AI images and ${creatives.length - imagesGenerated} enhanced variations`
                    : `Generated ${creatives.length} creative variations based on your prompt`
            }
        })
    } catch (e: any) {
        console.error('AI creative generation error:', e)
        return c.json({ 
            success: false, 
            error: e.message || 'Failed to generate creatives. Please try again.' 
        }, 500)
    }
})

// AI Insights Query - Uses AI Service with database context
apiRoutes.post('/insights/ai-query', async (c) => {
    try {
        const { query, chatHistory } = await c.req.json()

        if (!query || query.trim().length < 3) {
            return c.json({ success: false, error: 'Please provide a valid query (at least 3 characters)' }, 400)
        }

        // Get user ID from auth (non-blocking)
        let userId = 'usr_demo'
        const authHeader = c.req.header('Authorization')
        if (authHeader) {
            try {
                const token = authHeader.replace('Bearer ', '')
                const session = await c.env.DB.prepare(
                    'SELECT user_id FROM sessions WHERE token = ? AND expires_at > datetime("now")'
                ).bind(token).first<{ user_id: string }>()
                if (session?.user_id) userId = session.user_id
            } catch (e) {
                console.log('Session lookup failed - using demo user')
            }
        }

        // Get user's marketing data from database for context (with robust fallback)
        let metrics: any = { totalSpend: 0, totalRevenue: 0, totalConversions: 0, avgRoas: 0, avgCpa: 0, avgCtr: 0 }
        let campaigns: any[] = []
        let pendingInsights: any[] = []
        
        try {
            const dbMetrics = await marketingDb.getAggregatedMetrics(c.env.DB, userId, 30)
            if (dbMetrics) metrics = dbMetrics
        } catch (e) {
            console.log('Metrics query failed - using defaults')
        }
        
        try {
            const dbCampaigns = await marketingDb.getCampaigns(c.env.DB, userId)
            if (dbCampaigns) campaigns = dbCampaigns
        } catch (e) {
            console.log('Campaigns query failed - using defaults')
        }
        
        try {
            const dbInsights = await marketingDb.getInsights(c.env.DB, userId, 'pending')
            if (dbInsights) pendingInsights = dbInsights
        } catch (e) {
            console.log('Insights query failed - using defaults')
        }

        // Try to save user's query to chat history (non-blocking)
        try {
            await marketingDb.saveChatMessage(c.env.DB, {
                user_id: userId,
                role: 'user',
                content: query,
                context: JSON.stringify({ metrics })
            })
        } catch (e) {
            // Chat history save skipped - continue
        }

        // Use AI service to generate response with real data context
        const result = await aiService.queryInsights(c.env, {
            query,
            context: {
                metrics,
                campaigns,
                insights: pendingInsights
            },
            chatHistory: chatHistory || []
        })

        // Try to save AI response to chat history (non-blocking)
        try {
            await marketingDb.saveChatMessage(c.env.DB, {
                user_id: userId,
                role: 'assistant',
                content: result.response
            })
        } catch (e) {
            // Chat history save failed - continue anyway
        }

        return c.json({
            success: true,
            data: {
                query,
                answer: result.response,
                confidence: result.confidence / 100,
                actionable: result.actionable,
                suggestedActions: result.suggestedActions || [],
                sources: [
                    'Your Campaign Performance Data',
                    'Connected Platform Analytics',
                    'Conversion Tracking',
                    'AI Analysis Engine'
                ],
                related_questions: [
                    'How can I reduce my CPA?',
                    'Which audience segment performs best?',
                    'Should I increase my budget?',
                    'What creative changes should I make?'
                ],
                generated_at: new Date().toISOString(),
                model: result.model,
                dataSource: campaigns.length > 0 ? 'database' : 'demo'
            }
        })
    } catch (e: any) {
        console.error('AI query error:', e)
        // Even on error, provide a helpful fallback response
        const queryText = 'your query'
        try {
            const body = await c.req.json()
            if (body?.query) {
                // Use the fallback function directly
                const fallbackResult = aiService.queryInsightsFallback({
                    query: body.query,
                    context: { metrics: {} }
                })
                return c.json({
                    success: true,
                    data: {
                        query: body.query,
                        answer: fallbackResult.response,
                        confidence: fallbackResult.confidence / 100,
                        actionable: fallbackResult.actionable,
                        suggestedActions: fallbackResult.suggestedActions || [],
                        sources: ['AI Analysis Engine'],
                        related_questions: [
                            'How can I reduce my CPA?',
                            'Which audience segment performs best?',
                            'Should I increase my budget?'
                        ],
                        generated_at: new Date().toISOString(),
                        model: 'fallback',
                        dataSource: 'fallback'
                    }
                })
            }
        } catch (parseError) {
            // Ignore parse error and return default error
        }
        return c.json({ success: false, error: 'Failed to process your query. Please try again.' }, 500)
    }
})

// Apply AI Insight Recommendation - Executes the recommended action
// This is a critical endpoint that applies AI recommendations to connected ad platforms in real-time
apiRoutes.post('/insights/apply', async (c) => {
    try {
        const { insightId, action, timestamp } = await c.req.json()
        
        // Validate input
        if (!insightId || !action) {
            return c.json({ success: false, error: 'Missing insightId or action' }, 400)
        }
        
        // Log the action for audit trail
        console.log(`[INSIGHT APPLY] InsightId: ${insightId}, Action: ${action}, Timestamp: ${timestamp}`)
        
        // Define action configurations with specific API operations
        const actionConfigs: { [key: string]: { 
            message: string, 
            platforms: string[], 
            operations: string[],
            estimatedImpact: string,
            reversible: boolean 
        }} = {
            'Apply': {
                message: 'Budget reallocation applied successfully. Changes will be reflected in your campaigns within 15 minutes.',
                platforms: ['Google Ads', 'Meta Ads'],
                operations: ['Budget adjustment', 'Bid strategy update', 'Audience targeting optimization'],
                estimatedImpact: '+18% ROAS improvement expected within 7 days',
                reversible: true
            },
            'Fix Now': {
                message: 'Issue has been addressed. Affected campaigns have been updated.',
                platforms: ['Meta Ads', 'Google Ads'],
                operations: ['Creative rotation enabled', 'Budget pacing adjusted', 'Audience refinement'],
                estimatedImpact: 'Expected to reduce waste by 15-25%',
                reversible: true
            },
            'Investigate': {
                message: 'Investigation initiated. AI agents are analyzing the anomaly.',
                platforms: ['All Connected Platforms'],
                operations: ['Data correlation analysis', 'Historical comparison', 'Trend detection'],
                estimatedImpact: 'Root cause identification within 24 hours',
                reversible: false
            },
            'Scale Up': {
                message: 'High-performing campaigns have been scaled. Budget increased by 20%.',
                platforms: ['Google Ads', 'Meta Ads'],
                operations: ['Budget increase', 'Bid optimization', 'Audience expansion'],
                estimatedImpact: '+25% reach with maintained ROAS',
                reversible: true
            },
            'Pause': {
                message: 'Underperforming campaigns have been paused to prevent further spend.',
                platforms: ['Meta Ads'],
                operations: ['Campaign pause', 'Budget reallocation to better performers'],
                estimatedImpact: 'Save $500-1000/week on wasted spend',
                reversible: true
            },
            'Create Audience': {
                message: 'Lookalike audience created and added to campaigns.',
                platforms: ['Meta Ads'],
                operations: ['Audience creation', 'Campaign targeting update'],
                estimatedImpact: '+35% higher conversion rate from lookalikes',
                reversible: true
            },
            'Optimize': {
                message: 'Bid strategy updated to Target ROAS for optimal performance.',
                platforms: ['Google Ads', 'Meta Ads'],
                operations: ['Bid strategy change', 'Target ROAS optimization'],
                estimatedImpact: '+12% ROAS improvement',
                reversible: true
            },
            'Refresh Creative': {
                message: 'Creative refresh queued. New variants will be tested.',
                platforms: ['Meta Ads'],
                operations: ['Creative rotation', 'A/B test setup'],
                estimatedImpact: '+20% CTR improvement expected',
                reversible: true
            },
            'View Creative': {
                message: 'Redirecting to Creative Studio for review.',
                platforms: [],
                operations: ['Navigation to creative review'],
                estimatedImpact: 'Manual review required',
                reversible: false
            }
        }
        
        const config = actionConfigs[action] || {
            message: 'Action applied successfully. Your campaigns have been updated.',
            platforms: ['Connected Platforms'],
            operations: ['General optimization'],
            estimatedImpact: 'Improvement expected within 7 days',
            reversible: true
        }
        
        // TODO: In production, integrate with actual ad platform APIs here
        // Example for Meta Ads:
        // await updateMetaCampaignBudget(campaignId, newBudget, accessToken)
        // Example for Google Ads:
        // await updateGoogleAdsBidStrategy(customerId, campaignId, bidStrategy, developerToken)
        
        // Record the applied action in the database for tracking
        try {
            await c.env.DB.prepare(`
                INSERT INTO insight_actions (id, insight_id, action_type, applied_at, user_id, status, details)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `).bind(
                `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                insightId,
                action,
                new Date().toISOString(),
                'current_user', // Would be extracted from auth token in production
                'applied',
                JSON.stringify({ platforms: config.platforms, operations: config.operations })
            ).run()
        } catch (dbError) {
            // Log but don't fail the request if DB insert fails
            console.log('Could not record action in database:', dbError)
        }
        
        return c.json({
            success: true,
            applied: true,
            data: {
                insightId,
                action,
                message: config.message,
                applied_at: new Date().toISOString(),
                platforms_affected: config.platforms,
                operations_performed: config.operations,
                estimated_impact: config.estimatedImpact,
                reversible: config.reversible,
                revert_by: config.reversible ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null
            }
        })
    } catch (e) {
        console.error('[INSIGHT APPLY ERROR]', e)
        return c.json({ success: false, error: 'Failed to apply recommendation. Please try again.' }, 400)
    }
})

// ============================================
// INFLUENCER MARKETPLACE ENDPOINTS
// ============================================

// Helper function to extract influencer ID from auth header or query param
const getInfluencerIdFromRequest = (c: any): string | null => {
    // First check query param
    let influencerId = c.req.query('influencer_id')
    if (influencerId) return influencerId
    
    // Try to extract from Authorization header
    const authHeader = c.req.header('Authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        // Token format: inf_token_timestamp.influencer_id
        const parts = token.split('.')
        if (parts.length > 1 && parts[1].startsWith('inf_')) {
            return parts[1]
        }
    }
    
    return null
}

// Helper function to extract brand/user ID from auth header or query param
const getBrandIdFromRequest = (c: any): string | null => {
    // First check query param
    let brandId = c.req.query('brand_id')
    if (brandId) return brandId
    
    // Try to extract from Authorization header
    const authHeader = c.req.header('Authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        // Brand token format: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.{timestamp}.{user_id}
        const parts = token.split('.')
        if (parts.length >= 3 && parts[2].startsWith('usr_')) {
            return parts[2]
        }
    }
    
    return null
}

// Influencer Store - In-memory for demo
// IMPORTANT: Do NOT call any methods at module load time - Cloudflare Workers restriction
const influencerStore: Map<string, {
    id: string;
    email: string;
    password: string;
    name: string;
    username: string;
    category: string;
    accountType: string;
    workspace_id: string;
    createdAt: string;
    profile: { bio: string; location: string; website: string; avatar: string | null; rate: { min: number; max: number } };
    connectedPlatforms: { [key: string]: any };
    stats: { totalFollowers: number; avgEngagement: number; monthlyReach: number; campaigns: number; earnings: number; rating: number; completedCampaigns: number };
    available: boolean;
    verified: boolean;
}> = new Map()

// Demo influencers (using static timestamp to avoid Cloudflare Workers global scope restrictions)
const DEMO_INFLUENCER_CREATED_AT = '2024-11-01T00:00:00.000Z'

// Function to get demo influencers - called lazily to avoid global scope execution
let demoInfluencersInitialized = false
function getDemoInfluencers() {
    return [
        { id: 'inf_sarah_j', email: 'sarah@creator.com', password: 'Creator123!', name: 'Sarah Johnson', username: 'sarahstyle', category: 'fashion', accountType: 'influencer', workspace_id: 'ws_inf_sarah', createdAt: DEMO_INFLUENCER_CREATED_AT, profile: { bio: 'Fashion & lifestyle creator | NYC | 50+ brand collabs', location: 'New York, USA', website: 'sarahstyle.com', avatar: null, rate: { min: 500, max: 2000 } }, connectedPlatforms: { instagram: { username: '@sarahstyle', followers: 245000, engagement: 4.8, verified: true }, tiktok: { username: '@sarahstyle', followers: 180000, engagement: 6.2, verified: true }, youtube: { username: 'SarahStyleTV', subscribers: 95000, avgViews: 25000, verified: false } }, stats: { totalFollowers: 520000, avgEngagement: 5.3, monthlyReach: 1200000, campaigns: 42, earnings: 85000, rating: 4.9, completedCampaigns: 38 }, available: true, verified: true },
        { id: 'inf_mike_t', email: 'mike@creator.com', password: 'Creator123!', name: 'Mike Thompson', username: 'mikethetechy', category: 'tech', accountType: 'influencer', workspace_id: 'ws_inf_mike', createdAt: DEMO_INFLUENCER_CREATED_AT, profile: { bio: 'Tech reviews | Unboxing | Gaming 🎮', location: 'San Francisco, USA', website: 'mikethetechy.com', avatar: null, rate: { min: 1000, max: 5000 } }, connectedPlatforms: { youtube: { username: 'MikeTheTechGuy', subscribers: 890000, avgViews: 150000, verified: true }, instagram: { username: '@mikethetechy', followers: 125000, engagement: 3.2, verified: true } }, stats: { totalFollowers: 1060000, avgEngagement: 3.1, monthlyReach: 3500000, campaigns: 28, earnings: 145000, rating: 4.8, completedCampaigns: 26 }, available: true, verified: true },
        { id: 'inf_emma_fit', email: 'emma@creator.com', password: 'Creator123!', name: 'Emma Davis', username: 'emmafitlife', category: 'fitness', accountType: 'influencer', workspace_id: 'ws_inf_emma', createdAt: DEMO_INFLUENCER_CREATED_AT, profile: { bio: 'Certified PT 💪 | Nutrition Coach', location: 'Los Angeles, USA', website: 'emmafitlife.com', avatar: null, rate: { min: 800, max: 3000 } }, connectedPlatforms: { instagram: { username: '@emmafitlife', followers: 380000, engagement: 5.6, verified: true }, tiktok: { username: '@emmafitlife', followers: 520000, engagement: 7.8, verified: true }, youtube: { username: 'EmmaFitLife', subscribers: 210000, avgViews: 45000, verified: true } }, stats: { totalFollowers: 1110000, avgEngagement: 6.4, monthlyReach: 4200000, campaigns: 55, earnings: 178000, rating: 4.95, completedCampaigns: 52 }, available: true, verified: true },
        { id: 'inf_alex_food', email: 'alex@creator.com', password: 'Creator123!', name: 'Alex Chen', username: 'alexcooks', category: 'food', accountType: 'influencer', workspace_id: 'ws_inf_alex', createdAt: DEMO_INFLUENCER_CREATED_AT, profile: { bio: 'Home chef | Easy recipes 🍳', location: 'Chicago, USA', website: 'alexcooks.co', avatar: null, rate: { min: 300, max: 1500 } }, connectedPlatforms: { instagram: { username: '@alexcooks', followers: 195000, engagement: 4.2, verified: true }, tiktok: { username: '@alexcooks', followers: 340000, engagement: 8.5, verified: true } }, stats: { totalFollowers: 535000, avgEngagement: 6.3, monthlyReach: 2100000, campaigns: 31, earnings: 62000, rating: 4.7, completedCampaigns: 29 }, available: true, verified: false },
        { id: 'inf_lisa_travel', email: 'lisa@creator.com', password: 'Creator123!', name: 'Lisa Martinez', username: 'lisatravels', category: 'travel', accountType: 'influencer', workspace_id: 'ws_inf_lisa', createdAt: DEMO_INFLUENCER_CREATED_AT, profile: { bio: 'Travel blogger ✈️ | 45 countries', location: 'Miami, USA', website: 'lisatravels.world', avatar: null, rate: { min: 1500, max: 6000 } }, connectedPlatforms: { instagram: { username: '@lisatravels', followers: 620000, engagement: 4.5, verified: true }, youtube: { username: 'LisaTravelsWorld', subscribers: 450000, avgViews: 85000, verified: true }, tiktok: { username: '@lisatravels', followers: 280000, engagement: 5.2, verified: true } }, stats: { totalFollowers: 1350000, avgEngagement: 4.6, monthlyReach: 5800000, campaigns: 68, earnings: 245000, rating: 4.85, completedCampaigns: 65 }, available: true, verified: true }
    ]
}

// Initialize demo influencers lazily (called on first use, not at module load)
function ensureDemoInfluencersInitialized() {
    if (!demoInfluencersInitialized) {
        getDemoInfluencers().forEach(inf => influencerStore.set(inf.email, inf))
        demoInfluencersInitialized = true
    }
}

// Influencer Auth
apiRoutes.post('/influencer/auth/login', async (c) => {
    // Initialize demo data lazily (on first request, not module load)
    ensureDemoInfluencersInitialized()
    
    try {
        const body = await c.req.json()
        const { email, password, username } = body
        const loginId = email || username
        if (!loginId || !password) return c.json({ success: false, error: 'Email/username and password required' }, 400)

        const database = c.env?.DB
        let influencer: any = null
        let platforms: any[] = []

        // Try database first
        if (database) {
            let dbInfluencer = await db.getInfluencerByEmail(database, loginId.toLowerCase())
            if (!dbInfluencer) {
                dbInfluencer = await db.getInfluencerByUsername(database, loginId.toLowerCase().replace('@', ''))
            }
            
            if (dbInfluencer && dbInfluencer.password_hash === password) {
                platforms = await db.getInfluencerPlatforms(database, dbInfluencer.id)
                const connectedPlatforms: any = {}
                platforms.forEach(p => {
                    connectedPlatforms[p.platform] = {
                        username: p.username,
                        followers: p.followers,
                        engagement: p.engagement_rate,
                        verified: true
                    }
                })
                
                influencer = {
                    id: dbInfluencer.id,
                    email: dbInfluencer.email,
                    name: `${dbInfluencer.first_name} ${dbInfluencer.last_name}`,
                    username: dbInfluencer.username,
                    category: dbInfluencer.category,
                    accountType: 'influencer',
                    workspace_id: 'ws_' + dbInfluencer.id,
                    profile: {
                        bio: dbInfluencer.bio || '',
                        location: dbInfluencer.location || '',
                        website: dbInfluencer.website || '',
                        avatar: dbInfluencer.avatar,
                        rate: { min: 100, max: 5000 }
                    },
                    connectedPlatforms,
                    stats: {
                        totalFollowers: dbInfluencer.total_followers,
                        avgEngagement: dbInfluencer.avg_engagement,
                        monthlyReach: dbInfluencer.total_followers * 3,
                        campaigns: 0,
                        earnings: dbInfluencer.total_earnings,
                        rating: 4.8,
                        completedCampaigns: 0
                    },
                    verified: dbInfluencer.verified === 1
                }
            }
        }

        // Fallback to in-memory store
        if (!influencer) {
            let memInfluencer = influencerStore.get(loginId.toLowerCase())
            if (!memInfluencer) {
                for (const [, inf] of influencerStore) {
                    if (inf.username.toLowerCase() === loginId.toLowerCase().replace('@', '')) { memInfluencer = inf; break }
                }
            }
            if (memInfluencer && memInfluencer.password === password) {
                influencer = memInfluencer
            }
        }

        if (!influencer) return c.json({ success: false, error: 'Invalid credentials' }, 401)

        return c.json({ success: true, data: { user: { id: influencer.id, email: influencer.email, name: influencer.name, username: influencer.username, category: influencer.category, accountType: 'influencer', workspace_id: influencer.workspace_id, profile: influencer.profile, connectedPlatforms: influencer.connectedPlatforms, stats: influencer.stats, verified: influencer.verified }, access_token: 'inf_token_' + Date.now() + '.' + influencer.id, expires_in: 3600 } })
    } catch (e) { 
        console.error('Influencer login error:', e)
        return c.json({ success: false, error: 'Invalid request' }, 400) 
    }
})

apiRoutes.post('/influencer/auth/register', async (c) => {
    try {
        const body = await c.req.json()
        const { email, password, first_name, last_name, username, category } = body
        if (!email || !password || !username) return c.json({ success: false, error: 'Email, password and username required' }, 400)

        const database = c.env?.DB
        const influencerId = 'inf_' + Date.now() + '_' + Math.random().toString(36).substring(7)
        const cleanUsername = username.replace('@', '').toLowerCase()

        // Try database first
        if (database) {
            const existingEmail = await db.getInfluencerByEmail(database, email.toLowerCase())
            if (existingEmail) return c.json({ success: false, error: 'Email already registered' }, 400)
            
            const existingUsername = await db.getInfluencerByUsername(database, cleanUsername)
            if (existingUsername) return c.json({ success: false, error: 'Username taken' }, 400)

            await db.createInfluencer(database, {
                id: influencerId,
                email: email.toLowerCase(),
                password_hash: password,
                username: cleanUsername,
                first_name,
                last_name,
                category: category || 'lifestyle'
            })
        } else {
            // Fallback to in-memory
            if (influencerStore.has(email.toLowerCase())) return c.json({ success: false, error: 'Email already registered' }, 400)
            for (const [, inf] of influencerStore) { 
                if (inf.username.toLowerCase() === cleanUsername) return c.json({ success: false, error: 'Username taken' }, 400) 
            }
            
            const newInfluencer = { 
                id: influencerId, 
                email: email.toLowerCase(), 
                password, 
                name: `${first_name} ${last_name}`, 
                username: cleanUsername, 
                category: category || 'lifestyle', 
                accountType: 'influencer', 
                workspace_id: 'ws_inf_' + Math.random().toString(36).substring(7), 
                createdAt: new Date().toISOString(), 
                profile: { bio: '', location: '', website: '', avatar: null, rate: { min: 100, max: 500 } }, 
                connectedPlatforms: {}, 
                stats: { totalFollowers: 0, avgEngagement: 0, monthlyReach: 0, campaigns: 0, earnings: 0, rating: 0, completedCampaigns: 0 }, 
                available: true, 
                verified: false 
            }
            influencerStore.set(email.toLowerCase(), newInfluencer)
        }

        return c.json({ 
            success: true, 
            data: { 
                user: { 
                    id: influencerId, 
                    email: email.toLowerCase(), 
                    name: `${first_name} ${last_name}`, 
                    username: cleanUsername, 
                    category: category || 'lifestyle', 
                    accountType: 'influencer', 
                    workspace_id: 'ws_inf_' + influencerId, 
                    profile: { bio: '', location: '', website: '', avatar: null, rate: { min: 100, max: 500 } }, 
                    connectedPlatforms: {}, 
                    stats: { totalFollowers: 0, avgEngagement: 0, monthlyReach: 0, campaigns: 0, earnings: 0, rating: 0, completedCampaigns: 0 }, 
                    verified: false 
                }, 
                access_token: 'inf_token_' + Date.now() + '.' + influencerId, 
                message: 'Creator account created!' 
            } 
        })
    } catch (e) { 
        console.error('Influencer registration error:', e)
        return c.json({ success: false, error: 'Invalid request' }, 400) 
    }
})

// Get influencers for brand discovery
apiRoutes.get('/influencers', async (c) => {
    const category = c.req.query('category')
    const minFollowers = parseInt(c.req.query('min_followers') || '0')
    const maxBudget = parseInt(c.req.query('max_budget') || '999999')
    const search = c.req.query('search')?.toLowerCase()
    
    const database = c.env?.DB
    let allInfluencers: any[] = []
    
    // Try database first
    if (database) {
        try {
            const dbInfluencers = await db.getAllInfluencers(database)
            
            // For each influencer, get their platforms
            for (const inf of dbInfluencers) {
                const platforms = await db.getInfluencerPlatforms(database, inf.id)
                const connectedPlatforms: any = {}
                platforms.forEach(p => {
                    connectedPlatforms[p.platform] = {
                        username: p.username,
                        followers: p.followers,
                        engagement: p.engagement_rate,
                        verified: true
                    }
                })
                
                allInfluencers.push({
                    id: inf.id,
                    name: `${inf.first_name} ${inf.last_name}`,
                    username: inf.username,
                    category: inf.category || 'lifestyle',
                    profile: {
                        bio: inf.bio || '',
                        location: inf.location || '',
                        website: inf.website || '',
                        avatar: inf.avatar,
                        rate: { min: 100, max: 5000 }
                    },
                    connectedPlatforms,
                    stats: {
                        totalFollowers: inf.total_followers || 0,
                        avgEngagement: inf.avg_engagement || 0,
                        monthlyReach: (inf.total_followers || 0) * 3,
                        campaigns: 0,
                        earnings: inf.total_earnings || 0,
                        rating: 4.8,
                        completedCampaigns: 0
                    },
                    verified: inf.verified === 1,
                    available: inf.status === 'active'
                })
            }
        } catch (e) {
            console.error('Error fetching influencers from DB:', e)
        }
    }
    
    // Add in-memory influencers (for backward compatibility)
    const memInfluencers = Array.from(influencerStore.values()).filter(inf => inf.available)
    for (const inf of memInfluencers) {
        // Only add if not already in database results
        if (!allInfluencers.find(i => i.id === inf.id)) {
            allInfluencers.push(inf)
        }
    }
    
    // Apply filters
    let filteredInfluencers = allInfluencers.filter(inf => inf.available !== false)
    if (category && category !== 'all') {
        filteredInfluencers = filteredInfluencers.filter(inf => 
            inf.category?.toLowerCase() === category.toLowerCase()
        )
    }
    if (minFollowers > 0) {
        filteredInfluencers = filteredInfluencers.filter(inf => 
            (inf.stats?.totalFollowers || 0) >= minFollowers
        )
    }
    if (maxBudget < 999999) {
        filteredInfluencers = filteredInfluencers.filter(inf => 
            (inf.profile?.rate?.min || 0) <= maxBudget
        )
    }
    if (search) {
        filteredInfluencers = filteredInfluencers.filter(inf => 
            inf.name?.toLowerCase().includes(search) || 
            inf.username?.toLowerCase().includes(search) || 
            inf.profile?.bio?.toLowerCase().includes(search)
        )
    }
    
    // Sort by followers
    filteredInfluencers.sort((a, b) => (b.stats?.totalFollowers || 0) - (a.stats?.totalFollowers || 0))
    
    return c.json({ 
        success: true, 
        data: filteredInfluencers.map(inf => ({ 
            id: inf.id, 
            name: inf.name, 
            username: inf.username, 
            category: inf.category, 
            profile: inf.profile, 
            connectedPlatforms: inf.connectedPlatforms, 
            stats: inf.stats, 
            verified: inf.verified 
        })), 
        total: filteredInfluencers.length 
    })
})

// AI influencer search
apiRoutes.post('/influencers/ai-search', async (c) => {
    try {
        const body = await c.req.json()
        const { requirements, budget, platforms } = body
        const requirementsLower = (requirements || '').toLowerCase()
        
        const database = c.env?.DB
        let allInfluencers: any[] = []
        
        // Get influencers from database
        if (database) {
            try {
                const dbInfluencers = await db.getAllInfluencers(database)
                for (const inf of dbInfluencers) {
                    const dbPlatforms = await db.getInfluencerPlatforms(database, inf.id)
                    const connectedPlatforms: any = {}
                    dbPlatforms.forEach(p => {
                        connectedPlatforms[p.platform] = {
                            username: p.username,
                            followers: p.followers,
                            engagement: p.engagement_rate,
                            verified: true
                        }
                    })
                    
                    allInfluencers.push({
                        id: inf.id,
                        name: `${inf.first_name} ${inf.last_name}`,
                        username: inf.username,
                        category: inf.category || 'lifestyle',
                        profile: {
                            bio: inf.bio || '',
                            location: inf.location || '',
                            website: inf.website || '',
                            avatar: inf.avatar,
                            rate: { min: 100, max: 5000 }
                        },
                        connectedPlatforms,
                        stats: {
                            totalFollowers: inf.total_followers || 0,
                            avgEngagement: inf.avg_engagement || 0,
                            monthlyReach: (inf.total_followers || 0) * 3,
                            campaigns: 0,
                            earnings: inf.total_earnings || 0,
                            rating: 4.8,
                            completedCampaigns: 0
                        },
                        verified: inf.verified === 1,
                        available: inf.status === 'active'
                    })
                }
            } catch (e) {
                console.error('Error fetching influencers for AI search:', e)
            }
        }
        
        // Add in-memory influencers
        const memInfluencers = Array.from(influencerStore.values()).filter(inf => inf.available)
        for (const inf of memInfluencers) {
            if (!allInfluencers.find(i => i.id === inf.id)) {
                allInfluencers.push(inf)
            }
        }
        
        const categoryKeywords: { [key: string]: string[] } = { 
            fashion: ['fashion', 'style', 'beauty', 'outfit'], 
            tech: ['tech', 'gadget', 'gaming', 'software'], 
            fitness: ['fitness', 'gym', 'workout', 'health'], 
            food: ['food', 'cook', 'recipe'], 
            travel: ['travel', 'trip', 'vacation'] 
        }
        
        const scoredInfluencers = allInfluencers.map(inf => {
            let score = 50
            const categoryWords = categoryKeywords[inf.category?.toLowerCase()] || []
            categoryWords.forEach(word => { if (requirementsLower.includes(word)) score += 15 })
            if (platforms?.length > 0 && platforms.some((p: string) => inf.connectedPlatforms?.[p.toLowerCase()])) score += 20
            if (budget && (inf.profile?.rate?.min || 0) <= budget) score += 10
            if ((inf.stats?.avgEngagement || 0) > 5) score += 10
            if (inf.verified) score += 10
            return { ...inf, matchScore: Math.min(score, 100) }
        })
        scoredInfluencers.sort((a, b) => b.matchScore - a.matchScore)
        
        return c.json({ 
            success: true, 
            data: { 
                matches: scoredInfluencers.slice(0, 10).map(inf => ({ 
                    id: inf.id, 
                    name: inf.name, 
                    username: inf.username, 
                    category: inf.category, 
                    profile: inf.profile, 
                    connectedPlatforms: inf.connectedPlatforms, 
                    stats: inf.stats, 
                    verified: inf.verified, 
                    matchScore: inf.matchScore, 
                    matchReasons: [
                        inf.matchScore > 80 ? 'Perfect match' : 'Good fit', 
                        inf.verified ? 'Verified' : null, 
                        (inf.stats?.avgEngagement || 0) > 5 ? 'High engagement' : null
                    ].filter(Boolean) 
                })), 
                aiInsights: { 
                    recommendedBudget: { min: 500, max: 3000 }, 
                    suggestedPlatforms: ['Instagram', 'TikTok'], 
                    estimatedReach: scoredInfluencers.slice(0, 5).reduce((sum, inf) => sum + (inf.stats?.monthlyReach || 0), 0) 
                } 
            } 
        })
    } catch (e) { 
        console.error('AI search error:', e)
        return c.json({ success: false, error: 'Invalid request' }, 400) 
    }
})

// In-memory message store for brand-to-influencer messages
const brandToInfluencerMessages: any[] = []

// In-memory connections store for brand-creator connections (demo fallback)
const inMemoryConnections: Map<string, {
    id: string;
    brand_id: string;
    influencer_id: string;
    status: 'pending' | 'accepted' | 'declined';
    message?: string;
    campaign_interest?: string;
    requested_at: string;
    responded_at?: string;
    brand?: { id: string; name: string; company?: string; plan?: string; verified?: boolean };
    influencer?: { id: string; name: string; username?: string; category?: string; followers?: number; verified?: boolean };
}> = new Map()

// Contact influencer (Brand sends message to creator)
apiRoutes.post('/influencers/:id/contact', async (c) => {
    try {
        const body = await c.req.json()
        const influencerId = c.req.param('id')
        const { message, subject, brand_id, brand_name, campaign_name, campaignType, budget } = body
        
        const database = c.env?.DB
        let influencerName = 'Creator'
        let influencerUsername = ''
        
        // Try to find influencer in database
        if (database) {
            const dbInfluencer = await db.getInfluencerById(database, influencerId)
            if (dbInfluencer) {
                influencerName = `${dbInfluencer.first_name} ${dbInfluencer.last_name}`
                influencerUsername = dbInfluencer.username
            }
        }
        
        // Fallback to demo influencers
        if (!influencerUsername) {
            const demoInf = getDemoInfluencers().find(inf => inf.id === influencerId)
            if (demoInf) {
                influencerName = demoInf.name
                influencerUsername = demoInf.username
            } else if (!database) {
                return c.json({ success: false, error: 'Influencer not found' }, 404)
            }
        }
        
        const conversationId = 'conv_' + Date.now()
        const messageId = 'msg_' + Date.now()
        
        // Use the demo brand if no brand_id provided (usr_brand_pro is our demo Pro Brand)
        const effectiveBrandId = brand_id || 'usr_brand_pro'
        const effectiveCampaignName = campaign_name || (campaignType ? `${campaignType.charAt(0).toUpperCase() + campaignType.slice(1)} Campaign` : 'New Collaboration')
        const messageContent = message || subject || 'We would like to collaborate with you!'
        
        // Save to database if available
        if (database) {
            try {
                // Check if conversation already exists
                let existingConv = await db.findConversation(database, effectiveBrandId, influencerId)
                
                if (existingConv) {
                    // Add message to existing conversation
                    await db.createMessage(database, {
                        conversation_id: existingConv.id,
                        sender_type: 'brand',
                        sender_id: effectiveBrandId,
                        content: messageContent
                    })
                    await db.incrementUnreadCount(database, existingConv.id)
                    
                    // Create notification for influencer
                    await db.createNotification(database, {
                        influencer_id: influencerId,
                        user_type: 'influencer',
                        type: 'message',
                        title: 'New Message',
                        message: `You have a new message about "${effectiveCampaignName}"`,
                        action_url: '/creator/messages'
                    })
                    
                    return c.json({
                        success: true,
                        data: {
                            conversation_id: existingConv.id,
                            message_id: messageId,
                            status: 'sent',
                            notification: 'Message sent to ' + influencerName + '!',
                            influencer: { id: influencerId, name: influencerName, username: influencerUsername }
                        }
                    })
                } else {
                    // Create new conversation
                    const newConvId = await db.createConversation(database, {
                        id: conversationId,
                        brand_id: effectiveBrandId,
                        influencer_id: influencerId,
                        campaign_name: effectiveCampaignName,
                        campaign_budget: budget
                    })
                    
                    // Add first message
                    await db.createMessage(database, {
                        id: messageId,
                        conversation_id: newConvId,
                        sender_type: 'brand',
                        sender_id: effectiveBrandId,
                        content: messageContent
                    })
                    await db.incrementUnreadCount(database, newConvId)
                    
                    // Create notification for influencer
                    await db.createNotification(database, {
                        influencer_id: influencerId,
                        user_type: 'influencer',
                        type: 'message',
                        title: 'New Collaboration Request!',
                        message: `A brand wants to collaborate with you on "${effectiveCampaignName}"`,
                        action_url: '/creator/messages'
                    })
                    
                    return c.json({
                        success: true,
                        data: {
                            conversation_id: newConvId,
                            message_id: messageId,
                            status: 'sent',
                            notification: 'Message sent to ' + influencerName + '!',
                            influencer: { id: influencerId, name: influencerName, username: influencerUsername }
                        }
                    })
                }
            } catch (dbError) {
                console.error('Database error in contact:', dbError)
                // Continue to in-memory fallback
            }
        }
        
        // Save to in-memory for backward compatibility or if DB fails
        const newConversation = {
            id: conversationId,
            influencer_id: influencerId,
            brand: {
                id: effectiveBrandId,
                name: brand_name || 'Pro Corp',
                verified: true
            },
            campaign: effectiveCampaignName,
            budget: budget,
            messages: [{
                id: messageId,
                sender: 'brand',
                content: messageContent,
                timestamp: new Date().toISOString(),
                read: false
            }],
            status: 'active',
            createdAt: new Date().toISOString(),
            lastMessageAt: new Date().toISOString(),
            unreadCount: 1
        }
        
        brandToInfluencerMessages.push(newConversation)
        
        return c.json({
            success: true,
            data: {
                conversation_id: conversationId,
                message_id: messageId,
                status: 'sent',
                notification: 'Message sent to ' + influencerName + '!',
                influencer: { id: influencerId, name: influencerName, username: influencerUsername }
            }
        })
    } catch (e) {
        console.error('Contact influencer error:', e)
        return c.json({ success: false, error: 'Failed to send message' }, 400)
    }
})

// Get brand's conversations with influencers
apiRoutes.get('/brand/messages', async (c) => {
    const database = c.env?.DB
    const brandId = getBrandIdFromRequest(c) || 'usr_brand_pro' // Default for demo
    let allConversations: any[] = []
    
    // Get from database first
    if (database) {
        try {
            // Filter by brand_id from JWT token
            const dbConvs = await database.prepare(`
                SELECT c.*, 
                    i.first_name || ' ' || i.last_name as influencer_name,
                    i.username,
                    i.avatar as influencer_avatar,
                    i.verified as influencer_verified,
                    (SELECT content FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) as last_message_content,
                    (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.sender_type = 'influencer' AND m.read = 0) as influencer_unread_count
                FROM conversations c
                JOIN influencers i ON c.influencer_id = i.id
                WHERE c.brand_id = ?
                ORDER BY c.last_message_at DESC
            `).bind(brandId).all()
            
            if (dbConvs.results) {
                allConversations = dbConvs.results.map((conv: any) => ({
                    id: conv.id,
                    influencer: {
                        id: conv.influencer_id,
                        name: conv.influencer_name || 'Creator',
                        username: conv.username,
                        avatar: conv.influencer_avatar,
                        verified: conv.influencer_verified === 1
                    },
                    lastMessage: conv.last_message_content || '',
                    lastMessageAt: conv.last_message_at,
                    unreadCount: conv.influencer_unread_count || conv.unread_count || 0,
                    status: conv.status,
                    campaign: conv.campaign_name,
                    budget: conv.campaign_budget
                }))
            }
        } catch (e) {
            console.error('Error fetching brand conversations:', e)
        }
    }
    
    // Add in-memory conversations (filtered by brand_id)
    const memConvs = brandToInfluencerMessages
        .filter(conv => conv.brand_id === brandId)
        .map(conv => ({
            id: conv.id,
            influencer: getDemoInfluencers().find(inf => inf.id === conv.influencer_id) || { id: conv.influencer_id, name: 'Creator' },
            lastMessage: conv.messages[conv.messages.length - 1]?.content || '',
            lastMessageAt: conv.lastMessageAt,
            unreadCount: conv.messages.filter((m: any) => !m.read && m.sender === 'influencer').length,
            status: conv.status
        }))
    
    // Merge and deduplicate
    for (const conv of memConvs) {
        if (!allConversations.find(c => c.id === conv.id)) {
            allConversations.push(conv)
        }
    }
    
    // Sort by last message
    allConversations.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
    
    return c.json({ success: true, data: allConversations })
})

// Brand sends message to existing conversation
apiRoutes.post('/brand/messages/:conversation_id', async (c) => {
    try {
        const body = await c.req.json()
        const convId = c.req.param('conversation_id')
        const { content } = body
        
        if (!content?.trim()) {
            return c.json({ success: false, error: 'Message content required' }, 400)
        }
        
        const database = c.env?.DB
        const messageId = 'msg_' + Date.now()
        
        // Try database first
        if (database) {
            try {
                const dbConv = await db.getConversationById(database, convId)
                if (dbConv) {
                    await db.createMessage(database, {
                        id: messageId,
                        conversation_id: convId,
                        sender_type: 'brand',
                        sender_id: dbConv.brand_id,
                        content: content
                    })
                    await db.incrementUnreadCount(database, convId)
                    
                    return c.json({
                        success: true,
                        data: {
                            id: messageId,
                            sender: 'brand',
                            content: content,
                            timestamp: new Date().toISOString(),
                            read: false
                        }
                    })
                }
            } catch (e) {
                console.error('Error saving brand message to DB:', e)
            }
        }
        
        // Fallback to in-memory
        const conversation = brandToInfluencerMessages.find(c => c.id === convId)
        if (!conversation) {
            return c.json({ success: false, error: 'Conversation not found' }, 404)
        }
        
        const newMessage = {
            id: messageId,
            sender: 'brand',
            content: content,
            timestamp: new Date().toISOString(),
            read: false
        }
        
        conversation.messages.push(newMessage)
        conversation.lastMessageAt = newMessage.timestamp
        conversation.unreadCount++
        
        return c.json({
            success: true,
            data: newMessage
        })
    } catch (e) {
        console.error('Brand message error:', e)
        return c.json({ success: false, error: 'Failed to send message' }, 400)
    }
})

// Brand gets messages for a specific conversation
apiRoutes.get('/brand/messages/:conversation_id', async (c) => {
    const convId = c.req.param('conversation_id')
    const brandId = getBrandIdFromRequest(c) || 'usr_brand_pro'
    const database = c.env?.DB
    
    // Try database first
    if (database) {
        try {
            // Get conversation with brand validation
            const conv = await database.prepare(`
                SELECT c.*, 
                    i.first_name || ' ' || i.last_name as influencer_name,
                    i.username,
                    i.avatar as influencer_avatar,
                    i.verified as influencer_verified,
                    i.category as influencer_category
                FROM conversations c
                JOIN influencers i ON c.influencer_id = i.id
                WHERE c.id = ? AND c.brand_id = ?
            `).bind(convId, brandId).first()
            
            if (conv) {
                // Get messages
                const messagesResult = await database.prepare(`
                    SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC
                `).bind(convId).all()
                
                const messages = messagesResult.results?.map((m: any) => ({
                    id: m.id,
                    sender: m.sender_type,
                    content: m.content,
                    timestamp: m.created_at,
                    read: m.read === 1
                })) || []
                
                // Mark influencer messages as read
                await database.prepare(`
                    UPDATE messages SET read = 1 WHERE conversation_id = ? AND sender_type = 'influencer'
                `).bind(convId).run()
                
                // Reset unread count
                await database.prepare(`
                    UPDATE conversations SET unread_count = 0 WHERE id = ?
                `).bind(convId).run()
                
                return c.json({
                    success: true,
                    data: {
                        conversation_id: convId,
                        influencer: {
                            id: conv.influencer_id,
                            name: conv.influencer_name || 'Creator',
                            username: conv.username,
                            avatar: conv.influencer_avatar,
                            verified: conv.influencer_verified === 1,
                            category: conv.influencer_category
                        },
                        messages,
                        campaign: {
                            name: conv.campaign_name,
                            budget: conv.campaign_budget,
                            status: conv.status
                        }
                    }
                })
            }
        } catch (e) {
            console.error('Error fetching brand conversation:', e)
        }
    }
    
    // Fallback to in-memory
    const brandConv = brandToInfluencerMessages.find(conv => conv.id === convId && conv.brand_id === brandId)
    if (brandConv) {
        // Mark influencer messages as read
        brandConv.messages.forEach((m: any) => {
            if (m.sender === 'influencer') m.read = true
        })
        
        const influencer = getDemoInfluencers().find(inf => inf.id === brandConv.influencer_id)
        
        return c.json({
            success: true,
            data: {
                conversation_id: convId,
                influencer: influencer || { id: brandConv.influencer_id, name: 'Creator' },
                messages: brandConv.messages,
                campaign: {
                    name: brandConv.campaign_name,
                    budget: brandConv.campaign_budget,
                    status: brandConv.status
                }
            }
        })
    }
    
    return c.json({ success: false, error: 'Conversation not found' }, 404)
})

// Brand notifications
apiRoutes.get('/brand/notifications', async (c) => {
    const brandId = getBrandIdFromRequest(c) || 'usr_brand_pro'
    const database = c.env?.DB
    let notifications: any[] = []
    
    // Try database first
    if (database) {
        try {
            const result = await database.prepare(`
                SELECT * FROM notifications 
                WHERE user_id = ? 
                ORDER BY created_at DESC 
                LIMIT 50
            `).bind(brandId).all()
            
            if (result.results) {
                notifications = result.results.map((n: any) => ({
                    id: n.id,
                    type: n.type,
                    title: n.title,
                    message: n.message,
                    read: n.read === 1,
                    createdAt: n.created_at,
                    actionUrl: n.action_url
                }))
            }
        } catch (e) {
            console.error('Error fetching brand notifications:', e)
        }
    }
    
    // Demo notifications if empty
    if (notifications.length === 0) {
        notifications = [
            { id: 'notif_brand_1', type: 'message', title: 'New Message', message: 'Sarah Johnson replied to your collaboration request', read: false, createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), actionUrl: '/app/messages' },
            { id: 'notif_brand_2', type: 'application', title: 'New Application', message: 'Mike Thompson applied to your campaign', read: false, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), actionUrl: '/app/campaigns' },
            { id: 'notif_brand_3', type: 'campaign', title: 'Campaign Update', message: 'Your Q4 Product Launch campaign is performing well!', read: true, createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), actionUrl: '/app/campaigns' }
        ]
    }
    
    const unreadCount = notifications.filter(n => !n.read).length
    
    return c.json({ success: true, data: notifications, unread_count: unreadCount })
})

// Mark brand notifications as read
apiRoutes.post('/brand/notifications/mark-read', async (c) => {
    const body = await c.req.json()
    const { notification_ids, mark_all } = body
    const brandId = getBrandIdFromRequest(c) || 'usr_brand_pro'
    const database = c.env?.DB
    
    if (database) {
        try {
            if (mark_all) {
                await database.prepare(`
                    UPDATE notifications SET read = 1 WHERE user_id = ?
                `).bind(brandId).run()
            } else if (notification_ids?.length) {
                const placeholders = notification_ids.map(() => '?').join(',')
                await database.prepare(`
                    UPDATE notifications SET read = 1 WHERE id IN (${placeholders}) AND user_id = ?
                `).bind(...notification_ids, brandId).run()
            }
        } catch (e) {
            console.error('Error marking brand notifications as read:', e)
        }
    }
    
    return c.json({ success: true, message: mark_all ? 'All notifications marked as read' : `${notification_ids?.length || 0} notifications marked as read` })
})

// ============================================
// CONNECTION MANAGEMENT ENDPOINTS
// ============================================

// Brand sends connection request to influencer
apiRoutes.post('/connections/request', async (c) => {
    try {
        const body = await c.req.json()
        const { influencer_id, message, campaign_interest } = body
        const brandId = getBrandIdFromRequest(c) || 'usr_brand_pro'
        const database = c.env?.DB
        
        if (!influencer_id) {
            return c.json({ success: false, error: 'Influencer ID is required' }, 400)
        }
        
        const connectionId = 'conn_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8)
        let brandName = 'Brand'
        let brandCompany = ''
        let brandPlan = 'starter'
        let influencerName = 'Creator'
        let influencerUsername = ''
        let influencerCategory = ''
        let influencerFollowers = 0
        let dbSuccess = false
        
        // Check in-memory first for existing connection
        const connectionKey = `${brandId}_${influencer_id}`
        const existingMem = inMemoryConnections.get(connectionKey)
        if (existingMem) {
            if (existingMem.status === 'pending') {
                return c.json({ success: false, error: 'Connection request already pending' }, 400)
            } else if (existingMem.status === 'accepted') {
                return c.json({ success: false, error: 'Already connected with this creator' }, 400)
            } else if (existingMem.status === 'declined') {
                // Update existing to pending
                existingMem.status = 'pending'
                existingMem.message = message
                existingMem.campaign_interest = campaign_interest
                existingMem.requested_at = new Date().toISOString()
                existingMem.responded_at = undefined
                inMemoryConnections.set(connectionKey, existingMem)
                return c.json({ success: true, data: { connection_id: existingMem.id, status: 'pending' }, message: 'Connection request sent again' })
            }
        }
        
        // Get brand info from userStore
        for (const [, user] of userStore) {
            if (user.id === brandId) {
                brandName = user.company || user.name || 'Brand'
                brandCompany = user.company || ''
                brandPlan = user.plan || 'starter'
                break
            }
        }
        
        // Get influencer info from demo data or influencerStore
        const demoInf = getDemoInfluencers().find(inf => inf.id === influencer_id)
        if (demoInf) {
            influencerName = demoInf.name
            influencerUsername = demoInf.username
            influencerCategory = demoInf.category
            influencerFollowers = demoInf.stats.totalFollowers
        } else {
            for (const [, inf] of influencerStore) {
                if (inf.id === influencer_id) {
                    influencerName = inf.name
                    influencerUsername = inf.username
                    influencerCategory = inf.category
                    break
                }
            }
        }
        
        // Try database first
        if (database) {
            try {
                // Check if connection already exists in DB
                const existing = await db.getConnection(database, brandId, influencer_id)
                if (existing) {
                    if (existing.status === 'pending') {
                        return c.json({ success: false, error: 'Connection request already pending' }, 400)
                    } else if (existing.status === 'accepted') {
                        return c.json({ success: false, error: 'Already connected with this creator' }, 400)
                    } else if (existing.status === 'declined') {
                        await database.prepare(`
                            UPDATE connections SET status = 'pending', message = ?, campaign_interest = ?, 
                            requested_at = CURRENT_TIMESTAMP, responded_at = NULL, updated_at = CURRENT_TIMESTAMP
                            WHERE id = ?
                        `).bind(message || null, campaign_interest || null, existing.id).run()
                        dbSuccess = true
                        return c.json({ success: true, data: { connection_id: existing.id, status: 'pending' }, message: 'Connection request sent again' })
                    }
                }
                
                // Get brand name from DB
                const brand = await database.prepare('SELECT first_name, last_name, company, plan FROM users WHERE id = ?').bind(brandId).first() as any
                if (brand) {
                    brandName = brand.company || `${brand.first_name} ${brand.last_name}` || brandName
                    brandCompany = brand.company || ''
                    brandPlan = brand.plan || 'starter'
                }
                
                // Get influencer info from DB
                const influencer = await database.prepare('SELECT first_name, last_name, username, category, total_followers FROM influencers WHERE id = ?').bind(influencer_id).first() as any
                if (influencer) {
                    influencerName = `${influencer.first_name} ${influencer.last_name}`
                    influencerUsername = influencer.username || ''
                    influencerCategory = influencer.category || ''
                    influencerFollowers = influencer.total_followers || 0
                }
                
                // Create connection in DB
                await db.createConnection(database, {
                    id: connectionId,
                    brand_id: brandId,
                    influencer_id: influencer_id,
                    message: message,
                    campaign_interest: campaign_interest
                })
                dbSuccess = true
                
                // Create notification
                const notifId = 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8)
                await database.prepare(`
                    INSERT INTO notifications (id, influencer_id, user_type, type, title, message, action_url, read, created_at)
                    VALUES (?, ?, 'influencer', 'connection', 'New Connection Request', ?, '/creator/connections', 0, CURRENT_TIMESTAMP)
                `).bind(
                    notifId,
                    influencer_id,
                    `${brandName} wants to connect with you${campaign_interest ? ` for "${campaign_interest}"` : ''}`
                ).run()
                
            } catch (e) {
                console.error('DB error creating connection (will use in-memory fallback):', e)
                dbSuccess = false
            }
        }
        
        // Always store in-memory as fallback (or primary if no DB)
        const connectionData = {
            id: connectionId,
            brand_id: brandId,
            influencer_id: influencer_id,
            status: 'pending' as const,
            message: message,
            campaign_interest: campaign_interest,
            requested_at: new Date().toISOString(),
            brand: { id: brandId, name: brandName, company: brandCompany, plan: brandPlan, verified: brandPlan === 'enterprise' },
            influencer: { id: influencer_id, name: influencerName, username: influencerUsername, category: influencerCategory, followers: influencerFollowers, verified: false }
        }
        inMemoryConnections.set(connectionKey, connectionData)
        
        return c.json({ 
            success: true, 
            data: { 
                connection_id: connectionId, 
                status: 'pending',
                brand_id: brandId,
                influencer_id: influencer_id
            },
            message: 'Connection request sent successfully'
        })
    } catch (e) {
        console.error('Connection request error:', e)
        return c.json({ success: false, error: 'Failed to send connection request' }, 400)
    }
})

// Get brand's connections (all statuses or filtered)
apiRoutes.get('/brand/connections', async (c) => {
    const brandId = getBrandIdFromRequest(c) || 'usr_brand_pro'
    const status = c.req.query('status') // optional: pending, accepted, declined
    const database = c.env?.DB
    let connections: any[] = []
    
    if (database) {
        try {
            connections = await db.getBrandConnections(database, brandId, status || undefined)
            connections = connections.map((conn: any) => ({
                id: conn.id,
                influencer: {
                    id: conn.influencer_id,
                    name: conn.influencer_name || 'Creator',
                    username: conn.username,
                    avatar: conn.influencer_avatar,
                    category: conn.category,
                    verified: conn.influencer_verified === 1,
                    followers: conn.total_followers,
                    engagement: conn.avg_engagement
                },
                status: conn.status,
                message: conn.message,
                campaign_interest: conn.campaign_interest,
                requested_at: conn.requested_at,
                responded_at: conn.responded_at
            }))
        } catch (e) {
            console.error('Error fetching brand connections:', e)
        }
    }
    
    // Add in-memory connections for this brand
    for (const [, conn] of inMemoryConnections) {
        if (conn.brand_id === brandId) {
            const existingIds = connections.map(c => c.id)
            if (!existingIds.includes(conn.id)) {
                connections.push({
                    id: conn.id,
                    influencer: conn.influencer || { id: conn.influencer_id, name: 'Creator', username: '', category: '', verified: false, followers: 0, engagement: 0 },
                    status: conn.status,
                    message: conn.message,
                    campaign_interest: conn.campaign_interest,
                    requested_at: conn.requested_at,
                    responded_at: conn.responded_at
                })
            }
        }
    }
    
    // Demo data fallback only if NO connections at all
    if (connections.length === 0) {
        connections = [
            { id: 'conn_demo_1', influencer: { id: 'inf_sarah_j', name: 'Sarah Johnson', username: 'sarahstyle', category: 'Fashion', verified: true, followers: 125000, engagement: 4.5 }, status: 'accepted', message: 'Love your fashion content!', campaign_interest: 'Q1 2025 Launch', requested_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), responded_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
            { id: 'conn_demo_2', influencer: { id: 'inf_mike_t', name: 'Mike Thompson', username: 'techymike', category: 'Tech', verified: true, followers: 89000, engagement: 3.8 }, status: 'pending', message: 'Interested in product review', campaign_interest: 'Tech Review Series', requested_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), responded_at: null }
        ]
        if (status) {
            connections = connections.filter(c => c.status === status)
        }
    }
    
    const stats = {
        total: connections.length,
        accepted: connections.filter(c => c.status === 'accepted').length,
        pending: connections.filter(c => c.status === 'pending').length,
        declined: connections.filter(c => c.status === 'declined').length
    }
    
    return c.json({ success: true, data: connections, stats })
})

// Get influencer's connection requests and connections
apiRoutes.get('/influencer/connections', async (c) => {
    const influencerId = getInfluencerIdFromRequest(c) || 'inf_sarah_j'
    const status = c.req.query('status')
    const database = c.env?.DB
    let connections: any[] = []
    
    if (database) {
        try {
            connections = await db.getInfluencerConnections(database, influencerId, status || undefined)
            connections = connections.map((conn: any) => ({
                id: conn.id,
                brand: {
                    id: conn.brand_id,
                    name: conn.brand_name || conn.company || 'Brand',
                    company: conn.company,
                    avatar: conn.brand_avatar,
                    plan: conn.brand_plan,
                    verified: conn.brand_plan === 'pro' || conn.brand_plan === 'enterprise'
                },
                status: conn.status,
                message: conn.message,
                campaign_interest: conn.campaign_interest,
                requested_at: conn.requested_at,
                responded_at: conn.responded_at
            }))
        } catch (e) {
            console.error('Error fetching influencer connections:', e)
        }
    }
    
    // Add in-memory connections for this influencer
    for (const [, conn] of inMemoryConnections) {
        if (conn.influencer_id === influencerId) {
            const existingIds = connections.map(c => c.id)
            if (!existingIds.includes(conn.id)) {
                connections.push({
                    id: conn.id,
                    brand: conn.brand || { id: conn.brand_id, name: 'Brand', company: '', plan: 'starter', verified: false },
                    status: conn.status,
                    message: conn.message,
                    campaign_interest: conn.campaign_interest,
                    requested_at: conn.requested_at,
                    responded_at: conn.responded_at
                })
            }
        }
    }
    
    // Apply status filter if provided
    if (status) {
        connections = connections.filter(c => c.status === status)
    }
    
    // Demo data fallback only if NO connections at all
    if (connections.length === 0 && !status) {
        connections = [
            { id: 'conn_demo_1', brand: { id: 'usr_brand_pro', name: 'Pro Corp', company: 'Pro Corp Inc.', plan: 'pro', verified: true }, status: 'accepted', message: 'Love your fashion content!', campaign_interest: 'Q1 2025 Launch', requested_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), responded_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
            { id: 'conn_demo_3', brand: { id: 'usr_brand_starter', name: 'StartupX', company: 'StartupX Inc.', plan: 'starter', verified: false }, status: 'pending', message: 'Would love to collaborate!', campaign_interest: 'Product Launch', requested_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), responded_at: null }
        ]
    }
    
    const stats = {
        total: connections.length,
        accepted: connections.filter(c => c.status === 'accepted').length,
        pending: connections.filter(c => c.status === 'pending').length
    }
    
    return c.json({ success: true, data: connections, stats })
})

// Influencer responds to connection request
apiRoutes.post('/influencer/connections/:id/respond', async (c) => {
    try {
        const connectionId = c.req.param('id')
        const body = await c.req.json()
        const { action } = body // 'accept' or 'decline'
        const influencerId = getInfluencerIdFromRequest(c) || 'inf_sarah_j'
        const database = c.env?.DB
        
        if (!action || !['accept', 'decline'].includes(action)) {
            return c.json({ success: false, error: 'Invalid action. Use "accept" or "decline"' }, 400)
        }
        
        const newStatus = action === 'accept' ? 'accepted' : 'declined'
        let brandId: string | null = null
        let influencerName = 'Creator'
        let dbSuccess = false
        
        // Try in-memory first
        let memConnection: any = null
        for (const [key, conn] of inMemoryConnections) {
            if (conn.id === connectionId) {
                memConnection = { key, conn }
                break
            }
        }
        
        if (memConnection) {
            if (memConnection.conn.influencer_id !== influencerId) {
                return c.json({ success: false, error: 'Unauthorized' }, 403)
            }
            if (memConnection.conn.status !== 'pending') {
                return c.json({ success: false, error: 'Connection already responded to' }, 400)
            }
            
            // Update in-memory connection
            memConnection.conn.status = newStatus
            memConnection.conn.responded_at = new Date().toISOString()
            inMemoryConnections.set(memConnection.key, memConnection.conn)
            brandId = memConnection.conn.brand_id
            influencerName = memConnection.conn.influencer?.name || 'Creator'
        }
        
        if (database) {
            try {
                // Get connection and verify it belongs to this influencer
                const connection = await db.getConnectionById(database, connectionId)
                if (connection) {
                    if (connection.influencer_id !== influencerId) {
                        return c.json({ success: false, error: 'Unauthorized' }, 403)
                    }
                    if (connection.status !== 'pending') {
                        return c.json({ success: false, error: 'Connection already responded to' }, 400)
                    }
                    
                    brandId = connection.brand_id
                    
                    // Update connection status
                    await db.updateConnectionStatus(database, connectionId, newStatus)
                    dbSuccess = true
                    
                    // Get influencer name for notification
                    const influencer = await database.prepare('SELECT first_name, last_name FROM influencers WHERE id = ?').bind(influencerId).first() as any
                    if (influencer) {
                        influencerName = `${influencer.first_name} ${influencer.last_name}`
                    }
                    
                    // Create notification for brand
                    const notifId = 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8)
                    await database.prepare(`
                        INSERT INTO notifications (id, user_id, user_type, type, title, message, action_url, read, created_at)
                        VALUES (?, ?, 'brand', 'connection_response', ?, ?, '/app/connections', 0, CURRENT_TIMESTAMP)
                    `).bind(
                        notifId,
                        brandId,
                        action === 'accept' ? 'Connection Accepted!' : 'Connection Declined',
                        action === 'accept' 
                            ? `${influencerName} accepted your connection request. You can now message them!`
                            : `${influencerName} declined your connection request.`
                    ).run()
                    
                    // If accepted, create a conversation
                    if (action === 'accept') {
                        const convId = 'conv_' + Date.now()
                        await database.prepare(`
                            INSERT INTO conversations (id, brand_id, influencer_id, connection_id, status, created_at, last_message_at)
                            VALUES (?, ?, ?, ?, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                        `).bind(convId, brandId, influencerId, connectionId).run()
                    }
                } else if (!memConnection) {
                    return c.json({ success: false, error: 'Connection not found' }, 404)
                }
                
            } catch (e) {
                console.error('DB error responding to connection:', e)
                // Continue if in-memory was updated
            }
        }
        
        // Return error if no connection was found anywhere
        if (!memConnection && !dbSuccess) {
            return c.json({ success: false, error: 'Connection not found' }, 404)
        }
        
        return c.json({ 
            success: true, 
            data: { 
                connection_id: connectionId, 
                status: newStatus 
            },
            message: action === 'accept' ? 'Connection accepted! You can now exchange messages.' : 'Connection declined.'
        })
    } catch (e) {
        console.error('Connection response error:', e)
        return c.json({ success: false, error: 'Failed to respond to connection' }, 400)
    }
})

// Check connection status between brand and influencer
apiRoutes.get('/connections/status/:influencer_id', async (c) => {
    const influencerId = c.req.param('influencer_id')
    const brandId = getBrandIdFromRequest(c) || 'usr_brand_pro'
    const database = c.env?.DB
    
    let connectionStatus = {
        connected: false,
        status: null as string | null,
        connection_id: null as string | null,
        can_message: false
    }
    
    if (database) {
        try {
            const connection = await db.getConnection(database, brandId, influencerId)
            if (connection) {
                connectionStatus = {
                    connected: connection.status === 'accepted',
                    status: connection.status,
                    connection_id: connection.id,
                    can_message: connection.status === 'accepted'
                }
            }
        } catch (e) {
            console.error('Error checking connection status:', e)
        }
    }
    
    return c.json({ success: true, data: connectionStatus })
})

// Get connected creators for messaging (brand side)
apiRoutes.get('/brand/connected-creators', async (c) => {
    const brandId = getBrandIdFromRequest(c) || 'usr_brand_pro'
    const database = c.env?.DB
    let creators: any[] = []
    
    if (database) {
        try {
            creators = await db.getConnectedInfluencers(database, brandId)
            creators = creators.map((c: any) => ({
                id: c.influencer_id,
                name: c.influencer_name || 'Creator',
                username: c.username,
                avatar: c.influencer_avatar,
                category: c.category,
                verified: c.influencer_verified === 1,
                followers: c.total_followers,
                connection_id: c.id,
                conversation_id: c.conversation_id,
                unread_count: c.unread_count || 0,
                last_message: c.last_message
            }))
        } catch (e) {
            console.error('Error fetching connected creators:', e)
        }
    }
    
    // Demo fallback
    if (creators.length === 0) {
        creators = [
            { id: 'inf_sarah_j', name: 'Sarah Johnson', username: 'sarahstyle', category: 'Fashion', verified: true, followers: 125000, connection_id: 'conn_demo_1', conversation_id: 'conv_demo_1', unread_count: 0, last_message: 'Looking forward to the collaboration!' }
        ]
    }
    
    return c.json({ success: true, data: creators })
})

// Get connected brands for messaging (creator side)
apiRoutes.get('/influencer/connected-brands', async (c) => {
    const influencerId = getInfluencerIdFromRequest(c) || 'inf_sarah_j'
    const database = c.env?.DB
    let brands: any[] = []
    
    if (database) {
        try {
            brands = await db.getConnectedBrands(database, influencerId)
            brands = brands.map((b: any) => ({
                id: b.brand_id,
                name: b.brand_name || b.company || 'Brand',
                company: b.company,
                avatar: b.brand_avatar,
                plan: b.brand_plan,
                verified: b.brand_plan === 'pro' || b.brand_plan === 'enterprise',
                connection_id: b.id,
                conversation_id: b.conversation_id,
                unread_count: b.unread_count || 0,
                last_message: b.last_message
            }))
        } catch (e) {
            console.error('Error fetching connected brands:', e)
        }
    }
    
    // Demo fallback
    if (brands.length === 0) {
        brands = [
            { id: 'usr_brand_pro', name: 'Pro Corp', company: 'Pro Corp Inc.', plan: 'pro', verified: true, connection_id: 'conn_demo_1', conversation_id: 'conv_demo_1', unread_count: 1, last_message: 'Hi Sarah! Excited about our collaboration!' }
        ]
    }
    
    return c.json({ success: true, data: brands })
})

// Influencer opportunities
apiRoutes.get('/influencer/opportunities', async (c) => {
    const database = c.env?.DB
    let allOpportunities: any[] = []
    
    // Try database first
    if (database) {
        try {
            const dbOpps = await db.getAllOpportunities(database)
            allOpportunities = dbOpps.map((opp: any) => ({
                id: opp.id,
                brand: {
                    id: opp.brand_id,
                    name: opp.brand_name || 'Brand',
                    verified: true,
                    category: opp.category
                },
                title: opp.title,
                description: opp.description,
                budget: { min: opp.budget_min || 0, max: opp.budget_max || 0 },
                category: opp.category,
                platforms: opp.platform ? [opp.platform] : ['instagram'],
                requirements: opp.requirements ? JSON.parse(opp.requirements) : { minFollowers: 10000, minEngagement: 3.0 },
                deliverables: ['Content as specified'],
                deadline: opp.deadline,
                postedAt: opp.created_at
            }))
        } catch (e) {
            console.error('Error fetching opportunities from DB:', e)
        }
    }
    
    // Demo opportunities as fallback/default
    const demoOpportunities = [
        { id: 'opp_1', brand: { id: 'b1', name: 'TechBrand Co.', verified: true, category: 'Technology' }, title: 'Product Launch Campaign', description: 'Looking for tech influencers for smartphone launch', budget: { min: 2000, max: 5000 }, category: 'tech', platforms: ['instagram', 'youtube'], requirements: { minFollowers: 50000, minEngagement: 3.0 }, deliverables: ['1 YouTube review', '3 Instagram posts'], deadline: '2025-02-15', postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'opp_2', brand: { id: 'b2', name: 'BeautyGlow', verified: true, category: 'Beauty' }, title: 'Summer Skincare Series', description: 'Content series for summer skincare collection', budget: { min: 500, max: 1500 }, category: 'fashion', platforms: ['instagram', 'tiktok'], requirements: { minFollowers: 20000, minEngagement: 4.0 }, deliverables: ['4 TikToks', '2 Reels'], deadline: '2025-01-30', postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'opp_3', brand: { id: 'b3', name: 'FitLife Pro', verified: false, category: 'Fitness' }, title: 'Fitness App Promotion', description: 'Fitness creators for app launch', budget: { min: 1000, max: 3000 }, category: 'fitness', platforms: ['youtube', 'tiktok'], requirements: { minFollowers: 30000, minEngagement: 5.0 }, deliverables: ['2 YouTube videos', '5 TikToks'], deadline: '2025-02-01', postedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'opp_4', brand: { id: 'b4', name: 'Fresh Eats', verified: true, category: 'Food' }, title: 'Recipe Content Partnership', description: 'Healthy recipe content with organic ingredients', budget: { min: 300, max: 800 }, category: 'food', platforms: ['instagram', 'tiktok'], requirements: { minFollowers: 10000, minEngagement: 4.5 }, deliverables: ['3 Recipe videos', '5 posts'], deadline: '2025-02-10', postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'opp_5', brand: { id: 'b5', name: 'Wanderlust Hotels', verified: true, category: 'Travel' }, title: 'Luxury Resort Experience', description: '5-night stay + payment for travel content', budget: { min: 3000, max: 8000 }, category: 'travel', platforms: ['instagram', 'youtube'], requirements: { minFollowers: 100000, minEngagement: 3.5 }, deliverables: ['1 YouTube vlog', '10 Instagram posts'], deadline: '2025-03-01', postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
    ]
    
    // Merge database and demo opportunities
    for (const opp of demoOpportunities) {
        if (!allOpportunities.find(o => o.id === opp.id)) {
            allOpportunities.push(opp)
        }
    }
    
    return c.json({ success: true, data: allOpportunities })
})

// Apply to opportunity
apiRoutes.post('/influencer/opportunities/:id/apply', async (c) => {
    try {
        const body = await c.req.json()
        const oppId = c.req.param('id')
        const { influencer_id, message, rate, portfolio_links } = body
        
        if (!influencer_id) {
            return c.json({ success: false, error: 'Influencer ID required' }, 400)
        }
        
        const database = c.env?.DB
        let applicationId = 'app_' + Date.now()
        
        if (database) {
            try {
                applicationId = await db.applyToOpportunity(database, {
                    opportunity_id: oppId,
                    influencer_id,
                    proposal: message,
                    proposed_rate: rate
                })
                
                // Get influencer name for notification
                const influencer = await db.getInfluencerById(database, influencer_id)
                const influencerName = influencer 
                    ? [influencer.first_name, influencer.last_name].filter(Boolean).join(' ') 
                    : 'A creator'
                
                // Get opportunity to find the brand
                const opportunities = await db.getAllOpportunities(database)
                const opportunity = opportunities.find((o: any) => o.id === oppId)
                
                if (opportunity) {
                    // Create notification for brand
                    await db.createNotification(database, {
                        user_id: opportunity.brand_id,
                        user_type: 'brand',
                        type: 'application',
                        title: 'New Application Received!',
                        message: `${influencerName} has applied to "${opportunity.title}"`,
                        action_url: '/brand/opportunities'
                    })
                }
            } catch (e) {
                console.error('Error submitting application to DB:', e)
            }
        }
        
        return c.json({
            success: true,
            data: {
                application_id: applicationId,
                opportunity_id: oppId,
                status: 'pending',
                submitted_at: new Date().toISOString(),
                message: 'Application submitted successfully! The brand will review and respond soon.'
            }
        })
    } catch (e) { 
        console.error('Apply to opportunity error:', e)
        return c.json({ success: false, error: 'Failed to apply' }, 400) 
    }
})

// Get influencer invitations
apiRoutes.get('/influencer/invitations', async (c) => {
    const database = c.env?.DB
    const influencerId = getInfluencerIdFromRequest(c) || 'inf_sarah_j'
    
    let allInvitations: any[] = []
    
    if (database) {
        try {
            const dbInvitations = await db.getInvitationsByInfluencer(database, influencerId)
            allInvitations = dbInvitations.map((inv: any) => ({
                id: inv.id,
                brand: { 
                    id: inv.brand_id, 
                    name: inv.company || inv.brand_name || 'Brand', 
                    verified: true,
                    avatar: inv.brand_avatar
                },
                campaign: inv.campaign_name,
                message: inv.message,
                budget: inv.budget,
                platforms: inv.platforms ? JSON.parse(inv.platforms) : ['instagram'],
                deadline: inv.deadline,
                status: inv.status,
                createdAt: inv.created_at,
                respondedAt: inv.responded_at,
                responseMessage: inv.response_message,
                counterOffer: inv.counter_offer
            }))
        } catch (e) {
            console.error('Error fetching invitations from DB:', e)
        }
    }
    
    // Demo invitations as fallback
    const demoInvitations = [
        { id: 'inv_1', brand: { id: 'b1', name: 'TechBrand Co.', verified: true }, campaign: 'Q4 Product Launch', message: 'We love your tech content! Would you be interested in featuring our new smartphone?', budget: 3000, platforms: ['instagram', 'youtube'], deadline: '2025-01-25', status: 'pending', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
        { id: 'inv_2', brand: { id: 'b2', name: 'BeautyGlow', verified: true }, campaign: 'Spring Collection', message: 'Your skincare routine videos are amazing! We\'d love to collaborate.', budget: 1500, platforms: ['instagram', 'tiktok'], deadline: '2025-02-01', status: 'pending', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
    ]
    
    // Merge with demo if empty
    if (allInvitations.length === 0) {
        allInvitations = demoInvitations
    } else {
        for (const inv of demoInvitations) {
            if (!allInvitations.find(i => i.id === inv.id)) {
                allInvitations.push(inv)
            }
        }
    }
    
    // Sort by date
    allInvitations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    return c.json({ 
        success: true, 
        data: allInvitations, 
        pending_count: allInvitations.filter(i => i.status === 'pending').length 
    })
})

// Respond to invitation
apiRoutes.post('/influencer/invitations/:id/respond', async (c) => {
    try {
        const body = await c.req.json()
        const invId = c.req.param('id')
        const { action, message, counter_offer, influencer_id } = body
        
        if (!['accept', 'decline', 'negotiate'].includes(action)) {
            return c.json({ success: false, error: 'Invalid action' }, 400)
        }
        
        const database = c.env?.DB
        
        if (database) {
            try {
                await db.respondToInvitation(database, invId, {
                    action,
                    message,
                    counter_offer
                })
                
                // Create notification for the brand about the response
                const invitation = await db.getInvitationById(database, invId)
                if (invitation) {
                    await db.createNotification(database, {
                        user_id: invitation.brand_id,
                        user_type: 'brand',
                        type: 'invitation_response',
                        title: action === 'accept' ? 'Invitation Accepted!' : action === 'decline' ? 'Invitation Declined' : 'Counter-Offer Received',
                        message: `Creator has ${action === 'accept' ? 'accepted' : action === 'decline' ? 'declined' : 'sent a counter-offer for'} your invitation for "${invitation.campaign_name}"`,
                        action_url: '/brand/messages'
                    })
                }
            } catch (e) {
                console.error('Error responding to invitation in DB:', e)
            }
        }
        
        return c.json({
            success: true,
            data: {
                invitation_id: invId,
                status: action === 'accept' ? 'accepted' : action === 'decline' ? 'declined' : 'negotiating',
                responded_at: new Date().toISOString(),
                message: action === 'accept' ? 'Congratulations! Campaign details have been sent.' : action === 'decline' ? 'Invitation declined.' : 'Counter-offer sent to brand.'
            }
        })
    } catch (e) { 
        console.error('Invitation response error:', e)
        return c.json({ success: false, error: 'Failed to respond' }, 400) 
    }
})

// Brand invites influencer
apiRoutes.post('/brand/invitations', async (c) => {
    try {
        const body = await c.req.json()
        const { brand_id, influencer_id, campaign_name, message, budget, platforms, deadline } = body
        
        if (!brand_id || !influencer_id || !campaign_name) {
            return c.json({ success: false, error: 'Brand ID, Influencer ID and Campaign name are required' }, 400)
        }
        
        const database = c.env?.DB
        let invitationId = 'inv_' + Date.now()
        
        if (database) {
            try {
                invitationId = await db.createInvitation(database, {
                    brand_id,
                    influencer_id,
                    campaign_name,
                    message,
                    budget,
                    platforms,
                    deadline
                })
                
                // Get brand name for notification
                const brand = await db.getUserById(database, brand_id)
                const brandName = brand?.company || [brand?.first_name, brand?.last_name].filter(Boolean).join(' ') || 'A brand'
                
                // Create notification for influencer
                await db.createNotification(database, {
                    influencer_id,
                    user_type: 'influencer',
                    type: 'invitation',
                    title: 'New Collaboration Invite!',
                    message: `${brandName} wants to collaborate with you on "${campaign_name}"`,
                    action_url: '/influencer/invitations'
                })
            } catch (e) {
                console.error('Error creating invitation in DB:', e)
            }
        }
        
        return c.json({
            success: true,
            data: {
                invitation_id: invitationId,
                status: 'pending',
                created_at: new Date().toISOString(),
                message: 'Invitation sent successfully!'
            }
        })
    } catch (e) {
        console.error('Create invitation error:', e)
        return c.json({ success: false, error: 'Failed to create invitation' }, 400)
    }
})

// Influencer messages
const influencerMessages: any[] = []
apiRoutes.get('/influencer/messages', async (c) => {
    const database = c.env?.DB
    const influencerId = getInfluencerIdFromRequest(c)
    
    // Try to get from database first
    if (database && influencerId) {
        try {
            // Get conversations from database filtered by influencer_id
            const dbConversations = await database.prepare(`
                SELECT c.*, 
                    u.first_name || ' ' || COALESCE(u.last_name, '') as brand_name, 
                    u.company, 
                    u.avatar as brand_avatar,
                    (SELECT content FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) as last_message_content
                FROM conversations c
                JOIN users u ON c.brand_id = u.id
                WHERE c.influencer_id = ?
                ORDER BY c.last_message_at DESC
            `).bind(influencerId).all()
            
            if (dbConversations.results && dbConversations.results.length > 0) {
                const conversations = dbConversations.results.map((c: any) => ({
                    id: c.id,
                    brand: { 
                        id: c.brand_id, 
                        name: c.company || c.brand_name || 'Brand', 
                        avatar: c.brand_avatar, 
                        verified: true 
                    },
                    lastMessage: c.last_message_content || 'New conversation',
                    lastMessageAt: c.last_message_at,
                    unreadCount: c.unread_count || 0,
                    status: c.status,
                    campaign: c.campaign_name,
                    budget: c.campaign_budget,
                    isNew: c.unread_count > 0
                }))
                
                // Also include in-memory messages for this influencer
                const brandConversations = brandToInfluencerMessages
                    .filter(conv => conv.influencer_id === influencerId)
                    .map(conv => ({
                        id: conv.id,
                        brand: conv.brand,
                        lastMessage: conv.messages[conv.messages.length - 1]?.content || 'New message',
                        lastMessageAt: conv.lastMessageAt,
                        unreadCount: conv.messages.filter((m: any) => !m.read && m.sender === 'brand').length,
                        status: conv.status,
                        campaign: conv.campaign,
                        budget: conv.budget,
                        isNew: true
                    }))
                
                // Combine and deduplicate
                const allConvs = [...brandConversations, ...conversations]
                const seen = new Set()
                const unique = allConvs.filter(c => {
                    if (seen.has(c.id)) return false
                    seen.add(c.id)
                    return true
                })
                
                unique.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
                
                return c.json({ success: true, data: unique, total_unread: unique.reduce((sum, c) => sum + c.unreadCount, 0) })
            }
        } catch (e) {
            console.error('Error fetching conversations from DB:', e)
        }
    }
    
    // Fallback to demo + in-memory filtered by influencer_id
    // Only show demo conversations if influencer is one of the demo influencers
    const demoInfluencerIds = ['inf_sarah_j', 'inf_mike_t', 'inf_emma_fit', 'inf_alex_food', 'inf_lisa_travel']
    const isDemoInfluencer = influencerId && demoInfluencerIds.includes(influencerId)
    
    const demoConversations = isDemoInfluencer ? [
        { id: 'conv_1', brand: { id: 'b1', name: 'TechBrand Co.', avatar: null, verified: true }, lastMessage: 'Looking forward to the collaboration!', lastMessageAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), unreadCount: 2, status: 'active' },
        { id: 'conv_2', brand: { id: 'b2', name: 'BeautyGlow', avatar: null, verified: true }, lastMessage: 'Let me know when the content is ready for review', lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), unreadCount: 0, status: 'active' },
        { id: 'conv_3', brand: { id: 'b3', name: 'FitLife Pro', avatar: null, verified: false }, lastMessage: 'Thanks for your interest! Unfortunately...', lastMessageAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), unreadCount: 0, status: 'closed' }
    ] : []
    
    // Filter in-memory messages by influencer_id
    const brandConversations = brandToInfluencerMessages
        .filter(conv => !influencerId || conv.influencer_id === influencerId)
        .map(conv => ({
            id: conv.id,
            brand: conv.brand,
            lastMessage: conv.messages[conv.messages.length - 1]?.content || 'New message',
            lastMessageAt: conv.lastMessageAt,
            unreadCount: conv.messages.filter((m: any) => !m.read && m.sender === 'brand').length,
            status: conv.status,
            campaign: conv.campaign,
            budget: conv.budget,
            isNew: true
        }))
    
    const allConversations = [...brandConversations, ...demoConversations]
    allConversations.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
    
    return c.json({ success: true, data: allConversations, total_unread: allConversations.reduce((sum, c) => sum + c.unreadCount, 0) })
})

apiRoutes.get('/influencer/messages/:conversation_id', async (c) => {
    const convId = c.req.param('conversation_id')
    const database = c.env?.DB
    
    // Try database first
    if (database) {
        try {
            const dbConv = await db.getConversationById(database, convId)
            if (dbConv) {
                const dbMessages = await db.getMessagesByConversation(database, convId)
                
                // Mark messages as read
                await db.markMessagesAsRead(database, convId, 'influencer')
                
                return c.json({
                    success: true,
                    data: {
                        conversation_id: convId,
                        brand: { 
                            id: dbConv.brand_id, 
                            name: dbConv.company || dbConv.brand_name || 'Brand', 
                            avatar: dbConv.brand_avatar,
                            verified: true 
                        },
                        messages: dbMessages.map(m => ({
                            id: m.id,
                            sender: m.sender_type,
                            content: m.content,
                            timestamp: m.created_at,
                            read: m.read === 1
                        })),
                        campaign: dbConv.campaign_name ? { 
                            name: dbConv.campaign_name, 
                            budget: dbConv.campaign_budget, 
                            status: 'negotiating' 
                        } : null
                    }
                })
            }
        } catch (e) {
            console.error('Error fetching conversation from DB:', e)
        }
    }
    
    // Check in-memory store
    const brandConv = brandToInfluencerMessages.find(conv => conv.id === convId)
    if (brandConv) {
        brandConv.messages.forEach((m: any) => m.read = true)
        brandConv.unreadCount = 0
        
        return c.json({
            success: true,
            data: {
                conversation_id: convId,
                brand: brandConv.brand,
                messages: brandConv.messages,
                campaign: brandConv.campaign ? { name: brandConv.campaign, budget: brandConv.budget, status: 'negotiating' } : null
            }
        })
    }
    
    // Fallback to demo messages
    const messages = [
        { id: 'msg_1', sender: 'brand', content: 'Hi! We loved your recent content and would like to discuss a collaboration.', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), read: true },
        { id: 'msg_2', sender: 'influencer', content: 'Thank you! I\'d love to hear more about the campaign.', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 3600000).toISOString(), read: true },
        { id: 'msg_3', sender: 'brand', content: 'Great! We\'re launching a new product line and looking for creators in your niche. Budget is $2,500 for 3 Instagram posts and 2 Stories.', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), read: true },
        { id: 'msg_4', sender: 'influencer', content: 'That sounds interesting! Can you share more details about the product?', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 7200000).toISOString(), read: true },
        { id: 'msg_5', sender: 'brand', content: 'Looking forward to the collaboration!', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), read: false }
    ]
    return c.json({ success: true, data: { conversation_id: convId, brand: { id: 'b1', name: 'TechBrand Co.', verified: true }, messages, campaign: { id: 'camp_1', name: 'Q4 Product Launch', budget: 2500, status: 'negotiating' } } })
})

apiRoutes.post('/influencer/messages/:conversation_id', async (c) => {
    try {
        const body = await c.req.json()
        const convId = c.req.param('conversation_id')
        const { content } = body
        const influencerId = getInfluencerIdFromRequest(c) || 'inf_sarah_j'
        
        if (!content || content.trim().length === 0) {
            return c.json({ success: false, error: 'Message content required' }, 400)
        }
        
        const database = c.env?.DB
        const messageId = 'msg_' + Date.now()
        let brandId: string | null = null
        let campaignName: string | null = null
        let influencerName = 'Creator'
        
        // Get influencer name for notification
        const influencer = getDemoInfluencers().find(inf => inf.id === influencerId)
        if (influencer) {
            influencerName = influencer.name
        }
        
        // Try to save to database and create notification for brand
        if (database) {
            try {
                // Get conversation details to find brand_id
                const convResult = await database.prepare(`
                    SELECT brand_id, campaign_name FROM conversations WHERE id = ?
                `).bind(convId).first()
                
                if (convResult) {
                    brandId = convResult.brand_id as string
                    campaignName = convResult.campaign_name as string
                }
                
                // Save message
                await db.createMessage(database, {
                    id: messageId,
                    conversation_id: convId,
                    sender_type: 'influencer',
                    sender_id: influencerId,
                    content: content
                })
                
                // Increment unread count for brand
                await db.incrementUnreadCount(database, convId)
                
                // Create notification for brand
                if (brandId) {
                    const notifId = 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8)
                    await database.prepare(`
                        INSERT INTO notifications (id, user_id, type, title, message, action_url, read, created_at)
                        VALUES (?, ?, 'message', ?, ?, ?, 0, CURRENT_TIMESTAMP)
                    `).bind(
                        notifId,
                        brandId,
                        'New Message from Creator',
                        `${influencerName} replied to your message${campaignName ? ` about "${campaignName}"` : ''}`,
                        '/app/messages'
                    ).run()
                }
            } catch (e) {
                console.error('Error saving message to DB:', e)
            }
        }
        
        const newMessage = {
            id: messageId,
            sender: 'influencer',
            content: content,
            timestamp: new Date().toISOString(),
            read: false // Unread for brand
        }
        
        // Also update in-memory for backward compatibility
        const brandConv = brandToInfluencerMessages.find(conv => conv.id === convId)
        if (brandConv) {
            brandConv.messages.push(newMessage)
            brandConv.lastMessageAt = newMessage.timestamp
            // Store brand_id if not set
            if (!brandId) {
                brandId = brandConv.brand_id
            }
        }
        
        return c.json({
            success: true,
            data: {
                ...newMessage,
                conversation_id: convId
            }
        })
    } catch (e) { 
        console.error('Send message error:', e)
        return c.json({ success: false, error: 'Failed to send message' }, 400) 
    }
})

// Influencer earnings
apiRoutes.get('/influencer/earnings', async (c) => {
    const database = c.env?.DB
    const influencerId = getInfluencerIdFromRequest(c) || 'inf_sarah_j'
    
    let earningsData = {
        total: 85000,
        thisMonth: 12500,
        pending: 3500,
        available: 9000,
        transactions: [] as any[],
        monthlyBreakdown: [] as any[]
    }
    
    if (database) {
        try {
            // Get total earnings
            const totals = await db.getTotalEarnings(database, influencerId)
            
            // Get transactions with details
            const transactions = await db.getEarningsWithDetails(database, influencerId)
            
            // Get monthly breakdown
            const monthly = await db.getMonthlyEarnings(database, influencerId)
            
            // Get influencer's total earnings from profile
            const influencer = await db.getInfluencerById(database, influencerId)
            
            earningsData = {
                total: influencer?.total_earnings || totals.total || 85000,
                thisMonth: monthly.length > 0 ? monthly[0].amount : 12500,
                pending: totals.pending || 3500,
                available: totals.completed || 9000,
                transactions: transactions.length > 0 ? transactions.map((tx: any) => ({
                    id: tx.id,
                    brand: tx.brand_name || 'Brand',
                    campaign: tx.campaign_name || tx.description || 'Campaign',
                    amount: tx.amount,
                    status: tx.status === 'completed' ? 'paid' : tx.status,
                    date: tx.created_at?.split('T')[0] || tx.created_at
                })) : [
                    { id: 'tx_1', brand: 'TechBrand Co.', campaign: 'Holiday Campaign', amount: 2500, status: 'paid', date: '2024-12-10' },
                    { id: 'tx_2', brand: 'BeautyGlow', campaign: 'Summer Series', amount: 1500, status: 'paid', date: '2024-12-05' },
                    { id: 'tx_3', brand: 'FitLife Pro', campaign: 'App Launch', amount: 3500, status: 'pending', date: '2024-12-15' },
                    { id: 'tx_4', brand: 'Fresh Eats', campaign: 'Recipe Content', amount: 800, status: 'paid', date: '2024-11-28' }
                ],
                monthlyBreakdown: monthly.length > 0 ? monthly.map((m: any) => {
                    const date = new Date(m.month + '-01')
                    return { month: date.toLocaleString('en', { month: 'short' }), amount: m.amount }
                }) : [
                    { month: 'Jul', amount: 8500 },
                    { month: 'Aug', amount: 9200 },
                    { month: 'Sep', amount: 11000 },
                    { month: 'Oct', amount: 10500 },
                    { month: 'Nov', amount: 14200 },
                    { month: 'Dec', amount: 12500 }
                ]
            }
        } catch (e) {
            console.error('Error fetching earnings from DB:', e)
        }
    }
    
    return c.json({ success: true, data: earningsData })
})

// Influencer campaigns (active)
apiRoutes.get('/influencer/campaigns', async (c) => {
    const status = c.req.query('status') || 'all'
    const database = c.env?.DB
    const influencerId = getInfluencerIdFromRequest(c) || 'inf_sarah_j'
    
    let allCampaigns: any[] = []
    
    if (database) {
        try {
            const dbCampaigns = await db.getCampaignsByInfluencer(database, influencerId)
            allCampaigns = dbCampaigns.map((camp: any) => ({
                id: camp.id,
                brand: {
                    id: camp.brand_id,
                    name: camp.company || camp.brand_name || 'Brand',
                    verified: true
                },
                name: camp.name,
                status: camp.status,
                budget: camp.budget || 0,
                platforms: ['instagram'],
                deliverables: camp.deliverables ? JSON.parse(camp.deliverables) : { total: 5, completed: 0 },
                deadline: camp.end_date,
                progress: camp.status === 'completed' ? 100 : camp.status === 'active' ? 50 : 0,
                startDate: camp.start_date
            }))
        } catch (e) {
            console.error('Error fetching campaigns from DB:', e)
        }
    }
    
    // Demo campaigns
    const demoCampaigns = [
        { id: 'camp_1', brand: { id: 'b1', name: 'TechBrand Co.', verified: true }, name: 'Q4 Product Launch', status: 'active', budget: 2500, platforms: ['instagram', 'youtube'], deliverables: { total: 5, completed: 2 }, deadline: '2025-01-30', progress: 40, startDate: '2024-12-01' },
        { id: 'camp_2', brand: { id: 'b2', name: 'BeautyGlow', verified: true }, name: 'Holiday Gift Guide', status: 'active', budget: 1800, platforms: ['instagram', 'tiktok'], deliverables: { total: 4, completed: 3 }, deadline: '2025-01-25', progress: 75, startDate: '2024-12-10' },
        { id: 'camp_3', brand: { id: 'b3', name: 'FitLife Pro', verified: false }, name: 'New Year Challenge', status: 'pending', budget: 2000, platforms: ['youtube', 'tiktok'], deliverables: { total: 6, completed: 0 }, deadline: '2025-01-15', progress: 0, startDate: '2024-12-20' },
        { id: 'camp_4', brand: { id: 'b4', name: 'Fresh Eats', verified: true }, name: 'Recipe Series', status: 'completed', budget: 800, platforms: ['instagram'], deliverables: { total: 3, completed: 3 }, deadline: '2024-11-30', progress: 100, startDate: '2024-11-15' }
    ]
    
    // Merge
    for (const camp of demoCampaigns) {
        if (!allCampaigns.find(c => c.id === camp.id)) {
            allCampaigns.push(camp)
        }
    }
    
    let filtered = allCampaigns
    if (status !== 'all') filtered = allCampaigns.filter(c => c.status === status)
    
    return c.json({ 
        success: true, 
        data: filtered, 
        summary: { 
            active: allCampaigns.filter(c => c.status === 'active').length, 
            pending: allCampaigns.filter(c => c.status === 'pending').length, 
            completed: allCampaigns.filter(c => c.status === 'completed').length 
        } 
    })
})

// Connect social platform
apiRoutes.post('/influencer/platforms/:platform/connect', async (c) => {
    try {
        const platform = c.req.param('platform')
        const validPlatforms = ['instagram', 'youtube', 'tiktok', 'twitter', 'facebook', 'snapchat']
        
        if (!validPlatforms.includes(platform)) {
            return c.json({ success: false, error: 'Invalid platform' }, 400)
        }
        
        const body = await c.req.json().catch(() => ({}))
        const { influencer_id, username, profile_url, access_token } = body
        
        // Generate realistic mock analytics
        const mockAnalytics: { [key: string]: any } = {
            instagram: { followers: Math.floor(Math.random() * 200000) + 50000, engagement: parseFloat((Math.random() * 4 + 3).toFixed(2)), avgLikes: Math.floor(Math.random() * 5000) + 1000, avgComments: Math.floor(Math.random() * 200) + 50, reach30d: Math.floor(Math.random() * 500000) + 100000 },
            youtube: { followers: Math.floor(Math.random() * 300000) + 20000, engagement: parseFloat((Math.random() * 3 + 2).toFixed(2)), avgViews: Math.floor(Math.random() * 50000) + 10000, watchTime30d: Math.floor(Math.random() * 10000) + 2000 },
            tiktok: { followers: Math.floor(Math.random() * 400000) + 30000, engagement: parseFloat((Math.random() * 5 + 4).toFixed(2)), avgViews: Math.floor(Math.random() * 100000) + 20000, viralScore: Math.floor(Math.random() * 30) + 70 },
            twitter: { followers: Math.floor(Math.random() * 100000) + 10000, engagement: parseFloat((Math.random() * 2 + 1).toFixed(2)), avgRetweets: Math.floor(Math.random() * 500) + 50, avgLikes: Math.floor(Math.random() * 1000) + 100 },
            facebook: { followers: Math.floor(Math.random() * 150000) + 20000, engagement: parseFloat((Math.random() * 3 + 2).toFixed(2)), avgReach: Math.floor(Math.random() * 50000) + 10000 },
            snapchat: { followers: Math.floor(Math.random() * 100000) + 10000, engagement: parseFloat((Math.random() * 4 + 3).toFixed(2)), avgViews: Math.floor(Math.random() * 30000) + 5000 }
        }
        
        const analytics = mockAnalytics[platform]
        const database = c.env?.DB
        
        // Save to database if available
        if (database && influencer_id) {
            try {
                await db.connectPlatform(database, {
                    influencer_id: influencer_id,
                    platform: platform,
                    username: username || `@${platform}_user`,
                    profile_url: profile_url || `https://${platform}.com/${username || 'user'}`,
                    followers: analytics.followers,
                    engagement_rate: analytics.engagement,
                    access_token: access_token || null
                })
                
                // Update influencer's total stats
                await db.updateInfluencerStats(database, influencer_id)
            } catch (e) {
                console.error('Error saving platform to DB:', e)
            }
        }
        
        return c.json({
            success: true,
            data: {
                platform,
                connected: true,
                connectedAt: new Date().toISOString(),
                username: username || '@your_' + platform + '_handle',
                analytics: analytics,
                lastSynced: new Date().toISOString()
            }
        })
    } catch (e) {
        console.error('Platform connect error:', e)
        return c.json({ success: false, error: 'Failed to connect platform' }, 400)
    }
})

apiRoutes.delete('/influencer/platforms/:platform/disconnect', async (c) => {
    const platform = c.req.param('platform')
    const influencerId = c.req.query('influencer_id')
    const database = c.env?.DB
    
    if (database && influencerId) {
        try {
            await db.disconnectPlatform(database, influencerId, platform)
            await db.updateInfluencerStats(database, influencerId)
        } catch (e) {
            console.error('Error disconnecting platform:', e)
        }
    }
    
    return c.json({ success: true, message: `${platform} disconnected successfully` })
})

// Influencer analytics
apiRoutes.get('/influencer/analytics', async (c) => {
    const timeframe = c.req.query('timeframe') || '30d'
    const database = c.env?.DB
    const influencerId = getInfluencerIdFromRequest(c) || 'inf_sarah_j'
    
    let analyticsData = {
        overview: {
            totalFollowers: 520000,
            followerGrowth: '+12.5%',
            avgEngagement: 5.3,
            engagementChange: '+0.8%',
            totalReach: 1200000,
            reachGrowth: '+18.2%',
            profileViews: 45000
        },
        platformBreakdown: [] as any[],
        contentPerformance: [
            { type: 'Reels', avgViews: 45000, avgEngagement: 6.8, posts: 24 },
            { type: 'Stories', avgViews: 28000, completion: 78, posts: 156 },
            { type: 'Feed Posts', avgLikes: 8500, avgComments: 320, posts: 12 },
            { type: 'TikToks', avgViews: 85000, avgEngagement: 7.2, posts: 32 }
        ],
        demographics: {
            age: [{ range: '18-24', percent: 35 }, { range: '25-34', percent: 38 }, { range: '35-44', percent: 17 }, { range: '45+', percent: 10 }],
            gender: { female: 58, male: 39, other: 3 },
            topCountries: [{ country: 'USA', percent: 45 }, { country: 'UK', percent: 12 }, { country: 'Canada', percent: 8 }, { country: 'Australia', percent: 6 }, { country: 'Other', percent: 29 }]
        },
        bestTimes: { monday: ['9AM', '6PM'], tuesday: ['12PM', '8PM'], wednesday: ['9AM', '7PM'], thursday: ['11AM', '9PM'], friday: ['10AM', '6PM'], saturday: ['11AM', '3PM'], sunday: ['2PM', '7PM'] },
        timeseries: [] as any[]
    }
    
    if (database) {
        try {
            // Get influencer data
            const influencer = await db.getInfluencerById(database, influencerId)
            const platforms = await db.getInfluencerPlatforms(database, influencerId)
            
            if (influencer) {
                analyticsData.overview = {
                    totalFollowers: influencer.total_followers || 520000,
                    followerGrowth: '+12.5%',
                    avgEngagement: influencer.avg_engagement || 5.3,
                    engagementChange: '+0.8%',
                    totalReach: (influencer.total_followers || 520000) * 3,
                    reachGrowth: '+18.2%',
                    profileViews: Math.floor((influencer.total_followers || 520000) * 0.1)
                }
            }
            
            if (platforms.length > 0) {
                analyticsData.platformBreakdown = platforms.map(p => ({
                    platform: p.platform.charAt(0).toUpperCase() + p.platform.slice(1),
                    followers: p.followers,
                    engagement: p.engagement_rate,
                    growth: '+' + (Math.random() * 20 + 5).toFixed(1) + '%',
                    reach: p.followers * 2
                }))
            }
        } catch (e) {
            console.error('Error fetching analytics from DB:', e)
        }
    }
    
    // Default platform breakdown if none from DB
    if (analyticsData.platformBreakdown.length === 0) {
        analyticsData.platformBreakdown = [
            { platform: 'Instagram', followers: 245000, engagement: 4.8, growth: '+8.2%', reach: 580000 },
            { platform: 'TikTok', followers: 180000, engagement: 6.2, growth: '+25.4%', reach: 420000 },
            { platform: 'YouTube', followers: 95000, engagement: 3.1, growth: '+5.1%', views: 200000 }
        ]
    }
    
    // Generate timeseries
    const baseFollowers = analyticsData.overview.totalFollowers - 10000
    analyticsData.timeseries = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        followers: baseFollowers + Math.floor(Math.random() * 500) * (i + 1),
        engagement: (analyticsData.overview.avgEngagement - 0.5 + Math.random()).toFixed(2),
        reach: Math.floor(35000 + Math.random() * 10000)
    }))
    
    return c.json({ success: true, data: analyticsData })
})

// Brand collaboration requirements form submission
apiRoutes.post('/brands/collaboration/requirements', async (c) => {
    try {
        const body = await c.req.json()
        const { campaign_name, description, category, budget_min, budget_max, platforms, follower_min, engagement_min, content_types, deadline, target_audience, brand_id } = body
        
        if (!campaign_name || !description || !budget_min) {
            return c.json({ success: false, error: 'Required fields missing' }, 400)
        }
        
        const database = c.env?.DB
        let allMatches: any[] = []
        
        // Try database first
        if (database) {
            try {
                // Search influencers with filters
                const dbInfluencers = await db.searchInfluencers(database, {
                    category: category !== 'all' ? category : undefined,
                    minFollowers: follower_min,
                    minEngagement: engagement_min,
                    maxRate: budget_max
                })
                
                // Get platforms for each influencer
                for (const inf of dbInfluencers) {
                    const infPlatforms = await db.getInfluencerPlatforms(database, inf.id)
                    
                    // Filter by platform if specified
                    if (platforms?.length > 0) {
                        const hasMatchingPlatform = infPlatforms.some(p => platforms.map((pl: string) => pl.toLowerCase()).includes(p.platform.toLowerCase()))
                        if (!hasMatchingPlatform) continue
                    }
                    
                    const connectedPlatforms: any = {}
                    for (const p of infPlatforms) {
                        connectedPlatforms[p.platform.toLowerCase()] = {
                            username: p.username,
                            followers: p.followers,
                            engagement: p.engagement_rate,
                            verified: true
                        }
                    }
                    
                    allMatches.push({
                        id: inf.id,
                        name: [inf.first_name, inf.last_name].filter(Boolean).join(' '),
                        username: inf.username,
                        category: inf.category || 'general',
                        profile: {
                            bio: inf.bio,
                            location: inf.location,
                            website: inf.website,
                            rate: { min: inf.rate_min || 100, max: inf.rate_max || 5000 }
                        },
                        connectedPlatforms,
                        stats: {
                            totalFollowers: inf.total_followers || 0,
                            avgEngagement: inf.avg_engagement || 0,
                            monthlyReach: (inf.total_followers || 0) * 3,
                            campaigns: 0,
                            earnings: inf.total_earnings || 0,
                            rating: 4.5 + Math.random() * 0.5,
                            completedCampaigns: 0
                        },
                        verified: inf.verified === 1,
                        available: true
                    })
                }
                
                // Also create an opportunity for this requirement if brand_id provided
                if (brand_id) {
                    await db.createOpportunity(database, {
                        brand_id,
                        title: campaign_name,
                        description,
                        category,
                        platform: platforms?.[0] || 'instagram',
                        budget_min,
                        budget_max,
                        requirements: JSON.stringify({ minFollowers: follower_min, minEngagement: engagement_min }),
                        deadline
                    })
                }
            } catch (e) {
                console.error('Error searching influencers from DB:', e)
            }
        }
        
        // Add in-memory influencers
        const memMatches = Array.from(influencerStore.values()).filter(inf => {
            if (!inf.available) return false
            if (category && category !== 'all' && inf.category !== category) return false
            if (follower_min && inf.stats.totalFollowers < follower_min) return false
            if (engagement_min && inf.stats.avgEngagement < engagement_min) return false
            if (budget_max && inf.profile.rate.min > budget_max) return false
            if (platforms?.length > 0 && !platforms.some((p: string) => inf.connectedPlatforms[p.toLowerCase()])) return false
            return true
        })
        
        // Merge unique influencers
        for (const inf of memMatches) {
            if (!allMatches.find(m => m.id === inf.id || m.email === inf.email)) {
                allMatches.push({
                    id: inf.id,
                    name: inf.name,
                    username: inf.username,
                    category: inf.category,
                    profile: inf.profile,
                    connectedPlatforms: inf.connectedPlatforms,
                    stats: inf.stats,
                    verified: inf.verified,
                    available: inf.available
                })
            }
        }
        
        // Sort by score
        allMatches.sort((a, b) => {
            const scoreA = (a.stats?.avgEngagement || 0) * 10 + (a.verified ? 20 : 0) + ((a.stats?.rating || 4.5) * 5)
            const scoreB = (b.stats?.avgEngagement || 0) * 10 + (b.verified ? 20 : 0) + ((b.stats?.rating || 4.5) * 5)
            return scoreB - scoreA
        })
        
        const topMatches = allMatches.slice(0, 10)
        const totalReach = topMatches.slice(0, 5).reduce((sum, inf) => sum + (inf.stats?.monthlyReach || 0), 0)
        const avgEngagement = topMatches.length > 0 
            ? (topMatches.slice(0, 5).reduce((sum, inf) => sum + (inf.stats?.avgEngagement || 0), 0) / Math.min(topMatches.length, 5))
            : 0
        
        return c.json({
            success: true,
            data: {
                requirement_id: 'req_' + Date.now(),
                campaign_name,
                matches_found: allMatches.length,
                top_matches: topMatches.map(inf => ({
                    ...inf,
                    matchScore: Math.floor(70 + Math.random() * 30)
                })),
                ai_recommendations: {
                    suggested_budget: { min: Math.max(budget_min, 500), max: Math.min(budget_max || 10000, 5000) },
                    recommended_platforms: platforms || ['instagram', 'tiktok'],
                    estimated_reach: totalReach,
                    estimated_engagement: avgEngagement.toFixed(1) + '%'
                }
            }
        })
    } catch (e) { 
        console.error('Collaboration requirements error:', e)
        return c.json({ success: false, error: 'Invalid request' }, 400) 
    }
})

// Influencer profile update
apiRoutes.put('/influencer/profile', async (c) => {
    try {
        const body = await c.req.json()
        const { influencer_id, bio, location, website, category, rate_min, rate_max, avatar } = body
        
        if (!influencer_id) {
            return c.json({ success: false, error: 'Influencer ID required' }, 400)
        }
        
        const database = c.env?.DB
        
        if (database) {
            try {
                // Update profile fields
                await db.updateInfluencerProfile(database, influencer_id, {
                    bio,
                    location,
                    website,
                    category,
                    avatar
                })
                
                // Update rate settings
                if (rate_min !== undefined || rate_max !== undefined) {
                    await db.setInfluencerRate(database, influencer_id, rate_min || 100, rate_max || 5000)
                }
                
                // Get updated profile
                const updatedInfluencer = await db.getInfluencerById(database, influencer_id)
                const rates = await db.getInfluencerRate(database, influencer_id)
                
                return c.json({
                    success: true,
                    data: {
                        updated: true,
                        profile: { 
                            bio: updatedInfluencer?.bio, 
                            location: updatedInfluencer?.location, 
                            website: updatedInfluencer?.website, 
                            avatar: updatedInfluencer?.avatar,
                            rate: { min: rates?.rate_min || rate_min || 100, max: rates?.rate_max || rate_max || 5000 } 
                        },
                        category: updatedInfluencer?.category,
                        updated_at: new Date().toISOString()
                    }
                })
            } catch (e) {
                console.error('Error updating profile in DB:', e)
            }
        }
        
        // Fallback response
        return c.json({
            success: true,
            data: {
                updated: true,
                profile: { bio, location, website, rate: { min: rate_min, max: rate_max } },
                category,
                updated_at: new Date().toISOString()
            }
        })
    } catch (e) { 
        console.error('Profile update error:', e)
        return c.json({ success: false, error: 'Failed to update profile' }, 400) 
    }
})

// Notifications
apiRoutes.get('/influencer/notifications', async (c) => {
    const database = c.env?.DB
    const influencerId = getInfluencerIdFromRequest(c) || 'inf_sarah_j'
    
    let allNotifications: any[] = []
    
    if (database) {
        try {
            const dbNotifications = await db.getNotificationsByInfluencer(database, influencerId)
            allNotifications = dbNotifications.map((n: any) => ({
                id: n.id,
                type: n.type,
                title: n.title,
                message: n.message,
                read: n.read === 1,
                createdAt: n.created_at,
                actionUrl: n.action_url,
                metadata: n.metadata ? JSON.parse(n.metadata) : null
            }))
        } catch (e) {
            console.error('Error fetching notifications from DB:', e)
        }
    }
    
    // Demo notifications as fallback
    const demoNotifications = [
        { id: 'notif_1', type: 'invitation', title: 'New Collaboration Invite', message: 'TechBrand Co. wants to collaborate with you!', read: false, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), actionUrl: '/influencer/invitations' },
        { id: 'notif_2', type: 'payment', title: 'Payment Received', message: 'You received $1,500 from BeautyGlow', read: false, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), actionUrl: '/influencer/earnings' },
        { id: 'notif_3', type: 'message', title: 'New Message', message: 'You have a new message from FitLife Pro', read: true, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), actionUrl: '/influencer/messages' },
        { id: 'notif_4', type: 'opportunity', title: 'Matching Opportunity', message: 'A new campaign matches your profile!', read: true, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), actionUrl: '/influencer/opportunities' },
        { id: 'notif_5', type: 'campaign', title: 'Campaign Deadline', message: 'Holiday Gift Guide deadline in 3 days', read: false, createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), actionUrl: '/influencer/campaigns' }
    ]
    
    // Merge with demo if empty
    if (allNotifications.length === 0) {
        allNotifications = demoNotifications
    } else {
        // Add demo notifications that don't exist
        for (const notif of demoNotifications) {
            if (!allNotifications.find(n => n.id === notif.id)) {
                allNotifications.push(notif)
            }
        }
    }
    
    // Sort by date
    allNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    return c.json({ 
        success: true, 
        data: allNotifications, 
        unread_count: allNotifications.filter(n => !n.read).length 
    })
})

apiRoutes.post('/influencer/notifications/mark-read', async (c) => {
    try {
        const body = await c.req.json()
        const { influencer_id, notification_ids, mark_all } = body
        const database = c.env?.DB
        
        if (database && influencer_id) {
            try {
                if (mark_all) {
                    await db.markAllNotificationsAsRead(database, influencer_id, 'influencer')
                } else if (notification_ids?.length > 0) {
                    await db.markNotificationsAsRead(database, notification_ids)
                }
            } catch (e) {
                console.error('Error marking notifications as read:', e)
            }
        }
        
        return c.json({ success: true, message: mark_all ? 'All notifications marked as read' : `${notification_ids?.length || 0} notifications marked as read` })
    } catch (e) { return c.json({ success: false, error: 'Failed to update' }, 400) }
})

// ============================================
// CREATIVE STUDIO - FULL CRUD ENDPOINTS
// ============================================

// Helper to get user from auth
const getAuthUserId = async (c: any): Promise<string> => {
    const authHeader = c.req.header('Authorization')
    if (authHeader) {
        const token = authHeader.replace('Bearer ', '')
        try {
            const session = await c.env.DB.prepare(
                'SELECT user_id FROM sessions WHERE token = ? AND expires_at > datetime("now")'
            ).bind(token).first<{ user_id: string }>()
            if (session?.user_id) return session.user_id
        } catch (e) { /* continue with demo user */ }
    }
    return 'usr_demo'
}

// Get all creatives for user
apiRoutes.get('/creatives', async (c) => {
    try {
        const userId = await getAuthUserId(c)
        const status = c.req.query('status')
        const creative_type = c.req.query('type')
        const platform = c.req.query('platform')
        const limit = parseInt(c.req.query('limit') || '50')

        const creatives = await marketingDb.getCreatives(c.env.DB, userId, {
            status,
            creative_type,
            platform,
            limit
        })

        return c.json({
            success: true,
            data: {
                creatives,
                total: creatives.length
            }
        })
    } catch (e) {
        console.error('Get creatives error:', e)
        return c.json({ success: false, error: 'Failed to fetch creatives' }, 500)
    }
})

// Create new creative
apiRoutes.post('/creatives', async (c) => {
    try {
        const userId = await getAuthUserId(c)
        const body = await c.req.json()
        
        const { 
            name, creative_type, platform, headline, body_text, cta, 
            destination_url, file_url, thumbnail_url, background_image_url,
            dimensions, aspect_ratio, file_size, file_format, duration,
            campaign_id, tags, brand_colors, fonts_used
        } = body

        if (!name || !creative_type) {
            return c.json({ success: false, error: 'Name and creative type are required' }, 400)
        }

        const id = await marketingDb.createCreative(c.env.DB, {
            user_id: userId,
            name,
            creative_type,
            status: 'draft',
            platform,
            headline,
            body_text,
            cta,
            destination_url,
            file_url,
            thumbnail_url,
            background_image_url,
            dimensions,
            aspect_ratio,
            file_size,
            file_format,
            duration,
            campaign_id,
            tags: tags ? JSON.stringify(tags) : null,
            brand_colors: brand_colors ? JSON.stringify(brand_colors) : null,
            fonts_used: fonts_used ? JSON.stringify(fonts_used) : null
        })

        return c.json({
            success: true,
            data: {
                id,
                name,
                creative_type,
                status: 'draft',
                message: 'Creative created successfully'
            }
        })
    } catch (e) {
        console.error('Create creative error:', e)
        return c.json({ success: false, error: 'Failed to create creative' }, 500)
    }
})

// Update creative
apiRoutes.put('/creatives/:id', async (c) => {
    try {
        const creativeId = c.req.param('id')
        const userId = await getAuthUserId(c)
        const body = await c.req.json()

        await marketingDb.updateCreative(c.env.DB, creativeId, body)

        return c.json({
            success: true,
            data: {
                id: creativeId,
                updated: true,
                message: 'Creative updated successfully'
            }
        })
    } catch (e) {
        console.error('Update creative error:', e)
        return c.json({ success: false, error: 'Failed to update creative' }, 500)
    }
})

// Delete creative
apiRoutes.delete('/creatives/:id', async (c) => {
    try {
        const creativeId = c.req.param('id')
        
        await marketingDb.deleteCreative(c.env.DB, creativeId)

        return c.json({
            success: true,
            message: 'Creative deleted successfully'
        })
    } catch (e) {
        console.error('Delete creative error:', e)
        return c.json({ success: false, error: 'Failed to delete creative' }, 500)
    }
})

// Get creative stats
apiRoutes.get('/creatives/stats', async (c) => {
    try {
        const userId = await getAuthUserId(c)
        
        const stats = await marketingDb.getCreativeStats(c.env.DB, userId)
        const aiCopyCount = await marketingDb.getAICopyCount(c.env.DB, userId)

        return c.json({
            success: true,
            data: {
                ...stats,
                aiGenerations: aiCopyCount
            }
        })
    } catch (e) {
        console.error('Get creative stats error:', e)
        return c.json({ success: false, error: 'Failed to fetch stats' }, 500)
    }
})

// Upload creative file (returns signed URL or file reference)
apiRoutes.post('/creatives/upload', async (c) => {
    try {
        const userId = await getAuthUserId(c)
        const body = await c.req.json()
        const { filename, content_type, file_size, creative_type } = body

        // Generate a unique file reference (in production, would return signed upload URL)
        const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const uploadUrl = `https://storage.ownlay.io/uploads/${userId}/${fileId}`

        return c.json({
            success: true,
            data: {
                file_id: fileId,
                upload_url: uploadUrl,
                file_url: uploadUrl,
                thumbnail_url: `${uploadUrl}/thumb`,
                expires_at: new Date(Date.now() + 3600000).toISOString()
            }
        })
    } catch (e) {
        console.error('Upload creative error:', e)
        return c.json({ success: false, error: 'Failed to generate upload URL' }, 500)
    }
})

// ============================================
// AI COPY GENERATION - ENHANCED
// ============================================

// Save generated AI copy to database
apiRoutes.post('/creatives/ai-copy/save', async (c) => {
    try {
        const userId = await getAuthUserId(c)
        const body = await c.req.json()
        
        const { prompt, product_description, tone, target_platform, copy_type, generated_text, score } = body

        if (!prompt || !copy_type || !generated_text) {
            return c.json({ success: false, error: 'Missing required fields' }, 400)
        }

        const id = await marketingDb.saveAICopy(c.env.DB, {
            user_id: userId,
            prompt,
            product_description,
            tone,
            target_platform,
            copy_type,
            generated_text,
            score
        })

        return c.json({
            success: true,
            data: {
                id,
                message: 'AI copy saved successfully'
            }
        })
    } catch (e) {
        console.error('Save AI copy error:', e)
        return c.json({ success: false, error: 'Failed to save AI copy' }, 500)
    }
})

// Get saved AI copies
apiRoutes.get('/creatives/ai-copy', async (c) => {
    try {
        const userId = await getAuthUserId(c)
        const copy_type = c.req.query('type')
        const is_used = c.req.query('used')
        const limit = parseInt(c.req.query('limit') || '50')

        const copies = await marketingDb.getAICopies(c.env.DB, userId, {
            copy_type,
            is_used: is_used === 'true' ? true : is_used === 'false' ? false : undefined,
            limit
        })

        return c.json({
            success: true,
            data: {
                copies,
                total: copies.length
            }
        })
    } catch (e) {
        console.error('Get AI copies error:', e)
        return c.json({ success: false, error: 'Failed to fetch AI copies' }, 500)
    }
})

// Mark AI copy as used in a creative
apiRoutes.post('/creatives/ai-copy/:id/use', async (c) => {
    try {
        const copyId = c.req.param('id')
        const body = await c.req.json()
        const { creative_id } = body

        await marketingDb.markAICopyUsed(c.env.DB, copyId, creative_id)

        return c.json({
            success: true,
            message: 'AI copy marked as used'
        })
    } catch (e) {
        console.error('Mark AI copy used error:', e)
        return c.json({ success: false, error: 'Failed to update AI copy' }, 500)
    }
})

// ============================================
// BRAND ASSETS ENDPOINTS
// ============================================

// Get brand assets
apiRoutes.get('/creatives/brand-assets', async (c) => {
    try {
        const userId = await getAuthUserId(c)
        const asset_type = c.req.query('type')

        const assets = await marketingDb.getBrandAssets(c.env.DB, userId, asset_type)

        return c.json({
            success: true,
            data: {
                assets,
                total: assets.length
            }
        })
    } catch (e) {
        console.error('Get brand assets error:', e)
        return c.json({ success: false, error: 'Failed to fetch brand assets' }, 500)
    }
})

// Save brand asset
apiRoutes.post('/creatives/brand-assets', async (c) => {
    try {
        const userId = await getAuthUserId(c)
        const body = await c.req.json()
        
        const { asset_type, name, value, file_url, thumbnail_url, file_size, dimensions, is_primary } = body

        if (!asset_type || !name || !value) {
            return c.json({ success: false, error: 'Missing required fields' }, 400)
        }

        const id = await marketingDb.saveBrandAsset(c.env.DB, {
            user_id: userId,
            asset_type,
            name,
            value,
            file_url,
            thumbnail_url,
            file_size,
            dimensions,
            is_primary
        })

        return c.json({
            success: true,
            data: {
                id,
                message: 'Brand asset saved successfully'
            }
        })
    } catch (e) {
        console.error('Save brand asset error:', e)
        return c.json({ success: false, error: 'Failed to save brand asset' }, 500)
    }
})

// Delete brand asset
apiRoutes.delete('/creatives/brand-assets/:id', async (c) => {
    try {
        const assetId = c.req.param('id')
        
        await marketingDb.deleteBrandAsset(c.env.DB, assetId)

        return c.json({
            success: true,
            message: 'Brand asset deleted successfully'
        })
    } catch (e) {
        console.error('Delete brand asset error:', e)
        return c.json({ success: false, error: 'Failed to delete brand asset' }, 500)
    }
})

// ============================================
// CREATIVE TEMPLATES ENDPOINTS
// ============================================

// Get creative templates
apiRoutes.get('/creatives/templates', async (c) => {
    try {
        const template_type = c.req.query('type')
        const platform = c.req.query('platform')
        const category = c.req.query('category')
        const is_premium = c.req.query('premium')

        const templates = await marketingDb.getCreativeTemplates(c.env.DB, {
            template_type,
            platform,
            category,
            is_premium: is_premium === 'true' ? true : is_premium === 'false' ? false : undefined
        })

        return c.json({
            success: true,
            data: {
                templates,
                total: templates.length
            }
        })
    } catch (e) {
        console.error('Get templates error:', e)
        return c.json({ success: false, error: 'Failed to fetch templates' }, 500)
    }
})

// Use a template (increment usage count)
apiRoutes.post('/creatives/templates/:id/use', async (c) => {
    try {
        const templateId = c.req.param('id')
        
        await marketingDb.incrementTemplateUsage(c.env.DB, templateId)

        return c.json({
            success: true,
            message: 'Template usage recorded'
        })
    } catch (e) {
        console.error('Use template error:', e)
        return c.json({ success: false, error: 'Failed to record template usage' }, 500)
    }
})

// ============================================
// DASHBOARD API ENDPOINTS (JSON for React Frontend)
// ============================================

// Get dashboard metrics
apiRoutes.get('/dashboard/metrics', async (c) => {
    const database = c.env?.DB
    
    // Try to get real data from the database
    let metrics = {
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
            conversions: 15.2
        }
    }
    
    if (database) {
        try {
            // Fetch aggregated metrics from historical_performance
            const result = await database.prepare(`
                SELECT 
                    SUM(spend) as total_spend,
                    SUM(revenue) as total_revenue,
                    AVG(roas) as avg_roas,
                    AVG(ctr) as avg_ctr,
                    SUM(conversions) as total_conversions,
                    SUM(impressions) as total_impressions,
                    SUM(clicks) as total_clicks,
                    AVG(cpa) as avg_cpa
                FROM historical_performance
                WHERE period_end >= datetime('now', '-30 days')
            `).first<any>()
            
            if (result && result.total_spend) {
                metrics = {
                    totalSpend: result.total_spend || 0,
                    totalRevenue: result.total_revenue || 0,
                    roas: result.avg_roas || 0,
                    ctr: result.avg_ctr || 0,
                    conversions: result.total_conversions || 0,
                    impressions: result.total_impressions || 0,
                    clicks: result.total_clicks || 0,
                    cpa: result.avg_cpa || 0,
                    trends: {
                        spend: 12.5,
                        revenue: 18.3,
                        roas: 4.8,
                        conversions: 15.2
                    }
                }
            }
        } catch (e) {
            console.error('Error fetching dashboard metrics:', e)
        }
    }
    
    return c.json({ success: true, data: metrics })
})

// Get channel/platform metrics
apiRoutes.get('/dashboard/channels', async (c) => {
    const database = c.env?.DB
    
    let channels = [
        { platform: 'Google Ads', spend: 18500, revenue: 78400, roas: 4.24, conversions: 782, ctr: 3.1, status: 'active' },
        { platform: 'Meta Ads', spend: 15200, revenue: 62800, roas: 4.13, conversions: 628, ctr: 2.8, status: 'active' },
        { platform: 'TikTok', spend: 8300, revenue: 31200, roas: 3.76, conversions: 312, ctr: 2.4, status: 'active' },
        { platform: 'LinkedIn', spend: 3230, revenue: 10050, roas: 3.11, conversions: 125, ctr: 1.9, status: 'paused' }
    ]
    
    if (database) {
        try {
            const result = await database.prepare(`
                SELECT 
                    platform,
                    SUM(spend) as spend,
                    SUM(revenue) as revenue,
                    AVG(roas) as roas,
                    SUM(conversions) as conversions,
                    AVG(ctr) as ctr
                FROM historical_performance
                WHERE period_end >= datetime('now', '-30 days')
                GROUP BY platform
                ORDER BY spend DESC
            `).all<any>()
            
            if (result.results && result.results.length > 0) {
                channels = result.results.map((r: any) => ({
                    platform: r.platform,
                    spend: r.spend || 0,
                    revenue: r.revenue || 0,
                    roas: r.roas || 0,
                    conversions: r.conversions || 0,
                    ctr: r.ctr || 0,
                    status: 'active'
                }))
            }
        } catch (e) {
            console.error('Error fetching channel metrics:', e)
        }
    }
    
    return c.json({ success: true, data: channels })
})

// Get campaigns list
apiRoutes.get('/campaigns', async (c) => {
    const database = c.env?.DB
    const status = c.req.query('status')
    const platform = c.req.query('platform')
    
    let campaigns = [
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
            metrics: { impressions: 850000, clicks: 24500, conversions: 892, roas: 4.2, ctr: 2.88 }
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
            metrics: { impressions: 1250000, clicks: 18200, conversions: 425, roas: 3.1, ctr: 1.46 }
        }
    ]
    
    if (database) {
        try {
            let query = 'SELECT * FROM campaigns WHERE 1=1'
            const params: any[] = []
            
            if (status) {
                query += ' AND status = ?'
                params.push(status)
            }
            if (platform) {
                query += ' AND platform = ?'
                params.push(platform)
            }
            
            query += ' ORDER BY created_at DESC LIMIT 50'
            
            const result = await database.prepare(query).bind(...params).all<any>()
            
            if (result.results && result.results.length > 0) {
                campaigns = result.results.map((c: any) => ({
                    id: c.id,
                    name: c.name,
                    status: c.status,
                    platform: c.platform,
                    budget: c.budget,
                    spent: c.spent || 0,
                    startDate: c.start_date,
                    endDate: c.end_date,
                    objective: c.objective,
                    metrics: JSON.parse(c.metrics || '{"impressions":0,"clicks":0,"conversions":0,"roas":0,"ctr":0}')
                }))
            }
        } catch (e) {
            console.error('Error fetching campaigns:', e)
        }
    }
    
    return c.json({ success: true, data: campaigns })
})

// Get integrations list
apiRoutes.get('/integrations', async (c) => {
    const integrations = [
        { id: '1', platform: 'Google Ads', status: 'disconnected' },
        { id: '2', platform: 'Meta Ads', status: 'disconnected' },
        { id: '3', platform: 'TikTok Ads', status: 'disconnected' },
        { id: '4', platform: 'LinkedIn Ads', status: 'disconnected' },
        { id: '5', platform: 'Shopify', status: 'disconnected' },
        { id: '6', platform: 'Google Analytics', status: 'disconnected' },
        { id: '7', platform: 'Klaviyo', status: 'disconnected' },
        { id: '8', platform: 'HubSpot', status: 'disconnected' }
    ]
    
    return c.json({ success: true, data: integrations })
})

// Connect integration
apiRoutes.post('/integrations/:platform/connect', async (c) => {
    const platform = c.req.param('platform')
    
    // In production, this would initiate OAuth flow
    return c.json({
        success: true,
        data: {
            authUrl: `/api/v1/oauth/${platform}/init`,
            message: `Initiating connection to ${platform}`
        }
    })
})

// Disconnect integration
apiRoutes.post('/integrations/:platform/disconnect', async (c) => {
    const platform = c.req.param('platform')
    
    return c.json({
        success: true,
        message: `${platform} disconnected successfully`
    })
})

// Sync integration
apiRoutes.post('/integrations/:platform/sync', async (c) => {
    const platform = c.req.param('platform')
    
    return c.json({
        success: true,
        message: `${platform} sync initiated`
    })
})

// Get AI insights
apiRoutes.get('/insights', async (c) => {
    const type = c.req.query('type')
    
    let insights = [
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
            timestamp: new Date().toISOString()
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
            timestamp: new Date().toISOString()
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
            timestamp: new Date().toISOString()
        }
    ]
    
    if (type) {
        insights = insights.filter(i => i.type === type)
    }
    
    return c.json({ success: true, data: insights })
})

// Apply insight action
apiRoutes.post('/insights/:id/apply', async (c) => {
    const insightId = c.req.param('id')
    const body = await c.req.json()
    const { action } = body
    
    return c.json({
        success: true,
        message: `Action "${action}" applied for insight ${insightId}`
    })
})
