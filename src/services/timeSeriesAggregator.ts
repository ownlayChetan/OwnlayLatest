// Time-Series Aggregator for OWNLAY Marketing OS
// Optimized for millisecond-speed charting of ad events
// Version: 4.1.0 - Enterprise Analytics Engine

import { TenantContext } from '../db/multiTenant';

// ============================================
// TYPE DEFINITIONS
// ============================================

export type Granularity = 'minute' | 'hour' | 'day' | 'week' | 'month';

export interface TimeSeriesPoint {
  timestamp: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
  ctr: number;
  cpc: number;
  cpa: number;
  roas: number;
}

export interface TimeSeriesQuery {
  startDate: string;
  endDate: string;
  granularity: Granularity;
  platform?: string;
  campaignId?: string;
  adId?: string;
  metrics?: string[];
  aggregationType?: 'sum' | 'avg' | 'max' | 'min';
}

export interface TimeSeriesResult {
  data: TimeSeriesPoint[];
  metadata: {
    query: TimeSeriesQuery;
    totalPoints: number;
    executionTimeMs: number;
    fromCache: boolean;
    dateRange: {
      start: string;
      end: string;
    };
  };
  summary: {
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    totalSpend: number;
    totalRevenue: number;
    avgCTR: number;
    avgCPA: number;
    avgROAS: number;
  };
}

export interface RealTimeMetrics {
  current: {
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
    revenue: number;
  };
  lastHour: {
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
    revenue: number;
  };
  trend: {
    impressions: number; // % change
    clicks: number;
    conversions: number;
    spend: number;
    revenue: number;
  };
  lastUpdated: string;
}

// ============================================
// IN-MEMORY CACHE FOR MILLISECOND PERFORMANCE
// ============================================

interface CacheEntry {
  data: TimeSeriesResult;
  expires: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 30000; // 30 seconds

function getCacheKey(context: TenantContext, query: TimeSeriesQuery): string {
  return `${context.orgId}:${context.brandId}:${JSON.stringify(query)}`;
}

// ============================================
// TIME-SERIES AGGREGATOR
// ============================================

export class TimeSeriesAggregator {
  private database: D1Database;
  private context: TenantContext;

  constructor(database: D1Database, context: TenantContext) {
    this.database = database;
    this.context = context;
  }

  // ============================================
  // MAIN QUERY METHOD
  // ============================================

  async query(options: TimeSeriesQuery): Promise<TimeSeriesResult> {
    const startTime = performance.now();
    
    // Check cache first
    const cacheKey = getCacheKey(this.context, options);
    const cached = cache.get(cacheKey);
    
    if (cached && cached.expires > Date.now()) {
      const executionTime = performance.now() - startTime;
      return {
        ...cached.data,
        metadata: {
          ...cached.data.metadata,
          executionTimeMs: executionTime,
          fromCache: true
        }
      };
    }

    // Build optimized query
    const { sql, params } = this.buildQuery(options);

    // Execute query
    const result = await this.database.prepare(sql).bind(...params).all<any>();
    const rawData = result.results || [];

    // Transform data
    const data = this.transformData(rawData);

    // Calculate summary
    const summary = this.calculateSummary(data);

    const executionTime = performance.now() - startTime;

    const response: TimeSeriesResult = {
      data,
      metadata: {
        query: options,
        totalPoints: data.length,
        executionTimeMs: executionTime,
        fromCache: false,
        dateRange: {
          start: options.startDate,
          end: options.endDate
        }
      },
      summary
    };

    // Store in cache
    cache.set(cacheKey, {
      data: response,
      expires: Date.now() + CACHE_TTL_MS
    });

    return response;
  }

