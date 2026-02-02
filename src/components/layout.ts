// OWNLAY Layout Components
// Modern, enterprise-ready, minimal, tech-forward design system
// Uses 8-point spacing system, neutral color palette
// Fully responsive design for mobile, tablet, and desktop

export const baseHead = (title: string, description?: string, canonicalUrl?: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="description" content="${description || 'OWNLAY - The Marketing Operating System. Unify, automate, and optimize your entire marketing stack with AI-powered insights.'}">
    <meta name="keywords" content="marketing automation, marketing operating system, ad management, Google Ads, Meta Ads, Shopify, marketing analytics, AI marketing, campaign management, ROAS optimization">
    <meta name="author" content="OWNLAY">
    <meta name="robots" content="index, follow">
    <title>${title} | OWNLAY</title>
    
    <!-- Canonical URL -->
    <link rel="canonical" href="${canonicalUrl || 'https://ownlay.com'}">
    
    <!-- Favicon - Multiple formats for browser compatibility -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=2">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png?v=2">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png?v=2">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=2">
    <link rel="shortcut icon" href="/favicon.svg?v=2">
    <meta name="theme-color" content="#6366f1">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${canonicalUrl || 'https://ownlay.com'}">
    <meta property="og:title" content="${title} | OWNLAY">
    <meta property="og:description" content="${description || 'OWNLAY - The Marketing Operating System. Unify, automate, and optimize your entire marketing stack.'}">
    <meta property="og:image" content="https://ownlay.com/static/images/og-image.png">
    <meta property="og:site_name" content="OWNLAY">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${canonicalUrl || 'https://ownlay.com'}">
    <meta name="twitter:title" content="${title} | OWNLAY">
    <meta name="twitter:description" content="${description || 'OWNLAY - The Marketing Operating System. Unify, automate, and optimize your entire marketing stack.'}">
    <meta name="twitter:image" content="https://ownlay.com/static/images/og-image.png">
    
    <!-- Structured Data for Google -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "OWNLAY",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web",
        "description": "The Marketing Operating System - Unify, automate, and optimize your entire marketing stack with AI-powered insights.",
        "url": "https://ownlay.com",
        "offers": {
            "@type": "Offer",
            "price": "299",
            "priceCurrency": "USD"
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "5000"
        }
    }
    </script>
    
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        // Neutral enterprise palette
                        brand: {
                            50: '#f8fafc',
                            100: '#f1f5f9',
                            200: '#e2e8f0',
                            300: '#cbd5e1',
                            400: '#94a3b8',
                            500: '#64748b',
                            600: '#475569',
                            700: '#334155',
                            800: '#1e293b',
                            900: '#0f172a',
                            950: '#020617'
                        },
                        accent: {
                            primary: '#6366f1',
                            secondary: '#8b5cf6',
                            success: '#10b981',
                            warning: '#f59e0b',
                            danger: '#ef4444',
                            info: '#0ea5e9'
                        }
                    },
                    fontFamily: {
                        sans: ['Inter', 'system-ui', 'sans-serif'],
                        mono: ['JetBrains Mono', 'monospace']
                    }
                }
            }
        }
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
    <style>
        * { font-family: 'Inter', system-ui, sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        
        /* Smooth transitions */
        .transition-all { transition: all 0.2s ease-in-out; }
        
        /* Card hover effects */
        .card-hover:hover { transform: translateY(-2px); box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
        
        /* Gradient backgrounds */
        .gradient-hero { background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%); }
        .gradient-accent { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); }
        
        /* Animation keyframes */
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
        @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out; }
        .animate-pulse-slow { animation: pulse 2s ease-in-out infinite; }
        .animate-slideIn { animation: slideIn 0.3s ease-out; }
        
        /* Mobile menu overlay */
        .mobile-menu-overlay {
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
        }
        
        /* Hide scrollbar when mobile menu is open */
        body.menu-open {
            overflow: hidden;
        }
        
        /* Responsive sidebar */
        @media (max-width: 1023px) {
            .sidebar-closed {
                transform: translateX(-100%);
            }
            .sidebar-open {
                transform: translateX(0);
            }
        }
    </style>
    
    <!-- Inline smart currency functions - available BEFORE app.js loads -->
    <!-- Critical for incognito mode and fresh browser sessions -->
    <script>
        // Detect user's currency from timezone (most reliable) or locale
        (function() {
            'use strict';
            
            // Timezone to currency mapping
            var timezoneCurrency = {
                'Asia/Kolkata': 'INR', 'Asia/Calcutta': 'INR', 'Asia/Mumbai': 'INR',
                'Asia/Tokyo': 'JPY', 'Asia/Seoul': 'KRW', 'Asia/Shanghai': 'CNY',
                'Asia/Hong_Kong': 'HKD', 'Asia/Singapore': 'SGD', 'Asia/Bangkok': 'THB',
                'Europe/London': 'GBP', 'Europe/Paris': 'EUR', 'Europe/Berlin': 'EUR',
                'America/New_York': 'USD', 'America/Los_Angeles': 'USD', 'America/Chicago': 'USD',
                'America/Toronto': 'CAD', 'America/Sao_Paulo': 'BRL', 'America/Mexico_City': 'MXN',
                'Australia/Sydney': 'AUD', 'Pacific/Auckland': 'NZD', 'Africa/Johannesburg': 'ZAR'
            };
            
            var currencySymbols = {
                'USD': '$', 'EUR': '€', 'GBP': '£', 'INR': '₹', 'JPY': '¥', 'CNY': '¥',
                'AUD': 'A$', 'CAD': 'C$', 'CHF': 'CHF', 'SGD': 'S$', 'HKD': 'HK$',
                'KRW': '₩', 'MXN': 'MX$', 'BRL': 'R$', 'AED': 'د.إ', 'THB': '฿',
                'ZAR': 'R', 'NZD': 'NZ$'
            };
            
            var currencyLocales = {
                'INR': 'en-IN', 'USD': 'en-US', 'EUR': 'de-DE', 'GBP': 'en-GB',
                'JPY': 'ja-JP', 'CNY': 'zh-CN', 'AUD': 'en-AU', 'CAD': 'en-CA'
            };
            
            // Detect currency based on timezone first, then locale
            function detectCurrency() {
                try {
                    var timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
                    if (timezone && timezoneCurrency[timezone]) {
                        return timezoneCurrency[timezone];
                    }
                } catch(e) {}
                
                var locale = navigator.language || 'en-US';
                if (locale.includes('IN') || locale === 'hi' || locale === 'hi-IN') return 'INR';
                if (locale.includes('JP') || locale === 'ja') return 'JPY';
                if (locale.includes('KR') || locale === 'ko') return 'KRW';
                if (locale.includes('CN') || locale === 'zh') return 'CNY';
                if (locale.includes('GB')) return 'GBP';
                if (locale.includes('AU')) return 'AUD';
                if (locale.includes('CA')) return 'CAD';
                if (locale.includes('DE') || locale.includes('FR') || locale.includes('IT') || locale.includes('ES')) return 'EUR';
                
                return 'USD';
            }
            
            var detectedCurrency = detectCurrency();
            
            // Smart currency symbol getter
            window.smartGetCurrencySymbol = function() {
                if (window.CurrencyFormatter && window.CurrencyFormatter.getSymbol) {
                    return window.CurrencyFormatter.getSymbol();
                }
                return currencySymbols[detectedCurrency] || '$';
            };
            
            // Smart currency formatter
            window.smartFormatCurrency = function(value) {
                if (window.CurrencyFormatter && window.CurrencyFormatter.format) {
                    return window.CurrencyFormatter.format(value);
                }
                
                try {
                    var formatLocale = currencyLocales[detectedCurrency] || 'en-US';
                    return new Intl.NumberFormat(formatLocale, {
                        style: 'currency',
                        currency: detectedCurrency,
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                    }).format(value);
                } catch(e) {
                    var symbol = currencySymbols[detectedCurrency] || '$';
                    return symbol + parseFloat(value).toLocaleString();
                }
            };
            
            // Store detected currency for other scripts
            window._detectedCurrency = detectedCurrency;
            window._currencySymbol = currencySymbols[detectedCurrency] || '$';
        })();
    </script>
