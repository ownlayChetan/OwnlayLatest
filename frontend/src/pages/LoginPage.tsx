import { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Eye, EyeOff, LogIn, Zap } from 'lucide-react';
import { Alert, LoadingSpinner } from '@/components/common';

// Demo accounts for quick access
const DEMO_ACCOUNTS = [
  { email: 'pro@demo.com', password: 'Demo123!', plan: 'Pro', color: 'purple' },
  { email: 'starter@demo.com', password: 'Demo123!', plan: 'Starter', color: 'gray' },
  { email: 'enterprise@demo.com', password: 'Demo123!', plan: 'Enterprise', color: 'amber' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginTime, setLoginTime] = useState<number | null>(null);
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Clear error on mount
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Get redirect destination
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Performance: Record start time
    const startTime = performance.now();
    
    const success = await login({ email, password });
    
    // Performance: Calculate login time
    const elapsed = performance.now() - startTime;
    setLoginTime(elapsed);
    console.log(`Login completed in ${elapsed.toFixed(2)}ms`);
    
    if (success) {
      // Use replace to prevent back navigation to login
      navigate(from, { replace: true });
    }
  }, [email, password, login, navigate, from]);

  const handleDemoLogin = useCallback((demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 group">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-2xl font-bold text-white">O</span>
            </div>
            <span className="text-3xl font-bold gradient-text">OWNLAY</span>
          </Link>
          <p className="mt-2 text-neutral-500">Sign in to your account</p>
        </div>

        {/* Form */}
        <div className="card p-8">
          {error && (
            <Alert type="error" onClose={clearError} className="mb-6">
              {error}
            </Alert>
          )}

          {/* Performance indicator (dev only) */}
          {loginTime !== null && (
            <div className="mb-4 p-2 bg-green-50 rounded-lg text-center">
              <span className="text-sm text-green-700 flex items-center justify-center gap-1">
                <Zap className="w-4 h-4" />
                Login completed in {loginTime.toFixed(0)}ms
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="label">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign up
              </Link>
            </p>
          </div>

          {/* Demo accounts */}
          <div className="mt-8 pt-6 border-t border-neutral-200">
            <p className="text-xs text-neutral-500 text-center mb-3">Quick Demo Access</p>
            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => handleDemoLogin(account.email, account.password)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all hover:shadow-sm ${
                    email === account.email 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-neutral-200 hover:border-neutral-300 bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full bg-${account.color}-500`} />
                    <span className="text-sm text-neutral-700">{account.email}</span>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                    account.plan === 'Pro' 
                      ? 'bg-purple-100 text-purple-700' 
                      : account.plan === 'Enterprise'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-neutral-200 text-neutral-600'
                  }`}>
                    {account.plan}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-xs text-neutral-400 text-center mt-3">
              Click to fill credentials, then Sign In
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-neutral-500">
          By signing in, you agree to our{' '}
          <a href="/terms" className="text-primary-600 hover:underline">Terms</a>
          {' '}and{' '}
          <a href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}
