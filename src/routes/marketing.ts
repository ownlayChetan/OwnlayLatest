import { Hono } from 'hono'
import { baseHead, footer } from '../components/layout'

export const marketingRoutes = new Hono()

// Enhanced marketing navigation with mobile support
const enhancedMarketingNav = () => `
<nav class="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100/50 transition-all duration-300" id="main-nav">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16 md:h-20">
            <div class="flex items-center gap-6 lg:gap-10">
                <a href="/" class="flex items-center gap-2 sm:gap-3 group">
                    <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow">
                        <i class="fas fa-layer-group text-white text-sm sm:text-base"></i>
                    </div>
                    <span class="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">OWNLAY</span>
                </a>
                <div class="hidden lg:flex items-center gap-1">
                    <a href="/#features" class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">Features</a>
                    <a href="/#integrations" class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">Integrations</a>
                    <a href="/pricing" class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">Pricing</a>
                    <a href="/docs" class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">Docs</a>
                    <a href="/docs/api" class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">API</a>
                </div>
            </div>
            <!-- Buttons for logged-out users -->
            <div id="nav-logged-out" class="flex items-center gap-2 sm:gap-3">
                <a href="/influencer/signup" class="hidden md:inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-sm font-medium rounded-xl transition-all shadow-md shadow-pink-500/20">
                    <i class="fas fa-star text-xs"></i>
                    Join as Creator
                </a>
                <a href="/auth/signin" class="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">Sign In</a>
                <a href="/auth/signup" class="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all transform hover:-translate-y-0.5">
                    Start Free
                </a>
                <button class="lg:hidden p-2 text-gray-600 hover:text-indigo-600" onclick="toggleMobileMenu()">
                    <i class="fas fa-bars text-xl"></i>
                </button>
            </div>
            <!-- Buttons for logged-in users (hidden by default) -->
            <div id="nav-logged-in" class="hidden items-center gap-2 sm:gap-3">
                <a href="/app/dashboard" id="nav-dashboard-link" class="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
                    <i class="fas fa-grid-2"></i>
                    Dashboard
                </a>
                <span id="nav-user-name" class="hidden md:inline-flex text-sm font-medium text-gray-900"></span>
                <button onclick="handleNavLogout()" class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2">
                    <i class="fas fa-sign-out-alt"></i>
                    <span class="hidden sm:inline">Sign Out</span>
                </button>
                <button class="lg:hidden p-2 text-gray-600 hover:text-indigo-600" onclick="toggleMobileMenu()">
                    <i class="fas fa-bars text-xl"></i>
                </button>
            </div>
        </div>
    </div>
    
    <!-- Mobile Menu -->
    <div id="mobile-menu" class="lg:hidden hidden bg-white border-t border-gray-100 px-4 py-4 space-y-2">
        <a href="/#features" class="block px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors">Features</a>
        <a href="/#integrations" class="block px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors">Integrations</a>
        <a href="/pricing" class="block px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors">Pricing</a>
        <a href="/docs" class="block px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors">Docs</a>
        <hr class="my-2 border-gray-200">
        <!-- Mobile logged-out links -->
        <div id="mobile-nav-logged-out">
            <a href="/influencer/signup" class="block px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-center font-medium rounded-xl hover:from-pink-600 hover:to-purple-700 mb-2">
                <i class="fas fa-star mr-2"></i>Join as Creator
            </a>
            <a href="/auth/signin" class="block px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors">Sign In</a>
            <a href="/auth/signup" class="block px-4 py-3 bg-indigo-600 text-white text-center font-medium rounded-xl hover:bg-indigo-700">
                Start Free Trial
            </a>
        </div>
        <!-- Mobile logged-in links (hidden by default) -->
        <div id="mobile-nav-logged-in" class="hidden">
            <a href="/app/dashboard" id="mobile-nav-dashboard-link" class="block px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors">
                <i class="fas fa-grid-2 mr-2"></i>Dashboard
            </a>
            <button onclick="handleNavLogout()" class="w-full block px-4 py-3 bg-red-500 text-white text-center font-medium rounded-xl hover:bg-red-600">
                <i class="fas fa-sign-out-alt mr-2"></i>Sign Out
            </button>
        </div>
    </div>
</nav>
<script>
function toggleMobileMenu() {
    document.getElementById('mobile-menu').classList.toggle('hidden');
}
function handleNavLogout() {
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
            if (navLoggedIn) {
                navLoggedIn.classList.remove('hidden');
                navLoggedIn.classList.add('flex');
            }
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

// Dark theme navigation (matches homepage)
const darkMarketingNav = () => `
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
                <a href="/docs" class="text-slate-300 hover:text-white transition-colors">Docs</a>
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

// Dark theme footer (matches homepage)
const darkMarketingFooter = () => `
<footer class="bg-slate-950 border-t border-slate-800/50 py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            <div class="col-span-2 lg:col-span-1">
                <a href="/" class="flex items-center gap-3 mb-4">
                    <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
                        <i class="fas fa-layer-group text-white text-lg"></i>
                    </div>
                    <span class="text-xl font-bold text-white">OWNLAY</span>
                </a>
                <p class="text-slate-400 text-sm">The Marketing Operating System for modern growth teams.</p>
            </div>
            <div>
                <h4 class="text-white font-semibold mb-4">Product</h4>
                <ul class="space-y-2 text-sm">
                    <li><a href="/#features" class="text-slate-400 hover:text-indigo-400 transition-colors">Features</a></li>
                    <li><a href="/#integrations" class="text-slate-400 hover:text-indigo-400 transition-colors">Integrations</a></li>
                    <li><a href="/pricing" class="text-slate-400 hover:text-indigo-400 transition-colors">Pricing</a></li>
                    <li><a href="/docs" class="text-slate-400 hover:text-indigo-400 transition-colors">Documentation</a></li>
                </ul>
            </div>
            <div>
                <h4 class="text-white font-semibold mb-4">Company</h4>
                <ul class="space-y-2 text-sm">
                    <li><a href="/about" class="text-slate-400 hover:text-indigo-400 transition-colors">About</a></li>
                    <li><a href="/blog" class="text-slate-400 hover:text-indigo-400 transition-colors">Blog</a></li>
                    <li><a href="/careers" class="text-slate-400 hover:text-indigo-400 transition-colors">Careers</a></li>
                    <li><a href="/contact" class="text-slate-400 hover:text-indigo-400 transition-colors">Contact</a></li>
                </ul>
            </div>
            <div>
                <h4 class="text-white font-semibold mb-4">Legal</h4>
                <ul class="space-y-2 text-sm">
                    <li><a href="/privacy" class="text-slate-400 hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
                    <li><a href="/terms" class="text-slate-400 hover:text-indigo-400 transition-colors">Terms of Service</a></li>
                    <li><a href="/security" class="text-slate-400 hover:text-indigo-400 transition-colors">Security</a></li>
                </ul>
            </div>
            <div>
                <h4 class="text-white font-semibold mb-4">Connect</h4>
                <div class="flex gap-3">
                    <a href="#" class="w-10 h-10 rounded-lg bg-slate-800 hover:bg-indigo-600 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                        <i class="fab fa-twitter"></i>
                    </a>
                    <a href="#" class="w-10 h-10 rounded-lg bg-slate-800 hover:bg-indigo-600 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                        <i class="fab fa-linkedin"></i>
                    </a>
                    <a href="#" class="w-10 h-10 rounded-lg bg-slate-800 hover:bg-indigo-600 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                        <i class="fab fa-github"></i>
                    </a>
                </div>
            </div>
        </div>
        <div class="border-t border-slate-800/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p class="text-slate-500 text-sm">&copy; 2024 OWNLAY. All rights reserved.</p>
            <div class="flex items-center gap-6 text-sm text-slate-500">
                <span class="flex items-center gap-2">
                    <i class="fas fa-shield-alt text-emerald-500"></i>
                    SOC 2 Type II
                </span>
                <span class="flex items-center gap-2">
                    <i class="fas fa-lock text-emerald-500"></i>
                    256-bit Encryption
                </span>
            </div>
        </div>
    </div>
</footer>
`

// Home page styles
const homeStyles = `
<style>
    /* Keyframe Animations */
    @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(2deg); }
    }
    @keyframes float-reverse {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(20px) rotate(-2deg); }
    }
    @keyframes pulse-glow {
        0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.3); }
        50% { box-shadow: 0 0 60px rgba(99, 102, 241, 0.6); }
    }
    @keyframes gradient-shift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
    }
    @keyframes slide-up {
        from { opacity: 0; transform: translateY(40px); }
        to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slide-right {
        from { opacity: 0; transform: translateX(-40px); }
        to { opacity: 1; transform: translateX(0); }
    }
    @keyframes scale-in {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
    }
    @keyframes counter-up {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    @keyframes draw-line {
        from { stroke-dashoffset: 1000; }
        to { stroke-dashoffset: 0; }
    }
    @keyframes blob {
        0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
        50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
    }
    @keyframes marquee {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
    }
    
    /* Animation Classes */
    .animate-float { animation: float 6s ease-in-out infinite; }
    .animate-float-reverse { animation: float-reverse 7s ease-in-out infinite; }
    .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
    .animate-gradient { 
        background-size: 200% 200%;
        animation: gradient-shift 8s ease infinite;
    }
    .animate-slide-up { animation: slide-up 0.8s ease-out forwards; }
    .animate-slide-right { animation: slide-right 0.8s ease-out forwards; }
    .animate-scale-in { animation: scale-in 0.6s ease-out forwards; }
    .animate-blob { animation: blob 8s ease-in-out infinite; }
    .animate-marquee { animation: marquee 30s linear infinite; }
    
    /* Delay utilities */
    .delay-100 { animation-delay: 0.1s; }
    .delay-200 { animation-delay: 0.2s; }
    .delay-300 { animation-delay: 0.3s; }
    .delay-400 { animation-delay: 0.4s; }
    .delay-500 { animation-delay: 0.5s; }
    
    /* Hero gradient */
    .hero-gradient {
        background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 30%, #312e81 60%, #4338ca 100%);
    }
    
    /* Mesh gradient background */
    .mesh-gradient {
        background: 
            radial-gradient(at 40% 20%, hsla(228, 100%, 74%, 0.15) 0px, transparent 50%),
            radial-gradient(at 80% 0%, hsla(189, 100%, 56%, 0.1) 0px, transparent 50%),
            radial-gradient(at 0% 50%, hsla(355, 100%, 93%, 0.1) 0px, transparent 50%),
            radial-gradient(at 80% 50%, hsla(340, 100%, 76%, 0.1) 0px, transparent 50%),
            radial-gradient(at 0% 100%, hsla(269, 100%, 77%, 0.1) 0px, transparent 50%);
    }
    
    /* Glass card */
    .glass-card {
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.3);
    }
    
    /* Gradient text */
    .gradient-text {
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
    
    /* Glow effects */
    .glow-indigo { box-shadow: 0 0 40px rgba(99, 102, 241, 0.3); }
    .glow-purple { box-shadow: 0 0 40px rgba(139, 92, 246, 0.3); }
    
    /* Card hover effects */
    .card-3d {
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .card-3d:hover {
        transform: translateY(-8px) rotateX(2deg);
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
    }
    
    /* Feature card gradient border */
    .gradient-border {
        position: relative;
        background: white;
    }
    .gradient-border::before {
        content: '';
        position: absolute;
        inset: -2px;
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
        border-radius: inherit;
        z-index: -1;
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    .gradient-border:hover::before {
        opacity: 1;
    }
    
    /* Scroll reveal */
    .reveal {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.8s ease;
    }
    .reveal.active {
        opacity: 1;
        transform: translateY(0);
    }
    
    /* Dashboard preview styling */
    .dashboard-preview {
        background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    /* Pricing card popular */
    .pricing-popular {
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        transform: scale(1.05);
    }
    
    /* Integration logos animation */
    .logo-carousel {
        mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
    }
    
    /* Stats counter */
    .stat-number {
        font-feature-settings: "tnum";
        font-variant-numeric: tabular-nums;
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
        .hero-gradient {
            padding-top: 5rem;
        }
    }
</style>
`

// Customer logos for social proof
const customerLogos = [
    { name: 'Acme Corp', icon: 'fa-building' },
    { name: 'TechFlow', icon: 'fa-microchip' },
    { name: 'Bloom', icon: 'fa-leaf' },
    { name: 'Nexus', icon: 'fa-diagram-project' },
    { name: 'Vertex', icon: 'fa-cube' },
    { name: 'Quantum', icon: 'fa-atom' },
    { name: 'Aurora', icon: 'fa-sun' },
    { name: 'Zenith', icon: 'fa-mountain' }
]

// Features data
const features = [
    {
        id: 'dashboard',
        icon: 'fa-grid-2',
        color: 'from-blue-500 to-cyan-500',
        title: 'Unified Dashboard',
        description: 'See all your marketing data in one place. Real-time metrics from every channel, unified under a single source of truth.',
        benefits: ['Cross-channel attribution', 'Real-time data sync', 'Custom dashboards', 'Executive reports'],
        stats: '10+ data sources'
    },
    {
        id: 'campaigns',
        icon: 'fa-bullseye',
        color: 'from-purple-500 to-pink-500',
        title: 'Campaign Builder',
        description: 'Visual funnel canvas to design, launch, and optimize multi-touch campaigns with drag-and-drop simplicity.',
        benefits: ['Visual funnel editor', 'A/B testing built-in', 'Multi-channel journeys', 'Template library'],
        stats: '50+ templates'
    },
    {
        id: 'ads',
        icon: 'fa-rectangle-ad',
        color: 'from-orange-500 to-red-500',
        title: 'Ad Manager',
        description: 'Manage Google, Meta, TikTok, and LinkedIn ads from one interface. Bulk edits, unified reporting.',
        benefits: ['Multi-platform control', 'Bulk operations', 'Unified bidding', 'Creative rotation'],
        stats: '4 platforms'
    },
    {
        id: 'automation',
        icon: 'fa-robot',
        color: 'from-green-500 to-emerald-500',
        title: 'Automation Workflows',
        description: 'Build intelligent automation sequences that respond to user behavior with event-driven triggers.',
        benefits: ['Event-driven triggers', 'Conditional logic', 'Multi-step workflows', 'Slack/Email alerts'],
        stats: '100+ triggers'
    },
    {
        id: 'insights',
        icon: 'fa-brain',
        color: 'from-violet-500 to-purple-500',
        title: 'AI Insights',
        description: 'Machine learning models surface opportunities and anomalies. Predictive ROI and budget optimization.',
        benefits: ['Predictive analytics', 'Anomaly detection', 'Budget optimizer', 'NL queries'],
        stats: 'GPT-4 powered'
    },
    {
        id: 'analytics',
        icon: 'fa-chart-line',
        color: 'from-indigo-500 to-blue-500',
        title: 'Analytics & Reports',
        description: 'Deep-dive into performance metrics. Custom reports, scheduled exports, and warehouse integrations.',
        benefits: ['Custom reports', 'Scheduled exports', 'Data warehouse sync', 'Attribution models'],
        stats: '30+ metrics'
    }
]

// Integration partners
const integrations = [
    { name: 'Google Ads', icon: 'fa-google', color: '#4285f4' },
    { name: 'Meta Ads', icon: 'fa-meta', color: '#1877f2' },
    { name: 'TikTok', icon: 'fa-tiktok', color: '#000000' },
    { name: 'LinkedIn', icon: 'fa-linkedin', color: '#0a66c2' },
    { name: 'Shopify', icon: 'fa-shopify', color: '#96bf48' },
    { name: 'Stripe', icon: 'fa-stripe', color: '#635bff' },
    { name: 'Mailchimp', icon: 'fa-mailchimp', color: '#ffe01b' },
    { name: 'Slack', icon: 'fa-slack', color: '#4a154b' },
    { name: 'HubSpot', icon: 'fa-hubspot', color: '#ff7a59' },
    { name: 'Salesforce', icon: 'fa-salesforce', color: '#00a1e0' }
]

// Pricing tiers with INR and USD
const pricingTiersData = {
    USD: [
        {
            name: 'Starter',
            price: '$29',
            period: '/month',
            yearlyPrice: '$24',
            yearlyTotal: '$288/year',
            description: 'For small teams getting started with unified marketing',
            features: [
                { text: 'Up to 3 users', included: true },
                { text: '3 channel connectors', included: true },
                { text: 'Basic AI insights', included: true },
                { text: '30-day data retention', included: true },
                { text: 'Email support', included: true },
                { text: 'Standard reports', included: true },
                { text: 'Campaign Builder', included: false, tooltip: 'Available in Growth plan' },
                { text: 'Ad Manager', included: false, tooltip: 'Available in Pro plan' },
                { text: 'Creative Studio', included: false, tooltip: 'Available in Pro plan' }
            ],
            cta: 'Start 7-Day Free Trial',
            trialDays: 7,
            noCardRequired: true,
            popular: false,
            planId: 'starter'
        },
        {
            name: 'Growth',
            price: '$79',
            period: '/month',
            yearlyPrice: '$66',
            yearlyTotal: '$792/year',
            description: 'For scaling teams that need campaign management',
            features: [
                { text: 'Up to 10 users', included: true },
                { text: '7 channel connectors', included: true },
                { text: 'Advanced AI insights', included: true },
                { text: '90-day data retention', included: true },
                { text: 'Priority email support', included: true },
                { text: 'Custom dashboards', included: true },
                { text: 'Campaign Builder', included: true, highlight: true },
                { text: 'Automation workflows', included: true },
                { text: 'Ad Manager', included: false, tooltip: 'Available in Pro plan' },
                { text: 'Creative Studio', included: false, tooltip: 'Available in Pro plan' }
            ],
            cta: 'Get Started',
            trialDays: 0,
            noCardRequired: false,
            popular: true,
            planId: 'growth'
        },
        {
            name: 'Pro',
            price: '$149',
            period: '/month',
            yearlyPrice: '$124',
            yearlyTotal: '$1,488/year',
            description: 'For professional teams needing full creative control',
            features: [
                { text: 'Up to 25 users', included: true },
                { text: 'Unlimited connectors', included: true },
                { text: 'Full AI suite', included: true },
                { text: '1-year data retention', included: true },
                { text: 'Priority chat & email support', included: true },
                { text: 'Advanced analytics', included: true },
                { text: 'Campaign Builder', included: true },
                { text: 'Ad Manager', included: true, highlight: true },
                { text: 'Creative Studio', included: true, highlight: true },
                { text: 'API access (10K calls/mo)', included: true }
            ],
            cta: 'Get Started',
            trialDays: 0,
            noCardRequired: false,
            popular: false,
            planId: 'pro'
        },
        {
            name: 'Enterprise',
            price: 'Custom',
            period: '',
            yearlyPrice: 'Custom',
            yearlyTotal: 'Contact us',
            description: 'For large organizations with complex requirements',
            features: [
                { text: 'Unlimited users', included: true },
                { text: 'Unlimited connectors', included: true },
                { text: 'Full AI suite + Custom models', included: true },
                { text: 'Unlimited data retention', included: true },
                { text: 'Dedicated success manager', included: true },
                { text: 'SSO/SAML authentication', included: true },
                { text: 'White-label solution', included: true, highlight: true },
                { text: 'Custom integrations', included: true, highlight: true },
                { text: 'Unlimited API access', included: true },
                { text: '99.99% SLA guarantee', included: true },
                { text: 'Data warehouse sync', included: true },
                { text: 'On-premise deployment option', included: true }
            ],
            cta: 'Contact Sales',
            popular: false,
            planId: 'enterprise'
        }
    ],
    INR: [
        {
            name: 'Starter',
            price: '₹1,999',
            period: '/month',
            yearlyPrice: '₹1,666',
            yearlyTotal: '₹19,990/year',
            description: 'For small teams getting started with unified marketing',
            features: [
                { text: 'Up to 3 users', included: true },
                { text: '3 channel connectors', included: true },
                { text: 'Basic AI insights', included: true },
                { text: '30-day data retention', included: true },
                { text: 'Email support', included: true },
                { text: 'Standard reports', included: true },
                { text: 'Campaign Builder', included: false, tooltip: 'Available in Growth plan' },
                { text: 'Ad Manager', included: false, tooltip: 'Available in Pro plan' },
                { text: 'Creative Studio', included: false, tooltip: 'Available in Pro plan' }
            ],
            cta: 'Start 7-Day Free Trial',
            trialDays: 7,
            noCardRequired: true,
            popular: false,
            planId: 'starter'
        },
        {
            name: 'Growth',
            price: '₹4,999',
            period: '/month',
            yearlyPrice: '₹4,166',
            yearlyTotal: '₹49,990/year',
            description: 'For scaling teams that need campaign management',
            features: [
                { text: 'Up to 10 users', included: true },
                { text: '7 channel connectors', included: true },
                { text: 'Advanced AI insights', included: true },
                { text: '90-day data retention', included: true },
                { text: 'Priority email support', included: true },
                { text: 'Custom dashboards', included: true },
                { text: 'Campaign Builder', included: true, highlight: true },
                { text: 'Automation workflows', included: true },
                { text: 'Ad Manager', included: false, tooltip: 'Available in Pro plan' },
                { text: 'Creative Studio', included: false, tooltip: 'Available in Pro plan' }
            ],
            cta: 'Get Started',
            trialDays: 0,
            noCardRequired: false,
            popular: true,
            planId: 'growth'
        },
        {
            name: 'Pro',
            price: '₹9,999',
            period: '/month',
            yearlyPrice: '₹8,333',
            yearlyTotal: '₹99,990/year',
            description: 'For professional teams needing full creative control',
            features: [
                { text: 'Up to 25 users', included: true },
                { text: 'Unlimited connectors', included: true },
                { text: 'Full AI suite', included: true },
                { text: '1-year data retention', included: true },
                { text: 'Priority chat & email support', included: true },
                { text: 'Advanced analytics', included: true },
                { text: 'Campaign Builder', included: true },
                { text: 'Ad Manager', included: true, highlight: true },
                { text: 'Creative Studio', included: true, highlight: true },
                { text: 'API access (10K calls/mo)', included: true }
            ],
            cta: 'Get Started',
            trialDays: 0,
            noCardRequired: false,
            popular: false,
            planId: 'pro'
        },
        {
            name: 'Enterprise',
            price: 'Custom',
            period: '',
            yearlyPrice: 'Custom',
            yearlyTotal: 'Contact us',
            description: 'For large organizations with complex requirements',
            features: [
                { text: 'Unlimited users', included: true },
                { text: 'Unlimited connectors', included: true },
                { text: 'Full AI suite + Custom models', included: true },
                { text: 'Unlimited data retention', included: true },
                { text: 'Dedicated success manager', included: true },
                { text: 'SSO/SAML authentication', included: true },
                { text: 'White-label solution', included: true, highlight: true },
                { text: 'Custom integrations', included: true, highlight: true },
                { text: 'Unlimited API access', included: true },
                { text: '99.99% SLA guarantee', included: true },
                { text: 'Data warehouse sync', included: true },
                { text: 'On-premise deployment option', included: true }
            ],
            cta: 'Contact Sales',
            popular: false,
            planId: 'enterprise'
        }
    ]
}

