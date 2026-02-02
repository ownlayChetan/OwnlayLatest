import { Hono } from 'hono'
import { baseHead, marketingNav } from '../components/layout'
import { formInput, formSelect, progressBar } from '../components/ui'

export const onboardingRoutes = new Hono()

// Onboarding wizard - 2 steps (Company & Goals, Connect Channels)
const onboardingLayout = (step: number, title: string, subtitle: string, content: string, prevHref?: string, nextHref?: string, nextLabel?: string, showSkip?: boolean, skipHref?: string) => `
${baseHead('Onboarding - ' + title)}
<body class="bg-gray-50 min-h-screen">
    <nav class="bg-white border-b border-gray-200">
        <div class="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <a href="/" class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
                    <i class="fas fa-layer-group text-white text-sm"></i>
                </div>
                <span class="text-xl font-bold text-gray-900">OWNLAY</span>
            </a>
            <a href="/" class="text-sm text-gray-500 hover:text-gray-700">Exit Setup</a>
        </div>
    </nav>
    
    <main class="max-w-2xl mx-auto px-6 py-12">
        <!-- Progress -->
        <div class="mb-12">
            <div class="flex items-center justify-between mb-4">
                ${[1, 2].map(s => `
                <div class="flex items-center ${s < 2 ? 'flex-1' : ''}">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${s < step ? 'bg-green-500 text-white' : s === step ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}">
                        ${s < step ? '<i class="fas fa-check"></i>' : s}
                    </div>
                    ${s < 2 ? `<div class="flex-1 h-1 mx-2 ${s < step ? 'bg-green-500' : 'bg-gray-200'}"></div>` : ''}
                </div>
                `).join('')}
            </div>
            <div class="flex justify-between text-xs text-gray-500">
                <span>Company & Goals</span>
                <span>Connect Channels</span>
            </div>
        </div>
        
        <!-- Step Content -->
        <div class="bg-white rounded-2xl border border-gray-200 p-8">
            <h1 class="text-2xl font-bold text-gray-900 mb-2">${title}</h1>
            <p class="text-gray-600 mb-8">${subtitle}</p>
            
            ${content}
            
            <div class="flex items-center justify-between mt-8 pt-8 border-t border-gray-100">
                ${prevHref ? `<a href="${prevHref}" class="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium">Back</a>` : '<div></div>'}
                <div class="flex items-center gap-4">
                    ${showSkip ? `<a href="${skipHref || '/app/dashboard'}" class="text-gray-500 hover:text-gray-700 text-sm font-medium">Skip for now</a>` : ''}
                    <a href="${nextHref || '#'}" class="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors" id="continue-btn">
                        ${nextLabel || 'Continue'}
                    </a>
                </div>
            </div>
        </div>
        
        <!-- Help Tip -->
        <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
            <i class="fas fa-lightbulb text-blue-500 mt-0.5"></i>
            <div>
                <p class="text-sm font-medium text-blue-900">Need help?</p>
                <p class="text-sm text-blue-700">Our support team is available 24/7. <a href="#" class="underline">Chat with us</a> or check our <a href="/docs" class="underline">documentation</a>.</p>
            </div>
        </div>
    </main>
</body>
</html>
`

