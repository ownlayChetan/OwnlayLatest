// Marketing Database Operations for Cloudflare D1
// Handles all marketing-related data queries

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface MarketingCampaign {
  id: string;
  user_id: string;
  name: string;
  status: string;
  objective: string | null;
  platforms: string | null; // JSON array
  budget_daily: number;
  budget_total: number;
  start_date: string | null;
  end_date: string | null;
  target_audience: string | null; // JSON
  created_at: string;
  updated_at: string;
}

export interface MarketingAd {
  id: string;
  campaign_id: string;
  user_id: string;
  name: string;
  platform: string;
  status: string;
  ad_type: string | null;
  headline: string | null;
  description: string | null;
  cta: string | null;
  creative_url: string | null;
  destination_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface MarketingMetrics {
  id: string;
  user_id: string;
  campaign_id: string | null;
  ad_id: string | null;
  platform: string;
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
  ctr: number;
  cpa: number;
  roas: number;
  created_at: string;
}

export interface AudienceSegment {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  segment_type: string;
  criteria: string | null; // JSON
  size: number;
  status: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface AutomationWorkflow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  status: string;
  trigger_type: string;
  trigger_config: string | null; // JSON
  steps: string | null; // JSON
  runs_today: number;
  total_runs: number;
  success_rate: number;
  last_run_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AIInsight {
  id: string;
  user_id: string;
  insight_type: string;
  title: string;
  description: string;
  impact: string | null;
  confidence: number;
  action_type: string | null;
  action_params: string | null; // JSON
  status: string;
  created_at: string;
  applied_at: string | null;
}

export interface AIGeneratedContent {
  id: string;
  user_id: string;
  content_type: string;
  prompt: string;
  generated_text: string;
  tone: string | null;
  platform: string | null;
  score: number;
  used: number;
  created_at: string;
}

export interface CreativeAsset {
  id: string;
  user_id: string;
  name: string;
  asset_type: string;
  file_url: string | null;
  thumbnail_url: string | null;
  dimensions: string | null;
  format: string | null;
  file_size: number | null;
  tags: string | null; // JSON
  used_in_ads: number;
  performance_score: number;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  currency: string;
  locale: string;
  timezone: string;
  notifications: string; // JSON
  dashboard_layout: string; // JSON
  brand_guidelines: string; // JSON
  created_at: string;
  updated_at: string;
}

// ============================================
// DATABASE OPERATIONS
// ============================================

export const marketingDb = {
  // ============================================
  // MARKETING CAMPAIGNS
  // ============================================
  
  async getCampaigns(database: D1Database, userId: string, status?: string): Promise<MarketingCampaign[]> {
    let query = 'SELECT * FROM marketing_campaigns WHERE user_id = ?';
    const params: any[] = [userId];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY updated_at DESC';
    const result = await database.prepare(query).bind(...params).all<MarketingCampaign>();
    return result.results || [];
  },

  async getCampaignById(database: D1Database, campaignId: string): Promise<MarketingCampaign | null> {
    const result = await database.prepare(
      'SELECT * FROM marketing_campaigns WHERE id = ?'
    ).bind(campaignId).first<MarketingCampaign>();
    return result;
  },

  async createCampaign(database: D1Database, campaign: Partial<MarketingCampaign>): Promise<string> {
    const id = campaign.id || `mcamp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await database.prepare(`
      INSERT INTO marketing_campaigns (id, user_id, name, status, objective, platforms, budget_daily, budget_total, start_date, end_date, target_audience)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      campaign.user_id,
      campaign.name,
      campaign.status || 'draft',
      campaign.objective || null,
      campaign.platforms || null,
      campaign.budget_daily || 0,
      campaign.budget_total || 0,
      campaign.start_date || null,
      campaign.end_date || null,
      campaign.target_audience || null
    ).run();
    return id;
  },

  async updateCampaign(database: D1Database, campaignId: string, updates: Partial<MarketingCampaign>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];
    
    if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
    if (updates.status !== undefined) { fields.push('status = ?'); values.push(updates.status); }
    if (updates.objective !== undefined) { fields.push('objective = ?'); values.push(updates.objective); }
    if (updates.platforms !== undefined) { fields.push('platforms = ?'); values.push(updates.platforms); }
    if (updates.budget_daily !== undefined) { fields.push('budget_daily = ?'); values.push(updates.budget_daily); }
    if (updates.budget_total !== undefined) { fields.push('budget_total = ?'); values.push(updates.budget_total); }
    if (updates.start_date !== undefined) { fields.push('start_date = ?'); values.push(updates.start_date); }
    if (updates.end_date !== undefined) { fields.push('end_date = ?'); values.push(updates.end_date); }
    if (updates.target_audience !== undefined) { fields.push('target_audience = ?'); values.push(updates.target_audience); }
    