// Legacy pricing tiers for backward compatibility
const pricingTiers = pricingTiersData.USD.map(tier => ({
    name: tier.name,
    price: tier.price,
    period: tier.period,
    description: tier.description,
    features: tier.features.filter(f => f.included).map(f => f.text),
    cta: tier.cta,
    popular: tier.popular
}))

// Stats
const stats = [
    { value: '5,000+', label: 'Marketing Teams', icon: 'fa-users' },
    { value: '$2.4B', label: 'Ad Spend Managed', icon: 'fa-dollar-sign' },
    { value: '4.2x', label: 'Average ROAS', icon: 'fa-chart-line' },
    { value: '99.9%', label: 'Uptime SLA', icon: 'fa-server' }
]

// Home page - Serve React SPA directly at root
// The React app is the primary frontend with proper Tailwind CSS build
// This serves the same index.html that /react/* serves
marketingRoutes.get('/', (c) => {
    const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>OWNLAY - Marketing Operating System</title>
    <meta name="description" content="Unify, automate, and optimize your entire marketing stack with OWNLAY - the AI-powered marketing operating system for modern growth teams." />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <script type="module" crossorigin src="/app/assets/index-Si0xqwMO.js"></script>
    <link rel="stylesheet" crossorigin href="/app/assets/index-D_n9C5Ak.css">
  </head>
  <body class="antialiased">
    <div id="root"></div>
  </body>
</html>`
    return c.html(indexHtml)
})

// Legacy home page (kept for reference but not used)
// To access old SSR homepage, use /home-legacy
marketingRoutes.get('/home-legacy', (c) => {
    return c.html(`
${baseHead('The Marketing Operating System', 'Unify, automate, and optimize your entire marketing stack with OWNLAY - the AI-powered marketing operating system for modern growth teams.')}
${homeStyles}
<body class="bg-white overflow-x-hidden">
    ${enhancedMarketingNav()}
    
    <!-- Hero Section -->
    <section class="hero-gradient pt-24 md:pt-32 pb-20 lg:pt-40 lg:pb-32 relative overflow-hidden">
        <!-- Animated background elements -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
            <div class="absolute w-96 h-96 -top-48 -left-48 bg-purple-500/20 rounded-full blur-3xl animate-blob"></div>
            <div class="absolute w-96 h-96 top-1/3 -right-48 bg-indigo-500/20 rounded-full blur-3xl animate-blob" style="animation-delay: 2s;"></div>
            <div class="absolute w-64 h-64 bottom-0 left-1/3 bg-blue-500/20 rounded-full blur-3xl animate-blob" style="animation-delay: 4s;"></div>
        </div>
        
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div class="max-w-4xl mx-auto text-center">
                <!-- Badge -->
                <div class="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-indigo-200 text-sm mb-6 md:mb-8 animate-slide-up border border-white/20">
                    <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                    <span>Turn complexity into clarity with AI.</span>
                    <i class="fas fa-arrow-right text-xs"></i>
                </div>
                
                <!-- Main headline -->
                <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-slide-up delay-100">
                    The Marketing<br/>
                    <span class="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">Operating System</span>
                </h1>
                
                <!-- Value proposition -->
                <p class="text-lg sm:text-xl md:text-2xl text-gray-300 mb-4 max-w-2xl mx-auto animate-slide-up delay-200">
                    Unify every channel. Automate every workflow. Optimize every dollar.
                </p>
                <p class="text-base md:text-lg text-gray-400 mb-8 md:mb-10 max-w-xl mx-auto animate-slide-up delay-300">
                    One platform to connect, analyze, and scale your entire marketing stack — from ads to email to analytics.
                </p>
                
                <!-- CTA buttons -->
                <div class="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up delay-400">
                    <a href="/auth/signup" class="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all text-lg shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transform hover:-translate-y-1">
                        Start Free Trial
                        <i class="fas fa-arrow-right ml-2"></i>
                    </a>
                    <a href="#demo" class="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold rounded-xl transition-all text-lg flex items-center justify-center gap-2 border border-white/20">
                        <i class="fas fa-play-circle"></i>
                        Watch Demo
                    </a>
                </div>
                
                <p class="mt-6 text-sm text-gray-400 animate-slide-up delay-500">
                    <i class="fas fa-check-circle text-green-400 mr-2"></i>No credit card required
                    <span class="mx-3 text-gray-600">•</span>
                    <i class="fas fa-clock text-indigo-400 mr-2"></i>14-day free trial
                </p>
            </div>
        </div>
        
        <!-- Dashboard Preview -->
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 md:mt-16 animate-scale-in delay-500">
            <div class="relative">
                <!-- Glow effect -->
                <div class="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl"></div>
                
                <div class="relative dashboard-preview rounded-2xl shadow-2xl overflow-hidden">
                    <div class="flex items-center gap-2 px-4 py-3 bg-gray-900 border-b border-gray-800">
                        <div class="flex gap-1.5">
                            <div class="w-3 h-3 rounded-full bg-red-500"></div>
                            <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div class="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <div class="flex-1 text-center text-xs text-gray-500">app.ownlay.io/dashboard</div>
                    </div>
                    <div class="p-4 md:p-6 bg-gradient-to-br from-gray-900 to-gray-950">
                        <!-- Mini dashboard mockup -->
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
                            <div class="bg-gray-800/50 rounded-xl p-3 md:p-4 border border-gray-700/50">
                                <p class="text-gray-400 text-xs mb-1">Total Spend</p>
                                <p class="text-white text-lg md:text-2xl font-bold">$124,563</p>
                                <p class="text-green-400 text-xs mt-1"><i class="fas fa-arrow-up mr-1"></i>12.5%</p>
                            </div>
                            <div class="bg-gray-800/50 rounded-xl p-3 md:p-4 border border-gray-700/50">
                                <p class="text-gray-400 text-xs mb-1">Conversions</p>
                                <p class="text-white text-lg md:text-2xl font-bold">3,847</p>
                                <p class="text-green-400 text-xs mt-1"><i class="fas fa-arrow-up mr-1"></i>8.2%</p>
                            </div>
                            <div class="bg-gray-800/50 rounded-xl p-3 md:p-4 border border-gray-700/50">
                                <p class="text-gray-400 text-xs mb-1">ROAS</p>
                                <p class="text-white text-lg md:text-2xl font-bold">4.2x</p>
                                <p class="text-green-400 text-xs mt-1"><i class="fas fa-arrow-up mr-1"></i>0.3x</p>
                            </div>
                            <div class="bg-gray-800/50 rounded-xl p-3 md:p-4 border border-gray-700/50">
                                <p class="text-gray-400 text-xs mb-1">Avg. CPA</p>
                                <p class="text-white text-lg md:text-2xl font-bold">$32.38</p>
                                <p class="text-green-400 text-xs mt-1"><i class="fas fa-arrow-down mr-1"></i>5.1%</p>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div class="md:col-span-2 bg-gray-800/30 rounded-xl p-4 border border-gray-700/50 h-32 md:h-48 flex items-center justify-center">
                                <div class="w-full h-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                                    <i class="fas fa-chart-area text-indigo-400 text-4xl opacity-50"></i>
                                </div>
                            </div>
                            <div class="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                                <p class="text-gray-400 text-xs mb-3 font-medium">AI Insight</p>
                                <div class="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg p-3 border border-green-500/20">
                                    <p class="text-green-400 text-xs mb-1"><i class="fas fa-lightbulb mr-1"></i>Opportunity</p>
                                    <p class="text-gray-300 text-sm">Move $5K to Meta retargeting for +18% ROAS</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Social Proof / Customer Logos -->
    <section class="py-12 md:py-16 bg-gray-50 border-y border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p class="text-center text-sm font-medium text-gray-500 mb-6 md:mb-8 uppercase tracking-wider">Trusted by 5,000+ marketing teams worldwide</p>
            <div class="logo-carousel overflow-hidden">
                <div class="flex items-center gap-8 md:gap-16 animate-marquee whitespace-nowrap">
                    ${customerLogos.map(logo => `
                    <div class="flex items-center gap-2 text-xl md:text-2xl font-bold text-gray-300 hover:text-gray-400 transition-colors shrink-0">
                        <i class="fas ${logo.icon} text-gray-400"></i>
                        ${logo.name}
                    </div>
                    `).join('')}
                    ${customerLogos.map(logo => `
                    <div class="flex items-center gap-2 text-xl md:text-2xl font-bold text-gray-300 hover:text-gray-400 transition-colors shrink-0">
                        <i class="fas ${logo.icon} text-gray-400"></i>
                        ${logo.name}
                    </div>
                    `).join('')}
                </div>
            </div>
        </div>
    </section>
    
    <!-- Stats Section -->
    <section class="py-16 md:py-20 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                ${stats.map((stat, i) => `
                <div class="text-center reveal" style="animation-delay: ${i * 0.1}s;">
                    <div class="w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                        <i class="fas ${stat.icon} text-indigo-600 text-xl md:text-2xl"></i>
                    </div>
                    <p class="text-3xl md:text-4xl font-bold gradient-text stat-number mb-2">${stat.value}</p>
                    <p class="text-gray-600 text-sm md:text-base">${stat.label}</p>
                </div>
                `).join('')}
            </div>
        </div>
    </section>
    
    <!-- How It Works Section -->
    <section class="py-20 md:py-28 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center max-w-3xl mx-auto mb-12 md:mb-16">
                <span class="inline-block px-4 py-1 bg-purple-100 text-purple-700 text-sm font-semibold rounded-full mb-4">How It Works</span>
                <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Get started in minutes, not months</h2>
                <p class="text-lg text-gray-600">Connect your tools, let AI analyze your data, and start optimizing immediately.</p>
            </div>
            
            <div class="grid md:grid-cols-3 gap-8 md:gap-12">
                <div class="text-center reveal">
                    <div class="relative">
                        <div class="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/30 animate-float">
                            <i class="fas fa-plug text-white text-2xl"></i>
                        </div>
                        <span class="absolute -top-2 -right-2 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">1</span>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900 mb-3">Connect Your Channels</h3>
                    <p class="text-gray-600">One-click OAuth connections to Google Ads, Meta, Shopify, and 20+ more platforms.</p>
                </div>
                
                <div class="text-center reveal delay-200">
                    <div class="relative">
                        <div class="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-xl shadow-purple-500/30 animate-float" style="animation-delay: 1s;">
                            <i class="fas fa-brain text-white text-2xl"></i>
                        </div>
                        <span class="absolute -top-2 -right-2 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">2</span>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900 mb-3">AI Analyzes Your Data</h3>
                    <p class="text-gray-600">Our ML models analyze your historical data and identify optimization opportunities.</p>
                </div>
                
                <div class="text-center reveal delay-400">
                    <div class="relative">
                        <div class="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-xl shadow-green-500/30 animate-float" style="animation-delay: 2s;">
                            <i class="fas fa-rocket text-white text-2xl"></i>
                        </div>
                        <span class="absolute -top-2 -right-2 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">3</span>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900 mb-3">Optimize & Scale</h3>
                    <p class="text-gray-600">Apply AI recommendations with one click and watch your ROAS improve automatically.</p>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Features Section -->
    <section id="features" class="py-20 md:py-28 bg-gray-50 mesh-gradient">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center max-w-3xl mx-auto mb-12 md:mb-16">
                <span class="inline-block px-4 py-1 bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-full mb-4">Features</span>
                <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Everything you need to scale marketing</h2>
                <p class="text-lg text-gray-600">From campaign creation to AI-powered optimization, OWNLAY gives your team the tools to move faster and perform better.</p>
            </div>
            
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                ${features.map((feature, i) => `
                <div class="bg-white rounded-2xl p-6 md:p-8 card-3d gradient-border reveal" style="animation-delay: ${i * 0.1}s;">
                    <div class="w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg">
                        <i class="fas ${feature.icon} text-white text-xl"></i>
                    </div>
                    <div class="flex items-center gap-2 mb-3">
                        <h3 class="text-xl font-semibold text-gray-900">${feature.title}</h3>
                        <span class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">${feature.stats}</span>
                    </div>
                    <p class="text-gray-600 mb-6">${feature.description}</p>
                    <ul class="space-y-2">
                        ${feature.benefits.map(b => `
                        <li class="flex items-center gap-2 text-sm text-gray-600">
                            <i class="fas fa-check text-green-500 text-xs"></i>
                            ${b}
                        </li>
                        `).join('')}
                    </ul>
                </div>
                `).join('')}
            </div>
        </div>
    </section>
    
    <!-- AI Section - Moved after Features -->
    <section class="py-20 md:py-28 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid lg:grid-cols-2 gap-12 items-center">
                <div class="reveal">
                    <span class="inline-block px-4 py-1 bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-full mb-4">AI-Powered</span>
                    <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Let AI do the heavy lifting</h2>
                    <p class="text-lg text-gray-600 mb-8">OWNLAY's AI analyzes millions of data points to surface insights humans would miss. Get actionable recommendations delivered in plain English.</p>
                    
                    <div class="space-y-4">
                        <div class="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm">
                            <div class="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                                <i class="fas fa-chart-pie text-green-600"></i>
                            </div>
                            <div>
                                <h4 class="font-semibold text-gray-900 mb-1">Budget Optimizer</h4>
                                <p class="text-gray-600 text-sm">Automatically reallocate spend to highest-performing channels</p>
                            </div>
                        </div>
                        <div class="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm">
                            <div class="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                                <i class="fas fa-eye text-purple-600"></i>
                            </div>
                            <div>
                                <h4 class="font-semibold text-gray-900 mb-1">Anomaly Detection</h4>
                                <p class="text-gray-600 text-sm">Get alerted instantly when metrics deviate from expected patterns</p>
                            </div>
                        </div>
                        <div class="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm">
                            <div class="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                                <i class="fas fa-comments text-indigo-600"></i>
                            </div>
                            <div>
                                <h4 class="font-semibold text-gray-900 mb-1">Natural Language Queries</h4>
                                <p class="text-gray-600 text-sm">Ask questions in plain English: "Why did my CPA increase?"</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="reveal delay-200">
                    <div class="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200">
                        <div class="flex items-center gap-3 mb-6">
                            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <i class="fas fa-brain text-white"></i>
                            </div>
                            <div>
                                <h4 class="font-semibold text-gray-900">AI Insights</h4>
                                <p class="text-gray-500 text-sm">3 new recommendations</p>
                            </div>
                        </div>
                        
                        <div class="space-y-4">
                            <div class="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                                <div class="flex items-center justify-between mb-2">
                                    <span class="text-green-700 text-sm font-medium"><i class="fas fa-lightbulb mr-2"></i>Opportunity</span>
                                    <span class="text-green-600 text-sm font-bold">92% confidence</span>
                                </div>
                                <p class="text-gray-700 text-sm mb-2">Move $5,000/week from Google Search to Meta Retargeting for +18% ROAS increase.</p>
                                <p class="text-green-600 font-semibold">Projected impact: +$2,340/week</p>
                            </div>
                            
                            <div class="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                                <div class="flex items-center justify-between mb-2">
                                    <span class="text-amber-700 text-sm font-medium"><i class="fas fa-exclamation-triangle mr-2"></i>Warning</span>
                                    <span class="text-amber-600 text-sm font-bold">87% confidence</span>
                                </div>
                                <p class="text-gray-700 text-sm mb-2">Creative fatigue detected on "Summer Sale - Banner 3". CTR down 34%.</p>
                                <p class="text-amber-600 font-semibold">Potential waste: $890/week</p>
                            </div>
                        </div>
                        
                        <button class="w-full mt-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all">
                            Apply All Recommendations
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Integrations Section -->
    <section id="integrations" class="py-20 md:py-28 bg-gray-900">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center max-w-3xl mx-auto mb-12 md:mb-16">
                <span class="inline-block px-4 py-1 bg-indigo-500/20 text-indigo-300 text-sm font-semibold rounded-full mb-4">Integrations</span>
                <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">Connect your entire stack</h2>
                <p class="text-lg text-gray-400">One-click integrations with 20+ platforms. Your data flows seamlessly into OWNLAY.</p>
            </div>
            
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
                ${integrations.map((int, i) => `
                <div class="bg-gray-800/50 rounded-2xl p-6 flex flex-col items-center justify-center hover:bg-gray-800 transition-all cursor-pointer border border-gray-700/50 hover:border-gray-600 card-3d reveal" style="animation-delay: ${i * 0.05}s;">
                    <i class="fab ${int.icon} text-3xl md:text-4xl mb-3" style="color: ${int.color};"></i>
                    <span class="text-gray-300 text-sm font-medium">${int.name}</span>
                </div>
                `).join('')}
            </div>
            
            <div class="text-center mt-8 md:mt-12">
                <a href="/auth/signup" class="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors border border-white/20">
                    View all 20+ integrations
                    <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        </div>
    </section>
    
    <!-- Pricing Section with Geo-Detection -->
    <section id="pricing" class="py-20 md:py-28 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center max-w-3xl mx-auto mb-12 md:mb-16">
                <span class="inline-block px-4 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full mb-4">Pricing</span>
                <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
                <p class="text-lg text-gray-600 mb-6">Start free, scale as you grow. No hidden fees, no surprises.</p>
                
                <!-- Currency & Billing Toggle -->
                <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                    <!-- Currency Selector -->
                    <div class="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                        <button onclick="setCurrency('USD')" id="currency-usd" class="px-4 py-2 rounded-lg text-sm font-semibold transition-all bg-white text-gray-900 shadow-sm">
                            🇺🇸 USD
                        </button>
                        <button onclick="setCurrency('INR')" id="currency-inr" class="px-4 py-2 rounded-lg text-sm font-semibold transition-all text-gray-600 hover:text-gray-900">
                            🇮🇳 INR
                        </button>
                    </div>
                    
                    <!-- Billing Toggle -->
                    <div class="flex items-center gap-3">
                        <span class="text-sm text-gray-600" id="billing-monthly-label">Monthly</span>
                        <button onclick="toggleBilling()" id="billing-toggle" class="relative w-14 h-7 bg-gray-200 rounded-full transition-colors">
                            <span id="billing-toggle-dot" class="absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform"></span>
                        </button>
                        <span class="text-sm font-semibold text-indigo-600" id="billing-yearly-label">
                            Yearly <span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full ml-1">Save 17%</span>
                        </span>
                    </div>
                </div>
                
                <!-- Detected Region Notice -->
                <p class="text-sm text-gray-500" id="region-notice">
                    <i class="fas fa-map-marker-alt mr-1"></i>
                    Prices shown for <span id="detected-region">your region</span>
                </p>
            </div>
            
            <!-- Pricing Cards -->
            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto" id="pricing-cards">
                <!-- Cards will be populated by JavaScript -->
            </div>
            
            <!-- Feature Comparison Link -->
            <div class="text-center mt-10">
                <button onclick="showFeatureComparison()" class="text-indigo-600 hover:text-indigo-700 font-medium">
                    <i class="fas fa-table mr-2"></i>Compare all features
                </button>
            </div>
            
            <!-- Payment Methods -->
            <div class="mt-12 text-center">
                <p class="text-sm text-gray-500 mb-4">Secure payments powered by</p>
                <div class="flex items-center justify-center gap-6">
                    <div id="payment-stripe" class="flex items-center gap-2 text-gray-400">
                        <i class="fab fa-stripe text-2xl"></i>
                        <span class="text-sm font-medium">Stripe</span>
                    </div>
                    <div id="payment-razorpay" class="hidden flex items-center gap-2 text-gray-400">
                        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                        <span class="text-sm font-medium">Razorpay</span>
                    </div>
                    <div class="flex items-center gap-2 text-gray-400">
                        <i class="fab fa-cc-visa text-xl"></i>
                        <i class="fab fa-cc-mastercard text-xl"></i>
                        <i class="fab fa-cc-amex text-xl"></i>
                    </div>
                    <div id="payment-upi" class="hidden items-center gap-2 text-gray-400">
                        <span class="text-sm font-medium border border-gray-300 px-2 py-0.5 rounded">UPI</span>
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Pricing JavaScript -->
    <script>
        // Pricing data
        const pricingData = ${JSON.stringify(pricingTiersData)};
        
        let currentCurrency = 'USD';
        let isYearly = false;
        
        // Geo-detection on page load
        document.addEventListener('DOMContentLoaded', async function() {
            await detectUserRegion();
            renderPricingCards();
            
            // Check if user just completed signup/signin with a pending plan checkout
            const urlParams = new URLSearchParams(window.location.search);
            const checkoutPlan = urlParams.get('checkout');
            const checkoutCurrency = urlParams.get('currency') || currentCurrency;
            const checkoutBilling = urlParams.get('billing') || 'monthly';
            
            if (checkoutPlan) {
                // User completed auth and needs to checkout - scroll to pricing and open modal
                const pricingSection = document.getElementById('pricing');
                if (pricingSection) {
                    setTimeout(() => {
                        pricingSection.scrollIntoView({ behavior: 'smooth' });
                        
                        // Set billing cycle if yearly
                        if (checkoutBilling === 'yearly' && !isYearly) {
                            toggleBilling();
                        }
                        
                        // Set currency
                        if (checkoutCurrency !== currentCurrency) {
                            setCurrency(checkoutCurrency);
                        }
                        
                        // Open payment modal for the selected plan
                        setTimeout(() => {
                            if (checkoutPlan === 'starter') {
                                // Start trial for starter plan
                                startTrialForLoggedInUser(checkoutPlan, checkoutCurrency);
                            } else {
                                showPaymentModal(checkoutPlan, checkoutCurrency);
                            }
                            
                            // Clean up URL
                            const cleanUrl = window.location.origin + '/pricing';
                            window.history.replaceState({}, document.title, cleanUrl);
                        }, 500);
                    }, 300);
                }
            }
        });
        
        async function detectUserRegion() {
            try {
                // Use Cloudflare's geo headers or fallback to IP-based detection
                const response = await fetch('https://ipapi.co/json/');
                const data = await response.json();
                
                if (data.country_code === 'IN') {
                    setCurrency('INR');
                    document.getElementById('detected-region').textContent = 'India';
                    // Show Indian payment methods
                    document.getElementById('payment-razorpay').classList.remove('hidden');
                    document.getElementById('payment-razorpay').classList.add('flex');
                    document.getElementById('payment-upi').classList.remove('hidden');
                    document.getElementById('payment-upi').classList.add('flex');
                } else {
                    setCurrency('USD');
                    document.getElementById('detected-region').textContent = data.country_name || 'your region';
                    document.getElementById('payment-stripe').classList.remove('hidden');
                }
            } catch (error) {
                console.log('Geo-detection failed, defaulting to USD');
                setCurrency('USD');
                document.getElementById('detected-region').textContent = 'your region';
            }
        }
        
        function setCurrency(currency) {
            currentCurrency = currency;
            
            // Update toggle buttons
            const usdBtn = document.getElementById('currency-usd');
            const inrBtn = document.getElementById('currency-inr');
            
            if (currency === 'USD') {
                usdBtn.className = 'px-4 py-2 rounded-lg text-sm font-semibold transition-all bg-white text-gray-900 shadow-sm';
                inrBtn.className = 'px-4 py-2 rounded-lg text-sm font-semibold transition-all text-gray-600 hover:text-gray-900';
                document.getElementById('payment-stripe').classList.remove('hidden');
                document.getElementById('payment-razorpay').classList.add('hidden');
                document.getElementById('payment-razorpay').classList.remove('flex');
                document.getElementById('payment-upi').classList.add('hidden');
                document.getElementById('payment-upi').classList.remove('flex');
            } else {
                inrBtn.className = 'px-4 py-2 rounded-lg text-sm font-semibold transition-all bg-white text-gray-900 shadow-sm';
                usdBtn.className = 'px-4 py-2 rounded-lg text-sm font-semibold transition-all text-gray-600 hover:text-gray-900';
                document.getElementById('payment-stripe').classList.add('hidden');
                document.getElementById('payment-razorpay').classList.remove('hidden');
                document.getElementById('payment-razorpay').classList.add('flex');
                document.getElementById('payment-upi').classList.remove('hidden');
                document.getElementById('payment-upi').classList.add('flex');
            }
            
            renderPricingCards();
        }
        
        function toggleBilling() {
            isYearly = !isYearly;
            const toggle = document.getElementById('billing-toggle');
            const dot = document.getElementById('billing-toggle-dot');
            
            if (isYearly) {
                toggle.className = 'relative w-14 h-7 bg-indigo-600 rounded-full transition-colors';
                dot.style.transform = 'translateX(28px)';
            } else {
                toggle.className = 'relative w-14 h-7 bg-gray-200 rounded-full transition-colors';
                dot.style.transform = 'translateX(0)';
            }
            
            renderPricingCards();
        }
        
        function renderPricingCards() {
            const container = document.getElementById('pricing-cards');
            const tiers = pricingData[currentCurrency];
            
            // Get current user plan from localStorage - ONLY if user is logged in with valid token
            // CRITICAL FIX: Demo users (demo_user, no subscription) should NOT show any plan as "Current"
            let currentUserPlan = null;
            let currentPlanStatus = null;
            let isLoggedIn = false;
            let isVerifiedSubscription = false; // New flag to ensure subscription is real
            
            try {
                // First check if user has a valid auth token (essential for "logged in" state)
                const authToken = localStorage.getItem('ownlay_token');
                isLoggedIn = authToken && authToken.length > 0;
                
                if (isLoggedIn) {
                    const user = JSON.parse(localStorage.getItem('ownlay_user') || '{}');
                    const subscription = JSON.parse(localStorage.getItem('ownlay_subscription') || '{}');
                    
                    // CRITICAL: Skip demo users - they don't have real subscriptions
                    const isDemoUser = user.id === 'demo_user' || user.email === 'demo@ownlay.com' || !user.id;
                    
                    // Only set plan if:
                    // 1. User object has valid data (id and email)
                    // 2. User is NOT a demo user
                    // 3. Subscription has a valid id (not generated client-side)
                    // 4. Subscription status is active or trialing
                    if (user && user.id && user.email && !isDemoUser) {
                        const hasValidSubscription = subscription.id && 
                                                     subscription.planId && 
                                                     ['active', 'trialing'].includes(subscription.status);
                        
                        if (hasValidSubscription) {
                            // Additional check: subscription id should be from server (starts with 'sub_')
                            const isServerSubscription = subscription.id.startsWith('sub_') || 
                                                         subscription.razorpaySubscriptionId;
                            
                            if (isServerSubscription || subscription.status === 'trialing') {
                                currentUserPlan = subscription.planId;
                                currentPlanStatus = subscription.status;
                                isVerifiedSubscription = true;
                            }
                        }
                        
                        // Fallback: Check user.plan only if it's a paid plan with active status
                        if (!isVerifiedSubscription && user.plan && user.plan !== 'starter') {
                            if (user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing') {
                                currentUserPlan = user.plan;
                                currentPlanStatus = user.subscriptionStatus;
                                isVerifiedSubscription = true;
                            }
                        }
                    }
                }
            } catch (e) {
                currentUserPlan = null;
                currentPlanStatus = null;
                isLoggedIn = false;
                isVerifiedSubscription = false;
            }
            
            // Plan hierarchy for upgrade comparison
            const planHierarchy = { 'none': 0, 'starter': 1, 'growth': 2, 'pro': 3, 'enterprise': 4 };
            const currentPlanLevel = planHierarchy[currentUserPlan] || 0;
            
            container.innerHTML = tiers.map((tier, i) => {
                const price = isYearly ? tier.yearlyPrice : tier.price;
                const priceNote = isYearly ? tier.yearlyTotal : '';
                const isPopular = tier.popular;
                const isEnterprise = tier.planId === 'enterprise';
                const hasTrial = tier.trialDays > 0;
                const noCardRequired = tier.noCardRequired;
                
                // Determine if this is the current plan or a lower plan
                // CRITICAL: Only show "Current Plan" if:
                // 1. User is logged in
                // 2. Has a VERIFIED subscription (not demo/guest)
                // 3. Plan matches current subscription
                // 4. Subscription is active or trialing
                const tierPlanLevel = planHierarchy[tier.planId] || 0;
                const isCurrentPlan = isLoggedIn && isVerifiedSubscription && currentUserPlan && 
                                      currentUserPlan === tier.planId && 
                                      currentPlanStatus && ['active', 'trialing'].includes(currentPlanStatus);
                const isDowngrade = isLoggedIn && isVerifiedSubscription && currentPlanLevel > tierPlanLevel && currentPlanLevel > 0;
                
                // Determine CTA text and state
                let ctaText = tier.cta;
                let ctaDisabled = false;
                let ctaClass = isPopular ? 'bg-white text-indigo-600 hover:bg-gray-100' : isEnterprise ? 'bg-gray-900 hover:bg-gray-800 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white';
                
                if (isCurrentPlan) {
                    ctaText = '<i class="fas fa-check mr-2"></i>Current Plan';
                    ctaClass = isPopular ? 'bg-white/50 text-indigo-600 cursor-not-allowed' : 'bg-gray-200 text-gray-600 cursor-not-allowed';
                    ctaDisabled = true;
                } else if (isDowngrade && !isEnterprise) {
                    ctaText = 'Downgrade';
                    ctaClass = isPopular ? 'bg-white/70 text-indigo-600 hover:bg-white/90' : 'bg-gray-100 text-gray-600 hover:bg-gray-200';
                } else if (isVerifiedSubscription && currentPlanLevel > 0 && tierPlanLevel > currentPlanLevel) {
                    // Only show "Upgrade" if user has a verified subscription
                    ctaText = '<i class="fas fa-arrow-up mr-2"></i>Upgrade';
                } else if (hasTrial && !isLoggedIn) {
                    // For non-logged in users, show trial CTA for Starter
                    ctaText = tier.cta;
                } else if (hasTrial && isLoggedIn && !isVerifiedSubscription) {
                    // Logged in but no subscription - show trial for Starter
                    ctaText = '<i class="fas fa-gift mr-2"></i>Start Free Trial';
                }
                
                return \`
                <div class="relative \${isPopular ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/30 scale-105 z-10' : 'bg-white border border-gray-200'} rounded-2xl p-6 md:p-8 transition-all hover:shadow-xl \${isCurrentPlan ? 'ring-2 ring-green-500' : ''}" style="animation-delay: \${i * 0.1}s;">
                    \${isPopular ? '<div class="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-white text-indigo-600 text-sm font-bold rounded-full shadow-lg">Most Popular</div>' : ''}
                    \${isCurrentPlan ? '<div class="absolute -top-4 right-4 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg"><i class="fas fa-check-circle mr-1"></i>Active</div>' : ''}
                    
                    <h3 class="text-xl font-semibold \${isPopular ? 'text-white' : 'text-gray-900'} mb-2">\${tier.name}</h3>
                    
                    <div class="mb-4">
                        <div class="flex items-baseline gap-1">
                            <span class="text-4xl font-bold \${isPopular ? 'text-white' : 'text-gray-900'}">\${price}</span>
                            <span class="\${isPopular ? 'text-white/70' : 'text-gray-500'}">\${tier.period}</span>
                        </div>
                        \${priceNote && !isEnterprise ? \`<p class="text-sm \${isPopular ? 'text-white/70' : 'text-gray-500'} mt-1">\${priceNote}</p>\` : ''}
                    </div>
                    
                    <p class="\${isPopular ? 'text-white/80' : 'text-gray-600'} text-sm mb-4">\${tier.description}</p>
                    
                    \${hasTrial && !isCurrentPlan && currentPlanLevel === 0 ? \`
                    <div class="mb-4 p-2 rounded-lg \${isPopular ? 'bg-white/20' : 'bg-green-50'} flex items-center gap-2">
                        <i class="fas fa-gift \${isPopular ? 'text-white' : 'text-green-600'}"></i>
                        <span class="text-sm \${isPopular ? 'text-white' : 'text-green-700'} font-medium">\${tier.trialDays}-day free trial \${noCardRequired ? '• No card required' : ''}</span>
                    </div>
                    \` : ''}
                    
                    <button onclick="\${ctaDisabled ? 'return false' : \`handlePlanSelection('\${tier.planId}', '\${currentCurrency}', \${hasTrial})\`}" 
                       class="block w-full py-3 text-center font-semibold rounded-xl transition-all \${ctaDisabled ? '' : 'cursor-pointer'} \${ctaClass}" \${ctaDisabled ? 'disabled' : ''}>
                        \${ctaText}
                    </button>
                    
                    <ul class="mt-6 space-y-3">
                        \${tier.features.map(f => \`
                        <li class="flex items-start gap-3 text-sm \${isPopular ? 'text-white/90' : f.included ? 'text-gray-600' : 'text-gray-400'}">
                            <i class="fas \${f.included ? 'fa-check' : 'fa-times'} \${isPopular ? 'text-white' : f.included ? (f.highlight ? 'text-indigo-500' : 'text-green-500') : 'text-gray-300'} mt-0.5"></i>
                            <span class="\${f.highlight ? 'font-semibold' : ''}">\${f.text}</span>
                            \${f.tooltip ? \`<span class="text-xs \${isPopular ? 'text-white/50' : 'text-gray-400'}" title="\${f.tooltip}">ⓘ</span>\` : ''}
                        </li>
                        \`).join('')}
                    </ul>
                </div>
                \`;
            }).join('');
        }
        
        // Handle plan selection with Razorpay integration
        function handlePlanSelection(planId, currency, hasTrial) {
            if (planId === 'enterprise') {
                window.location.href = '/contact';
                return;
            }
            
            // CRITICAL: Check if user is logged in first
            const authToken = localStorage.getItem('ownlay_token');
            const isLoggedIn = authToken && authToken.length > 0;
            
            // Store selected plan for after auth completion
            const selectedPlan = {
                planId: planId,
                currency: currency,
                hasTrial: hasTrial,
                billingCycle: isYearly ? 'yearly' : 'monthly',
                timestamp: Date.now()
            };
            
            if (!isLoggedIn) {
                // Guest user - redirect to signup/signin with plan selection stored
                localStorage.setItem('ownlay_pending_plan', JSON.stringify(selectedPlan));
                window.location.href = '/auth/signup?plan=' + planId + '&currency=' + currency + '&redirect=checkout';
                return;
            }
            
            if (hasTrial) {
                // Starter plan with trial - for logged-in users, start trial directly
                startTrialForLoggedInUser(planId, currency);
            } else {
                // Other plans - show payment modal
                showPaymentModal(planId, currency);
            }
        }
        
        // Start trial for already logged-in users
        async function startTrialForLoggedInUser(planId, currency) {
            UI.showLoading && UI.showLoading('Starting your free trial...');
            try {
                const response = await fetch('/api/v1/payment/start-trial', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ planId, currency })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Update local storage with new subscription
                    localStorage.setItem('ownlay_subscription', JSON.stringify({
                        id: data.subscription?.id || 'trial_' + Date.now(),
                        planId: planId,
                        status: 'trialing',
                        currentPeriodEnd: data.subscription?.currentPeriodEnd || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                    }));
                    
                    // Update user object
                    const userStr = localStorage.getItem('ownlay_user');
                    if (userStr) {
                        const user = JSON.parse(userStr);
                        user.plan = planId;
                        user.subscriptionStatus = 'trialing';
                        localStorage.setItem('ownlay_user', JSON.stringify(user));
                    }
                    
                    UI.hideLoading && UI.hideLoading();
                    window.location.href = '/app/dashboard?welcome=trial';
                } else {
                    throw new Error(data.error || 'Failed to start trial');
                }
            } catch (e) {
                console.error('Trial start error:', e);
                UI.hideLoading && UI.hideLoading();
                // Fallback: redirect to signup with plan
                window.location.href = '/auth/signup?plan=' + planId + '&currency=' + currency + '&trial=true';
            }
        }
        
        // Payment Modal for non-trial plans
        function showPaymentModal(planId, currency) {
            // Create payment modal
            const modal = document.createElement('div');
            modal.id = 'payment-modal';
            modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm';
            
            const tier = pricingData[currency].find(t => t.planId === planId);
            const price = isYearly ? tier.yearlyPrice : tier.price;
            const billingCycle = isYearly ? 'yearly' : 'monthly';
            
            modal.innerHTML = \`
                <div class="bg-white rounded-2xl max-w-md w-full mx-4 overflow-hidden shadow-2xl">
                    <div class="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="text-xl font-bold">Subscribe to \${tier.name}</h3>
                                <p class="text-indigo-200 text-sm mt-1">\${price}\${tier.period} • Billed \${billingCycle}</p>
                            </div>
                            <button onclick="closePaymentModal()" class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="p-6">
                        <div class="mb-6">
                            <h4 class="font-semibold text-gray-900 mb-3">What's included:</h4>
                            <ul class="space-y-2">
                                \${tier.features.filter(f => f.included).slice(0, 5).map(f => \`
                                    <li class="flex items-center gap-2 text-sm text-gray-600">
                                        <i class="fas fa-check text-green-500"></i>
                                        \${f.text}
                                    </li>
                                \`).join('')}
                            </ul>
                        </div>
                        
                        <div class="border-t border-gray-200 pt-4 mb-6">
                            <div class="flex justify-between mb-2">
                                <span class="text-gray-600">\${tier.name} Plan (\${billingCycle})</span>
                                <span class="font-semibold">\${price}</span>
                            </div>
                            <div class="flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span class="text-indigo-600">\${price}\${tier.period}</span>
                            </div>
                        </div>
                        
                        <button onclick="processPayment('\${planId}', '\${currency}', '\${billingCycle}')" 
                                class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                            <i class="fas fa-lock"></i>
                            Pay Securely
                        </button>
                        
                        <p class="text-center text-xs text-gray-500 mt-4">
                            <i class="fas fa-shield-alt mr-1"></i>
                            Secured by Razorpay • 256-bit SSL encryption
                        </p>
                    </div>
                </div>
            \`;
            
            document.body.appendChild(modal);
        }
        
        function closePaymentModal() {
            const modal = document.getElementById('payment-modal');
            if (modal) modal.remove();
        }
        
        async function processPayment(planId, currency, billingCycle) {
            try {
                // Create order
                const orderResponse = await fetch('/api/v1/payment/create-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ planId, billingCycle, currency })
                });
                
                const orderData = await orderResponse.json();
                
                if (!orderData.success) {
                    alert(orderData.error || 'Failed to create order');
                    return;
                }
                
                // Show mock Razorpay checkout
                showMockRazorpayCheckout(orderData.order, planId, currency);
                
            } catch (error) {
                console.error('Payment error:', error);
                alert('Payment failed. Please try again.');
            }
        }
        
        function showMockRazorpayCheckout(order, planId, currency) {
            closePaymentModal();
            
            const tier = pricingData[currency].find(t => t.planId === planId);
            const currencySymbol = currency === 'INR' ? '₹' : '$';
            const amount = order.amount / 100; // Convert from paise/cents
            
            const modal = document.createElement('div');
            modal.id = 'razorpay-modal';
            modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm';
            
            modal.innerHTML = \`
                <div class="bg-white rounded-2xl max-w-sm w-full mx-4 overflow-hidden shadow-2xl">
                    <!-- Razorpay Header -->
                    <div class="bg-[#072654] p-4 flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <img src="https://razorpay.com/favicon.png" alt="Razorpay" class="w-6 h-6" onerror="this.style.display='none'">
                            <span class="text-white font-semibold">Razorpay</span>
                        </div>
                        <button onclick="closeMockRazorpay()" class="text-white/70 hover:text-white">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="p-6">
                        <div class="text-center mb-6">
                            <div class="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-3">
                                <i class="fas fa-layer-group text-2xl text-indigo-600"></i>
                            </div>
                            <h3 class="font-bold text-gray-900">OWNLAY</h3>
                            <p class="text-gray-500 text-sm">\${tier.name} Plan</p>
                            <p class="text-2xl font-bold text-gray-900 mt-2">\${currencySymbol}\${amount.toLocaleString()}</p>
                        </div>
                        
                        <!-- Mock Payment Methods -->
                        <div class="space-y-3 mb-6">
                            <button onclick="completeMockPayment('\${order.id}', 'card', '\${planId}')" class="w-full p-3 border-2 border-gray-200 rounded-xl flex items-center gap-3 hover:border-indigo-500 hover:bg-indigo-50 transition-all">
                                <i class="fas fa-credit-card text-gray-600"></i>
                                <span class="font-medium">Card</span>
                                <div class="ml-auto flex gap-1">
                                    <i class="fab fa-cc-visa text-gray-400"></i>
                                    <i class="fab fa-cc-mastercard text-gray-400"></i>
                                </div>
                            </button>
                            
                            \${currency === 'INR' ? \`
                            <button onclick="completeMockPayment('\${order.id}', 'upi', '\${planId}')" class="w-full p-3 border-2 border-gray-200 rounded-xl flex items-center gap-3 hover:border-indigo-500 hover:bg-indigo-50 transition-all">
                                <span class="text-sm font-bold border border-gray-400 px-1 rounded">UPI</span>
                                <span class="font-medium">UPI</span>
                                <span class="ml-auto text-xs text-gray-500">GPay, PhonePe, etc.</span>
                            </button>
                            
                            <button onclick="completeMockPayment('\${order.id}', 'netbanking', '\${planId}')" class="w-full p-3 border-2 border-gray-200 rounded-xl flex items-center gap-3 hover:border-indigo-500 hover:bg-indigo-50 transition-all">
                                <i class="fas fa-university text-gray-600"></i>
                                <span class="font-medium">Netbanking</span>
                            </button>
                            \` : ''}
                        </div>
                        
                        <p class="text-center text-xs text-gray-400">
                            <i class="fas fa-lock mr-1"></i>
                            This is a demo payment gateway. No real charges.
                        </p>
                    </div>
                </div>
            \`;
            
            document.body.appendChild(modal);
        }
        
        function closeMockRazorpay() {
            const modal = document.getElementById('razorpay-modal');
            if (modal) modal.remove();
        }
        
        async function completeMockPayment(orderId, method, planId) {
            // Show processing
            const modal = document.getElementById('razorpay-modal');
            modal.innerHTML = \`
                <div class="bg-white rounded-2xl max-w-sm w-full mx-4 p-8 text-center">
                    <div class="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-spinner fa-spin text-2xl text-indigo-600"></i>
                    </div>
                    <h3 class="font-bold text-gray-900 mb-2">Processing Payment...</h3>
                    <p class="text-gray-500 text-sm">Please wait while we confirm your payment</p>
                </div>
            \`;
            
            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Verify payment
            const mockPaymentId = 'pay_mock_' + Date.now();
            const mockSignature = 'sig_mock_' + Math.random().toString(36).substring(7);
            
            // Get user ID from localStorage if available
            const userStr = localStorage.getItem('ownlay_user');
            const user = userStr ? JSON.parse(userStr) : null;
            const userId = user?.id || 'user_' + Date.now();
            
            try {
                const response = await fetch('/api/v1/payment/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderId,
                        paymentId: mockPaymentId,
                        signature: mockSignature,
                        userId: userId,
                        planId: planId || 'starter'
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Save subscription to localStorage for persistence
                    localStorage.setItem('ownlay_subscription', JSON.stringify({
                        id: data.subscription.id,
                        planId: data.subscription.planId,
                        status: data.subscription.status || 'active',
                        currentPeriodEnd: data.subscription.currentPeriodEnd
                    }));
                    
                    // Update user object with new plan
                    const userStr = localStorage.getItem('ownlay_user');
                    if (userStr) {
                        const user = JSON.parse(userStr);
                        user.plan = data.subscription.planId;
                        user.subscriptionStatus = data.subscription.status || 'active';
                        localStorage.setItem('ownlay_user', JSON.stringify(user));
                    }
                    
                    // Show success
                    modal.innerHTML = \`
                        <div class="bg-white rounded-2xl max-w-sm w-full mx-4 p-8 text-center">
                            <div class="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                                <i class="fas fa-check text-2xl text-green-600"></i>
                            </div>
                            <h3 class="font-bold text-gray-900 mb-2">Payment Successful!</h3>
                            <p class="text-gray-500 text-sm mb-6">Your subscription is now active</p>
                            <a href="/app/dashboard" 
                               class="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700">
                                Go to Dashboard
                            </a>
                        </div>
                    \`;
                } else {
                    throw new Error(data.error);
                }
            } catch (error) {
                modal.innerHTML = \`
                    <div class="bg-white rounded-2xl max-w-sm w-full mx-4 p-8 text-center">
                        <div class="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-times text-2xl text-red-600"></i>
                        </div>
                        <h3 class="font-bold text-gray-900 mb-2">Payment Failed</h3>
                        <p class="text-gray-500 text-sm mb-6">\${error.message || 'Please try again'}</p>
                        <button onclick="closeMockRazorpay()" class="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300">
                            Close
                        </button>
                    </div>
                \`;
            }
        }
        
        function showFeatureComparison() {
            // Scroll to a comparison table or open a modal
            alert('Feature comparison table coming soon!');
        }
    </script>
    
    <!-- Testimonials Section -->
    <section class="py-20 md:py-28 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center max-w-3xl mx-auto mb-12 md:mb-16">
                <span class="inline-block px-4 py-1 bg-purple-100 text-purple-700 text-sm font-semibold rounded-full mb-4">Testimonials</span>
                <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Loved by marketing teams</h2>
            </div>
            
            <div class="grid md:grid-cols-3 gap-6 md:gap-8">
                <div class="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 reveal">
                    <div class="flex items-center gap-1 mb-4">
                        ${[1,2,3,4,5].map(() => '<i class="fas fa-star text-yellow-400"></i>').join('')}
                    </div>
                    <p class="text-gray-700 mb-6">"OWNLAY cut our reporting time by 80%. We used to spend days pulling data from different platforms. Now it's all in one place with AI recommendations."</p>
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">SM</div>
                        <div>
                            <p class="font-semibold text-gray-900">Sarah Mitchell</p>
                            <p class="text-gray-500 text-sm">Marketing Director, TechFlow</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 reveal delay-100">
                    <div class="flex items-center gap-1 mb-4">
                        ${[1,2,3,4,5].map(() => '<i class="fas fa-star text-yellow-400"></i>').join('')}
                    </div>
                    <p class="text-gray-700 mb-6">"The AI budget optimizer alone paid for our subscription 10x over. It found opportunities we never would have seen manually. Game changer."</p>
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold">JC</div>
                        <div>
                            <p class="font-semibold text-gray-900">James Chen</p>
                            <p class="text-gray-500 text-sm">Growth Lead, Bloom Beauty</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 reveal delay-200">
                    <div class="flex items-center gap-1 mb-4">
                        ${[1,2,3,4,5].map(() => '<i class="fas fa-star text-yellow-400"></i>').join('')}
                    </div>
                    <p class="text-gray-700 mb-6">"As an agency, managing multiple client accounts was a nightmare. OWNLAY's multi-brand workspace feature is exactly what we needed."</p>
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white font-bold">AR</div>
                        <div>
                            <p class="font-semibold text-gray-900">Amanda Rodriguez</p>
                            <p class="text-gray-500 text-sm">CEO, Digital Scale Agency</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- CTA Section -->
    <section id="demo" class="py-20 md:py-28 bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 relative overflow-hidden">
        <!-- Background elements -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
            <div class="absolute w-96 h-96 -top-48 -right-48 bg-indigo-500/20 rounded-full blur-3xl animate-blob"></div>
            <div class="absolute w-96 h-96 -bottom-48 -left-48 bg-purple-500/20 rounded-full blur-3xl animate-blob" style="animation-delay: 2s;"></div>
        </div>
        
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">Ready to unify your marketing?</h2>
            <p class="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">Join 5,000+ marketing teams using OWNLAY to drive growth. Start your free trial today.</p>
            
            <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="/auth/signup" class="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-all text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
                    Start Free Trial
                    <i class="fas fa-arrow-right ml-2"></i>
                </a>
                <a href="#" class="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-all text-lg border border-white/20">
                    <i class="fas fa-calendar mr-2"></i>
                    Schedule Demo
                </a>
            </div>
            
            <div class="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
                <span class="flex items-center gap-2"><i class="fas fa-check-circle text-green-400"></i>14-day free trial</span>
                <span class="flex items-center gap-2"><i class="fas fa-check-circle text-green-400"></i>No credit card required</span>
                <span class="flex items-center gap-2"><i class="fas fa-check-circle text-green-400"></i>Cancel anytime</span>
            </div>
        </div>
    </section>
    
    ${footer()}
    
    <script>
        // Scroll reveal animation
        function reveal() {
            const reveals = document.querySelectorAll('.reveal');
            reveals.forEach(element => {
                const windowHeight = window.innerHeight;
                const elementTop = element.getBoundingClientRect().top;
                const elementVisible = 150;
                
                if (elementTop < windowHeight - elementVisible) {
                    element.classList.add('active');
                }
            });
        }
        
        window.addEventListener('scroll', reveal);
        reveal(); // Initial check
        
        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            const nav = document.getElementById('main-nav');
            if (window.scrollY > 50) {
                nav.classList.add('bg-white', 'shadow-sm');
                nav.classList.remove('bg-white/80');
            } else {
                nav.classList.remove('bg-white', 'shadow-sm');
                nav.classList.add('bg-white/80');
            }
        });
        
        // Counter animation
        function animateCounters() {
            const counters = document.querySelectorAll('.stat-number');
            counters.forEach(counter => {
                const target = counter.textContent;
                // Simple animation could be enhanced
            });
        }
        
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    </script>
</body>
</html>
    `)
})

