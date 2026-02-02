import { Hono } from 'hono'
import { baseHead } from '../components/layout'

export const influencerRoutes = new Hono()

// Influencer Layout - Separate from brand/admin
const influencerLayout = (title: string, activePage: string, content: string) => `
${baseHead('OWNLAY Influencer - ' + title)}
<body class="bg-gray-50 min-h-screen">
    <!-- Mobile Header -->
    <header class="lg:hidden fixed top-0 left-0 right-0 h-14 bg-gradient-to-r from-pink-600 to-purple-600 text-white flex items-center justify-between px-4 z-50">
        <div class="flex items-center gap-3">
            <button onclick="toggleInfluencerSidebar()" class="p-2 hover:bg-white/20 rounded-lg">
                <i class="fas fa-bars text-lg"></i>
            </button>
            <span class="text-lg font-bold">OWNLAY Creator</span>
        </div>
        <div class="flex items-center gap-2">
            <button onclick="showNotifications()" class="p-2 hover:bg-white/20 rounded-lg relative">
                <i class="fas fa-bell"></i>
                <span class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center" id="notif-badge-mobile">3</span>
            </button>
        </div>
    </header>
    
    <!-- Mobile Sidebar Overlay -->
    <div id="influencer-sidebar-overlay" class="fixed inset-0 bg-black/50 z-40 lg:hidden hidden" onclick="toggleInfluencerSidebar()"></div>
    
    <!-- Influencer Sidebar -->
    <aside id="influencer-sidebar" class="fixed left-0 top-0 bottom-0 w-64 bg-gradient-to-b from-gray-900 via-gray-900 to-purple-900 text-white flex flex-col z-50 transform -translate-x-full lg:translate-x-0 transition-transform duration-300">
        <div class="p-4 border-b border-white/10 flex items-center justify-between">
            <a href="/creator/dashboard" class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                    <i class="fas fa-star text-white text-sm"></i>
                </div>
                <span class="text-lg font-bold">OWNLAY Creator</span>
            </a>
            <button onclick="toggleInfluencerSidebar()" class="lg:hidden p-2 hover:bg-white/10 rounded-lg">
                <i class="fas fa-times"></i>
            </button>
        </div>
        
        <!-- User Profile Section -->
        <div class="p-4 border-b border-white/10">
            <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold" id="sidebar-influencer-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="font-semibold text-white truncate" id="sidebar-influencer-name">Creator</p>
                    <p class="text-xs text-gray-400 truncate" id="sidebar-influencer-handle">@username</p>
                </div>
            </div>
            <div class="mt-3 flex items-center gap-2">
                <span class="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full" id="sidebar-status">
                    <i class="fas fa-circle text-[8px] mr-1"></i>Active
                </span>
                <span class="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium rounded-full" id="sidebar-tier">Pro</span>
            </div>
        </div>
        
        <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
            ${influencerSidebarItem('dashboard', 'Dashboard', 'fa-home', activePage)}
            ${influencerSidebarItem('analytics', 'My Analytics', 'fa-chart-line', activePage)}
            ${influencerSidebarItem('connections', 'Connections', 'fa-user-plus', activePage)}
            ${influencerSidebarItem('opportunities', 'Opportunities', 'fa-briefcase', activePage)}
            ${influencerSidebarItem('campaigns', 'My Campaigns', 'fa-bullhorn', activePage)}
            ${influencerSidebarItem('messages', 'Messages', 'fa-envelope', activePage)}
            ${influencerSidebarItem('earnings', 'Earnings', 'fa-wallet', activePage)}
            ${influencerSidebarItem('profile', 'My Profile', 'fa-user-circle', activePage)}
            ${influencerSidebarItem('settings', 'Settings', 'fa-cog', activePage)}
            
            <div class="pt-4 mt-4 border-t border-white/10">
                <a href="/" class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
                    <i class="fas fa-arrow-left w-5 text-center"></i>
                    <span>Back to Main Site</span>
                </a>
                <button onclick="handleInfluencerLogout()" class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors mt-1">
                    <i class="fas fa-sign-out-alt w-5 text-center"></i>
                    <span>Sign Out</span>
                </button>
            </div>
        </nav>
        
        <!-- Connected Platforms -->
        <div class="p-4 border-t border-white/10">
            <p class="text-xs text-gray-500 uppercase mb-3">Connected Platforms</p>
            <div class="flex gap-2" id="sidebar-platforms">
                <span class="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-500" title="Instagram - Not Connected">
                    <i class="fab fa-instagram"></i>
                </span>
                <span class="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-500" title="YouTube - Not Connected">
                    <i class="fab fa-youtube"></i>
                </span>
                <span class="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-500" title="TikTok - Not Connected">
                    <i class="fab fa-tiktok"></i>
                </span>
            </div>
        </div>
    </aside>
    
    <div class="lg:ml-64 min-h-screen flex flex-col pt-14 lg:pt-0">
        <header class="hidden lg:flex h-16 bg-white border-b border-gray-200 items-center justify-between px-6">
            <h1 class="text-xl font-semibold text-gray-900">${title}</h1>
            <div class="flex items-center gap-4">
                <button onclick="showNotifications()" class="p-2 text-gray-400 hover:text-gray-600 relative">
                    <i class="fas fa-bell text-lg"></i>
                    <span class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center" id="notif-badge">3</span>
                </button>
                <button onclick="showMessages()" class="p-2 text-gray-400 hover:text-gray-600 relative">
                    <i class="fas fa-envelope text-lg"></i>
                    <span class="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 rounded-full text-xs text-white flex items-center justify-center" id="msg-badge">2</span>
                </button>
            </div>
        </header>
        <main class="flex-1 p-4 lg:p-6">
            ${content}
        </main>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="/static/js/app.js"></script>
    <script>
        // Influencer-specific initialization
        document.addEventListener('DOMContentLoaded', function() {
            // Check if logged in first
            if (!InfluencerAuth.isLoggedIn()) {
                window.location.href = '/creator/signin';
                return;
            }
            InfluencerAuth.init();
            // Only load dashboard data if on dashboard page
            if (window.location.pathname.includes('/dashboard') || window.location.pathname === '/influencer' || window.location.pathname === '/influencer/' || window.location.pathname === '/creator' || window.location.pathname === '/creator/') {
                InfluencerDashboard.loadData();
            }
        });
        
        function toggleInfluencerSidebar() {
            const sidebar = document.getElementById('influencer-sidebar');
            const overlay = document.getElementById('influencer-sidebar-overlay');
            sidebar.classList.toggle('-translate-x-full');
            overlay.classList.toggle('hidden');
            document.body.classList.toggle('overflow-hidden');
        }
        
        function handleInfluencerLogout() {
            InfluencerAuth.logout();
        }
        
        function showNotifications() {
            InfluencerDashboard.showNotificationsModal();
        }
        
        function showMessages() {
            window.location.href = '/creator/messages';
        }
    </script>
</body>
</html>
`

