# OWNLAY — The Marketing Operating System

## Project Overview
- **Name**: OWNLAY
- **Version**: 7.9.0
- **Goal**: End-to-end B2B SaaS platform for unified marketing management, campaign automation, AI-powered optimization, and enterprise-grade multi-tenant agentic autonomous marketing
- **Tech Stack**: 
  - **Backend**: Hono + TypeScript + Cloudflare Workers
  - **Frontend**: React.js + TypeScript + TailwindCSS
  - **Databases**: 
    - **D1 (SQLite)**: Authentication/Registration ONLY
    - **PostgreSQL (via Hyperdrive)**: ALL business data
  - **AI**: Cloudflare Workers AI (Llama 3.3 70B)
- **Architecture**: Multi-tenant with agency hierarchies and autonomous AI agents
- **Design**: Modern, enterprise-ready, tech-forward with Indigo/Violet gradient palette

## Live URLs

### Production
- **Website**: https://ownlay-marketing-os.pages.dev (or https://ownlay.com)
- **Dashboard**: https://ownlay-marketing-os.pages.dev/app/dashboard (requires login)
- **Sign In**: https://ownlay-marketing-os.pages.dev/auth/signin
- **Sign Up**: https://ownlay-marketing-os.pages.dev/auth/signup
- **API Docs**: https://ownlay-marketing-os.pages.dev/docs/api
- **Agent API**: https://ownlay-marketing-os.pages.dev/api/v1/agents

### Development Sandbox
- **Preview URL**: https://3000-iqbwt0prche14oh20s1tm-02b9cc79.sandbox.novita.ai

## Latest Updates (Jan 30, 2026)

### Version 7.9.0 - Redesigned React Auth Pages with Dynamic Pricing
- **New**: SignInPage with dark theme matching homepage design
- **New**: SignUpPage with dark theme and benefit panel
- **New**: Dynamic pricing with currency toggle (USD/INR) based on user location
  - USD: Free $0, Starter $29, Growth $79, Pro $149
  - INR: Free ₹0, Starter ₹2,999, Growth ₹9,999, Pro ₹29,999
- **Changed**: Auth routes /auth/signin and /auth/signup now serve React SPA
- **Removed**: Tailwind CDN warning (proper CSS build)
- **Architecture**: Homepage + Auth = React SPA, Dashboard/App = SSR

### Version 7.8.0 - Rollback to SSR Routes (Keep New Homepage Design)
- **Kept**: New modern dark-theme homepage design (React SPA at `/`)
- **Rollback**: Auth routes back to SSR at `/auth/signin`, `/auth/signup`
- **Rollback**: Dashboard/App routes back to SSR at `/app/dashboard`, `/app/insights`, etc.
- **Rollback**: Pricing redirect to `/#pricing`
- **Fixed**: Homepage links now point to correct SSR routes
- **Architecture**: Homepage = React SPA, Everything else = SSR (matching ffaea5ac commit)

### Version 7.7.0 - Major Routing Fix (Reverted)
- **Changed**: Homepage now served directly at `/` (no more `/react/` prefix)
- **Changed**: All React routes now at root level: `/login`, `/register`, `/dashboard`, etc.
- **Fixed**: Sign In / Start Free buttons now always show correctly for non-authenticated users
- **Fixed**: Auth state properly managed with React useState/useEffect
- **Redirect**: Legacy `/react/*` routes redirect to equivalent root routes
- **URLs**: Homepage is now `https://ownlay.com/` as intended

### Version 7.6.3 - Logo & Padding Fix
- **Fixed**: Logo reverted to Layers icon (was accidentally changed to Sparkles)
- **Fixed**: Section padding reduced from 6rem to 4rem (py-16) for less whitespace
- **Fixed**: Sign In/Sign Up links now working correctly at `/react/login` and `/react/register`
- **Verified**: All auth flows functional on sandbox and production

### Version 7.6.2 - React Router Basename Fix
- **Fixed**: React Router basename changed from `/app` to `/react` to match server route
- **Fixed**: React SPA now renders correctly at `/react/` endpoint
- **Fixed**: All React pages (HomePage, Dashboard, etc.) now route correctly
- **Technical**: Updated frontend main.tsx BrowserRouter basename to `/react`
- **Verified**: No console errors, initial render ~433ms, assets loading correctly

