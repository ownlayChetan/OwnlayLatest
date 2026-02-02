import { useState, useEffect, useRef } from 'react';
// No react-router-dom needed - all navigation is via regular anchor tags
import {
  LayoutGrid,
  Target,
  Megaphone,
  Brain,
  ArrowRight,
  PlayCircle,
  Check,
  Clock,
  Star,
  Shield,
  ChevronRight,
  Users,
  DollarSign,
  TrendingUp,
  Server,
  Menu,
  X,
  Bot,
  Layers,
  LineChart,
  Workflow,
  CircuitBoard,
  Gauge,
  Wand2,
} from 'lucide-react';
import clsx from 'clsx';

// Feature data - Powerful capabilities
const features = [
  {
    id: 'dashboard',
    icon: LayoutGrid,
    gradient: 'from-indigo-500 to-violet-500',
    title: 'Unified Dashboard',
    description: 'Real-time metrics from every channel, unified under a single source of truth.',
    stats: '10+ Channels',
    link: '/app/dashboard',
  },
  {
    id: 'campaigns',
    icon: Target,
    gradient: 'from-violet-500 to-purple-500',
    title: 'Campaign Builder',
    description: 'Visual funnel canvas with drag-and-drop simplicity for multi-touch campaigns.',
    stats: '50+ Templates',
    link: '/app/campaigns',
  },
  {
    id: 'ads',
    icon: Megaphone,
    gradient: 'from-cyan-500 to-blue-500',
    title: 'Ad Manager',
    description: 'Manage Google, Meta, TikTok, and LinkedIn ads from one interface.',
    stats: '4 Platforms',
    link: '/app/campaigns',
  },
  {
    id: 'automation',
    icon: Workflow,
    gradient: 'from-slate-400 to-slate-500',
    title: 'Automation',
    description: 'Build intelligent automation sequences with event-driven triggers.',
    stats: '100+ Triggers',
    comingSoon: true,
  },
  {
    id: 'agents',
    icon: Bot,
    gradient: 'from-emerald-500 to-cyan-500',
    title: 'AI Agents',
    description: '4 autonomous agents that research, strategize, create, and audit campaigns.',
    stats: 'GPT-4 Powered',
    link: '/app/insights',
  },
  {
    id: 'analytics',
    icon: LineChart,
    gradient: 'from-blue-500 to-indigo-500',
    title: 'Advanced Analytics',
    description: 'Deep-dive into performance with custom reports and attribution models.',
    stats: '30+ Metrics',
    link: '/app/analytics',
  },
];

// Integration partners
const integrations = [
  { name: 'Google Ads', icon: 'G', color: '#4285f4' },
  { name: 'Meta Ads', icon: 'M', color: '#1877f2' },
  { name: 'TikTok', icon: 'T', color: '#ff0050' },
  { name: 'LinkedIn', icon: 'in', color: '#0a66c2' },
  { name: 'Shopify', icon: 'S', color: '#96bf48' },
  { name: 'Klaviyo', icon: 'K', color: '#2b2b2b' },
  { name: 'HubSpot', icon: 'H', color: '#ff7a59' },
  { name: 'Stripe', icon: '$', color: '#635bff' },
];

// Pricing configurations for different currencies
const pricingConfig = {
  USD: {
    symbol: '$',
    free: { price: '0', period: '/7 days' },
    starter: { price: '29', period: '/mo' },
    growth: { price: '79', period: '/mo' },
    pro: { price: '149', period: '/mo' },
  },
  INR: {
    symbol: '₹',
    free: { price: '0', period: '/7 days' },
    starter: { price: '2,999', period: '/mo' },
    growth: { price: '9,999', period: '/mo' },
    pro: { price: '29,999', period: '/mo' },
  },
};

// Function to detect user's currency based on timezone/locale
function detectUserCurrency(): 'USD' | 'INR' {
  try {
    // Check timezone first
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone && (timezone.includes('Kolkata') || timezone.includes('Asia/Calcutta'))) {
      return 'INR';
    }
    
    // Check locale
    const locale = navigator.language || (navigator as any).userLanguage;
    if (locale && (locale.startsWith('hi') || locale.includes('IN'))) {
      return 'INR';
    }
    
    // Default to USD
    return 'USD';
  } catch {
    return 'USD';
  }
}