const influencerSidebarItem = (key: string, label: string, icon: string, active: string) => `
<a href="/creator/${key}" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${active === key ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg' : 'text-gray-300 hover:bg-white/10 hover:text-white'}">
    <i class="fas ${icon} w-5 text-center"></i>
    <span>${label}</span>
    ${key === 'opportunities' ? '<span class="ml-auto px-2 py-0.5 bg-pink-500 text-white text-xs rounded-full">5</span>' : ''}
    ${key === 'messages' ? '<span class="ml-auto px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full">2</span>' : ''}
</a>
`

// ============================================
// INFLUENCER SIGN UP PAGE
// ============================================
influencerRoutes.get('/signup', (c) => {
    return c.html(`
${baseHead('Join OWNLAY as Creator')}
<body class="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900 flex items-center justify-center p-4">
    <div class="absolute inset-0 overflow-hidden">
        <div class="absolute -top-40 -right-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div class="absolute top-1/2 left-1/2 w-80 h-80 bg-rose-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
    </div>
    
    <div class="relative w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        <!-- Left side - Benefits -->
        <div class="hidden md:block text-white">
            <div class="mb-8">
                <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mb-6 shadow-2xl">
                    <i class="fas fa-star text-white text-2xl"></i>
                </div>
                <h1 class="text-4xl font-bold mb-4">Join OWNLAY Creator Hub</h1>
                <p class="text-lg text-pink-100 mb-8">Connect with top brands, monetize your content, and grow your influence.</p>
            </div>
            
            <div class="space-y-6">
                <div class="flex items-start gap-4">
                    <div class="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                        <i class="fas fa-chart-line text-pink-400 text-xl"></i>
                    </div>
                    <div>
                        <h3 class="font-semibold text-lg">Real-Time Analytics</h3>
                        <p class="text-pink-200 text-sm">Track your performance across all platforms with unified analytics</p>
                    </div>
                </div>
                <div class="flex items-start gap-4">
                    <div class="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                        <i class="fas fa-handshake text-purple-400 text-xl"></i>
                    </div>
                    <div>
                        <h3 class="font-semibold text-lg">Brand Partnerships</h3>
                        <p class="text-pink-200 text-sm">Get discovered by premium brands looking for creators like you</p>
                    </div>
                </div>
                <div class="flex items-start gap-4">
                    <div class="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                        <i class="fas fa-wallet text-rose-400 text-xl"></i>
                    </div>
                    <div>
                        <h3 class="font-semibold text-lg">Secure Payments</h3>
                        <p class="text-pink-200 text-sm">Get paid on time with our secure payment system</p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Right side - Sign Up Form -->
        <div class="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
            <div class="text-center mb-8">
                <div class="md:hidden w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-star text-white"></i>
                </div>
                <h2 class="text-2xl font-bold text-gray-900">Create Your Creator Account</h2>
                <p class="text-gray-500 mt-2">Already have an account? <a href="/creator/signin" class="text-pink-600 hover:underline font-medium">Sign in</a></p>
            </div>
            
            <form id="influencer-signup-form" onsubmit="handleInfluencerSignup(event)" class="space-y-5">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                        <input type="text" id="first_name" required placeholder="John" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                        <input type="text" id="last_name" required placeholder="Doe" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors">
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                    <input type="email" id="email" required placeholder="you@example.com" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Username / Handle</label>
                    <div class="relative">
                        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                        <input type="text" id="username" required placeholder="johndoe" class="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors">
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                    <div class="relative">
                        <input type="password" id="password" required minlength="8" placeholder="Min. 8 characters" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors pr-12">
                        <button type="button" onclick="togglePassword('password', 'eye-icon')" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <i class="fas fa-eye" id="eye-icon"></i>
                        </button>
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Primary Content Category</label>
                    <select id="category" required class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors bg-white">
                        <option value="">Select your niche</option>
                        <option value="fashion">Fashion & Beauty</option>
                        <option value="tech">Tech & Gaming</option>
                        <option value="fitness">Fitness & Health</option>
                        <option value="food">Food & Cooking</option>
                        <option value="travel">Travel & Lifestyle</option>
                        <option value="business">Business & Finance</option>
                        <option value="entertainment">Entertainment</option>
                        <option value="education">Education</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                
                <div class="flex items-start gap-3">
                    <input type="checkbox" id="terms" required class="mt-1 w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500">
                    <label for="terms" class="text-sm text-gray-600">
                        I agree to the <a href="/terms" class="text-pink-600 hover:underline">Terms of Service</a> and <a href="/privacy" class="text-pink-600 hover:underline">Privacy Policy</a>
                    </label>
                </div>
                
                <button type="submit" class="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-pink-500/25">
                    Create Account
                </button>
            </form>
            
            <div class="mt-8">
                <div class="relative">
                    <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-gray-200"></div></div>
                    <div class="relative flex justify-center text-sm"><span class="px-4 bg-white text-gray-500">Or sign up with</span></div>
                </div>
                <div class="mt-4 grid grid-cols-3 gap-3">
                    <button type="button" onclick="socialSignup('instagram')" class="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl hover:bg-pink-50 hover:border-pink-300 transition-colors">
                        <i class="fab fa-instagram text-pink-500 text-lg"></i>
                    </button>
                    <button type="button" onclick="socialSignup('youtube')" class="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl hover:bg-red-50 hover:border-red-300 transition-colors">
                        <i class="fab fa-youtube text-red-500 text-lg"></i>
                    </button>
                    <button type="button" onclick="socialSignup('tiktok')" class="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-colors">
                        <i class="fab fa-tiktok text-gray-900 text-lg"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
    
    <script src="/static/js/app.js"></script>
    <script>
        async function handleInfluencerSignup(e) {
            e.preventDefault();
            
            const userData = {
                first_name: document.getElementById('first_name').value,
                last_name: document.getElementById('last_name').value,
                email: document.getElementById('email').value,
                username: document.getElementById('username').value,
                password: document.getElementById('password').value,
                category: document.getElementById('category').value,
                account_type: 'influencer'
            };
            
            const result = await InfluencerAuth.register(userData);
            
            if (!result.success) {
                UI.showToast(result.error || 'Registration failed', 'error');
            }
        }
        
        function socialSignup(platform) {
            UI.showToast('Connecting to ' + platform + '...', 'info');
            // In production, this would initiate OAuth flow
            setTimeout(() => {
                window.location.href = '/creator/connect/' + platform + '?signup=true';
            }, 500);
        }
    </script>
    
    <style>
        @keyframes blob {
            0%, 100% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
    </style>
</body>
</html>
    `)
})