// ============================================
// PRICING PAGE - Dark Theme (Standalone)
// ============================================
marketingRoutes.get('/pricing', (c) => {
    return c.html(`
${baseHead('Pricing', 'Simple, transparent pricing - OWNLAY Marketing OS')}
${homeStyles}
<body class="bg-slate-950 text-white">
    ${darkMarketingNav()}
    
    <main class="pt-24 pb-20">
        <!-- Pricing Section with Geo-Detection -->
        <section class="py-16 lg:py-24">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center max-w-3xl mx-auto mb-12 md:mb-16">
                    <span class="inline-block px-4 py-1.5 bg-emerald-500/20 text-emerald-300 text-sm font-medium rounded-full mb-6 border border-emerald-500/30">Pricing</span>
                    <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">Simple, transparent pricing</h1>
                    <p class="text-lg text-slate-400 mb-8">Start free, scale as you grow. No hidden fees, no surprises.</p>
                    
                    <!-- Currency & Billing Toggle -->
                    <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                        <!-- Currency Selector -->
                        <div class="flex items-center gap-2 bg-slate-800/50 rounded-xl p-1 border border-slate-700/50">
                            <button onclick="setCurrency('USD')" id="currency-usd" class="px-4 py-2 rounded-lg text-sm font-semibold transition-all bg-indigo-600 text-white shadow-sm">
                                🇺🇸 USD
                            </button>
                            <button onclick="setCurrency('INR')" id="currency-inr" class="px-4 py-2 rounded-lg text-sm font-semibold transition-all text-slate-400 hover:text-white">
                                🇮🇳 INR
                            </button>
                        </div>
                        
                        <!-- Billing Toggle -->
                        <div class="flex items-center gap-3">
                            <span class="text-sm text-slate-400" id="billing-monthly-label">Monthly</span>
                            <button onclick="toggleBilling()" id="billing-toggle" class="relative w-14 h-7 bg-slate-700 rounded-full transition-colors">
                                <span id="billing-toggle-dot" class="absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform"></span>
                            </button>
                            <span class="text-sm font-semibold text-indigo-400" id="billing-yearly-label">
                                Yearly <span class="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full ml-1 border border-emerald-500/30">Save 17%</span>
                            </span>
                        </div>
                    </div>
                    
                    <!-- Detected Region Notice -->
                    <p class="text-sm text-slate-500" id="region-notice">
                        <i class="fas fa-map-marker-alt mr-1"></i>
                        Prices shown for <span id="detected-region">your region</span>
                    </p>
                </div>
                
                <!-- Pricing Cards -->
                <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto" id="pricing-cards">
                    <!-- Cards will be populated by JavaScript -->
                </div>
                
                <!-- Feature Comparison Link -->
                <div class="text-center mt-10">
                    <button onclick="showFeatureComparison()" class="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                        <i class="fas fa-table mr-2"></i>Compare all features
                    </button>
                </div>
                
                <!-- Payment Methods -->
                <div class="mt-12 text-center">
                    <p class="text-sm text-slate-500 mb-4">Secure payments powered by</p>
                    <div class="flex items-center justify-center gap-6">
                        <div id="payment-stripe" class="flex items-center gap-2 text-slate-500">
                            <i class="fab fa-stripe text-2xl"></i>
                            <span class="text-sm font-medium">Stripe</span>
                        </div>
                        <div id="payment-razorpay" class="hidden flex items-center gap-2 text-slate-500">
                            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                            <span class="text-sm font-medium">Razorpay</span>
                        </div>
                        <div class="flex items-center gap-2 text-slate-500">
                            <i class="fab fa-cc-visa text-xl"></i>
                            <i class="fab fa-cc-mastercard text-xl"></i>
                            <i class="fab fa-cc-amex text-xl"></i>
                        </div>
                        <div id="payment-upi" class="hidden items-center gap-2 text-slate-500">
                            <span class="text-sm font-medium border border-slate-600 px-2 py-0.5 rounded">UPI</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        
        <!-- FAQ Section -->
        <section class="py-16 lg:py-24 bg-slate-900/50">
            <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center mb-12">
                    <span class="inline-block px-4 py-1.5 bg-violet-500/20 text-violet-300 text-sm font-medium rounded-full mb-4 border border-violet-500/30">FAQ</span>
                    <h2 class="text-3xl md:text-4xl font-bold text-white">Frequently Asked Questions</h2>
                </div>
                
                <div class="space-y-4">
                    <div class="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                        <h3 class="font-semibold text-white mb-2">Can I change my plan later?</h3>
                        <p class="text-slate-400 text-sm">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate your billing.</p>
                    </div>
                    <div class="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                        <h3 class="font-semibold text-white mb-2">What payment methods do you accept?</h3>
                        <p class="text-slate-400 text-sm">We accept all major credit cards (Visa, MasterCard, American Express) via Stripe. For Indian customers, we also support UPI and Netbanking via Razorpay.</p>
                    </div>
                    <div class="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                        <h3 class="font-semibold text-white mb-2">Is there a free trial?</h3>
                        <p class="text-slate-400 text-sm">Yes! Our Starter plan comes with a 7-day free trial. No credit card required to start.</p>
                    </div>
                    <div class="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                        <h3 class="font-semibold text-white mb-2">What happens when my trial ends?</h3>
                        <p class="text-slate-400 text-sm">After your trial ends, you'll be prompted to choose a paid plan. Your data is preserved for 30 days if you don't subscribe immediately.</p>
                    </div>
                    <div class="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                        <h3 class="font-semibold text-white mb-2">Do you offer refunds?</h3>
                        <p class="text-slate-400 text-sm">We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, contact us for a full refund.</p>
                    </div>
                </div>
            </div>
        </section>
        
        <!-- CTA Section -->
        <section class="py-16 lg:py-24">
            <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 class="text-3xl md:text-4xl font-bold text-white mb-6">Ready to get started?</h2>
                <p class="text-xl text-slate-400 mb-8">Join thousands of marketing teams using OWNLAY to drive growth.</p>
                <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <a href="/auth/signup" class="px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl transition-all text-lg shadow-lg shadow-indigo-500/25">
                        Start Free Trial
                        <i class="fas fa-arrow-right ml-2"></i>
                    </a>
                    <a href="/contact" class="px-8 py-4 border border-slate-600 text-slate-300 font-semibold rounded-xl hover:border-slate-500 hover:bg-slate-800/50 transition-all text-lg">
                        Contact Sales
                    </a>
                </div>
            </div>
        </section>
    </main>
    
    ${darkMarketingFooter()}
    
    <!-- Pricing JavaScript -->
    <script>
        // Pricing data
        const pricingData = ${JSON.stringify(pricingTiersData)};
        
        let currentCurrency = 'USD';
        let isYearly = false;
        
        // Geo-detection on page load
        document.addEventListener('DOMContentLoaded', async function() {
            await detectUserRegion();
            renderPricingCards();
            
            // Check if user just completed signup/signin with a pending plan checkout
            const urlParams = new URLSearchParams(window.location.search);
            const checkoutPlan = urlParams.get('checkout');
            const checkoutCurrency = urlParams.get('currency') || currentCurrency;
            const checkoutBilling = urlParams.get('billing') || 'monthly';
            
            if (checkoutPlan) {
                // Set billing cycle if yearly
                if (checkoutBilling === 'yearly' && !isYearly) {
                    toggleBilling();
                }
                
                // Set currency
                if (checkoutCurrency !== currentCurrency) {
                    setCurrency(checkoutCurrency);
                }
                
                // Open payment modal for the selected plan
                setTimeout(() => {
                    if (checkoutPlan === 'starter') {
                        startTrialForLoggedInUser(checkoutPlan, checkoutCurrency);
                    } else {
                        showPaymentModal(checkoutPlan, checkoutCurrency);
                    }
                    
                    // Clean up URL
                    const cleanUrl = window.location.origin + '/pricing';
                    window.history.replaceState({}, document.title, cleanUrl);
                }, 500);
            }
        });
        
        async function detectUserRegion() {
            try {
                const response = await fetch('https://ipapi.co/json/');
                const data = await response.json();
                
                if (data.country_code === 'IN') {
                    setCurrency('INR');
                    document.getElementById('detected-region').textContent = 'India';
                    document.getElementById('payment-razorpay').classList.remove('hidden');
                    document.getElementById('payment-razorpay').classList.add('flex');
                    document.getElementById('payment-upi').classList.remove('hidden');
                    document.getElementById('payment-upi').classList.add('flex');
                } else {
                    setCurrency('USD');
                    document.getElementById('detected-region').textContent = data.country_name || 'your region';
                    document.getElementById('payment-stripe').classList.remove('hidden');
                }
            } catch (error) {
                console.log('Geo-detection failed, defaulting to USD');
                setCurrency('USD');
                document.getElementById('detected-region').textContent = 'your region';
            }
        }
        
        function setCurrency(currency) {
            currentCurrency = currency;
            
            const usdBtn = document.getElementById('currency-usd');
            const inrBtn = document.getElementById('currency-inr');
            
            if (currency === 'USD') {
                usdBtn.className = 'px-4 py-2 rounded-lg text-sm font-semibold transition-all bg-indigo-600 text-white shadow-sm';
                inrBtn.className = 'px-4 py-2 rounded-lg text-sm font-semibold transition-all text-slate-400 hover:text-white';
                document.getElementById('payment-stripe').classList.remove('hidden');
                document.getElementById('payment-razorpay').classList.add('hidden');
                document.getElementById('payment-razorpay').classList.remove('flex');
                document.getElementById('payment-upi').classList.add('hidden');
                document.getElementById('payment-upi').classList.remove('flex');
            } else {
                inrBtn.className = 'px-4 py-2 rounded-lg text-sm font-semibold transition-all bg-indigo-600 text-white shadow-sm';
                usdBtn.className = 'px-4 py-2 rounded-lg text-sm font-semibold transition-all text-slate-400 hover:text-white';
                document.getElementById('payment-stripe').classList.add('hidden');
                document.getElementById('payment-razorpay').classList.remove('hidden');
                document.getElementById('payment-razorpay').classList.add('flex');
                document.getElementById('payment-upi').classList.remove('hidden');
                document.getElementById('payment-upi').classList.add('flex');
            }
            
            renderPricingCards();
        }
        
        function toggleBilling() {
            isYearly = !isYearly;
            const toggle = document.getElementById('billing-toggle');
            const dot = document.getElementById('billing-toggle-dot');
            
            if (isYearly) {
                toggle.className = 'relative w-14 h-7 bg-indigo-600 rounded-full transition-colors';
                dot.style.transform = 'translateX(28px)';
            } else {
                toggle.className = 'relative w-14 h-7 bg-slate-700 rounded-full transition-colors';
                dot.style.transform = 'translateX(0)';
            }
            
            renderPricingCards();
        }
        
        function renderPricingCards() {
            const container = document.getElementById('pricing-cards');
            const tiers = pricingData[currentCurrency];
            
            let currentUserPlan = null;
            let currentPlanStatus = null;
            let isLoggedIn = false;
            let isVerifiedSubscription = false;
            
            try {
                const authToken = localStorage.getItem('ownlay_token');
                isLoggedIn = authToken && authToken.length > 0;
                
                if (isLoggedIn) {
                    const user = JSON.parse(localStorage.getItem('ownlay_user') || '{}');
                    const subscription = JSON.parse(localStorage.getItem('ownlay_subscription') || '{}');
                    
                    const isDemoUser = user.id === 'demo_user' || user.email === 'demo@ownlay.com' || !user.id;
                    
                    if (user && user.id && user.email && !isDemoUser) {
                        const hasValidSubscription = subscription.id && 
                                                     subscription.planId && 
                                                     ['active', 'trialing'].includes(subscription.status);
                        
                        if (hasValidSubscription) {
                            const isServerSubscription = subscription.id.startsWith('sub_') || 
                                                         subscription.razorpaySubscriptionId;
                            
                            if (isServerSubscription || subscription.status === 'trialing') {
                                currentUserPlan = subscription.planId;
                                currentPlanStatus = subscription.status;
                                isVerifiedSubscription = true;
                            }
                        }
                        
                        if (!isVerifiedSubscription && user.plan && user.plan !== 'starter') {
                            if (user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing') {
                                currentUserPlan = user.plan;
                                currentPlanStatus = user.subscriptionStatus;
                                isVerifiedSubscription = true;
                            }
                        }
                    }
                }
            } catch (e) {
                currentUserPlan = null;
                currentPlanStatus = null;
                isLoggedIn = false;
                isVerifiedSubscription = false;
            }
            
            const planHierarchy = { 'none': 0, 'starter': 1, 'growth': 2, 'pro': 3, 'enterprise': 4 };
            const currentPlanLevel = planHierarchy[currentUserPlan] || 0;
            
            container.innerHTML = tiers.map((tier, i) => {
                const price = isYearly ? tier.yearlyPrice : tier.price;
                const priceNote = isYearly ? tier.yearlyTotal : '';
                const isPopular = tier.popular;
                const isEnterprise = tier.planId === 'enterprise';
                const hasTrial = tier.trialDays > 0;
                const noCardRequired = tier.noCardRequired;
                
                const tierPlanLevel = planHierarchy[tier.planId] || 0;
                const isCurrentPlan = isLoggedIn && isVerifiedSubscription && currentUserPlan && 
                                      currentUserPlan === tier.planId && 
                                      currentPlanStatus && ['active', 'trialing'].includes(currentPlanStatus);
                const isDowngrade = isLoggedIn && isVerifiedSubscription && currentPlanLevel > tierPlanLevel && currentPlanLevel > 0;
                
                let ctaText = tier.cta;
                let ctaDisabled = false;
                let ctaClass = isPopular ? 'bg-white text-indigo-600 hover:bg-gray-100' : isEnterprise ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white';
                
                if (isCurrentPlan) {
                    ctaText = '<i class="fas fa-check mr-2"></i>Current Plan';
                    ctaClass = isPopular ? 'bg-white/50 text-indigo-600 cursor-not-allowed' : 'bg-slate-700 text-slate-400 cursor-not-allowed';
                    ctaDisabled = true;
                } else if (isDowngrade && !isEnterprise) {
                    ctaText = 'Downgrade';
                    ctaClass = isPopular ? 'bg-white/70 text-indigo-600 hover:bg-white/90' : 'bg-slate-700 text-slate-300 hover:bg-slate-600';
                } else if (isVerifiedSubscription && currentPlanLevel > 0 && tierPlanLevel > currentPlanLevel) {
                    ctaText = '<i class="fas fa-arrow-up mr-2"></i>Upgrade';
                } else if (hasTrial && !isLoggedIn) {
                    ctaText = tier.cta;
                } else if (hasTrial && isLoggedIn && !isVerifiedSubscription) {
                    ctaText = '<i class="fas fa-gift mr-2"></i>Start Free Trial';
                }
                
                // Dark theme card styling
                const cardBg = isPopular 
                    ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/30 scale-105 z-10' 
                    : 'bg-slate-800/50 border border-slate-700/50';
                
                return \`
                <div class="relative \${cardBg} rounded-2xl p-6 md:p-8 transition-all hover:shadow-xl \${isCurrentPlan ? 'ring-2 ring-emerald-500' : ''}" style="animation-delay: \${i * 0.1}s;">
                    \${isPopular ? '<div class="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-white text-indigo-600 text-sm font-bold rounded-full shadow-lg">Most Popular</div>' : ''}
                    \${isCurrentPlan ? '<div class="absolute -top-4 right-4 px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full shadow-lg"><i class="fas fa-check-circle mr-1"></i>Active</div>' : ''}
                    
                    <h3 class="text-xl font-semibold \${isPopular ? 'text-white' : 'text-white'} mb-2">\${tier.name}</h3>
                    
                    <div class="mb-4">
                        <div class="flex items-baseline gap-1">
                            <span class="text-4xl font-bold \${isPopular ? 'text-white' : 'text-white'}">\${price}</span>
                            <span class="\${isPopular ? 'text-white/70' : 'text-slate-400'}">\${tier.period}</span>
                        </div>
                        \${priceNote && !isEnterprise ? \`<p class="text-sm \${isPopular ? 'text-white/70' : 'text-slate-500'} mt-1">\${priceNote}</p>\` : ''}
                    </div>
                    
                    <p class="\${isPopular ? 'text-white/80' : 'text-slate-400'} text-sm mb-4">\${tier.description}</p>
                    
                    \${hasTrial && !isCurrentPlan && currentPlanLevel === 0 ? \`
                    <div class="mb-4 p-2 rounded-lg \${isPopular ? 'bg-white/20' : 'bg-emerald-500/10 border border-emerald-500/20'} flex items-center gap-2">
                        <i class="fas fa-gift \${isPopular ? 'text-white' : 'text-emerald-400'}"></i>
                        <span class="text-sm \${isPopular ? 'text-white' : 'text-emerald-300'} font-medium">\${tier.trialDays}-day free trial \${noCardRequired ? '• No card required' : ''}</span>
                    </div>
                    \` : ''}
                    
                    <button onclick="\${ctaDisabled ? 'return false' : \`handlePlanSelection('\${tier.planId}', '\${currentCurrency}', \${hasTrial})\`}" 
                       class="block w-full py-3 text-center font-semibold rounded-xl transition-all \${ctaDisabled ? '' : 'cursor-pointer'} \${ctaClass}" \${ctaDisabled ? 'disabled' : ''}>
                        \${ctaText}
                    </button>
                    
                    <ul class="mt-6 space-y-3">
                        \${tier.features.map(f => \`
                        <li class="flex items-start gap-3 text-sm \${isPopular ? 'text-white/90' : f.included ? 'text-slate-300' : 'text-slate-500'}">
                            <i class="fas \${f.included ? 'fa-check' : 'fa-times'} \${isPopular ? 'text-white' : f.included ? (f.highlight ? 'text-indigo-400' : 'text-emerald-400') : 'text-slate-600'} mt-0.5"></i>
                            <span class="\${f.highlight ? 'font-semibold' : ''}">\${f.text}</span>
                            \${f.tooltip ? \`<span class="text-xs \${isPopular ? 'text-white/50' : 'text-slate-500'}" title="\${f.tooltip}">ⓘ</span>\` : ''}
                        </li>
                        \`).join('')}
                    </ul>
                </div>
                \`;
            }).join('');
        }
        
        function handlePlanSelection(planId, currency, hasTrial) {
            if (planId === 'enterprise') {
                window.location.href = '/contact';
                return;
            }
            
            const authToken = localStorage.getItem('ownlay_token');
            const isLoggedIn = authToken && authToken.length > 0;
            
            const selectedPlan = {
                planId: planId,
                currency: currency,
                hasTrial: hasTrial,
                billingCycle: isYearly ? 'yearly' : 'monthly',
                timestamp: Date.now()
            };
            
            if (!isLoggedIn) {
                localStorage.setItem('ownlay_pending_plan', JSON.stringify(selectedPlan));
                window.location.href = '/auth/signup?plan=' + planId + '&currency=' + currency + '&redirect=checkout';
                return;
            }
            
            if (hasTrial) {
                startTrialForLoggedInUser(planId, currency);
            } else {
                showPaymentModal(planId, currency);
            }
        }
        
        async function startTrialForLoggedInUser(planId, currency) {
            try {
                const response = await fetch('/api/v1/payment/start-trial', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ planId, currency })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    localStorage.setItem('ownlay_subscription', JSON.stringify({
                        id: data.subscription?.id || 'trial_' + Date.now(),
                        planId: planId,
                        status: 'trialing',
                        currentPeriodEnd: data.subscription?.currentPeriodEnd || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                    }));
                    
                    const userStr = localStorage.getItem('ownlay_user');
                    if (userStr) {
                        const user = JSON.parse(userStr);
                        user.plan = planId;
                        user.subscriptionStatus = 'trialing';
                        localStorage.setItem('ownlay_user', JSON.stringify(user));
                    }
                    
                    window.location.href = '/app/dashboard?welcome=trial';
                } else {
                    throw new Error(data.error || 'Failed to start trial');
                }
            } catch (e) {
                console.error('Trial start error:', e);
                window.location.href = '/auth/signup?plan=' + planId + '&currency=' + currency + '&trial=true';
            }
        }
        
        function showPaymentModal(planId, currency) {
            const modal = document.createElement('div');
            modal.id = 'payment-modal';
            modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm';
            
            const tier = pricingData[currency].find(t => t.planId === planId);
            const price = isYearly ? tier.yearlyPrice : tier.price;
            const billingCycle = isYearly ? 'yearly' : 'monthly';
            
            modal.innerHTML = \`
                <div class="bg-slate-900 rounded-2xl max-w-md w-full mx-4 overflow-hidden shadow-2xl border border-slate-700/50">
                    <div class="p-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="text-xl font-bold">Subscribe to \${tier.name}</h3>
                                <p class="text-indigo-200 text-sm mt-1">\${price}\${tier.period} • Billed \${billingCycle}</p>
                            </div>
                            <button onclick="closePaymentModal()" class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="p-6">
                        <div class="mb-6">
                            <h4 class="font-semibold text-white mb-3">What's included:</h4>
                            <ul class="space-y-2">
                                \${tier.features.filter(f => f.included).slice(0, 5).map(f => \`
                                    <li class="flex items-center gap-2 text-sm text-slate-400">
                                        <i class="fas fa-check text-emerald-400"></i>
                                        \${f.text}
                                    </li>
                                \`).join('')}
                            </ul>
                        </div>
                        
                        <div class="border-t border-slate-700 pt-4 mb-6">
                            <div class="flex justify-between mb-2">
                                <span class="text-slate-400">\${tier.name} Plan (\${billingCycle})</span>
                                <span class="font-semibold text-white">\${price}</span>
                            </div>
                            <div class="flex justify-between text-lg font-bold">
                                <span class="text-white">Total</span>
                                <span class="text-indigo-400">\${price}\${tier.period}</span>
                            </div>
                        </div>
                        
                        <button onclick="processPayment('\${planId}', '\${currency}', '\${billingCycle}')" 
                                class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                            <i class="fas fa-lock"></i>
                            Pay Securely
                        </button>
                        
                        <p class="text-center text-xs text-slate-500 mt-4">
                            <i class="fas fa-shield-alt mr-1"></i>
                            Secured by Razorpay • 256-bit SSL encryption
                        </p>
                    </div>
                </div>
            \`;
            
            document.body.appendChild(modal);
        }
        
        function closePaymentModal() {
            const modal = document.getElementById('payment-modal');
            if (modal) modal.remove();
        }
        
        async function processPayment(planId, currency, billingCycle) {
            try {
                const orderResponse = await fetch('/api/v1/payment/create-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ planId, billingCycle, currency })
                });
                
                const orderData = await orderResponse.json();
                
                if (!orderData.success) {
                    alert(orderData.error || 'Failed to create order');
                    return;
                }
                
                showMockRazorpayCheckout(orderData.order, planId, currency);
                
            } catch (error) {
                console.error('Payment error:', error);
                alert('Payment failed. Please try again.');
            }
        }
        
        function showMockRazorpayCheckout(order, planId, currency) {
            closePaymentModal();
            
            const tier = pricingData[currency].find(t => t.planId === planId);
            const currencySymbol = currency === 'INR' ? '₹' : '$';
            const amount = order.amount / 100;
            
            const modal = document.createElement('div');
            modal.id = 'razorpay-modal';
            modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm';
            
            modal.innerHTML = \`
                <div class="bg-white rounded-2xl max-w-sm w-full mx-4 overflow-hidden shadow-2xl">
                    <div class="bg-[#072654] p-4 flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <img src="https://razorpay.com/favicon.png" alt="Razorpay" class="w-6 h-6" onerror="this.style.display='none'">
                            <span class="text-white font-semibold">Razorpay</span>
                        </div>
                        <button onclick="closeMockRazorpay()" class="text-white/70 hover:text-white">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="p-6">
                        <div class="text-center mb-6">
                            <div class="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-3">
                                <i class="fas fa-layer-group text-2xl text-indigo-600"></i>
                            </div>
                            <h3 class="font-bold text-gray-900">OWNLAY</h3>
                            <p class="text-gray-500 text-sm">\${tier.name} Plan</p>
                            <p class="text-2xl font-bold text-gray-900 mt-2">\${currencySymbol}\${amount.toLocaleString()}</p>
                        </div>
                        
                        <div class="space-y-3 mb-6">
                            <button onclick="completeMockPayment('\${order.id}', 'card', '\${planId}')" class="w-full p-3 border-2 border-gray-200 rounded-xl flex items-center gap-3 hover:border-indigo-500 hover:bg-indigo-50 transition-all">
                                <i class="fas fa-credit-card text-gray-600"></i>
                                <span class="font-medium">Card</span>
                                <div class="ml-auto flex gap-1">
                                    <i class="fab fa-cc-visa text-gray-400"></i>
                                    <i class="fab fa-cc-mastercard text-gray-400"></i>
                                </div>
                            </button>
                            
                            \${currency === 'INR' ? \`
                            <button onclick="completeMockPayment('\${order.id}', 'upi', '\${planId}')" class="w-full p-3 border-2 border-gray-200 rounded-xl flex items-center gap-3 hover:border-indigo-500 hover:bg-indigo-50 transition-all">
                                <span class="text-sm font-bold border border-gray-400 px-1 rounded">UPI</span>
                                <span class="font-medium">UPI</span>
                                <span class="ml-auto text-xs text-gray-500">GPay, PhonePe, etc.</span>
                            </button>
                            
                            <button onclick="completeMockPayment('\${order.id}', 'netbanking', '\${planId}')" class="w-full p-3 border-2 border-gray-200 rounded-xl flex items-center gap-3 hover:border-indigo-500 hover:bg-indigo-50 transition-all">
                                <i class="fas fa-university text-gray-600"></i>
                                <span class="font-medium">Netbanking</span>
                            </button>
                            \` : ''}
                        </div>
                        
                        <p class="text-center text-xs text-gray-400">
                            <i class="fas fa-lock mr-1"></i>
                            This is a demo payment gateway. No real charges.
                        </p>
                    </div>
                </div>
            \`;
            
            document.body.appendChild(modal);
        }
        
        function closeMockRazorpay() {
            const modal = document.getElementById('razorpay-modal');
            if (modal) modal.remove();
        }
        
        async function completeMockPayment(orderId, method, planId) {
            const modal = document.getElementById('razorpay-modal');
            modal.innerHTML = \`
                <div class="bg-white rounded-2xl max-w-sm w-full mx-4 p-8 text-center">
                    <div class="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-spinner fa-spin text-2xl text-indigo-600"></i>
                    </div>
                    <h3 class="font-bold text-gray-900 mb-2">Processing Payment...</h3>
                    <p class="text-gray-500 text-sm">Please wait while we confirm your payment</p>
                </div>
            \`;
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const mockPaymentId = 'pay_mock_' + Date.now();
            const mockSignature = 'sig_mock_' + Math.random().toString(36).substring(7);
            
            const userStr = localStorage.getItem('ownlay_user');
            const user = userStr ? JSON.parse(userStr) : null;
            const userId = user?.id || 'user_' + Date.now();
            
            try {
                const response = await fetch('/api/v1/payment/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderId,
                        paymentId: mockPaymentId,
                        signature: mockSignature,
                        userId: userId,
                        planId: planId || 'starter'
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    localStorage.setItem('ownlay_subscription', JSON.stringify({
                        id: data.subscription.id,
                        planId: data.subscription.planId,
                        status: data.subscription.status || 'active',
                        currentPeriodEnd: data.subscription.currentPeriodEnd
                    }));
                    
                    const userStr = localStorage.getItem('ownlay_user');
                    if (userStr) {
                        const user = JSON.parse(userStr);
                        user.plan = data.subscription.planId;
                        user.subscriptionStatus = data.subscription.status || 'active';
                        localStorage.setItem('ownlay_user', JSON.stringify(user));
                    }
                    
                    modal.innerHTML = \`
                        <div class="bg-white rounded-2xl max-w-sm w-full mx-4 p-8 text-center">
                            <div class="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                                <i class="fas fa-check text-2xl text-green-600"></i>
                            </div>
                            <h3 class="font-bold text-gray-900 mb-2">Payment Successful!</h3>
                            <p class="text-gray-500 text-sm mb-6">Your subscription is now active</p>
                            <a href="/app/dashboard" 
                               class="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700">
                                Go to Dashboard
                            </a>
                        </div>
                    \`;
                } else {
                    throw new Error(data.error);
                }
            } catch (error) {
                modal.innerHTML = \`
                    <div class="bg-white rounded-2xl max-w-sm w-full mx-4 p-8 text-center">
                        <div class="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-times text-2xl text-red-600"></i>
                        </div>
                        <h3 class="font-bold text-gray-900 mb-2">Payment Failed</h3>
                        <p class="text-gray-500 text-sm mb-6">\${error.message || 'Please try again'}</p>
                        <button onclick="closeMockRazorpay()" class="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300">
                            Close
                        </button>
                    </div>
                \`;
            }
        }
        
        function showFeatureComparison() {
            alert('Feature comparison table coming soon!');
        }
    </script>
</body>
</html>
    `)
});

