import { Hono } from 'hono'
import { baseHead } from '../components/layout'

export const docsRoutes = new Hono()

// Dark theme navigation for docs (matches homepage)
const darkDocsNav = () => `
<nav class="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16 lg:h-20">
            <a href="/" class="flex items-center gap-3 group">
                <div class="relative">
                    <div class="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl blur-lg opacity-50 group-hover:opacity-80 transition-opacity"></div>
                    <div class="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg">
                        <i class="fas fa-layer-group text-white text-lg"></i>
                    </div>
                </div>
                <span class="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">OWNLAY</span>
            </a>
            <div class="hidden lg:flex items-center gap-8">
                <a href="/#features" class="text-slate-300 hover:text-white transition-colors">Features</a>
                <a href="/#integrations" class="text-slate-300 hover:text-white transition-colors">Integrations</a>
                <a href="/pricing" class="text-slate-300 hover:text-white transition-colors">Pricing</a>
                <a href="/docs" class="text-indigo-400 font-medium">Docs</a>
                <a href="/docs/api" class="text-slate-300 hover:text-white transition-colors">API</a>
            </div>
            <div class="flex items-center gap-4">
                <a href="/auth/signin" class="text-slate-300 hover:text-white transition-colors">Sign In</a>
                <a href="/auth/signup" class="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/25 transition-all">
                    Start Free
                </a>
            </div>
        </div>
    </div>
</nav>
`

// Dark theme footer for docs
const darkDocsFooter = () => `
<footer class="bg-slate-950 border-t border-slate-800/50 py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
                    <i class="fas fa-layer-group text-white text-sm"></i>
                </div>
                <span class="text-lg font-bold text-white">OWNLAY</span>
            </div>
            <div class="flex items-center gap-6 text-sm text-slate-400">
                <a href="/about" class="hover:text-indigo-400 transition-colors">About</a>
                <a href="/privacy" class="hover:text-indigo-400 transition-colors">Privacy</a>
                <a href="/terms" class="hover:text-indigo-400 transition-colors">Terms</a>
                <a href="/security" class="hover:text-indigo-400 transition-colors">Security</a>
                <a href="/contact" class="hover:text-indigo-400 transition-colors">Contact</a>
            </div>
            <p class="text-slate-500 text-sm">© 2024 OWNLAY. All rights reserved.</p>
        </div>
    </div>
</footer>
`

const docsLayout = (title: string, activePage: string, content: string) => `
${baseHead('Docs - ' + title)}
<body class="bg-slate-950 text-white">
    ${darkDocsNav()}
    
    <div class="pt-20 flex min-h-screen">
        <!-- Sidebar -->
        <aside class="fixed left-0 top-20 bottom-0 w-64 bg-slate-900/50 border-r border-slate-800/50 overflow-y-auto hidden lg:block">
            <nav class="p-6 space-y-6">
                <div>
                    <h4 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Getting Started</h4>
                    <ul class="space-y-2">
                        <li><a href="/docs" class="block text-sm ${activePage === 'overview' ? 'text-indigo-400 font-medium' : 'text-slate-400 hover:text-white'}">Overview</a></li>
                        <li><a href="/docs/quickstart" class="block text-sm ${activePage === 'quickstart' ? 'text-indigo-400 font-medium' : 'text-slate-400 hover:text-white'}">Quickstart Guide</a></li>
                        <li><a href="/docs/onboarding" class="block text-sm ${activePage === 'onboarding' ? 'text-indigo-400 font-medium' : 'text-slate-400 hover:text-white'}">Onboarding Flow</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Features</h4>
                    <ul class="space-y-2">
                        <li><a href="/docs/dashboard" class="block text-sm text-slate-400 hover:text-white">Unified Dashboard</a></li>
                        <li><a href="/docs/campaigns" class="block text-sm text-slate-400 hover:text-white">Campaign Builder</a></li>
                        <li><a href="/docs/ads" class="block text-sm text-slate-400 hover:text-white">Ad Manager</a></li>
                        <li><a href="/docs/automation" class="block text-sm text-slate-400 hover:text-white">Automation</a></li>
                        <li><a href="/docs/ai-insights" class="block text-sm text-slate-400 hover:text-white">AI Insights</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Integrations</h4>
                    <ul class="space-y-2">
                        <li><a href="/docs/integrations" class="block text-sm text-slate-400 hover:text-white">Overview</a></li>
                        <li><a href="/docs/integrations/google-ads" class="block text-sm text-slate-400 hover:text-white">Google Ads</a></li>
                        <li><a href="/docs/integrations/meta-ads" class="block text-sm text-slate-400 hover:text-white">Meta Ads</a></li>
                        <li><a href="/docs/integrations/ga4" class="block text-sm text-slate-400 hover:text-white">Google Analytics 4</a></li>
                        <li><a href="/docs/integrations/shopify" class="block text-sm text-slate-400 hover:text-white">Shopify</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">API Reference</h4>
                    <ul class="space-y-2">
                        <li><a href="/docs/api" class="block text-sm ${activePage === 'api' ? 'text-indigo-400 font-medium' : 'text-slate-400 hover:text-white'}">API Overview</a></li>
                        <li><a href="/docs/api/authentication" class="block text-sm text-slate-400 hover:text-white">Authentication</a></li>
                        <li><a href="/docs/api/endpoints" class="block text-sm text-slate-400 hover:text-white">Endpoints</a></li>
                        <li><a href="/docs/api/webhooks" class="block text-sm text-slate-400 hover:text-white">Webhooks</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Data & Security</h4>
                    <ul class="space-y-2">
                        <li><a href="/docs/data-schema" class="block text-sm ${activePage === 'data-schema' ? 'text-indigo-400 font-medium' : 'text-slate-400 hover:text-white'}">Event Schema</a></li>
                        <li><a href="/docs/security" class="block text-sm text-slate-400 hover:text-white">Security</a></li>
                        <li><a href="/docs/compliance" class="block text-sm text-slate-400 hover:text-white">Compliance</a></li>
                    </ul>
                </div>
            </nav>
        </aside>
        
        <!-- Main Content -->
        <main class="flex-1 lg:ml-64">
            <div class="max-w-4xl mx-auto px-8 py-12">
                ${content}
            </div>
        </main>
    </div>
    
    ${darkDocsFooter()}
</body>
</html>
`