    if (fields.length > 0) {
      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(campaignId);
      await database.prepare(`UPDATE marketing_campaigns SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();
    }
  },

  async deleteCampaign(database: D1Database, campaignId: string): Promise<void> {
    await database.prepare('DELETE FROM marketing_campaigns WHERE id = ?').bind(campaignId).run();
  },

  // ============================================
  // MARKETING ADS
  // ============================================
  
  async getAds(database: D1Database, userId: string, campaignId?: string): Promise<MarketingAd[]> {
    let query = 'SELECT * FROM marketing_ads WHERE user_id = ?';
    const params: any[] = [userId];
    
    if (campaignId) {
      query += ' AND campaign_id = ?';
      params.push(campaignId);
    }
    
    query += ' ORDER BY updated_at DESC';
    const result = await database.prepare(query).bind(...params).all<MarketingAd>();
    return result.results || [];
  },

  async getAdById(database: D1Database, adId: string): Promise<MarketingAd | null> {
    const result = await database.prepare(
      'SELECT * FROM marketing_ads WHERE id = ?'
    ).bind(adId).first<MarketingAd>();
    return result;
  },

  async createAd(database: D1Database, ad: Partial<MarketingAd>): Promise<string> {
    const id = ad.id || `mad_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await database.prepare(`
      INSERT INTO marketing_ads (id, campaign_id, user_id, name, platform, status, ad_type, headline, description, cta, creative_url, destination_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      ad.campaign_id,
      ad.user_id,
      ad.name,
      ad.platform,
      ad.status || 'draft',
      ad.ad_type || null,
      ad.headline || null,
      ad.description || null,
      ad.cta || null,
      ad.creative_url || null,
      ad.destination_url || null
    ).run();
    return id;
  },

  async updateAd(database: D1Database, adId: string, updates: Partial<MarketingAd>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];
    
    if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
    if (updates.status !== undefined) { fields.push('status = ?'); values.push(updates.status); }
    if (updates.ad_type !== undefined) { fields.push('ad_type = ?'); values.push(updates.ad_type); }
    if (updates.headline !== undefined) { fields.push('headline = ?'); values.push(updates.headline); }
    if (updates.description !== undefined) { fields.push('description = ?'); values.push(updates.description); }
    if (updates.cta !== undefined) { fields.push('cta = ?'); values.push(updates.cta); }
    if (updates.creative_url !== undefined) { fields.push('creative_url = ?'); values.push(updates.creative_url); }
    if (updates.destination_url !== undefined) { fields.push('destination_url = ?'); values.push(updates.destination_url); }
    
    if (fields.length > 0) {
      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(adId);
      await database.prepare(`UPDATE marketing_ads SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();
    }
  },

  // ============================================
  // MARKETING METRICS
  // ============================================
  
  async getMetrics(database: D1Database, userId: string, options?: {
    startDate?: string;
    endDate?: string;
    platform?: string;
    campaignId?: string;
  }): Promise<MarketingMetrics[]> {
    let query = 'SELECT * FROM marketing_metrics WHERE user_id = ?';
    const params: any[] = [userId];
    
    if (options?.startDate) {
      query += ' AND date >= ?';
      params.push(options.startDate);
    }
    if (options?.endDate) {
      query += ' AND date <= ?';
      params.push(options.endDate);
    }
    if (options?.platform) {
      query += ' AND platform = ?';
      params.push(options.platform);
    }
    if (options?.campaignId) {
      query += ' AND campaign_id = ?';
      params.push(options.campaignId);
    }
    
    query += ' ORDER BY date DESC';
    const result = await database.prepare(query).bind(...params).all<MarketingMetrics>();
    return result.results || [];
  },

  async getAggregatedMetrics(database: D1Database, userId: string, days: number = 30): Promise<{
    totalSpend: number;
    totalRevenue: number;
    totalConversions: number;
    totalImpressions: number;
    totalClicks: number;
    avgRoas: number;
    avgCpa: number;
    avgCtr: number;
  }> {
    const result = await database.prepare(`
      SELECT 
        COALESCE(SUM(spend), 0) as totalSpend,
        COALESCE(SUM(revenue), 0) as totalRevenue,
        COALESCE(SUM(conversions), 0) as totalConversions,
        COALESCE(SUM(impressions), 0) as totalImpressions,
        COALESCE(SUM(clicks), 0) as totalClicks
      FROM marketing_metrics 
      WHERE user_id = ? AND date >= date('now', '-' || ? || ' days')
    `).bind(userId, days).first<{
      totalSpend: number;
      totalRevenue: number;
      totalConversions: number;
      totalImpressions: number;
      totalClicks: number;
    }>();
    
    const data = result || { totalSpend: 0, totalRevenue: 0, totalConversions: 0, totalImpressions: 0, totalClicks: 0 };
    
    return {
      ...data,
      avgRoas: data.totalSpend > 0 ? data.totalRevenue / data.totalSpend : 0,
      avgCpa: data.totalConversions > 0 ? data.totalSpend / data.totalConversions : 0,
      avgCtr: data.totalImpressions > 0 ? (data.totalClicks / data.totalImpressions) * 100 : 0
    };
  },

  async getMetricsByPlatform(database: D1Database, userId: string, days: number = 30): Promise<any[]> {
    const result = await database.prepare(`
      SELECT 
        platform,
        SUM(spend) as spend,
        SUM(revenue) as revenue,
        SUM(conversions) as conversions,
        SUM(impressions) as impressions,
        SUM(clicks) as clicks
      FROM marketing_metrics 
      WHERE user_id = ? AND date >= date('now', '-' || ? || ' days')
      GROUP BY platform
      ORDER BY spend DESC
    `).bind(userId, days).all();
    return result.results || [];
  },

  async upsertMetrics(database: D1Database, metrics: Partial<MarketingMetrics>): Promise<void> {
    const id = metrics.id || `mm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await database.prepare(`
      INSERT INTO marketing_metrics (id, user_id, campaign_id, ad_id, platform, date, impressions, clicks, conversions, spend, revenue, ctr, cpa, roas)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, campaign_id, ad_id, platform, date) DO UPDATE SET
        impressions = excluded.impressions,
        clicks = excluded.clicks,
        conversions = excluded.conversions,
        spend = excluded.spend,
        revenue = excluded.revenue,
        ctr = excluded.ctr,
        cpa = excluded.cpa,
        roas = excluded.roas
    `).bind(
      id,
      metrics.user_id,
      metrics.campaign_id || null,
      metrics.ad_id || null,
      metrics.platform,
      metrics.date,
      metrics.impressions || 0,
      metrics.clicks || 0,
      metrics.conversions || 0,
      metrics.spend || 0,
      metrics.revenue || 0,
      metrics.ctr || 0,
      metrics.cpa || 0,
      metrics.roas || 0
    ).run();
  },

  // ============================================
  // AUDIENCE SEGMENTS
  // ============================================
  
  async getSegments(database: D1Database, userId: string): Promise<AudienceSegment[]> {
    const result = await database.prepare(
      'SELECT * FROM audience_segments WHERE user_id = ? AND status = ? ORDER BY size DESC'
    ).bind(userId, 'active').all<AudienceSegment>();
    return result.results || [];
  },

  async createSegment(database: D1Database, segment: Partial<AudienceSegment>): Promise<string> {
    const id = segment.id || `seg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await database.prepare(`
      INSERT INTO audience_segments (id, user_id, name, description, segment_type, criteria, size, color)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      segment.user_id,
      segment.name,
      segment.description || null,
      segment.segment_type || 'custom',
      segment.criteria || null,
      segment.size || 0,
      segment.color || 'blue'
    ).run();
    return id;
  },

  async updateSegmentSize(database: D1Database, segmentId: string, size: number): Promise<void> {
    await database.prepare(
      'UPDATE audience_segments SET size = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(size, segmentId).run();
  },

  // ============================================
  // AUTOMATION WORKFLOWS
  // ============================================
  
  async getWorkflows(database: D1Database, userId: string): Promise<AutomationWorkflow[]> {
    const result = await database.prepare(
      'SELECT * FROM automation_workflows WHERE user_id = ? ORDER BY updated_at DESC'
    ).bind(userId).all<AutomationWorkflow>();
    return result.results || [];
  },

  async getActiveWorkflows(database: D1Database, userId: string): Promise<AutomationWorkflow[]> {
    const result = await database.prepare(
      'SELECT * FROM automation_workflows WHERE user_id = ? AND status = ? ORDER BY runs_today DESC'
    ).bind(userId, 'active').all<AutomationWorkflow>();
    return result.results || [];
  },

  async createWorkflow(database: D1Database, workflow: Partial<AutomationWorkflow>): Promise<string> {
    const id = workflow.id || `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await database.prepare(`
      INSERT INTO automation_workflows (id, user_id, name, description, status, trigger_type, trigger_config, steps)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      workflow.user_id,
      workflow.name,
      workflow.description || null,
      workflow.status || 'draft',
      workflow.trigger_type,
      workflow.trigger_config || null,
      workflow.steps || null
    ).run();
    return id;
  },

  async updateWorkflowStats(database: D1Database, workflowId: string, success: boolean): Promise<void> {
    await database.prepare(`
      UPDATE automation_workflows 
      SET runs_today = runs_today + 1, 
          total_runs = total_runs + 1,
          last_run_at = CURRENT_TIMESTAMP,
          success_rate = CASE WHEN total_runs > 0 
            THEN (success_rate * total_runs + ?) / (total_runs + 1) 
            ELSE ? END,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(success ? 100 : 0, success ? 100 : 0, workflowId).run();
  },

  // ============================================
  // AI INSIGHTS
  // ============================================
  
  async getInsights(database: D1Database, userId: string, status?: string): Promise<AIInsight[]> {
    let query = 'SELECT * FROM ai_insights WHERE user_id = ?';
    const params: any[] = [userId];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY created_at DESC LIMIT 50';
    const result = await database.prepare(query).bind(...params).all<AIInsight>();
    return result.results || [];
  },

  async createInsight(database: D1Database, insight: Partial<AIInsight>): Promise<string> {
    const id = insight.id || `ins_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await database.prepare(`
      INSERT INTO ai_insights (id, user_id, insight_type, title, description, impact, confidence, action_type, action_params, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      insight.user_id,
      insight.insight_type,
      insight.title,
      insight.description,
      insight.impact || null,
      insight.confidence || 0,
      insight.action_type || null,
      insight.action_params || null,
      insight.status || 'pending'
    ).run();
    return id;
  },

  async applyInsight(database: D1Database, insightId: string): Promise<void> {
    await database.prepare(
      'UPDATE ai_insights SET status = ?, applied_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind('applied', insightId).run();
  },

  async dismissInsight(database: D1Database, insightId: string): Promise<void> {
    await database.prepare(
      'UPDATE ai_insights SET status = ? WHERE id = ?'
    ).bind('dismissed', insightId).run();
  },

  // ============================================
  // AI GENERATED CONTENT
  // ============================================
  
  async getGeneratedContent(database: D1Database, userId: string, contentType?: string): Promise<AIGeneratedContent[]> {
    let query = 'SELECT * FROM ai_generated_content WHERE user_id = ?';
    const params: any[] = [userId];
    
    if (contentType) {
      query += ' AND content_type = ?';
      params.push(contentType);
    }
    
    query += ' ORDER BY created_at DESC LIMIT 100';
    const result = await database.prepare(query).bind(...params).all<AIGeneratedContent>();
    return result.results || [];
  },

  async saveGeneratedContent(database: D1Database, content: Partial<AIGeneratedContent>): Promise<string> {
    const id = content.id || `aigc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await database.prepare(`
      INSERT INTO ai_generated_content (id, user_id, content_type, prompt, generated_text, tone, platform, score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      content.user_id,
      content.content_type,
      content.prompt,
      content.generated_text,
      content.tone || null,
      content.platform || null,
      content.score || 0
    ).run();
    return id;
  },

  async markContentUsed(database: D1Database, contentId: string): Promise<void> {
    await database.prepare(
      'UPDATE ai_generated_content SET used = 1 WHERE id = ?'
    ).bind(contentId).run();
  },

  // ============================================
  // AI CHAT HISTORY
  // ============================================
  
  async getChatHistory(database: D1Database, userId: string, limit: number = 20): Promise<any[]> {
    const result = await database.prepare(
      'SELECT * FROM ai_chat_history WHERE user_id = ? ORDER BY created_at DESC LIMIT ?'
    ).bind(userId, limit).all();
    return (result.results || []).reverse(); // Return in chronological order
  },

  async saveChatMessage(database: D1Database, message: {
    user_id: string;
    role: string;
    content: string;
    context?: string;
  }): Promise<string> {
    const id = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await database.prepare(`
      INSERT INTO ai_chat_history (id, user_id, role, content, context)
      VALUES (?, ?, ?, ?, ?)
    `).bind(id, message.user_id, message.role, message.content, message.context || null).run();
    return id;
  },

  // ============================================
  // CREATIVE ASSETS
  // ============================================
  
  async getCreativeAssets(database: D1Database, userId: string, assetType?: string): Promise<CreativeAsset[]> {
    let query = 'SELECT * FROM creative_assets WHERE user_id = ?';
    const params: any[] = [userId];
    
    if (assetType) {
      query += ' AND asset_type = ?';
      params.push(assetType);
    }
    
    query += ' ORDER BY created_at DESC';
    const result = await database.prepare(query).bind(...params).all<CreativeAsset>();
    return result.results || [];
  },

  async saveCreativeAsset(database: D1Database, asset: Partial<CreativeAsset>): Promise<string> {
    const id = asset.id || `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await database.prepare(`
      INSERT INTO creative_assets (id, user_id, name, asset_type, file_url, thumbnail_url, dimensions, format, file_size, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      asset.user_id,
      asset.name,
      asset.asset_type,
      asset.file_url || null,
      asset.thumbnail_url || null,
      asset.dimensions || null,
      asset.format || null,
      asset.file_size || null,
      asset.tags || null
    ).run();
    return id;
  },

  // ============================================
  // USER SETTINGS
  // ============================================
  
  async getUserSettings(database: D1Database, userId: string): Promise<UserSettings | null> {
    const result = await database.prepare(
      'SELECT * FROM user_settings WHERE user_id = ?'
    ).bind(userId).first<UserSettings>();
    return result;
  },

  async upsertUserSettings(database: D1Database, userId: string, settings: Partial<UserSettings>): Promise<void> {
    const id = `settings_${userId}`;
    await database.prepare(`
      INSERT INTO user_settings (id, user_id, currency, locale, timezone, notifications, dashboard_layout, brand_guidelines)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        currency = COALESCE(excluded.currency, user_settings.currency),
        locale = COALESCE(excluded.locale, user_settings.locale),
        timezone = COALESCE(excluded.timezone, user_settings.timezone),
        notifications = COALESCE(excluded.notifications, user_settings.notifications),
        dashboard_layout = COALESCE(excluded.dashboard_layout, user_settings.dashboard_layout),
        brand_guidelines = COALESCE(excluded.brand_guidelines, user_settings.brand_guidelines),
        updated_at = CURRENT_TIMESTAMP
    `).bind(
      id,
      userId,
      settings.currency || 'USD',
      settings.locale || 'en-US',
      settings.timezone || 'UTC',
      settings.notifications || '{}',
      settings.dashboard_layout || '{}',
      settings.brand_guidelines || '{}'
    ).run();
  },

  // ============================================
  // INTEGRATION SYNC DATA
  // ============================================
  
  async getSyncData(database: D1Database, userId: string, platform: string, dataType: string): Promise<any | null> {
    const result = await database.prepare(
      'SELECT data, synced_at FROM integration_sync_data WHERE user_id = ? AND platform = ? AND data_type = ?'
    ).bind(userId, platform, dataType).first<{ data: string; synced_at: string }>();
    
    if (result) {
      return {
        data: JSON.parse(result.data),
        synced_at: result.synced_at
      };
    }
    return null;
  },

  async saveSyncData(database: D1Database, userId: string, platform: string, dataType: string, data: any): Promise<void> {
    const id = `sync_${userId}_${platform}_${dataType}`;
    await database.prepare(`
      INSERT INTO integration_sync_data (id, user_id, platform, data_type, data, synced_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id, platform, data_type) DO UPDATE SET
        data = excluded.data,
        synced_at = CURRENT_TIMESTAMP
    `).bind(id, userId, platform, dataType, JSON.stringify(data)).run();
  },

  // ============================================
  // DASHBOARD AGGREGATIONS
  // ============================================
  
  async getDashboardData(database: D1Database, userId: string, days: number = 30): Promise<{
    metrics: any;
    platformBreakdown: any[];
    recentCampaigns: any[];
    topAds: any[];
    insights: any[];
  }> {
    // Get aggregated metrics
    const metrics = await this.getAggregatedMetrics(database, userId, days);
    
    // Get platform breakdown
    const platformBreakdown = await this.getMetricsByPlatform(database, userId, days);
    
    // Get recent campaigns
    const campaigns = await this.getCampaigns(database, userId);
    const recentCampaigns = campaigns.slice(0, 5);
    
    // Get top performing ads
    const ads = await this.getAds(database, userId);
    const topAds = ads.slice(0, 5);
    
    // Get pending insights
    const insights = await this.getInsights(database, userId, 'pending');
    
    return {
      metrics,
      platformBreakdown,
      recentCampaigns,
      topAds,
      insights: insights.slice(0, 5)
    };
  },

  // ============================================
  // CREATIVE STUDIO - CREATIVES
  // ============================================
  
  async getCreatives(database: D1Database, userId: string, filters?: {
    status?: string;
    creative_type?: string;
    platform?: string;
    limit?: number;
  }): Promise<any[]> {
    let query = 'SELECT * FROM creatives WHERE user_id = ?';
    const params: any[] = [userId];
    
    if (filters?.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    if (filters?.creative_type) {
      query += ' AND creative_type = ?';
      params.push(filters.creative_type);
    }
    if (filters?.platform) {
      query += ' AND platform = ?';
      params.push(filters.platform);
    }
    
    query += ' ORDER BY updated_at DESC';
    
    if (filters?.limit) {
      query += ` LIMIT ${filters.limit}`;
    }
    
    const result = await database.prepare(query).bind(...params).all();
    return result.results || [];
  },

  async createCreative(database: D1Database, creative: {
    user_id: string;
    workspace_id?: string;
    name: string;
    creative_type: string;
    status?: string;
    platform?: string;
    headline?: string;
    body_text?: string;
    cta?: string;
    destination_url?: string;
    file_url?: string;
    thumbnail_url?: string;
    background_image_url?: string;
    dimensions?: string;
    aspect_ratio?: string;
    file_size?: number;
    file_format?: string;
    duration?: number;
    campaign_id?: string;
    tags?: string;
    brand_colors?: string;
    fonts_used?: string;
  }): Promise<string> {
    const id = `creative_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await database.prepare(`
      INSERT INTO creatives (
        id, user_id, workspace_id, name, creative_type, status, platform,
        headline, body_text, cta, destination_url, file_url, thumbnail_url,
        background_image_url, dimensions, aspect_ratio, file_size, file_format,
        duration, campaign_id, tags, brand_colors, fonts_used
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      creative.user_id,
      creative.workspace_id || null,
      creative.name,
      creative.creative_type,
      creative.status || 'draft',
      creative.platform || null,
      creative.headline || null,
      creative.body_text || null,
      creative.cta || null,
      creative.destination_url || null,
      creative.file_url || null,
      creative.thumbnail_url || null,
      creative.background_image_url || null,
      creative.dimensions || null,
      creative.aspect_ratio || null,
      creative.file_size || null,
      creative.file_format || null,
      creative.duration || null,
      creative.campaign_id || null,
      creative.tags || null,
      creative.brand_colors || null,
      creative.fonts_used || null
    ).run();
    
    return id;
  },

  async updateCreative(database: D1Database, creativeId: string, updates: any): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];
    
    const allowedFields = [
      'name', 'status', 'platform', 'headline', 'body_text', 'cta',
      'destination_url', 'file_url', 'thumbnail_url', 'background_image_url',
      'dimensions', 'aspect_ratio', 'file_size', 'file_format', 'duration',
      'campaign_id', 'impressions', 'clicks', 'conversions', 'ctr', 'spend',
      'revenue', 'roas', 'tags', 'brand_colors', 'fonts_used', 'last_synced_at'
    ];
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(updates[field]);
      }
    }
    
    if (fields.length > 0) {
      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(creativeId);
      await database.prepare(
        `UPDATE creatives SET ${fields.join(', ')} WHERE id = ?`
      ).bind(...values).run();
    }
  },

