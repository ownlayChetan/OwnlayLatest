import { Hono } from 'hono'
import { baseHead, marketingNav, footer } from '../components/layout'

export const authRoutes = new Hono()

// Shared styles for auth pages
const authStyles = `
<style>
    @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
    }
    @keyframes pulse-glow {
        0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.3); }
        50% { box-shadow: 0 0 40px rgba(99, 102, 241, 0.6); }
    }
    @keyframes slide-in-left {
        from { opacity: 0; transform: translateX(-30px); }
        to { opacity: 1; transform: translateX(0); }
    }
    @keyframes slide-in-right {
        from { opacity: 0; transform: translateX(30px); }
        to { opacity: 1; transform: translateX(0); }
    }
    @keyframes fade-in-up {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .animate-float { animation: float 6s ease-in-out infinite; }
    .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
    .animate-slide-left { animation: slide-in-left 0.6s ease-out forwards; }
    .animate-slide-right { animation: slide-in-right 0.6s ease-out forwards; }
    .animate-fade-up { animation: fade-in-up 0.5s ease-out forwards; }
    .auth-gradient { background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%); }
    .glass-card { 
        background: rgba(255, 255, 255, 0.95); 
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .input-focus:focus {
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
    }
    .btn-primary {
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        transition: all 0.3s ease;
    }
    .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4);
    }
    .social-btn {
        transition: all 0.2s ease;
    }
    .social-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    .floating-shape {
        position: absolute;
        border-radius: 50%;
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
    }
</style>
`

// React SPA HTML template for auth pages
const reactSpaHtml = (title: string, description: string) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title} | OWNLAY</title>
    <meta name="description" content="${description}" />
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

// Sign In Page - Now serves React SPA
authRoutes.get('/signin', (c) => {
    return c.html(reactSpaHtml('Sign In', 'Sign in to your OWNLAY account'))
})

// Sign Up Page - Now serves React SPA
authRoutes.get('/signup', (c) => {
    return c.html(reactSpaHtml('Sign Up', 'Create your free OWNLAY account'))
})

