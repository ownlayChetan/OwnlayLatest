# OWNLAY Data & Integrations Specification

## Overview
This document defines the data architecture, integration specifications, and sync policies for OWNLAY.

---

## Canonical Event Schema

All data from connected platforms is normalized to this canonical schema:

```typescript
interface OwnlayEvent {
  // Core identifiers
  event_id: string;           // Unique event ID (UUID)
  event_type: EventType;      // Enum of supported event types
  timestamp: string;          // ISO 8601 timestamp
  received_at: string;        // When OWNLAY received the event
  
  // User identification
  user_id?: string;           // Authenticated user ID
  anonymous_id?: string;      // Anonymous tracking ID
  session_id?: string;        // Session identifier
  device_id?: string;         // Device fingerprint
  
  // Source attribution
  source: {
    platform: Platform;       // Source platform (google_ads, meta_ads, etc.)
    connector_id: string;     // OWNLAY connector ID
    campaign_id?: string;     // Platform campaign ID
    ad_group_id?: string;     // Platform ad group/set ID
    ad_id?: string;           // Platform ad ID
    keyword?: string;         // Search keyword (if applicable)
    placement?: string;       // Ad placement
  };
  
  // UTM parameters
  utm: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
  };
  
  // Event properties (varies by event type)
  properties: Record<string, any>;
  
  // Device & context
  context: {
    ip?: string;              // Client IP (hashed for privacy)
    user_agent?: string;
    locale?: string;
    timezone?: string;
    device: {
      type: 'desktop' | 'mobile' | 'tablet';
      os?: string;
      browser?: string;
      screen_resolution?: string;
    };
    geo: {
      country?: string;
      region?: string;
      city?: string;
      postal_code?: string;
    };
    page: {
      url?: string;
      path?: string;
      title?: string;
      referrer?: string;
    };
  };
  
  // Metadata
  workspace_id: string;       // OWNLAY workspace
  processed_at?: string;      // When fully processed
  version: string;            // Schema version
}

type EventType = 
  | 'page_view'
  | 'click'
  | 'impression'
  | 'form_submit'
  | 'add_to_cart'
  | 'checkout_start'
  | 'purchase'
  | 'conversion'
  | 'lead'
  | 'signup'
  | 'login'
  | 'custom';

type Platform = 
  | 'google_ads'
  | 'meta_ads'
  | 'tiktok_ads'
  | 'linkedin_ads'
  | 'ga4'
  | 'shopify'
  | 'stripe'
  | 'mailchimp'
  | 'webhook'
  | 'csv'
  | 'api';
```

---

## Platform Connectors

### Google Ads

**Authentication**: OAuth 2.0
**Scopes**: `https://www.googleapis.com/auth/adwords`

**Data Synced**:
| Entity | Fields | Sync Frequency |
|--------|--------|----------------|
| Campaigns | id, name, status, budget, bidding_strategy | 15 min |
| Ad Groups | id, name, campaign_id, status, cpc_bid | 15 min |
| Ads | id, name, type, status, final_urls, headlines | 15 min |
| Keywords | id, text, match_type, bid, quality_score | 15 min |
| Metrics | impressions, clicks, conversions, cost, ctr, cpc | 15 min |
| Conversions | id, name, category, value, attribution_model | 1 hour |

**Rate Limits**: 15,000 requests/day, 1,500 requests/100 seconds

---

### Meta Ads (Facebook/Instagram)

**Authentication**: OAuth 2.0
**Scopes**: `ads_read`, `ads_management`, `business_management`

**Data Synced**:
| Entity | Fields | Sync Frequency |
|--------|--------|----------------|
| Campaigns | id, name, status, objective, budget | 15 min |
| Ad Sets | id, name, campaign_id, targeting, budget | 15 min |
| Ads | id, name, creative, status | 15 min |
| Creatives | id, title, body, image_url, video_url | 1 hour |
| Insights | impressions, reach, clicks, conversions, spend | 15 min |
| Audiences | id, name, size, type | 6 hours |

**Rate Limits**: 200 calls/hour per ad account

---

### Google Analytics 4

**Authentication**: OAuth 2.0
**Scopes**: `analytics.readonly`

**Data Synced**:
| Entity | Fields | Sync Frequency |
|--------|--------|----------------|
| Events | event_name, event_count, users | 1 hour |
| Sessions | sessions, engaged_sessions, bounce_rate | 1 hour |
| Traffic Sources | source, medium, campaign | 1 hour |
| Conversions | conversion events, values | 1 hour |
| User Demographics | country, device, browser | 6 hours |
| Pages | page_path, page_views, avg_time | 1 hour |

**Rate Limits**: 10,000 requests/day, 10 queries/second

---

### TikTok Ads

**Authentication**: OAuth 2.0
**Scopes**: `tiktok.ads.read`, `tiktok.ads.write`

**Data Synced**:
| Entity | Fields | Sync Frequency |
|--------|--------|----------------|
| Campaigns | id, name, status, budget, objective | 15 min |
| Ad Groups | id, name, targeting, budget, bid | 15 min |
| Ads | id, name, creative_id, status | 15 min |
| Metrics | impressions, clicks, conversions, spend, ctr | 15 min |

**Rate Limits**: 600 requests/minute

---

### LinkedIn Ads

**Authentication**: OAuth 2.0
**Scopes**: `r_ads`, `r_ads_reporting`