  async deleteCreative(database: D1Database, creativeId: string): Promise<void> {
    await database.prepare('DELETE FROM creatives WHERE id = ?').bind(creativeId).run();
  },

  async getCreativeStats(database: D1Database, userId: string): Promise<{
    totalCreatives: number;
    imageCount: number;
    videoCount: number;
    carouselCount: number;
    activeCount: number;
    totalImpressions: number;
    totalClicks: number;
    avgCtr: number;
  }> {
    const result = await database.prepare(`
      SELECT 
        COUNT(*) as totalCreatives,
        SUM(CASE WHEN creative_type = 'image' THEN 1 ELSE 0 END) as imageCount,
        SUM(CASE WHEN creative_type = 'video' THEN 1 ELSE 0 END) as videoCount,
        SUM(CASE WHEN creative_type = 'carousel' THEN 1 ELSE 0 END) as carouselCount,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeCount,
        COALESCE(SUM(impressions), 0) as totalImpressions,
        COALESCE(SUM(clicks), 0) as totalClicks
      FROM creatives WHERE user_id = ?
    `).bind(userId).first<{
      totalCreatives: number;
      imageCount: number;
      videoCount: number;
      carouselCount: number;
      activeCount: number;
      totalImpressions: number;
      totalClicks: number;
    }>();
    
    const data = result || { 
      totalCreatives: 0, imageCount: 0, videoCount: 0, carouselCount: 0,
      activeCount: 0, totalImpressions: 0, totalClicks: 0 
    };
    
    return {
      ...data,
      avgCtr: data.totalImpressions > 0 ? (data.totalClicks / data.totalImpressions) * 100 : 0
    };
  },