  private buildQuery(options: TimeSeriesQuery): { sql: string; params: any[] } {
    const { startDate, endDate, granularity, platform, campaignId, adId } = options;

    // Build timestamp format based on granularity
    let timestampFormat: string;
    switch (granularity) {
      case 'minute':
        timestampFormat = "strftime('%Y-%m-%d %H:%M:00', timestamp)";
        break;
      case 'hour':
        timestampFormat = "strftime('%Y-%m-%d %H:00:00', timestamp)";
        break;
      case 'day':
        timestampFormat = "date(timestamp)";
        break;
      case 'week':
        timestampFormat = "date(timestamp, 'weekday 0', '-6 days')";
        break;
      case 'month':
        timestampFormat = "strftime('%Y-%m-01', timestamp)";
        break;
      default:
        timestampFormat = "date(timestamp)";
    }

    let sql = `
      SELECT 
        ${timestampFormat} as timestamp,
        SUM(impressions) as impressions,
        SUM(clicks) as clicks,
        SUM(conversions) as conversions,
        SUM(spend) as spend,
        SUM(revenue) as revenue,
        CASE WHEN SUM(impressions) > 0 THEN (SUM(clicks) * 100.0 / SUM(impressions)) ELSE 0 END as ctr,
        CASE WHEN SUM(clicks) > 0 THEN (SUM(spend) / SUM(clicks)) ELSE 0 END as cpc,
        CASE WHEN SUM(conversions) > 0 THEN (SUM(spend) / SUM(conversions)) ELSE 0 END as cpa,
        CASE WHEN SUM(spend) > 0 THEN (SUM(revenue) / SUM(spend)) ELSE 0 END as roas
      FROM metrics_timeseries
      WHERE org_id = ? AND brand_id = ?
        AND timestamp >= ? AND timestamp <= ?
    `;

    const params: any[] = [
      this.context.orgId,
      this.context.brandId,
      startDate,
      endDate
    ];

    if (platform) {
      sql += ' AND platform = ?';
      params.push(platform);
    }

    if (campaignId) {
      sql += ' AND campaign_id = ?';
      params.push(campaignId);
    }

    if (adId) {
      sql += ' AND ad_id = ?';
      params.push(adId);
    }

    sql += ` GROUP BY ${timestampFormat} ORDER BY timestamp ASC`;

    return { sql, params };
  }

  private transformData(rawData: any[]): TimeSeriesPoint[] {
    return rawData.map(row => ({
      timestamp: row.timestamp,
      impressions: row.impressions || 0,
      clicks: row.clicks || 0,
      conversions: row.conversions || 0,
      spend: Math.round((row.spend || 0) * 100) / 100,
      revenue: Math.round((row.revenue || 0) * 100) / 100,
      ctr: Math.round((row.ctr || 0) * 100) / 100,
      cpc: Math.round((row.cpc || 0) * 100) / 100,
      cpa: Math.round((row.cpa || 0) * 100) / 100,
      roas: Math.round((row.roas || 0) * 100) / 100
    }));
  }

  private calculateSummary(data: TimeSeriesPoint[]): TimeSeriesResult['summary'] {
    const totalImpressions = data.reduce((sum, d) => sum + d.impressions, 0);
    const totalClicks = data.reduce((sum, d) => sum + d.clicks, 0);
    const totalConversions = data.reduce((sum, d) => sum + d.conversions, 0);
    const totalSpend = data.reduce((sum, d) => sum + d.spend, 0);
    const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);

    return {
      totalImpressions,
      totalClicks,
      totalConversions,
      totalSpend: Math.round(totalSpend * 100) / 100,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      avgCTR: totalImpressions > 0 
        ? Math.round((totalClicks / totalImpressions) * 10000) / 100 
        : 0,
      avgCPA: totalConversions > 0 
        ? Math.round((totalSpend / totalConversions) * 100) / 100 
        : 0,
      avgROAS: totalSpend > 0 
        ? Math.round((totalRevenue / totalSpend) * 100) / 100 
        : 0
    };
  }

  // ============================================
  // REAL-TIME METRICS
  // ============================================

  async getRealTimeMetrics(options: {
    platform?: string;
    campaignId?: string;
  } = {}): Promise<RealTimeMetrics> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    // Current period (last hour)
    const currentMetrics = await this.getMetricsForPeriod(
      oneHourAgo.toISOString(),
      now.toISOString(),
      options
    );

    // Previous period (hour before)
    const previousMetrics = await this.getMetricsForPeriod(
      twoHoursAgo.toISOString(),
      oneHourAgo.toISOString(),
      options
    );

