import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';

// Layout - imported directly (always needed)
import DashboardLayout from '@/components/layout/DashboardLayout';

// Auth Pages - imported directly (small bundle, needed for initial load)
import SignInPage from '@/pages/SignInPage';
import SignUpPage from '@/pages/SignUpPage';

// Marketing Page - imported directly for fast initial load
import HomePage from '@/pages/HomePage';

// Dashboard Pages - lazy loaded for better performance
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const AgentCommandCentrePage = lazy(() => import('@/pages/AgentCommandCentrePage'));
const CampaignsPage = lazy(() => import('@/pages/CampaignsPage'));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'));
const IntegrationsPage = lazy(() => import('@/pages/IntegrationsPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));

// Loading fallback for lazy-loaded pages
function PageLoadingFallback() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-neutral-200 rounded w-48" />
      <div className="h-4 bg-neutral-100 rounded w-32" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-neutral-100 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// Protected Route Component - optimized with memoization
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, checkAuth, isLoading } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    // Only check auth once on mount
    checkAuth();
  }, [checkAuth]);

  // Show nothing while checking (prevents flash)
  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    // Preserve the intended destination - redirect to React signin
    return <Navigate to="/auth/signin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// Public Route Component (redirect to dashboard if authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isAuthenticated) {
    // Redirect to intended destination or SSR dashboard
    const from = location.state?.from?.pathname || '/app/dashboard';
    // Use window.location for SSR routes
    window.location.href = from;
    return null;
  }

  return <>{children}</>;
}

function App() {
  const { checkAuth, user } = useAuthStore();
  const { setSubscriptionFromUser } = useSubscriptionStore();

  // Initialize auth and subscription on app mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Sync subscription when user changes
  useEffect(() => {
    if (user?.plan) {
      setSubscriptionFromUser(user.plan as 'none' | 'starter' | 'growth' | 'pro' | 'enterprise');
    }
  }, [user?.plan, setSubscriptionFromUser]);

  return (
    <Routes>
      {/* Marketing Homepage - Public */}
      <Route path="/" element={<HomePage />} />

      {/* React Auth Routes with /auth prefix */}
      <Route
        path="/auth/signin"
        element={
          <PublicRoute>
            <SignInPage />
          </PublicRoute>
        }
      />
      <Route
        path="/auth/signup"
        element={
          <PublicRoute>
            <SignUpPage />
          </PublicRoute>
        }
      />

      {/* Legacy routes - redirect to new paths */}
      <Route path="/login" element={<Navigate to="/auth/signin" replace />} />
      <Route path="/register" element={<Navigate to="/auth/signup" replace />} />

      {/* Protected Dashboard Routes (React SPA) */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/dashboard"
          element={
            <Suspense fallback={<PageLoadingFallback />}>
              <DashboardPage />
            </Suspense>
          }
        />
        <Route
          path="/agents"
          element={
            <Suspense fallback={<PageLoadingFallback />}>
              <AgentCommandCentrePage />
            </Suspense>
          }
        />
        <Route
          path="/campaigns"
          element={
            <Suspense fallback={<PageLoadingFallback />}>
              <CampaignsPage />
            </Suspense>
          }
        />
        <Route
          path="/analytics"
          element={
            <Suspense fallback={<PageLoadingFallback />}>
              <AnalyticsPage />
            </Suspense>
          }
        />
        <Route
          path="/integrations"
          element={
            <Suspense fallback={<PageLoadingFallback />}>
              <IntegrationsPage />
            </Suspense>
          }
        />
        <Route
          path="/settings"
          element={
            <Suspense fallback={<PageLoadingFallback />}>
              <SettingsPage />
            </Suspense>
          }
        />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