// ============================================
// TERMS OF SERVICE PAGE - Dark Theme
// ============================================
marketingRoutes.get('/terms', (c) => {
    return c.html(`
${baseHead('Terms of Service', 'OWNLAY Terms of Service - Read our terms and conditions')}
<body class="bg-slate-950 text-white">
    ${darkMarketingNav()}
    
    <main class="pt-24 pb-20">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Header -->
            <div class="text-center mb-12">
                <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">Terms of Service</h1>
                <p class="text-slate-400">Last updated: December 29, 2024</p>
            </div>
            
            <!-- Content -->
            <div class="space-y-8">
                <div class="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6 mb-8">
                    <p class="text-indigo-300 text-sm m-0">
                        <i class="fas fa-info-circle mr-2"></i>
                        Please read these terms carefully before using OWNLAY. By accessing or using our service, you agree to be bound by these terms.
                    </p>
                </div>
                
                <section class="mb-10">
                    <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                        <span class="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-sm font-bold">1</span>
                        Acceptance of Terms
                    </h2>
                    <p class="text-slate-300 leading-relaxed mb-4">By accessing and using OWNLAY ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this service.</p>
                    <p class="text-slate-300 leading-relaxed">These Terms of Service apply to all users of the Service, including users who are also contributors of content, information, and other materials or services on the website.</p>
                </section>
                
                <section class="mb-10">
                    <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                        <span class="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-sm font-bold">2</span>
                        Description of Service
                    </h2>
                    <p class="text-slate-300 leading-relaxed mb-4">OWNLAY is a marketing operating system that provides:</p>
                    <ul class="list-disc list-inside text-slate-400 space-y-2 ml-4">
                        <li>Unified dashboard for marketing analytics across multiple platforms</li>
                        <li>Campaign management and automation tools</li>
                        <li>AI-powered insights and recommendations</li>
                        <li>Ad management across Google Ads, Meta Ads, TikTok, and more</li>
                        <li>Creative studio for designing marketing assets</li>
                        <li>Integration with third-party marketing and analytics platforms</li>
                    </ul>
                </section>
                
                <section class="mb-10">
                    <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                        <span class="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-sm font-bold">3</span>
                        Account Registration
                    </h2>
                    <p class="text-slate-300 leading-relaxed mb-4">To access certain features of the Service, you must register for an account. You agree to:</p>
                    <ul class="list-disc list-inside text-slate-400 space-y-2 ml-4">
                        <li>Provide accurate, current, and complete information during registration</li>
                        <li>Maintain and promptly update your account information</li>
                        <li>Maintain the security of your password and account</li>
                        <li>Accept responsibility for all activities that occur under your account</li>
                        <li>Immediately notify us of any unauthorized use of your account</li>
                    </ul>
                </section>
                
                <section class="mb-10">
                    <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                        <span class="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-sm font-bold">4</span>
                        Subscription and Billing
                    </h2>
                    <p class="text-slate-300 leading-relaxed mb-4">Some features of the Service require a paid subscription:</p>
                    <ul class="list-disc list-inside text-slate-400 space-y-2 ml-4">
                        <li>Subscription fees are billed in advance on a monthly or annual basis</li>
                        <li>All fees are non-refundable except as expressly stated herein</li>
                        <li>We reserve the right to change subscription fees upon 30 days notice</li>
                        <li>You may cancel your subscription at any time, effective at the end of the billing period</li>
                        <li>Free trial periods are available for new users as specified on our pricing page</li>
                    </ul>
                </section>
                
                <section class="mb-10">
                    <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                        <span class="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-sm font-bold">5</span>
                        Acceptable Use
                    </h2>
                    <p class="text-slate-300 leading-relaxed mb-4">You agree not to use the Service to:</p>
                    <ul class="list-disc list-inside text-slate-400 space-y-2 ml-4">
                        <li>Violate any applicable laws or regulations</li>
                        <li>Infringe on the intellectual property rights of others</li>
                        <li>Transmit any harmful, threatening, or objectionable content</li>
                        <li>Attempt to gain unauthorized access to any systems or networks</li>
                        <li>Interfere with or disrupt the Service or servers connected to the Service</li>
                        <li>Use automated systems to access the Service without permission</li>
                    </ul>
                </section>
                
                <section class="mb-10">
                    <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                        <span class="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-sm font-bold">6</span>
                        Intellectual Property
                    </h2>
                    <p class="text-slate-300 leading-relaxed mb-4">The Service and its original content, features, and functionality are owned by OWNLAY and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.</p>
                    <p class="text-slate-300 leading-relaxed">You retain ownership of any data you upload to the Service. By uploading content, you grant us a limited license to use, store, and process your data solely for the purpose of providing the Service.</p>
                </section>
                
                <section class="mb-10">
                    <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                        <span class="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-sm font-bold">7</span>
                        Data Protection and Privacy
                    </h2>
                    <p class="text-slate-300 leading-relaxed">We are committed to protecting your privacy and personal data. Our collection and use of personal information is governed by our <a href="/privacy" class="text-indigo-400 hover:text-indigo-300 underline">Privacy Policy</a>, which is incorporated into these Terms by reference.</p>
                </section>
                
                <section class="mb-10">
                    <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                        <span class="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-sm font-bold">8</span>
                        Limitation of Liability
                    </h2>
                    <p class="text-slate-300 leading-relaxed">To the maximum extent permitted by law, OWNLAY shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.</p>
                </section>
                
                <section class="mb-10">
                    <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                        <span class="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-sm font-bold">9</span>
                        Termination
                    </h2>
                    <p class="text-slate-300 leading-relaxed">We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of these Terms.</p>
                </section>
                
                <section class="mb-10">
                    <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                        <span class="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-sm font-bold">10</span>
                        Contact Us
                    </h2>
                    <p class="text-slate-300 leading-relaxed mb-4">If you have any questions about these Terms, please contact us:</p>
                    <ul class="list-none text-slate-400 space-y-2 ml-4">
                        <li><i class="fas fa-envelope mr-2 text-indigo-400"></i>Email: <a href="mailto:legal@ownlay.com" class="text-indigo-400 hover:text-indigo-300">legal@ownlay.com</a></li>
                        <li><i class="fas fa-globe mr-2 text-indigo-400"></i>Website: <a href="/contact" class="text-indigo-400 hover:text-indigo-300">Contact Form</a></li>
                    </ul>
                </section>
            </div>
        </div>
    </main>
    
    ${darkMarketingFooter()}
</body>
</html>
    `)
})

