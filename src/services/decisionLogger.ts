// Decision Logger Service for OWNLAY Marketing OS
// Provides transparent reasoning and activity feed for all agent decisions
// Version: 4.1.0 - Enterprise Observability

import { TenantContext } from '../db/multiTenant';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface DecisionLog {
  id: string;
  org_id: string;
  brand_id: string;
  agent_type: string;
  agent_session_id: string | null;
  decision_type: string;
  action_taken: string;
  reasoning: string;
  evidence_used: Record<string, any>;
  confidence_score: number;
  trigger_event: string | null;
  context_data: Record<string, any>;
  outcome_prediction: Record<string, any>;
  predicted_impact: string;
  requires_approval: boolean;
  approval_status: 'none' | 'pending' | 'approved' | 'rejected' | 'auto_approved';
  created_at: string;
}

export interface ActivityFeedItem {
  id: string;
  org_id: string;
  brand_id: string;
  agent_type: string;
  activity_type: 'thinking' | 'analyzing' | 'deciding' | 'executing' | 'completed' | 'error' | 'waiting_approval';
  title: string;
  description: string;
  status: 'active' | 'completed' | 'error' | 'pending';
  progress: number;
  icon: string;
  color: string;
  metadata: Record<string, any>;
  parent_activity_id: string | null;
  decision_log_id: string | null;
  started_at: string;
  completed_at: string | null;
  duration_ms: number | null;
}

export interface CreateDecisionLogInput {
  agent_type: string;
  decision_type: string;
  action_taken: string;
  reasoning: string;
  evidence_used: Record<string, any>;
  confidence_score: number;
  trigger_event?: string;
  context_data?: Record<string, any>;
  outcome_prediction?: Record<string, any>;
  predicted_impact?: string;
  requires_approval?: boolean;
  session_id?: string;
}

// ============================================
// DECISION LOGGER CLASS
// ============================================

export class DecisionLogger {
  private context: TenantContext;
  private database: D1Database;
  private sessionId: string;