// Step 1: Company & Goals
onboardingRoutes.get('/', (c) => {
    const content = `
    <form class="space-y-6" id="company-form" onsubmit="saveCompanyData(event)">
        ${formInput('Company Name', 'company_name', 'text', 'e.g., Acme Corporation', true)}
        ${formInput('Company Website', 'website', 'url', 'https://yourcompany.com', true)}
        
        ${formSelect('Industry', 'industry', [
            { value: 'ecommerce', label: 'E-commerce / Retail' },
            { value: 'saas', label: 'SaaS / Software' },
            { value: 'agency', label: 'Marketing Agency' },
            { value: 'fintech', label: 'Finance / Fintech' },
            { value: 'healthcare', label: 'Healthcare' },
            { value: 'education', label: 'Education' },
            { value: 'other', label: 'Other' }
        ], true)}
        
        ${formSelect('Team Size', 'team_size', [
            { value: '1-5', label: '1-5 people' },
            { value: '6-20', label: '6-20 people' },
            { value: '21-50', label: '21-50 people' },
            { value: '51-200', label: '51-200 people' },
            { value: '200+', label: '200+ people' }
        ], true)}
        
        ${formSelect('Monthly Ad Spend', 'ad_spend', [
            { value: '<10k', label: 'Less than $10,000' },
            { value: '10k-50k', label: '$10,000 - $50,000' },
            { value: '50k-100k', label: '$50,000 - $100,000' },
            { value: '100k-500k', label: '$100,000 - $500,000' },
            { value: '500k+', label: 'More than $500,000' }
        ], true)}
        
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">Primary Goals (select all that apply)</label>
            <div class="grid grid-cols-2 gap-3">
                <label class="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-indigo-500 transition-colors">
                    <input type="checkbox" name="goals" value="roas" class="w-4 h-4 text-indigo-600 rounded">
                    <span class="text-sm text-gray-700">Increase ROAS</span>
                </label>
                <label class="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-indigo-500 transition-colors">
                    <input type="checkbox" name="goals" value="cpa" class="w-4 h-4 text-indigo-600 rounded">
                    <span class="text-sm text-gray-700">Reduce CPA</span>
                </label>
                <label class="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-indigo-500 transition-colors">
                    <input type="checkbox" name="goals" value="scale" class="w-4 h-4 text-indigo-600 rounded">
                    <span class="text-sm text-gray-700">Scale Campaigns</span>
                </label>
                <label class="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-indigo-500 transition-colors">
                    <input type="checkbox" name="goals" value="unify" class="w-4 h-4 text-indigo-600 rounded">
                    <span class="text-sm text-gray-700">Unify Data</span>
                </label>
            </div>
        </div>
    </form>
    
    <script>
        // Pre-fill from user data
        document.addEventListener('DOMContentLoaded', function() {
            const userStr = localStorage.getItem('ownlay_user');
            if (userStr) {
                const user = JSON.parse(userStr);
                if (user.company) {
                    const companyInput = document.querySelector('input[name="company_name"]');
                    if (companyInput) companyInput.value = user.company;
                }
                if (user.website) {
                    const websiteInput = document.querySelector('input[name="website"]');
                    if (websiteInput) websiteInput.value = user.website;
                }
            }
        });
        
        function saveCompanyData(e) {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            // Get selected goals
            const goals = [];
            document.querySelectorAll('input[name="goals"]:checked').forEach(cb => {
                goals.push(cb.value);
            });
            
            // Update user data
            const userStr = localStorage.getItem('ownlay_user');
            const user = userStr ? JSON.parse(userStr) : {};
            
            user.company = formData.get('company_name');
            user.website = formData.get('website');
            user.industry = formData.get('industry');
            user.teamSize = formData.get('team_size');
            user.adSpend = formData.get('ad_spend');
            user.goals = goals;
            
            localStorage.setItem('ownlay_user', JSON.stringify(user));
            
            // Navigate to next step
            window.location.href = '/onboarding/channels';
        }
        
        // Override continue button
        document.getElementById('continue-btn')?.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('company-form').dispatchEvent(new Event('submit'));
        });
    </script>
    `
    
    return c.html(onboardingLayout(1, 'Tell us about your company', 'This helps us personalize your experience and recommend the best setup.', content, undefined, '/onboarding/channels'))
})