// Documentation Overview
docsRoutes.get('/', (c) => {
    const content = `
    <h1 class="text-4xl font-bold text-white mb-6">OWNLAY Documentation</h1>
    <p class="text-xl text-slate-400 mb-8">Learn how to use OWNLAY to unify, automate, and optimize your marketing stack.</p>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <a href="/docs/quickstart" class="p-6 bg-slate-900/50 border border-slate-700/50 rounded-xl hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all group">
            <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                    <i class="fas fa-rocket text-indigo-400 text-lg"></i>
                </div>
                <h3 class="font-semibold text-white group-hover:text-indigo-400 transition-colors">Quickstart Guide</h3>
            </div>
            <p class="text-slate-400 text-sm">Get up and running with OWNLAY in under 10 minutes</p>
        </a>
        <a href="/docs/api" class="p-6 bg-slate-900/50 border border-slate-700/50 rounded-xl hover:border-emerald-500/50 hover:bg-slate-800/50 transition-all group">
            <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <i class="fas fa-code text-emerald-400 text-lg"></i>
                </div>
                <h3 class="font-semibold text-white group-hover:text-emerald-400 transition-colors">API Reference</h3>
            </div>
            <p class="text-slate-400 text-sm">Integrate OWNLAY with your applications</p>
        </a>
        <a href="/docs/integrations" class="p-6 bg-slate-900/50 border border-slate-700/50 rounded-xl hover:border-amber-500/50 hover:bg-slate-800/50 transition-all group">
            <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <i class="fas fa-plug text-amber-400 text-lg"></i>
                </div>
                <h3 class="font-semibold text-white group-hover:text-amber-400 transition-colors">Integrations</h3>
            </div>
            <p class="text-slate-400 text-sm">Connect your marketing channels and tools</p>
        </a>
        <a href="/docs/data-schema" class="p-6 bg-slate-900/50 border border-slate-700/50 rounded-xl hover:border-violet-500/50 hover:bg-slate-800/50 transition-all group">
            <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                    <i class="fas fa-database text-violet-400 text-lg"></i>
                </div>
                <h3 class="font-semibold text-white group-hover:text-violet-400 transition-colors">Data Schema</h3>
            </div>
            <p class="text-slate-400 text-sm">Understand our canonical event schema</p>
        </a>
    </div>
    
    <h2 class="text-2xl font-bold text-white mb-4">Core Concepts</h2>
    <div class="space-y-6 text-slate-300">
        <div>
            <h3 class="text-lg font-semibold text-white mb-2">What is OWNLAY?</h3>
            <p>OWNLAY is a Marketing Operating System that unifies all your marketing data, campaigns, and workflows into a single platform. It connects to your advertising platforms, analytics tools, and CRM to provide a unified view of your marketing performance.</p>
        </div>
        
        <div>
            <h3 class="text-lg font-semibold text-white mb-2">Key Features</h3>
            <ul class="list-disc list-inside space-y-2 text-slate-400">
                <li><strong class="text-white">Unified Dashboard</strong> - See all your marketing metrics in one place</li>
                <li><strong class="text-white">Campaign Builder</strong> - Create and manage multi-channel campaigns</li>
                <li><strong class="text-white">Ad Manager</strong> - Control ads across Google, Meta, TikTok, and LinkedIn</li>
                <li><strong class="text-white">Automation</strong> - Build intelligent workflows that respond to user behavior</li>
                <li><strong class="text-white">AI Insights</strong> - Get ML-powered recommendations and predictions</li>
                <li><strong class="text-white">Analytics</strong> - Deep-dive into performance with custom reports</li>
            </ul>
        </div>
        
        <div>
            <h3 class="text-lg font-semibold text-white mb-2">Architecture Overview</h3>
            <p>OWNLAY uses a hub-and-spoke architecture where data flows from connected platforms into our unified data layer. Our AI/ML models continuously analyze this data to surface insights and recommendations.</p>
        </div>
    </div>
    `
    return c.html(docsLayout('Overview', 'overview', content))
})