</head>
`

export const marketingNav = () => `
<nav class="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
            <div class="flex items-center gap-4 lg:gap-8">
                <a href="/" class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
                        <i class="fas fa-layer-group text-white text-sm"></i>
                    </div>
                    <span class="text-xl font-bold text-gray-900">OWNLAY</span>
                </a>
                <div class="hidden lg:flex items-center gap-6">
                    <a href="/#features" class="text-sm text-gray-600 hover:text-gray-900 transition-colors">Features</a>
                    <a href="/pricing" class="text-sm text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
                    <a href="/docs" class="text-sm text-gray-600 hover:text-gray-900 transition-colors">Docs</a>
                    <a href="/docs/api" class="text-sm text-gray-600 hover:text-gray-900 transition-colors">API</a>
                </div>
            </div>
            <!-- Buttons for logged-out users -->
            <div id="nav-logged-out" class="flex items-center gap-3">
                <a href="/influencer/signup" class="hidden md:inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-sm font-medium rounded-lg transition-all">
                    <i class="fas fa-star text-xs"></i>
                    Join as Creator
                </a>
                <a href="/auth/signin" class="hidden sm:inline-flex text-sm text-gray-600 hover:text-gray-900 transition-colors">Sign In</a>
                <a href="/auth/signup" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
                    Start Free Trial
                </a>
                <button class="lg:hidden p-2 text-gray-600 hover:text-gray-900" onclick="toggleMobileNav()">
                    <i class="fas fa-bars text-xl"></i>
                </button>
            </div>
            <!-- Buttons for logged-in users (hidden by default) -->
            <div id="nav-logged-in" class="hidden items-center gap-3">
                <a href="/app/dashboard" id="nav-dashboard-link" class="hidden sm:inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    <i class="fas fa-grid-2"></i>
                    Dashboard
                </a>
                <span id="nav-user-name" class="hidden sm:inline-flex text-sm font-medium text-gray-900"></span>
                <button onclick="handleNavLogout()" class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
                    <i class="fas fa-sign-out-alt"></i>
                    Sign Out
                </button>
                <button class="lg:hidden p-2 text-gray-600 hover:text-gray-900" onclick="toggleMobileNav()">
                    <i class="fas fa-bars text-xl"></i>
                </button>
            </div>
        </div>
    </div>
    
    <!-- Mobile Navigation Menu -->
    <div id="mobile-nav" class="hidden lg:hidden fixed inset-0 z-50 mobile-menu-overlay" onclick="closeMobileNav(event)">
        <div class="fixed inset-y-0 right-0 w-full max-w-xs bg-white shadow-xl animate-slideIn" onclick="event.stopPropagation()">
            <div class="p-4 border-b border-gray-200 flex items-center justify-between">
                <span class="text-lg font-semibold">Menu</span>
                <button onclick="toggleMobileNav()" class="p-2 text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            <nav class="p-4 space-y-2">
                <a href="/#features" class="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg">Features</a>
                <a href="/pricing" class="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg">Pricing</a>
                <a href="/docs" class="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg">Docs</a>
                <a href="/docs/api" class="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg">API</a>
                <hr class="my-4">
                <!-- Mobile logged-out links -->
                <div id="mobile-nav-logged-out">
                    <a href="/influencer/signup" class="block px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-center font-medium rounded-lg hover:from-pink-600 hover:to-purple-700 mb-2">
                        <i class="fas fa-star mr-2"></i>Join as Creator
                    </a>
                    <a href="/auth/signin" class="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg">Sign In</a>
                    <a href="/auth/signup" class="block px-4 py-3 bg-indigo-600 text-white text-center font-medium rounded-lg hover:bg-indigo-700">
                        Start Free Trial
                    </a>
                </div>
                <!-- Mobile logged-in links (hidden by default) -->
                <div id="mobile-nav-logged-in" class="hidden">
                    <a href="/app/dashboard" id="mobile-nav-dashboard-link" class="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg">
                        <i class="fas fa-grid-2 mr-2"></i>Dashboard
                    </a>
                    <button onclick="handleNavLogout()" class="w-full block px-4 py-3 bg-red-500 text-white text-center font-medium rounded-lg hover:bg-red-600">
                        <i class="fas fa-sign-out-alt mr-2"></i>Sign Out
                    </button>
                </div>
            </nav>
        </div>
    </div>