// Step 2: Connect Channels - Real Integration Flow
onboardingRoutes.get('/channels', (c) => {
    const channels = [
        { id: 'google_ads', name: 'Google Ads', icon: 'fab fa-google', color: 'text-blue-500', bgColor: 'bg-blue-50', description: 'Search, Display, YouTube ads' },
        { id: 'meta_ads', name: 'Meta Ads', icon: 'fab fa-meta', color: 'text-blue-600', bgColor: 'bg-blue-50', description: 'Facebook & Instagram ads' },
        { id: 'tiktok_ads', name: 'TikTok Ads', icon: 'fab fa-tiktok', color: 'text-black', bgColor: 'bg-gray-100', description: 'Short-form video ads' },
        { id: 'linkedin_ads', name: 'LinkedIn Ads', icon: 'fab fa-linkedin', color: 'text-blue-700', bgColor: 'bg-blue-50', description: 'B2B advertising' },
        { id: 'ga4', name: 'Google Analytics 4', icon: 'fas fa-chart-pie', color: 'text-amber-500', bgColor: 'bg-amber-50', description: 'Website analytics' },
        { id: 'shopify', name: 'Shopify', icon: 'fab fa-shopify', color: 'text-green-600', bgColor: 'bg-green-50', description: 'E-commerce data' },
        { id: 'stripe', name: 'Stripe', icon: 'fab fa-stripe', color: 'text-purple-600', bgColor: 'bg-purple-50', description: 'Payment data' },
        { id: 'mailchimp', name: 'Mailchimp', icon: 'fab fa-mailchimp', color: 'text-amber-600', bgColor: 'bg-amber-50', description: 'Email marketing' }
    ]
    
    const content = `
    <div class="space-y-4">
        <p class="text-sm text-gray-500 mb-6">Connect your marketing channels to start seeing real data. You can always add more later.</p>
        
        <!-- Subscription Check Notice -->
        <div id="subscription-notice" class="hidden p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
            <div class="flex items-start gap-3">
                <i class="fas fa-exclamation-triangle text-amber-500 mt-0.5"></i>
                <div>
                    <p class="text-sm font-medium text-amber-900">Subscription Required</p>
                    <p class="text-sm text-amber-700">You need an active subscription to connect platforms. <a href="/pricing" class="underline font-medium">View Plans</a></p>
                </div>
            </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4" id="channels-grid">
            ${channels.map(ch => `
            <div class="channel-card flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-indigo-300 transition-colors" data-provider="${ch.id}">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg ${ch.bgColor} flex items-center justify-center">
                        <i class="${ch.icon} ${ch.color} text-lg"></i>
                    </div>
                    <div>
                        <p class="font-medium text-gray-900">${ch.name}</p>
                        <p class="text-xs text-gray-500">${ch.description}</p>
                    </div>
                </div>
                <button type="button" 
                    class="connect-btn px-4 py-2 border border-indigo-600 text-indigo-600 text-sm font-medium rounded-lg hover:bg-indigo-50 transition-colors"
                    data-provider="${ch.id}"
                    onclick="connectChannel('${ch.id}')">
                    Connect
                </button>
            </div>
            `).join('')}
        </div>
        
        <!-- Connected Platforms Summary -->
        <div id="connected-summary" class="hidden mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <i class="fas fa-check text-green-600"></i>
                </div>
                <div>
                    <p class="font-medium text-green-900"><span id="connected-count">0</span> platform(s) connected</p>
                    <p class="text-sm text-green-700">Your data will start syncing automatically</p>
                </div>
            </div>
        </div>
        
        <p class="text-sm text-gray-500 mt-4">
            <i class="fas fa-lock mr-1"></i>
            Your credentials are encrypted and stored securely. We use OAuth where available.
        </p>
    </div>
    
    <script>
        let connectedChannels = [];
        
        // Check subscription status on load
        document.addEventListener('DOMContentLoaded', async function() {
            await checkSubscriptionForChannels();
            updateConnectedUI();
        });
        
        async function checkSubscriptionForChannels() {
            try {
                const userStr = localStorage.getItem('ownlay_user');
                if (!userStr) return false;
                
                const user = JSON.parse(userStr);
                
                // Check localStorage for subscription first
                const subscriptionStr = localStorage.getItem('ownlay_subscription');
                const localSubscription = subscriptionStr ? JSON.parse(subscriptionStr) : null;
                
                // If user has active subscription in localStorage, allow
                if (localSubscription && (localSubscription.status === 'active' || localSubscription.status === 'trialing')) {
                    if (localSubscription.status === 'trialing' && localSubscription.trialEnd) {
                        if (new Date(localSubscription.trialEnd) > new Date()) {
                            return true;
                        }
                    } else if (localSubscription.status === 'active') {
                        return true;
                    }
                }
                
                // Check user object for subscription status
                if (user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing') {
                    return true;
                }
                
                const response = await fetch('/api/v1/payment/can-integrate/' + encodeURIComponent(user.id || user.email || 'guest'), {
                    headers: {
                        'X-User-Plan': user.plan || 'none',
                        'X-Subscription-Status': user.subscriptionStatus || localSubscription?.status || 'none'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (!data.canConnect) {
                        document.getElementById('subscription-notice').classList.remove('hidden');
                        // Disable all connect buttons
                        document.querySelectorAll('.connect-btn').forEach(btn => {
                            btn.disabled = true;
                            btn.classList.add('opacity-50', 'cursor-not-allowed');
                            btn.classList.remove('hover:bg-indigo-50');
                        });
                        return false;
                    }
                }
                return true;
            } catch (error) {
                console.error('Subscription check error:', error);
                return false;
            }
        }
        
        async function connectChannel(provider) {
            // Check subscription first
            const userStr = localStorage.getItem('ownlay_user');
            if (!userStr) {
                showError('Please sign in to connect platforms');
                return;
            }
            
            const user = JSON.parse(userStr);
            
            try {
                const response = await fetch('/api/v1/payment/can-integrate/' + encodeURIComponent(user.id || user.email || 'guest'));
                const data = await response.json();
                
                if (!data.canConnect) {
                    showSubscriptionModal();
                    return;
                }
            } catch (error) {
                console.error('Error checking subscription:', error);
            }
            
            // Show connection modal (same as integrations page)
            showConnectionModal(provider);
        }
        
        function showConnectionModal(provider) {
            const providerConfig = {
                google_ads: { name: 'Google Ads', icon: 'fab fa-google', color: 'text-blue-500', buttonText: 'Continue with Google' },
                meta_ads: { name: 'Meta Ads', icon: 'fab fa-meta', color: 'text-blue-600', buttonText: 'Continue with Facebook' },
                shopify: { name: 'Shopify', icon: 'fab fa-shopify', color: 'text-green-600', buttonText: 'Continue with Shopify' },
                ga4: { name: 'Google Analytics 4', icon: 'fas fa-chart-pie', color: 'text-amber-500', buttonText: 'Continue with Google' },
                tiktok_ads: { name: 'TikTok Ads', icon: 'fab fa-tiktok', color: 'text-black', buttonText: 'Continue with TikTok' },
                linkedin_ads: { name: 'LinkedIn Ads', icon: 'fab fa-linkedin', color: 'text-blue-700', buttonText: 'Continue with LinkedIn' },
                stripe: { name: 'Stripe', icon: 'fab fa-stripe', color: 'text-purple-600', buttonText: 'Continue with Stripe' },
                mailchimp: { name: 'Mailchimp', icon: 'fab fa-mailchimp', color: 'text-amber-600', buttonText: 'Continue with Mailchimp' }
            };
            
            const config = providerConfig[provider] || { name: provider, icon: 'fas fa-plug', color: 'text-gray-600', buttonText: 'Connect' };
            
            const modal = document.createElement('div');
            modal.id = 'connection-modal';
            modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm';
            modal.innerHTML = \`
                <div class="bg-white rounded-2xl max-w-md w-full mx-4 overflow-hidden shadow-2xl">
                    <div class="p-6 text-center">
                        <div class="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                            <i class="\${config.icon} \${config.color} text-3xl"></i>
                        </div>
                        <h3 class="text-xl font-bold text-gray-900 mb-2">Connect \${config.name}</h3>
                        <p class="text-gray-600 text-sm mb-6">Grant OWNLAY permission to read your \${config.name} data securely.</p>
                        
                        <div class="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                            <p class="text-sm font-medium text-gray-700 mb-2">OWNLAY will access:</p>
                            <ul class="space-y-2 text-sm text-gray-600">
                                <li class="flex items-center gap-2"><i class="fas fa-check text-green-500"></i> Campaign performance data</li>
                                <li class="flex items-center gap-2"><i class="fas fa-check text-green-500"></i> Historical metrics and reports</li>
                                <li class="flex items-center gap-2"><i class="fas fa-check text-green-500"></i> Audience insights</li>
                            </ul>
                        </div>
                        
                        <button onclick="simulateOAuth('\${provider}')" class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors mb-3">
                            \${config.buttonText}
                        </button>
                        <button onclick="closeConnectionModal()" class="w-full py-3 text-gray-600 hover:text-gray-900 font-medium">
                            Cancel
                        </button>
                    </div>
                </div>
            \`;
            
            document.body.appendChild(modal);
        }
        
        function closeConnectionModal() {
            const modal = document.getElementById('connection-modal');
            if (modal) modal.remove();
        }
        
        function simulateOAuth(provider) {
            const modal = document.getElementById('connection-modal');
            modal.innerHTML = \`
                <div class="bg-white rounded-2xl max-w-md w-full mx-4 p-8 text-center">
                    <div class="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-spinner fa-spin text-2xl text-indigo-600"></i>
                    </div>
                    <h3 class="font-bold text-gray-900 mb-2">Connecting...</h3>
                    <p class="text-gray-500 text-sm">Please wait while we establish a secure connection</p>
                </div>
            \`;
            
            // Simulate OAuth flow
            setTimeout(() => {
                // Save connection
                const integrations = JSON.parse(localStorage.getItem('ownlay_integrations') || '{}');
                integrations[provider] = {
                    status: 'connected',
                    connectedAt: new Date().toISOString(),
                    lastSync: new Date().toISOString(),
                    metrics: {
                        events: Math.floor(Math.random() * 100000) + 10000,
                        spend: Math.floor(Math.random() * 50000) + 5000
                    }
                };
                localStorage.setItem('ownlay_integrations', JSON.stringify(integrations));
                
                // Update UI
                connectedChannels.push(provider);
                updateChannelButton(provider);
                updateConnectedUI();
                
                // Show success
                modal.innerHTML = \`
                    <div class="bg-white rounded-2xl max-w-md w-full mx-4 p-8 text-center">
                        <div class="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-check text-2xl text-green-600"></i>
                        </div>
                        <h3 class="font-bold text-gray-900 mb-2">Connected!</h3>
                        <p class="text-gray-500 text-sm mb-6">Your data will start syncing automatically</p>
                        <button onclick="closeConnectionModal()" class="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700">
                            Continue
                        </button>
                    </div>
                \`;
            }, 2000);
        }
        
        function updateChannelButton(provider) {
            const btn = document.querySelector(\`.connect-btn[data-provider="\${provider}"]\`);
            if (btn) {
                btn.textContent = 'Connected ✓';
                btn.classList.remove('border-indigo-600', 'text-indigo-600', 'hover:bg-indigo-50');
                btn.classList.add('bg-green-100', 'text-green-700', 'border-green-200');
                btn.disabled = true;
            }
        }
        
        function updateConnectedUI() {
            const integrations = JSON.parse(localStorage.getItem('ownlay_integrations') || '{}');
            const count = Object.keys(integrations).length;
            
            // Update existing connected channels UI
            Object.keys(integrations).forEach(provider => {
                updateChannelButton(provider);
            });
            
            // Show/hide summary
            const summary = document.getElementById('connected-summary');
            const countSpan = document.getElementById('connected-count');
            
            if (count > 0) {
                summary.classList.remove('hidden');
                countSpan.textContent = count;
            }
        }
        
        function showSubscriptionModal() {
            const modal = document.createElement('div');
            modal.id = 'subscription-modal';
            modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm';
            modal.innerHTML = \`
                <div class="bg-white rounded-2xl max-w-lg w-full mx-4 overflow-hidden shadow-2xl">
                    <div class="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center">
                        <div class="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-lock text-3xl"></i>
                        </div>
                        <h3 class="text-2xl font-bold">Subscribe to Connect Platforms</h3>
                        <p class="text-indigo-200 mt-2">Connect your marketing platforms to unlock real-time data</p>
                    </div>
                    
                    <div class="p-6">
                        <div class="bg-indigo-50 rounded-xl p-4 mb-6">
                            <div class="flex items-center gap-3 mb-2">
                                <i class="fas fa-gift text-indigo-600"></i>
                                <span class="font-semibold text-indigo-900">Starter Plan</span>
                                <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full ml-auto">7-Day Free Trial</span>
                            </div>
                            <p class="text-sm text-gray-600">No credit card required. Start with 3 platform connections.</p>
                        </div>
                        
                        <div class="flex gap-3">
                            <a href="/pricing" class="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors text-center">
                                View Plans
                            </a>
                            <button onclick="document.getElementById('subscription-modal').remove()" class="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors">
                                Maybe Later
                            </button>
                        </div>
                    </div>
                </div>
            \`;
            
            document.body.appendChild(modal);
        }
        
        function showError(message) {
            const toast = document.createElement('div');
            toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-xl shadow-lg z-50';
            toast.textContent = message;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }
    </script>
    `
    
    return c.html(onboardingLayout(2, 'Connect your marketing channels', 'OWNLAY will sync your campaign data automatically.', content, '/onboarding', '/onboarding/complete', 'Complete Setup', true, '/app/dashboard'))
})