  async getCreativePerformanceByType(database: D1Database, userId: string): Promise<any[]> {
    const result = await database.prepare(`
      SELECT 
        creative_type as type,
        COUNT(*) as count,
        COALESCE(AVG(ctr), 0) as avgCtr,
        COALESCE(SUM(conversions), 0) as totalConversions,
        COALESCE(SUM(impressions), 0) as totalImpressions
      FROM creatives 
      WHERE user_id = ?
      GROUP BY creative_type
      ORDER BY avgCtr DESC
    `).bind(userId).all();
    return result.results || [];
  },

  // ============================================
  // CREATIVE STUDIO - AI COPIES
  // ============================================
  
  async saveAICopy(database: D1Database, copy: {
    user_id: string;
    workspace_id?: string;
    prompt: string;
    product_description?: string;
    tone?: string;
    target_platform?: string;
    copy_type: string;
    generated_text: string;
    score?: number;
  }): Promise<string> {
    const id = `copy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await database.prepare(`
      INSERT INTO ai_copies (
        id, user_id, workspace_id, prompt, product_description, tone,
        target_platform, copy_type, generated_text, score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      copy.user_id,
      copy.workspace_id || null,
      copy.prompt,
      copy.product_description || null,
      copy.tone || 'professional',
      copy.target_platform || 'all',
      copy.copy_type,
      copy.generated_text,
      copy.score || 0
    ).run();
    
    return id;
  },