// API Documentation
docsRoutes.get('/api', (c) => {
    const content = `
    <h1 class="text-4xl font-bold text-white mb-6">API Reference</h1>
    <p class="text-xl text-slate-400 mb-8">Integrate OWNLAY with your applications using our REST API.</p>
    
    <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-8">
        <p class="text-sm text-slate-500 mb-2">Base URL</p>
        <code class="text-emerald-400 text-lg">https://api.ownlay.io/v1</code>
    </div>
    
    <h2 class="text-2xl font-bold text-white mb-4">Authentication</h2>
    <div class="text-slate-300 mb-8">
        <p>All API requests require authentication using an API key. Include your API key in the <code class="text-indigo-400 bg-slate-800 px-2 py-0.5 rounded">Authorization</code> header:</p>
    </div>
    <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-8 overflow-x-auto">
        <pre class="text-sm text-slate-300"><code>curl -X GET "https://api.ownlay.io/v1/campaigns" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"</code></pre>
    </div>
    
    <h2 class="text-2xl font-bold text-white mb-4">Endpoints</h2>
    
    <!-- Auth Endpoints -->
    <div class="mb-8">
        <h3 class="text-lg font-semibold text-white mb-4">Authentication</h3>
        <div class="space-y-4">
            <div class="border border-slate-700/50 rounded-xl overflow-hidden">
                <div class="p-4 bg-slate-800/50 border-b border-slate-700/50 flex items-center gap-3">
                    <span class="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-mono rounded">POST</span>
                    <code class="text-sm text-slate-300">/auth/login</code>
                </div>
                <div class="p-4 bg-slate-900/50">
                    <p class="text-slate-400 mb-4">Authenticate user and get access token</p>
                    <div class="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 overflow-x-auto">
                        <pre class="text-sm text-slate-300"><code>{
  "email": "user@example.com",
  "password": "your_password"
}</code></pre>
                    </div>
                </div>
            </div>
            
            <div class="border border-slate-700/50 rounded-xl overflow-hidden">
                <div class="p-4 bg-slate-800/50 border-b border-slate-700/50 flex items-center gap-3">
                    <span class="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-mono rounded">POST</span>
                    <code class="text-sm text-slate-300">/auth/sso/saml</code>
                </div>
                <div class="p-4 bg-slate-900/50">
                    <p class="text-slate-400">Initiate SAML SSO authentication flow</p>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Connectors -->
    <div class="mb-8">
        <h3 class="text-lg font-semibold text-white mb-4">Connectors</h3>
        <div class="space-y-4">
            <div class="border border-slate-700/50 rounded-xl overflow-hidden">
                <div class="p-4 bg-slate-800/50 border-b border-slate-700/50 flex items-center gap-3">
                    <span class="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-mono rounded">GET</span>
                    <code class="text-sm text-slate-300">/connectors</code>
                </div>
                <div class="p-4 bg-slate-900/50">
                    <p class="text-slate-400 mb-4">List all connected integrations</p>
                    <p class="text-sm font-medium text-slate-300 mb-2">Response:</p>
                    <div class="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 overflow-x-auto">
                        <pre class="text-sm text-slate-300"><code>{
  "success": true,
  "data": [
    {
      "id": "conn_google_ads",
      "name": "Google Ads",
      "type": "google_ads",
      "status": "connected",
      "last_sync": "2024-12-12T14:25:00Z"
    }
  ]
}</code></pre>
                    </div>
                </div>
            </div>
            
            <div class="border border-slate-700/50 rounded-xl overflow-hidden">
                <div class="p-4 bg-slate-800/50 border-b border-slate-700/50 flex items-center gap-3">
                    <span class="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-mono rounded">POST</span>
                    <code class="text-sm text-slate-300">/connectors/:type/connect</code>
                </div>
                <div class="p-4 bg-slate-900/50">
                    <p class="text-slate-400">Initiate OAuth flow for a connector</p>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Campaigns -->
    <div class="mb-8">
        <h3 class="text-lg font-semibold text-white mb-4">Campaigns</h3>
        <div class="space-y-4">
            <div class="border border-slate-700/50 rounded-xl overflow-hidden">
                <div class="p-4 bg-slate-800/50 border-b border-slate-700/50 flex items-center gap-3">
                    <span class="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-mono rounded">GET</span>
                    <code class="text-sm text-slate-300">/campaigns</code>
                </div>
                <div class="p-4 bg-slate-900/50">
                    <p class="text-slate-400">List all campaigns with metrics</p>
                </div>
            </div>
            
            <div class="border border-slate-700/50 rounded-xl overflow-hidden">
                <div class="p-4 bg-slate-800/50 border-b border-slate-700/50 flex items-center gap-3">
                    <span class="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-mono rounded">POST</span>
                    <code class="text-sm text-slate-300">/campaigns</code>
                </div>
                <div class="p-4 bg-slate-900/50">
                    <p class="text-slate-400 mb-4">Create a new campaign</p>
                    <div class="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 overflow-x-auto">
                        <pre class="text-sm text-slate-300"><code>{
  "name": "Q4 Holiday Campaign",
  "objective": "conversions",
  "channels": ["google_ads", "meta_ads"],
  "budget": {
    "daily": 500,
    "total": 15000
  }
}</code></pre>
                    </div>
                </div>
            </div>
            
            <div class="border border-slate-700/50 rounded-xl overflow-hidden">
                <div class="p-4 bg-slate-800/50 border-b border-slate-700/50 flex items-center gap-3">
                    <span class="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-mono rounded">POST</span>
                    <code class="text-sm text-slate-300">/campaigns/:id/launch</code>
                </div>
                <div class="p-4 bg-slate-900/50">
                    <p class="text-slate-400">Launch a campaign</p>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Events -->
    <div class="mb-8">
        <h3 class="text-lg font-semibold text-white mb-4">Events Ingestion</h3>
        <div class="space-y-4">
            <div class="border border-slate-700/50 rounded-xl overflow-hidden">
                <div class="p-4 bg-slate-800/50 border-b border-slate-700/50 flex items-center gap-3">
                    <span class="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-mono rounded">POST</span>
                    <code class="text-sm text-slate-300">/events</code>
                </div>
                <div class="p-4 bg-slate-900/50">
                    <p class="text-slate-400 mb-4">Send a single event</p>
                    <div class="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 overflow-x-auto">
                        <pre class="text-sm text-slate-300"><code>{
  "event_type": "page_view",
  "timestamp": "2024-12-12T14:30:00Z",
  "user_id": "user_123",
  "session_id": "sess_456",
  "properties": {
    "page_url": "https://example.com/products",
    "utm_source": "google",
    "utm_campaign": "q4_holiday"
  }
}</code></pre>
                    </div>
                </div>
            </div>
            
            <div class="border border-slate-700/50 rounded-xl overflow-hidden">
                <div class="p-4 bg-slate-800/50 border-b border-slate-700/50 flex items-center gap-3">
                    <span class="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-mono rounded">POST</span>
                    <code class="text-sm text-slate-300">/events/batch</code>
                </div>
                <div class="p-4 bg-slate-900/50">
                    <p class="text-slate-400">Send multiple events in a single request (up to 100)</p>
                </div>
            </div>
        </div>
    </div>
    
    <!-- AI Insights -->
    <div class="mb-8">
        <h3 class="text-lg font-semibold text-white mb-4">AI Insights</h3>
        <div class="space-y-4">
            <div class="border border-slate-700/50 rounded-xl overflow-hidden">
                <div class="p-4 bg-slate-800/50 border-b border-slate-700/50 flex items-center gap-3">
                    <span class="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-mono rounded">GET</span>
                    <code class="text-sm text-slate-300">/ai/insights</code>
                </div>
                <div class="p-4 bg-slate-900/50">
                    <p class="text-slate-400">Get AI-generated insights and recommendations</p>
                </div>
            </div>
            
            <div class="border border-slate-700/50 rounded-xl overflow-hidden">
                <div class="p-4 bg-slate-800/50 border-b border-slate-700/50 flex items-center gap-3">
                    <span class="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-mono rounded">POST</span>
                    <code class="text-sm text-slate-300">/ai/query</code>
                </div>
                <div class="p-4 bg-slate-900/50">
                    <p class="text-slate-400 mb-4">Ask natural language questions about your data</p>
                    <div class="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 overflow-x-auto">
                        <pre class="text-sm text-slate-300"><code>{
  "query": "Why did my CPA increase last week?"
}</code></pre>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <h2 class="text-2xl font-bold text-white mb-4">Rate Limits</h2>
    <div class="text-slate-300 mb-8">
        <ul class="list-disc list-inside space-y-2 text-slate-400">
            <li><strong class="text-white">Starter:</strong> 1,000 requests/hour</li>
            <li><strong class="text-white">Growth:</strong> 10,000 requests/hour</li>
            <li><strong class="text-white">Enterprise:</strong> Unlimited</li>
        </ul>
        <p class="mt-4">Rate limit headers are included in every response:</p>
    </div>
    <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 overflow-x-auto">
        <pre class="text-sm text-slate-300"><code>X-RateLimit-Limit: 10000
X-RateLimit-Remaining: 9985
X-RateLimit-Reset: 1702400000</code></pre>
    </div>
    `
    return c.html(docsLayout('API Reference', 'api', content))
})

