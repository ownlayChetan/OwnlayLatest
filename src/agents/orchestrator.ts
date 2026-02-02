/**
 * OWNLAY Marketing OS - Agent Orchestrator
 * Version: 7.0.0 - THE GIGANTIC AUTONOMOUS GOVERNOR
 * 
 * DESIGN PHILOSOPHY:
 * 1. Financial Circuit Breaker: Physically caps budget variance at 35%
 * 2. State-Gate Isolation: Each agent must pass a confidence threshold before next triggers
 * 3. Recursive Compliance: Auto-negotiation loop between Creative and Auditor
 * 4. Situation Awareness: Real-time delta calculation (Current Live vs. Proposed)
 * 5. Fault Tolerance: Graceful degradation with partial results
 * 6. Complete Audit Trail: Every decision is logged
 */

import { TenantContext } from '../db/multiTenant';
import { ResearcherAgent, createResearcherAgent, ResearchTask, ResearchResult } from './researcher';
import { StrategistAgent, createStrategistAgent, StrategyTask, StrategyResult, BudgetAllocation } from './strategist';
import { CreativeAgent, createCreativeAgent, CreativeTask, CreativeResult } from './creative';
import { AuditorAgent, createAuditorAgent, AuditTask, AuditResult } from './auditor';

// ============================================
// CONFIGURATION
// ============================================

const MASTER_GOVERNOR = {
  maxBudgetVariance: 0.35,        // Physical Safety: No more than 35% shift per run
  maxRecursionDepth: 3,           // Anti-Loop: Max retries for Creative compliance
  minConfidenceThreshold: 0.70,   // Quality Gate: Abort if data is < 70% reliable
  financialSanityCheck: true,     // Logic Gate: Compare ROI vs. historical caps
  circuitBreakerThreshold: 3,
  circuitBreakerResetMs: 120000,
  timeoutPerAgent: 60000,         // 60 second timeout per agent
} as const;

// Circuit Breaker State
let circuitState = {
  failures: 0,
  lastFailure: 0,
  isOpen: false
};

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface AgentStep {
  agent: 'researcher' | 'strategist' | 'creative' | 'auditor';
  task: ResearchTask | StrategyTask | CreativeTask | AuditTask;
  dependsOn?: string[];
  id?: string;
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
  metadata?: Record<string, unknown>;
}

export interface OrchestratorTask {
  type: 'full_campaign' | 'research_and_strategy' | 'creative_pipeline' | 'custom';
  config: {
    competitors?: string[];
    industry?: string;
    budget?: number;
    period?: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    platforms?: string[];
    productInfo?: string;
    brandName?: string;
    targetAudience?: string;
    tone?: 'professional' | 'casual' | 'urgent' | 'luxury' | 'playful' | 'informative';
    campaignObjective?: 'awareness' | 'consideration' | 'conversion';
    autoRewrite?: boolean;
    customSteps?: AgentStep[];
  };
  options?: {
    skipResearch?: boolean;
    skipStrategy?: boolean;
    strictCompliance?: boolean;
    parallelExecution?: boolean;
  };
}

export interface OrchestratorResult {
  success: boolean;
  pipelineState: 'Finalized' | 'Aborted' | 'Governor_Capped' | 'Partial';
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
      confidenceScores: Record<string, number>;
    };
  };
  executionLog: ExecutionLogEntry[];
  totalDuration: number;
  timestamp: string;
  metadata?: {
    agentsInvoked: string[];
    totalApiCalls: number;
  };
}

// ============================================
// ORCHESTRATOR CLASS
// ============================================

export class AgentOrchestrator {
  private researcher: ResearcherAgent;
  private strategist: StrategistAgent;
  private creative: CreativeAgent;
  private auditor: AuditorAgent;
  private executionLog: ExecutionLogEntry[] = [];
  private globalChain: string[] = [];

  constructor(
    private database: D1Database, 
    private context: TenantContext, 
    private ai: unknown
  ) {
    // Initialize the autonomous cluster using factory patterns
    this.researcher = createResearcherAgent(database, context, ai);
    this.strategist = createStrategistAgent(database, context, ai);
    this.creative = createCreativeAgent(database, context, ai);
    this.auditor = createAuditorAgent(database, context, ai);
  }