</nav>
<script>
function toggleMobileNav() {
    const menu = document.getElementById('mobile-nav');
    menu.classList.toggle('hidden');
    document.body.classList.toggle('menu-open');
}
function closeMobileNav(event) {
    if (event.target === event.currentTarget) {
        toggleMobileNav();
    }
}
async function handleNavLogout() {
    // Show confirmation dialog
    const confirmed = confirm('Are you sure you want to sign out?');
    if (!confirmed) return;
    
    // Clear all auth data
    localStorage.removeItem('ownlay_token');
    localStorage.removeItem('ownlay_user');
    localStorage.removeItem('ownlay_refresh_token');
    localStorage.removeItem('ownlay_influencer_token');
    localStorage.removeItem('ownlay_influencer_user');
    document.cookie = 'ownlay_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    window.location.href = '/auth/signin';
}
// Check login state and update nav
(function() {
    const token = localStorage.getItem('ownlay_token') || localStorage.getItem('ownlay_influencer_token');
    const userData = localStorage.getItem('ownlay_user') || localStorage.getItem('ownlay_influencer_user');
    
    if (token && userData) {
        try {
            const user = JSON.parse(userData);
            // Show logged-in nav, hide logged-out nav
            const navLoggedOut = document.getElementById('nav-logged-out');
            const navLoggedIn = document.getElementById('nav-logged-in');
            const mobileLoggedOut = document.getElementById('mobile-nav-logged-out');
            const mobileLoggedIn = document.getElementById('mobile-nav-logged-in');
            const navUserName = document.getElementById('nav-user-name');
            const dashboardLink = document.getElementById('nav-dashboard-link');
            const mobileDashboardLink = document.getElementById('mobile-nav-dashboard-link');
            
            if (navLoggedOut) navLoggedOut.classList.add('hidden');
            if (navLoggedIn) navLoggedIn.classList.remove('hidden');
            navLoggedIn.classList.add('flex');
            if (mobileLoggedOut) mobileLoggedOut.classList.add('hidden');
            if (mobileLoggedIn) mobileLoggedIn.classList.remove('hidden');
            
            // Set user name
            if (navUserName) {
                navUserName.textContent = user.name || user.email?.split('@')[0] || 'User';
            }
            
            // Set correct dashboard link based on account type
            const dashboardUrl = user.accountType === 'influencer' ? '/influencer/dashboard' : '/app/dashboard';
            if (dashboardLink) dashboardLink.href = dashboardUrl;
            if (mobileDashboardLink) mobileDashboardLink.href = dashboardUrl;
        } catch(e) {
            console.error('Error parsing user data:', e);
        }
    }
})();
</script>
`

export const appSidebar = (activePage: string) => `
<!-- Mobile Header -->
<header class="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 h-14">
    <div class="flex items-center justify-between h-full px-4">
        <button onclick="toggleSidebar()" class="p-2 text-gray-600 hover:text-gray-900 -ml-2">
            <i class="fas fa-bars text-xl"></i>
        </button>
        <a href="/app/dashboard" class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg gradient-accent flex items-center justify-center">
                <i class="fas fa-layer-group text-white text-xs"></i>
            </div>
            <span class="text-lg font-bold text-gray-900">OWNLAY</span>
        </a>
        <button class="p-2 text-gray-600 hover:text-gray-900 relative">
            <i class="fas fa-bell"></i>
            <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
    </div>
