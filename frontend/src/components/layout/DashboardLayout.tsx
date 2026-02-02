import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { UpgradeModal, ProBadge, SoonBadge, PlanSelectionModal } from '@/components/common';
import {
  LayoutDashboard,
  Cpu,
  Megaphone,
  BarChart3,
  Plug,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Building2,
  Crown,
  Sparkles,
  Zap,
  Users,
  MessageSquare,
  Link2,
  UserCircle,
  Palette,
} from 'lucide-react';
import clsx from 'clsx';

// Navigation items with feature requirements and plan gating
// Free: 7-day full access (all features)
// Starter: Dashboard + Ad Manager ONLY
// Growth: Starter + Campaign Builder + Creative Studio ONLY  
// Pro: Growth + Agent Command Centre + Advanced Analytics
// Integrations: All plans (including free)
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, minPlan: 'free' },
  { name: 'Agent Command Centre', href: '/agents', icon: Cpu, minPlan: 'pro', badge: 'PRO' },
  { name: 'Campaigns', href: '/campaigns', icon: Megaphone, minPlan: 'growth', badge: 'Growth+' },
  { name: 'Creative Studio', href: '/creative', icon: Palette, minPlan: 'growth', badge: 'Growth+', comingSoon: true },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, minPlan: 'pro', badge: 'PRO' },
  { name: 'Automation', href: '/automation', icon: Zap, comingSoon: true }, // SOON for all users
  { name: 'Audience & CRM', href: '/audience', icon: Users, comingSoon: true }, // SOON for all users
  { name: 'Influencers', href: '/influencers', icon: UserCircle, comingSoon: true },
  { name: 'Connections', href: '/connections', icon: Link2, comingSoon: true },
  { name: 'Messages', href: '/messages', icon: MessageSquare, comingSoon: true },
  { name: 'Integrations', href: '/integrations', icon: Plug, minPlan: 'free' }, // All plans including free
  { name: 'Settings', href: '/settings', icon: Settings, minPlan: 'free' }, // All plans including free
];

const PLAN_HIERARCHY: Record<string, number> = {
  'none': 0,
  'free': 3, // Free 7-day plan has Pro-level access (full features)
  'starter': 1,
  'growth': 2,
  'pro': 3,
  'enterprise': 4,
};