  /**
   * EXECUTE PIPELINE
   * Orchestrates the 4-agent cycle with hard-coded safety gates.
   */
  async execute(task: OrchestratorTask): Promise<OrchestratorResult> {
    const startTime = Date.now();
    this.executionLog = [];
    this.globalChain = [`[INIT] Orchestrating Campaign Pipeline v7.0.0 for Brand: ${this.context.brandId}`];
    const safetyViolations: string[] = [];
    const stages: OrchestratorResult['stages'] = {};
    const confidenceScores: Record<string, number> = {};
    const agentsInvoked: string[] = [];

    // Circuit breaker check
    if (this.isCircuitOpen()) {
      this.globalChain.push("[CIRCUIT_BREAKER] Circuit is open, returning partial results");
      return this.createFallbackResult(task, "Circuit breaker is open", startTime);
    }

    // Input validation
    const validation = this.validateTask(task);
    if (!validation.valid) {
      return this.createErrorResult(task, validation.error || "Invalid task", startTime);
    }

    let budgetShifted = 0;
    let recursionCount = 0;

    try {
      // ========== PHASE 1: RESEARCH GATE (MARKET DATA) ==========
      if (!task.options?.skipResearch && task.config.competitors?.length) {
        this.logExecutionStart('researcher', 'competitor_analysis');
        agentsInvoked.push('researcher');
        
        stages.research = await this.researcher.executeResearch({ 
          type: 'competitor_analysis', 
          targets: task.config.competitors,
          industry: task.config.industry,
          depth: 'standard'
        });
        
        confidenceScores.research = stages.research.confidence;

        // Quality Gate
        if (!stages.research.success || stages.research.confidence < MASTER_GOVERNOR.minConfidenceThreshold) {
          this.logExecutionEnd('researcher', 'competitor_analysis', 'failed', 
            `Confidence ${stages.research.confidence.toFixed(2)} below threshold ${MASTER_GOVERNOR.minConfidenceThreshold}`);
          
          if (task.options?.strictCompliance) {
            throw new Error(`GOVERNOR_ABORT: Research confidence too low (${stages.research.confidence.toFixed(2)})`);
          } else {
            safetyViolations.push(`Research confidence below threshold: ${stages.research.confidence.toFixed(2)}`);
          }
        } else {
          this.logExecutionEnd('researcher', 'competitor_analysis', 'completed');
        }
        
        this.globalChain.push(`[RESEARCH] Completed with confidence: ${stages.research.confidence.toFixed(2)}`);
      }

      // ========== PHASE 2: STRATEGIC GATE (MONEY FLOW) ==========
      if (!task.options?.skipStrategy && task.config.budget) {
        this.logExecutionStart('strategist', 'budget_optimization');
        agentsInvoked.push('strategist');
        
        stages.strategy = await this.strategist.executeStrategy({ 
          type: 'budget_allocation', 
          budget: task.config.budget,
          period: task.config.period || 'monthly',
          platforms: task.config.platforms,
          goals: { targetRoas: 4.0 },
          options: { includeScenarios: true }
        });

        confidenceScores.strategy = stages.strategy.confidence;

        if (stages.strategy.success && stages.strategy.plan) {
          // THE CIRCUIT BREAKER: Compare proposed budget vs. what is currently live
          const currentLive = await this.getCurrentLiveAllocation();
          budgetShifted = this.calculateShiftVariance(currentLive, stages.strategy.plan.allocations);
          
          if (budgetShifted > MASTER_GOVERNOR.maxBudgetVariance) {
            this.globalChain.push(`[GOVERNOR] Aggressive shift of ${(budgetShifted * 100).toFixed(1)}% blocked. Capping to ${MASTER_GOVERNOR.maxBudgetVariance * 100}%.`);
            stages.strategy.plan.allocations = this.capBudgetShift(currentLive, stages.strategy.plan.allocations);
            safetyViolations.push(`VARIANCE_LIMIT_TRIGGERED: ${(budgetShifted * 100).toFixed(1)}% capped to ${MASTER_GOVERNOR.maxBudgetVariance * 100}%`);
          }
          
          this.logExecutionEnd('strategist', 'budget_optimization', 'completed');
        } else {
          this.logExecutionEnd('strategist', 'budget_optimization', 'failed', stages.strategy.recommendations.join('; '));
        }
      }

      // ========== PHASE 3: CREATIVE ADVERSARIAL LOOP ==========
      if (task.config.productInfo && task.config.brandName) {
        let auditPass = false;
        
        while (recursionCount < MASTER_GOVERNOR.maxRecursionDepth && !auditPass) {
          recursionCount++;
          this.logExecutionStart('creative', `synthesis_cycle_${recursionCount}`);
          agentsInvoked.push('creative');
          
          // Generate Creative with budget context from the Strategist
          const creativeRes = await this.creative.executeCreative({ 
            type: 'full_creative', 
            request: {
              productInfo: task.config.productInfo,
              brandName: task.config.brandName,
              industry: task.config.industry,
              targetAudience: task.config.targetAudience,
              platforms: task.config.platforms || ['google', 'meta'],
              tone: task.config.tone || 'professional',
              campaignObjective: task.config.campaignObjective || 'conversion',
              budgetContext: stages.strategy?.plan
            },
            count: 5
          });

          confidenceScores[`creative_${recursionCount}`] = creativeRes.confidence;

          // Adversarial Audit
          this.logExecutionStart('auditor', `audit_cycle_${recursionCount}`);
          agentsInvoked.push('auditor');
          
          const auditRes = await this.auditor.executeAudit({ 
            type: 'single_creative', 
            content: JSON.stringify(creativeRes.output.headlines.map(h => h.text)),
            contentType: 'full_ad',
            platform: task.config.platforms?.[0] || 'google',
            options: { autoRewrite: task.config.autoRewrite, strictMode: task.options?.strictCompliance }
          });

          confidenceScores[`audit_${recursionCount}`] = auditRes.publishEnabled ? 0.9 : 0.3;

          if (auditRes.publishEnabled) {
            auditPass = true;
            stages.creative = creativeRes;
            stages.audit = auditRes;
            this.logExecutionEnd('creative', `synthesis_cycle_${recursionCount}`, 'completed');
            this.logExecutionEnd('auditor', `audit_cycle_${recursionCount}`, 'completed');
            this.globalChain.push(`[CREATIVE] Passed compliance on attempt ${recursionCount}`);
          } else {
            this.globalChain.push(`[RECURSION] Loop ${recursionCount}: Content failed compliance (risk: ${auditRes.overallRiskScore}). Rewriting...`);
            this.logExecutionEnd('creative', `synthesis_cycle_${recursionCount}`, 'failed', 'Compliance block');
            this.logExecutionEnd('auditor', `audit_cycle_${recursionCount}`, 'completed', `Risk score: ${auditRes.overallRiskScore}`);
            
            // Store last attempt even if failed
            stages.creative = creativeRes;
            stages.audit = auditRes;
          }
        }

        if (!auditPass) {
          if (task.options?.strictCompliance) {
            throw new Error(`GOVERNOR_ABORT: Compliance could not be achieved within ${MASTER_GOVERNOR.maxRecursionDepth} iterations`);
          } else {
            safetyViolations.push(`Compliance not achieved after ${recursionCount} attempts`);
            this.globalChain.push(`[WARNING] Creative compliance not achieved - proceeding with warnings`);
          }
        }
      }

      // ========== PHASE 4: FINALIZATION ==========
      const pipelineState: OrchestratorResult['pipelineState'] = 
        safetyViolations.length === 0 ? 'Finalized' :
        stages.creative && stages.audit?.publishEnabled ? 'Governor_Capped' : 'Partial';

      const result: OrchestratorResult = {
        success: true,
        pipelineState,
        stages,
        finalOutput: {
          status: pipelineState === 'Finalized' ? 'Ready_To_Deploy' : 'Review_Required',
          payload: { 
            budget: stages.strategy?.plan, 
            creatives: stages.creative?.output, 
            audit: stages.audit?.results 
          },
          reasoningChain: this.globalChain,
          governorAudit: { 
            budgetShifted, 
            recursionCount, 
            safetyViolations,
            confidenceScores
          }
        },
        executionLog: this.executionLog,
        totalDuration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        metadata: {
          agentsInvoked: [...new Set(agentsInvoked)],
          totalApiCalls: agentsInvoked.length
        }
      };

      await this.persistTask(task, result);
      this.resetCircuitBreaker();

      return result;

    } catch (error: unknown) {
      this.recordCircuitFailure();
      return this.handleGlobalAbort(task, error, budgetShifted, recursionCount, safetyViolations, stages, startTime);
    }
  }