  async getAICopies(database: D1Database, userId: string, filters?: {
    copy_type?: string;
    is_used?: boolean;
    limit?: number;
  }): Promise<any[]> {
    let query = 'SELECT * FROM ai_copies WHERE user_id = ?';
    const params: any[] = [userId];
    
    if (filters?.copy_type) {
      query += ' AND copy_type = ?';
      params.push(filters.copy_type);
    }
    if (filters?.is_used !== undefined) {
      query += ' AND is_used = ?';
      params.push(filters.is_used ? 1 : 0);
    }
    
    query += ' ORDER BY created_at DESC';
    
    if (filters?.limit) {
      query += ` LIMIT ${filters.limit}`;
    }
    
    const result = await database.prepare(query).bind(...params).all();
    return result.results || [];
  },

  async markAICopyUsed(database: D1Database, copyId: string, creativeId: string): Promise<void> {
    await database.prepare(`
      UPDATE ai_copies SET is_used = 1, creative_id = ? WHERE id = ?
    `).bind(creativeId, copyId).run();
  },

  async getAICopyCount(database: D1Database, userId: string): Promise<number> {
    const result = await database.prepare(
      'SELECT COUNT(*) as count FROM ai_copies WHERE user_id = ?'
    ).bind(userId).first<{ count: number }>();
    return result?.count || 0;
  },