// Data Schema Documentation
docsRoutes.get('/data-schema', (c) => {
    const content = `
    <h1 class="text-4xl font-bold text-white mb-6">Event Schema</h1>
    <p class="text-xl text-slate-400 mb-8">OWNLAY uses a canonical event schema to normalize data from all connected platforms.</p>
    
    <h2 class="text-2xl font-bold text-white mb-4">Canonical Event Schema</h2>
    <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-8 overflow-x-auto">
        <pre class="text-sm text-slate-300"><code>{
  "event_id": "evt_123abc",
  "event_type": "conversion",
  "timestamp": "2024-12-12T14:30:00.000Z",
  "received_at": "2024-12-12T14:30:01.234Z",
  
  // User identification
  "user_id": "user_123",
  "anonymous_id": "anon_456",
  "session_id": "sess_789",
  
  // Source attribution
  "source": {
    "platform": "google_ads",
    "campaign_id": "camp_123",
    "ad_group_id": "ag_456",
    "ad_id": "ad_789",
    "keyword": "marketing software"
  },
  
  // UTM parameters
  "utm": {
    "source": "google",
    "medium": "cpc",
    "campaign": "q4_holiday",
    "content": "banner_a",
    "term": "marketing software"
  },
  
  // Event properties
  "properties": {
    "page_url": "https://example.com/checkout",
    "referrer": "https://google.com",
    "revenue": 99.99,
    "currency": "USD",
    "product_id": "prod_123",
    "quantity": 1
  },
  
  // Device & context
  "context": {
    "ip": "192.168.1.1",
    "user_agent": "Mozilla/5.0...",
    "locale": "en-US",
    "timezone": "America/New_York",
    "device": {
      "type": "desktop",
      "os": "Windows",
      "browser": "Chrome"
    },
    "geo": {
      "country": "US",
      "region": "NY",
      "city": "New York"
    }
  }
}</code></pre>
    </div>
    
    <h2 class="text-2xl font-bold text-white mb-4">Event Types</h2>
    <div class="overflow-x-auto mb-8">
        <table class="w-full border border-slate-700/50 rounded-xl overflow-hidden">
            <thead class="bg-slate-800/50">
                <tr>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-white">Event Type</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-white">Description</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-white">Required Properties</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700/50">
                <tr class="bg-slate-900/30">
                    <td class="px-6 py-4 font-mono text-sm text-indigo-400">page_view</td>
                    <td class="px-6 py-4 text-sm text-slate-400">User views a page</td>
                    <td class="px-6 py-4 text-sm text-slate-400">page_url</td>
                </tr>
                <tr class="bg-slate-900/30">
                    <td class="px-6 py-4 font-mono text-sm text-indigo-400">click</td>
                    <td class="px-6 py-4 text-sm text-slate-400">User clicks on an ad or link</td>
                    <td class="px-6 py-4 text-sm text-slate-400">click_url</td>
                </tr>
                <tr class="bg-slate-900/30">
                    <td class="px-6 py-4 font-mono text-sm text-indigo-400">form_submit</td>
                    <td class="px-6 py-4 text-sm text-slate-400">User submits a form</td>
                    <td class="px-6 py-4 text-sm text-slate-400">form_id</td>
                </tr>
                <tr class="bg-slate-900/30">
                    <td class="px-6 py-4 font-mono text-sm text-indigo-400">add_to_cart</td>
                    <td class="px-6 py-4 text-sm text-slate-400">User adds item to cart</td>
                    <td class="px-6 py-4 text-sm text-slate-400">product_id, quantity</td>
                </tr>
                <tr class="bg-slate-900/30">
                    <td class="px-6 py-4 font-mono text-sm text-indigo-400">purchase</td>
                    <td class="px-6 py-4 text-sm text-slate-400">User completes purchase</td>
                    <td class="px-6 py-4 text-sm text-slate-400">revenue, currency, order_id</td>
                </tr>
                <tr class="bg-slate-900/30">
                    <td class="px-6 py-4 font-mono text-sm text-indigo-400">conversion</td>
                    <td class="px-6 py-4 text-sm text-slate-400">Generic conversion event</td>
                    <td class="px-6 py-4 text-sm text-slate-400">conversion_type</td>
                </tr>
                <tr class="bg-slate-900/30">
                    <td class="px-6 py-4 font-mono text-sm text-indigo-400">lead</td>
                    <td class="px-6 py-4 text-sm text-slate-400">New lead captured</td>
                    <td class="px-6 py-4 text-sm text-slate-400">email or phone</td>
                </tr>
            </tbody>
        </table>
    </div>
    
    <h2 class="text-2xl font-bold text-white mb-4">Platform Connectors</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="border border-slate-700/50 bg-slate-900/50 rounded-xl p-6">
            <div class="flex items-center gap-3 mb-4">
                <i class="fab fa-google text-blue-400 text-2xl"></i>
                <h3 class="font-semibold text-white">Google Ads</h3>
            </div>
            <ul class="text-sm text-slate-400 space-y-2">
                <li>• Campaigns, Ad Groups, Ads</li>
                <li>• Impressions, Clicks, Conversions</li>
                <li>• Cost, CPC, CPA metrics</li>
                <li>• Keyword performance</li>
            </ul>
        </div>
        <div class="border border-slate-700/50 bg-slate-900/50 rounded-xl p-6">
            <div class="flex items-center gap-3 mb-4">
                <i class="fab fa-meta text-blue-500 text-2xl"></i>
                <h3 class="font-semibold text-white">Meta Ads</h3>
            </div>
            <ul class="text-sm text-slate-400 space-y-2">
                <li>• Campaigns, Ad Sets, Ads</li>
                <li>• Reach, Frequency, Engagement</li>
                <li>• ROAS, Cost per Result</li>
                <li>• Audience insights</li>
            </ul>
        </div>
        <div class="border border-slate-700/50 bg-slate-900/50 rounded-xl p-6">
            <div class="flex items-center gap-3 mb-4">
                <i class="fas fa-chart-pie text-amber-400 text-2xl"></i>
                <h3 class="font-semibold text-white">Google Analytics 4</h3>
            </div>
            <ul class="text-sm text-slate-400 space-y-2">
                <li>• Sessions, Users, Page Views</li>
                <li>• Conversion events</li>
                <li>• Traffic sources</li>
                <li>• User behavior flows</li>
            </ul>
        </div>
        <div class="border border-slate-700/50 bg-slate-900/50 rounded-xl p-6">
            <div class="flex items-center gap-3 mb-4">
                <i class="fab fa-shopify text-emerald-400 text-2xl"></i>
                <h3 class="font-semibold text-white">Shopify</h3>
            </div>
            <ul class="text-sm text-slate-400 space-y-2">
                <li>• Orders, Revenue</li>
                <li>• Products, Inventory</li>
                <li>• Customer data</li>
                <li>• Cart events</li>
            </ul>
        </div>
    </div>
    
    <h2 class="text-2xl font-bold text-white mb-4">Data Retention & Sync</h2>
    <div class="overflow-x-auto mb-8">
        <table class="w-full border border-slate-700/50 rounded-xl overflow-hidden">
            <thead class="bg-slate-800/50">
                <tr>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-white">Data Type</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-white">Sync Cadence</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-white">Retention (Raw)</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-white">Retention (Aggregated)</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-700/50">
                <tr class="bg-slate-900/30">
                    <td class="px-6 py-4 text-sm text-white">Ad Platform Data</td>
                    <td class="px-6 py-4 text-sm text-slate-400">Every 15 minutes</td>
                    <td class="px-6 py-4 text-sm text-slate-400">90 days</td>
                    <td class="px-6 py-4 text-sm text-slate-400">Unlimited</td>
                </tr>
                <tr class="bg-slate-900/30">
                    <td class="px-6 py-4 text-sm text-white">Analytics Events</td>
                    <td class="px-6 py-4 text-sm text-slate-400">Real-time</td>
                    <td class="px-6 py-4 text-sm text-slate-400">30 days</td>
                    <td class="px-6 py-4 text-sm text-slate-400">2 years</td>
                </tr>
                <tr class="bg-slate-900/30">
                    <td class="px-6 py-4 text-sm text-white">E-commerce Data</td>
                    <td class="px-6 py-4 text-sm text-slate-400">Real-time webhooks</td>
                    <td class="px-6 py-4 text-sm text-slate-400">90 days</td>
                    <td class="px-6 py-4 text-sm text-slate-400">Unlimited</td>
                </tr>
                <tr class="bg-slate-900/30">
                    <td class="px-6 py-4 text-sm text-white">Audit Logs</td>
                    <td class="px-6 py-4 text-sm text-slate-400">Real-time</td>
                    <td class="px-6 py-4 text-sm text-slate-400">7 years</td>
                    <td class="px-6 py-4 text-sm text-slate-400">7 years</td>
                </tr>
            </tbody>
        </table>
    </div>
    
    <h2 class="text-2xl font-bold text-white mb-4">Data Warehouse Export</h2>
    <div class="text-slate-300">
        <p>OWNLAY supports exporting data to your data warehouse for advanced analysis:</p>
        <ul class="list-disc list-inside space-y-2 mt-4 text-slate-400">
            <li><strong class="text-white">BigQuery</strong> - Direct streaming or scheduled exports</li>
            <li><strong class="text-white">Snowflake</strong> - Scheduled exports via Snowpipe</li>
            <li><strong class="text-white">Custom</strong> - Webhook-based exports to any destination</li>
        </ul>
    </div>
    `
    return c.html(docsLayout('Event Schema', 'data-schema', content))
})