// ============================================
// INFLUENCER SIGN IN PAGE
// ============================================
influencerRoutes.get('/signin', (c) => {
    return c.html(`
${baseHead('Creator Sign In - OWNLAY')}
<body class="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900 flex items-center justify-center p-4">
    <div class="absolute inset-0 overflow-hidden">
        <div class="absolute -top-40 -right-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
    </div>
    
    <div class="relative w-full max-w-md">
        <div class="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
            <div class="text-center mb-8">
                <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-xl">
                    <i class="fas fa-star text-white text-2xl"></i>
                </div>
                <h2 class="text-2xl font-bold text-gray-900">Welcome Back, Creator!</h2>
                <p class="text-gray-500 mt-2">Sign in to your creator dashboard</p>
            </div>
            
            <form id="influencer-signin-form" onsubmit="handleInfluencerSignin(event)" class="space-y-5">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Email or Username</label>
                    <input type="text" id="email_or_username" required placeholder="you@example.com or @username" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                    <div class="relative">
                        <input type="password" id="password" required placeholder="Enter your password" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors pr-12">
                        <button type="button" onclick="togglePassword('password', 'eye-icon')" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <i class="fas fa-eye" id="eye-icon"></i>
                        </button>
                    </div>
                </div>
                
                <div class="flex items-center justify-between">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" id="remember" class="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500">
                        <span class="text-sm text-gray-600">Remember me</span>
                    </label>
                    <a href="/creator/forgot-password" class="text-sm text-pink-600 hover:underline">Forgot password?</a>
                </div>
                
                <button type="submit" class="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-pink-500/25">
                    Sign In
                </button>
            </form>
            
            <div class="mt-6 text-center">
                <p class="text-gray-500">Don't have an account? <a href="/creator/signup" class="text-pink-600 hover:underline font-medium">Join as Creator</a></p>
            </div>
            
            <div class="mt-6 pt-6 border-t border-gray-200">
                <p class="text-center text-sm text-gray-500 mb-4">Are you a brand?</p>
                <a href="/auth/signin" class="block w-full py-3 text-center border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                    <i class="fas fa-building mr-2"></i>Sign in as Brand
                </a>
            </div>
        </div>
    </div>
    
    <script src="/static/js/app.js"></script>
    <script>
        async function handleInfluencerSignin(e) {
            e.preventDefault();
            
            const emailOrUsername = document.getElementById('email_or_username').value;
            const password = document.getElementById('password').value;
            
            const result = await InfluencerAuth.login(emailOrUsername, password);
            
            if (!result.success) {
                UI.showToast(result.error || 'Login failed', 'error');
            }
        }
    </script>
    
    <style>
        @keyframes blob {
            0%, 100% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
    </style>
</body>
</html>
    `)
})

// ============================================
// INFLUENCER DASHBOARD - Main Hub
// ============================================
influencerRoutes.get('/', (c) => {
    // Check if request came from /creator or /influencer path
    const path = c.req.path
    if (path.startsWith('/creator')) {
        return c.redirect('/creator/dashboard')
    }
    return c.redirect('/influencer/dashboard')
})

influencerRoutes.get('/dashboard', (c) => {
    const content = `
    <div class="space-y-6">
        <!-- Welcome Banner with Social Connect CTA -->
        <div id="connect-platforms-banner" class="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-2xl p-6 text-white">
            <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div class="flex items-center gap-4">
                    <div class="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                        <i class="fas fa-link text-2xl"></i>
                    </div>
                    <div>
                        <h2 class="text-xl font-bold">Connect Your Social Platforms</h2>
                        <p class="text-pink-100">Link your accounts to unlock real-time analytics and brand opportunities</p>
                    </div>
                </div>
                <button onclick="InfluencerDashboard.showConnectPlatformsModal()" class="px-6 py-3 bg-white text-purple-600 font-semibold rounded-xl hover:bg-pink-50 transition-colors shadow-lg">
                    <i class="fas fa-plug mr-2"></i>Connect Platforms
                </button>
            </div>
        </div>
        
        <!-- Real-Time Stats from Connected Platforms -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Total Followers -->
            <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-gray-500 text-sm font-medium">Total Followers</span>
                    <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                        <i class="fas fa-users text-pink-600"></i>
                    </div>
                </div>
                <p class="text-3xl font-bold text-gray-900" id="stat-followers">--</p>
                <div class="flex items-center gap-1 mt-1" id="stat-followers-change">
                    <span class="text-xs text-gray-400">Connect platforms to see data</span>
                </div>
            </div>
            
            <!-- Engagement Rate -->
            <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-gray-500 text-sm font-medium">Avg. Engagement</span>
                    <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                        <i class="fas fa-heart text-green-600"></i>
                    </div>
                </div>
                <p class="text-3xl font-bold text-gray-900" id="stat-engagement">--%</p>
                <div class="flex items-center gap-1 mt-1" id="stat-engagement-change">
                    <span class="text-xs text-gray-400">Connect platforms to see data</span>
                </div>
            </div>
            
            <!-- Total Reach -->
            <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-gray-500 text-sm font-medium">Monthly Reach</span>
                    <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                        <i class="fas fa-eye text-blue-600"></i>
                    </div>
                </div>
                <p class="text-3xl font-bold text-gray-900" id="stat-reach">--</p>
                <div class="flex items-center gap-1 mt-1" id="stat-reach-change">
                    <span class="text-xs text-gray-400">Connect platforms to see data</span>
                </div>
            </div>
            
            <!-- Earnings -->
            <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-gray-500 text-sm font-medium">Total Earnings</span>
                    <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                        <i class="fas fa-dollar-sign text-amber-600"></i>
                    </div>
                </div>
                <p class="text-3xl font-bold text-gray-900" id="stat-earnings">$0</p>
                <div class="flex items-center gap-1 mt-1">
                    <span class="text-xs text-gray-400">From campaigns</span>
                </div>
            </div>
        </div>
        
        <!-- Platform Analytics Cards -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Instagram Analytics -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" id="platform-instagram">
                <div class="bg-gradient-to-r from-pink-500 to-purple-500 p-4">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <i class="fab fa-instagram text-white text-2xl"></i>
                            <div>
                                <h3 class="font-semibold text-white">Instagram</h3>
                                <p class="text-pink-100 text-xs" id="ig-handle">Not connected</p>
                            </div>
                        </div>
                        <button onclick="InfluencerDashboard.connectPlatform('instagram')" class="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-sm rounded-lg transition-colors" id="ig-connect-btn">
                            Connect
                        </button>
                    </div>
                </div>
                <div class="p-5" id="ig-stats">
                    <div class="flex items-center justify-center py-8 text-gray-400">
                        <div class="text-center">
                            <i class="fab fa-instagram text-4xl mb-2 opacity-30"></i>
                            <p class="text-sm">Connect to see analytics</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- YouTube Analytics -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" id="platform-youtube">
                <div class="bg-gradient-to-r from-red-500 to-red-600 p-4">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <i class="fab fa-youtube text-white text-2xl"></i>
                            <div>
                                <h3 class="font-semibold text-white">YouTube</h3>
                                <p class="text-red-100 text-xs" id="yt-handle">Not connected</p>
                            </div>
                        </div>
                        <button onclick="InfluencerDashboard.connectPlatform('youtube')" class="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-sm rounded-lg transition-colors" id="yt-connect-btn">
                            Connect
                        </button>
                    </div>
                </div>
                <div class="p-5" id="yt-stats">
                    <div class="flex items-center justify-center py-8 text-gray-400">
                        <div class="text-center">
                            <i class="fab fa-youtube text-4xl mb-2 opacity-30"></i>
                            <p class="text-sm">Connect to see analytics</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- TikTok Analytics -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" id="platform-tiktok">
                <div class="bg-gradient-to-r from-gray-900 to-gray-800 p-4">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <i class="fab fa-tiktok text-white text-2xl"></i>
                            <div>
                                <h3 class="font-semibold text-white">TikTok</h3>
                                <p class="text-gray-300 text-xs" id="tt-handle">Not connected</p>
                            </div>
                        </div>
                        <button onclick="InfluencerDashboard.connectPlatform('tiktok')" class="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-sm rounded-lg transition-colors" id="tt-connect-btn">
                            Connect
                        </button>
                    </div>
                </div>
                <div class="p-5" id="tt-stats">
                    <div class="flex items-center justify-center py-8 text-gray-400">
                        <div class="text-center">
                            <i class="fab fa-tiktok text-4xl mb-2 opacity-30"></i>
                            <p class="text-sm">Connect to see analytics</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Active Opportunities & Campaigns -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Brand Opportunities -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div class="p-5 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 class="font-bold text-gray-900">New Opportunities</h3>
                        <p class="text-sm text-gray-500">Brands looking to collaborate</p>
                    </div>
                    <a href="/creator/opportunities" class="text-sm text-pink-600 hover:underline font-medium">View All</a>
                </div>
                <div class="divide-y divide-gray-100" id="opportunities-list">
                    <div class="p-5 text-center text-gray-400">
                        <i class="fas fa-briefcase text-3xl mb-2 opacity-30"></i>
                        <p class="text-sm">Connect platforms to see matching opportunities</p>
                    </div>
                </div>
            </div>
            
            <!-- Pending Invitations -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div class="p-5 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 class="font-bold text-gray-900">Campaign Invitations</h3>
                        <p class="text-sm text-gray-500">Respond to brand requests</p>
                    </div>
                    <span class="px-2.5 py-1 bg-pink-100 text-pink-600 text-xs font-semibold rounded-full" id="invitations-count">0 pending</span>
                </div>
                <div class="divide-y divide-gray-100" id="invitations-list">
                    <div class="p-5 text-center text-gray-400">
                        <i class="fas fa-envelope-open text-3xl mb-2 opacity-30"></i>
                        <p class="text-sm">No pending invitations</p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Recent Messages -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div class="p-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                    <h3 class="font-bold text-gray-900">Recent Messages</h3>
                    <p class="text-sm text-gray-500">Communications with brands</p>
                </div>
                <a href="/creator/messages" class="text-sm text-pink-600 hover:underline font-medium">View All</a>
            </div>
            <div class="divide-y divide-gray-100" id="messages-list">
                <div class="p-5 text-center text-gray-400">
                    <i class="fas fa-comments text-3xl mb-2 opacity-30"></i>
                    <p class="text-sm">No messages yet</p>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Connect Platforms Modal -->
    <div id="connect-platforms-modal" class="fixed inset-0 z-50 hidden">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" onclick="InfluencerDashboard.closeConnectModal()"></div>
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div class="bg-gradient-to-r from-pink-600 to-purple-600 p-6 text-white">
                <h3 class="text-xl font-bold">Connect Your Platforms</h3>
                <p class="text-pink-100 text-sm mt-1">Link your social accounts to fetch real analytics</p>
            </div>
            <div class="p-6 space-y-4" id="connect-platforms-list">
                <!-- Platform connection options will be rendered here -->
            </div>
            <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <button onclick="InfluencerDashboard.closeConnectModal()" class="w-full py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">
                    Close
                </button>
            </div>
        </div>
    </div>
    
    <!-- Notifications Modal -->
    <div id="notifications-modal" class="fixed inset-0 z-50 hidden">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" onclick="InfluencerDashboard.closeNotificationsModal()"></div>
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
            <div class="p-5 border-b border-gray-200 flex items-center justify-between">
                <h3 class="text-lg font-bold text-gray-900">Notifications</h3>
                <button onclick="InfluencerDashboard.markAllRead()" class="text-sm text-pink-600 hover:underline">Mark all read</button>
            </div>
            <div class="flex-1 overflow-y-auto divide-y divide-gray-100" id="notifications-list">
                <!-- Notifications will be rendered here -->
            </div>
        </div>
    </div>
    `
    
    return c.html(influencerLayout('Dashboard', 'dashboard', content))
})