// Lightweight loading skeleton for route transitions
function RouteLoadingFallback() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-neutral-200 rounded w-48" />
      <div className="h-4 bg-neutral-100 rounded w-32" />
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-neutral-100 rounded-xl" />
        ))}
      </div>
      <div className="h-64 bg-neutral-100 rounded-xl" />
    </div>
  );
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<'agents' | 'analytics' | 'general'>('general');
  
  const { user, logout } = useAuthStore();
  const { 
    subscription, 
    isPro, 
    isTrialExpired,
    getDaysLeftInTrial,
    setSubscriptionFromUser, 
    getPlanDisplayName,
    showPlanSelectionModal,
    setShowPlanSelectionModal,
    checkTrialStatus,
  } = useSubscriptionStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize subscription from user on mount
  useEffect(() => {
    if (user) {
      setSubscriptionFromUser(
        user.plan as any, 
        user.trialEndsAt,
        user.accountType
      );
    }
  }, [user?.plan, user?.trialEndsAt, user?.accountType, setSubscriptionFromUser]);

  // Check trial status periodically
  useEffect(() => {
    checkTrialStatus();
    const interval = setInterval(checkTrialStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [checkTrialStatus]);

  // Memoize plan checks
  const isProUser = useMemo(() => isPro(), [subscription]);
  const trialExpired = useMemo(() => isTrialExpired(), [subscription]);
  const daysLeft = useMemo(() => getDaysLeftInTrial(), [subscription]);
  const currentPlan = subscription?.plan || 'none';
  const isTrial = subscription?.isTrial;
  const isAgencyUser = user?.accountType === 'agency';

  // Check if user can access a nav item based on plan
  const canAccessNavItem = useCallback((item: typeof navigation[0]) => {
    if (item.comingSoon) return false;
    if (!item.minPlan) return true;
    
    const currentLevel = PLAN_HIERARCHY[currentPlan] || 0;
    const requiredLevel = PLAN_HIERARCHY[item.minPlan] || 0;
    
    return currentLevel >= requiredLevel;
  }, [currentPlan]);

  // Handle navigation with plan gating
  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, item: typeof navigation[0]) => {
    if (item.comingSoon) {
      e.preventDefault();
      return;
    }

    if (!canAccessNavItem(item)) {
      e.preventDefault();
      if (item.minPlan === 'pro') {
        setUpgradeFeature(item.href === '/agents' ? 'agents' : 'analytics');
      } else {
        setUpgradeFeature('general');
      }
      setUpgradeModalOpen(true);
      return;
    }
    
    setSidebarOpen(false);
  }, [canAccessNavItem]);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  // Memoize user display info
  const userDisplayInfo = useMemo(() => ({
    initials: user?.name?.charAt(0) || 'U',
    name: user?.name || 'User',
    email: user?.email || '',
    company: user?.company || 'My Workspace',
    plan: getPlanDisplayName(),
  }), [user, getPlanDisplayName]);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Plan Selection Modal for expired trials */}
      <PlanSelectionModal
        isOpen={showPlanSelectionModal || trialExpired}
        onClose={() => setShowPlanSelectionModal(false)}
        isTrialExpired={trialExpired}
        isAgencyUser={isAgencyUser}
      />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-neutral-200 transform transition-transform duration-200 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-200">
            <NavLink to="/dashboard" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="text-white font-bold">O</span>
              </div>
              <span className="text-xl font-bold gradient-text">OWNLAY</span>
            </NavLink>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Plan Banner */}
          {isTrial && !trialExpired && daysLeft > 0 && (
            <div className="mx-4 mt-4 p-3 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
              <div className="flex items-center gap-2 text-emerald-700">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Free Plan • {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                </span>
              </div>
              <button
                onClick={() => setShowPlanSelectionModal(true)}
                className="mt-2 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Choose a plan →
              </button>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isComingSoon = item.comingSoon;
              const canAccess = canAccessNavItem(item);
              const isActive = location.pathname === item.href;
              
              // Coming soon items
              if (isComingSoon) {
                return (
                  <div
                    key={item.name}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-400 cursor-not-allowed"
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5 text-neutral-300" />
                      <span>{item.name}</span>
                    </div>
                    <SoonBadge size="sm" showIcon={false} />
                  </div>
                );
              }
              
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={(e) => handleNavClick(e, item)}
                  className={clsx(
                    'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : !canAccess
                      ? 'text-neutral-400 hover:bg-neutral-50 cursor-pointer'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className={clsx(
                      'w-5 h-5 transition-colors',
                      isActive ? 'text-primary-600' : !canAccess ? 'text-neutral-300' : ''
                    )} />
                    <span>{item.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {item.badge === 'PRO' && (
                      <ProBadge 
                        size="sm" 
                        variant={!canAccess ? 'warning' : 'primary'}
                        showIcon={!canAccess}
                      />
                    )}
                    {item.badge === 'Growth+' && !canAccess && (
                      <span className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded font-medium">
                        Growth+
                      </span>
                    )}
                  </div>
                </NavLink>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-neutral-200">
            {/* PRO badge / Upgrade prompt */}
            {isProUser ? (
              <div className={clsx(
                "mb-4 p-3 rounded-lg bg-gradient-to-r",
                isTrial ? "from-emerald-500 to-teal-500" : "from-primary-500 to-primary-600"
              )}>
                <div className="flex items-center space-x-2">
                  {isTrial ? (
                    <Sparkles className="w-5 h-5 text-white" />
                  ) : (
                    <Crown className="w-5 h-5 text-yellow-300" />
                  )}
                  <span className="text-white font-medium">
                    {isTrial ? 'Free Plan Active' : 'PRO Access Active'}
                  </span>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setUpgradeFeature('general');
                  setUpgradeModalOpen(true);
                }}
                className="mb-4 w-full p-3 rounded-lg bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-200 hover:from-amber-200 hover:to-yellow-200 transition-colors group"
              >
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-amber-600 group-hover:scale-110 transition-transform" />
                  <span className="text-amber-800 font-medium text-sm">Upgrade Plan</span>
                </div>
                <p className="text-xs text-amber-600 mt-1 text-left">Unlock more features</p>
              </button>
            )}

            {/* Organization */}
            <div className="flex items-center space-x-3 p-2 rounded-lg bg-neutral-50 mb-3">
              <div className="w-8 h-8 rounded-lg bg-neutral-200 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-neutral-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">
                  {userDisplayInfo.company}
                </p>
                <p className="text-xs text-neutral-500 truncate">
                  {userDisplayInfo.plan} {isTrial && '(Trial)'}
                </p>
              </div>
            </div>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-700">
                    {userDisplayInfo.initials}
                  </span>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-neutral-900 truncate">
                    {userDisplayInfo.name}
                  </p>
                  <p className="text-xs text-neutral-500 truncate">
                    {userDisplayInfo.email}
                  </p>
                </div>
                <ChevronDown
                  className={clsx(
                    'w-4 h-4 text-neutral-400 transition-transform',
                    userMenuOpen && 'rotate-180'
                  )}
                />
              </button>

              {userMenuOpen && (
                <div className="absolute bottom-full left-0 w-full mb-2 bg-white border border-neutral-200 rounded-lg shadow-lg overflow-hidden">
                  <NavLink
                    to="/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-neutral-200">
          <div className="flex items-center justify-between h-full px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex-1" />

            <div className="flex items-center space-x-4">
              {/* Current plan indicator in header */}
              <div className="hidden sm:flex items-center gap-2">
                {isProUser ? (
                  <div className={clsx(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                    isTrial ? "bg-emerald-50" : "bg-primary-50"
                  )}>
                    {isTrial ? (
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Crown className="w-4 h-4 text-primary-600" />
                    )}
                    <span className={clsx(
                      "text-sm font-medium",
                      isTrial ? "text-emerald-700" : "text-primary-700"
                    )}>
                      {isTrial ? 'Free' : 'Pro'}
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setUpgradeFeature('general');
                      setUpgradeModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 rounded-full transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-700">Upgrade</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content with Suspense for route transitions */}
        <main className="p-6">
          <Suspense fallback={<RouteLoadingFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        feature={upgradeFeature}
        currentPlan={subscription?.plan}
      />
    </div>
  );
}
