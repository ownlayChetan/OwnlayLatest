/**
 * SignInPage - React version of OWNLAY Sign In
 * Features:
 * - Email/Password authentication
 * - Google OAuth
 * - Microsoft OAuth
 * - Demo accounts panel (Admin, Agency, Brand plans)
 * - Creator/Influencer sign-in link
 * - Remember me option
 * - Forgot password link
 * - Dark theme matching homepage
 */

import { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { 
  Eye, EyeOff, LogIn, Layers, Shield, Mail, Lock, 
  ChevronDown, Building2, Crown, Sparkles,
  Check, AlertCircle, Info, Star
} from 'lucide-react';
import { LoadingSpinner } from '@/components/common';
import clsx from 'clsx';

// Google SVG Icon
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

// Microsoft SVG Icon
const MicrosoftIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#F25022" d="M1 1h10v10H1z"/>
    <path fill="#00A4EF" d="M1 13h10v10H1z"/>
    <path fill="#7FBA00" d="M13 1h10v10H13z"/>
    <path fill="#FFB900" d="M13 13h10v10H13z"/>
  </svg>
);

// Demo accounts configuration
const DEMO_ACCOUNTS = {
  admin: { email: 'admin@ownlay.app', password: 'Admin123!', label: 'Platform Admin', badge: 'ADMIN', color: 'red' },
  agency: { email: 'agency@demo.com', password: 'Agency123!', label: 'Agency Owner', badge: 'PRO', color: 'purple' },
  plans: [
    { email: 'starter@demo.com', password: 'Demo123!', label: 'Starter', color: 'gray' },
    { email: 'growth@demo.com', password: 'Demo123!', label: 'Growth', color: 'blue' },
    { email: 'pro@demo.com', password: 'Demo123!', label: 'Pro', color: 'purple' },
    { email: 'enterprise@demo.com', password: 'Demo123!', label: 'Enterprise', color: 'amber' },
  ]
};