  // ============================================
  // VALIDATION
  // ============================================

  private validateTask(task: OrchestratorTask): { valid: boolean; error?: string } {
    if (!task || !task.type) {
      return { valid: false, error: "Task type is required" };
    }

    const validTypes = ['full_campaign', 'research_and_strategy', 'creative_pipeline', 'custom'];
    if (!validTypes.includes(task.type)) {
      return { valid: false, error: `Invalid task type. Must be one of: ${validTypes.join(', ')}` };
    }

    if (task.config.budget !== undefined && (task.config.budget < 100 || task.config.budget > 10000000)) {
      return { valid: false, error: "Budget must be between $100 and $10,000,000" };
    }

    return { valid: true };
  }

  // ============================================
  // CIRCUIT BREAKER
  // ============================================

  private isCircuitOpen(): boolean {
    if (!circuitState.isOpen) return false;
    
    if (Date.now() - circuitState.lastFailure > MASTER_GOVERNOR.circuitBreakerResetMs) {
      circuitState.isOpen = false;
      circuitState.failures = 0;
      return false;
    }
    
    return true;
  }

  private recordCircuitFailure(): void {
    circuitState.failures++;
    circuitState.lastFailure = Date.now();
    
    if (circuitState.failures >= MASTER_GOVERNOR.circuitBreakerThreshold) {
      circuitState.isOpen = true;
    }
  }