// ============================================
// INFLUENCER ANALYTICS PAGE
// ============================================
influencerRoutes.get('/analytics', (c) => {
    const content = `
    <div class="space-y-6">
        <!-- Analytics Header -->
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
                <h2 class="text-2xl font-bold text-gray-900">Analytics Overview</h2>
                <p class="text-gray-500">Real-time performance across all platforms</p>
            </div>
            <div class="flex items-center gap-3">
                <select class="px-4 py-2 border border-gray-200 rounded-xl text-sm" id="analytics-timeframe">
                    <option value="7d">Last 7 days</option>
                    <option value="30d" selected>Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                </select>
                <button onclick="InfluencerAnalytics.refresh()" class="px-4 py-2 bg-pink-600 text-white rounded-xl text-sm font-medium hover:bg-pink-700">
                    <i class="fas fa-sync-alt mr-2"></i>Refresh
                </button>
            </div>
        </div>
        
        <!-- No Platforms Connected State -->
        <div id="no-platforms-state" class="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-8 text-center border border-pink-100">
            <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                <i class="fas fa-chart-line text-white text-3xl"></i>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">No Platforms Connected</h3>
            <p class="text-gray-600 mb-6 max-w-md mx-auto">Connect your social media accounts to see real-time analytics and performance metrics.</p>
            <button onclick="InfluencerDashboard.showConnectPlatformsModal()" class="px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold rounded-xl hover:from-pink-700 hover:to-purple-700">
                <i class="fas fa-plug mr-2"></i>Connect Platforms
            </button>
        </div>
        
        <!-- Analytics Content (shown when platforms connected) -->
        <div id="analytics-content" class="hidden space-y-6">
            <!-- Performance Chart -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 class="font-bold text-gray-900 mb-4">Performance Trends</h3>
                <div style="height: 300px;">
                    <canvas id="performanceChart"></canvas>
                </div>
            </div>
            
            <!-- Platform Breakdown -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Engagement by Platform -->
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 class="font-bold text-gray-900 mb-4">Engagement by Platform</h3>
                    <div style="height: 250px;">
                        <canvas id="platformChart"></canvas>
                    </div>
                </div>
                
                <!-- Top Performing Content -->
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 class="font-bold text-gray-900 mb-4">Top Content</h3>
                    <div class="space-y-4" id="top-content-list">
                        <!-- Content items will be rendered here -->
                    </div>
                </div>
            </div>
            
            <!-- Audience Demographics -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 class="font-bold text-gray-900 mb-4">Audience Demographics</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <h4 class="text-sm font-medium text-gray-500 mb-3">Age Distribution</h4>
                        <canvas id="ageChart" height="200"></canvas>
                    </div>
                    <div>
                        <h4 class="text-sm font-medium text-gray-500 mb-3">Gender</h4>
                        <canvas id="genderChart" height="200"></canvas>
                    </div>
                    <div>
                        <h4 class="text-sm font-medium text-gray-500 mb-3">Top Locations</h4>
                        <div class="space-y-2" id="locations-list">
                            <!-- Location items -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            InfluencerAnalytics.init();
        });
    </script>
    `
    
    return c.html(influencerLayout('My Analytics', 'analytics', content))
})