// ============================================
// PRIVACY POLICY PAGE - Dark Theme
// ============================================
marketingRoutes.get('/privacy', (c) => {
    return c.html(`
${baseHead('Privacy Policy', 'OWNLAY Privacy Policy - Learn how we protect your data')}
<body class="bg-slate-950 text-white">
    ${darkMarketingNav()}
    
    <main class="pt-24 pb-20">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Header -->
            <div class="text-center mb-12">
                <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">Privacy Policy</h1>
                <p class="text-slate-400">Last updated: December 29, 2024</p>
            </div>
            
            <!-- Content -->
            <div class="space-y-8">
                <div class="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 mb-8">
                    <p class="text-emerald-300 text-sm m-0">
                        <i class="fas fa-shield-alt mr-2"></i>
                        At OWNLAY, we take your privacy seriously. This policy explains how we collect, use, and protect your personal information.
                    </p>
                </div>
                
                <section class="mb-10">
                    <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                        <span class="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-bold">1</span>
                        Information We Collect
                    </h2>
                    <p class="text-slate-300 leading-relaxed mb-4">We collect information you provide directly to us:</p>
                    <ul class="list-disc list-inside text-slate-400 space-y-2 ml-4 mb-4">
                        <li><strong class="text-white">Account Information:</strong> Name, email address, company name, and password when you create an account</li>
                        <li><strong class="text-white">Billing Information:</strong> Payment method details processed securely through our payment processors (Stripe/Razorpay)</li>
                        <li><strong class="text-white">Platform Data:</strong> Marketing data from connected platforms (Google Ads, Meta Ads, Shopify, etc.)</li>
                        <li><strong class="text-white">Usage Data:</strong> Information about how you use our Service, including features accessed and actions taken</li>
                        <li><strong class="text-white">Communication Data:</strong> Content of your communications with us</li>
                    </ul>
                    
                    <p class="text-slate-300 leading-relaxed mb-4">We automatically collect certain information when you use the Service:</p>
                    <ul class="list-disc list-inside text-slate-400 space-y-2 ml-4">
                        <li>Device information (browser type, operating system, device identifiers)</li>
                        <li>Log data (IP address, access times, pages viewed)</li>
                        <li>Cookies and similar tracking technologies</li>
                    </ul>
                </section>
                
                <section class="mb-10">
                    <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                        <span class="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-bold">2</span>
                        How We Use Your Information
                    </h2>
                    <p class="text-slate-300 leading-relaxed mb-4">We use the information we collect to:</p>
                    <ul class="list-disc list-inside text-slate-400 space-y-2 ml-4">
                        <li>Provide, maintain, and improve our Service</li>
                        <li>Process transactions and send related information</li>
                        <li>Send technical notices, updates, and support messages</li>
                        <li>Respond to your comments, questions, and customer service requests</li>
                        <li>Generate AI-powered insights and recommendations for your marketing campaigns</li>
                        <li>Monitor and analyze trends, usage, and activities</li>
                        <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
                        <li>Personalize and improve your experience</li>
                    </ul>
                </section>
                
                <section class="mb-10">
                    <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                        <span class="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-bold">3</span>
                        Information Sharing
                    </h2>
                    <p class="text-slate-300 leading-relaxed mb-4">We do not sell, trade, or rent your personal information to third parties. We may share information:</p>
                    <ul class="list-disc list-inside text-slate-400 space-y-2 ml-4">
                        <li><strong class="text-white">With Service Providers:</strong> Third-party companies that help us operate our Service</li>
                        <li><strong class="text-white">For Legal Reasons:</strong> If required by law or to protect our rights</li>
                        <li><strong class="text-white">With Your Consent:</strong> When you explicitly agree to share information</li>
                        <li><strong class="text-white">In Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                    </ul>
                </section>
                
                <section class="mb-10">
                    <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                        <span class="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-bold">4</span>
                        Data Security
                    </h2>
                    <p class="text-slate-300 leading-relaxed mb-4">We implement robust security measures to protect your information:</p>
                    <ul class="list-disc list-inside text-slate-400 space-y-2 ml-4">
                        <li><strong class="text-white">Encryption:</strong> All data is encrypted in transit (TLS) and at rest (AES-256)</li>
                        <li><strong class="text-white">Access Controls:</strong> Role-based access controls and multi-factor authentication</li>
                        <li><strong class="text-white">Monitoring:</strong> 24/7 security monitoring and intrusion detection</li>
                        <li><strong class="text-white">Compliance:</strong> SOC 2 Type II certified, GDPR and CCPA compliant</li>
                        <li><strong class="text-white">Regular Audits:</strong> Third-party security assessments and penetration testing</li>
                    </ul>
                </section>
                
                <section class="mb-10">
                    <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                        <span class="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-bold">5</span>
                        Data Retention
                    </h2>
                    <p class="text-slate-300 leading-relaxed mb-4">We retain your information for as long as your account is active or as needed to provide you services. Data retention periods vary by plan:</p>
                    <ul class="list-disc list-inside text-slate-400 space-y-2 ml-4">
                        <li><strong class="text-white">Starter Plan:</strong> 30 days of marketing data</li>
                        <li><strong class="text-white">Growth Plan:</strong> 90 days of marketing data</li>
                        <li><strong class="text-white">Pro Plan:</strong> 1 year of marketing data</li>
                        <li><strong class="text-white">Enterprise Plan:</strong> Unlimited data retention</li>
                    </ul>
                    <p class="text-slate-300 leading-relaxed mt-4">After account deletion, we retain anonymized data for analytics purposes and comply with legal retention requirements.</p>
                </section>
                
                <section class="mb-10">
                    <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                        <span class="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-bold">6</span>
                        Your Rights
                    </h2>
                    <p class="text-slate-300 leading-relaxed mb-4">Depending on your location, you may have the following rights:</p>
                    <ul class="list-disc list-inside text-slate-400 space-y-2 ml-4">
                        <li><strong class="text-white">Access:</strong> Request a copy of your personal data</li>
                        <li><strong class="text-white">Rectification:</strong> Request correction of inaccurate data</li>
                        <li><strong class="text-white">Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
                        <li><strong class="text-white">Portability:</strong> Request transfer of your data to another service</li>
                        <li><strong class="text-white">Objection:</strong> Object to processing of your data</li>
                        <li><strong class="text-white">Restriction:</strong> Request limitation of processing</li>
                    </ul>
                    <p class="text-slate-300 leading-relaxed mt-4">To exercise these rights, contact us at <a href="mailto:privacy@ownlay.com" class="text-indigo-400 hover:text-indigo-300">privacy@ownlay.com</a></p>
                </section>
                
                <section class="mb-10">
                    <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                        <span class="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-bold">7</span>
                        Cookies and Tracking
                    </h2>
                    <p class="text-slate-300 leading-relaxed mb-4">We use cookies and similar technologies to:</p>
                    <ul class="list-disc list-inside text-slate-400 space-y-2 ml-4">
                        <li>Keep you logged in to your account</li>
                        <li>Remember your preferences</li>
                        <li>Analyze traffic and usage patterns</li>
                        <li>Improve our Service</li>
                    </ul>
                    <p class="text-slate-300 leading-relaxed mt-4">You can control cookies through your browser settings. Disabling cookies may limit some features of the Service.</p>
                </section>
                
                <section class="mb-10">
                    <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                        <span class="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-bold">8</span>
                        International Data Transfers
                    </h2>
                    <p class="text-slate-300 leading-relaxed mb-4">Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your data, including:</p>
                    <ul class="list-disc list-inside text-slate-400 space-y-2 ml-4">
                        <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
                        <li>Data processing agreements with all service providers</li>
                        <li>Privacy Shield framework compliance where applicable</li>
                    </ul>
                </section>
                
                <section class="mb-10">
                    <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                        <span class="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-bold">9</span>
                        Changes to This Policy
                    </h2>
                    <p class="text-slate-300 leading-relaxed">We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this policy periodically.</p>
                </section>
                
                <section class="mb-10">
                    <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                        <span class="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-bold">10</span>
                        Contact Us
                    </h2>
                    <p class="text-slate-300 leading-relaxed mb-4">If you have any questions about this Privacy Policy, please contact us:</p>
                    <ul class="list-none text-slate-400 space-y-2 ml-4">
                        <li><i class="fas fa-envelope mr-2 text-emerald-400"></i>Email: <a href="mailto:privacy@ownlay.com" class="text-indigo-400 hover:text-indigo-300">privacy@ownlay.com</a></li>
                        <li><i class="fas fa-globe mr-2 text-emerald-400"></i>Website: <a href="/contact" class="text-indigo-400 hover:text-indigo-300">Contact Form</a></li>
                    </ul>
                </section>
            </div>
        </div>
    </main>
    
    ${darkMarketingFooter()}
</body>
</html>
    `)
})

