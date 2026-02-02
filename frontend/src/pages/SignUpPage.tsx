/**
 * SignUpPage - React version of OWNLAY Sign Up
 * Features:
 * - Email/Password registration
 * - Google OAuth signup
 * - Microsoft OAuth signup
 * - Account type selection (Brand/Agency)
 * - Password strength indicator
 * - 7-day free trial messaging
 * - Dark theme matching homepage
 * - Testimonial sidebar
 */

import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Eye, EyeOff, UserPlus, Building2, User, Layers, Shield, Check, 
  Mail, Lock, User2, Briefcase, AlertCircle, Info, Sparkles, Zap
} from 'lucide-react';
import { Alert, LoadingSpinner } from '@/components/common';
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

// Password strength checker
function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500' };
  if (score <= 2) return { score, label: 'Fair', color: 'bg-orange-500' };
  if (score <= 3) return { score, label: 'Good', color: 'bg-yellow-500' };
  if (score <= 4) return { score, label: 'Strong', color: 'bg-emerald-500' };
  return { score, label: 'Very Strong', color: 'bg-green-500' };
}

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

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    company: '',
    accountType: 'brand' as 'brand' | 'agency',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const redirectTo = searchParams.get('redirect');
  const planFromUrl = searchParams.get('plan');
  const currencyFromUrl = searchParams.get('currency');

  // Track mouse for gradient effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const passwordStrength = getPasswordStrength(formData.password);

  // Handle OAuth signup
  const handleOAuthSignUp = useCallback(async (provider: 'google' | 'microsoft') => {
    setOauthLoading(provider);
    setToast({ type: 'info', message: `Connecting to ${provider.charAt(0).toUpperCase() + provider.slice(1)}...` });

    try {
      const response = await fetch('/api/v1/auth/oauth/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, accountType: formData.accountType })
      });
      const data = await response.json();

      if (data.success && data.data) {
        // Store session
        localStorage.setItem('ownlay_token', data.data.access_token);
        localStorage.setItem('ownlay_user', JSON.stringify(data.data.user));
        document.cookie = 'ownlay_auth=true; path=/; max-age=86400; SameSite=Lax';

        setToast({ type: 'success', message: `Signed up with ${provider}! Redirecting...` });

        setTimeout(() => {
          // Handle plan selection if present
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

          // Check plan from URL
          if (planFromUrl) {
            window.location.href = `/?checkout=${planFromUrl}&currency=${currencyFromUrl || 'usd'}`;
            return;
          }

          // Route based on account type
          if (data.data.user.plan === 'none') {
            window.location.href = '/onboarding';
          } else if (formData.accountType === 'agency') {
            window.location.href = '/#pricing?type=agency';
          } else {
            window.location.href = '/onboarding';
          }
        }, 800);
      } else {
        setToast({ type: 'error', message: data.error || 'OAuth sign-up failed' });
      }
    } catch {
      setToast({ type: 'error', message: 'Connection error. Please try again.' });
    } finally {
      setOauthLoading(null);
    }
  }, [formData.accountType, redirectTo, planFromUrl, currencyFromUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          accountType: formData.accountType,
          company: formData.company
        })
      });
      const data = await response.json();

      if (data.success && data.data) {
        // Clear any old session
        localStorage.removeItem('ownlay_token');
        localStorage.removeItem('ownlay_user');
        localStorage.removeItem('ownlay_refresh_token');

        // Store new session
        const token = data.data.access_token || `ownlay_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        const user = data.data.user || {
          id: Date.now().toString(),
          email: formData.email,
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          company: formData.company,
          website: '',
          accountType: formData.accountType,
          plan: 'free',
          subscriptionStatus: 'trial',
          workspace_id: 'default'
        };

        localStorage.setItem('ownlay_token', token);
        localStorage.setItem('ownlay_user', JSON.stringify(user));
        document.cookie = 'ownlay_auth=true; path=/; max-age=86400; SameSite=Lax';

        setToast({ type: 'success', message: 'Account created! Redirecting...' });

        setTimeout(() => {
          // Handle plan selection if present
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

          // Check plan from URL
          if (planFromUrl) {
            window.location.href = `/?checkout=${planFromUrl}&currency=${currencyFromUrl || 'usd'}`;
            return;
          }

          // Route based on account type
          if (formData.accountType === 'agency') {
            window.location.href = '/#pricing?type=agency';
          } else {
            window.location.href = '/onboarding';
          }
        }, 800);
      } else {
        setError(data.error || 'Registration failed. Please try again.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const benefits = [
    { icon: <Zap className="w-4 h-4" />, text: '7-day free trial with full access' },
    { icon: <Check className="w-4 h-4" />, text: 'No credit card required' },
    { icon: <Sparkles className="w-4 h-4" />, text: 'Connect all your ad accounts' },
    { icon: <Shield className="w-4 h-4" />, text: '4 AI agents included' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative">
      {/* Toast notifications */}
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Animated background gradient following mouse */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-30 transition-opacity duration-1000"
        style={{
          background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.15), transparent 40%)`,
        }}
      />

      {/* Fixed background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute w-[600px] h-[600px] -top-48 -left-48 bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute w-[500px] h-[500px] top-1/4 -right-48 bg-violet-600/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute w-[400px] h-[400px] bottom-1/4 left-1/4 bg-cyan-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <a href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl blur-lg opacity-50 group-hover:opacity-80 transition-opacity" />
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg">
                  <Layers className="w-5 h-5 text-white" />
                </div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                OWNLAY
              </span>
            </a>
            <a
              href="/auth/signin"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Already have an account? <span className="text-indigo-400 font-semibold">Sign in</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-12">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Benefits (Desktop) */}
          <div className="hidden lg:block">
            <div className="max-w-md">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="block text-white">Start your</span>
                <span className="block bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                  7-day free trial
                </span>
              </h1>
              <p className="text-xl text-slate-400 mb-8">
                Join 5,000+ marketing teams already scaling their operations with AI-powered automation.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-slate-300">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0 text-indigo-400">
                      {benefit.icon}
                    </div>
                    <span>{benefit.text}</span>
                  </div>
                ))}
              </div>

              {/* Testimonial */}
              <div className="mt-12 p-6 bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-semibold">
                    SC
                  </div>
                  <div>
                    <div className="font-semibold text-white">Sarah Chen</div>
                    <div className="text-sm text-slate-400">CMO, TechStart Inc.</div>
                  </div>
                </div>
                <p className="text-slate-300 italic">
                  "OWNLAY reduced our ad ops time by 90%. We can now focus on strategy instead of manual work."
                </p>
                <div className="flex items-center gap-1 mt-3">
                  {[1,2,3,4,5].map((star) => (
                    <svg key={star} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div>
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-8">
              <h1 className="text-3xl font-bold mb-4">
                <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Start your free trial
                </span>
              </h1>
              <p className="text-slate-400">
                7 days free, no credit card required
              </p>
            </div>

            {/* Form Card */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-purple-500/20 rounded-3xl blur-xl" />
              <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
                
                {/* OAuth Buttons - First */}
                <div className="space-y-3 mb-6">
                  <button
                    onClick={() => handleOAuthSignUp('google')}
                    disabled={!!oauthLoading}
                    className="w-full flex items-center justify-center gap-3 py-3.5 bg-white hover:bg-gray-50 text-slate-800 font-medium rounded-xl transition-all disabled:opacity-50"
                  >
                    {oauthLoading === 'google' ? <LoadingSpinner size="sm" /> : <GoogleIcon />}
                    <span>Continue with Google</span>
                  </button>
                  <button
                    onClick={() => handleOAuthSignUp('microsoft')}
                    disabled={!!oauthLoading}
                    className="w-full flex items-center justify-center gap-3 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl border border-slate-600 transition-all disabled:opacity-50"
                  >
                    {oauthLoading === 'microsoft' ? <LoadingSpinner size="sm" /> : <MicrosoftIcon />}
                    <span>Continue with Microsoft</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 border-t border-slate-700" />
                  <span className="text-sm text-slate-500">or sign up with email</span>
                  <div className="flex-1 border-t border-slate-700" />
                </div>

                {error && (
                  <Alert type="error" onClose={() => setError(null)} className="mb-6">
                    {error}
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Account Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      I'm signing up as a
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => updateField('accountType', 'brand')}
                        className={clsx(
                          'flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-300',
                          formData.accountType === 'brand'
                            ? 'border-indigo-500 bg-indigo-500/10'
                            : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                        )}
                      >
                        <User className={clsx(
                          'w-6 h-6 mb-2 transition-colors',
                          formData.accountType === 'brand' ? 'text-indigo-400' : 'text-slate-500'
                        )} />
                        <span className={clsx(
                          'font-medium transition-colors',
                          formData.accountType === 'brand' ? 'text-white' : 'text-slate-400'
                        )}>Brand</span>
                        <span className="text-xs text-slate-500 mt-1">Single business</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => updateField('accountType', 'agency')}
                        className={clsx(
                          'flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-300',
                          formData.accountType === 'agency'
                            ? 'border-indigo-500 bg-indigo-500/10'
                            : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                        )}
                      >
                        <Building2 className={clsx(
                          'w-6 h-6 mb-2 transition-colors',
                          formData.accountType === 'agency' ? 'text-indigo-400' : 'text-slate-500'
                        )} />
                        <span className={clsx(
                          'font-medium transition-colors',
                          formData.accountType === 'agency' ? 'text-white' : 'text-slate-400'
                        )}>Agency</span>
                        <span className="text-xs text-slate-500 mt-1">Multi-brand</span>
                      </button>
                    </div>
                  </div>

                  {/* Name Fields - Two columns */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-slate-300 mb-2">
                        First Name
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                          <User2 className="w-5 h-5" />
                        </div>
                        <input
                          id="firstName"
                          type="text"
                          required
                          value={formData.firstName}
                          onChange={(e) => updateField('firstName', e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                          placeholder="John"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-slate-300 mb-2">
                        Last Name
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => updateField('lastName', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                      Work Email
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                        <Mail className="w-5 h-5" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                        placeholder="you@company.com"
                      />
                    </div>
                  </div>

                  {/* Company Field */}
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-slate-300 mb-2">
                      {formData.accountType === 'agency' ? 'Agency Name' : 'Company Name'}
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <input
                        id="company"
                        type="text"
                        value={formData.company}
                        onChange={(e) => updateField('company', e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                        placeholder={formData.accountType === 'agency' ? 'My Agency' : 'My Company'}
                      />
                    </div>
                  </div>

                  {/* Password Field with Strength Meter */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                        <Lock className="w-5 h-5" />
                      </div>
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={formData.password}
                        onChange={(e) => updateField('password', e.target.value)}
                        className="w-full pl-12 pr-12 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {/* Password Strength Meter */}
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={clsx(
                                'h-1 flex-1 rounded-full transition-colors',
                                level <= passwordStrength.score ? passwordStrength.color : 'bg-slate-700'
                              )}
                            />
                          ))}
                        </div>
                        <p className={clsx(
                          'text-xs',
                          passwordStrength.score <= 1 ? 'text-red-400' :
                          passwordStrength.score <= 2 ? 'text-orange-400' :
                          passwordStrength.score <= 3 ? 'text-yellow-400' : 'text-emerald-400'
                        )}>
                          {passwordStrength.label}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Terms Checkbox */}
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="w-5 h-5 mt-0.5 text-indigo-600 border-slate-600 rounded bg-slate-800 focus:ring-indigo-500 focus:ring-offset-slate-900"
                    />
                    <span className="text-sm text-slate-400">
                      I agree to the{' '}
                      <a href="/terms" className="text-indigo-400 hover:text-indigo-300 underline">Terms of Service</a>
                      {' '}and{' '}
                      <a href="/privacy" className="text-indigo-400 hover:text-indigo-300 underline">Privacy Policy</a>
                    </span>
                  </label>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading || !agreedToTerms}
                    className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Creating account...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" />
                        <span>Create free account</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Sign In Link */}
                <p className="mt-6 text-center text-sm text-slate-400">
                  Already have an account?{' '}
                  <a href="/auth/signin" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                    Sign in
                  </a>
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500 flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" />
                Protected with enterprise-grade security
              </p>
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