// ============================================
// OPPORTUNITIES PAGE - Brand Collaborations
// ============================================
influencerRoutes.get('/opportunities', (c) => {
    const content = `
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
                <h2 class="text-2xl font-bold text-gray-900">Brand Opportunities</h2>
                <p class="text-gray-500">Discover collaborations that match your profile</p>
            </div>
            <div class="flex items-center gap-3">
                <select class="px-4 py-2 border border-gray-200 rounded-xl text-sm" id="filter-category">
                    <option value="">All Categories</option>
                    <option value="fashion">Fashion & Beauty</option>
                    <option value="tech">Tech & Gaming</option>
                    <option value="fitness">Fitness & Health</option>
                    <option value="food">Food & Cooking</option>
                    <option value="travel">Travel & Lifestyle</option>
                </select>
                <select class="px-4 py-2 border border-gray-200 rounded-xl text-sm" id="filter-budget">
                    <option value="">Any Budget</option>
                    <option value="0-500">$0 - $500</option>
                    <option value="500-1000">$500 - $1,000</option>
                    <option value="1000-5000">$1,000 - $5,000</option>
                    <option value="5000+">$5,000+</option>
                </select>
            </div>
        </div>
        
        <!-- No Platforms State -->
        <div id="no-platforms-opportunities" class="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <i class="fas fa-exclamation-triangle text-amber-500 mt-0.5"></i>
            <div>
                <p class="text-amber-800 font-medium">Connect your platforms to see matching opportunities</p>
                <p class="text-amber-600 text-sm">Brands match with creators based on audience data from connected platforms.</p>
                <button onclick="InfluencerDashboard.showConnectPlatformsModal()" class="mt-2 text-amber-700 hover:underline text-sm font-medium">
                    Connect Now →
                </button>
            </div>
        </div>
        
        <!-- Opportunities Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="opportunities-grid">
            <!-- Sample Opportunities (shown even without connection, but marked) -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
                <div class="h-32 bg-gradient-to-r from-blue-500 to-indigo-500 p-4 flex items-end">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-xl bg-white flex items-center justify-center">
                            <i class="fas fa-gem text-blue-600 text-xl"></i>
                        </div>
                        <div class="text-white">
                            <h3 class="font-bold">TechBrand Co.</h3>
                            <p class="text-blue-100 text-sm">Technology</p>
                        </div>
                    </div>
                </div>
                <div class="p-5">
                    <h4 class="font-semibold text-gray-900 mb-2">Product Launch Campaign</h4>
                    <p class="text-gray-600 text-sm mb-4">Looking for tech influencers to promote our new smartphone launch...</p>
                    <div class="flex items-center justify-between mb-4">
                        <span class="text-green-600 font-bold">$2,000 - $5,000</span>
                        <span class="text-xs text-gray-400">Posted 2 days ago</span>
                    </div>
                    <div class="flex gap-2 mb-4">
                        <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">Instagram</span>
                        <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">YouTube</span>
                    </div>
                    <button onclick="InfluencerOpportunities.applyToOpportunity('opp-1')" class="w-full py-2.5 bg-pink-600 text-white font-medium rounded-xl hover:bg-pink-700 transition-colors">
                        Apply Now
                    </button>
                </div>
            </div>
            
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
                <div class="h-32 bg-gradient-to-r from-pink-500 to-rose-500 p-4 flex items-end">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-xl bg-white flex items-center justify-center">
                            <i class="fas fa-spa text-pink-600 text-xl"></i>
                        </div>
                        <div class="text-white">
                            <h3 class="font-bold">BeautyGlow</h3>
                            <p class="text-pink-100 text-sm">Fashion & Beauty</p>
                        </div>
                    </div>
                </div>
                <div class="p-5">
                    <h4 class="font-semibold text-gray-900 mb-2">Summer Skincare Series</h4>
                    <p class="text-gray-600 text-sm mb-4">Creating content series for our new summer skincare collection...</p>
                    <div class="flex items-center justify-between mb-4">
                        <span class="text-green-600 font-bold">$500 - $1,500</span>
                        <span class="text-xs text-gray-400">Posted 5 days ago</span>
                    </div>
                    <div class="flex gap-2 mb-4">
                        <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">Instagram</span>
                        <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">TikTok</span>
                    </div>
                    <button onclick="InfluencerOpportunities.applyToOpportunity('opp-2')" class="w-full py-2.5 bg-pink-600 text-white font-medium rounded-xl hover:bg-pink-700 transition-colors">
                        Apply Now
                    </button>
                </div>
            </div>
            
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
                <div class="h-32 bg-gradient-to-r from-green-500 to-emerald-500 p-4 flex items-end">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-xl bg-white flex items-center justify-center">
                            <i class="fas fa-dumbbell text-green-600 text-xl"></i>
                        </div>
                        <div class="text-white">
                            <h3 class="font-bold">FitLife Pro</h3>
                            <p class="text-green-100 text-sm">Fitness & Health</p>
                        </div>
                    </div>
                </div>
                <div class="p-5">
                    <h4 class="font-semibold text-gray-900 mb-2">Fitness App Promotion</h4>
                    <p class="text-gray-600 text-sm mb-4">Seeking fitness creators for app launch campaign and tutorials...</p>
                    <div class="flex items-center justify-between mb-4">
                        <span class="text-green-600 font-bold">$1,000 - $3,000</span>
                        <span class="text-xs text-gray-400">Posted 1 week ago</span>
                    </div>
                    <div class="flex gap-2 mb-4">
                        <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">YouTube</span>
                        <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">TikTok</span>
                    </div>
                    <button onclick="InfluencerOpportunities.applyToOpportunity('opp-3')" class="w-full py-2.5 bg-pink-600 text-white font-medium rounded-xl hover:bg-pink-700 transition-colors">
                        Apply Now
                    </button>
                </div>
            </div>
        </div>
    </div>
    `
    
    return c.html(influencerLayout('Opportunities', 'opportunities', content))
})