  // ============================================
  // CREATIVE STUDIO - BRAND ASSETS
  // ============================================
  
  async getBrandAssets(database: D1Database, userId: string, assetType?: string): Promise<any[]> {
    let query = 'SELECT * FROM brand_assets WHERE user_id = ?';
    const params: any[] = [userId];
    
    if (assetType) {
      query += ' AND asset_type = ?';
      params.push(assetType);
    }
    
    query += ' ORDER BY is_primary DESC, usage_count DESC';
    
    const result = await database.prepare(query).bind(...params).all();
    return result.results || [];
  },

  async saveBrandAsset(database: D1Database, asset: {
    user_id: string;
    workspace_id?: string;
    asset_type: string;
    name: string;
    value: string;
    file_url?: string;
    thumbnail_url?: string;
    file_size?: number;
    dimensions?: string;
    is_primary?: boolean;
  }): Promise<string> {
    const id = `basset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await database.prepare(`
      INSERT INTO brand_assets (
        id, user_id, workspace_id, asset_type, name, value,
        file_url, thumbnail_url, file_size, dimensions, is_primary
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      asset.user_id,
      asset.workspace_id || null,
      asset.asset_type,
      asset.name,
      asset.value,
      asset.file_url || null,
      asset.thumbnail_url || null,
      asset.file_size || null,
      asset.dimensions || null,
      asset.is_primary ? 1 : 0
    ).run();
    
    return id;
  },