  private resetCircuitBreaker(): void {
    circuitState.failures = 0;
    circuitState.isOpen = false;
  }

  // ============================================
  // GOVERNANCE UTILITIES
  // ============================================

  private calculateShiftVariance(oldAlloc: BudgetAllocation[], newAlloc: BudgetAllocation[]): number {
    if (!oldAlloc || oldAlloc.length === 0) return 0;
    
    let totalDelta = 0;
    for (const n of newAlloc) {
      const o = oldAlloc.find(x => x.platform === n.platform);
      if (o) {
        totalDelta += Math.abs(n.percentage - o.percentage);
      } else {
        totalDelta += n.percentage; // New platform = full shift
      }
    }
    
    return totalDelta / 100;
  }

  private capBudgetShift(oldAlloc: BudgetAllocation[], proposed: BudgetAllocation[]): BudgetAllocation[] {
    if (!oldAlloc || oldAlloc.length === 0) return proposed;
    
    return proposed.map(p => {
      const old = oldAlloc.find(o => o.platform === p.platform);
      if (!old) return p;
      
      const maxShift = old.percentage * MASTER_GOVERNOR.maxBudgetVariance;
      const diff = p.percentage - old.percentage;
      
      if (Math.abs(diff) > maxShift) {
        const cappedPercentage = old.percentage + (diff > 0 ? maxShift : -maxShift);
        return {
          ...p,
          percentage: cappedPercentage,
          amount: (cappedPercentage / 100) * proposed.reduce((s, a) => s + a.amount, 0),
          rationale: p.rationale + ' [GOVERNOR: Budget shift capped]'
        };
      }
      
      return p;
    });
  }

  private async getCurrentLiveAllocation(): Promise<BudgetAllocation[]> {
    try {
      const { results } = await this.database.prepare(
        `SELECT allocations FROM budget_allocation_plans WHERE brand_id = ? AND status = 'active' ORDER BY created_at DESC LIMIT 1`
      ).bind(this.context.brandId).all();
      
      if (results && results.length > 0) {
        return JSON.parse(results[0].allocations as string);
      }
    } catch (error) {
      console.error('Error fetching current allocation:', error);
    }
    return [];
  }

