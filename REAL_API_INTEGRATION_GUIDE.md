# Real API Integration Guide for OWNLAY

## Current State

The OWNLAY application currently uses **mock/demo data** for all integrations. This document explains what's needed to enable real API integrations.

## Critical Limitations of Cloudflare Workers

### 1. No Persistent In-Memory Storage
Cloudflare Workers are stateless - each request can hit a different worker instance. The current in-memory arrays (`brandToInfluencerMessages`, `userStore`, etc.) **do not persist** between requests.

**Solution Required:**
- Use **Cloudflare D1** (SQLite database) for persistent storage
- Or use **Cloudflare KV** for key-value storage
- Or use external database (Supabase, PlanetScale, etc.)

### 2. No Server-Side Sessions
Workers don't maintain sessions. Current JWT tokens are mock tokens.

**Solution Required:**
- Implement proper JWT validation with secrets
- Store sessions in D1 or KV

## Real API Integrations Needed

### 1. Social Media Platforms (For Creators)

#### Instagram Graph API
```
Required:
- Facebook Developer Account
- Instagram Business/Creator Account
- App Review for permissions: instagram_basic, instagram_manage_insights, pages_read_engagement

Endpoints:
- GET /me/accounts - Get connected pages
- GET /{ig-user-id}/insights - Get account insights
- GET /{ig-user-id}/media - Get media posts

Documentation: https://developers.facebook.com/docs/instagram-api/
```

#### YouTube Data API v3
```
Required:
- Google Cloud Project
- YouTube Data API enabled
- OAuth 2.0 credentials

Endpoints:
- GET /channels - Get channel info
- GET /analytics - Get analytics data (YouTube Analytics API)

Documentation: https://developers.google.com/youtube/v3
```

#### TikTok API
```
Required:
- TikTok Developer Account
- App approval for Creator Marketplace API

Endpoints:
- GET /user/info - Get user profile
- GET /video/list - Get user videos

Documentation: https://developers.tiktok.com/
```

### 2. Advertising Platforms (For Brands)

#### Google Ads API
```
Required:
- Google Ads Developer Token (apply at ads.google.com)
- OAuth 2.0 credentials
- Customer ID

Endpoints:
- campaigns.get - Get campaigns
- adGroups.get - Get ad groups
- metrics - Get performance data

Documentation: https://developers.google.com/google-ads/api/docs/start
```

#### Meta Marketing API (Facebook/Instagram Ads)
```
Required:
- Facebook Business Account
- Marketing API access
- Ad Account ID

Endpoints:
- GET /act_{ad-account-id}/campaigns
- GET /act_{ad-account-id}/insights

Documentation: https://developers.facebook.com/docs/marketing-apis/
```

#### TikTok Ads API
```
Required:
- TikTok Ads Manager Account
- API access approval

Documentation: https://ads.tiktok.com/marketing_api/
```

#### LinkedIn Marketing API
```
Required:
- LinkedIn Developer Account
- Marketing Developer Platform access

Documentation: https://docs.microsoft.com/en-us/linkedin/marketing/
```

### 3. E-commerce Platforms

#### Shopify API
```
Required:
- Shopify Partner Account OR
- Custom App in Shopify Admin

Endpoints:
- GET /admin/api/2024-01/orders.json
- GET /admin/api/2024-01/products.json

Documentation: https://shopify.dev/docs/api
```

## Implementation Steps

### Step 1: Set Up Cloudflare D1 Database

```bash
# Create D1 database
npx wrangler d1 create ownlay-production

# Update wrangler.jsonc with database_id
```

Create migration file `migrations/0001_initial.sql`:
```sql
-- Users table
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    account_type TEXT,
    plan TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    sender_type TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    recipient_id TEXT NOT NULL,
    content TEXT NOT NULL,
    read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Platform connections table
CREATE TABLE platform_connections (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    platform TEXT NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at DATETIME,
    account_data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Step 2: Store API Credentials Securely

```bash
# Store secrets in Cloudflare
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler secret put META_APP_ID
npx wrangler secret put META_APP_SECRET
npx wrangler secret put INSTAGRAM_CLIENT_ID
npx wrangler secret put INSTAGRAM_CLIENT_SECRET
# ... etc
```

### Step 3: Implement OAuth Flows

Each platform requires:
1. Redirect user to platform's OAuth URL
2. Handle callback with authorization code
3. Exchange code for access token
4. Store tokens in D1 database
5. Refresh tokens before expiry

### Step 4: Create API Wrapper Functions

```typescript
// Example: Instagram API wrapper
async function getInstagramInsights(accessToken: string, userId: string) {
    const response = await fetch(
        `https://graph.facebook.com/v18.0/${userId}/insights?metric=impressions,reach,profile_views&period=day&access_token=${accessToken}`
    );
    return response.json();
}
```

## Environment Variables Needed

Create `.dev.vars` for local development:
```
# Google
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# Meta/Facebook/Instagram
META_APP_ID=your_app_id
META_APP_SECRET=your_app_secret

# TikTok
TIKTOK_CLIENT_KEY=your_client_key
TIKTOK_CLIENT_SECRET=your_client_secret

# YouTube
YOUTUBE_API_KEY=your_api_key

# LinkedIn
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret

# Shopify
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret

# JWT Secret
JWT_SECRET=your_jwt_secret
```

## Cost Considerations

| Platform | Free Tier | Paid |
|----------|-----------|------|
| Google Ads API | Free with approval | Free |
| Meta Marketing API | Free | Free |
| Instagram Graph API | Free | Free |
| YouTube Data API | 10,000 units/day | Pay per use |
| TikTok API | Limited | Enterprise |
| LinkedIn Marketing API | Limited | Enterprise |
| Shopify API | Free with app | Free |

## Timeline Estimate

| Task | Time |
|------|------|
| D1 Database setup | 2-4 hours |
| OAuth implementations (per platform) | 4-8 hours each |
| API wrappers (per platform) | 2-4 hours each |
| Testing & debugging | 8-16 hours |
| **Total (all platforms)** | **40-80 hours** |

## Quick Start (Minimal Implementation)

To get real data working quickly, start with:

1. **Cloudflare D1** for persistence (messages, users)
2. **One social platform** (Instagram - most common for creators)
3. **One ad platform** (Meta Ads - easiest to set up)

This would take approximately 16-24 hours of development.

## Files to Modify

1. `wrangler.jsonc` - Add D1 bindings
2. `src/routes/api.ts` - Replace mock data with D1 queries
3. `src/index.tsx` - Add environment bindings type
4. New files:
   - `src/services/instagram.ts`
   - `src/services/youtube.ts`
   - `src/services/meta-ads.ts`
   - `src/services/google-ads.ts`
   - `migrations/*.sql`