</header>

<!-- Sidebar Overlay for Mobile -->
<div id="sidebar-overlay" class="hidden fixed inset-0 z-40 bg-black/50 lg:hidden" onclick="toggleSidebar()"></div>

<!-- Sidebar -->
<aside id="app-sidebar" class="fixed left-0 top-0 bottom-0 w-64 bg-gray-900 text-white flex flex-col z-50 transform transition-transform duration-300 lg:translate-x-0 -translate-x-full">
    <div class="p-4 border-b border-gray-800">
        <a href="/app/dashboard" class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
                <i class="fas fa-layer-group text-white text-sm"></i>
            </div>
            <span class="text-lg font-bold">OWNLAY</span>
        </a>
    </div>
    <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
        ${sidebarItem('dashboard', 'Unified Dashboard', 'fa-grid-2', activePage)}
        ${sidebarItem('insights', 'Agent Command Centre', 'fa-microchip', activePage)}
        ${sidebarItem('campaigns', 'Campaign Builder', 'fa-bullseye', activePage)}
        ${sidebarItem('ads', 'Ad Manager', 'fa-rectangle-ad', activePage)}
        ${sidebarItem('automation', 'Automation', 'fa-robot', activePage)}
        ${sidebarItem('audience', 'Audience & CRM', 'fa-users', activePage)}
        ${sidebarItem('creative', 'Creative Studio', 'fa-palette', activePage)}
        ${sidebarItem('analytics', 'Advanced Analytics', 'fa-chart-line', activePage)}
        ${sidebarItem('integrations', 'Integrations', 'fa-plug', activePage)}
        ${sidebarItem('influencers', 'Influencers', 'fa-star', activePage)}
        ${sidebarItem('connections', 'Connections', 'fa-user-plus', activePage)}
        ${sidebarItem('messages', 'Messages', 'fa-comments', activePage)}
        <div class="pt-4 mt-4 border-t border-gray-800">
            ${sidebarItem('team', 'Team', 'fa-users-gear', activePage)}
            ${sidebarItem('settings', 'Settings', 'fa-gear', activePage)}
            ${sidebarItem('admin', 'Admin Console', 'fa-shield-halved', activePage, '/admin')}
        </div>
    </nav>
    <div class="p-4 border-t border-gray-800">
        <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-semibold sidebar-user-initials" data-user-initials>U</div>
            <div class="flex-1 min-w-0">
                <p class="text-sm font-medium truncate sidebar-user-name" data-user-name>User</p>
                <p class="text-xs text-gray-400 truncate sidebar-user-email" data-user-email></p>
            </div>
            <div class="relative group">
                <button class="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors">
                    <i class="fas fa-ellipsis-vertical"></i>
                </button>
                <div class="absolute bottom-full right-0 mb-2 w-48 bg-gray-800 rounded-xl shadow-xl border border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <div class="p-2">
                        <a href="/app/settings" class="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                            <i class="fas fa-gear w-4"></i> Settings
                        </a>
                        <a href="/auth/brands" class="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors switch-brand-link" data-switch-brand style="display: none;">
                            <i class="fas fa-building w-4"></i> Switch Brand
                        </a>
                        <hr class="my-2 border-gray-700">
                        <button onclick="handleLogout()" class="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-colors">
                            <i class="fas fa-sign-out-alt w-4"></i> Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</aside>

