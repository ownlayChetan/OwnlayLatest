// OWNLAY Admin Routes
// Manages brands and agencies with full CRUD operations
// Version: 4.8.0 - Enterprise Admin Management

import { Hono } from 'hono';
import { multiTenantDb, TenantContext } from '../db/multiTenant';
import { authService } from '../services/auth';
import { createSubscriptionService } from '../services/subscription';

type Bindings = {
  DB: D1Database;
  AI?: any;
};

type Variables = {
  tenantContext?: TenantContext;
  isAdmin?: boolean;
};

const adminRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// ============================================
// ADMIN MIDDLEWARE - Verify admin access
// ============================================
adminRoutes.use('*', async (c, next) => {
  const authResult = await authService.getUserFromRequest(c);
  
  if (!authResult.authenticated || !authResult.user) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }

  const userId = authResult.user.userId;
  
  // Check if user is an admin (owner or admin role)
  const db = c.env?.DB;
  if (db) {
    const context = await multiTenantDb.getTenantContext(db, userId);
    if (context && (context.role === 'owner' || context.role === 'admin')) {
      c.set('tenantContext', context);
      c.set('isAdmin', true);
    } else {
      return c.json({ success: false, error: 'Admin access required' }, 403);
    }
  }

  await next();
});

// ============================================
// LIST ORGANIZATIONS (Agencies)
// GET /api/v1/admin/organizations
// ============================================
adminRoutes.get('/organizations', async (c) => {
  try {
    const db = c.env.DB;
    const tenantContext = c.get('tenantContext');
    const page = parseInt(c.req.query('page') || '1');
    const limit = Math.min(parseInt(c.req.query('limit') || '20'), 100);
    const offset = (page - 1) * limit;
    const search = c.req.query('search') || '';
    const status = c.req.query('status') || '';

    let whereClause = '1=1';
    const params: any[] = [];

    // For non-superadmins, only show their own organization
    if (tenantContext?.role !== 'owner') {
      whereClause += ' AND o.id = ?';
      params.push(tenantContext?.orgId);
    }

    if (search) {
      whereClause += ' AND (o.name LIKE ? OR o.slug LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (status) {
      whereClause += ' AND o.status = ?';
      params.push(status);
    }

    // Get organizations with stats
    const orgsResult = await db.prepare(`
      SELECT 
        o.*,
        COUNT(DISTINCT p.user_id) as member_count,
        COUNT(DISTINCT b.id) as brand_count
      FROM organizations o
      LEFT JOIN organization_permissions p ON o.id = p.org_id
      LEFT JOIN brands b ON o.id = b.org_id
      WHERE ${whereClause}
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(...params, limit, offset).all();

    // Get total count
    const countResult = await db.prepare(`
      SELECT COUNT(*) as total FROM organizations o WHERE ${whereClause}
    `).bind(...params).first();

    return c.json({
      success: true,
      organizations: orgsResult.results || [],
      pagination: {
        page,
        limit,
        total: (countResult?.total as number) || 0,
        pages: Math.ceil(((countResult?.total as number) || 0) / limit)
      }
    });
  } catch (error) {
    console.error('List organizations error:', error);
    return c.json({ success: false, error: 'Failed to list organizations' }, 500);
  }
});

// ============================================
// CREATE ORGANIZATION
// POST /api/v1/admin/organizations
// ============================================
adminRoutes.post('/organizations', async (c) => {
  try {
    const db = c.env.DB;
    const { name, slug, plan = 'starter', settings = {} } = await c.req.json();

    if (!name || !slug) {
      return c.json({ success: false, error: 'Name and slug are required' }, 400);
    }

    // Check if slug is unique
    const existing = await multiTenantDb.getOrganizationBySlug(db, slug);
    if (existing) {
      return c.json({ success: false, error: 'Organization slug already exists' }, 400);
    }

    const orgId = `org_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const now = new Date().toISOString();

    await db.prepare(`
      INSERT INTO organizations (id, name, slug, plan, status, settings, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'active', ?, ?, ?)
    `).bind(orgId, name, slug, plan, JSON.stringify(settings), now, now).run();

    const org = await db.prepare('SELECT * FROM organizations WHERE id = ?').bind(orgId).first();

    return c.json({
      success: true,
      organization: org,
      message: 'Organization created successfully'
    });
  } catch (error) {
    console.error('Create organization error:', error);
    return c.json({ success: false, error: 'Failed to create organization' }, 500);
  }
});

// ============================================
// GET ORGANIZATION
// GET /api/v1/admin/organizations/:orgId
// ============================================
adminRoutes.get('/organizations/:orgId', async (c) => {
  try {
    const db = c.env.DB;
    const tenantContext = c.get('tenantContext');
    const orgId = c.req.param('orgId');

    // Check access
    if (tenantContext?.role !== 'owner' && tenantContext?.orgId !== orgId) {
      return c.json({ success: false, error: 'Access denied' }, 403);
    }

    const org = await db.prepare(`
      SELECT 
        o.*,
        COUNT(DISTINCT p.user_id) as member_count,
        COUNT(DISTINCT b.id) as brand_count
      FROM organizations o
      LEFT JOIN organization_permissions p ON o.id = p.org_id
      LEFT JOIN brands b ON o.id = b.org_id
      WHERE o.id = ?
      GROUP BY o.id
    `).bind(orgId).first();

    if (!org) {
      return c.json({ success: false, error: 'Organization not found' }, 404);
    }

    // Get members
    const members = await db.prepare(`
      SELECT 
        p.*,
        u.email,
        u.first_name,
        u.last_name
      FROM organization_permissions p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.org_id = ?
      ORDER BY p.created_at DESC
    `).bind(orgId).all();

    // Get brands
    const brands = await db.prepare(`
      SELECT * FROM brands WHERE org_id = ? ORDER BY created_at DESC
    `).bind(orgId).all();

    return c.json({
      success: true,
      organization: org,
      members: members.results || [],
      brands: brands.results || []
    });
  } catch (error) {
    console.error('Get organization error:', error);
    return c.json({ success: false, error: 'Failed to get organization' }, 500);
  }
});

// ============================================
// UPDATE ORGANIZATION
// PUT /api/v1/admin/organizations/:orgId
// ============================================
adminRoutes.put('/organizations/:orgId', async (c) => {
  try {
    const db = c.env.DB;
    const tenantContext = c.get('tenantContext');
    const orgId = c.req.param('orgId');
    const { name, plan, status, settings } = await c.req.json();

    // Check access
    if (tenantContext?.role !== 'owner' && tenantContext?.orgId !== orgId) {
      return c.json({ success: false, error: 'Access denied' }, 403);
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (name) {
      updates.push('name = ?');
      params.push(name);
    }
    if (plan) {
      updates.push('plan = ?');
      params.push(plan);
    }
    if (status) {
      updates.push('status = ?');
      params.push(status);
    }
    if (settings) {
      updates.push('settings = ?');
      params.push(JSON.stringify(settings));
    }

    if (updates.length === 0) {
      return c.json({ success: false, error: 'No updates provided' }, 400);
    }

    updates.push('updated_at = ?');
    params.push(new Date().toISOString());
    params.push(orgId);

    await db.prepare(`
      UPDATE organizations SET ${updates.join(', ')} WHERE id = ?
    `).bind(...params).run();

    const org = await db.prepare('SELECT * FROM organizations WHERE id = ?').bind(orgId).first();

    return c.json({
      success: true,
      organization: org,
      message: 'Organization updated successfully'
    });
  } catch (error) {
    console.error('Update organization error:', error);
    return c.json({ success: false, error: 'Failed to update organization' }, 500);
  }
});

// ============================================
// DELETE ORGANIZATION
// DELETE /api/v1/admin/organizations/:orgId
// ============================================
adminRoutes.delete('/organizations/:orgId', async (c) => {
  try {
    const db = c.env.DB;
    const tenantContext = c.get('tenantContext');
    const orgId = c.req.param('orgId');

    // Only owners can delete organizations
    if (tenantContext?.role !== 'owner') {
      return c.json({ success: false, error: 'Only owners can delete organizations' }, 403);
    }

    // Soft delete - set status to deleted
    await db.prepare(`
      UPDATE organizations SET status = 'deleted', updated_at = ? WHERE id = ?
    `).bind(new Date().toISOString(), orgId).run();

    return c.json({
      success: true,
      message: 'Organization deleted successfully'
    });
  } catch (error) {
    console.error('Delete organization error:', error);
    return c.json({ success: false, error: 'Failed to delete organization' }, 500);
  }
});

// ============================================
// LIST BRANDS
// GET /api/v1/admin/brands
// ============================================
adminRoutes.get('/brands', async (c) => {
  try {
    const db = c.env.DB;
    const tenantContext = c.get('tenantContext');
    const page = parseInt(c.req.query('page') || '1');
    const limit = Math.min(parseInt(c.req.query('limit') || '20'), 100);
    const offset = (page - 1) * limit;
    const search = c.req.query('search') || '';
    const orgId = c.req.query('orgId') || '';
    const industry = c.req.query('industry') || '';
    const status = c.req.query('status') || '';

    let whereClause = '1=1';
    const params: any[] = [];

    // For non-owners, filter by accessible brands
    if (tenantContext?.role !== 'owner') {
      whereClause += ' AND b.id IN (?)';
      params.push(tenantContext?.accessibleBrands?.join(',') || '');
    }

    if (search) {
      whereClause += ' AND (b.name LIKE ? OR b.slug LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (orgId) {
      whereClause += ' AND b.org_id = ?';
      params.push(orgId);
    }

    if (industry) {
      whereClause += ' AND b.industry = ?';
      params.push(industry);
    }

    if (status) {
      whereClause += ' AND b.status = ?';
      params.push(status);
    }

    const brandsResult = await db.prepare(`
      SELECT 
        b.*,
        o.name as org_name,
        (SELECT COUNT(*) FROM ai_creatives c WHERE c.brand_id = b.id) as creative_count,
        (SELECT COUNT(*) FROM brand_safety_documents d WHERE d.brand_id = b.id) as doc_count
      FROM brands b
      LEFT JOIN organizations o ON b.org_id = o.id
      WHERE ${whereClause}
      ORDER BY b.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(...params, limit, offset).all();

    const countResult = await db.prepare(`
      SELECT COUNT(*) as total FROM brands b WHERE ${whereClause}
    `).bind(...params).first();

    return c.json({
      success: true,
      brands: brandsResult.results || [],
      pagination: {
        page,
        limit,
        total: (countResult?.total as number) || 0,
        pages: Math.ceil(((countResult?.total as number) || 0) / limit)
      }
    });
  } catch (error) {
    console.error('List brands error:', error);
    return c.json({ success: false, error: 'Failed to list brands' }, 500);
  }
});

// ============================================
// CREATE BRAND
// POST /api/v1/admin/brands
// ============================================
adminRoutes.post('/brands', async (c) => {
  try {
    const db = c.env.DB;
    const tenantContext = c.get('tenantContext');
    const { name, slug, orgId, industry, website, logo_url, settings = {} } = await c.req.json();

    if (!name || !slug) {
      return c.json({ success: false, error: 'Name and slug are required' }, 400);
    }

    // Use provided orgId or current user's orgId
    const targetOrgId = orgId || tenantContext?.orgId;
    if (!targetOrgId) {
      return c.json({ success: false, error: 'Organization ID is required' }, 400);
    }

    // Check org access
    if (tenantContext?.role !== 'owner' && tenantContext?.orgId !== targetOrgId) {
      return c.json({ success: false, error: 'Access denied to this organization' }, 403);
    }

    // Check if slug is unique within org
    const existing = await db.prepare(`
      SELECT id FROM brands WHERE org_id = ? AND slug = ?
    `).bind(targetOrgId, slug).first();

    if (existing) {
      return c.json({ success: false, error: 'Brand slug already exists in this organization' }, 400);
    }

    const brandId = `brand_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const now = new Date().toISOString();

    await db.prepare(`
      INSERT INTO brands (id, org_id, name, slug, industry, website, logo_url, status, settings, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)
    `).bind(brandId, targetOrgId, name, slug, industry || null, website || null, logo_url || null, JSON.stringify(settings), now, now).run();

    const brand = await db.prepare('SELECT * FROM brands WHERE id = ?').bind(brandId).first();

    return c.json({
      success: true,
      brand,
      message: 'Brand created successfully'
    });
  } catch (error) {
    console.error('Create brand error:', error);
    return c.json({ success: false, error: 'Failed to create brand' }, 500);
  }
});

// ============================================
// GET BRAND
// GET /api/v1/admin/brands/:brandId
// ============================================
adminRoutes.get('/brands/:brandId', async (c) => {
  try {
    const db = c.env.DB;
    const tenantContext = c.get('tenantContext');
    const brandId = c.req.param('brandId');

    // Check access
    if (tenantContext?.role !== 'owner' && !tenantContext?.accessibleBrands?.includes(brandId)) {
      return c.json({ success: false, error: 'Access denied' }, 403);
    }

    const brand = await db.prepare(`
      SELECT 
        b.*,
        o.name as org_name,
        (SELECT COUNT(*) FROM ai_creatives c WHERE c.brand_id = b.id) as creative_count,
        (SELECT COUNT(*) FROM brand_safety_documents d WHERE d.brand_id = b.id) as doc_count
      FROM brands b
      LEFT JOIN organizations o ON b.org_id = o.id
      WHERE b.id = ?
    `).bind(brandId).first();

    if (!brand) {
      return c.json({ success: false, error: 'Brand not found' }, 404);
    }

    // Get brand safety documents
    const docs = await db.prepare(`
      SELECT * FROM brand_safety_documents WHERE brand_id = ? ORDER BY created_at DESC
    `).bind(brandId).all();

    // Get recent creatives
    const creatives = await db.prepare(`
      SELECT * FROM ai_creatives WHERE brand_id = ? ORDER BY created_at DESC LIMIT 10
    `).bind(brandId).all();

    return c.json({
      success: true,
      brand,
      documents: docs.results || [],
      creatives: creatives.results || []
    });
  } catch (error) {
    console.error('Get brand error:', error);
    return c.json({ success: false, error: 'Failed to get brand' }, 500);
  }
});

// ============================================
// UPDATE BRAND
// PUT /api/v1/admin/brands/:brandId
// ============================================
adminRoutes.put('/brands/:brandId', async (c) => {
  try {
    const db = c.env.DB;
    const tenantContext = c.get('tenantContext');
    const brandId = c.req.param('brandId');
    const { name, industry, website, logo_url, status, settings } = await c.req.json();

    // Check access
    if (tenantContext?.role !== 'owner' && !tenantContext?.accessibleBrands?.includes(brandId)) {
      return c.json({ success: false, error: 'Access denied' }, 403);
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (name) {
      updates.push('name = ?');
      params.push(name);
    }
    if (industry !== undefined) {
      updates.push('industry = ?');
      params.push(industry);
    }
    if (website !== undefined) {
      updates.push('website = ?');
      params.push(website);
    }
    if (logo_url !== undefined) {
      updates.push('logo_url = ?');
      params.push(logo_url);
    }
    if (status) {
      updates.push('status = ?');
      params.push(status);
    }
    if (settings) {
      updates.push('settings = ?');
      params.push(JSON.stringify(settings));
    }

    if (updates.length === 0) {
      return c.json({ success: false, error: 'No updates provided' }, 400);
    }

    updates.push('updated_at = ?');
    params.push(new Date().toISOString());
    params.push(brandId);

    await db.prepare(`
      UPDATE brands SET ${updates.join(', ')} WHERE id = ?
    `).bind(...params).run();

    const brand = await db.prepare('SELECT * FROM brands WHERE id = ?').bind(brandId).first();

    return c.json({
      success: true,
      brand,
      message: 'Brand updated successfully'
    });
  } catch (error) {
    console.error('Update brand error:', error);
    return c.json({ success: false, error: 'Failed to update brand' }, 500);
  }
});

// ============================================
// DELETE BRAND
// DELETE /api/v1/admin/brands/:brandId
// ============================================
adminRoutes.delete('/brands/:brandId', async (c) => {
  try {
    const db = c.env.DB;
    const tenantContext = c.get('tenantContext');
    const brandId = c.req.param('brandId');

    // Only admins can delete brands
    if (tenantContext?.role !== 'owner' && tenantContext?.role !== 'admin') {
      return c.json({ success: false, error: 'Admin access required' }, 403);
    }

    // Check access
    if (tenantContext?.role !== 'owner' && !tenantContext?.accessibleBrands?.includes(brandId)) {
      return c.json({ success: false, error: 'Access denied' }, 403);
    }

    // Soft delete
    await db.prepare(`
      UPDATE brands SET status = 'deleted', updated_at = ? WHERE id = ?
    `).bind(new Date().toISOString(), brandId).run();

    return c.json({
      success: true,
      message: 'Brand deleted successfully'
    });
  } catch (error) {
    console.error('Delete brand error:', error);
    return c.json({ success: false, error: 'Failed to delete brand' }, 500);
  }
});

// ============================================
// MANAGE TEAM MEMBERS
// POST /api/v1/admin/organizations/:orgId/members
// ============================================
adminRoutes.post('/organizations/:orgId/members', async (c) => {
  try {
    const db = c.env.DB;
    const tenantContext = c.get('tenantContext');
    const orgId = c.req.param('orgId');
    const { userId, email, role = 'analyst', accessibleBrands = [] } = await c.req.json();

    // Check access
    if (tenantContext?.role !== 'owner' && tenantContext?.orgId !== orgId) {
      return c.json({ success: false, error: 'Access denied' }, 403);
    }

    // Find or create user
    let targetUserId = userId;
    if (!targetUserId && email) {
      const user = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
      if (!user) {
        return c.json({ success: false, error: 'User not found. They must sign up first.' }, 404);
      }
      targetUserId = user.id;
    }

    if (!targetUserId) {
      return c.json({ success: false, error: 'userId or email is required' }, 400);
    }

    // Check if already a member
    const existing = await db.prepare(`
      SELECT id FROM organization_permissions WHERE org_id = ? AND user_id = ?
    `).bind(orgId, targetUserId).first();

    if (existing) {
      // Update existing permission
      await db.prepare(`
        UPDATE organization_permissions 
        SET role = ?, accessible_brands = ?, updated_at = ?
        WHERE org_id = ? AND user_id = ?
      `).bind(role, JSON.stringify(accessibleBrands), new Date().toISOString(), orgId, targetUserId).run();

      return c.json({
        success: true,
        message: 'Member updated successfully'
      });
    }

    // Create new permission
    const permId = `perm_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const now = new Date().toISOString();

    await db.prepare(`
      INSERT INTO organization_permissions (id, user_id, org_id, role, accessible_brands, permissions, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, '{}', ?, ?)
    `).bind(permId, targetUserId, orgId, role, JSON.stringify(accessibleBrands), now, now).run();

    return c.json({
      success: true,
      message: 'Member added successfully'
    });
  } catch (error) {
    console.error('Add member error:', error);
    return c.json({ success: false, error: 'Failed to add member' }, 500);
  }
});

// ============================================
// REMOVE TEAM MEMBER
// DELETE /api/v1/admin/organizations/:orgId/members/:userId
// ============================================
adminRoutes.delete('/organizations/:orgId/members/:userId', async (c) => {
  try {
    const db = c.env.DB;
    const tenantContext = c.get('tenantContext');
    const orgId = c.req.param('orgId');
    const userId = c.req.param('userId');

    // Check access - only owners and admins can remove members
    if (tenantContext?.role !== 'owner' && tenantContext?.role !== 'admin') {
      return c.json({ success: false, error: 'Admin access required' }, 403);
    }

    if (tenantContext?.role !== 'owner' && tenantContext?.orgId !== orgId) {
      return c.json({ success: false, error: 'Access denied' }, 403);
    }

    // Can't remove yourself if you're the owner
    if (tenantContext?.userId === userId && tenantContext?.role === 'owner') {
      return c.json({ success: false, error: 'Cannot remove yourself as owner' }, 400);
    }

    await db.prepare(`
      DELETE FROM organization_permissions WHERE org_id = ? AND user_id = ?
    `).bind(orgId, userId).run();

    return c.json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    console.error('Remove member error:', error);
    return c.json({ success: false, error: 'Failed to remove member' }, 500);
  }
});

// ============================================
// GET ADMIN DASHBOARD STATS
// GET /api/v1/admin/stats
// ============================================
adminRoutes.get('/stats', async (c) => {
  try {
    const db = c.env.DB;
    const tenantContext = c.get('tenantContext');

    let orgFilter = '';
    const params: any[] = [];

    if (tenantContext?.role !== 'owner') {
      orgFilter = 'WHERE org_id = ?';
      params.push(tenantContext?.orgId);
    }

    // Get stats
    const orgCount = await db.prepare(`
      SELECT COUNT(*) as total FROM organizations ${orgFilter.replace('org_id', 'id')}
    `).bind(...params).first();

    const brandCount = await db.prepare(`
      SELECT COUNT(*) as total FROM brands ${orgFilter}
    `).bind(...params).first();

    const memberCount = await db.prepare(`
      SELECT COUNT(DISTINCT user_id) as total FROM organization_permissions ${orgFilter}
    `).bind(...params).first();

    const creativeCount = await db.prepare(`
      SELECT COUNT(*) as total FROM ai_creatives ${orgFilter ? 'WHERE brand_id IN (SELECT id FROM brands ' + orgFilter + ')' : ''}
    `).bind(...params).first();

    // Recent activity
    const recentActivity = await db.prepare(`
      SELECT 
        'creative' as type,
        id,
        headline as title,
        created_at
      FROM ai_creatives
      ${orgFilter ? 'WHERE brand_id IN (SELECT id FROM brands ' + orgFilter + ')' : ''}
      ORDER BY created_at DESC
      LIMIT 10
    `).bind(...params).all();

    return c.json({
      success: true,
      stats: {
        organizations: (orgCount?.total as number) || 0,
        brands: (brandCount?.total as number) || 0,
        members: (memberCount?.total as number) || 0,
        creatives: (creativeCount?.total as number) || 0
      },
      recentActivity: recentActivity.results || []
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    return c.json({ success: false, error: 'Failed to get stats' }, 500);
  }
});

export { adminRoutes };