// ============================================
// CONTACT US PAGE - Dark Theme
// ============================================
marketingRoutes.get('/contact', (c) => {
    return c.html(`
${baseHead('Contact Us', 'Get in touch with OWNLAY - We are here to help')}
${homeStyles}
<body class="bg-slate-950 text-white">
    ${darkMarketingNav()}
    
    <main class="pt-24 pb-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Header -->
            <div class="text-center mb-12">
                <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">Get in Touch</h1>
                <p class="text-xl text-slate-400 max-w-2xl mx-auto">Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
            </div>
            
            <div class="grid lg:grid-cols-2 gap-12 items-start">
                <!-- Contact Form -->
                <div class="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-8">
                    <h2 class="text-2xl font-bold text-white mb-6">Send us a message</h2>
                    
                    <form id="contact-form" class="space-y-6" onsubmit="handleContactSubmit(event)">
                        <div class="grid md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-slate-300 mb-2">First Name *</label>
                                <input type="text" name="first_name" required
                                    class="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder-slate-500"
                                    placeholder="Jane">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-300 mb-2">Last Name *</label>
                                <input type="text" name="last_name" required
                                    class="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder-slate-500"
                                    placeholder="Doe">
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-slate-300 mb-2">Email Address *</label>
                            <input type="email" name="email" required
                                class="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder-slate-500"
                                placeholder="jane@company.com">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-slate-300 mb-2">Company</label>
                            <input type="text" name="company"
                                class="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder-slate-500"
                                placeholder="Acme Corp">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-slate-300 mb-2">Subject *</label>
                            <select name="subject" required
                                class="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all">
                                <option value="" class="bg-slate-800">Select a topic</option>
                                <option value="sales" class="bg-slate-800">Sales Inquiry</option>
                                <option value="support" class="bg-slate-800">Technical Support</option>
                                <option value="billing" class="bg-slate-800">Billing Question</option>
                                <option value="partnerships" class="bg-slate-800">Partnership Opportunity</option>
                                <option value="feedback" class="bg-slate-800">Product Feedback</option>
                                <option value="other" class="bg-slate-800">Other</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-slate-300 mb-2">Message *</label>
                            <textarea name="message" rows="5" required
                                class="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none placeholder-slate-500"
                                placeholder="Tell us how we can help..."></textarea>
                        </div>
                        
                        <button type="submit" id="submit-btn"
                            class="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/25">
                            Send Message
                            <i class="fas fa-paper-plane ml-2"></i>
                        </button>
                    </form>
                    
                    <!-- Success Message (hidden by default) -->
                    <div id="success-message" class="hidden text-center py-8">
                        <div class="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-check text-emerald-400 text-2xl"></i>
                        </div>
                        <h3 class="text-xl font-bold text-white mb-2">Message Sent!</h3>
                        <p class="text-slate-400 mb-4">Thank you for reaching out. We'll get back to you within 24 hours.</p>
                        <button onclick="resetContactForm()" class="text-indigo-400 hover:text-indigo-300 font-medium">
                            Send another message
                        </button>
                    </div>
                </div>
                
                <!-- Contact Info -->
                <div class="space-y-8">
                    <!-- Contact Cards -->
                    <div class="grid gap-6">
                        <div class="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6">
                            <div class="flex items-start gap-4">
                                <div class="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                                    <i class="fas fa-envelope text-indigo-400 text-xl"></i>
                                </div>
                                <div>
                                    <h3 class="font-semibold text-white mb-1">Email Us</h3>
                                    <p class="text-slate-400 text-sm mb-2">For general inquiries and support</p>
                                    <a href="mailto:hello@ownlay.com" class="text-indigo-400 hover:text-indigo-300 font-medium">hello@ownlay.com</a>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
                            <div class="flex items-start gap-4">
                                <div class="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                    <i class="fas fa-headset text-emerald-400 text-xl"></i>
                                </div>
                                <div>
                                    <h3 class="font-semibold text-white mb-1">Live Chat</h3>
                                    <p class="text-slate-400 text-sm mb-2">Available Monday - Friday, 9am - 6pm EST</p>
                                    <button onclick="openLiveChat()" class="text-emerald-400 hover:text-emerald-300 font-medium">Start a chat →</button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
                            <div class="flex items-start gap-4">
                                <div class="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                                    <i class="fas fa-book text-amber-400 text-xl"></i>
                                </div>
                                <div>
                                    <h3 class="font-semibold text-white mb-1">Help Center</h3>
                                    <p class="text-slate-400 text-sm mb-2">Browse our documentation and FAQs</p>
                                    <a href="/docs" class="text-amber-400 hover:text-amber-300 font-medium">Visit Help Center →</a>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Social Links -->
                    <div class="bg-slate-900/50 rounded-2xl p-6 border border-slate-700/50">
                        <h3 class="font-semibold text-white mb-4">Follow Us</h3>
                        <div class="flex gap-4">
                            <a href="#" class="w-10 h-10 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-slate-400 hover:text-indigo-400 hover:border-indigo-500/50 transition-colors">
                                <i class="fab fa-twitter text-lg"></i>
                            </a>
                            <a href="#" class="w-10 h-10 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-slate-400 hover:text-indigo-400 hover:border-indigo-500/50 transition-colors">
                                <i class="fab fa-linkedin-in text-lg"></i>
                            </a>
                            <a href="#" class="w-10 h-10 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-slate-400 hover:text-indigo-400 hover:border-indigo-500/50 transition-colors">
                                <i class="fab fa-github text-lg"></i>
                            </a>
                            <a href="#" class="w-10 h-10 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-slate-400 hover:text-indigo-400 hover:border-indigo-500/50 transition-colors">
                                <i class="fab fa-youtube text-lg"></i>
                            </a>
                        </div>
                    </div>
                    
                    <!-- Office Info -->
                    <div class="bg-gradient-to-br from-indigo-600/20 to-violet-600/20 border border-indigo-500/20 rounded-2xl p-6">
                        <h3 class="font-semibold text-white mb-4">Enterprise Inquiries</h3>
                        <p class="text-slate-400 text-sm mb-4">Looking for a custom solution for your organization? Our enterprise team is here to help.</p>
                        <a href="mailto:enterprise@ownlay.com" class="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">
                            <i class="fas fa-building"></i>
                            Contact Enterprise Sales
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </main>
    
    ${darkMarketingFooter()}
    
    <script>
        async function handleContactSubmit(e) {
            e.preventDefault();
            const form = e.target;
            const submitBtn = document.getElementById('submit-btn');
            
            // Show loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Sending...';
            submitBtn.disabled = true;
            
            // Collect form data
            const formData = new FormData(form);
            const data = {
                firstName: formData.get('first_name'),
                lastName: formData.get('last_name'),
                email: formData.get('email'),
                company: formData.get('company'),
                subject: formData.get('subject'),
                message: formData.get('message')
            };
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Show success message
            form.classList.add('hidden');
            document.getElementById('success-message').classList.remove('hidden');
        }
        
        function resetContactForm() {
            const form = document.getElementById('contact-form');
            form.reset();
            form.classList.remove('hidden');
            document.getElementById('success-message').classList.add('hidden');
            
            const submitBtn = document.getElementById('submit-btn');
            submitBtn.innerHTML = 'Send Message <i class="fas fa-paper-plane ml-2"></i>';
            submitBtn.disabled = false;
        }
        
        function openLiveChat() {
            alert('Live chat feature coming soon! For now, please email us at hello@ownlay.com');
        }
    </script>
</body>
</html>
    `)
})