// Quickstart guide
docsRoutes.get('/quickstart', (c) => {
    const content = `
    <h1 class="text-4xl font-bold text-white mb-6">Quickstart Guide</h1>
    <p class="text-xl text-slate-400 mb-8">Get OWNLAY up and running in under 10 minutes.</p>
    
    <div class="space-y-8">
        <div class="flex gap-6">
            <div class="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 text-indigo-400 font-bold">1</div>
            <div class="flex-1">
                <h3 class="text-xl font-semibold text-white mb-2">Create your account</h3>
                <p class="text-slate-400 mb-4">Sign up for a free 7-day trial. No credit card required.</p>
                <a href="/auth/signup" class="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/25 transition-all">Start Free Trial</a>
            </div>
        </div>
        
        <div class="flex gap-6">
            <div class="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 text-indigo-400 font-bold">2</div>
            <div class="flex-1">
                <h3 class="text-xl font-semibold text-white mb-2">Connect your channels</h3>
                <p class="text-slate-400 mb-4">Connect Google Ads, Meta Ads, or any of our 20+ integrations using OAuth. Your data will start syncing immediately.</p>
            </div>
        </div>
        
        <div class="flex gap-6">
            <div class="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 text-indigo-400 font-bold">3</div>
            <div class="flex-1">
                <h3 class="text-xl font-semibold text-white mb-2">Import historical data</h3>
                <p class="text-slate-400 mb-4">OWNLAY automatically imports up to 90 days of historical data so you can see insights immediately.</p>
            </div>
        </div>
        
        <div class="flex gap-6">
            <div class="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 text-indigo-400 font-bold">4</div>
            <div class="flex-1">
                <h3 class="text-xl font-semibold text-white mb-2">Create your first campaign</h3>
                <p class="text-slate-400 mb-4">Use the Campaign Builder to create a multi-channel campaign, or let AI suggest optimizations based on your historical performance.</p>
            </div>
        </div>
    </div>
    `
    return c.html(docsLayout('Quickstart', 'quickstart', content))
})