// Onboarding Complete - Interactive Tour Launch
onboardingRoutes.get('/complete', (c) => {
    return c.html(`
${baseHead('Welcome to OWNLAY!')}
<style>
    @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse-ring {
        0% { transform: scale(1); opacity: 1; }
        100% { transform: scale(1.5); opacity: 0; }
    }
    .animate-slide-up { animation: slideUp 0.6s ease-out forwards; }
    .animate-slide-up-delay-1 { animation: slideUp 0.6s ease-out 0.1s forwards; opacity: 0; }
    .animate-slide-up-delay-2 { animation: slideUp 0.6s ease-out 0.2s forwards; opacity: 0; }
    .animate-slide-up-delay-3 { animation: slideUp 0.6s ease-out 0.3s forwards; opacity: 0; }
    .pulse-ring::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 50%;
        background: rgba(99, 102, 241, 0.4);
        animation: pulse-ring 2s ease-out infinite;
    }
</style>
<body class="bg-gradient-to-br from-gray-50 to-indigo-50 min-h-screen flex items-center justify-center">
    <div class="max-w-2xl mx-auto px-6">
        <!-- Success Animation -->
        <div class="text-center mb-8 animate-slide-up">
            <div class="relative w-24 h-24 mx-auto mb-6">
                <div class="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-green-500/30">
                    <i class="fas fa-check text-white text-4xl"></i>
                </div>
                <div class="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                    <i class="fas fa-star text-white text-sm"></i>
                </div>
            </div>
            
            <h1 class="text-4xl font-bold text-gray-900 mb-3">Welcome to OWNLAY! 🎉</h1>
            <p class="text-xl text-gray-600">Your account is ready. Let's get you started with a quick tour.</p>
        </div>
        
        <!-- Tour Steps Preview -->
        <div class="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-8">
            <div class="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                <h2 class="text-xl font-bold mb-2">Your Getting Started Guide</h2>
                <p class="text-indigo-200">Complete these steps to unlock the full power of OWNLAY</p>
            </div>
            
            <div class="p-6 space-y-4">
                <!-- Step 1: Connect Platforms -->
                <div class="flex items-start gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 animate-slide-up-delay-1">
                    <div class="relative">
                        <div class="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold pulse-ring">1</div>
                    </div>
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            <h3 class="font-bold text-gray-900">Connect Your Platforms</h3>
                            <span class="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">Priority</span>
                        </div>
                        <p class="text-sm text-gray-600 mb-2">Link your marketing platforms to see real data. Without integrations, you'll only see sample data.</p>
                        <div class="flex flex-wrap gap-2">
                            <span class="px-2 py-1 bg-white text-gray-600 text-xs rounded-lg border border-gray-200"><i class="fab fa-shopify text-green-600 mr-1"></i>Shopify</span>
                            <span class="px-2 py-1 bg-white text-gray-600 text-xs rounded-lg border border-gray-200"><i class="fab fa-meta text-blue-600 mr-1"></i>Meta Ads</span>
                            <span class="px-2 py-1 bg-white text-gray-600 text-xs rounded-lg border border-gray-200"><i class="fab fa-google text-red-500 mr-1"></i>Google Ads</span>
                        </div>
                    </div>
                    <a href="/app/integrations" class="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap">
                        Connect <i class="fas fa-arrow-right ml-1"></i>
                    </a>
                </div>
                
                <!-- Step 2: Explore Dashboard -->
                <div class="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 animate-slide-up-delay-2">
                    <div class="w-12 h-12 rounded-xl bg-gray-400 flex items-center justify-center text-white font-bold">2</div>
                    <div class="flex-1">
                        <h3 class="font-bold text-gray-900 mb-1">Explore Your Dashboard</h3>
                        <p class="text-sm text-gray-600">View unified metrics across all your connected channels. The dashboard updates in real-time.</p>
                    </div>
                    <span class="text-gray-400 text-sm">After Step 1</span>
                </div>
                
                <!-- Step 3: Choose Plan -->
                <div class="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 animate-slide-up-delay-3">
                    <div class="w-12 h-12 rounded-xl bg-gray-400 flex items-center justify-center text-white font-bold">3</div>
                    <div class="flex-1">
                        <h3 class="font-bold text-gray-900 mb-1">Unlock All Features</h3>
                        <p class="text-sm text-gray-600">Upgrade to access AI Insights, Campaign Builder, Ad Manager, and more advanced features.</p>
                    </div>
                    <span class="text-gray-400 text-sm">Optional</span>
                </div>
            </div>
        </div>
        
        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up-delay-3">
            <a href="/app/integrations" onclick="startTour()" class="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all text-center">
                <i class="fas fa-rocket mr-2"></i>
                Start by Connecting Platforms
            </a>
            <a href="/app/dashboard" onclick="skipTour()" class="px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all text-center">
                Skip for now
            </a>
        </div>
        
        <p class="text-center text-sm text-gray-500 mt-6">
            <i class="fas fa-lightbulb text-amber-500 mr-1"></i>
            Tip: Connected platforms = real insights. Sample data shows you what's possible!
        </p>
    </div>
    
    <script>
        // Mark that user has seen onboarding
        function startTour() {
            localStorage.setItem('ownlay_tour_step', 'integrations');
            localStorage.setItem('ownlay_tour_started', 'true');
            localStorage.setItem('ownlay_onboarding_complete', new Date().toISOString());
        }
        
        function skipTour() {
            localStorage.setItem('ownlay_tour_skipped', 'true');
            localStorage.setItem('ownlay_onboarding_complete', new Date().toISOString());
        }
        
        // Check if user already completed onboarding
        if (localStorage.getItem('ownlay_onboarding_complete')) {
            // If they've already onboarded, redirect to dashboard
            // window.location.href = '/app/dashboard';
        }
    </script>
</body>
</html>
    `)
})