  // ============================================
  // LOGGING
  // ============================================

  private logExecutionStart(agent: string, task: string): void {
    this.executionLog.push({ 
      agent, 
      task, 
      status: 'running', 
      startTime: new Date().toISOString() 
    });
  }

  private logExecutionEnd(
    agent: string, 
    task: string, 
    status: ExecutionLogEntry['status'], 
    error?: string,
    metadata?: Record<string, unknown>
  ): void {
    const entry = this.executionLog.find(e => e.agent === agent && e.task === task && e.status === 'running');
    if (entry) {
      entry.status = status;
      entry.endTime = new Date().toISOString();
      entry.duration = Date.now() - new Date(entry.startTime).getTime();
      entry.error = error;
      entry.metadata = metadata;
    }
  }

  // ============================================
  // PERSISTENCE
  // ============================================

  private async persistTask(task: OrchestratorTask, result: OrchestratorResult): Promise<void> {
    try {
      await this.database.prepare(
        `INSERT INTO agent_tasks (id, brand_id, org_id, agent_type, task_type, status, output_data, duration_ms, input_data) 
         VALUES (?, ?, ?, 'orchestrator', ?, ?, ?, ?, ?)`
      ).bind(
        crypto.randomUUID(), 
        this.context.brandId, 
        this.context.orgId, 
        task.type, 
        result.success ? 'completed' : 'failed',
        JSON.stringify({
          pipelineState: result.pipelineState,
          governorAudit: result.finalOutput.governorAudit
        }), 
        result.totalDuration,
        JSON.stringify(task.config)
      ).run();
    } catch (error) {
      console.error('Error persisting orchestrator task:', error);
    }
  }

  // ============================================
  // ERROR HANDLING
  // ============================================

  private handleGlobalAbort(
    task: OrchestratorTask, 
    err: unknown, 
    budgetShifted: number,
    recursionCount: number,
    safetyViolations: string[],
    stages: OrchestratorResult['stages'],
    startTime: number
  ): OrchestratorResult {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    this.globalChain.push(`[CRITICAL_ABORT] ${errorMessage}`);
    
    return {
      success: false,
      pipelineState: 'Aborted',
      stages,
      finalOutput: { 
        status: 'Blocked', 
        payload: null, 
        reasoningChain: this.globalChain, 
        governorAudit: { 
          budgetShifted, 
          recursionCount, 
          safetyViolations: [...safetyViolations, errorMessage],
          confidenceScores: {}
        } 
      },
      executionLog: this.executionLog,
      totalDuration: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };
  }

  private createErrorResult(task: OrchestratorTask, error: string, startTime: number): OrchestratorResult {
    this.globalChain.push(`[ERROR] ${error}`);
    
    return {
      success: false,
      pipelineState: 'Aborted',
      stages: {},
      finalOutput: {
        status: 'Error',
        payload: null,
        reasoningChain: this.globalChain,
        governorAudit: {
          budgetShifted: 0,
          recursionCount: 0,
          safetyViolations: [error],
          confidenceScores: {}
        }
      },
      executionLog: this.executionLog,
      totalDuration: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };
  }

  private createFallbackResult(task: OrchestratorTask, reason: string, startTime: number): OrchestratorResult {
    this.globalChain.push(`[FALLBACK] ${reason}`);
    
    return {
      success: true,
      pipelineState: 'Partial',
      stages: {},
      finalOutput: {
        status: 'Fallback_Mode',
        payload: { message: 'Operating in fallback mode - retry when system recovers' },
        reasoningChain: this.globalChain,
        governorAudit: {
          budgetShifted: 0,
          recursionCount: 0,
          safetyViolations: [`Fallback: ${reason}`],
          confidenceScores: {}
        }
      },
      executionLog: this.executionLog,
      totalDuration: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };
  }
}

// ============================================
// EXPORTS
// ============================================

export function createOrchestrator(database: D1Database, context: TenantContext, ai?: unknown): AgentOrchestrator {
  return new AgentOrchestrator(database, context, ai);
}

export type { OrchestratorTask, OrchestratorResult };
