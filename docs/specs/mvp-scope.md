# OWNLAY MVP Scope

## Overview
This document defines the Minimum Viable Product (MVP) scope for OWNLAY, including core features, minimal connectors, and acceptance criteria.

---

## MVP Feature Set

### Core Pages (Required)

| Page | Priority | Status |
|------|----------|--------|
| Marketing Site (Home) | P0 | ✅ Included |
| Pricing Page | P0 | ✅ Included |
| Onboarding Wizard | P0 | ✅ Included |
| Unified Dashboard | P0 | ✅ Included |
| Campaign Builder | P0 | ✅ Included |
| Ad Manager | P1 | ✅ Included |
| Analytics & Reports | P0 | ✅ Included |
| Integrations Page | P0 | ✅ Included |
| Settings | P1 | ✅ Included |
| Admin Console | P1 | ✅ Included |

### Deferred to Post-MVP

| Page | Priority | Reason |
|------|----------|--------|
| Automation Builder (Visual) | P2 | Complex drag-drop UI |
| Creative Studio (Full) | P2 | Asset management complexity |
| Audience Builder (Visual) | P2 | Complex segmentation UI |
| White-label Admin | P3 | Enterprise only |

---

## Minimal Connectors (MVP)

### Required Connectors (4)

1. **Google Ads** - Largest ad platform, essential
2. **Meta Ads** - Second largest, critical for D2C
3. **Google Analytics 4** - Website analytics baseline
4. **CSV Upload** - Manual data import fallback

### Post-MVP Connectors

| Connector | Priority | Target Release |
|-----------|----------|----------------|
| TikTok Ads | P1 | v1.1 |
| LinkedIn Ads | P1 | v1.1 |
| Shopify | P1 | v1.1 |
| Stripe | P2 | v1.2 |
| Mailchimp | P2 | v1.2 |
| HubSpot | P2 | v1.2 |
| Webhook Ingestion | P1 | v1.1 |
| BigQuery Export | P2 | v1.2 |

---

## Basic AI Rules (MVP)

Instead of full ML models, MVP includes rule-based "AI" features:

### 1. Spend Anomaly Alert
```
IF daily_spend > (7_day_avg * 1.3)
AND conversions < (7_day_avg * 0.9)
THEN alert("Spend anomaly detected")
```

### 2. Creative Fatigue Warning
```
IF ctr_7d_change < -20%
AND frequency > 3.0
THEN alert("Creative fatigue detected")
```

### 3. Budget Reallocation Suggestion
```
IF channel_A.roas > channel_B.roas * 1.5
AND channel_B.spend > total_spend * 0.2
THEN suggest("Move 20% budget from B to A")
```

### 4. Campaign Performance Alert
```
IF campaign.roas < target_roas * 0.8
AND campaign.spend > 1000
THEN alert("Campaign underperforming target")
```

### Post-MVP AI Features

| Feature | Priority | Target Release |
|---------|----------|----------------|
| ML Budget Optimizer | P1 | v1.1 |
| Predictive ROI Model | P2 | v1.2 |
| NLP Query Interface | P2 | v1.2 |
| AI Copy Generator | P2 | v1.3 |
| Advanced Anomaly Detection | P1 | v1.1 |

---

## Acceptance Criteria

### Authentication & Onboarding

- [ ] User can sign up with email/password
- [ ] User can sign in with Google OAuth
- [ ] User completes 4-step onboarding wizard
- [ ] User can skip optional steps
- [ ] Error states handled gracefully

### Dashboard

- [ ] Dashboard loads within 3 seconds
- [ ] KPI tiles show correct aggregated metrics
- [ ] Charts render with sample/real data
- [ ] Date range selector works (7D, 30D, 90D)
- [ ] Channel filter works correctly

### Connectors

- [ ] Google Ads OAuth flow completes successfully
- [ ] Meta Ads OAuth flow completes successfully
- [ ] GA4 OAuth flow completes successfully
- [ ] CSV upload accepts valid file formats
- [ ] Sync status visible on integrations page
- [ ] Error handling for failed connections

### Campaign Management

- [ ] User can view list of campaigns
- [ ] User can filter campaigns by status
- [ ] User can create new campaign (draft)
- [ ] User can edit campaign details
- [ ] User can pause/resume campaign
- [ ] Campaign metrics display correctly

### Analytics

- [ ] Reports load within 5 seconds
- [ ] Export to CSV works
- [ ] Date range selection works
- [ ] Channel breakdown accurate
- [ ] Attribution model selector works

### Admin