// Legacy Sign In Page (SSR version - kept for reference)
authRoutes.get('/signin-legacy', (c) => {
    return c.html(`
${baseHead('Sign In', 'Sign in to your OWNLAY account')}
${authStyles}
<body class="auth-gradient min-h-screen">
    <!-- Floating Decorative Shapes -->
    <div class="floating-shape w-64 h-64 top-10 left-10 animate-float" style="animation-delay: 0s;"></div>
    <div class="floating-shape w-48 h-48 bottom-20 right-20 animate-float" style="animation-delay: 2s;"></div>
    <div class="floating-shape w-32 h-32 top-1/2 right-1/4 animate-float" style="animation-delay: 4s;"></div>
    
    <div class="min-h-screen flex flex-col lg:flex-row">
        <!-- Left Panel - Branding -->
        <div class="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between animate-slide-left">
            <a href="/" class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center animate-pulse-glow">
                    <i class="fas fa-layer-group text-white text-lg"></i>
                </div>
                <span class="text-2xl font-bold text-white">OWNLAY</span>
            </a>
            
            <div class="space-y-8">
                <div>
                    <h1 class="text-4xl font-bold text-white mb-4">Welcome back to the<br/>Marketing Operating System</h1>
                    <p class="text-gray-300 text-lg">Unify your channels, automate workflows, and optimize every marketing dollar.</p>
                </div>
                
                <div class="space-y-4">
                    <div class="flex items-center gap-4 text-white/80">
                        <div class="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <span>Real-time analytics across all channels</span>
                    </div>
                    <div class="flex items-center gap-4 text-white/80">
                        <div class="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                            <i class="fas fa-robot"></i>
                        </div>
                        <span>AI-powered optimization and insights</span>
                    </div>
                    <div class="flex items-center gap-4 text-white/80">
                        <div class="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                            <i class="fas fa-plug"></i>
                        </div>
                        <span>Connect all your marketing platforms</span>
                    </div>
                </div>
            </div>
            
            <div class="flex items-center gap-6 text-gray-400 text-sm">
                <span class="flex items-center gap-2"><i class="fas fa-shield-check text-green-400"></i> SOC 2 Compliant</span>
                <span class="flex items-center gap-2"><i class="fas fa-lock text-green-400"></i> 256-bit Encryption</span>
            </div>
        </div>
        
        <!-- Right Panel - Sign In Form -->
        <div class="flex-1 flex items-center justify-center p-6 lg:p-12">
            <div class="w-full max-w-md animate-slide-right">
                <!-- Mobile Logo -->
                <a href="/" class="lg:hidden flex items-center gap-3 justify-center mb-8">
                    <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                        <i class="fas fa-layer-group text-white text-lg"></i>
                    </div>
                    <span class="text-2xl font-bold text-white">OWNLAY</span>
                </a>
                
                <div class="glass-card rounded-2xl p-8 shadow-2xl">
                    <div class="text-center mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-2">Sign in to your account</h2>
                        <p class="text-gray-600">Don't have an account? <a href="/auth/signup" class="text-indigo-600 hover:text-indigo-700 font-medium">Sign up free</a></p>
                    </div>
                    
                    <form id="signin-form" class="space-y-5" onsubmit="handleSignIn(event)">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Email address</label>
                            <input type="email" name="email" required
                                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 input-focus transition-all"
                                placeholder="you@company.com">
                        </div>
                        
                        <div>
                            <div class="flex items-center justify-between mb-2">
                                <label class="block text-sm font-medium text-gray-700">Password</label>
                                <a href="/auth/forgot-password" class="text-sm text-indigo-600 hover:text-indigo-700">Forgot password?</a>
                            </div>
                            <div class="relative">
                                <input type="password" name="password" id="password" required
                                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 input-focus transition-all pr-12"
                                    placeholder="••••••••">
                                <button type="button" onclick="togglePassword()" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    <i class="fas fa-eye" id="eye-icon"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="flex items-center justify-between">
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" name="remember" class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                                <span class="text-sm text-gray-600">Remember me</span>
                            </label>
                        </div>
                        
                        <button type="submit" class="w-full py-3 btn-primary text-white font-semibold rounded-xl">
                            Sign in
                        </button>
                    </form>
                    
                    <div class="my-6 flex items-center gap-4">
                        <div class="flex-1 border-t border-gray-200"></div>
                        <span class="text-sm text-gray-500">or continue with</span>
                        <div class="flex-1 border-t border-gray-200"></div>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-3">
                        <button onclick="handleOAuthSignIn('google')" class="social-btn flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-xl hover:bg-gray-50">
                            <svg class="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            <span class="text-sm font-medium text-gray-700">Google</span>
                        </button>
                        <button onclick="handleOAuthSignIn('microsoft')" class="social-btn flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-xl hover:bg-gray-50">
                            <svg class="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#F25022" d="M1 1h10v10H1z"/>
                                <path fill="#00A4EF" d="M1 13h10v10H1z"/>
                                <path fill="#7FBA00" d="M13 1h10v10H13z"/>
                                <path fill="#FFB900" d="M13 13h10v10H13z"/>
                            </svg>
                            <span class="text-sm font-medium text-gray-700">Microsoft</span>
                        </button>
                    </div>
                    
                    <div class="mt-6 text-center">
                        <p class="text-xs text-gray-500">
                            By signing in, you agree to our 
                            <a href="/terms" class="text-indigo-600 hover:underline">Terms of Service</a> and 
                            <a href="/privacy" class="text-indigo-600 hover:underline">Privacy Policy</a>
                        </p>
                    </div>
                    
                    <!-- Creator/Influencer Sign In Link -->
                    <div class="mt-4 pt-4 border-t border-gray-200 text-center">
                        <p class="text-sm text-gray-600">Are you a creator/influencer?</p>
                        <a href="/influencer/signin" class="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-medium rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all">
                            <i class="fas fa-star"></i>
                            Sign in as Creator
                        </a>
                    </div>
                </div>
                
                <!-- Demo Accounts Section -->
                <div class="mt-4 glass-card rounded-2xl overflow-hidden">
                    <button onclick="toggleDemoAccounts()" class="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <i class="fas fa-flask text-white text-sm"></i>
                            </div>
                            <div>
                                <p class="font-semibold text-gray-900 text-sm">Try Demo Accounts</p>
                                <p class="text-xs text-gray-500">Explore different user roles & plans</p>
                            </div>
                        </div>
                        <i class="fas fa-chevron-down text-gray-400 transition-transform" id="demo-chevron"></i>
                    </button>
                    <div class="hidden border-t border-gray-100" id="demo-accounts-panel">
                        <div class="p-4 space-y-3">
                            <!-- Admin Account -->
                            <button onclick="fillDemoAccount('admin@ownlay.app', 'Admin123!')" class="w-full p-3 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl text-left hover:from-red-100 hover:to-rose-100 transition-colors group">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center">
                                        <i class="fas fa-crown text-white"></i>
                                    </div>
                                    <div class="flex-1">
                                        <div class="flex items-center justify-between">
                                            <p class="font-semibold text-gray-900">Platform Admin</p>
                                            <span class="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded">ADMIN</span>
                                        </div>
                                        <p class="text-xs text-gray-500">admin@ownlay.app • Full platform access</p>
                                    </div>
                                    <i class="fas fa-arrow-right text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                                </div>
                            </button>
                            
                            <!-- Agency Account -->
                            <button onclick="fillDemoAccount('agency@demo.com', 'Agency123!')" class="w-full p-3 bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-xl text-left hover:from-purple-100 hover:to-violet-100 transition-colors group">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                                        <i class="fas fa-building text-white"></i>
                                    </div>
                                    <div class="flex-1">
                                        <div class="flex items-center justify-between">
                                            <p class="font-semibold text-gray-900">Agency Owner</p>
                                            <span class="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded">PRO</span>
                                        </div>
                                        <p class="text-xs text-gray-500">agency@demo.com • Multi-brand management</p>
                                    </div>
                                    <i class="fas fa-arrow-right text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                                </div>
                            </button>
                            
                            <!-- Brand Accounts by Plan -->
                            <div class="pt-2 border-t border-gray-100">
                                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">Brand Accounts by Plan</p>
                                <div class="grid grid-cols-2 gap-2">
                                    <button onclick="fillDemoAccount('starter@demo.com', 'Demo123!')" class="p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-left hover:bg-gray-100 transition-colors">
                                        <div class="flex items-center gap-2">
                                            <span class="w-2 h-2 rounded-full bg-gray-400"></span>
                                            <span class="text-xs font-medium text-gray-700">Starter</span>
                                        </div>
                                    </button>
                                    <button onclick="fillDemoAccount('growth@demo.com', 'Demo123!')" class="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-left hover:bg-blue-100 transition-colors">
                                        <div class="flex items-center gap-2">
                                            <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                                            <span class="text-xs font-medium text-blue-700">Growth</span>
                                        </div>
                                    </button>
                                    <button onclick="fillDemoAccount('pro@demo.com', 'Demo123!')" class="p-2.5 bg-purple-50 border border-purple-200 rounded-lg text-left hover:bg-purple-100 transition-colors">
                                        <div class="flex items-center gap-2">
                                            <span class="w-2 h-2 rounded-full bg-purple-500"></span>
                                            <span class="text-xs font-medium text-purple-700">Pro</span>
                                        </div>
                                    </button>
                                    <button onclick="fillDemoAccount('enterprise@demo.com', 'Demo123!')" class="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-left hover:bg-amber-100 transition-colors">
                                        <div class="flex items-center gap-2">
                                            <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                                            <span class="text-xs font-medium text-amber-700">Enterprise</span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Load app.js FIRST so Auth module is available -->
    <script src="/static/js/app.js"></script>
    <script>
        // Toggle password visibility - defined inline for immediate availability
        function togglePassword() {
            const passwordInput = document.getElementById('password');
            const eyeIcon = document.getElementById('eye-icon');
            if (passwordInput && eyeIcon) {
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    eyeIcon.classList.remove('fa-eye');
                    eyeIcon.classList.add('fa-eye-slash');
                } else {
                    passwordInput.type = 'password';
                    eyeIcon.classList.remove('fa-eye-slash');
                    eyeIcon.classList.add('fa-eye');
                }
            }
        }
        
        // Real-time sign in handler - Direct API call for reliability
        async function handleSignIn(e) {
            e.preventDefault();
            const form = e.target;
            const email = form.email.value;
            const password = form.password.value;
            
            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Signing in...';
            submitBtn.disabled = true;
            submitBtn.classList.add('opacity-75');
            
            try {
                // Direct API call for maximum reliability
                const response = await fetch('/api/v1/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, accountType: 'brand' })
                });
                const data = await response.json();
                
                if (data.success && data.data) {
                    // Clear any existing session data first
                    localStorage.removeItem('ownlay_token');
                    localStorage.removeItem('ownlay_user');
                    localStorage.removeItem('ownlay_refresh_token');
                    
                    // Set new session
                    localStorage.setItem('ownlay_token', data.data.access_token);
                    localStorage.setItem('ownlay_user', JSON.stringify(data.data.user));
                    if (data.data.refresh_token) {
                        localStorage.setItem('ownlay_refresh_token', data.data.refresh_token);
                    }
                    document.cookie = 'ownlay_auth=true; path=/; max-age=86400; SameSite=Lax';
                    
                    showSuccess('Welcome back! Redirecting...');
                    
                    // Redirect based on account type and pending plan selection
                    setTimeout(() => {
                        const urlParams = new URLSearchParams(window.location.search);
                        const redirectTo = urlParams.get('redirect');
                        
                        // Check for pending plan selection (guest who clicked on a pricing plan)
                        const pendingPlanStr = localStorage.getItem('ownlay_pending_plan');
                        if (pendingPlanStr && redirectTo === 'checkout') {
                            try {
                                const pendingPlan = JSON.parse(pendingPlanStr);
                                // Clear the pending plan
                                localStorage.removeItem('ownlay_pending_plan');
                                
                                // Check if the pending plan is still valid (less than 1 hour old)
                                if (pendingPlan.timestamp && (Date.now() - pendingPlan.timestamp) < 3600000) {
                                    // Redirect to complete the checkout
                                    window.location.href = '/?checkout=' + pendingPlan.planId + '&currency=' + pendingPlan.currency + '&billing=' + pendingPlan.billingCycle;
                                    return;
                                }
                            } catch(e) {
                                localStorage.removeItem('ownlay_pending_plan');
                            }
                        }
                        
                        if (redirectTo && redirectTo !== 'checkout') {
                            window.location.href = redirectTo;
                        } else if (data.data.user.accountType === 'agency') {
                            window.location.href = '/auth/brands';
                        } else if (data.data.user.accountType === 'influencer') {
                            window.location.href = '/influencer/dashboard';
                        } else {
                            window.location.href = '/app/dashboard';
                        }
                    }, 500);
                    return;
                }
                
                showError(data.error || 'Invalid email or password');
                submitBtn.innerHTML = 'Sign in';
                submitBtn.disabled = false;
                submitBtn.classList.remove('opacity-75');
            } catch (error) {
                console.error('Sign in error:', error);
                showError('Connection error. Please check your internet and try again.');
                submitBtn.innerHTML = 'Sign in';
                submitBtn.disabled = false;
                submitBtn.classList.remove('opacity-75');
            }
        }
        
        function showSuccess(message) {
            const toast = document.createElement('div');
            toast.className = 'fixed top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl animate-fade-up z-50 flex items-center gap-3';
            toast.innerHTML = '<div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><i class="fas fa-check-circle"></i></div><span class="font-medium">' + message + '</span>';
            document.body.appendChild(toast);
            setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
        }
        
        async function handleOAuthSignIn(provider) {
            // Show loading state
            showInfo('Connecting to ' + provider.charAt(0).toUpperCase() + provider.slice(1) + '...');
            
            try {
                // For demo purposes, use the demo OAuth endpoint
                const response = await fetch('/api/v1/auth/oauth/demo', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        provider: provider,
                        accountType: 'brand'
                    })
                });
                
                const data = await response.json();
                
                if (data.success && data.data) {
                    // Clear any existing session
                    localStorage.removeItem('ownlay_token');
                    localStorage.removeItem('ownlay_user');
                    
                    // Store new session
                    localStorage.setItem('ownlay_token', data.data.access_token);
                    localStorage.setItem('ownlay_user', JSON.stringify(data.data.user));
                    document.cookie = 'ownlay_auth=true; path=/; max-age=86400; SameSite=Lax';
                    
                    showSuccess('Signed in with ' + provider.charAt(0).toUpperCase() + provider.slice(1) + '! Redirecting...');
                    
                    // Check for pending plan selection
                    const urlParams = new URLSearchParams(window.location.search);
                    const redirectTo = urlParams.get('redirect');
                    const pendingPlanStr = localStorage.getItem('ownlay_pending_plan');
                    
                    setTimeout(() => {
                        if (pendingPlanStr && redirectTo === 'checkout') {
                            try {
                                const pendingPlan = JSON.parse(pendingPlanStr);
                                localStorage.removeItem('ownlay_pending_plan');
                                if (pendingPlan.timestamp && (Date.now() - pendingPlan.timestamp) < 3600000) {
                                    window.location.href = '/?checkout=' + pendingPlan.planId + '&currency=' + pendingPlan.currency + '&billing=' + pendingPlan.billingCycle;
                                    return;
                                }
                            } catch(e) {
                                localStorage.removeItem('ownlay_pending_plan');
                            }
                        }
                        
                        // If user has no plan, redirect to onboarding
                        if (data.data.user.plan === 'none') {
                            window.location.href = '/onboarding';
                        } else {
                            window.location.href = redirectTo || '/app/dashboard';
                        }
                    }, 800);
                    return;
                }
                
                showError(data.error || 'OAuth sign-in failed. Please try again.');
            } catch (error) {
                console.error('OAuth error:', error);
                showError('Connection error. Please try again.');
            }
        }
        
        function showError(message) {
            const toast = document.createElement('div');
            toast.className = 'fixed top-4 right-4 bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-4 rounded-2xl shadow-2xl animate-fade-up z-50 flex items-center gap-3';
            toast.innerHTML = '<div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><i class="fas fa-exclamation-circle"></i></div><span class="font-medium">' + message + '</span>';
            document.body.appendChild(toast);
            setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 4000);
        }
        
        function showInfo(message) {
            const toast = document.createElement('div');
            toast.className = 'fixed top-4 right-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-4 rounded-2xl shadow-2xl animate-fade-up z-50 flex items-center gap-3';
            toast.innerHTML = '<div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><i class="fas fa-info-circle"></i></div><span class="font-medium">' + message + '</span>';
            document.body.appendChild(toast);
            setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
        }
        
        // Toggle demo accounts panel
        function toggleDemoAccounts() {
            const panel = document.getElementById('demo-accounts-panel');
            const chevron = document.getElementById('demo-chevron');
            if (panel && chevron) {
                panel.classList.toggle('hidden');
                chevron.style.transform = panel.classList.contains('hidden') ? '' : 'rotate(180deg)';
            }
        }
        
        // Fill demo account credentials
        function fillDemoAccount(email, password) {
            const emailInput = document.querySelector('input[name="email"]');
            const passwordInput = document.getElementById('password');
            if (emailInput) emailInput.value = email;
            if (passwordInput) passwordInput.value = password;
            
            // Close the panel
            const panel = document.getElementById('demo-accounts-panel');
            const chevron = document.getElementById('demo-chevron');
            if (panel) panel.classList.add('hidden');
            if (chevron) chevron.style.transform = '';
            
            showInfo('Demo credentials filled! Click "Sign in" to continue.');
        }
        
        // Check if already logged in
        document.addEventListener('DOMContentLoaded', function() {
            if (Auth && Auth.isLoggedIn()) {
                window.location.href = '/app/dashboard';
            }
        });
    </script>
</body>
</html>
    `)
})