// Integrations documentation
docsRoutes.get('/integrations', (c) => {
    const content = `
    <h1 class="text-4xl font-bold text-white mb-6">Integrations</h1>
    <p class="text-xl text-slate-400 mb-8">Connect your marketing stack with OWNLAY's 20+ native integrations.</p>
    
    <div class="bg-gradient-to-r from-indigo-900/30 to-violet-900/30 border border-indigo-500/20 rounded-xl p-6 mb-8">
        <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                <i class="fas fa-bolt text-indigo-400 text-xl"></i>
            </div>
            <div>
                <h3 class="font-semibold text-white mb-1">One-click OAuth connections</h3>
                <p class="text-slate-400 text-sm">All integrations use secure OAuth 2.0 authentication. Your credentials are never stored. Connect in seconds, not hours.</p>
            </div>
        </div>
    </div>
    
    <h2 class="text-2xl font-bold text-white mb-4">Advertising Platforms</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <a href="/docs/integrations/google-ads" class="border border-slate-700/50 bg-slate-900/50 rounded-xl p-6 hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all group">
            <div class="flex items-center gap-3 mb-3">
                <i class="fab fa-google text-blue-400 text-2xl"></i>
                <h3 class="font-semibold text-white group-hover:text-indigo-400 transition-colors">Google Ads</h3>
            </div>
            <p class="text-sm text-slate-400 mb-4">Search, Display, Shopping, YouTube, Performance Max campaigns</p>
            <div class="flex flex-wrap gap-2">
                <span class="px-2 py-1 bg-slate-800/50 text-slate-400 text-xs rounded">Campaigns</span>
                <span class="px-2 py-1 bg-slate-800/50 text-slate-400 text-xs rounded">Keywords</span>
                <span class="px-2 py-1 bg-slate-800/50 text-slate-400 text-xs rounded">Conversions</span>
            </div>
        </a>
        <a href="/docs/integrations/meta-ads" class="border border-slate-700/50 bg-slate-900/50 rounded-xl p-6 hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all group">
            <div class="flex items-center gap-3 mb-3">
                <i class="fab fa-meta text-blue-500 text-2xl"></i>
                <h3 class="font-semibold text-white group-hover:text-indigo-400 transition-colors">Meta Ads</h3>
            </div>
            <p class="text-sm text-slate-400 mb-4">Facebook & Instagram ads, Lead forms, Audience management</p>
            <div class="flex flex-wrap gap-2">
                <span class="px-2 py-1 bg-slate-800/50 text-slate-400 text-xs rounded">Ad Sets</span>
                <span class="px-2 py-1 bg-slate-800/50 text-slate-400 text-xs rounded">Audiences</span>
                <span class="px-2 py-1 bg-slate-800/50 text-slate-400 text-xs rounded">Pixel Events</span>
            </div>
        </a>
        <a href="#" class="border border-slate-700/50 bg-slate-900/50 rounded-xl p-6 hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all group">
            <div class="flex items-center gap-3 mb-3">
                <i class="fab fa-tiktok text-white text-2xl"></i>
                <h3 class="font-semibold text-white group-hover:text-indigo-400 transition-colors">TikTok Ads</h3>
            </div>
            <p class="text-sm text-slate-400 mb-4">In-feed ads, TopView, Branded Effects, Spark Ads</p>
            <div class="flex flex-wrap gap-2">
                <span class="px-2 py-1 bg-slate-800/50 text-slate-400 text-xs rounded">Campaigns</span>
                <span class="px-2 py-1 bg-slate-800/50 text-slate-400 text-xs rounded">Creative</span>
                <span class="px-2 py-1 bg-slate-800/50 text-slate-400 text-xs rounded">Events</span>
            </div>
        </a>
        <a href="#" class="border border-slate-700/50 bg-slate-900/50 rounded-xl p-6 hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all group">
            <div class="flex items-center gap-3 mb-3">
                <i class="fab fa-linkedin text-blue-400 text-2xl"></i>
                <h3 class="font-semibold text-white group-hover:text-indigo-400 transition-colors">LinkedIn Ads</h3>
            </div>
            <p class="text-sm text-slate-400 mb-4">B2B targeting, Lead Gen Forms, Matched Audiences</p>
            <div class="flex flex-wrap gap-2">
                <span class="px-2 py-1 bg-slate-800/50 text-slate-400 text-xs rounded">Campaigns</span>
                <span class="px-2 py-1 bg-slate-800/50 text-slate-400 text-xs rounded">Lead Forms</span>
                <span class="px-2 py-1 bg-slate-800/50 text-slate-400 text-xs rounded">Companies</span>
            </div>
        </a>
    </div>
    
    <h2 class="text-2xl font-bold text-white mb-4">Analytics & Tracking</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <a href="/docs/integrations/ga4" class="border border-slate-700/50 bg-slate-900/50 rounded-xl p-6 hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all group">
            <div class="flex items-center gap-3 mb-3">
                <i class="fas fa-chart-simple text-orange-400 text-2xl"></i>
                <h3 class="font-semibold text-white group-hover:text-indigo-400 transition-colors">Google Analytics 4</h3>
            </div>
            <p class="text-sm text-slate-400 mb-4">Sessions, Users, Events, Conversions, Attribution</p>
            <div class="flex flex-wrap gap-2">
                <span class="px-2 py-1 bg-slate-800/50 text-slate-400 text-xs rounded">Events</span>
                <span class="px-2 py-1 bg-slate-800/50 text-slate-400 text-xs rounded">Audiences</span>
                <span class="px-2 py-1 bg-slate-800/50 text-slate-400 text-xs rounded">Conversions</span>
            </div>
        </a>
        <div class="border border-slate-700/50 bg-slate-900/50 rounded-xl p-6 opacity-60">
            <div class="flex items-center gap-3 mb-3">
                <i class="fas fa-chart-pie text-pink-400 text-2xl"></i>
                <h3 class="font-semibold text-white">Mixpanel</h3>
                <span class="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded">Coming Soon</span>
            </div>
            <p class="text-sm text-slate-400 mb-4">Product analytics, User behavior, Funnels</p>
        </div>
    </div>
    
    <h2 class="text-2xl font-bold text-white mb-4">E-commerce</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <a href="/docs/integrations/shopify" class="border border-slate-700/50 bg-slate-900/50 rounded-xl p-6 hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all group">
            <div class="flex items-center gap-3 mb-3">
                <i class="fab fa-shopify text-emerald-400 text-2xl"></i>
                <h3 class="font-semibold text-white group-hover:text-indigo-400 transition-colors">Shopify</h3>
            </div>
            <p class="text-sm text-slate-400 mb-4">Orders, Products, Customers, Cart events</p>
            <div class="flex flex-wrap gap-2">
                <span class="px-2 py-1 bg-slate-800/50 text-slate-400 text-xs rounded">Orders</span>
                <span class="px-2 py-1 bg-slate-800/50 text-slate-400 text-xs rounded">Products</span>
                <span class="px-2 py-1 bg-slate-800/50 text-slate-400 text-xs rounded">Customers</span>
            </div>
        </a>
        <a href="#" class="border border-slate-700/50 bg-slate-900/50 rounded-xl p-6 hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all group">
            <div class="flex items-center gap-3 mb-3">
                <i class="fab fa-stripe text-violet-400 text-2xl"></i>
                <h3 class="font-semibold text-white group-hover:text-indigo-400 transition-colors">Stripe</h3>
            </div>
            <p class="text-sm text-slate-400 mb-4">Payments, Subscriptions, Invoices, MRR</p>
            <div class="flex flex-wrap gap-2">
                <span class="px-2 py-1 bg-slate-800/50 text-slate-400 text-xs rounded">Payments</span>
                <span class="px-2 py-1 bg-slate-800/50 text-slate-400 text-xs rounded">Subscriptions</span>
                <span class="px-2 py-1 bg-slate-800/50 text-slate-400 text-xs rounded">Revenue</span>
            </div>
        </a>
    </div>
    
    <h2 class="text-2xl font-bold text-white mb-4">CRM & Email</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <a href="#" class="border border-slate-700/50 bg-slate-900/50 rounded-xl p-6 hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all group">
            <div class="flex items-center gap-3 mb-3">
                <i class="fab fa-hubspot text-orange-400 text-2xl"></i>
                <h3 class="font-semibold text-white group-hover:text-indigo-400 transition-colors">HubSpot</h3>
            </div>
            <p class="text-sm text-slate-400 mb-4">Contacts, Deals, Campaigns, Forms</p>
            <div class="flex flex-wrap gap-2">
                <span class="px-2 py-1 bg-slate-800/50 text-slate-400 text-xs rounded">Contacts</span>
                <span class="px-2 py-1 bg-slate-800/50 text-slate-400 text-xs rounded">Deals</span>
                <span class="px-2 py-1 bg-slate-800/50 text-slate-400 text-xs rounded">Campaigns</span>
            </div>
        </a>
        <a href="#" class="border border-slate-700/50 bg-slate-900/50 rounded-xl p-6 hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all group">
            <div class="flex items-center gap-3 mb-3">
                <i class="fab fa-mailchimp text-amber-400 text-2xl"></i>
                <h3 class="font-semibold text-white group-hover:text-indigo-400 transition-colors">Mailchimp</h3>
            </div>
            <p class="text-sm text-slate-400 mb-4">Campaigns, Subscribers, Engagement metrics</p>
            <div class="flex flex-wrap gap-2">
                <span class="px-2 py-1 bg-slate-800/50 text-slate-400 text-xs rounded">Campaigns</span>
                <span class="px-2 py-1 bg-slate-800/50 text-slate-400 text-xs rounded">Lists</span>
                <span class="px-2 py-1 bg-slate-800/50 text-slate-400 text-xs rounded">Opens/Clicks</span>
            </div>
        </a>
    </div>
    
    <h2 class="text-2xl font-bold text-white mb-4">How to Connect</h2>
    <div class="text-slate-300 mb-8">
        <ol class="list-decimal list-inside space-y-3 text-slate-400">
            <li><strong class="text-white">Navigate to Integrations</strong> - Go to the Integrations page in your OWNLAY dashboard</li>
            <li><strong class="text-white">Click Connect</strong> - Find the platform you want to connect and click the "Connect" button</li>
            <li><strong class="text-white">Authorize</strong> - You'll be redirected to the platform's OAuth flow. Grant the required permissions</li>
            <li><strong class="text-white">Configure</strong> - Select which accounts or properties to sync</li>
            <li><strong class="text-white">Done!</strong> - Data will start syncing immediately. Historical data imports within 5-15 minutes</li>
        </ol>
    </div>
    
    <h2 class="text-2xl font-bold text-white mb-4">API-Based Integrations</h2>
    <div class="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6 mb-8">
        <p class="text-slate-400 mb-4">For custom integrations or platforms not listed above, use our Events API to send data directly:</p>
        <div class="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 overflow-x-auto">
            <pre class="text-sm text-slate-300"><code>POST /api/v1/events
{
  "event_type": "purchase",
  "user_id": "user_123",
  "properties": {
    "revenue": 99.99,
    "product_id": "prod_456"
  }
}</code></pre>
        </div>
        <a href="/docs/api" class="inline-flex items-center gap-2 mt-4 text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
            <i class="fas fa-book"></i>
            View API Documentation
        </a>
    </div>
    `
    return c.html(docsLayout('Integrations', 'integrations', content))
})