### Version 7.6.1 - Root Redirect Fix
- **Fixed**: Root `/` now redirects to `/react/` (302 redirect)
- **Fixed**: Eliminated Tailwind CDN warning in production
- **Technical**: React SPA with proper PostCSS/Tailwind build is now the primary homepage
- **Legacy**: Old SSR homepage available at `/home-legacy` if needed

### Version 7.6.0 - Homepage Redesign Inspired by Fluency.inc

#### 1. NEW Homepage Design - Modern AI/Tech Aesthetic
- **Dark Theme**: Sleek slate-950 background with gradient overlays
- **Animated Background**: Mouse-following gradient effect and floating orbs
- **Grid Pattern**: Subtle tech-forward pattern overlay
- **Hero Section**: 
  - Large bold typography with gradient text animation
  - Animated badge with pulsing status indicator
  - Interactive dashboard preview mockup
  - Trust signals with icons
- **Scroll Reveal Animations**: Elements animate in on scroll
- **Mouse Tracking**: Interactive gradient follows cursor

#### 2. Brand Colors Updated - Indigo/Violet Palette
- **Primary**: Indigo-600 (`#6366f1`)
- **Secondary**: Violet-600 (`#8b5cf6`)  
- **Accent**: Cyan-500 (`#06b6d4`)
- **Success**: Emerald-500 (`#10b981`)
- **Gradients**: Modern gradient combinations throughout

#### 3. Enhanced Feature Cards
- **Glass Morphism**: Backdrop blur with semi-transparent backgrounds
- **Hover Effects**: Cards lift with indigo glow on hover
- **Icon Animation**: Icons scale and rotate on hover
- **Coming Soon Badge**: Muted styling for upcoming features

#### 4. AI Agents Showcase Section
- **Split Layout**: Features + visual demonstration
- **Agent Cards**: Researcher, Strategist, Creative, Auditor with unique gradients
- **Live Activity Preview**: Simulated agent command centre panel
- **CTA Button**: Direct link to Agent Command Centre

#### 5. Testimonials Section
- **3-Column Grid**: Customer quotes with ratings
- **Avatar Badges**: Gradient initials
- **Star Ratings**: 5-star visual indicators
- **Professional Layout**: Role and company details

#### 6. Updated Pricing Cards
- **Dark Theme Compatible**: Proper contrast for visibility
- **Popular Badge**: Golden gradient for Growth tier
- **Free Badge**: Emerald gradient for Free tier
- **Arrow Icons**: Visual CTA enhancement

#### 7. Global CSS Improvements
- **New Utility Classes**: `.hover-lift`, `.soothing-hover`, `.glass-dark`
- **Badge Variants**: `.badge-pro`, `.badge-soon` for plan indicators
- **Animation Keyframes**: `float`, `glow`, `fadeInUp`, `slideInRight`
- **Scrollbar Styling**: Custom thin scrollbars

### Previous Updates (v7.5.0)

#### Free Plan (7-Day Trial)
- New "Free" plan type for first-time users
- Full feature access for 7 days
- Plan Selection Modal on expiry

#### Agent Command Centre - PRO ONLY
- Access restricted to Pro/Enterprise
- Redesigned compact layout with tabs
- Creatives Gallery tab for AI-generated content

#### Channel Health View
- Real-time health scores per platform
- Expandable metrics details
- AI recommendations

#### Integrations Redesign
- Categorized by type (Advertising, E-commerce, Analytics, Email & CRM)
- Category filter buttons
- Expanded Email & CRM providers

### Plan Access Matrix (v7.6.0)

| Feature | Free (7-day) | Starter | Growth | Pro | Enterprise |
|---------|--------------|---------|--------|-----|------------|
| Unified Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ad Manager | ✅ | ✅ | ✅ | ✅ | ✅ |
| Campaign Builder | ✅ | ❌ | ✅ | ✅ | ✅ |
| Creative Studio | ✅ | ❌ | ✅ | ✅ | ✅ |
| **Agent Command Centre** | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Advanced Analytics** | ✅ | ❌ | ❌ | ✅ | ✅ |
| Integrations | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Channel Health** | ✅ | ✅ | ✅ | ✅ | ✅ |

### Navigation Badges

| Tab | Badge | Status |
|-----|-------|--------|
| Agent Command Centre | PRO | Requires Pro plan |
| Analytics | PRO | Requires Pro plan |
| Campaigns | Growth+ | Requires Growth plan |
| Creative Studio | Growth+ | Coming Soon |
| Automation | SOON | All users |
| Audience & CRM | SOON | All users |
| Influencers | SOON | All users |
| Connections | SOON | All users |
| Messages | SOON | All users |