// Legacy Sign Up Page (SSR version - kept for reference)
authRoutes.get('/signup-legacy', (c) => {
    return c.html(`
${baseHead('Sign Up', 'Create your OWNLAY account')}
${authStyles}
<body class="auth-gradient min-h-screen">
    <!-- Floating Decorative Shapes -->
    <div class="floating-shape w-64 h-64 top-10 right-10 animate-float" style="animation-delay: 0s;"></div>
    <div class="floating-shape w-48 h-48 bottom-20 left-20 animate-float" style="animation-delay: 2s;"></div>
    
    <div class="min-h-screen flex flex-col lg:flex-row">
        <!-- Left Panel - Branding -->
        <div class="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between animate-slide-left">
            <a href="/" class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center animate-pulse-glow">
                    <i class="fas fa-layer-group text-white text-lg"></i>
                </div>
                <span class="text-2xl font-bold text-white">OWNLAY</span>
            </a>
            
            <div class="space-y-8">
                <div>
                    <h1 class="text-4xl font-bold text-white mb-4">Start your 14-day<br/>free trial today</h1>
                    <p class="text-gray-300 text-lg">No credit card required. Get started in minutes.</p>
                </div>
                
                <div class="space-y-6">
                    <div class="flex items-start gap-4">
                        <div class="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center shrink-0">
                            <i class="fas fa-check text-green-400 text-lg"></i>
                        </div>
                        <div>
                            <h3 class="text-white font-semibold mb-1">Connect All Channels</h3>
                            <p class="text-gray-400">Google Ads, Meta, Shopify, and 20+ more integrations</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-4">
                        <div class="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center shrink-0">
                            <i class="fas fa-check text-green-400 text-lg"></i>
                        </div>
                        <div>
                            <h3 class="text-white font-semibold mb-1">AI-Powered Insights</h3>
                            <p class="text-gray-400">Get actionable recommendations to optimize spend</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-4">
                        <div class="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center shrink-0">
                            <i class="fas fa-check text-green-400 text-lg"></i>
                        </div>
                        <div>
                            <h3 class="text-white font-semibold mb-1">Unlimited Campaigns</h3>
                            <p class="text-gray-400">Build and manage unlimited marketing campaigns</p>
                        </div>
                    </div>
                </div>
                
                <div class="flex items-center gap-4">
                    <div class="flex -space-x-3">
                        <div class="w-10 h-10 rounded-full bg-indigo-500 border-2 border-white flex items-center justify-center text-white text-sm font-medium">JD</div>
                        <div class="w-10 h-10 rounded-full bg-purple-500 border-2 border-white flex items-center justify-center text-white text-sm font-medium">MK</div>
                        <div class="w-10 h-10 rounded-full bg-pink-500 border-2 border-white flex items-center justify-center text-white text-sm font-medium">AS</div>
                    </div>
                    <p class="text-gray-400 text-sm">Join 5,000+ marketing teams using OWNLAY</p>
                </div>
            </div>
            
            <div class="flex items-center gap-6 text-gray-400 text-sm">
                <span class="flex items-center gap-2"><i class="fas fa-shield-check text-green-400"></i> SOC 2 Compliant</span>
                <span class="flex items-center gap-2"><i class="fas fa-lock text-green-400"></i> 256-bit Encryption</span>
            </div>
        </div>
        
        <!-- Right Panel - Sign Up Form -->
        <div class="flex-1 flex items-center justify-center p-6 lg:p-12">
            <div class="w-full max-w-md animate-slide-right">
                <!-- Mobile Logo -->
                <a href="/" class="lg:hidden flex items-center gap-3 justify-center mb-8">
                    <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                        <i class="fas fa-layer-group text-white text-lg"></i>
                    </div>
                    <span class="text-2xl font-bold text-white">OWNLAY</span>
                </a>
                
                <div class="glass-card rounded-2xl p-8 shadow-2xl">
                    <div class="text-center mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-2">Create your account</h2>
                        <p class="text-gray-600">Already have an account? <a href="/auth/signin" class="text-indigo-600 hover:text-indigo-700 font-medium">Sign in</a></p>
                    </div>
                    
                    <!-- Account Type Selection -->
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-700 mb-3">I am a...</label>
                        <div class="grid grid-cols-2 gap-3">
                            <button type="button" onclick="selectAccountType('brand')" id="btn-brand"
                                class="account-type-btn p-4 border-2 border-indigo-500 bg-indigo-50 rounded-xl text-center transition-all">
                                <div class="w-12 h-12 mx-auto mb-2 rounded-xl bg-indigo-100 flex items-center justify-center">
                                    <i class="fas fa-building text-indigo-600 text-xl"></i>
                                </div>
                                <span class="font-semibold text-indigo-900">Brand</span>
                                <p class="text-xs text-indigo-600 mt-1">Single company</p>
                            </button>
                            <button type="button" onclick="selectAccountType('agency')" id="btn-agency"
                                class="account-type-btn p-4 border-2 border-gray-200 rounded-xl text-center hover:border-indigo-300 transition-all">
                                <div class="w-12 h-12 mx-auto mb-2 rounded-xl bg-gray-100 flex items-center justify-center">
                                    <i class="fas fa-users text-gray-600 text-xl"></i>
                                </div>
                                <span class="font-semibold text-gray-900">Agency</span>
                                <p class="text-xs text-gray-500 mt-1">Manage multiple brands</p>
                            </button>
                        </div>
                    </div>
                    
                    <form id="signup-form" class="space-y-4" onsubmit="handleSignUp(event)">
                        <input type="hidden" name="account_type" id="account_type" value="brand">
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">First name</label>
                                <input type="text" name="first_name" required
                                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 input-focus transition-all"
                                    placeholder="Jane">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Last name</label>
                                <input type="text" name="last_name" required
                                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 input-focus transition-all"
                                    placeholder="Doe">
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Work email</label>
                            <input type="email" name="email" required
                                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 input-focus transition-all"
                                placeholder="jane@company.com">
                        </div>
                        
                        <div id="company-field">
                            <label class="block text-sm font-medium text-gray-700 mb-2" id="company-label">Company name</label>
                            <input type="text" name="company" required
                                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 input-focus transition-all"
                                placeholder="Acme Corp" id="company-input">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <div class="relative">
                                <input type="password" name="password" id="signup-password" required minlength="8"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 input-focus transition-all pr-12"
                                    placeholder="Min. 8 characters" oninput="checkPasswordStrength(this.value)">
                                <button type="button" onclick="toggleSignupPassword()" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    <i class="fas fa-eye" id="signup-eye-icon"></i>
                                </button>
                            </div>
                            <div class="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                                <div id="password-strength-bar" class="h-full bg-red-500 transition-all duration-300" style="width: 0%"></div>
                            </div>
                            <p id="password-strength-text" class="text-xs text-gray-500 mt-1">Password strength: Too weak</p>
                        </div>
                        
                        <div class="flex items-start gap-2">
                            <input type="checkbox" name="terms" required class="w-4 h-4 mt-1 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                            <label class="text-sm text-gray-600">
                                I agree to the <a href="/terms" class="text-indigo-600 hover:underline">Terms of Service</a> and 
                                <a href="/privacy" class="text-indigo-600 hover:underline">Privacy Policy</a>
                            </label>
                        </div>
                        
                        <button type="submit" class="w-full py-3 btn-primary text-white font-semibold rounded-xl">
                            Create free account
                        </button>
                    </form>
                    
                    <div class="my-6 flex items-center gap-4">
                        <div class="flex-1 border-t border-gray-200"></div>
                        <span class="text-sm text-gray-500">or sign up with</span>
                        <div class="flex-1 border-t border-gray-200"></div>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-3">
                        <button onclick="handleOAuthSignUp('google')" class="social-btn flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-xl hover:bg-gray-50">
                            <svg class="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            <span class="text-sm font-medium text-gray-700">Google</span>
                        </button>
                        <button onclick="handleOAuthSignUp('microsoft')" class="social-btn flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-xl hover:bg-gray-50">
                            <svg class="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#F25022" d="M1 1h10v10H1z"/>
                                <path fill="#00A4EF" d="M1 13h10v10H1z"/>
                                <path fill="#7FBA00" d="M13 1h10v10H13z"/>
                                <path fill="#FFB900" d="M13 13h10v10H13z"/>
                            </svg>
                            <span class="text-sm font-medium text-gray-700">Microsoft</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Load app.js FIRST so Auth module is available -->
    <script src="/static/js/app.js"></script>
    <script>
        let selectedAccountType = 'brand';
        
        function selectAccountType(type) {
            selectedAccountType = type;
            document.getElementById('account_type').value = type;
            
            const brandBtn = document.getElementById('btn-brand');
            const agencyBtn = document.getElementById('btn-agency');
            const companyLabel = document.getElementById('company-label');
            const companyInput = document.getElementById('company-input');
            
            if (type === 'brand') {
                brandBtn.classList.add('border-indigo-500', 'bg-indigo-50');
                brandBtn.classList.remove('border-gray-200');
                brandBtn.querySelector('.w-12').classList.add('bg-indigo-100');
                brandBtn.querySelector('.w-12').classList.remove('bg-gray-100');
                brandBtn.querySelector('i').classList.add('text-indigo-600');
                brandBtn.querySelector('i').classList.remove('text-gray-600');
                
                agencyBtn.classList.remove('border-indigo-500', 'bg-indigo-50');
                agencyBtn.classList.add('border-gray-200');
                agencyBtn.querySelector('.w-12').classList.remove('bg-indigo-100');
                agencyBtn.querySelector('.w-12').classList.add('bg-gray-100');
                agencyBtn.querySelector('i').classList.remove('text-indigo-600');
                agencyBtn.querySelector('i').classList.add('text-gray-600');
                
                companyLabel.textContent = 'Company name';
                companyInput.placeholder = 'Acme Corp';
            } else {
                agencyBtn.classList.add('border-indigo-500', 'bg-indigo-50');
                agencyBtn.classList.remove('border-gray-200');
                agencyBtn.querySelector('.w-12').classList.add('bg-indigo-100');
                agencyBtn.querySelector('.w-12').classList.remove('bg-gray-100');
                agencyBtn.querySelector('i').classList.add('text-indigo-600');
                agencyBtn.querySelector('i').classList.remove('text-gray-600');
                
                brandBtn.classList.remove('border-indigo-500', 'bg-indigo-50');
                brandBtn.classList.add('border-gray-200');
                brandBtn.querySelector('.w-12').classList.remove('bg-indigo-100');
                brandBtn.querySelector('.w-12').classList.add('bg-gray-100');
                brandBtn.querySelector('i').classList.remove('text-indigo-600');
                brandBtn.querySelector('i').classList.add('text-gray-600');
                
                companyLabel.textContent = 'Agency name';
                companyInput.placeholder = 'Marketing Agency Inc.';
            }
        }
        
        function toggleSignupPassword() {
            const passwordInput = document.getElementById('signup-password');
            const eyeIcon = document.getElementById('signup-eye-icon');
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                eyeIcon.classList.remove('fa-eye');
                eyeIcon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                eyeIcon.classList.remove('fa-eye-slash');
                eyeIcon.classList.add('fa-eye');
            }
        }
        
        function checkPasswordStrength(password) {
            const bar = document.getElementById('password-strength-bar');
            const text = document.getElementById('password-strength-text');
            let strength = 0;
            
            if (password.length >= 8) strength += 25;
            if (password.match(/[a-z]/)) strength += 25;
            if (password.match(/[A-Z]/)) strength += 25;
            if (password.match(/[0-9!@#$%^&*]/)) strength += 25;
            
            bar.style.width = strength + '%';
            
            if (strength <= 25) {
                bar.className = 'h-full bg-red-500 transition-all duration-300';
                text.textContent = 'Password strength: Too weak';
                text.className = 'text-xs text-red-500 mt-1';
            } else if (strength <= 50) {
                bar.className = 'h-full bg-orange-500 transition-all duration-300';
                text.textContent = 'Password strength: Weak';
                text.className = 'text-xs text-orange-500 mt-1';
            } else if (strength <= 75) {
                bar.className = 'h-full bg-yellow-500 transition-all duration-300';
                text.textContent = 'Password strength: Good';
                text.className = 'text-xs text-yellow-500 mt-1';
            } else {
                bar.className = 'h-full bg-green-500 transition-all duration-300';
                text.textContent = 'Password strength: Strong';
                text.className = 'text-xs text-green-500 mt-1';
            }
        }
        
        // Real-time signup handler - Direct API call for reliability
        async function handleSignUp(e) {
            e.preventDefault();
            const form = e.target;
            const formData = new FormData(form);
            const accountType = formData.get('account_type') || 'brand';
            
            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Creating account...';
            submitBtn.disabled = true;
            submitBtn.classList.add('opacity-75');
            
            try {
                const response = await fetch('/api/v1/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: formData.get('email'),
                        password: formData.get('password'),
                        name: formData.get('first_name') + ' ' + formData.get('last_name'),
                        accountType: accountType,
                        company: formData.get('company')
                    })
                });
                
                const data = await response.json();
                
                if (data.success && data.data) {
                    // Clear any existing session data
                    localStorage.removeItem('ownlay_token');
                    localStorage.removeItem('ownlay_user');
                    localStorage.removeItem('ownlay_subscription');
                    
                    // Generate token if not provided
                    const token = data.data.access_token || 'token_' + Date.now() + '_' + Math.random().toString(36).substring(7);
                    
                    // Map signup form data to user object
                    const user = {
                        id: data.data.user?.id || 'user_' + Date.now(),
                        email: formData.get('email'),
                        name: formData.get('first_name') + ' ' + formData.get('last_name'),
                        company: formData.get('company'),
                        website: data.data.user?.website || null,
                        accountType: accountType,
                        // Plan assignment based on account type:
                        // - Agencies: PRO plan only (must pay)
                        // - Brands: no plan (must purchase or start trial)
                        plan: data.data.user?.plan || (accountType === 'agency' ? 'pro' : 'none'),
                        subscriptionStatus: data.data.user?.subscriptionStatus || 'none',
                        workspace_id: data.data.user?.workspace_id || 'ws_' + Date.now()
                    };
                    
                    localStorage.setItem('ownlay_token', token);
                    localStorage.setItem('ownlay_user', JSON.stringify(user));
                    document.cookie = 'ownlay_auth=true; path=/; max-age=86400; SameSite=Lax';
                    
                    showSuccess('Account created successfully! Welcome to OWNLAY!');
                    
                    setTimeout(() => {
                        const urlParams = new URLSearchParams(window.location.search);
                        const redirectTo = urlParams.get('redirect');
                        const planFromUrl = urlParams.get('plan');
                        const currencyFromUrl = urlParams.get('currency');
                        
                        // Check for pending plan selection (guest who clicked on a pricing plan)
                        const pendingPlanStr = localStorage.getItem('ownlay_pending_plan');
                        if (pendingPlanStr && redirectTo === 'checkout') {
                            try {
                                const pendingPlan = JSON.parse(pendingPlanStr);
                                // Clear the pending plan
                                localStorage.removeItem('ownlay_pending_plan');
                                
                                // Check if the pending plan is still valid (less than 1 hour old)
                                if (pendingPlan.timestamp && (Date.now() - pendingPlan.timestamp) < 3600000) {
                                    // Redirect to complete the checkout
                                    window.location.href = '/?checkout=' + pendingPlan.planId + '&currency=' + pendingPlan.currency + '&billing=' + pendingPlan.billingCycle;
                                    return;
                                }
                            } catch(e) {
                                localStorage.removeItem('ownlay_pending_plan');
                            }
                        }
                        
                        // If plan was passed in URL (from pricing page click), go to checkout
                        if (planFromUrl && planFromUrl !== 'none') {
                            window.location.href = '/?checkout=' + planFromUrl + '&currency=' + (currencyFromUrl || 'USD');
                            return;
                        }
                        
                        if (accountType === 'agency') {
                            // Agencies must select PRO plan and pay
                            window.location.href = '/pricing?type=agency';
                        } else {
                            // Brands go to onboarding (will be prompted to select plan)
                            window.location.href = '/onboarding';
                        }
                    }, 800);
                    return;
                }
                
                showError(data.error || 'Failed to create account. Please try again.');
                submitBtn.innerHTML = 'Create free account';
                submitBtn.disabled = false;
                submitBtn.classList.remove('opacity-75');
            } catch (error) {
                console.error('Sign up error:', error);
                showError('Connection error. Please check your internet and try again.');
                submitBtn.innerHTML = 'Create free account';
                submitBtn.disabled = false;
                submitBtn.classList.remove('opacity-75');
            }
        }
        
        function showSuccess(message) {
            const toast = document.createElement('div');
            toast.className = 'fixed top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl animate-fade-up z-50 flex items-center gap-3';
            toast.innerHTML = '<div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><i class="fas fa-check-circle"></i></div><span class="font-medium">' + message + '</span>';
            document.body.appendChild(toast);
            setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
        }
        
        async function handleOAuthSignUp(provider) {
            // Show loading state
            showInfo('Connecting to ' + provider.charAt(0).toUpperCase() + provider.slice(1) + '...');
            
            try {
                // For demo purposes, use the demo OAuth endpoint with the selected account type
                const response = await fetch('/api/v1/auth/oauth/demo', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        provider: provider,
                        accountType: selectedAccountType
                    })
                });
                
                const data = await response.json();
                
                if (data.success && data.data) {
                    // Clear any existing session
                    localStorage.removeItem('ownlay_token');
                    localStorage.removeItem('ownlay_user');
                    localStorage.removeItem('ownlay_subscription');
                    
                    // Store new session
                    localStorage.setItem('ownlay_token', data.data.access_token);
                    localStorage.setItem('ownlay_user', JSON.stringify(data.data.user));
                    document.cookie = 'ownlay_auth=true; path=/; max-age=86400; SameSite=Lax';
                    
                    showSuccess('Account created with ' + provider.charAt(0).toUpperCase() + provider.slice(1) + '! Redirecting...');
                    
                    // Check for pending plan from URL
                    const urlParams = new URLSearchParams(window.location.search);
                    const planFromUrl = urlParams.get('plan');
                    const currencyFromUrl = urlParams.get('currency');
                    const redirectTo = urlParams.get('redirect');
                    
                    setTimeout(() => {
                        // Check for pending plan selection
                        const pendingPlanStr = localStorage.getItem('ownlay_pending_plan');
                        if (pendingPlanStr && redirectTo === 'checkout') {
                            try {
                                const pendingPlan = JSON.parse(pendingPlanStr);
                                localStorage.removeItem('ownlay_pending_plan');
                                if (pendingPlan.timestamp && (Date.now() - pendingPlan.timestamp) < 3600000) {
                                    window.location.href = '/?checkout=' + pendingPlan.planId + '&currency=' + pendingPlan.currency + '&billing=' + pendingPlan.billingCycle;
                                    return;
                                }
                            } catch(e) {
                                localStorage.removeItem('ownlay_pending_plan');
                            }
                        }
                        
                        // If plan was passed in URL, go to checkout
                        if (planFromUrl && planFromUrl !== 'none') {
                            window.location.href = '/?checkout=' + planFromUrl + '&currency=' + (currencyFromUrl || 'USD');
                            return;
                        }
                        
                        // Agencies need to pay for PRO plan
                        if (selectedAccountType === 'agency') {
                            window.location.href = '/pricing?type=agency';
                        } else {
                            // Brands go to onboarding
                            window.location.href = '/onboarding';
                        }
                    }, 800);
                    return;
                }
                
                showError(data.error || 'OAuth sign-up failed. Please try again.');
            } catch (error) {
                console.error('OAuth error:', error);
                showError('Connection error. Please try again.');
            }
        }
        
        function showError(message) {
            const toast = document.createElement('div');
            toast.className = 'fixed top-4 right-4 bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-4 rounded-2xl shadow-2xl animate-fade-up z-50 flex items-center gap-3';
            toast.innerHTML = '<div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><i class="fas fa-exclamation-circle"></i></div><span class="font-medium">' + message + '</span>';
            document.body.appendChild(toast);
            setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 4000);
        }
        
        function showInfo(message) {
            const toast = document.createElement('div');
            toast.className = 'fixed top-4 right-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-4 rounded-2xl shadow-2xl animate-fade-up z-50 flex items-center gap-3';
            toast.innerHTML = '<div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><i class="fas fa-info-circle"></i></div><span class="font-medium">' + message + '</span>';
            document.body.appendChild(toast);
            setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
        }
        
        // Check if already logged in
        document.addEventListener('DOMContentLoaded', function() {
            if (typeof Auth !== 'undefined' && Auth.isLoggedIn()) {
                window.location.href = '/app/dashboard';
            }
        });
    </script>
</body>
</html>
    `)
})