// Function to get pricing tiers with dynamic currency
function getPricingTiers(currency: 'USD' | 'INR') {
  const config = pricingConfig[currency];
  const symbol = config.symbol;
  
  return [
    {
      name: 'Free',
      price: `${symbol}${config.free.price}`,
      period: config.free.period,
      description: 'Full access trial, no credit card',
      features: [
        'All features for 7 days',
        'Dashboard + Ad Manager',
        'Campaign Builder',
        'Agent Command Centre',
        'All Integrations',
      ],
      cta: 'Start Free',
      planId: 'free',
      isFree: true,
    },
    {
      name: 'Starter',
      price: `${symbol}${config.starter.price}`,
      period: config.starter.period,
      description: 'For small teams',
      features: [
        'Up to 2 users',
        'Dashboard + Ad Manager',
        'Basic integrations',
        '30-day retention',
      ],
      cta: 'Get Started',
      planId: 'starter',
    },
    {
      name: 'Growth',
      price: `${symbol}${config.growth.price}`,
      period: config.growth.period,
      description: 'For scaling teams',
      features: [
        'Up to 5 users',
        'Everything in Starter',
        'Campaign Builder',
        'Creative Studio',
        '90-day retention',
      ],
      cta: 'Get Started',
      planId: 'growth',
      popular: true,
    },
    {
      name: 'Pro',
      price: `${symbol}${config.pro.price}`,
      period: config.pro.period,
      description: 'For agencies',
      features: [
        'Up to 10 users',
        'Everything in Growth',
        'Agent Command Centre',
        'Advanced Analytics',
        'API access',
      ],
      cta: 'Get Started',
      planId: 'pro',
    },
  ];
}

// Stats for social proof
const stats = [
  { value: '5,000+', label: 'Marketing Teams', icon: Users },
  { value: '$2.4B', label: 'Ad Spend Managed', icon: DollarSign },
  { value: '4.2x', label: 'Average ROAS', icon: TrendingUp },
  { value: '99.9%', label: 'Uptime SLA', icon: Server },
];

// Testimonials
const testimonials = [
  {
    quote: "OWNLAY reduced our ad ops time by 90%. We can now focus on strategy instead of manual work.",
    author: "Sarah Chen",
    role: "CMO, TechStart Inc.",
    avatar: "SC",
  },
  {
    quote: "The AI agents are game-changing. Our ROAS improved 42% in the first month.",
    author: "Michael Ross",
    role: "Growth Lead, ScaleUp",
    avatar: "MR",
  },
  {
    quote: "Finally, a platform that unifies all our channels. No more spreadsheet chaos.",
    author: "Emma Davis",
    role: "Marketing Director, GlobalBrand",
    avatar: "ED",
  },
];

// Scroll reveal hook
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