**Data Synced**:
| Entity | Fields | Sync Frequency |
|--------|--------|----------------|
| Campaigns | id, name, status, type, budget | 15 min |
| Campaign Groups | id, name, status | 1 hour |
| Creatives | id, type, text, image_url | 1 hour |
| Analytics | impressions, clicks, conversions, spend | 15 min |
| Leads | form_responses, lead_data | Real-time webhook |

**Rate Limits**: 80,000 calls/day

---

### Shopify

**Authentication**: OAuth 2.0 (Private App)
**Scopes**: `read_orders`, `read_customers`, `read_products`, `read_analytics`

**Data Synced**:
| Entity | Fields | Sync Frequency |
|--------|--------|----------------|
| Orders | id, total, line_items, customer_id, created_at | Real-time webhook |
| Customers | id, email, total_spent, orders_count | Real-time webhook |
| Products | id, title, variants, price | 6 hours |
| Carts | id, items, abandoned_checkout_url | Real-time webhook |
| Refunds | id, amount, reason | Real-time webhook |

**Rate Limits**: 2 calls/second

---

### Stripe

**Authentication**: API Key
**Scopes**: Restricted key with `read` on subscriptions, invoices, charges

**Data Synced**:
| Entity | Fields | Sync Frequency |
|--------|--------|----------------|
| Charges | id, amount, customer_id, status | Real-time webhook |
| Subscriptions | id, customer_id, plan, status, mrr | Real-time webhook |
| Invoices | id, amount, status, paid_at | Real-time webhook |
| Customers | id, email, metadata | 6 hours |

**Rate Limits**: 100 requests/second

---

### Mailchimp

**Authentication**: OAuth 2.0
**Scopes**: `campaigns`, `lists`, `reports`

**Data Synced**:
| Entity | Fields | Sync Frequency |
|--------|--------|----------------|
| Campaigns | id, name, status, send_time | 1 hour |
| Lists | id, name, member_count | 6 hours |
| Reports | opens, clicks, bounces, unsubscribes | 1 hour |
| Members | id, email, status, tags | 6 hours |

**Rate Limits**: 10 concurrent connections

---

### CSV Upload

**Supported Formats**: CSV, TSV, Excel (.xlsx)
**Max File Size**: 100 MB
**Column Mapping**: Required fields with auto-detection

**Expected Columns**:
| Column | Required | Description |
|--------|----------|-------------|
| date | Yes | Date of the data point |
| campaign_name | Yes | Campaign identifier |
| spend | No | Spend amount |
| impressions | No | Impression count |
| clicks | No | Click count |
| conversions | No | Conversion count |
| revenue | No | Revenue amount |

---

### Webhook Ingestion

**Endpoint**: `POST /api/v1/events`
**Authentication**: API Key in header

**Payload Format**:
```json
{
  "event_type": "conversion",
  "timestamp": "2024-12-12T14:30:00Z",
  "user_id": "user_123",
  "properties": {
    "revenue": 99.99,
    "currency": "USD"
  }
}
```

**Rate Limits**: 1,000 events/second

---

## Sync Cadence Options

| Tier | Real-time | 15-min | Hourly | Daily |
|------|-----------|--------|--------|-------|
| Starter | Webhooks | - | Ad platforms | Reports |
| Growth | Webhooks | Ad platforms | Analytics | Reports |
| Enterprise | All | All | - | - |

---

## Data Retention Policy

| Data Type | Raw Retention | Aggregated Retention |
|-----------|---------------|---------------------|
| Events (raw) | 30 days | 2 years |
| Ad Platform Data | 90 days | Unlimited |
| Analytics Events | 30 days | 2 years |
| User PII | Until deletion request | N/A |
| Audit Logs | 7 years | 7 years |
| ML Training Data | 90 days | N/A |

---

## Data Warehousing Integration

### BigQuery Export

**Setup**:
1. Create service account with BigQuery Admin role
2. Share JSON key with OWNLAY
3. Select datasets to export
4. Configure schema (raw or aggregated)

**Export Options**:
- Streaming insert (real-time)
- Batch load (hourly/daily)
- Incremental updates

**Schema**:
```sql
CREATE TABLE events (
  event_id STRING,
  event_type STRING,
  timestamp TIMESTAMP,
  user_id STRING,
  properties JSON,
  context JSON,
  workspace_id STRING
)
PARTITION BY DATE(timestamp)
CLUSTER BY event_type, workspace_id;
```

### Snowflake Export

**Setup**:
1. Create storage integration
2. Configure Snowpipe
3. Select export frequency

**Export Options**:
- Snowpipe (continuous)
- Scheduled batch (hourly/daily)

---

## Security & Compliance

### Data Encryption
- **In Transit**: TLS 1.3
- **At Rest**: AES-256

### Access Control
- Row-level security by workspace
- Column-level encryption for PII
- API keys with scoped permissions

### Compliance
- GDPR data subject access/deletion
- CCPA consumer rights
- SOC 2 Type II certified
- HIPAA BAA available (Enterprise)

---

## Error Handling

### Sync Failures
| Error Type | Retry Strategy | Alert |
|------------|----------------|-------|
| Rate Limited | Exponential backoff (max 1hr) | After 3 failures |
| Auth Expired | Re-auth prompt | Immediate |
| API Error | 3 retries with backoff | After 3 failures |
| Data Validation | Skip row, log error | Daily summary |
| Network Error | 5 retries with backoff | After 5 failures |

### Data Quality
- Schema validation on ingest
- Duplicate detection (event_id)
- Timestamp validation (not future, not >90d old)
- Required field enforcement
