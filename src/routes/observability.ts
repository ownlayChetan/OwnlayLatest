// Observability & Analytics API Routes for OWNLAY Marketing OS
// Enterprise Decision Logging, Activity Feed, Approvals, and Predictions
// Version: 4.7.0 - Secure Authentication

import { Hono } from 'hono';
import { multiTenantDb } from '../agents';
import type { TenantContext } from '../agents';
import { createDecisionLogger } from '../services/decisionLogger';
import { createROIPredictionEngine } from '../services/roiPrediction';
import { createTimeSeriesAggregator } from '../services/timeSeriesAggregator';
import { authService } from '../services/auth';

type Bindings = {
  DB: D1Database;
  AI?: any;
};

const observabilityRoutes = new Hono<{ Bindings: Bindings }>();

// ============================================
// MIDDLEWARE: Secure Multi-tenant context
// SECURITY: Never trust X-User-Id headers
// ============================================

observabilityRoutes.use('/*', async (c, next) => {
  // SECURE: Get user from validated token, not from headers
  const authResult = await authService.getUserFromRequest(c);
  const userId = authResult.user?.userId || 'demo_user';
  
  let context: TenantContext | null = await multiTenantDb.getTenantContextWithHistory(c.env.DB, userId);
  
  if (!context) {
    try {
      let org = await multiTenantDb.getOrganizationBySlug(c.env.DB, 'demo-agency');
      
      if (!org) {
        const result = await multiTenantDb.initializeTenantForUser(c.env.DB, userId, {
          orgName: 'Demo Agency',
          orgSlug: 'demo-agency',
          brandName: 'Demo Brand',
          brandSlug: 'demo-brand',
          industry: 'marketing'
        });
        
        context = {
          userId,
          orgId: result.orgId,
          brandId: result.brandId,
          role: 'owner',
          accessibleBrands: [result.brandId],
          permissions: {},
          historicalWinners: []
        };
      } else {
        const brands = await multiTenantDb.getOrganizationBrands(c.env.DB, org.id);
        if (brands.length > 0) {
          context = {
            userId,
            orgId: org.id,
            brandId: brands[0].id,
            role: 'admin',
            accessibleBrands: brands.map(b => b.id),
            permissions: {},
            historicalWinners: []
          };
        }
      }
    } catch (error) {
      console.error('Error setting up tenant context:', error);
    }
  }

  c.set('tenantContext' as any, context);
  c.set('authenticatedUser', authResult.user);
  await next();
});

function getTenantContext(c: any): TenantContext {
  const context = c.get('tenantContext');
  if (!context) {
    throw new Error('Tenant context not available');
  }
  return context;
}

// ============================================
// DECISION LOGS
// ============================================

