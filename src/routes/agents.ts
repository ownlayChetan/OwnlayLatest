// Agent API Routes for OWNLAY Marketing OS
// Multi-tenant, enterprise-grade autonomous marketing agents
// Version: 4.7.0 - Secure Authentication

import { Hono } from 'hono';
import { 
  createOrchestrator,
  createResearcherAgent,
  createStrategistAgent,
  createCreativeAgent,
  createAuditorAgent,
  multiTenantDb,
  ScopedAccessManager
} from '../agents';
import type { TenantContext, OrchestratorTask } from '../agents';
import { authService } from '../services/auth';

type Bindings = {
  DB: D1Database;
  AI?: any;
};

const agentRoutes = new Hono<{ Bindings: Bindings }>();

// ============================================
// MIDDLEWARE: Secure Multi-tenant context
// SECURITY: Never trust X-User-Id headers - always validate tokens
// ============================================

agentRoutes.use('/*', async (c, next) => {
  // SECURE: Get user from validated token, not from headers
  const authResult = await authService.getUserFromRequest(c);
  const userId = authResult.user?.userId || 'demo_user';
  
  // Get or create tenant context with historical winners for AI
  let context: TenantContext | null = await multiTenantDb.getTenantContextWithHistory(c.env.DB, userId);
  
  // For demo purposes, create default tenant if none exists
  if (!context) {
    try {
      // Check if demo org exists
      let org = await multiTenantDb.getOrganizationBySlug(c.env.DB, 'demo-agency');
      
      if (!org) {
        // Create demo organization and brand
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
        // Get first brand
        const brands = await multiTenantDb.getOrganizationBrands(c.env.DB, org.id);
        if (brands.length > 0) {
          // Get historical winners for the brand
          const historicalWinners = await multiTenantDb.getHistoricalWinners(c.env.DB, brands[0].id, org.id);
          
          context = {
            userId,
            orgId: org.id,
            brandId: brands[0].id,
            role: 'admin',
            accessibleBrands: brands.map(b => b.id),
            permissions: {},
            historicalWinners
          };
        }
      }
    } catch (error) {
      console.error('Error setting up tenant context:', error);
    }
  }

  // Store context and authenticated user in request
  c.set('tenantContext' as any, context);
  c.set('authenticatedUser', authResult.user);
  await next();
});

// Helper to get tenant context
function getTenantContext(c: any): TenantContext {
  const context = c.get('tenantContext');
  if (!context) {
    throw new Error('Tenant context not available');
  }
  return context;
}

// ============================================
// ORCHESTRATOR ENDPOINTS
// ============================================