  constructor(database: D1Database, context: TenantContext, sessionId?: string) {
    this.database = database;
    this.context = context;
    this.sessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  // ============================================
  // DECISION LOGGING
  // ============================================

  async logDecision(input: CreateDecisionLogInput): Promise<string> {
    const id = `dec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const requiresApproval = input.requires_approval || 
      this.shouldRequireApproval(input.decision_type, input.confidence_score);

    await this.database.prepare(`
      INSERT INTO agent_decision_logs (
        id, org_id, brand_id, agent_type, agent_session_id,
        decision_type, action_taken, reasoning, evidence_used,
        confidence_score, trigger_event, context_data,
        outcome_prediction, predicted_impact, requires_approval, approval_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      this.context.orgId,
      this.context.brandId,
      input.agent_type,
      this.sessionId,
      input.decision_type,
      input.action_taken,
      input.reasoning,
      JSON.stringify(input.evidence_used),
      input.confidence_score,
      input.trigger_event || null,
      JSON.stringify(input.context_data || {}),
      JSON.stringify(input.outcome_prediction || {}),
      input.predicted_impact || null,
      requiresApproval ? 1 : 0,
      requiresApproval ? 'pending' : 'auto_approved'
    ).run();

    // Create activity feed entry
    await this.createActivity({
      agent_type: input.agent_type,
      activity_type: requiresApproval ? 'waiting_approval' : 'deciding',
      title: `${this.formatAgentName(input.agent_type)}: ${input.decision_type.replace(/_/g, ' ')}`,
      description: input.action_taken,
      status: requiresApproval ? 'pending' : 'completed',
      progress: requiresApproval ? 80 : 100,
      metadata: {
        decision_id: id,
        confidence: input.confidence_score,
        requires_approval: requiresApproval
      },
      decision_log_id: id
    });

    // If requires approval, create approval queue entry
    if (requiresApproval) {
      await this.createApprovalEntry(id, input);
    }

    return id;
  }

  private shouldRequireApproval(decisionType: string, confidence: number): boolean {
    // High-impact decisions always require approval
    const highImpactDecisions = [
      'budget_move', 'campaign_pause', 'campaign_launch', 
      'budget_increase', 'strategy_change', 'creative_launch'
    ];

    if (highImpactDecisions.includes(decisionType)) {
      return true;
    }

    // Low confidence decisions require approval
    if (confidence < 70) {
      return true;
    }

    return false;
  }

  private async createApprovalEntry(decisionId: string, input: CreateDecisionLogInput): Promise<void> {
    const id = `appr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await this.database.prepare(`
      INSERT INTO approval_queue (
        id, org_id, brand_id, item_type, item_id, item_title, item_description,
        agent_type, agent_reasoning, agent_confidence, decision_log_id,
        proposed_action, expected_outcome, risk_level, priority, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `).bind(
      id,
      this.context.orgId,
      this.context.brandId,
      input.decision_type,
      decisionId,
      `${this.formatAgentName(input.agent_type)}: ${input.action_taken.substring(0, 50)}...`,
      input.action_taken,
      input.agent_type,
      input.reasoning,
      input.confidence_score,
      decisionId,
      JSON.stringify(input.context_data || {}),
      JSON.stringify(input.outcome_prediction || {}),
      this.assessRiskLevel(input.confidence_score, input.decision_type),
      this.assessPriority(input.decision_type)
    ).run();
  }

  private assessRiskLevel(confidence: number, decisionType: string): string {
    if (confidence < 50) return 'high';
    if (confidence < 70) return 'medium';
    if (['campaign_pause', 'budget_move'].includes(decisionType)) return 'medium';
    return 'low';
  }

  private assessPriority(decisionType: string): string {
    const urgentDecisions = ['budget_move', 'campaign_pause', 'compliance_flag'];
    const highPriority = ['campaign_launch', 'strategy_change'];
    
    if (urgentDecisions.includes(decisionType)) return 'urgent';
    if (highPriority.includes(decisionType)) return 'high';
    return 'normal';
  }

  async updateDecisionOutcome(decisionId: string, outcome: {
    actual_outcome: Record<string, any>;
    prediction_accuracy?: number;
  }): Promise<void> {
    await this.database.prepare(`
      UPDATE agent_decision_logs 
      SET actual_outcome = ?, outcome_measured_at = CURRENT_TIMESTAMP, 
          prediction_accuracy = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND org_id = ? AND brand_id = ?
    `).bind(
      JSON.stringify(outcome.actual_outcome),
      outcome.prediction_accuracy || null,
      decisionId,
      this.context.orgId,
      this.context.brandId
    ).run();
  }

  // ============================================
  // ACTIVITY FEED
  // ============================================

  async createActivity(input: {
    agent_type: string;
    activity_type: ActivityFeedItem['activity_type'];
    title: string;
    description: string;
    status?: 'active' | 'completed' | 'error' | 'pending';
    progress?: number;
    metadata?: Record<string, any>;
    parent_activity_id?: string;
    decision_log_id?: string;
    expires_in_minutes?: number;
  }): Promise<string> {
    const id = `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const { icon, color } = this.getActivityVisuals(input.activity_type, input.agent_type);

    const expiresAt = input.expires_in_minutes 
      ? new Date(Date.now() + input.expires_in_minutes * 60 * 1000).toISOString()
      : null;

    await this.database.prepare(`
      INSERT INTO agent_activity_feed (
        id, org_id, brand_id, agent_type, activity_type, title, description,
        status, progress, icon, color, metadata, parent_activity_id,
        decision_log_id, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      this.context.orgId,
      this.context.brandId,
      input.agent_type,
      input.activity_type,
      input.title,
      input.description,
      input.status || 'active',
      input.progress || 0,
      icon,
      color,
      JSON.stringify(input.metadata || {}),
      input.parent_activity_id || null,
      input.decision_log_id || null,
      expiresAt
    ).run();

    return id;
  }

  async updateActivity(activityId: string, updates: {
    status?: string;
    progress?: number;
    description?: string;
    completed?: boolean;
  }): Promise<void> {
    const setClauses: string[] = [];
    const values: any[] = [];

    if (updates.status !== undefined) {
      setClauses.push('status = ?');
      values.push(updates.status);
    }
    if (updates.progress !== undefined) {
      setClauses.push('progress = ?');
      values.push(updates.progress);
    }
    if (updates.description !== undefined) {
      setClauses.push('description = ?');
      values.push(updates.description);
    }
    if (updates.completed) {
      setClauses.push('completed_at = CURRENT_TIMESTAMP');
      setClauses.push('status = ?');
      values.push('completed');
    }

    if (setClauses.length === 0) return;

    values.push(activityId, this.context.orgId, this.context.brandId);

    await this.database.prepare(`
      UPDATE agent_activity_feed 
      SET ${setClauses.join(', ')}
      WHERE id = ? AND org_id = ? AND brand_id = ?
    `).bind(...values).run();
  }

  async completeActivity(activityId: string, result?: string): Promise<void> {
    // Get start time for duration calculation
    const activity = await this.database.prepare(`
      SELECT started_at FROM agent_activity_feed WHERE id = ?
    `).bind(activityId).first<{ started_at: string }>();

    const durationMs = activity 
      ? Date.now() - new Date(activity.started_at).getTime()
      : null;

    await this.database.prepare(`
      UPDATE agent_activity_feed 
      SET status = 'completed', progress = 100, completed_at = CURRENT_TIMESTAMP,
          duration_ms = ?, metadata = json_set(COALESCE(metadata, '{}'), '$.result', ?)
      WHERE id = ? AND org_id = ? AND brand_id = ?
    `).bind(
      durationMs,
      result || 'Success',
      activityId,
      this.context.orgId,
      this.context.brandId
    ).run();
  }

  async errorActivity(activityId: string, error: string): Promise<void> {
    await this.database.prepare(`
      UPDATE agent_activity_feed 
      SET status = 'error', completed_at = CURRENT_TIMESTAMP,
          metadata = json_set(COALESCE(metadata, '{}'), '$.error', ?)
      WHERE id = ? AND org_id = ? AND brand_id = ?
    `).bind(
      error,
      activityId,
      this.context.orgId,
      this.context.brandId
    ).run();
  }

  private getActivityVisuals(activityType: string, agentType: string): { icon: string; color: string } {
    const icons: Record<string, string> = {
      thinking: 'brain',
      analyzing: 'chart-bar',
      deciding: 'lightbulb',
      executing: 'play',
      completed: 'check-circle',
      error: 'exclamation-circle',
      waiting_approval: 'clock'
    };

    const agentColors: Record<string, string> = {
      researcher: 'blue',
      strategist: 'purple',
      creative: 'pink',
      auditor: 'amber',
      orchestrator: 'indigo'
    };

    return {
      icon: icons[activityType] || 'cog',
      color: agentColors[agentType] || 'gray'
    };
  }

  private formatAgentName(agentType: string): string {
    return agentType.charAt(0).toUpperCase() + agentType.slice(1) + ' Agent';
  }

  // ============================================
  // QUERY METHODS
  // ============================================

  async getRecentDecisions(limit: number = 50): Promise<DecisionLog[]> {
    const result = await this.database.prepare(`
      SELECT * FROM agent_decision_logs
      WHERE org_id = ? AND brand_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `).bind(this.context.orgId, this.context.brandId, limit).all<any>();

    return (result.results || []).map(d => ({
      ...d,
      evidence_used: JSON.parse(d.evidence_used || '{}'),
      context_data: JSON.parse(d.context_data || '{}'),
      outcome_prediction: JSON.parse(d.outcome_prediction || '{}'),
      requires_approval: d.requires_approval === 1
    }));
  }

  async getDecisionsBySession(sessionId: string): Promise<DecisionLog[]> {
    const result = await this.database.prepare(`
      SELECT * FROM agent_decision_logs
      WHERE org_id = ? AND brand_id = ? AND agent_session_id = ?
      ORDER BY created_at ASC
    `).bind(this.context.orgId, this.context.brandId, sessionId).all<any>();

    return (result.results || []).map(d => ({
      ...d,
      evidence_used: JSON.parse(d.evidence_used || '{}'),
      context_data: JSON.parse(d.context_data || '{}'),
      outcome_prediction: JSON.parse(d.outcome_prediction || '{}'),
      requires_approval: d.requires_approval === 1
    }));
  }

  async getActivityFeed(options: {
    limit?: number;
    status?: string;
    agent_type?: string;
    include_expired?: boolean;
  } = {}): Promise<ActivityFeedItem[]> {
    let query = `
      SELECT * FROM agent_activity_feed
      WHERE org_id = ? AND brand_id = ?
    `;
    const params: any[] = [this.context.orgId, this.context.brandId];

    if (!options.include_expired) {
      query += ` AND (expires_at IS NULL OR expires_at > datetime('now'))`;
    }

    if (options.status) {
      query += ` AND status = ?`;
      params.push(options.status);
    }

    if (options.agent_type) {
      query += ` AND agent_type = ?`;
      params.push(options.agent_type);
    }

    query += ` ORDER BY started_at DESC LIMIT ?`;
    params.push(options.limit || 50);

    const result = await this.database.prepare(query).bind(...params).all<any>();

    return (result.results || []).map(a => ({
      ...a,
      metadata: JSON.parse(a.metadata || '{}')
    }));
  }

  async getPendingApprovals(): Promise<any[]> {
    const result = await this.database.prepare(`
      SELECT * FROM approval_queue
      WHERE org_id = ? AND brand_id = ? AND status = 'pending'
      ORDER BY 
        CASE priority 
          WHEN 'urgent' THEN 1 
          WHEN 'high' THEN 2 
          WHEN 'normal' THEN 3 
          ELSE 4 
        END,
        created_at ASC
    `).bind(this.context.orgId, this.context.brandId).all<any>();

    return (result.results || []).map(a => ({
      ...a,
      proposed_action: JSON.parse(a.proposed_action || '{}'),
      expected_outcome: JSON.parse(a.expected_outcome || '{}')
    }));
  }

  async approveDecision(approvalId: string, userId: string, notes?: string): Promise<void> {
    // Update approval queue
    await this.database.prepare(`
      UPDATE approval_queue
      SET status = 'approved', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP,
          review_notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND org_id = ? AND brand_id = ?
    `).bind(notes || null, approvalId, this.context.orgId, this.context.brandId, userId).run();

    // Get the decision log ID
    const approval = await this.database.prepare(`
      SELECT decision_log_id FROM approval_queue WHERE id = ?
    `).bind(approvalId).first<{ decision_log_id: string }>();

    if (approval?.decision_log_id) {
      // Update decision log
      await this.database.prepare(`
        UPDATE agent_decision_logs
        SET approval_status = 'approved', approved_by = ?, approved_at = CURRENT_TIMESTAMP,
            approval_notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(userId, notes || null, approval.decision_log_id).run();

      // Create activity
      await this.createActivity({
        agent_type: 'system',
        activity_type: 'completed',
        title: 'Decision Approved',
        description: `Decision ${approval.decision_log_id} was approved${notes ? `: ${notes}` : ''}`,
        status: 'completed',
        progress: 100,
        metadata: { decision_id: approval.decision_log_id, approved_by: userId }
      });
    }
  }

  async rejectDecision(approvalId: string, userId: string, reason: string): Promise<void> {
    await this.database.prepare(`
      UPDATE approval_queue
      SET status = 'rejected', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP,
          review_notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND org_id = ? AND brand_id = ?
    `).bind(userId, reason, approvalId, this.context.orgId, this.context.brandId).run();

    const approval = await this.database.prepare(`
      SELECT decision_log_id FROM approval_queue WHERE id = ?
    `).bind(approvalId).first<{ decision_log_id: string }>();

    if (approval?.decision_log_id) {
      await this.database.prepare(`
        UPDATE agent_decision_logs
        SET approval_status = 'rejected', approved_by = ?, approved_at = CURRENT_TIMESTAMP,
            approval_notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(userId, reason, approval.decision_log_id).run();
    }
  }
}

// Factory function
export function createDecisionLogger(
  database: D1Database, 
  context: TenantContext, 
  sessionId?: string
): DecisionLogger {
  return new DecisionLogger(database, context, sessionId);
}