// ============================================
// ABOUT PAGE - Dark Theme
// ============================================
marketingRoutes.get('/about', (c) => {
    return c.html(`
${baseHead('About Us', 'Learn about OWNLAY and our mission to transform marketing')}
${homeStyles}
<body class="bg-slate-950 text-white">
    ${darkMarketingNav()}
    
    <main class="pt-24 pb-20">
        <!-- Hero Section -->
        <section class="py-16 lg:py-24 relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-violet-600/10 to-transparent"></div>
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div class="text-center max-w-4xl mx-auto">
                    <span class="inline-block px-4 py-1.5 bg-indigo-500/20 text-indigo-300 text-sm font-medium rounded-full mb-6 border border-indigo-500/30">About OWNLAY</span>
                    <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">We're Building the Future of Marketing</h1>
                    <p class="text-xl text-slate-400 mb-8">OWNLAY is the marketing operating system that helps modern growth teams unify their data, automate their workflows, and optimize every marketing dollar with AI.</p>
                </div>
            </div>
        </section>
        
        <!-- Mission Section -->
        <section class="py-16 lg:py-24">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <span class="inline-block px-4 py-1.5 bg-indigo-500/20 text-indigo-300 text-sm font-medium rounded-full mb-4 border border-indigo-500/30">Our Mission</span>
                        <h2 class="text-3xl md:text-4xl font-bold text-white mb-6">Empowering Marketers with AI</h2>
                        <p class="text-lg text-slate-400 mb-6">Marketing has become incredibly complex. Teams juggle dozens of platforms, manage endless data sources, and struggle to find insights in the noise.</p>
                        <p class="text-lg text-slate-400 mb-6">We built OWNLAY to change that. Our platform brings all your marketing data into one place, uses AI to surface actionable insights, and automates the tedious work so you can focus on what matters: growing your business.</p>
                        <div class="grid grid-cols-2 gap-6 mt-8">
                            <div class="text-center p-6 bg-slate-900/50 rounded-xl border border-slate-700/50">
                                <p class="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">5,000+</p>
                                <p class="text-sm text-slate-400 mt-1">Marketing Teams</p>
                            </div>
                            <div class="text-center p-6 bg-slate-900/50 rounded-xl border border-slate-700/50">
                                <p class="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">$2.4B</p>
                                <p class="text-sm text-slate-400 mt-1">Ad Spend Managed</p>
                            </div>
                        </div>
                    </div>
                    <div class="bg-gradient-to-br from-indigo-600/20 to-violet-600/20 rounded-2xl p-8 lg:p-12 border border-indigo-500/20">
                        <div class="grid grid-cols-2 gap-6">
                            <div class="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                                <div class="w-12 h-12 rounded-lg bg-indigo-500/20 flex items-center justify-center mb-4">
                                    <i class="fas fa-bullseye text-indigo-400 text-xl"></i>
                                </div>
                                <h3 class="font-semibold text-white mb-2">Focus</h3>
                                <p class="text-sm text-slate-400">We obsess over making marketers more effective</p>
                            </div>
                            <div class="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                                <div class="w-12 h-12 rounded-lg bg-violet-500/20 flex items-center justify-center mb-4">
                                    <i class="fas fa-rocket text-violet-400 text-xl"></i>
                                </div>
                                <h3 class="font-semibold text-white mb-2">Innovation</h3>
                                <p class="text-sm text-slate-400">AI-first approach to every feature we build</p>
                            </div>
                            <div class="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                                <div class="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-4">
                                    <i class="fas fa-shield-alt text-emerald-400 text-xl"></i>
                                </div>
                                <h3 class="font-semibold text-white mb-2">Trust</h3>
                                <p class="text-sm text-slate-400">Enterprise-grade security and compliance</p>
                            </div>
                            <div class="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                                <div class="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center mb-4">
                                    <i class="fas fa-users text-amber-400 text-xl"></i>
                                </div>
                                <h3 class="font-semibold text-white mb-2">Community</h3>
                                <p class="text-sm text-slate-400">Built with and for our customers</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        
        <!-- Values Section -->
        <section class="py-16 lg:py-24 bg-slate-900/50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center mb-12">
                    <span class="inline-block px-4 py-1.5 bg-violet-500/20 text-violet-300 text-sm font-medium rounded-full mb-4 border border-violet-500/30">Our Values</span>
                    <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">What Drives Us</h2>
                </div>
                
                <div class="grid md:grid-cols-3 gap-8">
                    <div class="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50 hover:border-indigo-500/50 transition-all">
                        <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mb-6">
                            <i class="fas fa-lightbulb text-white text-2xl"></i>
                        </div>
                        <h3 class="text-xl font-bold text-white mb-3">Simplicity</h3>
                        <p class="text-slate-400">Complex problems deserve simple solutions. We work tirelessly to make powerful technology accessible to everyone.</p>
                    </div>
                    
                    <div class="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50 hover:border-emerald-500/50 transition-all">
                        <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-6">
                            <i class="fas fa-chart-line text-white text-2xl"></i>
                        </div>
                        <h3 class="text-xl font-bold text-white mb-3">Impact</h3>
                        <p class="text-slate-400">Every feature we build must drive real results. We measure success by the success of our customers.</p>
                    </div>
                    
                    <div class="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50 hover:border-amber-500/50 transition-all">
                        <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-6">
                            <i class="fas fa-hand-holding-heart text-white text-2xl"></i>
                        </div>
                        <h3 class="text-xl font-bold text-white mb-3">Customer First</h3>
                        <p class="text-slate-400">Our customers are at the heart of everything we do. Their feedback shapes our roadmap.</p>
                    </div>
                </div>
            </div>
        </section>
        
        <!-- CTA Section -->
        <section class="py-16 lg:py-24">
            <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 class="text-3xl md:text-4xl font-bold text-white mb-6">Ready to transform your marketing?</h2>
                <p class="text-xl text-slate-400 mb-8">Join thousands of marketing teams using OWNLAY to drive growth.</p>
                <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <a href="/auth/signup" class="px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl transition-all text-lg shadow-lg shadow-indigo-500/25">
                        Start Free Trial
                        <i class="fas fa-arrow-right ml-2"></i>
                    </a>
                    <a href="/contact" class="px-8 py-4 border border-slate-600 text-slate-300 font-semibold rounded-xl hover:border-slate-500 hover:bg-slate-800/50 transition-all text-lg">
                        Contact Sales
                    </a>
                </div>
            </div>
        </section>
    </main>
    
    ${darkMarketingFooter()}
</body>
</html>
    `)
})

// ============================================
// SECURITY PAGE - Dark Theme
// ============================================
marketingRoutes.get('/security', (c) => {
    return c.html(`
${baseHead('Security', 'OWNLAY Security - How we protect your data')}
<body class="bg-slate-950 text-white">
    ${darkMarketingNav()}
    
    <main class="pt-24 pb-20">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Header -->
            <div class="text-center mb-12">
                <div class="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
                    <i class="fas fa-shield-alt text-emerald-400 text-2xl"></i>
                </div>
                <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">Security at OWNLAY</h1>
                <p class="text-xl text-slate-400">Your data's security is our top priority. Learn how we protect your information.</p>
            </div>
            
            <!-- Certifications -->
            <div class="grid md:grid-cols-3 gap-6 mb-12">
                <div class="bg-slate-900/50 rounded-2xl p-6 text-center border border-slate-700/50 hover:border-indigo-500/50 transition-all">
                    <i class="fas fa-certificate text-indigo-400 text-3xl mb-4"></i>
                    <h3 class="font-bold text-white mb-2">SOC 2 Type II</h3>
                    <p class="text-sm text-slate-400">Certified compliant</p>
                </div>
                <div class="bg-slate-900/50 rounded-2xl p-6 text-center border border-slate-700/50 hover:border-indigo-500/50 transition-all">
                    <i class="fas fa-globe-europe text-indigo-400 text-3xl mb-4"></i>
                    <h3 class="font-bold text-white mb-2">GDPR Compliant</h3>
                    <p class="text-sm text-slate-400">EU data protection</p>
                </div>
                <div class="bg-slate-900/50 rounded-2xl p-6 text-center border border-slate-700/50 hover:border-indigo-500/50 transition-all">
                    <i class="fas fa-lock text-indigo-400 text-3xl mb-4"></i>
                    <h3 class="font-bold text-white mb-2">256-bit Encryption</h3>
                    <p class="text-sm text-slate-400">Data at rest & in transit</p>
                </div>
            </div>
            
            <!-- Security Measures -->
            <div class="space-y-8">
                <div class="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-6">
                    <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-3">
                        <i class="fas fa-database text-indigo-400"></i>
                        Data Protection
                    </h2>
                    <ul class="space-y-3 text-slate-400">
                        <li class="flex items-start gap-3">
                            <i class="fas fa-check text-emerald-400 mt-1"></i>
                            <span>All data encrypted at rest using AES-256 encryption</span>
                        </li>
                        <li class="flex items-start gap-3">
                            <i class="fas fa-check text-emerald-400 mt-1"></i>
                            <span>TLS 1.3 encryption for all data in transit</span>
                        </li>
                        <li class="flex items-start gap-3">
                            <i class="fas fa-check text-emerald-400 mt-1"></i>
                            <span>Regular automated backups with point-in-time recovery</span>
                        </li>
                        <li class="flex items-start gap-3">
                            <i class="fas fa-check text-emerald-400 mt-1"></i>
                            <span>Data isolation between customer environments</span>
                        </li>
                    </ul>
                </div>
                
                <div class="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-6">
                    <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-3">
                        <i class="fas fa-user-shield text-indigo-400"></i>
                        Access Control
                    </h2>
                    <ul class="space-y-3 text-slate-400">
                        <li class="flex items-start gap-3">
                            <i class="fas fa-check text-emerald-400 mt-1"></i>
                            <span>Role-based access control (RBAC) for all features</span>
                        </li>
                        <li class="flex items-start gap-3">
                            <i class="fas fa-check text-emerald-400 mt-1"></i>
                            <span>Multi-factor authentication (MFA) support</span>
                        </li>
                        <li class="flex items-start gap-3">
                            <i class="fas fa-check text-emerald-400 mt-1"></i>
                            <span>SSO/SAML integration for Enterprise plans</span>
                        </li>
                        <li class="flex items-start gap-3">
                            <i class="fas fa-check text-emerald-400 mt-1"></i>
                            <span>Comprehensive audit logs for all actions</span>
                        </li>
                    </ul>
                </div>
                
                <div class="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-6">
                    <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-3">
                        <i class="fas fa-server text-indigo-400"></i>
                        Infrastructure
                    </h2>
                    <ul class="space-y-3 text-slate-400">
                        <li class="flex items-start gap-3">
                            <i class="fas fa-check text-emerald-400 mt-1"></i>
                            <span>Hosted on Cloudflare's global edge network</span>
                        </li>
                        <li class="flex items-start gap-3">
                            <i class="fas fa-check text-emerald-400 mt-1"></i>
                            <span>DDoS protection and Web Application Firewall</span>
                        </li>
                        <li class="flex items-start gap-3">
                            <i class="fas fa-check text-emerald-400 mt-1"></i>
                            <span>99.99% uptime SLA for Enterprise plans</span>
                        </li>
                        <li class="flex items-start gap-3">
                            <i class="fas fa-check text-emerald-400 mt-1"></i>
                            <span>24/7 security monitoring and incident response</span>
                        </li>
                    </ul>
                </div>
            </div>
            
            <!-- Contact -->
            <div class="mt-12 text-center">
                <p class="text-slate-400 mb-4">Have security questions or want to report a vulnerability?</p>
                <a href="mailto:security@ownlay.com" class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/25">
                    <i class="fas fa-envelope"></i>
                    Contact Security Team
                </a>
            </div>
        </div>
    </main>
    
    ${darkMarketingFooter()}
</body>
</html>
    `)
})

// ============================================
// BLOG PAGE - Dark Theme
// ============================================
marketingRoutes.get('/blog', (c) => {
    return c.html(`
${baseHead('Blog', 'OWNLAY Blog - Marketing insights, tips, and industry trends')}
${homeStyles}
<body class="bg-slate-950 text-white">
    ${darkMarketingNav()}
    
    <main class="pt-24 pb-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Header -->
            <div class="text-center mb-16">
                <span class="inline-block px-4 py-1.5 bg-indigo-500/20 text-indigo-300 text-sm font-medium rounded-full mb-6 border border-indigo-500/30">Our Blog</span>
                <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">Insights & Updates</h1>
                <p class="text-xl text-slate-400 max-w-2xl mx-auto">Marketing strategies, product updates, and industry insights from the OWNLAY team.</p>
            </div>
            
            <!-- Featured Post -->
            <div class="mb-16">
                <div class="bg-slate-900/50 rounded-2xl border border-slate-700/50 overflow-hidden group hover:border-indigo-500/50 transition-all">
                    <div class="grid lg:grid-cols-2">
                        <div class="aspect-video lg:aspect-auto overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop" alt="The Future of AI in Marketing Analytics" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                        </div>
                        <div class="p-8 lg:p-12 flex flex-col justify-center">
                            <span class="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-medium rounded-full mb-4 w-fit border border-indigo-500/30">AI & Technology</span>
                            <h2 class="text-2xl lg:text-3xl font-bold text-white mb-4 group-hover:text-indigo-300 transition-colors">The Future of AI in Marketing Analytics</h2>
                            <p class="text-slate-400 mb-6">How artificial intelligence is transforming the way marketers analyze and optimize their campaigns.</p>
                            <div class="flex items-center gap-4">
                                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-semibold text-sm">SC</div>
                                <div>
                                    <p class="text-white font-medium text-sm">Sarah Chen</p>
                                    <p class="text-slate-500 text-xs">January 15, 2025 · 8 min read</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Blog Grid -->
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <article class="bg-slate-900/50 rounded-2xl border border-slate-700/50 overflow-hidden group hover:border-indigo-500/50 transition-all">
                    <div class="aspect-video overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop" alt="Maximizing ROI with Cross-Channel Attribution" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    </div>
                    <div class="p-6">
                        <span class="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-medium rounded-full mb-3 border border-emerald-500/30">Analytics</span>
                        <h3 class="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors line-clamp-2">Maximizing ROI with Cross-Channel Attribution</h3>
                        <p class="text-slate-400 text-sm mb-4 line-clamp-2">Learn how to accurately measure campaign performance across all your marketing channels.</p>
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-semibold text-xs">MT</div>
                            <div>
                                <p class="text-white font-medium text-sm">Michael Torres</p>
                                <p class="text-slate-500 text-xs">January 10, 2025</p>
                            </div>
                        </div>
                    </div>
                </article>
                
                <article class="bg-slate-900/50 rounded-2xl border border-slate-700/50 overflow-hidden group hover:border-indigo-500/50 transition-all">
                    <div class="aspect-video overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop" alt="2025 Marketing Trends" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    </div>
                    <div class="p-6">
                        <span class="inline-block px-3 py-1 bg-violet-500/20 text-violet-300 text-xs font-medium rounded-full mb-3 border border-violet-500/30">Industry Insights</span>
                        <h3 class="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors line-clamp-2">2025 Marketing Trends You Need to Know</h3>
                        <p class="text-slate-400 text-sm mb-4 line-clamp-2">Stay ahead of the curve with our comprehensive guide to the top marketing trends for 2025.</p>
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-semibold text-xs">ER</div>
                            <div>
                                <p class="text-white font-medium text-sm">Emily Rodriguez</p>
                                <p class="text-slate-500 text-xs">January 5, 2025</p>
                            </div>
                        </div>
                    </div>
                </article>
                
                <article class="bg-slate-900/50 rounded-2xl border border-slate-700/50 overflow-hidden group hover:border-indigo-500/50 transition-all">
                    <div class="aspect-video overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop" alt="Data-Driven Marketing Culture" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    </div>
                    <div class="p-6">
                        <span class="inline-block px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-medium rounded-full mb-3 border border-amber-500/30">Strategy</span>
                        <h3 class="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors line-clamp-2">Building a Data-Driven Marketing Culture</h3>
                        <p class="text-slate-400 text-sm mb-4 line-clamp-2">Practical strategies for creating a culture that embraces data in marketing decisions.</p>
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-semibold text-xs">DK</div>
                            <div>
                                <p class="text-white font-medium text-sm">David Kim</p>
                                <p class="text-slate-500 text-xs">December 28, 2024</p>
                            </div>
                        </div>
                    </div>
                </article>
                
                <article class="bg-slate-900/50 rounded-2xl border border-slate-700/50 overflow-hidden group hover:border-indigo-500/50 transition-all">
                    <div class="aspect-video overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&h=400&fit=crop" alt="Privacy-First Marketing" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    </div>
                    <div class="p-6">
                        <span class="inline-block px-3 py-1 bg-rose-500/20 text-rose-300 text-xs font-medium rounded-full mb-3 border border-rose-500/30">Compliance</span>
                        <h3 class="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors line-clamp-2">Privacy-First Marketing: A Complete Guide</h3>
                        <p class="text-slate-400 text-sm mb-4 line-clamp-2">Navigate the evolving privacy landscape while maintaining effective marketing strategies.</p>
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-semibold text-xs">LP</div>
                            <div>
                                <p class="text-white font-medium text-sm">Lisa Park</p>
                                <p class="text-slate-500 text-xs">December 20, 2024</p>
                            </div>
                        </div>
                    </div>
                </article>
                
                <article class="bg-slate-900/50 rounded-2xl border border-slate-700/50 overflow-hidden group hover:border-indigo-500/50 transition-all">
                    <div class="aspect-video overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=600&h=400&fit=crop" alt="Automating Marketing Workflows" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    </div>
                    <div class="p-6">
                        <span class="inline-block px-3 py-1 bg-cyan-500/20 text-cyan-300 text-xs font-medium rounded-full mb-3 border border-cyan-500/30">Automation</span>
                        <h3 class="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors line-clamp-2">From Data to Action: Automating Marketing Workflows</h3>
                        <p class="text-slate-400 text-sm mb-4 line-clamp-2">Discover how to automate repetitive tasks and focus on strategic initiatives.</p>
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-semibold text-xs">JW</div>
                            <div>
                                <p class="text-white font-medium text-sm">James Wilson</p>
                                <p class="text-slate-500 text-xs">December 15, 2024</p>
                            </div>
                        </div>
                    </div>
                </article>
            </div>
            
            <!-- Newsletter CTA -->
            <div class="mt-16 bg-gradient-to-br from-indigo-600/20 to-violet-600/20 rounded-2xl border border-indigo-500/20 p-8 lg:p-12 text-center">
                <h3 class="text-2xl font-bold text-white mb-4">Stay Updated</h3>
                <p class="text-slate-400 mb-6 max-w-xl mx-auto">Get the latest marketing insights and OWNLAY updates delivered to your inbox.</p>
                <form class="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                    <input type="email" placeholder="Enter your email" class="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700/50 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder-slate-500">
                    <button type="submit" class="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/25 whitespace-nowrap">
                        Subscribe
                    </button>
                </form>
            </div>
        </div>
    </main>
    
    ${darkMarketingFooter()}
</body>
</html>
    `)
})