// Forgot Password Page
authRoutes.get('/forgot-password', (c) => {
    return c.html(`
${baseHead('Forgot Password', 'Reset your OWNLAY password')}
${authStyles}
<body class="auth-gradient min-h-screen flex items-center justify-center p-6">
    <div class="w-full max-w-md animate-fade-up">
        <a href="/" class="flex items-center gap-3 justify-center mb-8">
            <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <i class="fas fa-layer-group text-white text-lg"></i>
            </div>
            <span class="text-2xl font-bold text-white">OWNLAY</span>
        </a>
        
        <div class="glass-card rounded-2xl p-8 shadow-2xl">
            <div class="text-center mb-8">
                <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-100 flex items-center justify-center">
                    <i class="fas fa-lock text-indigo-600 text-2xl"></i>
                </div>
                <h2 class="text-2xl font-bold text-gray-900 mb-2">Forgot your password?</h2>
                <p class="text-gray-600">No worries! Enter your email and we'll send you reset instructions.</p>
            </div>
            
            <form id="forgot-form" class="space-y-5" onsubmit="handleForgotPassword(event)">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Email address</label>
                    <input type="email" name="email" required
                        class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 input-focus transition-all"
                        placeholder="you@company.com">
                </div>
                
                <button type="submit" class="w-full py-3 btn-primary text-white font-semibold rounded-xl">
                    Send reset link
                </button>
            </form>
            
            <div class="mt-6 text-center">
                <a href="/auth/signin" class="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                    <i class="fas fa-arrow-left mr-2"></i>Back to sign in
                </a>
            </div>
        </div>
    </div>
    
    <script>
        async function handleForgotPassword(e) {
            e.preventDefault();
            const form = e.target;
            const email = form.email.value;
            
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Sending...';
            submitBtn.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                document.querySelector('.glass-card').innerHTML = \`
                    <div class="text-center">
                        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                            <i class="fas fa-check text-green-600 text-2xl"></i>
                        </div>
                        <h2 class="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
                        <p class="text-gray-600 mb-6">We've sent a password reset link to <strong>\${email}</strong></p>
                        <a href="/auth/signin" class="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors">
                            Back to sign in
                        </a>
                    </div>
                \`;
            }, 1500);
        }
    </script>
</body>
</html>
    `)
})