// Animated Feature Card
function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = feature.icon;
  const { ref, isVisible } = useScrollReveal();

  return (
    <div
      ref={ref}
      className={clsx(
        'group relative overflow-hidden rounded-2xl',
        'bg-gradient-to-br from-slate-800/80 to-slate-900/80',
        'border border-slate-700/50 backdrop-blur-xl',
        'transition-all duration-700 ease-out',
        'hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/20',
        'cursor-pointer transform',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10',
        feature.comingSoon && 'opacity-60'
      )}
      style={{ transitionDelay: `${index * 100}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => feature.link && !feature.comingSoon && (window.location.href = feature.link)}
    >
      {/* Animated gradient border */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.1), transparent)',
        }}
      />

      <div className="relative p-6 lg:p-8">
        {/* Icon */}
        <div
          className={clsx(
            'w-14 h-14 rounded-xl flex items-center justify-center mb-5',
            'bg-gradient-to-br transition-all duration-500',
            feature.gradient,
            'group-hover:scale-110 group-hover:rotate-3',
            'shadow-lg'
          )}
          style={{
            boxShadow: isHovered ? '0 15px 40px -15px rgba(99, 102, 241, 0.4)' : '0 5px 20px -10px rgba(0,0,0,0.3)',
          }}
        >
          <Icon className="w-7 h-7 text-white" />
        </div>

        {/* Coming Soon Badge */}
        {feature.comingSoon && (
          <div className="absolute top-4 right-4 px-3 py-1 bg-slate-700/80 text-slate-300 text-xs font-medium rounded-full flex items-center gap-1.5 border border-slate-600">
            <Clock className="w-3 h-3" />
            SOON
          </div>
        )}

        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors duration-500">
          {feature.title}
        </h3>

        {/* Description */}
        <p className="text-slate-400 mb-5 leading-relaxed text-sm">
          {feature.description}
        </p>

        {/* Stats & CTA */}
        <div className="flex items-center justify-between">
          <span className="px-3 py-1.5 bg-slate-700/50 text-slate-300 text-sm font-medium rounded-lg border border-slate-600/50">
            {feature.stats}
          </span>
          {feature.link && !feature.comingSoon && (
            <span 
              className={clsx(
                'text-sm font-medium flex items-center gap-1 text-indigo-400',
                'transition-all duration-500',
                isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
              )}
            >
              Explore <ChevronRight className="w-4 h-4" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Type for pricing tier
type PricingTier = ReturnType<typeof getPricingTiers>[0];

// Pricing Card Component
function PricingCard({ tier, index }: { tier: PricingTier; index: number }) {
  const { ref, isVisible } = useScrollReveal();
  const isFree = (tier as any).isFree;
  const isPopular = tier.popular;

  return (
    <div
      ref={ref}
      className={clsx(
        'relative rounded-2xl p-6 lg:p-8',
        'transition-all duration-700 ease-out',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10',
        isPopular
          ? 'bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 text-white shadow-2xl shadow-indigo-500/30 scale-105 z-10 border-2 border-indigo-400/50'
          : isFree
          ? 'bg-gradient-to-br from-emerald-900/30 to-cyan-900/30 border-2 border-emerald-500/40 hover:border-emerald-400'
          : 'bg-slate-800/50 border border-slate-700/50 hover:border-indigo-500/50',
        'hover:-translate-y-2 hover:shadow-xl backdrop-blur-lg'
      )}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-900 text-xs font-bold rounded-full shadow-lg">
          ✨ MOST POPULAR
        </div>
      )}
      
      {isFree && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-900 text-xs font-bold rounded-full shadow-lg">
          🎉 TRY FREE
        </div>
      )}

      <h3 className={clsx('text-xl font-bold mb-2', isPopular ? 'text-white' : isFree ? 'text-emerald-300' : 'text-white')}>
        {tier.name}
      </h3>
      
      <div className="flex items-baseline gap-1 mb-4">
        <span className={clsx('text-4xl font-bold', isPopular ? 'text-white' : isFree ? 'text-emerald-400' : 'text-white')}>
          {tier.price}
        </span>
        <span className={clsx('text-lg', isPopular ? 'text-white/70' : 'text-slate-400')}>
          {tier.period}
        </span>
      </div>

      <p className={clsx('text-sm mb-6', isPopular ? 'text-white/70' : 'text-slate-400')}>
        {tier.description}
      </p>

      <ul className="space-y-3 mb-8">
        {tier.features.map((feature: string, idx: number) => (
          <li
            key={idx}
            className={clsx('flex items-center gap-2 text-sm', isPopular ? 'text-white/90' : 'text-slate-300')}
          >
            <Check className={clsx('w-4 h-4 flex-shrink-0', isPopular ? 'text-amber-300' : isFree ? 'text-emerald-400' : 'text-indigo-400')} />
            {feature}
          </li>
        ))}
      </ul>

      <a
        href="/auth/signup"
        className={clsx(
          'w-full py-3 px-6 rounded-xl font-semibold transition-all duration-500',
          isPopular
            ? 'bg-white text-indigo-700 hover:bg-indigo-50 shadow-lg hover:shadow-xl'
            : isFree
            ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-400 hover:to-cyan-400 shadow-lg hover:shadow-emerald-500/30'
            : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500 shadow-lg hover:shadow-indigo-500/30'
        )}
      >
        {tier.cta} <ArrowRight className="w-4 h-4 inline ml-1" />
      </a>
    </div>
  );
}

// Main HomePage Component
export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');
  const [pricingTiers, setPricingTiers] = useState(getPricingTiers('USD'));

  // Check for existing auth - use state to avoid SSR issues
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    // Check auth state on mount
    const token = localStorage.getItem('ownlay_token');
    const user = localStorage.getItem('ownlay_user');
    setIsLoggedIn(!!(token && user));
    
    // Detect user currency
    const detectedCurrency = detectUserCurrency();
    setCurrency(detectedCurrency);
    setPricingTiers(getPricingTiers(detectedCurrency));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track mouse for gradient effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Animated background gradient following mouse */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-30 transition-opacity duration-1000"
        style={{
          background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.15), transparent 40%)`,
        }}
      />

      {/* Fixed background elements */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Animated orbs */}
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
      <nav
        className={clsx(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          scrolled 
            ? 'bg-slate-950/80 backdrop-blur-xl shadow-lg shadow-black/20 border-b border-slate-800/50' 
            : 'bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
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

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-1">
              {['Features', 'Integrations', 'Pricing', 'Docs', 'API'].map((item) => (
                <a
                  key={item}
                  href={item === 'Docs' || item === 'API' ? `/${item.toLowerCase()}` : `#${item.toLowerCase()}`}
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300"
                >
                  {item}
                </a>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              {isLoggedIn ? (
                <a
                  href="/app/dashboard"
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-300"
                >
                  Dashboard
                </a>
              ) : (
                <>
                  <a
                    href="/auth/signin"
                    className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors duration-300"
                  >
                    Sign In
                  </a>
                  <a
                    href="/auth/signup"
                    className="group relative px-6 py-2.5 font-semibold rounded-xl text-white overflow-hidden transition-all duration-500"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 transition-all duration-500 group-hover:from-indigo-500 group-hover:to-violet-500" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-indigo-400 to-violet-400 blur-xl" />
                    <span className="relative">Start Free</span>
                  </a>
                </>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-slate-300 hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 px-4 py-4 space-y-2">
            {['Features', 'Integrations', 'Pricing', 'Docs'].map((item) => (
              <a
                key={item}
                href={item === 'Docs' ? '/docs' : `#${item.toLowerCase()}`}
                className="block px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-28 pb-16 lg:pt-40 lg:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Animated Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full text-sm mb-8 border border-white/10 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-300">Turn complexity into clarity with AI</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </div>

            {/* Main headline with gradient */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-[1.1] tracking-tight">
              <span className="block text-white">The Marketing</span>
              <span className="block bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                Operating System
              </span>
            </h1>

            {/* Value proposition */}
            <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
              One platform with <span className="text-indigo-400 font-semibold">AI agents</span> to connect, analyze, and scale your entire marketing stack.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <a
                href="/auth/signup"
                className="group relative w-full sm:w-auto px-8 py-4 font-semibold rounded-2xl text-lg overflow-hidden transition-all duration-500 transform hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 bg-gradient-to-r from-indigo-500 to-violet-500" />
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-violet-600 blur-xl opacity-50 group-hover:opacity-80 transition-opacity" />
                <span className="relative flex items-center justify-center gap-2 text-white">
                  Start Free Trial <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </a>
              <a
                href="#demo"
                className="w-full sm:w-auto px-8 py-4 bg-white/5 backdrop-blur-sm hover:bg-white/10 text-white font-semibold rounded-2xl text-lg flex items-center justify-center gap-2 border border-white/10 hover:border-white/20 transition-all duration-500"
              >
                <PlayCircle className="w-5 h-5" /> Watch Demo
              </a>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" /> No credit card required
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" /> 7-day free trial
              </span>
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-violet-400" /> SOC 2 Compliant
              </span>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="max-w-6xl mx-auto mt-20">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-purple-500/20 rounded-3xl blur-2xl" />
              
              {/* Dashboard mockup */}
              <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 border-b border-slate-700/50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-4 py-1 bg-slate-700/50 rounded-lg text-xs text-slate-400 flex items-center gap-2">
                      <Shield className="w-3 h-3" />
                      app.ownlay.com/dashboard
                    </div>
                  </div>
                </div>
                
                {/* Dashboard content */}
                <div className="p-6 md:p-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                      { label: 'Total Spend', value: '$45,230', change: '+12%', positive: true },
                      { label: 'Revenue', value: '$182,450', change: '+24%', positive: true },
                      { label: 'ROAS', value: '4.03x', change: '+8%', positive: true },
                      { label: 'Conversions', value: '1,847', change: '+15%', positive: true },
                    ].map((metric, idx) => (
                      <div key={idx} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                        <div className="text-slate-400 text-sm mb-1">{metric.label}</div>
                        <div className="text-2xl font-bold text-white">{metric.value}</div>
                        <div className={clsx('text-xs font-medium mt-1', metric.positive ? 'text-emerald-400' : 'text-red-400')}>
                          {metric.change}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="h-48 bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-purple-500/10 rounded-xl border border-indigo-500/20 flex items-center justify-center">
                    <span className="text-slate-500 flex items-center gap-2">
                      <LineChart className="w-5 h-5" /> Real-time Performance Chart
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/30 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="text-center group">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-indigo-500/10 text-indigo-400 mb-4 group-hover:bg-indigo-500/20 group-hover:scale-110 transition-all duration-500">
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-400 text-sm font-medium rounded-full mb-4 border border-indigo-500/20">
              <CircuitBoard className="w-4 h-4" /> Powerful Capabilities
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Everything you need to{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                dominate marketing
              </span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              From unified dashboards to autonomous AI agents, we've built the complete toolkit for modern marketing operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <FeatureCard key={feature.id} feature={feature} index={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* AI Agents Showcase */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-indigo-950/20 to-slate-950" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 text-violet-400 text-sm font-medium rounded-full mb-6 border border-violet-500/20">
                <Bot className="w-4 h-4" /> Autonomous AI Agents
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                AI agents working
                <span className="block bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                  24/7 for you
                </span>
              </h2>
              <p className="text-lg text-slate-400 mb-8">
                Our autonomous agents handle research, strategy, creative, and auditing—so your team can focus on what matters most.
              </p>
              
              <div className="space-y-4">
                {[
                  { icon: Brain, title: 'Researcher', desc: 'Analyzes market trends and competitors', color: 'from-cyan-500 to-blue-500' },
                  { icon: Target, title: 'Strategist', desc: 'Optimizes budgets and targeting', color: 'from-violet-500 to-purple-500' },
                  { icon: Wand2, title: 'Creative', desc: 'Generates ad copy and visuals', color: 'from-pink-500 to-rose-500' },
                  { icon: Gauge, title: 'Auditor', desc: 'Monitors performance and flags issues', color: 'from-amber-500 to-orange-500' },
                ].map((agent, idx) => {
                  const Icon = agent.icon;
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-indigo-500/50 transition-all duration-500 group"
                    >
                      <div className={clsx('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center', agent.color, 'group-hover:scale-110 transition-transform')}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{agent.title} Agent</h4>
                        <p className="text-sm text-slate-400">{agent.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <a
                href="/app/insights"
                className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-500"
              >
                Explore Agent Command Centre <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-3xl blur-3xl" />
              <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Agent Command Centre</div>
                    <div className="text-sm text-slate-400">PRO Feature</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {[
                    { status: 'active', text: 'Researcher analyzing Q1 trends...' },
                    { status: 'complete', text: 'Strategist optimized budget allocation' },
                    { status: 'active', text: 'Creative generating ad variations...' },
                    { status: 'pending', text: 'Auditor scheduled for 6:00 PM' },
                  ].map((activity, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                      <div className={clsx(
                        'w-2 h-2 rounded-full',
                        activity.status === 'active' ? 'bg-emerald-400 animate-pulse' :
                        activity.status === 'complete' ? 'bg-blue-400' : 'bg-slate-500'
                      )} />
                      <span className="text-sm text-slate-300">{activity.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section id="integrations" className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 text-cyan-400 text-sm font-medium rounded-full mb-4 border border-cyan-500/20">
              <Layers className="w-4 h-4" /> Seamless Integrations
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Connect your entire stack
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Integrate with 30+ platforms in minutes. No coding required.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {integrations.map((integration, idx) => (
              <div
                key={idx}
                className="group relative bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 hover:border-indigo-500/50 transition-all duration-500 hover:-translate-y-2 cursor-pointer"
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-4 mx-auto transition-all duration-500 group-hover:scale-110 group-hover:rotate-6"
                  style={{ backgroundColor: integration.color }}
                >
                  {integration.icon}
                </div>
                <p className="text-sm font-medium text-slate-300 text-center group-hover:text-white transition-colors">
                  {integration.name}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a
              href="/app/integrations"
              className="inline-flex items-center gap-2 text-indigo-400 font-medium hover:text-indigo-300 transition-colors duration-300"
            >
              View all 30+ integrations <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-violet-950/20 to-slate-950" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 text-sm font-medium rounded-full mb-4 border border-emerald-500/20">
              <Star className="w-4 h-4" /> Customer Stories
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Loved by marketing teams
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50 hover:border-indigo-500/30 transition-all duration-500"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-semibold text-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.author}</div>
                    <div className="text-sm text-slate-400">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-400 text-sm font-medium rounded-full mb-4 border border-indigo-500/20">
              <DollarSign className="w-4 h-4" /> Simple Pricing
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Plans that grow with you
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-6">
              Start free, upgrade when ready. No hidden fees.
            </p>
            {/* Currency Toggle */}
            <div className="inline-flex items-center gap-2 p-1 bg-slate-800/50 rounded-lg border border-slate-700">
              <button
                onClick={() => { setCurrency('USD'); setPricingTiers(getPricingTiers('USD')); }}
                className={clsx(
                  'px-4 py-2 rounded-md text-sm font-medium transition-all duration-300',
                  currency === 'USD' 
                    ? 'bg-indigo-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-white'
                )}
              >
                $ USD
              </button>
              <button
                onClick={() => { setCurrency('INR'); setPricingTiers(getPricingTiers('INR')); }}
                className={clsx(
                  'px-4 py-2 rounded-md text-sm font-medium transition-all duration-300',
                  currency === 'INR' 
                    ? 'bg-indigo-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-white'
                )}
              >
                ₹ INR
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
            {pricingTiers.map((tier, idx) => (
              <PricingCard key={tier.name} tier={tier} index={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 via-violet-900/50 to-purple-900/50" />
        <div className="absolute inset-0">
          <div className="absolute w-[500px] h-[500px] top-0 left-1/4 bg-indigo-500/20 rounded-full blur-[120px]" />
          <div className="absolute w-[500px] h-[500px] bottom-0 right-1/4 bg-violet-500/20 rounded-full blur-[120px]" />
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Ready to transform your marketing?
          </h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Join OWNLAY to unify, automate, and scale their operations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/auth/signup"
              className="w-full sm:w-auto px-8 py-4 bg-white text-indigo-700 font-semibold rounded-2xl text-lg shadow-lg hover:bg-indigo-50 transition-all duration-300 transform hover:-translate-y-1"
            >
              Start Free Trial <ArrowRight className="w-5 h-5 inline ml-1" />
            </a>
            <a
              href="/docs"
              className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-2xl text-lg border border-white/20 hover:bg-white/20 transition-all"
            >
              Read Documentation
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
                  <Layers className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white">OWNLAY</span>
              </div>
              <p className="text-sm text-slate-400">The Marketing Operating System for modern growth teams.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#features" className="hover:text-indigo-400 transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-indigo-400 transition-colors">Pricing</a></li>
                <li><a href="#integrations" className="hover:text-indigo-400 transition-colors">Integrations</a></li>
                <li><a href="/docs" className="hover:text-indigo-400 transition-colors">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="/about" className="hover:text-indigo-400 transition-colors">About</a></li>
                <li><a href="/blog" className="hover:text-indigo-400 transition-colors">Blog</a></li>
                <li><a href="/careers" className="hover:text-indigo-400 transition-colors">Careers</a></li>
                <li><a href="/contact" className="hover:text-indigo-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="/privacy" className="hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-indigo-400 transition-colors">Terms of Service</a></li>
                <li><a href="/security" className="hover:text-indigo-400 transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-400">&copy; {new Date().getFullYear()} OWNLAY. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* CSS for animations */}
      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
