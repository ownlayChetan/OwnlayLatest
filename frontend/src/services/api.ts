import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  ApiResponse,
  User,
  LoginCredentials,
  RegisterData,
  DashboardMetrics,
  ChannelMetrics,
  Campaign,
  Ad,
  Integration,
  AIInsight,
  TenantContext,
  Organization,
  Brand,
  ResearchResult,
  StrategyResult,
  CreativeResult,
  AuditResult,
  OrchestratorResult,
  AgentActivity,
  AgentDecision,
  ApprovalItem,
  ROIPrediction,
} from '@/types';

// ============================================
// PERFORMANCE OPTIMIZATIONS
// ============================================

// Cache version for invalidation - increment this to clear all caches
const CACHE_VERSION = 'v2'; // Update this when you need to clear all caches

// In-memory cache for frequently accessed data
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = {
  dashboardMetrics: 30 * 1000, // 30 seconds
  channelMetrics: 30 * 1000,
  campaigns: 60 * 1000, // 1 minute
  integrations: 5 * 60 * 1000, // 5 minutes
  subscription: 5 * 60 * 1000,
  agents: 10 * 1000, // 10 seconds for agent activity
};

// Global function to clear all caches (accessible from browser console)
(window as unknown as { clearAllCaches: () => void }).clearAllCaches = function() {
  // Clear API cache
  cache.clear();
  // Clear localStorage caches
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('ownlay-') || key.includes('subscription') || key.includes('cache'))) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
  // Clear sessionStorage
  sessionStorage.clear();
  console.log('All caches cleared! Please refresh the page.');
  return 'All caches cleared!';
};

function getCached<T>(key: string, ttl: number): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data as T;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// ============================================
// API CLIENT CONFIGURATION
// ============================================

const API_BASE_URL = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_API_URL || '/api/v1';