// ============================================
// CONNECTIONS PAGE - Brand Connection Requests (LinkedIn-style)
// ============================================
influencerRoutes.get('/connections', (c) => {
    const content = `
    <div class="max-w-3xl mx-auto space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-2xl font-bold text-gray-900">My Network</h1>
                <p class="text-gray-500 text-sm">Manage your brand connections</p>
            </div>
            <div class="flex items-center gap-2 text-sm">
                <span class="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium" id="pending-badge">
                    <span id="pending-count-num">0</span> pending
                </span>
                <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium" id="connected-badge">
                    <span id="connected-count-num">0</span> connections
                </span>
            </div>
        </div>

        <!-- Pending Requests Section -->
        <div class="bg-white rounded-xl border border-gray-200" id="pending-section">
            <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 class="font-semibold text-gray-900">Pending invitations</h3>
                <button onclick="ConnectionsManager.toggleSection('pending')" class="text-sm text-purple-600 hover:text-purple-700 font-medium" id="pending-toggle">Hide</button>
            </div>
            <div id="pending-connections-list" class="divide-y divide-gray-100">
                <div class="p-8 text-center text-gray-400">
                    <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500 mx-auto mb-2"></div>
                    <p class="text-sm">Loading...</p>
                </div>
            </div>
        </div>

        <!-- Connected Brands Section -->
        <div class="bg-white rounded-xl border border-gray-200">
            <div class="px-5 py-4 border-b border-gray-100">
                <h3 class="font-semibold text-gray-900">Connected Brands</h3>
            </div>
            <div id="accepted-connections-list" class="divide-y divide-gray-100">
                <div class="p-8 text-center text-gray-400">
                    <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500 mx-auto mb-2"></div>
                    <p class="text-sm">Loading...</p>
                </div>
            </div>
        </div>
    </div>

    <script>
    window.ConnectionsManager = {
        connections: [],
        
        async init() {
            await this.loadConnections();
        },
        
        toggleSection(section) {
            const list = document.getElementById(section + '-connections-list');
            const toggle = document.getElementById(section + '-toggle');
            if (list.style.display === 'none') {
                list.style.display = 'block';
                toggle.textContent = 'Hide';
            } else {
                list.style.display = 'none';
                toggle.textContent = 'Show';
            }
        },
        
        async loadConnections() {
            try {
                const token = localStorage.getItem('ownlay_influencer_token');
                const response = await fetch('/api/v1/influencer/connections', {
                    headers: { 'Authorization': 'Bearer ' + token }
                });
                const data = await response.json();
                
                if (data.success) {
                    this.connections = data.data;
                    document.getElementById('pending-count-num').textContent = data.stats.pending || 0;
                    document.getElementById('connected-count-num').textContent = data.stats.accepted || 0;
                    this.renderPending();
                    this.renderConnected();
                    
                    // Hide pending section if empty
                    if ((data.stats.pending || 0) === 0) {
                        document.getElementById('pending-section').style.display = 'none';
                    }
                }
            } catch (e) {
                console.error('Error loading connections:', e);
            }
        },
        
        renderPending() {
            const pending = this.connections.filter(c => c.status === 'pending');
            const listEl = document.getElementById('pending-connections-list');
            
            if (pending.length === 0) {
                listEl.innerHTML = '<div class="p-6 text-center text-gray-400 text-sm">No pending invitations</div>';
                return;
            }
            
            listEl.innerHTML = pending.map(conn => {
                const brand = conn.brand;
                const initial = (brand.name || 'B')[0].toUpperCase();
                const timeAgo = this.formatTimeAgo(conn.requested_at);
                
                return \`
                <div class="p-4 flex items-center gap-4 hover:bg-gray-50">
                    <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">\${initial}</div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                            <h4 class="font-semibold text-gray-900">\${brand.name}</h4>
                            \${brand.verified ? '<i class="fas fa-check-circle text-blue-500 text-xs"></i>' : ''}
                        </div>
                        <p class="text-sm text-gray-500 truncate">\${conn.message || 'Wants to connect'}</p>
                        <p class="text-xs text-gray-400 mt-0.5">\${timeAgo}</p>
                    </div>
                    <div class="flex items-center gap-2 flex-shrink-0">
                        <button onclick="ConnectionsManager.respond('\${conn.id}', 'decline')" class="w-9 h-9 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors" title="Ignore">
                            <i class="fas fa-times"></i>
                        </button>
                        <button onclick="ConnectionsManager.respond('\${conn.id}', 'accept')" class="w-9 h-9 rounded-full border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white transition-colors" title="Accept">
                            <i class="fas fa-check"></i>
                        </button>
                    </div>
                </div>\`;
            }).join('');
        },
        
        renderConnected() {
            const connected = this.connections.filter(c => c.status === 'accepted');
            const listEl = document.getElementById('accepted-connections-list');
            
            if (connected.length === 0) {
                listEl.innerHTML = '<div class="p-8 text-center"><div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3"><i class="fas fa-users text-gray-400"></i></div><p class="text-gray-500 text-sm">No connections yet</p><p class="text-xs text-gray-400 mt-1">Accept invitations to start collaborating</p></div>';
                return;
            }
            
            listEl.innerHTML = connected.map(conn => {
                const brand = conn.brand;
                const initial = (brand.name || 'B')[0].toUpperCase();
                
                return \`
                <div class="p-4 flex items-center gap-4 hover:bg-gray-50">
                    <div class="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-bold flex-shrink-0">\${initial}</div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                            <h4 class="font-semibold text-gray-900">\${brand.name}</h4>
                            \${brand.verified ? '<i class="fas fa-check-circle text-blue-500 text-xs"></i>' : ''}
                        </div>
                        <p class="text-sm text-gray-500">\${brand.company || 'Brand'}</p>
                    </div>
                    <a href="/creator/messages" class="px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-full transition-colors">
                        Message
                    </a>
                </div>\`;
            }).join('');
        },
        
        async respond(connectionId, action) {
            try {
                const token = localStorage.getItem('ownlay_influencer_token');
                const response = await fetch('/api/v1/influencer/connections/' + connectionId + '/respond', {
                    method: 'POST',
                    headers: { 
                        'Authorization': 'Bearer ' + token,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ action })
                });
                
                const data = await response.json();
                if (data.success) {
                    if (typeof showToast === 'function') {
                        showToast(action === 'accept' ? 'Connection accepted!' : 'Invitation declined', action === 'accept' ? 'success' : 'info');
                    }
                    await this.loadConnections();
                }
            } catch (e) {
                console.error('Error responding:', e);
            }
        },
        
        formatTimeAgo(dateStr) {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);
            
            if (diffMins < 1) return 'Just now';
            if (diffMins < 60) return diffMins + 'm ago';
            if (diffHours < 24) return diffHours + 'h ago';
            if (diffDays < 7) return diffDays + 'd ago';
            return date.toLocaleDateString();
        }
    };
    
    document.addEventListener('DOMContentLoaded', () => {
        ConnectionsManager.init();
    });
    </script>
    `
    
    return c.html(influencerLayout('Connections', 'connections', content))
})

