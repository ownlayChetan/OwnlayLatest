/**
 * OWNLAY Marketing OS - Agentic System Entry Point
 * Version: 7.0.0 - Enterprise-Grade Autonomous Agents
 * 
 * ARCHITECTURE GOALS:
 * 1. Monolithic Exporting - Every agent, type, and factory accessible from one import
 * 2. Scope Isolation - Multi-Tenant context enforced at every layer
 * 3. Type Safety - Full TypeScript coverage for all agent interactions
 * 4. Fault Tolerance - Iron Dome governance with circuit breakers
 * 5. Maximum Robustness - Graceful degradation with fallbacks
 */

// ============================================
// AGENT EXPORTS
// ============================================

// Researcher Agent - Market & Competitor Intelligence
export { 
  ResearcherAgent, 
  createResearcherAgent 
} from './researcher';

export type {
  CompetitorData,
  MarketTrend,
  ResearchTask,
  ResearchResult,
  AnomalyReport,
  ForecastMetric
} from './researcher';

// Strategist Agent - Financial Modeling & Budget Governance
export { 
  StrategistAgent, 
  createStrategistAgent 
} from './strategist';

export type {
  HistoricalMetrics,
  BudgetAllocation,
  BudgetPlan,
  BudgetScenario,
  StrategyTask,
  StrategyResult
} from './strategist';

// Creative Agent - Multi-modal Content Synthesis
export { 
  CreativeAgent, 
  createCreativeAgent 
} from './creative';

export type {
  AdHeadline,
  ImagePrompt,
  CreativeOutput,
  CreativeRequest,
  CreativeTask,
  CreativeResult
} from './creative';

// Auditor Agent - Compliance & Risk Governance
export { 
  AuditorAgent, 
  createAuditorAgent 
} from './auditor';

export type {
  ThinkingLogEntry,
  ComplianceCheck,
  ComplianceResult,
  AuditTask,
  AuditResult
} from './auditor';

// Orchestrator - Mixture-of-Agents Controller
export { 
  AgentOrchestrator, 
  createOrchestrator 
} from './orchestrator';

export type {
  AgentStep,
  ExecutionLogEntry,
  OrchestratorTask,
  OrchestratorResult
} from './orchestrator';

// ============================================
// DATABASE INFRASTRUCTURE RE-EXPORTS
// ============================================

export type { TenantContext, HistoricalWinner, Organization, Brand, Permission, UserContext, BrandSafetyDocument } from '../db/multiTenant';
export { multiTenantDb, ScopedAccessManager } from '../db/multiTenant';

// ============================================
// UTILITY: AGENT CLUSTER INITIALIZATION
// ============================================

import { TenantContext } from '../db/multiTenant';
import { ResearcherAgent, createResearcherAgent } from './researcher';
import { StrategistAgent, createStrategistAgent } from './strategist';
import { CreativeAgent, createCreativeAgent } from './creative';
import { AuditorAgent, createAuditorAgent } from './auditor';
import { AgentOrchestrator, createOrchestrator } from './orchestrator';

/**
 * Agent Cluster - All agents initialized with shared context
 */
export interface AgentCluster {
  researcher: ResearcherAgent;
  strategist: StrategistAgent;
  creative: CreativeAgent;
  auditor: AuditorAgent;
  orchestrator: AgentOrchestrator;
}

/**
 * Initialize all agents with consistent configuration
 * Use this for full pipeline operations
 */
export function initializeAgentCluster(
  database: D1Database, 
  context: TenantContext, 
  ai?: unknown
): AgentCluster {
  return {
    researcher: createResearcherAgent(database, context, ai),
    strategist: createStrategistAgent(database, context, ai),
    creative: createCreativeAgent(database, context, ai),
    auditor: createAuditorAgent(database, context, ai),
    orchestrator: createOrchestrator(database, context, ai)
  };
}

/**
 * Agent Types for runtime checks
 */
export const AGENT_TYPES = [
  'researcher',
  'strategist', 
  'creative',
  'auditor',
  'orchestrator'
] as const;

export type AgentType = typeof AGENT_TYPES[number];

/**
 * Check if a string is a valid agent type
 */
export function isValidAgentType(type: string): type is AgentType {
  return AGENT_TYPES.includes(type as AgentType);
}

/**
 * Agent Capabilities Map
 */
export const AGENT_CAPABILITIES = {
  researcher: {
    name: 'Researcher Agent',
    description: 'Market & Competitor Intelligence with Z-Score anomaly detection',
    capabilities: ['competitor_analysis', 'market_trends', 'pricing_research', 'ad_intelligence'],
    version: '7.0.0'
  },
  strategist: {
    name: 'Strategist Agent',
    description: 'Financial Modeling with Monte Carlo simulation and Iron Dome safeguards',
    capabilities: ['budget_allocation', 'performance_analysis', 'optimization_plan', 'forecast'],
    version: '7.0.0'
  },
  creative: {
    name: 'Creative Agent',
    description: 'Multi-modal content synthesis with platform-specific optimization',
    capabilities: ['full_creative', 'headlines_only', 'image_prompts_only', 'descriptions_only', 'variations'],
    version: '7.0.0'
  },
  auditor: {
    name: 'Auditor Agent',
    description: 'Compliance & Risk Governance with publish lock capability',
    capabilities: ['single_creative', 'campaign_audit', 'batch_audit', 'pre_publish_check'],
    version: '7.0.0'
  },
  orchestrator: {
    name: 'Orchestrator Agent',
    description: 'Mixture-of-Agents controller with recursive compliance loops',
    capabilities: ['full_campaign', 'research_and_strategy', 'creative_pipeline', 'custom'],
    version: '7.0.0'
  }
} as const;
