/**
 * OWNLAY Marketing OS - Superhuman Auditor Agent
 * Version: 7.0.0 - Enterprise-Grade Compliance Gatekeeper
 * 
 * DESIGN PRINCIPLES:
 * 1. Zero-Tolerance Compliance: Strict enforcement of brand safety rules
 * 2. Multi-Layer Validation: Semantic, neural, and rule-based checks
 * 3. Complete Audit Trail: Every decision is logged with reasoning
 * 4. Publish Lock: Binary control over content deployment
 * 5. Auto-Rewrite Capability: AI-powered content correction
 * 6. Platform-Specific Rules: Compliance varies by platform
 */

import { TenantContext } from '../db/multiTenant';

// ============================================
// CONFIGURATION
// ============================================

const AUDITOR_CONFIG = {
  riskThreshold: 70,              // Above this = publish locked
  criticalThreshold: 90,          // Above this = immediate escalation
  maxContentLength: 10000,        // Maximum content to audit
  circuitBreakerThreshold: 5,
  circuitBreakerResetMs: 60000,
  models: {
    reasoning: '@cf/meta/llama-3.3-70b-instruct-fp8-fast'
  }
} as const;

const DEFAULT_SAFETY_RULES = {
  prohibited_terms: [
    'guaranteed results', 'risk-free', '100% success', 'no risk',
    '#1', 'best in class', 'cure', 'heal', 'financial freedom', 
    'get rich', 'miracle', 'secret', 'shocking truth', 'act now or else',
    'once in a lifetime', 'as seen on tv', 'free gift', 'winner',
    'double your', 'triple your', 'unlimited'
  ],
  platform_rules: {
    google: { 
      maxLength: 30, 
      prohibited: ['click here', 'call now', 'buy now directly'],
      required: []
    },
    meta: { 
      maxLength: 40, 
      prohibited: ['facebook', 'instagram', 'meta', 'fb'],
      required: []
    },
    tiktok: { 
      maxLength: 60, 
      prohibited: ['link in bio', 'swipe up', 'dm for details'],
      required: []
    },
    linkedin: { 
      maxLength: 45, 
      prohibited: ['connect now', 'follow for more'],
      required: []
    }
  } as Record<string, { maxLength: number; prohibited: string[]; required: string[] }>,
  legal_claims: [
    'fda approved', 'clinically proven', 'doctor recommended',
    'scientifically proven', 'certified', 'licensed', 'patented'
  ]
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

export interface ThinkingLogEntry {
  step: number;
  action: string;
  reasoning: string;
  input?: unknown;
  output?: unknown;
  timestamp: string;
  severity?: 'info' | 'warning' | 'error' | 'critical';
}

export interface ComplianceCheck {
  field: string;
  passed: boolean;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  suggestion?: string;
  ruleViolated?: string;
  affectedContent?: string;
}

export interface ComplianceResult {
  approved: boolean;
  overallScore: number;
  riskScore: number;
  publishEnabled: boolean;
  checks: ComplianceCheck[];
  recommendations: string[];
  requiresRewrite: boolean;
  rewrittenContent?: string;
  riskBreakdown?: {
    brandSafety: number;
    compliance: number;
    platformPolicy: number;
    legal: number;
  };
}

export interface AuditTask {
  type: 'single_creative' | 'campaign_audit' | 'batch_audit' | 'pre_publish_check';
  content: string | string[];
  contentType: 'headline' | 'description' | 'full_ad' | 'image_prompt';
  platform?: string;
  options?: {
    autoRewrite?: boolean;
    strictMode?: boolean;
    customRules?: Record<string, unknown>;
  };
}

export interface AuditResult {
  success: boolean;
  overallRiskScore: number;
  publishEnabled: boolean;
  results: ComplianceResult;
  thinkingLog: ThinkingLogEntry[];
  timestamp: string;
  metadata?: {
    processingTime: number;
    checksPerformed: number;
    aiModelUsed?: string;
  };
}

// ============================================
// AUDITOR AGENT CLASS
// ============================================

export class AuditorAgent {
  private thinkingLog: ThinkingLogEntry[] = [];

  constructor(
    private database: D1Database,
    private context: TenantContext,
    private ai: unknown
  ) {}

  /**
   * MASTER EXECUTION LOOP
   */
  async executeAudit(task: AuditTask): Promise<AuditResult> {
    const startTime = Date.now();
    this.thinkingLog = [];
    
    this.logThinking("AUDIT_INIT", "Commencing superhuman audit pass v7.0.0", task, undefined, 'info');

    // Circuit breaker check
    if (this.isCircuitOpen()) {
      this.logThinking("CIRCUIT_BREAKER", "Circuit is open, using fallback mode", undefined, undefined, 'warning');
      return this.createFallbackResult(task, "Circuit breaker is open", startTime);
    }

    // Input validation
    const validation = this.validateTask(task);
    if (!validation.valid) {
      return this.createErrorResult(task, validation.error || "Invalid task", startTime);
    }

    try {
      // 1. Load brand-specific rules
      const safetyDocs = await this.loadBrandSafetyRules();
      const content = this.normalizeContent(task.content);
      
      this.logThinking("RULES_LOADED", `Loaded safety rules with ${safetyDocs.prohibited_terms?.length || 0} prohibited terms`, undefined, undefined, 'info');

      // 2. SEMANTIC SCAN
      const semanticChecks = await this.performSemanticScan(content, task, safetyDocs);
      this.logThinking("SEMANTIC_COMPLETE", `Completed semantic scan: ${semanticChecks.filter(c => !c.passed).length} issues found`, undefined, semanticChecks, 'info');

      // 3. NEURAL ADVERSARIAL AUDIT
      const neuralAudit = await this.performNeuralAudit(content, task, safetyDocs);
      this.logThinking("NEURAL_COMPLETE", `Neural audit score: ${neuralAudit.neuralScore}`, undefined, neuralAudit, 'info');

      // 4. PLATFORM-SPECIFIC VALIDATION
      const platformChecks = this.performPlatformValidation(content, task, safetyDocs);

      // 5. LEGAL CLAIMS CHECK
      const legalChecks = this.performLegalClaimsCheck(content, safetyDocs);

      // 6. GOVERNANCE SYNTHESIS
      const allChecks = [...semanticChecks, ...platformChecks, ...legalChecks, ...neuralAudit.violations];
      const finalCompliance = this.synthesizeGovernance(allChecks, neuralAudit, task);

      // 7. AUTO-REWRITE (if enabled and needed)
      if (task.options?.autoRewrite && finalCompliance.requiresRewrite) {
        finalCompliance.rewrittenContent = await this.attemptAutoRewrite(content, allChecks, task);
      }

      const result: AuditResult = {
        success: true,
        overallRiskScore: finalCompliance.riskScore,
        publishEnabled: finalCompliance.publishEnabled,
        results: finalCompliance,
        thinkingLog: this.thinkingLog,
        timestamp: new Date().toISOString(),
        metadata: {
          processingTime: Date.now() - startTime,
          checksPerformed: allChecks.length,
          aiModelUsed: this.ai ? AUDITOR_CONFIG.models.reasoning : 'heuristic'
        }
      };

      // 8. PERSISTENCE
      await this.persistAuditLog(result);
      await this.logAuditTask(task, result, Date.now() - startTime);

      // Reset circuit breaker on success
      this.resetCircuitBreaker();

      return result;
    } catch (error: unknown) {
      this.recordCircuitFailure();
      return this.handleGovernanceFault(task, error, startTime);
    }
  }

  // ============================================
  // VALIDATION
  // ============================================

  private validateTask(task: AuditTask): { valid: boolean; error?: string } {
    if (!task || !task.type) {
      return { valid: false, error: "Task type is required" };
    }

    if (!task.content) {
      return { valid: false, error: "Content is required" };
    }

    const content = this.normalizeContent(task.content);
    if (content.length > AUDITOR_CONFIG.maxContentLength) {
      return { valid: false, error: `Content exceeds maximum length of ${AUDITOR_CONFIG.maxContentLength} characters` };
    }

    return { valid: true };
  }

  private normalizeContent(content: string | string[]): string {
    if (Array.isArray(content)) {
      return content.join(' | ');
    }
    return content;
  }

  // ============================================
  // CIRCUIT BREAKER
  // ============================================

  private isCircuitOpen(): boolean {
    if (!circuitState.isOpen) return false;
    
    if (Date.now() - circuitState.lastFailure > AUDITOR_CONFIG.circuitBreakerResetMs) {
      circuitState.isOpen = false;
      circuitState.failures = 0;
      return false;
    }
    
    return true;
  }

  private recordCircuitFailure(): void {
    circuitState.failures++;
    circuitState.lastFailure = Date.now();
    
    if (circuitState.failures >= AUDITOR_CONFIG.circuitBreakerThreshold) {
      circuitState.isOpen = true;
    }
  }

  private resetCircuitBreaker(): void {
    circuitState.failures = 0;
    circuitState.isOpen = false;
  }

  // ============================================
  // SEMANTIC SCAN
  // ============================================

  private async performSemanticScan(
    content: string, 
    task: AuditTask,
    rules: typeof DEFAULT_SAFETY_RULES
  ): Promise<ComplianceCheck[]> {
    this.logThinking("SEMANTIC", "Scanning for prohibited terms and patterns", undefined, undefined, 'info');
    const checks: ComplianceCheck[] = [];
    const contentLower = content.toLowerCase();
    
    // Check prohibited terms (Default + Custom)
    const prohibited = [...rules.prohibited_terms];
    for (const term of prohibited) {
      if (contentLower.includes(term.toLowerCase())) {
        checks.push({
          field: 'prohibited_terms',
          passed: false,
          severity: 'critical',
          message: `Prohibited term found: "${term}"`,
          suggestion: `Remove or replace "${term}" with compliant alternative`,
          ruleViolated: 'BRAND_SAFETY_001',
          affectedContent: term
        });
      }
    }

    // Check for all caps (shouting)
    const capsWords = content.match(/\b[A-Z]{4,}\b/g) || [];
    if (capsWords.length > 2) {
      checks.push({
        field: 'formatting',
        passed: false,
        severity: 'medium',
        message: `Excessive capitalization detected (${capsWords.length} words)`,
        suggestion: 'Reduce use of all-caps words for better engagement',
        ruleViolated: 'STYLE_001',
        affectedContent: capsWords.join(', ')
      });
    }

    // Check for excessive punctuation
    const excessivePunctuation = content.match(/[!?]{2,}/g) || [];
    if (excessivePunctuation.length > 0) {
      checks.push({
        field: 'formatting',
        passed: false,
        severity: 'low',
        message: 'Excessive punctuation detected',
        suggestion: 'Use single punctuation marks for professional appearance',
        ruleViolated: 'STYLE_002'
      });
    }

    return checks;
  }

  // ============================================
  // PLATFORM VALIDATION
  // ============================================

  private performPlatformValidation(
    content: string,
    task: AuditTask,
    rules: typeof DEFAULT_SAFETY_RULES
  ): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];
    const platform = task.platform || 'google';
    const platformRules = rules.platform_rules[platform];
    
    if (!platformRules) return checks;

    // Length check
    if (task.contentType === 'headline' && content.length > platformRules.maxLength) {
      checks.push({
        field: 'length',
        passed: false,
        severity: 'high',
        message: `Content exceeds ${platform} limit: ${content.length}/${platformRules.maxLength} chars`,
        suggestion: `Shorten to ${platformRules.maxLength} characters or less`,
        ruleViolated: `PLATFORM_${platform.toUpperCase()}_001`
      });
    }

    // Platform-specific prohibited terms
    const contentLower = content.toLowerCase();
    for (const term of platformRules.prohibited) {
      if (contentLower.includes(term.toLowerCase())) {
        checks.push({
          field: 'platform_prohibited',
          passed: false,
          severity: 'high',
          message: `Term "${term}" prohibited on ${platform}`,
          suggestion: `Remove "${term}" for ${platform} compliance`,
          ruleViolated: `PLATFORM_${platform.toUpperCase()}_002`,
          affectedContent: term
        });
      }
    }

    return checks;
  }

  // ============================================
  // LEGAL CLAIMS CHECK
  // ============================================

  private performLegalClaimsCheck(
    content: string,
    rules: typeof DEFAULT_SAFETY_RULES
  ): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];
    const contentLower = content.toLowerCase();

    for (const claim of rules.legal_claims) {
      if (contentLower.includes(claim.toLowerCase())) {
        checks.push({
          field: 'legal_claim',
          passed: false,
          severity: 'critical',
          message: `Unverified legal claim: "${claim}"`,
          suggestion: 'Requires documented proof or removal',
          ruleViolated: 'LEGAL_001',
          affectedContent: claim
        });
      }
    }

    return checks;
  }

  // ============================================
  // NEURAL ADVERSARIAL AUDIT
  // ============================================

  private async performNeuralAudit(
    content: string, 
    task: AuditTask, 
    rules: typeof DEFAULT_SAFETY_RULES
  ): Promise<{ violations: ComplianceCheck[]; neuralScore: number; rationale: string }> {
    this.logThinking("COGNITION", "Invoking adversarial reasoning pass", undefined, undefined, 'info');
    
    const defaultResult = {
      violations: [] as ComplianceCheck[],
      neuralScore: 0,
      rationale: "Heuristic analysis - no neural audit available"
    };

    if (!this.ai) {
      return defaultResult;
    }
    
    const prompt = `
Act as a Strict Compliance Auditor for digital advertising. Your role is to protect brands from regulatory issues and reputational damage.

CONTENT TO AUDIT:
"${content}"

CONTENT TYPE: ${task.contentType}
PLATFORM: ${task.platform || 'General'}

RULES TO CHECK:
- Prohibited terms: ${rules.prohibited_terms.slice(0, 10).join(', ')}...
- No misleading claims or false urgency
- No discriminatory language
- Platform-specific guidelines must be followed

TASKS:
1. Identify ANY hidden risks (misleading implications, potential offense, legal issues)
2. Score the content's risk level (0-100, where 100 is highest risk)
3. Provide specific, actionable recommendations

OUTPUT FORMAT (JSON only):
{
  "violations": [
    {"message": "Issue description", "severity": "critical|high|medium|low", "suggestion": "How to fix"}
  ],
  "neuralScore": 25,
  "rationale": "Brief explanation of the overall risk assessment"
}`;

    try {
      const response = await (this.ai as { run: (model: string, params: { prompt: string }) => Promise<{ response?: string }> })
        .run(AUDITOR_CONFIG.models.reasoning, { prompt });
      
      const cleanedJSON = response?.response?.match(/\{[\s\S]*\}/)?.[0];
      if (cleanedJSON) {
        const parsed = JSON.parse(cleanedJSON);
        return {
          violations: (parsed.violations || []).map((v: { message: string; severity?: string; suggestion?: string }) => ({
            field: 'neural_check',
            passed: false,
            severity: (v.severity || 'medium') as ComplianceCheck['severity'],
            message: v.message,
            suggestion: v.suggestion,
            ruleViolated: 'NEURAL_AUDIT'
          })),
          neuralScore: typeof parsed.neuralScore === 'number' ? parsed.neuralScore : 0,
          rationale: parsed.rationale || "Neural audit completed"
        };
      }
    } catch (e) {
      this.logThinking("NEURAL_FALLBACK", `Neural audit failed: ${e instanceof Error ? e.message : 'unknown'}`, undefined, undefined, 'warning');
    }
    
    return defaultResult;
  }

  // ============================================
  // GOVERNANCE SYNTHESIS
  // ============================================

  private synthesizeGovernance(
    checks: ComplianceCheck[], 
    neural: { neuralScore: number; rationale: string }, 
    task: AuditTask
  ): ComplianceResult {
    // Calculate risk score
    let riskScore = neural.neuralScore;
    
    for (const check of checks) {
      if (!check.passed) {
        switch (check.severity) {
          case 'critical': riskScore += 25; break;
          case 'high': riskScore += 15; break;
          case 'medium': riskScore += 10; break;
          case 'low': riskScore += 5; break;
        }
      }
    }
    
    riskScore = Math.min(100, riskScore);
    
    // Determine publish status
    const hasCritical = checks.some(c => !c.passed && c.severity === 'critical');
    const publishEnabled = riskScore < AUDITOR_CONFIG.riskThreshold && !hasCritical;
    const approved = riskScore < 30 && !hasCritical;

    this.logThinking(
      "GOVERNANCE_FINAL", 
      `Risk Score: ${riskScore}. Publish ${publishEnabled ? 'ENABLED' : 'LOCKED'}`,
      undefined,
      { riskScore, publishEnabled, approved },
      riskScore >= AUDITOR_CONFIG.criticalThreshold ? 'critical' : 'info'
    );

    // Generate recommendations
    const recommendations: string[] = [];
    const failedChecks = checks.filter(c => !c.passed);
    
    for (const check of failedChecks.slice(0, 5)) {
      if (check.suggestion) {
        recommendations.push(check.suggestion);
      }
    }
    
    if (!publishEnabled && recommendations.length === 0) {
      recommendations.push('Review all flagged issues before publishing');
    }

    // Risk breakdown
    const riskBreakdown = {
      brandSafety: checks.filter(c => c.ruleViolated?.startsWith('BRAND_SAFETY') && !c.passed).length * 20,
      compliance: checks.filter(c => c.ruleViolated?.startsWith('LEGAL') && !c.passed).length * 25,
      platformPolicy: checks.filter(c => c.ruleViolated?.startsWith('PLATFORM') && !c.passed).length * 15,
      legal: checks.filter(c => c.field === 'legal_claim' && !c.passed).length * 30
    };

    return {
      approved,
      overallScore: 100 - riskScore,
      riskScore,
      publishEnabled,
      checks,
      recommendations,
      requiresRewrite: !approved && failedChecks.length > 0,
      riskBreakdown
    };
  }

  // ============================================
  // AUTO-REWRITE
  // ============================================

  private async attemptAutoRewrite(
    content: string, 
    checks: ComplianceCheck[], 
    task: AuditTask
  ): Promise<string | undefined> {
    if (!this.ai) return undefined;

    const issues = checks.filter(c => !c.passed).map(c => c.message).join('; ');
    
    const prompt = `
Rewrite the following content to fix compliance issues while maintaining the original meaning and marketing intent.

ORIGINAL: "${content}"
ISSUES TO FIX: ${issues}
CONTENT TYPE: ${task.contentType}
PLATFORM: ${task.platform || 'general'}

Requirements:
- Maintain the core message
- Remove all problematic elements
- Stay within character limits
- Keep the tone professional

OUTPUT: Only the rewritten content, nothing else.`;

    try {
      const response = await (this.ai as { run: (model: string, params: { prompt: string }) => Promise<{ response?: string }> })
        .run(AUDITOR_CONFIG.models.reasoning, { prompt });
      
      return response?.response?.trim();
    } catch {
      return undefined;
    }
  }

  // ============================================
  // LOGGING & PERSISTENCE
  // ============================================

  private logThinking(
    action: string, 
    reasoning: string, 
    input?: unknown, 
    output?: unknown,
    severity: ThinkingLogEntry['severity'] = 'info'
  ): void {
    this.thinkingLog.push({
      step: this.thinkingLog.length + 1,
      action,
      reasoning,
      input,
      output,
      timestamp: new Date().toISOString(),
      severity
    });
  }

  private async loadBrandSafetyRules(): Promise<typeof DEFAULT_SAFETY_RULES> {
    try {
      const { results } = await this.database.prepare(
        "SELECT content, document_type FROM brand_safety_documents WHERE brand_id = ? AND status = 'active'"
      ).bind(this.context.brandId).all();
      
      if (!results || results.length === 0) return DEFAULT_SAFETY_RULES;
      
      // Merge custom rules with defaults
      let customProhibited: string[] = [];
      for (const doc of results) {
        if (doc.document_type === 'prohibited_terms') {
          const content = doc.content as string;
          customProhibited = customProhibited.concat(content.split('\n').filter(t => t.trim()));
        }
      }
      
      return {
        ...DEFAULT_SAFETY_RULES,
        prohibited_terms: [...DEFAULT_SAFETY_RULES.prohibited_terms, ...customProhibited]
      };
    } catch (error) {
      console.error('Error loading brand safety rules:', error);
      return DEFAULT_SAFETY_RULES;
    }
  }

  private async persistAuditLog(result: AuditResult): Promise<void> {
    try {
      await this.database.prepare(
        "INSERT INTO audit_logs (id, brand_id, org_id, risk_score, publish_enabled, thinking_log, checks_count) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).bind(
        crypto.randomUUID(), 
        this.context.brandId,
        this.context.orgId,
        result.overallRiskScore, 
        result.publishEnabled ? 1 : 0, 
        JSON.stringify(result.thinkingLog),
        result.results.checks.length
      ).run();
    } catch (error) {
      console.error('Error persisting audit log:', error);
    }
  }

  private async logAuditTask(task: AuditTask, result: AuditResult, duration: number): Promise<void> {
    try {
      await this.database.prepare(
        "INSERT INTO agent_tasks (id, brand_id, org_id, agent_type, task_type, status, duration_ms, output_data) VALUES (?, ?, ?, 'auditor', ?, ?, ?, ?)"
      ).bind(
        crypto.randomUUID(), 
        this.context.brandId, 
        this.context.orgId, 
        task.type, 
        result.success ? 'completed' : 'failed', 
        duration,
        JSON.stringify({ riskScore: result.overallRiskScore, publishEnabled: result.publishEnabled })
      ).run();
    } catch (error) {
      console.error('Error logging audit task:', error);
    }
  }

  // ============================================
  // ERROR HANDLING
  // ============================================

  private handleGovernanceFault(task: AuditTask, error: unknown, startTime: number): AuditResult {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    this.logThinking("FAULT", errorMessage, undefined, undefined, 'error');
    
    return {
      success: false,
      overallRiskScore: 100,
      publishEnabled: false,
      results: {
        approved: false,
        overallScore: 0,
        riskScore: 100,
        publishEnabled: false,
        checks: [],
        recommendations: [`Audit failed: ${errorMessage}`],
        requiresRewrite: false
      },
      thinkingLog: this.thinkingLog,
      timestamp: new Date().toISOString(),
      metadata: {
        processingTime: Date.now() - startTime,
        checksPerformed: 0
      }
    };
  }

  private createErrorResult(task: AuditTask, error: string, startTime: number): AuditResult {
    this.logThinking("ERROR", error, undefined, undefined, 'error');
    
    return {
      success: false,
      overallRiskScore: 100,
      publishEnabled: false,
      results: {
        approved: false,
        overallScore: 0,
        riskScore: 100,
        publishEnabled: false,
        checks: [],
        recommendations: [error],
        requiresRewrite: false
      },
      thinkingLog: this.thinkingLog,
      timestamp: new Date().toISOString(),
      metadata: {
        processingTime: Date.now() - startTime,
        checksPerformed: 0
      }
    };
  }

  private createFallbackResult(task: AuditTask, reason: string, startTime: number): AuditResult {
    // Perform basic heuristic audit
    const content = this.normalizeContent(task.content);
    const basicChecks = this.performSemanticScan(content, task, DEFAULT_SAFETY_RULES);
    const riskScore = basicChecks.filter(c => !c.passed).length * 15;
    
    return {
      success: true,
      overallRiskScore: Math.min(100, riskScore),
      publishEnabled: riskScore < AUDITOR_CONFIG.riskThreshold,
      results: {
        approved: riskScore < 30,
        overallScore: 100 - riskScore,
        riskScore,
        publishEnabled: riskScore < AUDITOR_CONFIG.riskThreshold,
        checks: basicChecks,
        recommendations: ['Operating in fallback mode - full audit available when system recovers'],
        requiresRewrite: riskScore >= 30
      },
      thinkingLog: this.thinkingLog,
      timestamp: new Date().toISOString(),
      metadata: {
        processingTime: Date.now() - startTime,
        checksPerformed: basicChecks.length,
        aiModelUsed: 'heuristic_fallback'
      }
    };
  }
}

// FACTORY
export function createAuditorAgent(database: D1Database, context: TenantContext, ai?: unknown): AuditorAgent {
  return new AuditorAgent(database, context, ai);
}
