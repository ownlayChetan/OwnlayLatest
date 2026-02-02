// ============================================
// USER & AUTH TYPES
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'brand_owner' | 'agency_owner' | 'admin' | 'manager' | 'analyst' | 'viewer';
  accountType: 'brand' | 'agency' | 'admin';
  plan: 'none' | 'free_trial' | 'starter' | 'growth' | 'pro' | 'enterprise';
  workspace_id: string;
  company?: string;
  trialEndsAt?: string;
  subscriptionStatus?: 'active' | 'trialing' | 'past_due' | 'canceled' | 'expired' | 'none';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  accountType?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  accountType: string;
  company?: string;
}

// ============================================
// TENANT CONTEXT TYPES
// ============================================

export interface TenantContext {
  userId: string;
  orgId: string;
  brandId: string;
  role: string;
  accessibleBrands: string[];
  permissions: Record<string, boolean>;
  historicalWinners?: HistoricalWinner[];
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
  settings: Record<string, unknown>;
}

export interface Brand {
  id: string;
  org_id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  industry: string | null;
  website: string | null;
  status: string;
}

export interface HistoricalWinner {
  id: string;
  platform: string;
  campaignType: string;
  headline?: string;
  description?: string;
  targetAudience?: string;
  roas: number;
  cpa: number;
  conversions: number;
  spend: number;
  period: string;
  learnings: string[];
}

// ============================================
// DASHBOARD TYPES
// ============================================

export interface DashboardMetrics {
  totalSpend: number;
  totalRevenue: number;
  roas: number;
  ctr: number;
  conversions: number;
  impressions: number;
  clicks: number;
  cpa: number;
  trends: {
    spend: number;
    revenue: number;
    roas: number;
    conversions: number;
  };
}

export interface ChannelMetrics {
  platform: string;
  spend: number;
  revenue: number;
  roas: number;
  conversions: number;
  ctr: number;
  status: 'active' | 'paused' | 'error';
}

// ============================================
// AGENT TYPES
// ============================================

export interface AgentStatus {
  agent: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  lastRun?: string;
  taskCount: number;
}

export interface AgentActivity {
  id: string;
  agent: 'researcher' | 'strategist' | 'creative' | 'auditor' | 'orchestrator';
  activityType: 'thinking' | 'analyzing' | 'deciding' | 'executing' | 'completed' | 'error';
  description: string;
  timestamp: string;
  progress?: number;
  duration?: number;
}

export interface AgentDecision {
  id: string;
  agent: string;
  decisionType: string;
  reasoning: string;
  evidence: string[];
  prediction: string;
  confidence: number;
  status: 'pending' | 'approved' | 'rejected' | 'auto_approved';
  timestamp: string;
}

export interface ApprovalItem {
  id: string;
  type: 'budget' | 'creative' | 'campaign';
  title: string;
  description: string;
  agent: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  draft: unknown;
  reasoning: string;
  timestamp: string;
}

// ============================================
// RESEARCH TYPES
// ============================================

export interface ResearchResult {
  success: boolean;
  taskType: string;
  data: unknown;
  insights: string[];
  recommendations: string[];
  confidence: number;
  timestamp: string;
  anomalies: AnomalyReport[];
  predictions: ForecastMetric[];
  actionPriority: 'immediate' | 'high' | 'medium' | 'low';
}

export interface AnomalyReport {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  zScore: number;
}

export interface ForecastMetric {
  metric: string;
  value: number;
  confidence: number;
  timeframe: string;
}

// ============================================
// STRATEGY TYPES
// ============================================

export interface BudgetAllocation {
  platform: string;
  percentage: number;
  amount: number;
  projected_roas: number;
  projected_cpa: number;
  confidence: number;
  rationale: string;
}

export interface BudgetPlan {
  id: string;
  total_budget: number;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  allocations: BudgetAllocation[];
  projected_roas: number;
  projected_revenue: number;
  confidence_score: number;
  rationale: string;
  recommendations: string[];
  risks: string[];
}

export interface StrategyResult {
  success: boolean;
  taskType: string;
  plan?: BudgetPlan;
  recommendations: string[];
  confidence: number;
  timestamp: string;
}

// ============================================
// CREATIVE TYPES
// ============================================

export interface AdHeadline {
  text: string;
  platform: string;
  score: number;
  trigger: string;
  governorReport: { passed: boolean; charCount: number };
}

export interface ImagePrompt {
  prompt: string;
  negative: string;
  style?: string;
}

export interface CreativeOutput {
  headlines: AdHeadline[];
  imagePrompts: ImagePrompt[];
  descriptions: string[];
  metadata: { generatedAt: string; tone: string };
}

export interface CreativeResult {
  success: boolean;
  output: CreativeOutput;
  reasoningChain: string[];
  timestamp: string;
}

// ============================================
// AUDIT TYPES
// ============================================

export interface ComplianceCheck {
  field: string;
  passed: boolean;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  suggestion?: string;
}

export interface AuditResult {
  success: boolean;
  overallRiskScore: number;
  publishEnabled: boolean;
  results: {
    approved: boolean;
    overallScore: number;
    riskScore: number;
    checks: ComplianceCheck[];
    recommendations: string[];
    requiresRewrite: boolean;
  };
  thinkingLog: ThinkingLogEntry[];
  timestamp: string;
}

export interface ThinkingLogEntry {
  step: number;
  action: string;
  reasoning: string;
  input?: unknown;
  output?: unknown;
  timestamp: string;
}

// ============================================
// ORCHESTRATOR TYPES
// ============================================

export interface OrchestratorResult {
  success: boolean;
  pipelineState: 'Finalized' | 'Aborted' | 'Governor_Capped';
  stages: {
    research?: ResearchResult;
    strategy?: StrategyResult;
    creative?: CreativeResult;
    audit?: AuditResult;
  };
  finalOutput: {
    status: string;
    payload: unknown;
    reasoningChain: string[];
    governorAudit: {
      budgetShifted: number;
      recursionCount: number;
      safetyViolations: string[];
    };
  };
  executionLog: ExecutionLogEntry[];
  totalDuration: number;
  timestamp: string;
}

export interface ExecutionLogEntry {
  agent: string;
  task: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped' | 'governor_blocked';
  startTime: string;
  endTime?: string;
  duration?: number;
  result?: string;
  error?: string;
}

// ============================================
// CAMPAIGN TYPES
// ============================================

export interface Campaign {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  platform: string;
  budget: number;
  spent: number;
  startDate: string;
  endDate?: string;
  objective: string;
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    roas: number;
    ctr: number;
  };
}

export interface Ad {
  id: string;
  campaignId: string;
  name: string;
  status: 'active' | 'paused' | 'rejected';
  headline: string;
  description: string;
  imageUrl?: string;
  metrics: {
    impressions: number;
    clicks: number;
    ctr: number;
    spend: number;
  };
}

// ============================================
// ANALYTICS TYPES
// ============================================

export interface TimeSeriesData {
  date: string;
  value: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: string;
  }[];
}

export interface ROIPrediction {
  budgetChange: number;
  revenueImpact: number;
  roiMultiplier: number;
  paybackPeriod: number;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high';
}

// ============================================
// INTEGRATION TYPES
// ============================================

export interface Integration {
  id: string;
  platform: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  lastSync?: string;
  accountName?: string;
  metrics?: {
    campaigns: number;
    spend: number;
  };
}

// ============================================
// AI INSIGHT TYPES
// ============================================

export interface AIInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'anomaly';
  title: string;
  description: string;
  impact: string;
  platform?: string;
  confidence: number;
  actionable: boolean;
  suggestedAction?: string;
  timestamp: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