    // Calculate trends
    const calculateTrend = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 10000) / 100;
    };

    return {
      current: {
        impressions: currentMetrics.impressions,
        clicks: currentMetrics.clicks,
        conversions: currentMetrics.conversions,
        spend: currentMetrics.spend,
        revenue: currentMetrics.revenue
      },
      lastHour: {
        impressions: currentMetrics.impressions,
        clicks: currentMetrics.clicks,
        conversions: currentMetrics.conversions,
        spend: currentMetrics.spend,
        revenue: currentMetrics.revenue
      },
      trend: {
        impressions: calculateTrend(currentMetrics.impressions, previousMetrics.impressions),
        clicks: calculateTrend(currentMetrics.clicks, previousMetrics.clicks),
        conversions: calculateTrend(currentMetrics.conversions, previousMetrics.conversions),
        spend: calculateTrend(currentMetrics.spend, previousMetrics.spend),
        revenue: calculateTrend(currentMetrics.revenue, previousMetrics.revenue)
      },
      lastUpdated: now.toISOString()
    };
  }

  private async getMetricsForPeriod(
    start: string,
    end: string,
    options: { platform?: string; campaignId?: string }
  ): Promise<{
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
    revenue: number;
  }> {
    let sql = `
      SELECT 
        COALESCE(SUM(impressions), 0) as impressions,
        COALESCE(SUM(clicks), 0) as clicks,
        COALESCE(SUM(conversions), 0) as conversions,
        COALESCE(SUM(spend), 0) as spend,
        COALESCE(SUM(revenue), 0) as revenue
      FROM metrics_timeseries
      WHERE org_id = ? AND brand_id = ?
        AND timestamp >= ? AND timestamp <= ?
    `;

    const params: any[] = [this.context.orgId, this.context.brandId, start, end];

    if (options.platform) {
      sql += ' AND platform = ?';
      params.push(options.platform);
    }

    if (options.campaignId) {
      sql += ' AND campaign_id = ?';
      params.push(options.campaignId);
    }

    const result = await this.database.prepare(sql).bind(...params).first<any>();

    return {
      impressions: result?.impressions || 0,
      clicks: result?.clicks || 0,
      conversions: result?.conversions || 0,
      spend: result?.spend || 0,
      revenue: result?.revenue || 0
    };
  }

  // ============================================
  // DATA INGESTION
  // ============================================

  async ingestMetrics(data: {
    platform: string;
    campaignId?: string;
    adId?: string;
    timestamp: string;
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
    revenue: number;
    granularity?: Granularity;
  }): Promise<string> {
    const id = `ts_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const granularity = data.granularity || 'hour';

    // Calculate derived metrics
    const ctr = data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0;
    const cpc = data.clicks > 0 ? data.spend / data.clicks : 0;
    const cpa = data.conversions > 0 ? data.spend / data.conversions : 0;
    const roas = data.spend > 0 ? data.revenue / data.spend : 0;

    await this.database.prepare(`
      INSERT INTO metrics_timeseries (
        id, org_id, brand_id, timestamp, granularity, platform,
        campaign_id, ad_id, impressions, clicks, conversions,
        spend, revenue, ctr, cpc, cpa, roas
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      this.context.orgId,
      this.context.brandId,
      data.timestamp,
      granularity,
      data.platform,
      data.campaignId || null,
      data.adId || null,
      data.impressions,
      data.clicks,
      data.conversions,
      data.spend,
      data.revenue,
      ctr,
      cpc,
      cpa,
      roas
    ).run();

    // Invalidate cache for this tenant
    this.invalidateCache();

    return id;
  }

  async bulkIngest(metrics: Array<{
    platform: string;
    campaignId?: string;
    timestamp: string;
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
    revenue: number;
  }>): Promise<{ inserted: number; failed: number }> {
    let inserted = 0;
    let failed = 0;

    for (const metric of metrics) {
      try {
        await this.ingestMetrics(metric);
        inserted++;
      } catch (error) {
        failed++;
      }
    }

    return { inserted, failed };
  }

  private invalidateCache(): void {
    const prefix = `${this.context.orgId}:${this.context.brandId}:`;
    for (const key of cache.keys()) {
      if (key.startsWith(prefix)) {
        cache.delete(key);
      }
    }
  }

  // ============================================
  // CHART-READY DATA
  // ============================================

  async getChartData(options: {
    metric: 'impressions' | 'clicks' | 'conversions' | 'spend' | 'revenue' | 'ctr' | 'cpa' | 'roas';
    startDate: string;
    endDate: string;
    granularity: Granularity;
    platform?: string;
    compareWithPrevious?: boolean;
  }): Promise<{
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      color: string;
    }>;
    annotations?: any[];
  }> {
    const result = await this.query({
      startDate: options.startDate,
      endDate: options.endDate,
      granularity: options.granularity,
      platform: options.platform
    });

    const labels = result.data.map(d => d.timestamp);
    const data = result.data.map(d => (d as any)[options.metric] || 0);

    const datasets = [{
      label: this.formatMetricLabel(options.metric),
      data,
      color: this.getMetricColor(options.metric)
    }];

    // Optionally add previous period comparison
    if (options.compareWithPrevious) {
      const duration = new Date(options.endDate).getTime() - new Date(options.startDate).getTime();
      const previousStart = new Date(new Date(options.startDate).getTime() - duration);
      const previousEnd = new Date(options.startDate);

      const previousResult = await this.query({
        startDate: previousStart.toISOString(),
        endDate: previousEnd.toISOString(),
        granularity: options.granularity,
        platform: options.platform
      });

      datasets.push({
        label: `${this.formatMetricLabel(options.metric)} (Previous)`,
        data: previousResult.data.map(d => (d as any)[options.metric] || 0),
        color: '#9CA3AF' // Gray for previous period
      });
    }

    return { labels, datasets };
  }

  private formatMetricLabel(metric: string): string {
    const labels: Record<string, string> = {
      impressions: 'Impressions',
      clicks: 'Clicks',
      conversions: 'Conversions',
      spend: 'Spend ($)',
      revenue: 'Revenue ($)',
      ctr: 'CTR (%)',
      cpa: 'CPA ($)',
      roas: 'ROAS'
    };
    return labels[metric] || metric;
  }

  private getMetricColor(metric: string): string {
    const colors: Record<string, string> = {
      impressions: '#3B82F6', // Blue
      clicks: '#10B981', // Green
      conversions: '#8B5CF6', // Purple
      spend: '#EF4444', // Red
      revenue: '#22C55E', // Emerald
      ctr: '#F59E0B', // Amber
      cpa: '#EC4899', // Pink
      roas: '#6366F1' // Indigo
    };
    return colors[metric] || '#6B7280';
  }

  // ============================================
  // PLATFORM COMPARISON
  // ============================================

  async getPlatformComparison(options: {
    startDate: string;
    endDate: string;
    metrics?: string[];
  }): Promise<{
    platforms: Array<{
      name: string;
      impressions: number;
      clicks: number;
      conversions: number;
      spend: number;
      revenue: number;
      ctr: number;
      cpa: number;
      roas: number;
    }>;
    totals: {
      impressions: number;
      clicks: number;
      conversions: number;
      spend: number;
      revenue: number;
    };
  }> {
    const sql = `
      SELECT 
        platform,
        SUM(impressions) as impressions,
        SUM(clicks) as clicks,
        SUM(conversions) as conversions,
        SUM(spend) as spend,
        SUM(revenue) as revenue
      FROM metrics_timeseries
      WHERE org_id = ? AND brand_id = ?
        AND timestamp >= ? AND timestamp <= ?
      GROUP BY platform
      ORDER BY spend DESC
    `;

    const result = await this.database.prepare(sql).bind(
      this.context.orgId,
      this.context.brandId,
      options.startDate,
      options.endDate
    ).all<any>();

    const platforms = (result.results || []).map(row => ({
      name: row.platform,
      impressions: row.impressions || 0,
      clicks: row.clicks || 0,
      conversions: row.conversions || 0,
      spend: Math.round((row.spend || 0) * 100) / 100,
      revenue: Math.round((row.revenue || 0) * 100) / 100,
      ctr: row.impressions > 0 
        ? Math.round((row.clicks / row.impressions) * 10000) / 100 
        : 0,
      cpa: row.conversions > 0 
        ? Math.round((row.spend / row.conversions) * 100) / 100 
        : 0,
      roas: row.spend > 0 
        ? Math.round((row.revenue / row.spend) * 100) / 100 
        : 0
    }));

    const totals = platforms.reduce(
      (acc, p) => ({
        impressions: acc.impressions + p.impressions,
        clicks: acc.clicks + p.clicks,
        conversions: acc.conversions + p.conversions,
        spend: acc.spend + p.spend,
        revenue: acc.revenue + p.revenue
      }),
      { impressions: 0, clicks: 0, conversions: 0, spend: 0, revenue: 0 }
    );

    return { platforms, totals };
  }

  // ============================================
  // GENERATE SAMPLE DATA (for demo)
  // ============================================

  async generateSampleData(days: number = 90): Promise<{ inserted: number }> {
    const platforms = ['google', 'meta', 'tiktok', 'linkedin'];
    let inserted = 0;

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      for (const platform of platforms) {
        // Generate hourly data for recent days, daily for older
        const granularity = i < 7 ? 24 : 1;
        
        for (let h = 0; h < granularity; h++) {
          const timestamp = new Date(date);
          timestamp.setHours(i < 7 ? h : 12);

          // Generate realistic metrics with platform-specific patterns
          const baseSpend = this.getPlatformBaseSpend(platform);
          const trendFactor = 1 + (days - i) / days * 0.15; // 15% growth trend
          const hourFactor = i < 7 ? this.getHourlyFactor(h) : 1;
          const seasonFactor = 1 + 0.1 * Math.sin((i / 7) * Math.PI);

          const spend = baseSpend * trendFactor * hourFactor * seasonFactor * (0.9 + Math.random() * 0.2);
          const impressions = Math.floor(spend * this.getPlatformCPM(platform) * (0.9 + Math.random() * 0.2));
          const clicks = Math.floor(impressions * this.getPlatformCTR(platform) * (0.9 + Math.random() * 0.2));
          const conversions = Math.floor(clicks * this.getPlatformConvRate(platform) * (0.9 + Math.random() * 0.2));
          const revenue = conversions * this.getAverageOrderValue() * (0.9 + Math.random() * 0.2);

          try {
            await this.ingestMetrics({
              platform,
              timestamp: timestamp.toISOString(),
              impressions,
              clicks,
              conversions,
              spend: Math.round(spend * 100) / 100,
              revenue: Math.round(revenue * 100) / 100,
              granularity: i < 7 ? 'hour' : 'day'
            });
            inserted++;
          } catch (error) {
            // Skip duplicates
          }
        }
      }
    }

    return { inserted };
  }

  private getPlatformBaseSpend(platform: string): number {
    const baseSpends: Record<string, number> = {
      google: 150,
      meta: 200,
      tiktok: 75,
      linkedin: 100
    };
    return baseSpends[platform] || 100;
  }

  private getPlatformCPM(platform: string): number {
    const cpms: Record<string, number> = {
      google: 80,
      meta: 100,
      tiktok: 150,
      linkedin: 50
    };
    return cpms[platform] || 100;
  }

  private getPlatformCTR(platform: string): number {
    const ctrs: Record<string, number> = {
      google: 0.035,
      meta: 0.012,
      tiktok: 0.015,
      linkedin: 0.025
    };
    return ctrs[platform] || 0.02;
  }

  private getPlatformConvRate(platform: string): number {
    const rates: Record<string, number> = {
      google: 0.04,
      meta: 0.025,
      tiktok: 0.02,
      linkedin: 0.03
    };
    return rates[platform] || 0.025;
  }

  private getAverageOrderValue(): number {
    return 85 + Math.random() * 30;
  }

  private getHourlyFactor(hour: number): number {
    // Peak hours: 9-11, 14-16, 19-21
    if (hour >= 9 && hour <= 11) return 1.3;
    if (hour >= 14 && hour <= 16) return 1.2;
    if (hour >= 19 && hour <= 21) return 1.4;
    if (hour >= 0 && hour <= 6) return 0.4;
    return 1.0;
  }
}

// Factory function
export function createTimeSeriesAggregator(
  database: D1Database,
  context: TenantContext
): TimeSeriesAggregator {
  return new TimeSeriesAggregator(database, context);
}