// Agency Brand Management Page (for agency accounts) - Dynamic data with static fallback
authRoutes.get('/brands', (c) => {
    return c.html(`
${baseHead('Manage Brands', 'Manage your agency brands')}
${authStyles}
<body class="bg-gray-50 min-h-screen">
    <nav class="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-6">
            <div class="flex items-center justify-between h-16">
                <a href="/app/dashboard" class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
                        <i class="fas fa-layer-group text-white text-sm"></i>
                    </div>
                    <span class="text-xl font-bold text-gray-900">OWNLAY</span>
                </a>
                <div class="flex items-center gap-4">
                    <span class="text-sm text-gray-600" id="agency-name">Marketing Agency Inc.</span>
                    <div class="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-medium" id="agency-initials">MA</div>
                    <button onclick="Auth.logout()" class="text-sm text-gray-500 hover:text-red-600 transition-colors">
                        <i class="fas fa-sign-out-alt"></i>
                    </button>
                </div>
            </div>
        </div>
    </nav>
    
    <main class="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        <!-- Data Source Indicator -->
        <div id="data-source-indicator" class="mb-4">
            <div class="flex items-center gap-2 text-sm">
                <span id="data-source-badge" class="px-3 py-1 bg-amber-100 text-amber-700 rounded-full font-medium">
                    <i class="fas fa-exclamation-triangle mr-1"></i> Sample Data
                </span>
                <span class="text-gray-500">Connect platforms in each brand to see live data</span>
            </div>
        </div>
        
        <div class="flex items-center justify-between mb-8">
            <div>
                <h1 class="text-3xl font-bold text-gray-900 mb-2">Your Brands</h1>
                <p class="text-gray-600">Manage all your client brands from one place</p>
            </div>
            <button onclick="openAddBrandModal()" class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors flex items-center gap-2">
                <i class="fas fa-plus"></i>
                Add Brand
            </button>
        </div>
        
        <div id="brands-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Brands will be loaded dynamically -->
            <div class="col-span-full text-center py-8">
                <i class="fas fa-spinner fa-spin text-2xl text-gray-400 mb-4"></i>
                <p class="text-gray-500">Loading brands...</p>
            </div>
        </div>
    </main>
    
    <!-- Add Brand Modal -->
    <div id="add-brand-modal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-6 hidden z-50">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fade-up">
            <div class="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 class="text-xl font-bold text-gray-900">Add New Brand</h2>
                <button onclick="closeAddBrandModal()" class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <form onsubmit="handleAddBrand(event)" class="p-6 space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Brand name</label>
                    <input type="text" name="brand_name" id="brand_name" required
                        class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Acme Corporation">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Website</label>
                    <input type="url" name="website" id="website"
                        class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="https://example.com">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                    <select name="industry" id="industry" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="">Select industry</option>
                        <option value="ecommerce">E-commerce</option>
                        <option value="saas">B2B SaaS</option>
                        <option value="dtc">DTC / Consumer</option>
                        <option value="finance">Finance</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Monthly ad spend (approx.)</label>
                    <select name="budget" id="budget" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="">Select range</option>
                        <option value="0-10k">$0 - $10,000</option>
                        <option value="10k-50k">$10,000 - $50,000</option>
                        <option value="50k-100k">$50,000 - $100,000</option>
                        <option value="100k+">$100,000+</option>
                    </select>
                </div>
                <div class="pt-4 flex gap-3">
                    <button type="button" onclick="closeAddBrandModal()" class="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" class="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors">
                        Add Brand
                    </button>
                </div>
            </form>
        </div>
    </div>
    
    <script src="/static/js/app.js"></script>
    <script>
        // Check auth on page load
        if (!Auth.isLoggedIn()) {
            window.location.href = '/auth/signin?redirect=/auth/brands';
        }
        
        // Brand Management
        const BrandManager = {
            STORAGE_KEY: 'ownlay_brands',
            
            // Sample static data for brands (shown until platforms are connected)
            sampleBrands: [
                {
                    id: 'acme',
                    name: 'Acme Corporation',
                    website: 'acme.com',
                    industry: 'ecommerce',
                    color: 'blue',
                    status: 'active',
                    hasConnectedPlatforms: false,
                    metrics: {
                        channels: 4,
                        spend: 45000,
                        roas: 4.2
                    }
                },
                {
                    id: 'techflow',
                    name: 'TechFlow SaaS',
                    website: 'techflow.io',
                    industry: 'saas',
                    color: 'purple',
                    status: 'active',
                    hasConnectedPlatforms: false,
                    metrics: {
                        channels: 3,
                        spend: 28000,
                        roas: 3.8
                    }
                },
                {
                    id: 'bloom',
                    name: 'Bloom Beauty',
                    website: 'bloombeauty.co',
                    industry: 'dtc',
                    color: 'pink',
                    status: 'setup',
                    hasConnectedPlatforms: false,
                    metrics: {
                        channels: 1,
                        spend: 0,
                        roas: 0
                    }
                }
            ],
            
            getBrands() {
                const stored = localStorage.getItem(this.STORAGE_KEY);
                if (stored) {
                    return JSON.parse(stored);
                }
                // Initialize with sample data
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.sampleBrands));
                return this.sampleBrands;
            },
            
            saveBrands(brands) {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(brands));
            },
            
            addBrand(brand) {
                const brands = this.getBrands();
                const newBrand = {
                    id: 'brand_' + Date.now(),
                    ...brand,
                    status: 'setup',
                    hasConnectedPlatforms: false,
                    color: this.getRandomColor(),
                    metrics: { channels: 0, spend: 0, roas: 0 }
                };
                brands.push(newBrand);
                this.saveBrands(brands);
                return newBrand;
            },
            
            getBrandMetrics(brandId) {
                // Check if brand has connected platforms
                const integrations = JSON.parse(localStorage.getItem('ownlay_integrations') || '{}');
                const brandIntegrations = integrations[brandId] || {};
                const hasConnected = Object.keys(brandIntegrations).length > 0;
                
                if (hasConnected) {
                    // Return live metrics from connected platforms
                    return {
                        isLive: true,
                        channels: Object.keys(brandIntegrations).length,
                        spend: this.calculateTotalSpend(brandIntegrations),
                        roas: this.calculateRoas(brandIntegrations)
                    };
                }
                
                // Return static sample data
                const brand = this.getBrands().find(b => b.id === brandId);
                return {
                    isLive: false,
                    ...brand?.metrics
                };
            },
            
            calculateTotalSpend(integrations) {
                let total = 0;
                Object.values(integrations).forEach(int => {
                    total += int.metrics?.spend || 0;
                });
                return total || Math.floor(Math.random() * 50000) + 10000;
            },
            
            calculateRoas(integrations) {
                // Calculate average ROAS from connected platforms
                const roasValues = Object.values(integrations)
                    .map(int => int.metrics?.roas)
                    .filter(r => r);
                
                if (roasValues.length > 0) {
                    return (roasValues.reduce((a, b) => a + b, 0) / roasValues.length).toFixed(1);
                }
                return (Math.random() * 3 + 2).toFixed(1);
            },
            
            getRandomColor() {
                const colors = ['blue', 'purple', 'pink', 'green', 'amber', 'indigo', 'teal', 'rose'];
                return colors[Math.floor(Math.random() * colors.length)];
            },
            
            formatCurrency(num) {
                if (num >= 1000) return '$' + (num / 1000).toFixed(0) + 'K';
                return '$' + num;
            }
        };
        
        function renderBrands() {
            const brands = BrandManager.getBrands();
            const container = document.getElementById('brands-container');
            
            // Check if any brand has live data
            const hasAnyLiveData = brands.some(b => b.hasConnectedPlatforms);
            
            // Update data source indicator
            const badge = document.getElementById('data-source-badge');
            if (hasAnyLiveData) {
                badge.className = 'px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium';
                badge.innerHTML = '<i class="fas fa-check-circle mr-1"></i> Live Data Available';
            }
            
            let html = brands.map(brand => {
                const metrics = BrandManager.getBrandMetrics(brand.id);
                const statusClass = brand.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700';
                const statusText = brand.status === 'active' ? 'Active' : 'Setup';
                
                return \`
                <div class="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer relative" onclick="switchToBrand('\${brand.id}')">
                    \${!metrics.isLive ? '<span class="absolute top-3 right-3 text-xs text-gray-400"><i class="fas fa-info-circle"></i> Sample</span>' : '<span class="absolute top-3 right-3 text-xs text-green-500"><i class="fas fa-check-circle"></i> Live</span>'}
                    <div class="flex items-start justify-between mb-4">
                        <div class="w-14 h-14 rounded-xl bg-\${brand.color}-100 flex items-center justify-center">
                            <span class="text-2xl font-bold text-\${brand.color}-600">\${brand.name.charAt(0)}</span>
                        </div>
                        <span class="px-3 py-1 \${statusClass} text-xs font-medium rounded-full">\${statusText}</span>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-1">\${brand.name}</h3>
                    <p class="text-sm text-gray-500 mb-4">\${brand.industry ? brand.industry.charAt(0).toUpperCase() + brand.industry.slice(1) : 'Other'} • \${brand.website || 'No website'}</p>
                    <div class="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                        <div class="text-center">
                            <p class="text-lg font-semibold text-gray-900">\${metrics.channels}</p>
                            <p class="text-xs text-gray-500">Channels</p>
                        </div>
                        <div class="text-center">
                            <p class="text-lg font-semibold text-gray-900">\${BrandManager.formatCurrency(metrics.spend)}</p>
                            <p class="text-xs text-gray-500">MTD Spend</p>
                        </div>
                        <div class="text-center">
                            <p class="text-lg font-semibold \${metrics.roas > 0 ? 'text-green-600' : 'text-gray-400'}">\${metrics.roas > 0 ? metrics.roas + 'x' : '--'}</p>
                            <p class="text-xs text-gray-500">ROAS</p>
                        </div>
                    </div>
                </div>
                \`;
            }).join('');
            
            // Add "Add Brand" card
            html += \`
            <div class="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center hover:border-indigo-400 hover:bg-indigo-50/50 transition-all cursor-pointer min-h-[200px]" onclick="openAddBrandModal()">
                <div class="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
                    <i class="fas fa-plus text-gray-400 text-xl"></i>
                </div>
                <h3 class="text-lg font-semibold text-gray-500">Add New Brand</h3>
                <p class="text-sm text-gray-400">Connect a new client</p>
            </div>
            \`;
            
            container.innerHTML = html;
        }
        
        function openAddBrandModal() {
            document.getElementById('add-brand-modal').classList.remove('hidden');
        }
        
        function closeAddBrandModal() {
            document.getElementById('add-brand-modal').classList.add('hidden');
            document.getElementById('brand_name').value = '';
            document.getElementById('website').value = '';
            document.getElementById('industry').value = '';
            document.getElementById('budget').value = '';
        }
        
        function switchToBrand(brandId) {
            localStorage.setItem('ownlay_current_brand', brandId);
            window.location.href = '/app/dashboard';
        }
        
        function handleAddBrand(e) {
            e.preventDefault();
            const form = e.target;
            
            const newBrand = BrandManager.addBrand({
                name: document.getElementById('brand_name').value,
                website: document.getElementById('website').value.replace(/^https?:\\/\\//, ''),
                industry: document.getElementById('industry').value
            });
            
            closeAddBrandModal();
            renderBrands();
            UI.showToast('Brand "' + newBrand.name + '" created! Set up integrations to see live data.', 'success');
        }
        
        // Update agency info from user data
        document.addEventListener('DOMContentLoaded', function() {
            const user = Auth.getUser();
            if (user) {
                const agencyName = document.getElementById('agency-name');
                const agencyInitials = document.getElementById('agency-initials');
                if (user.company) {
                    agencyName.textContent = user.company;
                    agencyInitials.textContent = user.company.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
                }
            }
            renderBrands();
        });
    </script>
</body>
</html>
    `)
})