// Get recent decision logs
observabilityRoutes.get('/decisions', async (c) => {
  try {
    const context = getTenantContext(c);
    const limit = parseInt(c.req.query('limit') || '50');
    const agent = c.req.query('agent');
    
    const logger = createDecisionLogger(c.env.DB, context);
    const decisions = await logger.getRecentDecisions(limit);
    
    // Filter by agent type if specified
    const filtered = agent 
      ? decisions.filter(d => d.agent_type === agent)
      : decisions;
    
    return c.json({
      success: true,
      decisions: filtered,
      count: filtered.length
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

// Get decisions by session
observabilityRoutes.get('/decisions/session/:sessionId', async (c) => {
  try {
    const context = getTenantContext(c);
    const sessionId = c.req.param('sessionId');
    
    const logger = createDecisionLogger(c.env.DB, context);
    const decisions = await logger.getDecisionsBySession(sessionId);
    
    return c.json({
      success: true,
      sessionId,
      decisions,
      count: decisions.length
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

// Log a new decision
observabilityRoutes.post('/decisions', async (c) => {
  try {
    const context = getTenantContext(c);
    const body = await c.req.json();
    
    const logger = createDecisionLogger(c.env.DB, context, body.sessionId);
    
    const decisionId = await logger.logDecision({
      agent_type: body.agentType,
      decision_type: body.decisionType,
      action_taken: body.actionTaken,
      reasoning: body.reasoning,
      evidence_used: body.evidenceUsed || {},
      confidence_score: body.confidenceScore || 75,
      trigger_event: body.triggerEvent,
      context_data: body.contextData,
      outcome_prediction: body.outcomePrediction,
      predicted_impact: body.predictedImpact,
      requires_approval: body.requiresApproval
    });
    
    return c.json({
      success: true,
      decisionId,
      sessionId: logger.getSessionId()
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

// Update decision outcome
observabilityRoutes.put('/decisions/:id/outcome', async (c) => {
  try {
    const context = getTenantContext(c);
    const decisionId = c.req.param('id');
    const body = await c.req.json();
    
    const logger = createDecisionLogger(c.env.DB, context);
    
    await logger.updateDecisionOutcome(decisionId, {
      actual_outcome: body.actualOutcome,
      prediction_accuracy: body.predictionAccuracy
    });
    
    return c.json({
      success: true,
      message: 'Outcome updated'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

// ============================================
// ACTIVITY FEED
// ============================================

// Get activity feed
observabilityRoutes.get('/activity', async (c) => {
  try {
    const context = getTenantContext(c);
    const limit = parseInt(c.req.query('limit') || '50');
    const status = c.req.query('status');
    const agent = c.req.query('agent');
    
    const logger = createDecisionLogger(c.env.DB, context);
    
    const activities = await logger.getActivityFeed({
      limit,
      status,
      agent_type: agent,
      include_expired: c.req.query('includeExpired') === 'true'
    });
    
    return c.json({
      success: true,
      activities,
      count: activities.length
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

// Create activity
observabilityRoutes.post('/activity', async (c) => {
  try {
    const context = getTenantContext(c);
    const body = await c.req.json();
    
    const logger = createDecisionLogger(c.env.DB, context);
    
    const activityId = await logger.createActivity({
      agent_type: body.agentType,
      activity_type: body.activityType,
      title: body.title,
      description: body.description,
      status: body.status,
      progress: body.progress,
      metadata: body.metadata,
      parent_activity_id: body.parentActivityId,
      expires_in_minutes: body.expiresInMinutes
    });
    
    return c.json({
      success: true,
      activityId
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

// Update activity status
observabilityRoutes.put('/activity/:id', async (c) => {
  try {
    const context = getTenantContext(c);
    const activityId = c.req.param('id');
    const body = await c.req.json();
    
    const logger = createDecisionLogger(c.env.DB, context);
    
    if (body.completed) {
      await logger.completeActivity(activityId, body.result);
    } else if (body.error) {
      await logger.errorActivity(activityId, body.error);
    } else {
      await logger.updateActivity(activityId, {
        status: body.status,
        progress: body.progress,
        description: body.description
      });
    }
    
    return c.json({
      success: true,
      message: 'Activity updated'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

// ============================================
// APPROVALS (Human-in-the-Loop)
// ============================================

// Get pending approvals
observabilityRoutes.get('/approvals', async (c) => {
  try {
    const context = getTenantContext(c);
    
    const logger = createDecisionLogger(c.env.DB, context);
    const approvals = await logger.getPendingApprovals();
    
    return c.json({
      success: true,
      approvals,
      count: approvals.length
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

// Approve a decision
observabilityRoutes.post('/approvals/:id/approve', async (c) => {
  try {
    const context = getTenantContext(c);
    const approvalId = c.req.param('id');
    const body = await c.req.json();
    
    const logger = createDecisionLogger(c.env.DB, context);
    
    await logger.approveDecision(approvalId, context.userId, body.notes);
    
    return c.json({
      success: true,
      message: 'Decision approved',
      approvalId
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

// Reject a decision
observabilityRoutes.post('/approvals/:id/reject', async (c) => {
  try {
    const context = getTenantContext(c);
    const approvalId = c.req.param('id');
    const body = await c.req.json();
    
    const logger = createDecisionLogger(c.env.DB, context);
    
    await logger.rejectDecision(approvalId, context.userId, body.reason || 'Rejected');
    
    return c.json({
      success: true,
      message: 'Decision rejected',
      approvalId
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

// ============================================
// ROI PREDICTIONS
// ============================================

// Predict budget impact
observabilityRoutes.post('/predictions/budget', async (c) => {
  try {
    const context = getTenantContext(c);
    const body = await c.req.json();
    
    const engine = createROIPredictionEngine(c.env.DB, context);
    
    const prediction = await engine.predictBudgetImpact({
      budgetChange: body.budgetChange,
      targetMetric: body.targetMetric || 'revenue',
      platform: body.platform,
      campaignId: body.campaignId,
      period: body.period
    });
    
    return c.json({
      success: true,
      prediction
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

// Generate budget scenarios
observabilityRoutes.post('/predictions/scenarios', async (c) => {
  try {
    const context = getTenantContext(c);
    const body = await c.req.json();
    
    const engine = createROIPredictionEngine(c.env.DB, context);
    
    const scenarios = await engine.generateBudgetScenarios({
      currentBudget: body.currentBudget || 10000,
      platform: body.platform,
      campaignId: body.campaignId
    });
    
    return c.json({
      success: true,
      ...scenarios
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

// Get prediction history
observabilityRoutes.get('/predictions', async (c) => {
  try {
    const context = getTenantContext(c);
    const status = c.req.query('status');
    const limit = parseInt(c.req.query('limit') || '50');
    
    const engine = createROIPredictionEngine(c.env.DB, context);
    const predictions = await engine.getPredictions({ status, limit });
    
    return c.json({
      success: true,
      predictions,
      count: predictions.length
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

// Approve prediction
observabilityRoutes.post('/predictions/:id/approve', async (c) => {
  try {
    const context = getTenantContext(c);
    const predictionId = c.req.param('id');
    
    const engine = createROIPredictionEngine(c.env.DB, context);
    await engine.approvePrediction(predictionId, context.userId);
    
    return c.json({
      success: true,
      message: 'Prediction approved',
      predictionId
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

// ============================================
// TIME-SERIES ANALYTICS
// ============================================

// Query time-series data
observabilityRoutes.post('/analytics/timeseries', async (c) => {
  try {
    const context = getTenantContext(c);
    const body = await c.req.json();
    
    const aggregator = createTimeSeriesAggregator(c.env.DB, context);
    
    const result = await aggregator.query({
      startDate: body.startDate,
      endDate: body.endDate,
      granularity: body.granularity || 'day',
      platform: body.platform,
      campaignId: body.campaignId,
      adId: body.adId
    });
    
    return c.json({
      success: true,
      ...result
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

// Get real-time metrics
observabilityRoutes.get('/analytics/realtime', async (c) => {
  try {
    const context = getTenantContext(c);
    const platform = c.req.query('platform');
    const campaignId = c.req.query('campaignId');
    
    const aggregator = createTimeSeriesAggregator(c.env.DB, context);
    const metrics = await aggregator.getRealTimeMetrics({ platform, campaignId });
    
    return c.json({
      success: true,
      ...metrics
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

// Get chart-ready data
observabilityRoutes.post('/analytics/chart', async (c) => {
  try {
    const context = getTenantContext(c);
    const body = await c.req.json();
    
    const aggregator = createTimeSeriesAggregator(c.env.DB, context);
    
    const chartData = await aggregator.getChartData({
      metric: body.metric || 'revenue',
      startDate: body.startDate,
      endDate: body.endDate,
      granularity: body.granularity || 'day',
      platform: body.platform,
      compareWithPrevious: body.compareWithPrevious
    });
    
    return c.json({
      success: true,
      ...chartData
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

// Platform comparison
observabilityRoutes.get('/analytics/platforms', async (c) => {
  try {
    const context = getTenantContext(c);
    const startDate = c.req.query('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = c.req.query('endDate') || new Date().toISOString();
    
    const aggregator = createTimeSeriesAggregator(c.env.DB, context);
    const comparison = await aggregator.getPlatformComparison({ startDate, endDate });
    
    return c.json({
      success: true,
      ...comparison
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

// Ingest metrics (for integrations)
observabilityRoutes.post('/analytics/ingest', async (c) => {
  try {
    const context = getTenantContext(c);
    const body = await c.req.json();
    
    const aggregator = createTimeSeriesAggregator(c.env.DB, context);
    
    if (Array.isArray(body.metrics)) {
      const result = await aggregator.bulkIngest(body.metrics);
      return c.json({
        success: true,
        ...result
      });
    } else {
      const id = await aggregator.ingestMetrics(body);
      return c.json({
        success: true,
        id
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

// Generate sample data (demo)
observabilityRoutes.post('/analytics/generate-sample', async (c) => {
  try {
    const context = getTenantContext(c);
    const body = await c.req.json();
    
    const aggregator = createTimeSeriesAggregator(c.env.DB, context);
    const result = await aggregator.generateSampleData(body.days || 90);
    
    return c.json({
      success: true,
      ...result
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

export { observabilityRoutes };