  async deleteBrandAsset(database: D1Database, assetId: string): Promise<void> {
    await database.prepare('DELETE FROM brand_assets WHERE id = ?').bind(assetId).run();
  },

  async updateBrandAssetUsage(database: D1Database, assetId: string): Promise<void> {
    await database.prepare(
      'UPDATE brand_assets SET usage_count = usage_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(assetId).run();
  },

  // ============================================
  // CREATIVE STUDIO - TEMPLATES
  // ============================================
  
  async getCreativeTemplates(database: D1Database, filters?: {
    template_type?: string;
    platform?: string;
    category?: string;
    is_premium?: boolean;
  }): Promise<any[]> {
    let query = 'SELECT * FROM creative_templates WHERE is_active = 1';
    const params: any[] = [];
    
    if (filters?.template_type) {
      query += ' AND template_type = ?';
      params.push(filters.template_type);
    }
    if (filters?.platform) {
      query += ' AND (platform = ? OR platform = ?)';
      params.push(filters.platform, 'all');
    }
    if (filters?.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }
    if (filters?.is_premium !== undefined) {
      query += ' AND is_premium = ?';
      params.push(filters.is_premium ? 1 : 0);
    }
    
    query += ' ORDER BY usage_count DESC, rating DESC';
    
    const result = await database.prepare(query).bind(...params).all();
    return result.results || [];
  },

  async incrementTemplateUsage(database: D1Database, templateId: string): Promise<void> {
    await database.prepare(
      'UPDATE creative_templates SET usage_count = usage_count + 1 WHERE id = ?'
    ).bind(templateId).run();
  },

  // ============================================
  // CREATIVE STUDIO - TYPE METRICS
  // ============================================
  
  async getCreativeTypeMetrics(database: D1Database, userId: string, days: number = 30): Promise<any[]> {
    const result = await database.prepare(`
      SELECT 
        creative_type,
        platform,
        SUM(total_creatives) as totalCreatives,
        SUM(total_impressions) as totalImpressions,
        SUM(total_clicks) as totalClicks,
        SUM(total_conversions) as totalConversions,
        SUM(total_spend) as totalSpend,
        SUM(total_revenue) as totalRevenue,
        AVG(avg_ctr) as avgCtr,
        AVG(avg_roas) as avgRoas
      FROM creative_type_metrics
      WHERE user_id = ? AND date >= date('now', '-' || ? || ' days')
      GROUP BY creative_type, platform
      ORDER BY totalConversions DESC
    `).bind(userId, days).all();
    return result.results || [];
  },

  async upsertCreativeTypeMetrics(database: D1Database, metrics: {
    user_id: string;
    workspace_id?: string;
    creative_type: string;
    platform: string;
    date: string;
    total_creatives: number;
    total_impressions: number;
    total_clicks: number;
    total_conversions: number;
    total_spend: number;
    total_revenue: number;
  }): Promise<void> {
    const id = `ctm_${metrics.user_id}_${metrics.creative_type}_${metrics.platform}_${metrics.date}`;
    
    const avgCtr = metrics.total_impressions > 0 ? (metrics.total_clicks / metrics.total_impressions) * 100 : 0;
    const avgCvr = metrics.total_clicks > 0 ? (metrics.total_conversions / metrics.total_clicks) * 100 : 0;
    const avgRoas = metrics.total_spend > 0 ? metrics.total_revenue / metrics.total_spend : 0;
    
    await database.prepare(`
      INSERT INTO creative_type_metrics (
        id, user_id, workspace_id, creative_type, platform, date,
        total_creatives, total_impressions, total_clicks, total_conversions,
        total_spend, total_revenue, avg_ctr, avg_cvr, avg_roas
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, creative_type, platform, date) DO UPDATE SET
        total_creatives = excluded.total_creatives,
        total_impressions = excluded.total_impressions,
        total_clicks = excluded.total_clicks,
        total_conversions = excluded.total_conversions,
        total_spend = excluded.total_spend,
        total_revenue = excluded.total_revenue,
        avg_ctr = excluded.avg_ctr,
        avg_cvr = excluded.avg_cvr,
        avg_roas = excluded.avg_roas
    `).bind(
      id,
      metrics.user_id,
      metrics.workspace_id || null,
      metrics.creative_type,
      metrics.platform,
      metrics.date,
      metrics.total_creatives,
      metrics.total_impressions,
      metrics.total_clicks,
      metrics.total_conversions,
      metrics.total_spend,
      metrics.total_revenue,
      avgCtr,
      avgCvr,
      avgRoas
    ).run();
  }
};