// ============================================
// MESSAGES PAGE - Brand Communications
// ============================================
influencerRoutes.get('/messages', (c) => {
    const content = `
    <div class="flex h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <!-- Conversations List -->
        <div class="w-80 border-r border-gray-200 flex flex-col">
            <div class="p-4 border-b border-gray-200">
                <div class="relative">
                    <input type="text" placeholder="Search messages..." class="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 focus:bg-white transition-all" oninput="InfluencerMessages.searchConversations(this.value)">
                    <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                </div>
            </div>
            <div class="flex-1 overflow-y-auto" id="conversations-list">
                <!-- Loading state -->
                <div class="p-6 text-center text-gray-400">
                    <i class="fas fa-spinner fa-spin text-2xl mb-3"></i>
                    <p class="text-sm">Loading conversations...</p>
                </div>
            </div>
        </div>
        
        <!-- Chat Area -->
        <div class="flex-1 flex flex-col">
            <!-- Empty State -->
            <div id="chat-empty-state" class="flex-1 flex items-center justify-center">
                <div class="text-center">
                    <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <i class="fas fa-comments text-gray-300 text-3xl"></i>
                    </div>
                    <h3 class="font-semibold text-gray-900 mb-1">No conversation selected</h3>
                    <p class="text-sm text-gray-500">Select a conversation or wait for brands to message you</p>
                </div>
            </div>
            
            <!-- Active Chat (hidden by default) -->
            <div id="chat-active" class="flex-1 flex flex-col hidden">
                <!-- Chat Header -->
                <div class="p-4 border-b border-gray-200 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold" id="chat-avatar">TB</div>
                        <div>
                            <h3 class="font-semibold text-gray-900" id="chat-name">TechBrand Co.</h3>
                            <p class="text-xs text-green-500" id="chat-status"><i class="fas fa-circle text-[6px] mr-1"></i>Online</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                            <i class="fas fa-video"></i>
                        </button>
                        <button class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                    </div>
                </div>
                
                <!-- Messages -->
                <div class="flex-1 overflow-y-auto p-4 space-y-4" id="chat-messages">
                    <!-- Messages will be rendered here -->
                </div>
                
                <!-- Input -->
                <div class="p-4 border-t border-gray-200 bg-white">
                    <div class="flex items-center gap-3">
                        <button type="button" class="p-2 text-gray-400 hover:text-gray-600 flex-shrink-0">
                            <i class="fas fa-paperclip"></i>
                        </button>
                        <input type="text" placeholder="Type a message..." class="flex-1 px-4 py-2.5 bg-gray-100 rounded-xl focus:ring-2 focus:ring-pink-500 focus:bg-white transition-all border-0 outline-none" id="chat-input" onkeypress="if(event.key==='Enter'){event.preventDefault();InfluencerMessages.sendMessage()}">
                        <button type="button" onclick="InfluencerMessages.sendMessage()" class="p-2.5 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-colors flex-shrink-0">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        // Initialize messages module when page loads
        document.addEventListener('DOMContentLoaded', function() {
            if (typeof InfluencerMessages !== 'undefined') {
                InfluencerMessages.init();
            }
        });
    </script>
    `
    
    return c.html(influencerLayout('Messages', 'messages', content))
})

// ============================================
// PROFILE PAGE
// ============================================
influencerRoutes.get('/profile', (c) => {
    const content = `
    <div class="max-w-4xl mx-auto space-y-6">
        <!-- Profile Header -->
        <div class="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-2xl p-8 text-white">
            <div class="flex flex-col md:flex-row items-center gap-6">
                <div class="relative">
                    <div class="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/50" id="profile-avatar">
                        <i class="fas fa-user text-4xl"></i>
                    </div>
                    <button onclick="InfluencerProfile.changePhoto()" class="absolute bottom-0 right-0 w-10 h-10 bg-white text-purple-600 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100">
                        <i class="fas fa-camera"></i>
                    </button>
                </div>
                <div class="text-center md:text-left flex-1">
                    <h1 class="text-3xl font-bold" id="profile-name">Creator Name</h1>
                    <p class="text-pink-100" id="profile-handle">@username</p>
                    <p class="text-pink-200 mt-2" id="profile-bio">No bio set</p>
                    <div class="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                        <span class="px-3 py-1 bg-white/20 rounded-full text-sm" id="profile-category">Category</span>
                        <span class="px-3 py-1 bg-white/20 rounded-full text-sm" id="profile-location">
                            <i class="fas fa-map-marker-alt mr-1"></i>Location
                        </span>
                    </div>
                </div>
                <button onclick="InfluencerProfile.editProfile()" class="px-6 py-3 bg-white text-purple-600 font-semibold rounded-xl hover:bg-pink-50">
                    <i class="fas fa-pen mr-2"></i>Edit Profile
                </button>
            </div>
        </div>
        
        <!-- Stats Overview -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-white rounded-xl p-4 text-center border border-gray-100">
                <p class="text-2xl font-bold text-gray-900" id="profile-followers">0</p>
                <p class="text-sm text-gray-500">Total Followers</p>
            </div>
            <div class="bg-white rounded-xl p-4 text-center border border-gray-100">
                <p class="text-2xl font-bold text-gray-900" id="profile-engagement">0%</p>
                <p class="text-sm text-gray-500">Avg. Engagement</p>
            </div>
            <div class="bg-white rounded-xl p-4 text-center border border-gray-100">
                <p class="text-2xl font-bold text-gray-900" id="profile-campaigns">0</p>
                <p class="text-sm text-gray-500">Campaigns</p>
            </div>
            <div class="bg-white rounded-xl p-4 text-center border border-gray-100">
                <p class="text-2xl font-bold text-pink-600" id="profile-rating">New</p>
                <p class="text-sm text-gray-500">Brand Rating</p>
            </div>
        </div>
        
        <!-- Connected Platforms -->
        <div class="bg-white rounded-2xl p-6 border border-gray-100">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-lg font-bold text-gray-900">Connected Platforms</h2>
                <button onclick="InfluencerDashboard.showConnectPlatformsModal()" class="text-pink-600 hover:underline text-sm font-medium">
                    <i class="fas fa-plus mr-1"></i>Add Platform
                </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4" id="profile-platforms">
                <!-- Platform cards will be rendered here -->
                <div class="border border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-pink-300 hover:bg-pink-50/50 transition-all cursor-pointer" onclick="InfluencerDashboard.showConnectPlatformsModal()">
                    <i class="fas fa-plus text-2xl text-gray-300 mb-2"></i>
                    <p class="text-sm text-gray-500">Connect Platform</p>
                </div>
            </div>
        </div>
        
        <!-- Media Kit / Portfolio -->
        <div class="bg-white rounded-2xl p-6 border border-gray-100">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-lg font-bold text-gray-900">Media Kit</h2>
                <button onclick="InfluencerProfile.downloadMediaKit()" class="px-4 py-2 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700">
                    <i class="fas fa-download mr-2"></i>Download
                </button>
            </div>
            <div class="bg-gray-50 rounded-xl p-8 text-center">
                <i class="fas fa-file-pdf text-4xl text-pink-300 mb-3"></i>
                <p class="text-gray-600 mb-4">Generate your professional media kit with analytics</p>
                <button onclick="InfluencerProfile.generateMediaKit()" class="px-6 py-2 border border-pink-300 text-pink-600 rounded-lg hover:bg-pink-50">
                    Generate Media Kit
                </button>
            </div>
        </div>
    </div>
    `
    
    return c.html(influencerLayout('My Profile', 'profile', content))
})