## Demo Accounts

| Email | Password | Plan | Features |
|-------|----------|------|----------|
| admin@ownlay.com | Demo123! | Enterprise | Full access |
| pro@demo.com | Demo123! | Pro | Agent access |
| growth@demo.com | Demo123! | Growth | Standard features |
| starter@demo.com | Demo123! | Starter | Basic features |
| enterprise@demo.com | Demo123! | Enterprise | Full access |

## Features

### A. Pricing & Subscription
- [x] Free Plan (7-day trial with full access)
- [x] Starter Plan ($29/mo) - Dashboard + Ad Manager
- [x] Growth Plan ($79/mo) - + Campaigns + Creative Studio
- [x] Pro Plan ($149/mo) - + Agent Command Centre + Analytics
- [x] Enterprise Plan (Custom) - Full access + Custom integrations
- [x] Plan Selection Modal on trial expiry
- [x] Agency restriction to Pro plans only

### B. Dashboard
- [x] KPI Metric Cards with trends
- [x] Performance Chart (Spend vs Revenue)
- [x] Channel Breakdown (Pie chart)
- [x] AI Insights Panel
- [x] Channel Health View
- [x] Channel Performance Table

### C. Agent Command Centre (PRO)
- [x] Researcher Agent (competitor analysis)
- [x] Strategist Agent (budget allocation)
- [x] Creative Agent (headlines, prompts)
- [x] Auditor Agent (compliance)
- [x] Orchestrator (full pipelines)
- [x] Live Activity Feed
- [x] Approval Center
- [x] Creatives Gallery Tab

### D. Integrations
- [x] Advertising: Google Ads, Meta Ads, TikTok Ads, LinkedIn Ads
- [x] E-commerce: Shopify, WooCommerce, Stripe
- [x] Analytics: Google Analytics, Mixpanel, Segment
- [x] Email & CRM: Klaviyo, HubSpot, Mailchimp, Salesforce, Intercom, ActiveCampaign

## API Endpoints

### Authentication
```bash
POST /api/v1/auth/login          # Login
POST /api/v1/auth/register       # Register (Free Plan for new users)
POST /api/v1/auth/logout         # Logout
GET  /api/v1/auth/me             # Current user
```

### Dashboard
```bash
GET /api/v1/dashboard/metrics    # KPI metrics
GET /api/v1/dashboard/channels   # Channel breakdown
```

### AI Agents (PRO only)
```bash
POST /api/v1/agents/orchestrator/full-campaign
POST /api/v1/agents/researcher/competitors
POST /api/v1/agents/strategist/budget-allocation
POST /api/v1/agents/creative/generate
POST /api/v1/agents/auditor/check
```

### Subscription
```bash
GET /api/v1/payment/subscription/:userId
POST /api/v1/payment/start-trial
POST /api/v1/payment/create-order
```

## Development

```bash
# Install dependencies
npm install
cd frontend && npm install

# Build the project
npm run build
cd frontend && npm run build

# Start development server
pm2 start ecosystem.config.cjs

# Test the application
curl http://localhost:3000/react/
```

## Deployment

```bash
# Build and deploy
npm run build
cd frontend && npm run build
cd .. && npx wrangler pages deploy dist --project-name ownlay-marketing-os
```

## Performance

- **Dashboard Load**: <5ms (pre-computed demo data)
- **Page Navigation**: Instant (SPA with lazy loading)
- **Bundle Size**: ~103KB gzipped (main), ~50KB per page (lazy)
- **API Cache**: 30-60s TTL with deduplication

## Color Branding (Indigo/Violet)

- **Primary**: `#6366f1` (Indigo-600)
- **Secondary**: `#8b5cf6` (Violet-600)
- **Accent**: `#06b6d4` (Cyan-500)
- **Success**: `#10b981` (Emerald-500)
- **Free Plan**: Emerald gradient
- **Popular Plan**: Golden/Amber gradient
- **Background (Dark)**: `#020617` (Slate-950)

## Design Philosophy

Inspired by [Fluency.inc](https://www.fluency.inc/):
- Dark theme for professional, tech-forward aesthetic
- Smooth animations and micro-interactions
- Glass morphism with backdrop blur
- Bold typography with gradient accents
- Mouse-following interactive elements
- Scroll-triggered reveal animations

## License

Proprietary - OWNLAY Inc.