<script>
function toggleSidebar() {
    const sidebar = document.getElementById('app-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    sidebar.classList.toggle('-translate-x-full');
    overlay.classList.toggle('hidden');
    document.body.classList.toggle('menu-open');
}
</script>
`

// Feature access requirements for sidebar
// NEW PLAN STRUCTURE:
// - Starter: Creative Studio + Campaign Builder + Dashboard + Settings + Integrations
// - Growth: + Ad Manager + AI Insights
// - Pro: + Advanced Analytics + Multi-brand + Automation + Audience & CRM
const featureRequirements: Record<string, { plan: string, planName: string, comingSoon?: boolean }> = {
    // Growth plan features
    'ads': { plan: 'growth', planName: 'Growth' },
    'insights': { plan: 'growth', planName: 'Growth' },
    
    // Pro plan features
    'analytics': { plan: 'pro', planName: 'Pro' },
    'automation': { plan: 'pro', planName: 'Pro' },
    'audience': { plan: 'pro', planName: 'Pro' },
    'team': { plan: 'pro', planName: 'Pro' },
    
    // Coming Soon features (shown to all but disabled)
    'influencers': { plan: 'starter', planName: 'Coming Soon', comingSoon: true },
    'connections': { plan: 'starter', planName: 'Coming Soon', comingSoon: true },
    'messages': { plan: 'starter', planName: 'Coming Soon', comingSoon: true }
}

const sidebarItem = (key: string, label: string, icon: string, active: string, href?: string) => {
    const requirement = featureRequirements[key]
    const hasRestriction = !!requirement
    const isComingSoon = requirement?.comingSoon === true
    
    // Coming Soon items - always shown with badge but disabled
    if (isComingSoon) {
        return `
<a href="${href || '/app/' + key}" 
   onclick="event.preventDefault(); if(typeof PlanFeatures !== 'undefined') PlanFeatures.showUpgradeModal('${key}'); return false;" 
   class="sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-gray-400 hover:bg-gray-800 opacity-60 cursor-not-allowed"
   data-feature="${key}"
   data-coming-soon="true">
    <i class="fas ${icon} w-5 text-center"></i>
    <span class="flex-1">${label}</span>
    <span class="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-amber-500/30 text-amber-300">Soon</span>
</a>`
    }
    
    // Plan-restricted items
    if (hasRestriction) {
        return `
<a href="${href || '/app/' + key}" 
   onclick="return handleSidebarClick(event, '${key}')" 
   class="sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${active === key ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}"
   data-feature="${key}"
   data-required-plan="${requirement.plan}">
    <i class="fas ${icon} w-5 text-center"></i>
    <span class="flex-1">${label}</span>
    <span class="plan-lock-badge hidden px-1.5 py-0.5 text-[10px] font-semibold rounded bg-amber-500/20 text-amber-400">${requirement.planName}</span>
</a>`
    }
    
    // Free items - no restrictions
    return `
<a href="${href || '/app/' + key}" onclick="if(window.innerWidth < 1024) toggleSidebar();" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${active === key ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}">
    <i class="fas ${icon} w-5 text-center"></i>
    <span>${label}</span>
</a>`
}

// JavaScript for handling sidebar clicks with plan-based access
const sidebarAccessScript = `
<script>
function handleSidebarClick(event, feature) {
    // Check if PlanFeatures is available
    if (typeof PlanFeatures !== 'undefined') {
        // Check for coming soon features first
        if (PlanFeatures.isComingSoon && PlanFeatures.isComingSoon(feature)) {
            event.preventDefault();
            PlanFeatures.showUpgradeModal(feature);
            return false;
        }
        // Then check plan access
        if (!PlanFeatures.canAccess(feature)) {
            event.preventDefault();
            PlanFeatures.showUpgradeModal(feature);
            return false;
        }
    }
    // Close sidebar on mobile
    if (window.innerWidth < 1024) toggleSidebar();
    return true;
}

// Update sidebar UI based on user's plan
function updateSidebarForPlan() {
    if (typeof PlanFeatures === 'undefined' || typeof Auth === 'undefined') return;
    
    document.querySelectorAll('.sidebar-item[data-feature]').forEach(item => {
        const feature = item.dataset.feature;
        const lockBadge = item.querySelector('.plan-lock-badge');
        const isComingSoon = item.dataset.comingSoon === 'true';
        
        // Skip coming soon items - they're always styled as disabled
        if (isComingSoon) return;
        
        if (lockBadge) {
            if (PlanFeatures.canAccess(feature)) {
                lockBadge.classList.add('hidden');
                item.classList.remove('opacity-60');
            } else {
                lockBadge.classList.remove('hidden');
                item.classList.add('opacity-60');
            }
        }
    });
    
    // Hide AI Insights sidebar link for Starter plan users
    const userPlan = Auth.getPlan ? Auth.getPlan() : 'starter';
    const insightsLink = document.querySelector('.sidebar-item[data-feature="insights"]');
    if (insightsLink && userPlan === 'starter') {
        insightsLink.classList.add('opacity-60');
        const badge = insightsLink.querySelector('.plan-lock-badge');
        if (badge) badge.classList.remove('hidden');
    }
}

// Run on page load
document.addEventListener('DOMContentLoaded', updateSidebarForPlan);
</script>
`

export const appHeader = (title: string, actions?: string) => `
<header class="h-16 bg-white border-b border-gray-200 hidden lg:flex items-center justify-between px-6">
    <div class="flex items-center gap-4">
        <h1 class="text-xl font-bold text-gray-900">${title}</h1>
        <!-- Data source indicator -->
        <div class="data-source-indicator"></div>
    </div>
    <div class="flex items-center gap-4">
        ${actions || ''}
        <!-- Notification Bell with Dropdown -->
        <div class="relative" id="notification-container">
            <button onclick="toggleNotifications()" class="p-2 text-gray-400 hover:text-gray-600 relative hover:bg-gray-100 rounded-lg transition-colors" id="notification-bell">
                <i class="fas fa-bell"></i>
                <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" id="notification-badge"></span>
            </button>
            <!-- Notification Dropdown -->
            <div id="notification-dropdown" class="hidden absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                <div class="p-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                    <div class="flex items-center justify-between">
                        <h3 class="font-semibold text-gray-900">Notifications</h3>
                        <button onclick="markAllNotificationsRead()" class="text-xs text-indigo-600 hover:text-indigo-700 font-medium">Mark all read</button>
                    </div>
                </div>
                <div class="max-h-80 overflow-y-auto" id="notification-list">
                    <!-- Notifications will be loaded dynamically -->
                    <div class="p-4 text-center text-gray-500 text-sm">
                        <i class="fas fa-spinner fa-spin mb-2"></i>
                        <p>Loading notifications...</p>
                    </div>
                </div>
                <div class="p-3 border-t border-gray-100 text-center">
                    <a href="/app/settings" class="text-sm text-indigo-600 hover:text-indigo-700 font-medium">Notification Settings</a>
                </div>
            </div>
        </div>
        <button onclick="showHelpCenter()" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Help Center"><i class="fas fa-question-circle"></i></button>
        <button onclick="handleLogout()" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Sign out">
            <i class="fas fa-sign-out-alt"></i>
        </button>
    </div>
</header>
<script>
    // Notification System
    let notificationsLoaded = false;
    
    function toggleNotifications() {
        const dropdown = document.getElementById('notification-dropdown');
        const isHidden = dropdown.classList.contains('hidden');
        
        // Close other dropdowns
        document.querySelectorAll('[id$="-dropdown"]').forEach(d => {
            if (d !== dropdown) d.classList.add('hidden');
        });
        
        dropdown.classList.toggle('hidden');
        
        if (isHidden && !notificationsLoaded) {
            loadNotifications();
        }
    }
    
    async function loadNotifications() {
        const list = document.getElementById('notification-list');
        const badge = document.getElementById('notification-badge');
        
        try {
            const token = localStorage.getItem('ownlay_token');
            const response = await fetch('/api/v1/notifications', {
                headers: token ? { 'Authorization': 'Bearer ' + token } : {}
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data?.notifications) {
                    renderNotifications(data.data.notifications);
                    const unread = data.data.notifications.filter(n => !n.read).length;
                    badge.style.display = unread > 0 ? 'block' : 'none';
                    notificationsLoaded = true;
                    return;
                }
            }
        } catch (e) {
            console.log('Using default notifications');
        }
        
        // Default notifications based on user state
        const defaultNotifications = getDefaultNotifications();
        renderNotifications(defaultNotifications);
        badge.style.display = defaultNotifications.some(n => !n.read) ? 'block' : 'none';
        notificationsLoaded = true;
    }
    
    function getDefaultNotifications() {
        const notifications = [];
        const user = JSON.parse(localStorage.getItem('ownlay_user') || '{}');
        const integrations = typeof Integrations !== 'undefined' ? Integrations.getConnected() : {};
        const connectedCount = Object.keys(integrations).filter(k => integrations[k]?.status === 'connected').length;
        
        // Welcome notification for new users
        notifications.push({
            id: 'welcome',
            type: 'info',
            title: 'Welcome to OWNLAY!',
            message: 'Get started by connecting your marketing platforms.',
            time: 'Just now',
            read: connectedCount > 0,
            action: { label: 'Connect', href: '/app/integrations' }
        });
        
        if (connectedCount === 0) {
            notifications.push({
                id: 'connect',
                type: 'warning',
                title: 'Connect Your Platforms',
                message: 'Link Shopify, Meta Ads, or Google Ads to see real data.',
                time: '5 min ago',
                read: false,
                action: { label: 'Connect Now', href: '/app/integrations' }
            });
        } else {
            notifications.push({
                id: 'connected',
                type: 'success',
                title: 'Platforms Connected',
                message: connectedCount + ' platform(s) syncing data successfully.',
                time: '1 hour ago',
                read: true
            });
        }
        
        if (user.plan === 'starter') {
            notifications.push({
                id: 'upgrade',
                type: 'promo',
                title: 'Unlock AI Insights',
                message: 'Upgrade to Growth plan for AI-powered recommendations.',
                time: '2 hours ago',
                read: false,
                action: { label: 'Upgrade', href: '/pricing' }
            });
        }
        
        return notifications;
    }
    
    function renderNotifications(notifications) {
        const list = document.getElementById('notification-list');
        
        if (!notifications || notifications.length === 0) {
            list.innerHTML = '<div class="p-8 text-center text-gray-500"><i class="fas fa-check-circle text-2xl mb-2 text-green-500"></i><p>All caught up!</p></div>';
            return;
        }
        
        const icons = {
            info: { icon: 'fa-info-circle', color: 'text-blue-500', bg: 'bg-blue-100' },
            success: { icon: 'fa-check-circle', color: 'text-green-500', bg: 'bg-green-100' },
            warning: { icon: 'fa-exclamation-triangle', color: 'text-amber-500', bg: 'bg-amber-100' },
            error: { icon: 'fa-times-circle', color: 'text-red-500', bg: 'bg-red-100' },
            promo: { icon: 'fa-gift', color: 'text-purple-500', bg: 'bg-purple-100' }
        };
        
        list.innerHTML = notifications.map(n => {
            const iconCfg = icons[n.type] || icons.info;
            return \`
                <div class="p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 \${n.read ? 'opacity-70' : ''}" data-notification-id="\${n.id}">
                    <div class="flex gap-3">
                        <div class="w-9 h-9 rounded-full \${iconCfg.bg} flex items-center justify-center flex-shrink-0">
                            <i class="fas \${iconCfg.icon} \${iconCfg.color}"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="font-medium text-gray-900 text-sm \${n.read ? '' : 'font-semibold'}">\${n.title}</p>
                            <p class="text-xs text-gray-600 mt-0.5">\${n.message}</p>
                            <div class="flex items-center justify-between mt-2">
                                <span class="text-xs text-gray-400">\${n.time}</span>
                                \${n.action ? \`<a href="\${n.action.href}" class="text-xs font-medium text-indigo-600 hover:text-indigo-700">\${n.action.label} →</a>\` : ''}
                            </div>
                        </div>
                        \${!n.read ? '<span class="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0"></span>' : ''}
                    </div>
                </div>
            \`;
        }).join('');
    }
    
    function markAllNotificationsRead() {
        const badge = document.getElementById('notification-badge');
        badge.style.display = 'none';
        document.querySelectorAll('[data-notification-id]').forEach(el => {
            el.classList.add('opacity-70');
            el.querySelector('.w-2.h-2.bg-indigo-500')?.remove();
        });
        if (typeof UI !== 'undefined') {
            UI.showToast('All notifications marked as read', 'success');
        }
    }
    
    function showHelpCenter() {
        if (typeof UI !== 'undefined') {
            UI.showToast('Help Center coming soon!', 'info');
        }
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        const container = document.getElementById('notification-container');
        if (container && !container.contains(e.target)) {
            document.getElementById('notification-dropdown')?.classList.add('hidden');
        }
    });
</script>

<!-- Mobile Page Title -->
<div class="lg:hidden px-4 py-3 bg-white border-b border-gray-200 mt-14">
    <div class="flex items-center justify-between">
        <h1 class="text-lg font-bold text-gray-900">${title}</h1>
        <div class="flex items-center gap-2">
            <button onclick="toggleNotifications()" class="p-2 text-gray-500 hover:text-gray-700 relative" id="mobile-notification-bell">
                <i class="fas fa-bell"></i>
                <span class="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" id="mobile-notification-badge"></span>
            </button>
            <button onclick="handleLogout()" class="p-2 text-gray-500 hover:text-red-600" title="Sign out">
                <i class="fas fa-sign-out-alt"></i>
            </button>
        </div>
    </div>
    <div class="data-source-indicator mt-2"></div>
    ${actions ? `<div class="mt-3 flex flex-wrap gap-2">${actions}</div>` : ''}
</div>
`

export const appLayout = (title: string, activePage: string, content: string, headerActions?: string) => `
${baseHead(title)}
<body class="bg-gray-50 min-h-screen">
    <!-- Auth Check - Redirect to sign in if not authenticated -->
    <script>
        (function() {
            const isLoggedIn = localStorage.getItem('ownlay_token');
            if (!isLoggedIn) {
                window.location.href = '/auth/signin?redirect=' + encodeURIComponent(window.location.pathname);
            }
        })();
    </script>
    ${appSidebar(activePage)}
    <div class="lg:ml-64 min-h-screen flex flex-col">
        ${appHeader(title, headerActions)}
        <main class="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
            ${content}
        </main>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="/static/js/app.js"></script>
    <script>
        // Initialize sidebar user info on page load
        document.addEventListener('DOMContentLoaded', function() {
            if (typeof updateSidebarUserInfo === 'function') {
                updateSidebarUserInfo();
            }
            
            // Initialize currency formatting based on user's locale
            initCurrencyFormatting();
        });
        
        // Currency formatting initialization function
        function initCurrencyFormatting() {
            if (typeof CurrencyFormatter === 'undefined') {
                setTimeout(initCurrencyFormatting, 100);
                return;
            }
            
            // Store the user's currency for dynamic updates
            window.userCurrency = CurrencyFormatter.getUserCurrency();
            window.formatCurrencyValue = (value, currency) => CurrencyFormatter.format(value, currency);
            window.formatCurrencyCompact = (value, currency) => CurrencyFormatter.formatCompact(value, currency);
            
            // PRIORITY 1: Format elements with data-currency-value attribute
            document.querySelectorAll('[data-currency-value]').forEach(el => {
                const value = parseFloat(el.getAttribute('data-currency-value'));
                if (!isNaN(value)) {
                    const prefix = value < 0 ? '' : (el.textContent && el.textContent.startsWith('+') ? '+' : '');
                    el.textContent = prefix + CurrencyFormatter.format(Math.abs(value));
                }
            });
            
            // PRIORITY 2: Auto-format text with $ prefix to user's locale currency
            const currencyPattern = /\\$([0-9,]+(?:\\.[0-9]{1,2})?)/g;
            
            // Walk through text nodes and format currency values
            const walker = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode: (node) => {
                        // Skip script and style tags
                        const parent = node.parentElement;
                        if (parent && (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE' || parent.tagName === 'TEXTAREA' || parent.tagName === 'INPUT')) {
                            return NodeFilter.FILTER_REJECT;
                        }
                        // Skip if parent already has data-currency-value (already formatted)
                        if (parent && parent.hasAttribute && parent.hasAttribute('data-currency-value')) {
                            return NodeFilter.FILTER_REJECT;
                        }
                        if (node.textContent && currencyPattern.test(node.textContent)) {
                            return NodeFilter.FILTER_ACCEPT;
                        }
                        return NodeFilter.FILTER_SKIP;
                    }
                }
            );
            
            const nodes = [];
            while (walker.nextNode()) {
                nodes.push(walker.currentNode);
            }
            
            // Format each node
            nodes.forEach(node => {
                const text = node.textContent;
                if (text) {
                    // Reset lastIndex since we're using the same regex
                    currencyPattern.lastIndex = 0;
                    node.textContent = text.replace(currencyPattern, (match, value) => {
                        const numValue = parseFloat(value.replace(/,/g, ''));
                        return CurrencyFormatter.format(numValue);
                    });
                }
            });
            
            console.log('[OWNLAY] Currency formatting initialized:', CurrencyFormatter.getUserCurrency(), 'for locale:', CurrencyFormatter.getUserLocale());
        }
    </script>
    ${sidebarAccessScript}
</body>
</html>
`

export const footer = () => `
<footer class="bg-gray-900 text-white py-12 lg:py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            <div class="col-span-2 md:col-span-4 lg:col-span-1">
                <div class="flex items-center gap-2 mb-4">
                    <div class="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
                        <i class="fas fa-layer-group text-white text-sm"></i>
                    </div>
                    <span class="text-xl font-bold">OWNLAY</span>
                </div>
                <p class="text-gray-400 text-sm mb-4 max-w-sm">The Marketing Operating System for modern growth teams. Unify, automate, and optimize your entire marketing stack.</p>
                <div class="flex gap-4">
                    <a href="https://twitter.com/ownlay" target="_blank" rel="noopener" class="text-gray-400 hover:text-white transition-colors"><i class="fab fa-twitter text-lg"></i></a>
                    <a href="https://linkedin.com/company/ownlay" target="_blank" rel="noopener" class="text-gray-400 hover:text-white transition-colors"><i class="fab fa-linkedin-in text-lg"></i></a>
                    <a href="https://github.com/ownlay" target="_blank" rel="noopener" class="text-gray-400 hover:text-white transition-colors"><i class="fab fa-github text-lg"></i></a>
                </div>
            </div>
            <div>
                <h4 class="font-semibold mb-4">Product</h4>
                <ul class="space-y-2 text-sm text-gray-400">
                    <li><a href="/#features" class="hover:text-white transition-colors">Features</a></li>
                    <li><a href="/pricing" class="hover:text-white transition-colors">Pricing</a></li>
                    <li><a href="/docs" class="hover:text-white transition-colors">Documentation</a></li>
                    <li><a href="/docs/api" class="hover:text-white transition-colors">API Reference</a></li>
                    <li><a href="/docs/integrations" class="hover:text-white transition-colors">Integrations</a></li>
                </ul>
            </div>
            <div>
                <h4 class="font-semibold mb-4">Company</h4>
                <ul class="space-y-2 text-sm text-gray-400">
                    <li><a href="/about" class="hover:text-white transition-colors">About</a></li>
                    <li><a href="/docs" class="hover:text-white transition-colors">Blog</a></li>
                    <li><a href="/contact" class="hover:text-white transition-colors">Careers</a></li>
                    <li><a href="/contact" class="hover:text-white transition-colors">Contact</a></li>
                </ul>
            </div>
            <div>
                <h4 class="font-semibold mb-4">Legal</h4>
                <ul class="space-y-2 text-sm text-gray-400">
                    <li><a href="/privacy" class="hover:text-white transition-colors">Privacy Policy</a></li>
                    <li><a href="/terms" class="hover:text-white transition-colors">Terms of Service</a></li>
                    <li><a href="/security" class="hover:text-white transition-colors">Security</a></li>
                    <li><a href="/privacy#gdpr" class="hover:text-white transition-colors">GDPR</a></li>
                    <li><a href="/privacy#ccpa" class="hover:text-white transition-colors">CCPA</a></li>
                </ul>
            </div>
        </div>
        <div class="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p class="text-sm text-gray-400">&copy; 2024 OWNLAY. All rights reserved.</p>
            <div class="flex flex-wrap items-center justify-center gap-4 lg:gap-6">
                <div class="flex items-center gap-2 text-sm text-gray-400">
                    <i class="fas fa-shield-check text-green-500"></i>
                    <span>SOC 2 Type II</span>
                </div>
                <div class="flex items-center gap-2 text-sm text-gray-400">
                    <i class="fas fa-lock text-green-500"></i>
                    <span>256-bit Encryption</span>
                </div>
                <div class="flex items-center gap-2 text-sm text-gray-400">
                    <i class="fas fa-check-circle text-green-500"></i>
                    <span>GDPR Compliant</span>
                </div>
            </div>
        </div>
    </div>
</footer>
`