// OAuth completion page - handles token storage after OAuth redirect
authRoutes.get('/oauth-complete', (c) => {
    return c.html(`
${baseHead('OAuth Complete', 'Completing sign in...')}
${authStyles}
<body class="auth-gradient min-h-screen flex items-center justify-center">
    <div class="text-center text-white">
        <div class="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
            <i class="fas fa-spinner fa-spin text-white text-3xl"></i>
        </div>
        <h1 class="text-2xl font-bold mb-2">Completing Sign In...</h1>
        <p class="text-gray-300">Please wait while we set up your account.</p>
    </div>
    
    <script>
        (async function() {
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');
            const provider = urlParams.get('provider');
            const redirect = urlParams.get('redirect') || '/app/dashboard';
            
            if (!token) {
                alert('OAuth failed: No token received');
                window.location.href = '/auth/signin?error=oauth_failed';
                return;
            }
            
            try {
                // For demo, decode the user from the token (in production, verify with API)
                const userId = token.split('.').pop();
                
                // Store the token
                localStorage.setItem('ownlay_token', token);
                document.cookie = 'ownlay_auth=true; path=/; max-age=86400; SameSite=Lax';
                
                // Set basic user info (will be populated properly on dashboard load)
                const userInfo = {
                    id: userId,
                    email: provider === 'google' ? 'oauth.google.user@gmail.com' : 'oauth.microsoft.user@outlook.com',
                    name: provider === 'google' ? 'Google User' : 'Microsoft User',
                    accountType: 'brand',
                    plan: 'none',
                    oauthProvider: provider
                };
                
                localStorage.setItem('ownlay_user', JSON.stringify(userInfo));
                
                // Redirect to dashboard or onboarding
                setTimeout(() => {
                    if (userInfo.plan === 'none') {
                        window.location.href = '/onboarding';
                    } else {
                        window.location.href = decodeURIComponent(redirect);
                    }
                }, 1000);
            } catch (e) {
                console.error('OAuth completion error:', e);
                window.location.href = '/auth/signin?error=oauth_failed';
            }
        })();
    </script>
</body>
</html>
    `)
})