// ============================================
// CAREERS PAGE - Dark Theme
// ============================================
marketingRoutes.get('/careers', (c) => {
    return c.html(`
${baseHead('Careers', 'Join OWNLAY - Build the future of marketing technology')}
${homeStyles}
<body class="bg-slate-950 text-white">
    ${darkMarketingNav()}
    
    <main class="pt-24 pb-20">
        <!-- Hero Section -->
        <section class="py-16 lg:py-24 relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-violet-600/10 to-transparent"></div>
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div class="text-center max-w-4xl mx-auto">
                    <span class="inline-block px-4 py-1.5 bg-indigo-500/20 text-indigo-300 text-sm font-medium rounded-full mb-6 border border-indigo-500/30">We're Hiring</span>
                    <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Build the Future of Marketing</h1>
                    <p class="text-xl text-slate-400 mb-8">Join our team of passionate builders creating the marketing operating system that powers growth teams worldwide.</p>
                    <a href="#positions" class="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/25">
                        View Open Positions
                        <i class="fas fa-arrow-down"></i>
                    </a>
                </div>
            </div>
        </section>
        
        <!-- Culture Section -->
        <section class="py-16 lg:py-24">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <span class="inline-block px-4 py-1.5 bg-violet-500/20 text-violet-300 text-sm font-medium rounded-full mb-4 border border-violet-500/30">Our Culture</span>
                        <h2 class="text-3xl md:text-4xl font-bold text-white mb-6">Why Work at OWNLAY?</h2>
                        <p class="text-lg text-slate-400 mb-6">We're a team of marketers, engineers, designers, and data scientists united by a mission to make marketing more effective and accessible.</p>
                        <p class="text-lg text-slate-400">We believe in ownership, transparency, and impact. Every team member has the opportunity to shape our product and culture.</p>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50">
                            <div class="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center mb-4">
                                <i class="fas fa-home text-indigo-400"></i>
                            </div>
                            <h3 class="font-semibold text-white mb-1">Remote First</h3>
                            <p class="text-sm text-slate-400">Work from anywhere in the world</p>
                        </div>
                        <div class="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50">
                            <div class="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center mb-4">
                                <i class="fas fa-medkit text-indigo-400"></i>
                            </div>
                            <h3 class="font-semibold text-white mb-1">Health & Wellness</h3>
                            <p class="text-sm text-slate-400">Comprehensive health coverage</p>
                        </div>
                        <div class="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50">
                            <div class="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center mb-4">
                                <i class="fas fa-graduation-cap text-indigo-400"></i>
                            </div>
                            <h3 class="font-semibold text-white mb-1">Learning Budget</h3>
                            <p class="text-sm text-slate-400">$2,000/year for courses & books</p>
                        </div>
                        <div class="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50">
                            <div class="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center mb-4">
                                <i class="fas fa-plane text-indigo-400"></i>
                            </div>
                            <h3 class="font-semibold text-white mb-1">Unlimited PTO</h3>
                            <p class="text-sm text-slate-400">Take the time you need</p>
                        </div>
                        <div class="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50">
                            <div class="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center mb-4">
                                <i class="fas fa-laptop text-indigo-400"></i>
                            </div>
                            <h3 class="font-semibold text-white mb-1">Equipment</h3>
                            <p class="text-sm text-slate-400">Top-of-the-line setup provided</p>
                        </div>
                        <div class="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50">
                            <div class="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center mb-4">
                                <i class="fas fa-chart-line text-indigo-400"></i>
                            </div>
                            <h3 class="font-semibold text-white mb-1">Equity</h3>
                            <p class="text-sm text-slate-400">Ownership in the company</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        
        <!-- Open Positions -->
        <section id="positions" class="py-16 lg:py-24 bg-slate-900/50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center mb-12">
                    <span class="inline-block px-4 py-1.5 bg-emerald-500/20 text-emerald-300 text-sm font-medium rounded-full mb-4 border border-emerald-500/30">Open Positions</span>
                    <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">Join Our Team</h2>
                    <p class="text-lg text-slate-400">Find your next opportunity at OWNLAY</p>
                </div>
                
                <div class="grid gap-4 max-w-4xl mx-auto">
                    <div class="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 hover:border-indigo-500/50 transition-all group cursor-pointer">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                                    <i class="fas fa-code text-indigo-400 text-lg"></i>
                                </div>
                                <div>
                                    <h3 class="font-bold text-white group-hover:text-indigo-300 transition-colors">Senior Full Stack Engineer</h3>
                                    <p class="text-sm text-slate-400">Engineering</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-4">
                                <div class="text-right hidden sm:block">
                                    <p class="text-sm text-slate-300">Remote (US/EU)</p>
                                    <p class="text-xs text-slate-500">Full-time</p>
                                </div>
                                <i class="fas fa-arrow-right text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 hover:border-indigo-500/50 transition-all group cursor-pointer">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                                    <i class="fas fa-palette text-indigo-400 text-lg"></i>
                                </div>
                                <div>
                                    <h3 class="font-bold text-white group-hover:text-indigo-300 transition-colors">Product Designer</h3>
                                    <p class="text-sm text-slate-400">Design</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-4">
                                <div class="text-right hidden sm:block">
                                    <p class="text-sm text-slate-300">Remote</p>
                                    <p class="text-xs text-slate-500">Full-time</p>
                                </div>
                                <i class="fas fa-arrow-right text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 hover:border-indigo-500/50 transition-all group cursor-pointer">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                                    <i class="fas fa-brain text-indigo-400 text-lg"></i>
                                </div>
                                <div>
                                    <h3 class="font-bold text-white group-hover:text-indigo-300 transition-colors">ML Engineer - Marketing AI</h3>
                                    <p class="text-sm text-slate-400">AI/ML</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-4">
                                <div class="text-right hidden sm:block">
                                    <p class="text-sm text-slate-300">San Francisco, CA</p>
                                    <p class="text-xs text-slate-500">Full-time</p>
                                </div>
                                <i class="fas fa-arrow-right text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 hover:border-indigo-500/50 transition-all group cursor-pointer">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                                    <i class="fas fa-handshake text-indigo-400 text-lg"></i>
                                </div>
                                <div>
                                    <h3 class="font-bold text-white group-hover:text-indigo-300 transition-colors">Customer Success Manager</h3>
                                    <p class="text-sm text-slate-400">Customer Success</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-4">
                                <div class="text-right hidden sm:block">
                                    <p class="text-sm text-slate-300">New York, NY</p>
                                    <p class="text-xs text-slate-500">Full-time</p>
                                </div>
                                <i class="fas fa-arrow-right text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 hover:border-indigo-500/50 transition-all group cursor-pointer">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                                    <i class="fas fa-chart-line text-indigo-400 text-lg"></i>
                                </div>
                                <div>
                                    <h3 class="font-bold text-white group-hover:text-indigo-300 transition-colors">Growth Marketing Manager</h3>
                                    <p class="text-sm text-slate-400">Marketing</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-4">
                                <div class="text-right hidden sm:block">
                                    <p class="text-sm text-slate-300">Remote</p>
                                    <p class="text-xs text-slate-500">Full-time</p>
                                </div>
                                <i class="fas fa-arrow-right text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 hover:border-indigo-500/50 transition-all group cursor-pointer">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                                    <i class="fas fa-server text-indigo-400 text-lg"></i>
                                </div>
                                <div>
                                    <h3 class="font-bold text-white group-hover:text-indigo-300 transition-colors">DevOps Engineer</h3>
                                    <p class="text-sm text-slate-400">Engineering</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-4">
                                <div class="text-right hidden sm:block">
                                    <p class="text-sm text-slate-300">Remote (US)</p>
                                    <p class="text-xs text-slate-500">Full-time</p>
                                </div>
                                <i class="fas fa-arrow-right text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="text-center mt-12">
                    <p class="text-slate-400 mb-4">Don't see a role that fits? We're always looking for talented people.</p>
                    <a href="mailto:careers@ownlay.com" class="inline-flex items-center gap-2 px-6 py-3 bg-slate-800/50 border border-slate-700/50 hover:border-indigo-500/50 text-white font-medium rounded-xl transition-all">
                        <i class="fas fa-envelope"></i>
                        Send us your resume
                    </a>
                </div>
            </div>
        </section>
        
        <!-- CTA Section -->
        <section class="py-16 lg:py-24">
            <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 class="text-3xl md:text-4xl font-bold text-white mb-6">Ready to make an impact?</h2>
                <p class="text-xl text-slate-400 mb-8">Join our mission to transform how marketing teams work.</p>
                <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <a href="#positions" class="px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl transition-all text-lg shadow-lg shadow-indigo-500/25">
                        View Open Positions
                        <i class="fas fa-arrow-up ml-2"></i>
                    </a>
                    <a href="/about" class="px-8 py-4 border border-slate-600 text-slate-300 font-semibold rounded-xl hover:border-slate-500 hover:bg-slate-800/50 transition-all text-lg">
                        Learn About Us
                    </a>
                </div>
            </div>
        </section>
    </main>
    
    ${darkMarketingFooter()}
</body>
</html>
    `)
})

// Legacy pricing page (kept for reference, now unused)
const _legacyPricingPage = () => `
${baseHead('Pricing', 'Simple, transparent pricing for teams of all sizes')}
${homeStyles}
<body class="bg-white">
    ${enhancedMarketingNav()}
    
    <section class="pt-28 md:pt-36 pb-20 md:pb-28">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center max-w-3xl mx-auto mb-12 md:mb-16">
                <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">Choose your plan</h1>
                <p class="text-lg md:text-xl text-gray-600">Start free, scale as you grow. All plans include a 14-day free trial.</p>
            </div>
            
            <div class="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto mb-16">
                ${pricingTiers.map(tier => `
                <div class="relative ${tier.popular ? 'bg-gradient-to-br from-indigo-600 to-purple-600 shadow-xl shadow-indigo-500/30 scale-105 z-10' : 'bg-white border border-gray-200'} rounded-2xl p-6 md:p-8">
                    ${tier.popular ? '<div class="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-white text-indigo-600 text-sm font-bold rounded-full shadow-lg">Most Popular</div>' : ''}
                    <h3 class="text-xl font-semibold ${tier.popular ? 'text-white' : 'text-gray-900'} mb-2">${tier.name}</h3>
                    <div class="flex items-baseline gap-1 mb-4">
                        <span class="text-4xl font-bold ${tier.popular ? 'text-white' : 'text-gray-900'}">${tier.price}</span>
                        <span class="${tier.popular ? 'text-white/70' : 'text-gray-500'}">${tier.period}</span>
                    </div>
                    <p class="${tier.popular ? 'text-white/80' : 'text-gray-600'} text-sm mb-6">${tier.description}</p>
                    <a href="/auth/signup" class="block w-full py-3 text-center font-semibold rounded-xl transition-all ${tier.popular ? 'bg-white text-indigo-600 hover:bg-gray-100' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}">
                        ${tier.cta}
                    </a>
                    <ul class="mt-6 space-y-3">
                        ${tier.features.map(f => `
                        <li class="flex items-center gap-3 text-sm ${tier.popular ? 'text-white/90' : 'text-gray-600'}">
                            <i class="fas fa-check ${tier.popular ? 'text-white' : 'text-green-500'}"></i>
                            ${f}
                        </li>
                        `).join('')}
                    </ul>
                </div>
                `).join('')}
            </div>
            
            <!-- Feature comparison table -->
            <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div class="p-6 md:p-8 border-b border-gray-200">
                    <h2 class="text-2xl font-bold text-gray-900">Compare all features</h2>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 md:px-8 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                                <th class="px-6 md:px-8 py-4 text-center text-sm font-semibold text-gray-900">Starter</th>
                                <th class="px-6 md:px-8 py-4 text-center text-sm font-semibold text-indigo-600 bg-indigo-50">Growth</th>
                                <th class="px-6 md:px-8 py-4 text-center text-sm font-semibold text-gray-900">Enterprise</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            <tr><td class="px-6 md:px-8 py-4 text-sm text-gray-600">Users</td><td class="px-6 md:px-8 py-4 text-center text-sm">5</td><td class="px-6 md:px-8 py-4 text-center text-sm bg-indigo-50/50">15</td><td class="px-6 md:px-8 py-4 text-center text-sm">Unlimited</td></tr>
                            <tr><td class="px-6 md:px-8 py-4 text-sm text-gray-600">Channel Connectors</td><td class="px-6 md:px-8 py-4 text-center text-sm">3</td><td class="px-6 md:px-8 py-4 text-center text-sm bg-indigo-50/50">10</td><td class="px-6 md:px-8 py-4 text-center text-sm">Unlimited</td></tr>
                            <tr><td class="px-6 md:px-8 py-4 text-sm text-gray-600">Data Retention</td><td class="px-6 md:px-8 py-4 text-center text-sm">30 days</td><td class="px-6 md:px-8 py-4 text-center text-sm bg-indigo-50/50">90 days</td><td class="px-6 md:px-8 py-4 text-center text-sm">Unlimited</td></tr>
                            <tr><td class="px-6 md:px-8 py-4 text-sm text-gray-600">AI Insights</td><td class="px-6 md:px-8 py-4 text-center text-sm"><i class="fas fa-check text-green-500"></i></td><td class="px-6 md:px-8 py-4 text-center text-sm bg-indigo-50/50"><i class="fas fa-check text-green-500"></i></td><td class="px-6 md:px-8 py-4 text-center text-sm"><i class="fas fa-check text-green-500"></i></td></tr>
                            <tr><td class="px-6 md:px-8 py-4 text-sm text-gray-600">Budget Optimizer</td><td class="px-6 md:px-8 py-4 text-center text-sm"><i class="fas fa-times text-gray-300"></i></td><td class="px-6 md:px-8 py-4 text-center text-sm bg-indigo-50/50"><i class="fas fa-check text-green-500"></i></td><td class="px-6 md:px-8 py-4 text-center text-sm"><i class="fas fa-check text-green-500"></i></td></tr>
                            <tr><td class="px-6 md:px-8 py-4 text-sm text-gray-600">Automation Workflows</td><td class="px-6 md:px-8 py-4 text-center text-sm"><i class="fas fa-times text-gray-300"></i></td><td class="px-6 md:px-8 py-4 text-center text-sm bg-indigo-50/50"><i class="fas fa-check text-green-500"></i></td><td class="px-6 md:px-8 py-4 text-center text-sm"><i class="fas fa-check text-green-500"></i></td></tr>
                            <tr><td class="px-6 md:px-8 py-4 text-sm text-gray-600">SSO/SAML</td><td class="px-6 md:px-8 py-4 text-center text-sm"><i class="fas fa-times text-gray-300"></i></td><td class="px-6 md:px-8 py-4 text-center text-sm bg-indigo-50/50"><i class="fas fa-times text-gray-300"></i></td><td class="px-6 md:px-8 py-4 text-center text-sm"><i class="fas fa-check text-green-500"></i></td></tr>
                            <tr><td class="px-6 md:px-8 py-4 text-sm text-gray-600">API Access</td><td class="px-6 md:px-8 py-4 text-center text-sm"><i class="fas fa-times text-gray-300"></i></td><td class="px-6 md:px-8 py-4 text-center text-sm bg-indigo-50/50"><i class="fas fa-check text-green-500"></i></td><td class="px-6 md:px-8 py-4 text-center text-sm"><i class="fas fa-check text-green-500"></i></td></tr>
                            <tr><td class="px-6 md:px-8 py-4 text-sm text-gray-600">Dedicated CSM</td><td class="px-6 md:px-8 py-4 text-center text-sm"><i class="fas fa-times text-gray-300"></i></td><td class="px-6 md:px-8 py-4 text-center text-sm bg-indigo-50/50"><i class="fas fa-times text-gray-300"></i></td><td class="px-6 md:px-8 py-4 text-center text-sm"><i class="fas fa-check text-green-500"></i></td></tr>
                            <tr><td class="px-6 md:px-8 py-4 text-sm text-gray-600">Data Warehouse Sync</td><td class="px-6 md:px-8 py-4 text-center text-sm"><i class="fas fa-times text-gray-300"></i></td><td class="px-6 md:px-8 py-4 text-center text-sm bg-indigo-50/50"><i class="fas fa-times text-gray-300"></i></td><td class="px-6 md:px-8 py-4 text-center text-sm"><i class="fas fa-check text-green-500"></i></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </section>
    
    ${footer()}
</body>
</html>
    `;