// ============================================
// EARNINGS PAGE
// ============================================
influencerRoutes.get('/earnings', (c) => {
    const content = `
    <div class="space-y-6">
        <!-- Earnings Overview -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-5 text-white">
                <p class="text-green-100 text-sm mb-1">Total Earnings</p>
                <p class="text-3xl font-bold" id="total-earnings">$0</p>
                <p class="text-green-200 text-xs mt-2">All time</p>
            </div>
            <div class="bg-white rounded-2xl p-5 border border-gray-100">
                <p class="text-gray-500 text-sm mb-1">This Month</p>
                <p class="text-3xl font-bold text-gray-900" id="month-earnings">$0</p>
                <p class="text-gray-400 text-xs mt-2">December 2024</p>
            </div>
            <div class="bg-white rounded-2xl p-5 border border-gray-100">
                <p class="text-gray-500 text-sm mb-1">Pending</p>
                <p class="text-3xl font-bold text-amber-600" id="pending-earnings">$0</p>
                <p class="text-gray-400 text-xs mt-2">Awaiting payment</p>
            </div>
            <div class="bg-white rounded-2xl p-5 border border-gray-100">
                <p class="text-gray-500 text-sm mb-1">Available</p>
                <p class="text-3xl font-bold text-green-600" id="available-earnings">$0</p>
                <button class="mt-2 text-xs text-pink-600 hover:underline">Withdraw</button>
            </div>
        </div>
        
        <!-- Earnings Chart -->
        <div class="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 class="font-bold text-gray-900 mb-4">Earnings History</h3>
            <div style="height: 250px;">
                <canvas id="earningsChart"></canvas>
            </div>
        </div>
        
        <!-- Transaction History -->
        <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div class="p-5 border-b border-gray-100">
                <h3 class="font-bold text-gray-900">Transaction History</h3>
            </div>
            <div class="divide-y divide-gray-100" id="transactions-list">
                <div class="p-8 text-center text-gray-400">
                    <i class="fas fa-receipt text-4xl mb-3 opacity-30"></i>
                    <p>No transactions yet</p>
                    <p class="text-sm">Complete campaigns to start earning</p>
                </div>
            </div>
        </div>
    </div>
    `
    
    return c.html(influencerLayout('Earnings', 'earnings', content))
})

// ============================================
// MY CAMPAIGNS PAGE
// ============================================
influencerRoutes.get('/campaigns', (c) => {
    const content = `
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-2xl font-bold text-gray-900">My Campaigns</h2>
                <p class="text-gray-500">Track your active and completed collaborations</p>
            </div>
            <div class="flex gap-2">
                <button class="px-4 py-2 bg-pink-600 text-white rounded-xl text-sm font-medium" onclick="document.querySelectorAll('.campaign-tab').forEach(t=>t.classList.remove('active'));this.classList.add('active');showCampaigns('active')">Active</button>
                <button class="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium campaign-tab" onclick="document.querySelectorAll('.campaign-tab').forEach(t=>t.classList.remove('active'));this.classList.add('active');showCampaigns('completed')">Completed</button>
                <button class="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium campaign-tab" onclick="document.querySelectorAll('.campaign-tab').forEach(t=>t.classList.remove('active'));this.classList.add('active');showCampaigns('pending')">Pending</button>
            </div>
        </div>
        
        <!-- Campaigns List -->
        <div id="campaigns-container">
            <div class="bg-white rounded-2xl p-8 text-center border border-gray-100">
                <i class="fas fa-bullhorn text-4xl text-gray-300 mb-3"></i>
                <h3 class="font-semibold text-gray-900 mb-1">No Active Campaigns</h3>
                <p class="text-sm text-gray-500 mb-4">Apply to opportunities to start working with brands</p>
                <a href="/creator/opportunities" class="inline-block px-6 py-2 bg-pink-600 text-white font-medium rounded-xl hover:bg-pink-700">
                    Browse Opportunities
                </a>
            </div>
        </div>
    </div>
    
    <script>
        function showCampaigns(type) {
            // Filter campaigns based on type
            console.log('Showing campaigns:', type);
        }
    </script>
    `
    
    return c.html(influencerLayout('My Campaigns', 'campaigns', content))
})

// ============================================
// SETTINGS PAGE
// ============================================
influencerRoutes.get('/settings', (c) => {
    const content = `
    <div class="max-w-3xl mx-auto space-y-6">
        <!-- Account Settings -->
        <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div class="p-5 border-b border-gray-100">
                <h3 class="font-bold text-gray-900">Account Settings</h3>
            </div>
            <div class="p-6 space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input type="email" id="settings-email" class="w-full px-4 py-2 border border-gray-200 rounded-xl" placeholder="you@example.com">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input type="text" id="settings-username" class="w-full px-4 py-2 border border-gray-200 rounded-xl" placeholder="@username">
                </div>
                <button class="px-6 py-2 bg-pink-600 text-white font-medium rounded-xl hover:bg-pink-700">Save Changes</button>
            </div>
        </div>
        
        <!-- Notification Preferences -->
        <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div class="p-5 border-b border-gray-100">
                <h3 class="font-bold text-gray-900">Notifications</h3>
            </div>
            <div class="divide-y divide-gray-100">
                <label class="p-4 flex items-center justify-between cursor-pointer">
                    <div>
                        <p class="font-medium text-gray-900">New Opportunities</p>
                        <p class="text-sm text-gray-500">Get notified when matching opportunities are posted</p>
                    </div>
                    <input type="checkbox" checked class="toggle-switch">
                </label>
                <label class="p-4 flex items-center justify-between cursor-pointer">
                    <div>
                        <p class="font-medium text-gray-900">Campaign Invitations</p>
                        <p class="text-sm text-gray-500">Receive notifications for brand invitations</p>
                    </div>
                    <input type="checkbox" checked class="toggle-switch">
                </label>
                <label class="p-4 flex items-center justify-between cursor-pointer">
                    <div>
                        <p class="font-medium text-gray-900">Messages</p>
                        <p class="text-sm text-gray-500">Get notified for new messages</p>
                    </div>
                    <input type="checkbox" checked class="toggle-switch">
                </label>
                <label class="p-4 flex items-center justify-between cursor-pointer">
                    <div>
                        <p class="font-medium text-gray-900">Payment Updates</p>
                        <p class="text-sm text-gray-500">Notifications about earnings and payouts</p>
                    </div>
                    <input type="checkbox" checked class="toggle-switch">
                </label>
            </div>
        </div>
        
        <!-- Payment Settings -->
        <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div class="p-5 border-b border-gray-100">
                <h3 class="font-bold text-gray-900">Payment Method</h3>
            </div>
            <div class="p-6">
                <div class="border border-dashed border-gray-300 rounded-xl p-6 text-center">
                    <i class="fas fa-credit-card text-3xl text-gray-300 mb-2"></i>
                    <p class="text-gray-600 mb-4">No payment method added</p>
                    <button class="px-6 py-2 bg-pink-600 text-white font-medium rounded-xl hover:bg-pink-700">
                        Add Payment Method
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Danger Zone -->
        <div class="bg-white rounded-2xl border border-red-200 overflow-hidden">
            <div class="p-5 border-b border-red-200 bg-red-50">
                <h3 class="font-bold text-red-900">Danger Zone</h3>
            </div>
            <div class="p-6">
                <button class="px-6 py-2 border border-red-300 text-red-600 font-medium rounded-xl hover:bg-red-50">
                    Delete Account
                </button>
            </div>
        </div>
    </div>
    `
    
    return c.html(influencerLayout('Settings', 'settings', content))
})