// Execute full campaign pipeline
agentRoutes.post('/orchestrator/full-campaign', async (c) => {
  try {
    const context = getTenantContext(c);
    const body = await c.req.json();
    
    const orchestrator = createOrchestrator(c.env.DB, context, c.env.AI);
    
    const task: OrchestratorTask = {
      type: 'full_campaign',
      config: {
        competitors: body.competitors || [],
        industry: body.industry,
        budget: body.budget || 10000,
        period: body.period || 'monthly',
        platforms: body.platforms || ['google', 'meta', 'tiktok'],
        productInfo: body.productInfo,
        brandName: body.brandName,
        targetAudience: body.targetAudience,
        tone: body.tone || 'professional',
        campaignObjective: body.campaignObjective || 'conversion',
        autoRewrite: body.autoRewrite !== false
      }
    };

    const result = await orchestrator.execute(task);
    
    return c.json({
      success: result.success,
      data: result.finalOutput,
      stages: result.stages,
      executionLog: result.executionLog,
      duration: result.totalDuration,
      timestamp: result.timestamp
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

// Execute research and strategy only
agentRoutes.post('/orchestrator/research-strategy', async (c) => {
  try {
    const context = getTenantContext(c);
    const body = await c.req.json();
    
    const orchestrator = createOrchestrator(c.env.DB, context, c.env.AI);
    
    const result = await orchestrator.execute({
      type: 'research_and_strategy',
      config: {
        competitors: body.competitors || [],
        industry: body.industry,
        budget: body.budget || 10000,
        period: body.period || 'monthly',
        platforms: body.platforms
      }
    });
    
    return c.json({
      success: result.success,
      data: result.finalOutput,
      stages: result.stages,
      duration: result.totalDuration
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

// Execute creative pipeline
agentRoutes.post('/orchestrator/creative-pipeline', async (c) => {
  try {
    const context = getTenantContext(c);
    const body = await c.req.json();
    
    const orchestrator = createOrchestrator(c.env.DB, context, c.env.AI);
    
    const result = await orchestrator.execute({
      type: 'creative_pipeline',
      config: {
        productInfo: body.productInfo,
        brandName: body.brandName,
        industry: body.industry,
        targetAudience: body.targetAudience,
        platforms: body.platforms || ['google', 'meta'],
        tone: body.tone || 'professional',
        campaignObjective: body.campaignObjective || 'conversion',
        autoRewrite: body.autoRewrite !== false
      }
    });
    
    return c.json({
      success: result.success,
      data: result.finalOutput,
      stages: result.stages,
      duration: result.totalDuration
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

// ============================================
// RESEARCHER AGENT ENDPOINTS
// ============================================

agentRoutes.post('/researcher/competitors', async (c) => {
  try {
    const context = getTenantContext(c);
    const body = await c.req.json();
    
    const researcher = createResearcherAgent(c.env.DB, context, c.env.AI);
    
    const result = await researcher.executeResearch({
      type: 'competitor_analysis',
      targets: body.competitors || [],
      industry: body.industry,
      depth: body.depth || 'standard'
    });
    
    return c.json({
      success: result.success,
      data: result.data,
      insights: result.insights,
      recommendations: result.recommendations,
      confidence: result.confidence
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

agentRoutes.post('/researcher/market-trends', async (c) => {
  try {
    const context = getTenantContext(c);
    const body = await c.req.json();
    
    const researcher = createResearcherAgent(c.env.DB, context, c.env.AI);
    
    const result = await researcher.executeResearch({
      type: 'market_trends',
      industry: body.industry || 'general',
      depth: body.depth || 'standard'
    });
    
    return c.json({
      success: result.success,
      data: result.data,
      insights: result.insights,
      recommendations: result.recommendations,
      confidence: result.confidence
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

// ============================================
// STRATEGIST AGENT ENDPOINTS
// ============================================

agentRoutes.post('/strategist/budget-allocation', async (c) => {
  try {
    const context = getTenantContext(c);
    const body = await c.req.json();
    
    const strategist = createStrategistAgent(c.env.DB, context, c.env.AI);
    
    const result = await strategist.executeStrategy({
      type: 'budget_allocation',
      budget: body.budget || 10000,
      period: body.period || 'monthly',
      platforms: body.platforms,
      goals: body.goals
    });
    
    return c.json({
      success: result.success,
      plan: result.plan,
      recommendations: result.recommendations,
      confidence: result.confidence
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

agentRoutes.post('/strategist/performance-analysis', async (c) => {
  try {
    const context = getTenantContext(c);
    const body = await c.req.json();
    
    const strategist = createStrategistAgent(c.env.DB, context, c.env.AI);
    
    const result = await strategist.executeStrategy({
      type: 'performance_analysis',
      platforms: body.platforms
    });
    
    return c.json({
      success: result.success,
      analysis: result.analysis,
      recommendations: result.recommendations,
      confidence: result.confidence
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

agentRoutes.post('/strategist/forecast', async (c) => {
  try {
    const context = getTenantContext(c);
    const body = await c.req.json();
    
    const strategist = createStrategistAgent(c.env.DB, context, c.env.AI);
    
    const result = await strategist.executeStrategy({
      type: 'forecast',
      budget: body.budget,
      period: body.period || 'monthly'
    });
    
    return c.json({
      success: result.success,
      forecast: result.analysis,
      recommendations: result.recommendations,
      confidence: result.confidence
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

// ============================================
// CREATIVE AGENT ENDPOINTS
// ============================================

agentRoutes.post('/creative/generate', async (c) => {
  try {
    const context = getTenantContext(c);
    const body = await c.req.json();
    
    const creative = createCreativeAgent(c.env.DB, context, c.env.AI);
    
    const result = await creative.executeCreative({
      type: body.type || 'full_creative',
      request: {
        productInfo: body.productInfo || 'Product',
        brandName: body.brandName || 'Brand',
        industry: body.industry,
        targetAudience: body.targetAudience,
        platforms: body.platforms || ['google', 'meta'],
        tone: body.tone || 'professional',
        campaignObjective: body.campaignObjective || 'conversion'
      },
      count: body.count || 5
    });
    
    return c.json({
      success: result.success,
      output: result.output,
      recommendations: result.recommendations,
      confidence: result.confidence
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

agentRoutes.post('/creative/headlines', async (c) => {
  try {
    const context = getTenantContext(c);
    const body = await c.req.json();
    
    const creative = createCreativeAgent(c.env.DB, context, c.env.AI);
    
    const result = await creative.executeCreative({
      type: 'headlines_only',
      request: {
        productInfo: body.productInfo || 'Product',
        brandName: body.brandName || 'Brand',
        platforms: body.platforms || ['google', 'meta'],
        tone: body.tone || 'professional'
      },
      count: body.count || 5
    });
    
    return c.json({
      success: result.success,
      headlines: result.output?.headlines,
      recommendations: result.recommendations,
      confidence: result.confidence
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

agentRoutes.post('/creative/image-prompts', async (c) => {
  try {
    const context = getTenantContext(c);
    const body = await c.req.json();
    
    const creative = createCreativeAgent(c.env.DB, context, c.env.AI);
    
    const result = await creative.executeCreative({
      type: 'image_prompts_only',
      request: {
        productInfo: body.productInfo || 'Product',
        brandName: body.brandName || 'Brand',
        platforms: body.platforms || ['google', 'meta'],
        tone: body.tone || 'professional'
      },
      count: body.count || 5
    });
    
    return c.json({
      success: result.success,
      imagePrompts: result.output?.imagePrompts,
      recommendations: result.recommendations,
      confidence: result.confidence
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

// ============================================
// AUDITOR AGENT ENDPOINTS
// ============================================

agentRoutes.post('/auditor/check', async (c) => {
  try {
    const context = getTenantContext(c);
    const body = await c.req.json();
    
    const auditor = createAuditorAgent(c.env.DB, context, c.env.AI);
    await auditor.initialize();
    
    const result = await auditor.executeAudit({
      type: Array.isArray(body.content) ? 'batch_creatives' : 'single_creative',
      content: body.content,
      contentType: body.contentType || 'headline',
      platform: body.platform,
      autoRewrite: body.autoRewrite !== false
    });
    
    return c.json({
      success: result.success,
      results: result.results,
      rewrittenContent: result.rewrittenContent,
      recommendations: result.recommendations,
      confidence: result.confidence
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

agentRoutes.post('/auditor/brand-audit', async (c) => {
  try {
    const context = getTenantContext(c);
    
    const auditor = createAuditorAgent(c.env.DB, context, c.env.AI);
    await auditor.initialize();
    
    const result = await auditor.executeAudit({
      type: 'full_brand_audit',
      content: '',
      contentType: 'full_ad'
    });
    
    return c.json({
      success: result.success,
      results: result.results,
      recommendations: result.recommendations,
      confidence: result.confidence
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

// ============================================
// MULTI-TENANT CONTEXT ENDPOINTS
// ============================================

agentRoutes.get('/context', async (c) => {
  try {
    const context = getTenantContext(c);
    
    // Get organization details
    const org = await multiTenantDb.getOrganization(c.env.DB, context.orgId);
    const brand = await multiTenantDb.getBrand(c.env.DB, context.brandId);
    
    return c.json({
      success: true,
      context: {
        userId: context.userId,
        orgId: context.orgId,
        brandId: context.brandId,
        role: context.role
      },
      organization: org,
      brand: brand,
      accessibleBrands: context.accessibleBrands
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

agentRoutes.post('/context/switch', async (c) => {
  try {
    const userId = c.req.header('X-User-Id') || 'demo_user';
    const body = await c.req.json();
    
    const result = await multiTenantDb.switchContext(
      c.env.DB,
      userId,
      body.orgId,
      body.brandId
    );
    
    return c.json({
      success: result.success,
      context: result.context,
      error: result.error
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

agentRoutes.get('/organizations', async (c) => {
  try {
    const userId = c.req.header('X-User-Id') || 'demo_user';
    const orgs = await multiTenantDb.getUserOrganizations(c.env.DB, userId);
    
    return c.json({
      success: true,
      organizations: orgs
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

agentRoutes.get('/brands', async (c) => {
  try {
    const context = getTenantContext(c);
    const brands = await multiTenantDb.getUserAccessibleBrands(c.env.DB, context.userId, context.orgId);
    
    return c.json({
      success: true,
      brands
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

// ============================================
// BRAND SAFETY DOCUMENT ENDPOINTS
// ============================================

agentRoutes.get('/brand-safety', async (c) => {
  try {
    const context = getTenantContext(c);
    const docs = await multiTenantDb.getBrandSafetyDocuments(c.env.DB, context.brandId, context.orgId);
    
    return c.json({
      success: true,
      documents: docs
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

agentRoutes.post('/brand-safety', async (c) => {
  try {
    const context = getTenantContext(c);
    const body = await c.req.json();
    
    const id = await multiTenantDb.createBrandSafetyDocument(c.env.DB, {
      brand_id: context.brandId,
      org_id: context.orgId,
      document_type: body.documentType,
      title: body.title,
      content: body.content,
      created_by: context.userId
    });
    
    return c.json({
      success: true,
      documentId: id
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

// ============================================
// AGENT TASK HISTORY
// ============================================

agentRoutes.get('/tasks', async (c) => {
  try {
    const context = getTenantContext(c);
    const limit = parseInt(c.req.query('limit') || '50');
    const agentType = c.req.query('agent');
    
    let query = `
      SELECT * FROM agent_tasks 
      WHERE brand_id = ? AND org_id = ?
    `;
    const params: any[] = [context.brandId, context.orgId];
    
    if (agentType) {
      query += ' AND agent_type = ?';
      params.push(agentType);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);
    
    const result = await c.env.DB.prepare(query).bind(...params).all();
    
    return c.json({
      success: true,
      tasks: (result.results || []).map((t: any) => ({
        ...t,
        input_data: JSON.parse(t.input_data || '{}'),
        output_data: JSON.parse(t.output_data || '{}')
      }))
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

export { agentRoutes };
