import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Eye, EyeOff, UserPlus, Building2, User } from 'lucide-react';
import { Alert, LoadingSpinner } from '@/components/common';
import clsx from 'clsx';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    company: '',
    accountType: 'brand' as 'brand' | 'agency',
  });
  const [showPassword, setShowPassword] = useState(false);
  const { register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await register(formData);
    if (success) {
      navigate('/dashboard');
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <span className="text-2xl font-bold text-white">O</span>
            </div>
            <span className="text-3xl font-bold gradient-text">OWNLAY</span>
          </div>
          <p className="mt-2 text-neutral-500">Create your account</p>
        </div>

        {/* Form */}
        <div className="card p-8">
          {error && (
            <Alert type="error" onClose={clearError} className="mb-6">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Type Selection */}
            <div>
              <label className="label">Account Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => updateField('accountType', 'brand')}
                  className={clsx(
                    'flex flex-col items-center p-4 rounded-lg border-2 transition-all',
                    formData.accountType === 'brand'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  )}
                >
                  <User className={clsx(
                    'w-6 h-6 mb-2',
                    formData.accountType === 'brand' ? 'text-primary-600' : 'text-neutral-400'
                  )} />
                  <span className={clsx(
                    'font-medium',
                    formData.accountType === 'brand' ? 'text-primary-700' : 'text-neutral-600'
                  )}>Brand</span>
                  <span className="text-xs text-neutral-500 mt-1">Single business</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => updateField('accountType', 'agency')}
                  className={clsx(
                    'flex flex-col items-center p-4 rounded-lg border-2 transition-all',
                    formData.accountType === 'agency'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  )}
                >
                  <Building2 className={clsx(
                    'w-6 h-6 mb-2',
                    formData.accountType === 'agency' ? 'text-primary-600' : 'text-neutral-400'
                  )} />
                  <span className={clsx(
                    'font-medium',
                    formData.accountType === 'agency' ? 'text-primary-700' : 'text-neutral-600'
                  )}>Agency</span>
                  <span className="text-xs text-neutral-500 mt-1">Multi-brand</span>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="name" className="label">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="input"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="label">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="input"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="company" className="label">
                {formData.accountType === 'agency' ? 'Agency Name' : 'Company Name'}
              </label>
              <input
                id="company"
                type="text"
                value={formData.company}
                onChange={(e) => updateField('company', e.target.value)}
                className="input"
                placeholder={formData.accountType === 'agency' ? 'My Agency' : 'My Company'}
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
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  className="input pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-neutral-500">
                Minimum 6 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <UserPlus className="w-5 h-5 mr-2" />
              )}
              Create Account
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-500">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