- [ ] Admin can view user list
- [ ] Admin can invite new users
- [ ] Admin can change user roles
- [ ] Admin can view audit logs
- [ ] Billing information displayed

### Performance

- [ ] Page load time < 3 seconds (p95)
- [ ] API response time < 500ms (p95)
- [ ] Mobile responsive on all pages
- [ ] No console errors in production

---

## User Stories (MVP Backlog)

### Epic 1: Authentication & Onboarding

```
US-001: As a new user, I want to sign up for a free trial so I can evaluate OWNLAY
  - Acceptance: Email/password signup works
  - Acceptance: Email verification sent
  - Acceptance: Redirect to onboarding

US-002: As a new user, I want to complete onboarding so I can start using the platform
  - Acceptance: 4-step wizard completes
  - Acceptance: Skip option available
  - Acceptance: Progress saved between steps

US-003: As a returning user, I want to sign in quickly so I can access my dashboard
  - Acceptance: Login with email/password
  - Acceptance: Google OAuth works
  - Acceptance: Remember me option
```

### Epic 2: Dashboard & Analytics

```
US-010: As a marketer, I want to see all my KPIs in one view so I can assess performance
  - Acceptance: Spend, Revenue, ROAS, Conversions visible
  - Acceptance: Comparison to previous period
  - Acceptance: Channel breakdown available

US-011: As a marketer, I want to filter by date range so I can analyze specific periods
  - Acceptance: Preset options (7D, 30D, 90D)
  - Acceptance: Custom date picker works
  - Acceptance: Data updates on selection

US-012: As a marketer, I want to see AI insights so I can identify opportunities
  - Acceptance: Insights cards displayed
  - Acceptance: Actionable buttons work
  - Acceptance: Confidence scores visible
```

### Epic 3: Integrations

```
US-020: As a marketer, I want to connect Google Ads so I can see campaign data
  - Acceptance: OAuth flow completes
  - Acceptance: Account selector appears
  - Acceptance: Initial sync starts

US-021: As a marketer, I want to see sync status so I know if data is current
  - Acceptance: Last sync time visible
  - Acceptance: Health status indicator
  - Acceptance: Manual refresh option

US-022: As a marketer, I want to upload CSV data so I can import historical data
  - Acceptance: File upload works
  - Acceptance: Column mapping UI
  - Acceptance: Validation errors shown
```

### Epic 4: Campaign Management

```
US-030: As a marketer, I want to view my campaigns so I can monitor performance
  - Acceptance: Campaign list displays
  - Acceptance: Status filters work
  - Acceptance: Search works

US-031: As a marketer, I want to create a campaign so I can launch new ads
  - Acceptance: Campaign creation form works
  - Acceptance: Channel selection works
  - Acceptance: Budget setting works

US-032: As a marketer, I want to pause a campaign so I can stop spending
  - Acceptance: Pause button works
  - Acceptance: Status updates immediately
  - Acceptance: Resume option available
```

### Epic 5: Admin & Security

```
US-040: As an admin, I want to manage users so I can control access
  - Acceptance: User list displays
  - Acceptance: Invite user works
  - Acceptance: Role assignment works

US-041: As an admin, I want to view audit logs so I can track changes
  - Acceptance: Audit log displays
  - Acceptance: Filters work
  - Acceptance: Export option available

US-042: As an admin, I want to manage billing so I can update payment info
  - Acceptance: Current plan visible
  - Acceptance: Usage metrics shown
  - Acceptance: Invoice history available
```

---

## Definition of Done (DoD)

A feature is considered "done" when:

1. ✅ Code is written and committed
2. ✅ Unit tests pass (>80% coverage)
3. ✅ Integration tests pass
4. ✅ Code review approved
5. ✅ Acceptance criteria verified
6. ✅ No P0/P1 bugs
7. ✅ Documentation updated
8. ✅ Deployed to staging
9. ✅ QA sign-off
10. ✅ Product owner sign-off

---

## MVP Timeline

| Milestone | Target Date | Status |
|-----------|-------------|--------|
| Alpha (Internal) | Week 4 | 🟡 In Progress |
| Beta (Limited) | Week 8 | ⏳ Planned |
| MVP Launch | Week 12 | ⏳ Planned |
| v1.1 Release | Week 16 | ⏳ Planned |

---

## Success Metrics (MVP)

| Metric | Target | Measurement |
|--------|--------|-------------|
| User Signups | 100 | Analytics |
| Activation Rate | 40% | Complete onboarding |
| Connector Connections | 200 | Database |
| Daily Active Users | 30 | Analytics |
| NPS Score | >30 | Survey |
| Bug Reports (P0/P1) | <5 | Jira |