// Toast notification component
function Toast({ type, message, onClose }: { type: 'success' | 'error' | 'info'; message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'from-emerald-500 to-green-600',
    error: 'from-red-500 to-rose-600',
    info: 'from-indigo-500 to-purple-600'
  };

  const icons = {
    success: <Check className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />
  };

  return (
    <div className={clsx(
      'fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-white',
      'animate-fade-in bg-gradient-to-r',
      colors[type]
    )}>
      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
        {icons[type]}
      </div>
      <span className="font-medium">{message}</span>
    </div>
  );
}

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showDemoPanel, setShowDemoPanel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const { clearError } = useAuthStore();
  const location = useLocation();

  // Clear error on mount
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Track mouse for gradient effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Check for redirect param
  const searchParams = new URLSearchParams(location.search);
  const redirectTo = searchParams.get('redirect');

  // Handle form submit
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, accountType: 'brand' })
      });
      const data = await response.json();

      if (data.success && data.data) {
        // Store session
        localStorage.setItem('ownlay_token', data.data.access_token);
        localStorage.setItem('ownlay_user', JSON.stringify(data.data.user));
        if (data.data.refresh_token) {
          localStorage.setItem('ownlay_refresh_token', data.data.refresh_token);
        }
        document.cookie = 'ownlay_auth=true; path=/; max-age=86400; SameSite=Lax';

        setToast({ type: 'success', message: 'Welcome back! Redirecting...' });

        // Handle redirect
        setTimeout(() => {
          // Check for pending plan
          const pendingPlanStr = localStorage.getItem('ownlay_pending_plan');
          if (pendingPlanStr && redirectTo === 'checkout') {
            try {
              const pendingPlan = JSON.parse(pendingPlanStr);
              localStorage.removeItem('ownlay_pending_plan');
              if (pendingPlan.timestamp && (Date.now() - pendingPlan.timestamp) < 3600000) {
                window.location.href = `/?checkout=${pendingPlan.planId}&currency=${pendingPlan.currency}&billing=${pendingPlan.billingCycle}`;
                return;
              }
            } catch { localStorage.removeItem('ownlay_pending_plan'); }
          }

          // Route based on account type
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
      } else {
        setToast({ type: 'error', message: data.error || 'Invalid email or password' });
      }
    } catch {
      setToast({ type: 'error', message: 'Connection error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  }, [email, password, redirectTo]);

  // Handle OAuth sign in
  const handleOAuthSignIn = useCallback(async (provider: 'google' | 'microsoft') => {
    setOauthLoading(provider);
    setToast({ type: 'info', message: `Connecting to ${provider.charAt(0).toUpperCase() + provider.slice(1)}...` });

    try {
      const response = await fetch('/api/v1/auth/oauth/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, accountType: 'brand' })
      });
      const data = await response.json();

      if (data.success && data.data) {
        localStorage.setItem('ownlay_token', data.data.access_token);
        localStorage.setItem('ownlay_user', JSON.stringify(data.data.user));
        document.cookie = 'ownlay_auth=true; path=/; max-age=86400; SameSite=Lax';

        setToast({ type: 'success', message: `Signed in with ${provider}! Redirecting...` });

        setTimeout(() => {
          if (data.data.user.plan === 'none') {
            window.location.href = '/onboarding';
          } else {
            window.location.href = redirectTo || '/app/dashboard';
          }
        }, 800);
      } else {
        setToast({ type: 'error', message: data.error || 'OAuth sign-in failed' });
      }
    } catch {
      setToast({ type: 'error', message: 'Connection error. Please try again.' });
    } finally {
      setOauthLoading(null);
    }
  }, [redirectTo]);

  // Fill demo credentials
  const fillDemoAccount = useCallback((demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setShowDemoPanel(false);
    setToast({ type: 'info', message: 'Demo credentials filled! Click "Sign in" to continue.' });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative">
      {/* Toast notifications */}
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Animated background */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-30 transition-opacity duration-1000"
        style={{
          background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.15), transparent 40%)`,
        }}
      />

      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute w-[600px] h-[600px] -top-48 -left-48 bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute w-[500px] h-[500px] top-1/4 -right-48 bg-violet-600/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute w-[400px] h-[400px] bottom-1/4 left-1/4 bg-cyan-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Main layout - Two columns on desktop */}
      <div className="min-h-screen flex flex-col lg:flex-row relative z-10">
        
        {/* Left Panel - Branding (Desktop only) */}
        <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between">
          <a href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl blur-lg opacity-50 group-hover:opacity-80 transition-opacity" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg">
                <Layers className="w-5 h-5 text-white" />
              </div>
            </div>
            <span className="text-2xl font-bold text-white">OWNLAY</span>
          </a>

          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">
                Welcome back to the<br/>Marketing Operating System
              </h1>
              <p className="text-slate-300 text-lg">
                Unify your channels, automate workflows, and optimize every marketing dollar.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: '📊', text: 'Real-time analytics across all channels' },
                { icon: '🤖', text: 'AI-powered optimization and insights' },
                { icon: '🔌', text: 'Connect all your marketing platforms' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 text-slate-300">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-lg">
                    {item.icon}
                  </div>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6 text-slate-400 text-sm">
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" /> SOC 2 Compliant
            </span>
            <span className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" /> 256-bit Encryption
            </span>
          </div>
        </div>

        {/* Right Panel - Sign In Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <a href="/" className="lg:hidden flex items-center gap-3 justify-center mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">OWNLAY</span>
            </a>

            {/* Form Card */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-purple-500/20 rounded-3xl blur-xl" />
              <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Sign in to your account</h2>
                  <p className="text-slate-600">
                    Don't have an account?{' '}
                    <a href="/auth/signup" className="text-indigo-600 hover:text-indigo-700 font-medium">Sign up free</a>
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900"
                        placeholder="you@company.com"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-slate-700">Password</label>
                      <a href="/auth/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-700">Forgot password?</a>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900"
                        placeholder="••••••••"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember me */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-600">Remember me</span>
                  </label>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? <LoadingSpinner size="sm" /> : <LogIn className="w-5 h-5" />}
                    <span>{isLoading ? 'Signing in...' : 'Sign in'}</span>
                  </button>
                </form>

                {/* Divider */}
                <div className="my-6 flex items-center gap-4">
                  <div className="flex-1 border-t border-slate-200" />
                  <span className="text-sm text-slate-500">or continue with</span>
                  <div className="flex-1 border-t border-slate-200" />
                </div>

                {/* OAuth buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleOAuthSignIn('google')}
                    disabled={!!oauthLoading}
                    className="flex items-center justify-center gap-2 py-3 border border-slate-300 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50"
                  >
                    {oauthLoading === 'google' ? <LoadingSpinner size="sm" /> : <GoogleIcon />}
                    <span className="text-sm font-medium text-slate-700">Google</span>
                  </button>
                  <button
                    onClick={() => handleOAuthSignIn('microsoft')}
                    disabled={!!oauthLoading}
                    className="flex items-center justify-center gap-2 py-3 border border-slate-300 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50"
                  >
                    {oauthLoading === 'microsoft' ? <LoadingSpinner size="sm" /> : <MicrosoftIcon />}
                    <span className="text-sm font-medium text-slate-700">Microsoft</span>
                  </button>
                </div>

                {/* Terms */}
                <p className="mt-6 text-center text-xs text-slate-500">
                  By signing in, you agree to our{' '}
                  <a href="/terms" className="text-indigo-600 hover:underline">Terms of Service</a> and{' '}
                  <a href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</a>
                </p>

                {/* Creator Sign In */}
                <div className="mt-4 pt-4 border-t border-slate-200 text-center">
                  <p className="text-sm text-slate-600">Are you a creator/influencer?</p>
                  <a
                    href="/influencer/signin"
                    className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-medium rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all"
                  >
                    <Star className="w-4 h-4" />
                    Sign in as Creator
                  </a>
                </div>
              </div>
            </div>

            {/* Demo Accounts Panel */}
            <div className="mt-4 bg-white/95 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl">
              <button
                onClick={() => setShowDemoPanel(!showDemoPanel)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Try Demo Accounts</p>
                    <p className="text-xs text-slate-500">Explore different user roles & plans</p>
                  </div>
                </div>
                <ChevronDown className={clsx("w-5 h-5 text-slate-400 transition-transform", showDemoPanel && "rotate-180")} />
              </button>

              {showDemoPanel && (
                <div className="border-t border-slate-100 p-4 space-y-3">
                  {/* Admin Account */}
                  <button
                    onClick={() => fillDemoAccount(DEMO_ACCOUNTS.admin.email, DEMO_ACCOUNTS.admin.password)}
                    className="w-full p-3 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl text-left hover:from-red-100 hover:to-rose-100 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center">
                        <Crown className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-slate-900">{DEMO_ACCOUNTS.admin.label}</p>
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded">{DEMO_ACCOUNTS.admin.badge}</span>
                        </div>
                        <p className="text-xs text-slate-500">{DEMO_ACCOUNTS.admin.email} • Full platform access</p>
                      </div>
                    </div>
                  </button>

                  {/* Agency Account */}
                  <button
                    onClick={() => fillDemoAccount(DEMO_ACCOUNTS.agency.email, DEMO_ACCOUNTS.agency.password)}
                    className="w-full p-3 bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-xl text-left hover:from-purple-100 hover:to-violet-100 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-slate-900">{DEMO_ACCOUNTS.agency.label}</p>
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded">{DEMO_ACCOUNTS.agency.badge}</span>
                        </div>
                        <p className="text-xs text-slate-500">{DEMO_ACCOUNTS.agency.email} • Multi-brand management</p>
                      </div>
                    </div>
                  </button>

                  {/* Brand Accounts by Plan */}
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 px-1">Brand Accounts by Plan</p>
                    <div className="grid grid-cols-2 gap-2">
                      {DEMO_ACCOUNTS.plans.map((plan) => (
                        <button
                          key={plan.email}
                          onClick={() => fillDemoAccount(plan.email, plan.password)}
                          className={clsx(
                            'p-2.5 border rounded-lg text-left transition-colors',
                            plan.color === 'gray' && 'bg-slate-50 border-slate-200 hover:bg-slate-100',
                            plan.color === 'blue' && 'bg-blue-50 border-blue-200 hover:bg-blue-100',
                            plan.color === 'purple' && 'bg-purple-50 border-purple-200 hover:bg-purple-100',
                            plan.color === 'amber' && 'bg-amber-50 border-amber-200 hover:bg-amber-100',
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className={clsx(
                              'w-2 h-2 rounded-full',
                              plan.color === 'gray' && 'bg-slate-400',
                              plan.color === 'blue' && 'bg-blue-500',
                              plan.color === 'purple' && 'bg-purple-500',
                              plan.color === 'amber' && 'bg-amber-500',
                            )} />
                            <span className={clsx(
                              'text-xs font-medium',
                              plan.color === 'gray' && 'text-slate-700',
                              plan.color === 'blue' && 'text-blue-700',
                              plan.color === 'purple' && 'text-purple-700',
                              plan.color === 'amber' && 'text-amber-700',
                            )}>{plan.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