class ApiClient {
  private client: AxiosInstance;
  private pendingRequests: Map<string, Promise<unknown>> = new Map();

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      // Performance: Reduced timeout for faster failure
      timeout: 15000,
    });

    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('ownlay_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiResponse<unknown>>) => {
        if (error.response?.status === 401) {
          // Clear auth data - React will handle redirect via route guards
          localStorage.removeItem('ownlay_token');
          localStorage.removeItem('ownlay_user');
          localStorage.removeItem('ownlay-auth');
          localStorage.removeItem('ownlay-subscription');
          // Don't use window.location.href - let React Router handle it
        }
        return Promise.reject(error);
      }
    );
  }

  // ============================================
  // REQUEST DEDUPLICATION
  // ============================================
  
  private async dedupedRequest<T>(key: string, request: () => Promise<T>): Promise<T> {
    // Check if there's already a pending request for this key
    const pending = this.pendingRequests.get(key);
    if (pending) {
      return pending as Promise<T>;
    }

    // Create new request and store it
    const promise = request().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  // ============================================
  // AUTHENTICATION
  // ============================================

  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; access_token: string }>> {
    const startTime = performance.now();
    
    const { data } = await this.client.post('/auth/login', credentials);
    
    if (data.success && data.data) {
      localStorage.setItem('ownlay_token', data.data.access_token);
      localStorage.setItem('ownlay_user', JSON.stringify(data.data.user));
    }
    
    const elapsed = performance.now() - startTime;
    console.log(`API: Login completed in ${elapsed.toFixed(2)}ms`);
    
    return data;
  }

  async register(userData: RegisterData): Promise<ApiResponse<{ user: User; access_token: string }>> {
    const { data } = await this.client.post('/auth/register', userData);
    if (data.success && data.data) {
      localStorage.setItem('ownlay_token', data.data.access_token);
      localStorage.setItem('ownlay_user', JSON.stringify(data.data.user));
    }
    return data;
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout');
    } finally {
      localStorage.removeItem('ownlay_token');
      localStorage.removeItem('ownlay_user');
      localStorage.removeItem('ownlay-auth');
      localStorage.removeItem('ownlay-subscription');
      // Clear all caches
      cache.clear();
    }
  }

  // ============================================
  // DASHBOARD - OPTIMIZED WITH CACHING
  // ============================================

  async getDashboardMetrics(force = false): Promise<ApiResponse<DashboardMetrics>> {
    const cacheKey = 'dashboardMetrics';
    
    if (!force) {
      const cached = getCached<ApiResponse<DashboardMetrics>>(cacheKey, CACHE_TTL.dashboardMetrics);
      if (cached) return cached;
    }

    return this.dedupedRequest(cacheKey, async () => {
      const { data } = await this.client.get('/dashboard/metrics');
      setCache(cacheKey, data);
      return data;
    });
  }

  async getChannelMetrics(force = false): Promise<ApiResponse<ChannelMetrics[]>> {
    const cacheKey = 'channelMetrics';
    
    if (!force) {
      const cached = getCached<ApiResponse<ChannelMetrics[]>>(cacheKey, CACHE_TTL.channelMetrics);
      if (cached) return cached;
    }

    return this.dedupedRequest(cacheKey, async () => {
      const { data } = await this.client.get('/dashboard/channels');
      setCache(cacheKey, data);
      return data;
    });
  }

  // ============================================
  // CAMPAIGNS - OPTIMIZED WITH CACHING
  // ============================================

  async getCampaigns(params?: { status?: string; platform?: string }, force = false): Promise<ApiResponse<Campaign[]>> {
    const cacheKey = `campaigns:${JSON.stringify(params || {})}`;
    
    if (!force) {
      const cached = getCached<ApiResponse<Campaign[]>>(cacheKey, CACHE_TTL.campaigns);
      if (cached) return cached;
    }

    return this.dedupedRequest(cacheKey, async () => {
      const { data } = await this.client.get('/campaigns', { params });
      setCache(cacheKey, data);
      return data;
    });
  }

  async getCampaign(id: string): Promise<ApiResponse<Campaign>> {
    const { data } = await this.client.get(`/campaigns/${id}`);
    return data;
  }

  async createCampaign(campaign: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    const { data } = await this.client.post('/campaigns', campaign);
    // Invalidate campaigns cache
    cache.delete('campaigns:{}');
    return data;
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    const { data } = await this.client.put(`/campaigns/${id}`, updates);
    // Invalidate campaigns cache
    cache.delete('campaigns:{}');
    return data;
  }

  async deleteCampaign(id: string): Promise<ApiResponse<void>> {
    const { data } = await this.client.delete(`/campaigns/${id}`);
    // Invalidate campaigns cache
    cache.delete('campaigns:{}');
    return data;
  }

  // ============================================
  // ADS
  // ============================================

  async getAds(params?: { campaignId?: string; status?: string }): Promise<ApiResponse<Ad[]>> {
    const { data } = await this.client.get('/ads', { params });
    return data;
  }

  async createAd(ad: Partial<Ad>): Promise<ApiResponse<Ad>> {
    const { data } = await this.client.post('/ads', ad);
    return data;
  }

  async updateAd(id: string, updates: Partial<Ad>): Promise<ApiResponse<Ad>> {
    const { data } = await this.client.put(`/ads/${id}`, updates);
    return data;
  }

  // ============================================
  // INTEGRATIONS - OPTIMIZED WITH CACHING
  // ============================================

  async getIntegrations(force = false): Promise<ApiResponse<Integration[]>> {
    const cacheKey = 'integrations';
    
    if (!force) {
      const cached = getCached<ApiResponse<Integration[]>>(cacheKey, CACHE_TTL.integrations);
      if (cached) return cached;
    }

    return this.dedupedRequest(cacheKey, async () => {
      const { data } = await this.client.get('/integrations');
      setCache(cacheKey, data);
      return data;
    });
  }

  async connectIntegration(platform: string): Promise<ApiResponse<{ authUrl: string }>> {
    const { data } = await this.client.post(`/integrations/${platform}/connect`);
    cache.delete('integrations');
    return data;
  }

  async disconnectIntegration(platform: string): Promise<ApiResponse<void>> {
    const { data } = await this.client.post(`/integrations/${platform}/disconnect`);
    cache.delete('integrations');
    return data;
  }

  async syncIntegration(platform: string): Promise<ApiResponse<void>> {
    const { data } = await this.client.post(`/integrations/${platform}/sync`);
    return data;
  }

  // ============================================
  // AI INSIGHTS
  // ============================================

  async getAIInsights(type?: 'opportunity' | 'warning' | 'anomaly'): Promise<ApiResponse<AIInsight[]>> {
    const { data } = await this.client.get('/insights', { params: { type } });
    return data;
  }

  async applyInsight(insightId: string, action: string): Promise<ApiResponse<void>> {
    const { data } = await this.client.post(`/insights/${insightId}/apply`, { action });
    return data;
  }

  // ============================================
  // AGENT CONTEXT
  // ============================================

  async getTenantContext(): Promise<ApiResponse<{ context: TenantContext; organization: Organization; brand: Brand }>> {
    const { data } = await this.client.get('/agents/context');
    return data;
  }

  async switchContext(orgId: string, brandId: string): Promise<ApiResponse<{ context: TenantContext }>> {
    const { data } = await this.client.post('/agents/context/switch', { orgId, brandId });
    return data;
  }

  async getOrganizations(): Promise<ApiResponse<Organization[]>> {
    const { data } = await this.client.get('/agents/organizations');
    return data;
  }

  async getBrands(): Promise<ApiResponse<Brand[]>> {
    const { data } = await this.client.get('/agents/brands');
    return data;
  }

  // ============================================
  // RESEARCHER AGENT
  // ============================================

  async researchCompetitors(params: {
    competitors: string[];
    industry?: string;
    depth?: 'quick' | 'standard' | 'deep';
  }): Promise<ApiResponse<ResearchResult>> {
    const { data } = await this.client.post('/agents/researcher/competitors', params);
    return data;
  }

  async researchMarketTrends(params: {
    industry?: string;
    depth?: 'quick' | 'standard' | 'deep';
  }): Promise<ApiResponse<ResearchResult>> {
    const { data } = await this.client.post('/agents/researcher/market-trends', params);
    return data;
  }

  // ============================================
  // STRATEGIST AGENT
  // ============================================

  async getBudgetAllocation(params: {
    budget: number;
    period?: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    platforms?: string[];
    goals?: { targetRoas?: number; targetCpa?: number; targetConversions?: number };
  }): Promise<ApiResponse<StrategyResult>> {
    const { data } = await this.client.post('/agents/strategist/budget-allocation', params);
    return data;
  }

  async getPerformanceAnalysis(params?: {
    platforms?: string[];
  }): Promise<ApiResponse<StrategyResult>> {
    const { data } = await this.client.post('/agents/strategist/performance-analysis', params);
    return data;
  }

  async getForecast(params?: {
    budget?: number;
    period?: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  }): Promise<ApiResponse<StrategyResult>> {
    const { data } = await this.client.post('/agents/strategist/forecast', params);
    return data;
  }

  // ============================================
  // CREATIVE AGENT
  // ============================================

  async generateCreative(params: {
    productInfo: string;
    brandName: string;
    industry?: string;
    targetAudience?: string;
    platforms?: string[];
    tone?: 'professional' | 'casual' | 'urgent' | 'luxury' | 'playful';
    campaignObjective?: 'awareness' | 'consideration' | 'conversion';
    count?: number;
  }): Promise<ApiResponse<CreativeResult>> {
    const { data } = await this.client.post('/agents/creative/generate', params);
    return data;
  }

  async generateHeadlines(params: {
    productInfo: string;
    brandName: string;
    platforms?: string[];
    tone?: string;
    count?: number;
  }): Promise<ApiResponse<{ headlines: CreativeResult['output']['headlines'] }>> {
    const { data } = await this.client.post('/agents/creative/headlines', params);
    return data;
  }

  async generateImagePrompts(params: {
    productInfo: string;
    brandName: string;
    platforms?: string[];
    tone?: string;
    count?: number;
  }): Promise<ApiResponse<{ imagePrompts: CreativeResult['output']['imagePrompts'] }>> {
    const { data } = await this.client.post('/agents/creative/image-prompts', params);
    return data;
  }

  // ============================================
  // AUDITOR AGENT
  // ============================================

  async auditContent(params: {
    content: string | string[];
    contentType: 'headline' | 'description' | 'full_ad';
    platform?: string;
    autoRewrite?: boolean;
  }): Promise<ApiResponse<AuditResult>> {
    const { data } = await this.client.post('/agents/auditor/check', params);
    return data;
  }

  async brandAudit(): Promise<ApiResponse<AuditResult>> {
    const { data } = await this.client.post('/agents/auditor/brand-audit');
    return data;
  }

  // ============================================
  // ORCHESTRATOR
  // ============================================

  async runFullCampaign(params: {
    competitors?: string[];
    industry?: string;
    budget?: number;
    period?: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    platforms?: string[];
    productInfo?: string;
    brandName?: string;
    targetAudience?: string;
    tone?: 'professional' | 'casual' | 'urgent' | 'luxury' | 'playful';
    campaignObjective?: 'awareness' | 'consideration' | 'conversion';
    autoRewrite?: boolean;
  }): Promise<ApiResponse<OrchestratorResult>> {
    const { data } = await this.client.post('/agents/orchestrator/full-campaign', params);
    return data;
  }

  async runResearchStrategy(params: {
    competitors?: string[];
    industry?: string;
    budget?: number;
    period?: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    platforms?: string[];
  }): Promise<ApiResponse<OrchestratorResult>> {
    const { data } = await this.client.post('/agents/orchestrator/research-strategy', params);
    return data;
  }

  async runCreativePipeline(params: {
    productInfo?: string;
    brandName?: string;
    industry?: string;
    targetAudience?: string;
    platforms?: string[];
    tone?: 'professional' | 'casual' | 'urgent' | 'luxury' | 'playful';
    campaignObjective?: 'awareness' | 'consideration' | 'conversion';
    autoRewrite?: boolean;
  }): Promise<ApiResponse<OrchestratorResult>> {
    const { data } = await this.client.post('/agents/orchestrator/creative-pipeline', params);
    return data;
  }

  // ============================================
  // OBSERVABILITY - OPTIMIZED WITH CACHING
  // ============================================

  async getAgentActivity(limit?: number): Promise<ApiResponse<AgentActivity[]>> {
    const cacheKey = `agentActivity:${limit}`;
    const cached = getCached<ApiResponse<AgentActivity[]>>(cacheKey, CACHE_TTL.agents);
    if (cached) return cached;

    const { data } = await this.client.get('/observability/activity', { params: { limit } });
    setCache(cacheKey, data);
    return data;
  }

  async getAgentDecisions(params?: { sessionId?: string }): Promise<ApiResponse<AgentDecision[]>> {
    const { data } = await this.client.get('/observability/decisions', { params });
    return data;
  }

  async getApprovals(): Promise<ApiResponse<ApprovalItem[]>> {
    const { data } = await this.client.get('/observability/approvals');
    return data;
  }

  async approveItem(id: string, notes?: string): Promise<ApiResponse<void>> {
    const { data } = await this.client.post(`/observability/approvals/${id}/approve`, { notes });
    return data;
  }

  async rejectItem(id: string, reason: string): Promise<ApiResponse<void>> {
    const { data } = await this.client.post(`/observability/approvals/${id}/reject`, { reason });
    return data;
  }

  // ============================================
  // PREDICTIONS
  // ============================================

  async predictBudgetImpact(params: {
    budgetChange: number;
    platform?: string;
  }): Promise<ApiResponse<ROIPrediction>> {
    const { data } = await this.client.post('/observability/predictions/budget', params);
    return data;
  }

  async getPredictionScenarios(params: {
    baseAmount: number;
    platform?: string;
  }): Promise<ApiResponse<ROIPrediction[]>> {
    const { data } = await this.client.post('/observability/predictions/scenarios', params);
    return data;
  }

  // ============================================
  // AGENT TASKS HISTORY
  // ============================================

  async getAgentTasks(params?: {
    agent?: string;
    limit?: number;
  }): Promise<ApiResponse<Array<{
    id: string;
    agent_type: string;
    task_type: string;
    status: string;
    duration_ms: number;
    created_at: string;
    input_data: unknown;
    output_data: unknown;
  }>>> {
    const { data } = await this.client.get('/agents/tasks', { params });
    return data;
  }

  // ============================================
  // BRAND SAFETY
  // ============================================

  async getBrandSafetyDocuments(): Promise<ApiResponse<Array<{
    id: string;
    document_type: string;
    title: string;
    content: string;
    status: string;
    created_at: string;
  }>>> {
    const { data } = await this.client.get('/agents/brand-safety');
    return data;
  }

  async createBrandSafetyDocument(doc: {
    documentType: string;
    title: string;
    content: string;
  }): Promise<ApiResponse<{ documentId: string }>> {
    const { data } = await this.client.post('/agents/brand-safety', doc);
    return data;
  }

  // ============================================
  // SUBSCRIPTION & PAYMENT - OPTIMIZED
  // ============================================

  async getSubscription(userId: string): Promise<ApiResponse<{
    hasAccess: boolean;
    plan: string;
    status: string;
    expiresAt?: string;
    isTrial?: boolean;
  }>> {
    const cacheKey = `subscription:${userId}`;
    const cached = getCached<ApiResponse<{
      hasAccess: boolean;
      plan: string;
      status: string;
      expiresAt?: string;
      isTrial?: boolean;
    }>>(cacheKey, CACHE_TTL.subscription);
    if (cached) return cached;

    const { data } = await this.client.get(`/payment/subscription/${userId}`);
    setCache(cacheKey, data);
    return data;
  }

  async startTrial(userId: string): Promise<ApiResponse<{ subscription: unknown }>> {
    const { data } = await this.client.post('/payment/start-trial', { userId });
    // Invalidate subscription cache
    cache.delete(`subscription:${userId}`);
    return data;
  }

  async createOrder(params: {
    planId: string;
    userId: string;
    currency?: string;
  }): Promise<ApiResponse<{ orderId: string; amount: number }>> {
    const { data } = await this.client.post('/payment/create-order', params);
    return data;
  }

  // ============================================
  // CACHE MANAGEMENT
  // ============================================

  clearCache(key?: string): void {
    if (key) {
      cache.delete(key);
    } else {
      cache.clear();
    }
  }

  invalidateDashboardCache(): void {
    cache.delete('dashboardMetrics');
    cache.delete('channelMetrics');
  }

  // Clear all caches and force fresh data
  clearAllCaches(): void {
    // Clear in-memory cache
    cache.clear();
    this.pendingRequests.clear();
    
    // Clear localStorage caches (but not auth)
    const keysToKeep = ['ownlay_token', 'ownlay_user', 'ownlay-auth'];
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('ownlay') && !keysToKeep.includes(key)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    console.log('API: All caches cleared');
  }

  // Get cache version for debugging
  getCacheVersion(): string {
    return CACHE_VERSION;
  }
}

// Export singleton instance
export const api = new ApiClient();
export default api;