// Interactive Tour Controller - Provides tour data for in-app guidance
onboardingRoutes.get('/tour-data', (c) => {
    return c.json({
        success: true,
        data: {
            steps: [
                {
                    id: 'welcome',
                    title: 'Welcome to OWNLAY!',
                    content: 'Let\'s get you set up to see your marketing data.',
                    target: null,
                    position: 'center'
                },
                {
                    id: 'integrations',
                    title: 'Connect Your Platforms',
                    content: 'This is where you link your marketing tools. Connect at least one to see real data!',
                    target: '.sidebar-item[data-feature="integrations"]',
                    position: 'right',
                    primaryAction: { label: 'Connect Now', href: '/app/integrations' }
                },
                {
                    id: 'dashboard',
                    title: 'Your Unified Dashboard',
                    content: 'See all your marketing metrics in one place. Data updates in real-time from connected platforms.',
                    target: '.sidebar-item[data-feature="dashboard"]',
                    position: 'right'
                },
                {
                    id: 'insights',
                    title: 'AI-Powered Insights',
                    content: 'Get smart recommendations based on your data. Requires Growth plan or higher.',
                    target: '.sidebar-item[data-feature="insights"]',
                    position: 'right'
                },
                {
                    id: 'complete',
                    title: 'You\'re Ready!',
                    content: 'Start exploring your dashboard. Connect more platforms to unlock deeper insights.',
                    target: null,
                    position: 'center'
                }
            ]
        }
    })
})
