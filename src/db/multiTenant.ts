// Multi-Tenant Database Layer for OWNLAY Marketing OS
// Implements scoped access with automatic org_id and brand_id injection
// Version: 4.0.0 - Enterprise-grade tenant isolation

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface TenantContext {
  userId: string;
  orgId: string;
  brandId: string;
  role: 'owner' | 'admin' | 'manager' | 'analyst' | 'viewer';
  accessibleBrands: string[];
  permissions: Record<string, boolean>;
  // Contextual memory for AI agents
  historicalWinners?: HistoricalWinner[];
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

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
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
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  user_id: string;
  org_id: string;
  role: string;
  accessible_brands: string[];
  permissions: Record<string, boolean>;
  is_default_org: number;
  created_at: string;
  updated_at: string;
}

export interface UserContext {
  id: string;
  user_id: string;
  active_org_id: string | null;
  active_brand_id: string | null;
  last_accessed_at: string;
  preferences: Record<string, any>;
}

export interface BrandSafetyDocument {
  id: string;
  brand_id: string;
  org_id: string;
  document_type: string;
  title: string;
  content: string;
  version: number;
  status: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// SCOPED ACCESS MANAGER
// Automatically injects org_id and brand_id into all queries
// ============================================

export class ScopedAccessManager {
  private context: TenantContext | null = null;
  private database: D1Database;

  constructor(database: D1Database) {
    this.database = database;
  }

  // Set the current tenant context
  setContext(context: TenantContext): void {
    this.context = context;
  }

  // Get the current context
  getContext(): TenantContext | null {
    return this.context;
  }

  // Validate that context is set
  private validateContext(): TenantContext {
    if (!this.context) {
      throw new Error('Tenant context not set. Call setContext() first.');
    }
    return this.context;
  }

  // Check if user has access to a specific brand
  hasBrandAccess(brandId: string): boolean {
    const ctx = this.validateContext();
    // Owners and admins have access to all brands in their org
    if (ctx.role === 'owner' || ctx.role === 'admin') {
      return true;
    }
    return ctx.accessibleBrands.includes(brandId);
  }

  // Check if user has a specific permission
  hasPermission(permission: string): boolean {
    const ctx = this.validateContext();
    // Owners have all permissions
    if (ctx.role === 'owner') return true;
    
    // Check role-based defaults
    const rolePermissions: Record<string, string[]> = {
      admin: ['read', 'write', 'delete', 'manage_users', 'manage_brands', 'view_analytics', 'manage_campaigns'],
      manager: ['read', 'write', 'view_analytics', 'manage_campaigns'],
      analyst: ['read', 'view_analytics'],
      viewer: ['read']
    };

    const defaults = rolePermissions[ctx.role] || [];
    if (defaults.includes(permission)) return true;

    // Check custom permissions
    return ctx.permissions[permission] === true;
  }

  // ============================================
  // SCOPED QUERY HELPERS
  // These automatically add tenant filters
  // ============================================

  // Build a scoped WHERE clause
  private buildScopedWhere(alias?: string): { clause: string; params: string[] } {
    const ctx = this.validateContext();
    const prefix = alias ? `${alias}.` : '';
    return {
      clause: `${prefix}org_id = ? AND ${prefix}brand_id = ?`,
      params: [ctx.orgId, ctx.brandId]
    };
  }

  // Execute a scoped SELECT query
  async scopedSelect<T>(
    table: string,
    options?: {
      columns?: string;
      where?: string;
      whereParams?: any[];
      orderBy?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<T[]> {
    const ctx = this.validateContext();
    const { columns = '*', where, whereParams = [], orderBy, limit, offset } = options || {};

    let query = `SELECT ${columns} FROM ${table} WHERE org_id = ? AND brand_id = ?`;
    const params: any[] = [ctx.orgId, ctx.brandId];

    if (where) {
      query += ` AND (${where})`;
      params.push(...whereParams);
    }

    if (orderBy) query += ` ORDER BY ${orderBy}`;
    if (limit) query += ` LIMIT ${limit}`;
    if (offset) query += ` OFFSET ${offset}`;

    const result = await this.database.prepare(query).bind(...params).all<T>();
    return result.results || [];
  }

  // Execute a scoped INSERT query
  async scopedInsert(
    table: string,
    data: Record<string, any>,
    options?: { id?: string }
  ): Promise<string> {
    const ctx = this.validateContext();
    const id = options?.id || `${table.substring(0, 4)}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Add tenant fields
    const fullData = {
      ...data,
      id,
      org_id: ctx.orgId,
      brand_id: ctx.brandId
    };

    const columns = Object.keys(fullData);
    const placeholders = columns.map(() => '?').join(', ');
    const values = Object.values(fullData);

    await this.database.prepare(
      `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`
    ).bind(...values).run();

    return id;
  }

  // Execute a scoped UPDATE query
  async scopedUpdate(
    table: string,
    data: Record<string, any>,
    where: string,
    whereParams: any[] = []
  ): Promise<void> {
    const ctx = this.validateContext();
    
    const setClauses = Object.keys(data).map(k => `${k} = ?`);
    setClauses.push('updated_at = CURRENT_TIMESTAMP');
    
    const values = [...Object.values(data), ctx.orgId, ctx.brandId, ...whereParams];

    await this.database.prepare(
      `UPDATE ${table} SET ${setClauses.join(', ')} WHERE org_id = ? AND brand_id = ? AND (${where})`
    ).bind(...values).run();
  }

  // Execute a scoped DELETE query
  async scopedDelete(
    table: string,
    where: string,
    whereParams: any[] = []
  ): Promise<void> {
    const ctx = this.validateContext();
    
    // Check delete permission
    if (!this.hasPermission('delete')) {
      throw new Error('Permission denied: delete');
    }

    await this.database.prepare(
      `DELETE FROM ${table} WHERE org_id = ? AND brand_id = ? AND (${where})`
    ).bind(ctx.orgId, ctx.brandId, ...whereParams).run();
  }

  // Execute a scoped COUNT query
  async scopedCount(
    table: string,
    where?: string,
    whereParams: any[] = []
  ): Promise<number> {
    const ctx = this.validateContext();
    
    let query = `SELECT COUNT(*) as count FROM ${table} WHERE org_id = ? AND brand_id = ?`;
    const params: any[] = [ctx.orgId, ctx.brandId];

    if (where) {
      query += ` AND (${where})`;
      params.push(...whereParams);
    }

    const result = await this.database.prepare(query).bind(...params).first<{ count: number }>();
    return result?.count || 0;
  }
}

// ============================================
// MULTI-TENANT DATABASE OPERATIONS
// ============================================

export const multiTenantDb = {
  // ============================================
  // ORGANIZATION MANAGEMENT
  // ============================================

  async createOrganization(database: D1Database, org: {
    name: string;
    slug: string;
    plan?: string;
    settings?: Record<string, any>;
  }): Promise<string> {
    const id = `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await database.prepare(`
      INSERT INTO organizations (id, name, slug, plan, settings)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      id,
      org.name,
      org.slug,
      org.plan || 'starter',
      JSON.stringify(org.settings || {})
    ).run();
    return id;
  },

  async getOrganization(database: D1Database, orgId: string): Promise<Organization | null> {
    const result = await database.prepare(
      'SELECT * FROM organizations WHERE id = ?'
    ).bind(orgId).first<any>();
    
    if (!result) return null;
    return {
      ...result,
      settings: JSON.parse(result.settings || '{}')
    };
  },

  async getOrganizationBySlug(database: D1Database, slug: string): Promise<Organization | null> {
    const result = await database.prepare(
      'SELECT * FROM organizations WHERE slug = ?'
    ).bind(slug).first<any>();
    
    if (!result) return null;
    return {
      ...result,
      settings: JSON.parse(result.settings || '{}')
    };
  },

  async getUserOrganizations(database: D1Database, userId: string): Promise<(Organization & { role: string })[]> {
    const result = await database.prepare(`
      SELECT o.*, p.role 
      FROM organizations o
      JOIN permissions p ON o.id = p.org_id
      WHERE p.user_id = ? AND o.status = 'active'
      ORDER BY p.is_default_org DESC, o.name ASC
    `).bind(userId).all<any>();

    return (result.results || []).map(r => ({
      ...r,
      settings: JSON.parse(r.settings || '{}')
    }));
  },

  // ============================================
  // BRAND MANAGEMENT
  // ============================================

  async createBrand(database: D1Database, brand: {
    org_id: string;
    name: string;
    slug: string;
    logo_url?: string;
    industry?: string;
    website?: string;
    settings?: Record<string, any>;
  }): Promise<string> {
    const id = `brand_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await database.prepare(`
      INSERT INTO brands (id, org_id, name, slug, logo_url, industry, website, settings)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      brand.org_id,
      brand.name,
      brand.slug,
      brand.logo_url || null,
      brand.industry || null,
      brand.website || null,
      JSON.stringify(brand.settings || {})
    ).run();
    return id;
  },

  async getBrand(database: D1Database, brandId: string): Promise<Brand | null> {
    const result = await database.prepare(
      'SELECT * FROM brands WHERE id = ?'
    ).bind(brandId).first<any>();
    
    if (!result) return null;
    return {
      ...result,
      settings: JSON.parse(result.settings || '{}')
    };
  },

  async getOrganizationBrands(database: D1Database, orgId: string): Promise<Brand[]> {
    const result = await database.prepare(`
      SELECT * FROM brands WHERE org_id = ? AND status = 'active' ORDER BY name ASC
    `).bind(orgId).all<any>();

    return (result.results || []).map(r => ({
      ...r,
      settings: JSON.parse(r.settings || '{}')
    }));
  },

  async getUserAccessibleBrands(database: D1Database, userId: string, orgId: string): Promise<Brand[]> {
    // First get the user's permission for this org
    const permission = await database.prepare(`
      SELECT * FROM permissions WHERE user_id = ? AND org_id = ?
    `).bind(userId, orgId).first<any>();

    if (!permission) return [];

    const role = permission.role;
    const accessibleBrands = JSON.parse(permission.accessible_brands || '[]');

    // Owners and admins get all brands
    if (role === 'owner' || role === 'admin') {
      return multiTenantDb.getOrganizationBrands(database, orgId);
    }

    // Others get only their accessible brands
    if (accessibleBrands.length === 0) return [];

    const placeholders = accessibleBrands.map(() => '?').join(',');
    const result = await database.prepare(`
      SELECT * FROM brands 
      WHERE org_id = ? AND status = 'active' AND id IN (${placeholders})
      ORDER BY name ASC
    `).bind(orgId, ...accessibleBrands).all<any>();

    return (result.results || []).map(r => ({
      ...r,
      settings: JSON.parse(r.settings || '{}')
    }));
  },

  // ============================================
  // PERMISSION MANAGEMENT
  // ============================================

  async createPermission(database: D1Database, permission: {
    user_id: string;
    org_id: string;
    role: string;
    accessible_brands?: string[];
    permissions?: Record<string, boolean>;
    is_default_org?: boolean;
  }): Promise<string> {
    const id = `perm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await database.prepare(`
      INSERT INTO permissions (id, user_id, org_id, role, accessible_brands, permissions, is_default_org)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      permission.user_id,
      permission.org_id,
      permission.role,
      JSON.stringify(permission.accessible_brands || []),
      JSON.stringify(permission.permissions || {}),
      permission.is_default_org ? 1 : 0
    ).run();
    return id;
  },

  async getUserPermission(database: D1Database, userId: string, orgId: string): Promise<Permission | null> {
    const result = await database.prepare(`
      SELECT * FROM permissions WHERE user_id = ? AND org_id = ?
    `).bind(userId, orgId).first<any>();

    if (!result) return null;
    return {
      ...result,
      accessible_brands: JSON.parse(result.accessible_brands || '[]'),
      permissions: JSON.parse(result.permissions || '{}')
    };
  },

  async updatePermission(database: D1Database, permissionId: string, updates: {
    role?: string;
    accessible_brands?: string[];
    permissions?: Record<string, boolean>;
  }): Promise<void> {
    const fields: string[] = ['updated_at = CURRENT_TIMESTAMP'];
    const values: any[] = [];

    if (updates.role !== undefined) {
      fields.push('role = ?');
      values.push(updates.role);
    }
    if (updates.accessible_brands !== undefined) {
      fields.push('accessible_brands = ?');
      values.push(JSON.stringify(updates.accessible_brands));
    }
    if (updates.permissions !== undefined) {
      fields.push('permissions = ?');
      values.push(JSON.stringify(updates.permissions));
    }

    values.push(permissionId);

    await database.prepare(`
      UPDATE permissions SET ${fields.join(', ')} WHERE id = ?
    `).bind(...values).run();
  },

  async grantBrandAccess(database: D1Database, userId: string, orgId: string, brandId: string): Promise<void> {
    const permission = await multiTenantDb.getUserPermission(database, userId, orgId);
    if (!permission) {
      throw new Error('User has no permission for this organization');
    }

    const accessibleBrands = permission.accessible_brands;
    if (!accessibleBrands.includes(brandId)) {
      accessibleBrands.push(brandId);
      await multiTenantDb.updatePermission(database, permission.id, { accessible_brands: accessibleBrands });
    }
  },

  async revokeBrandAccess(database: D1Database, userId: string, orgId: string, brandId: string): Promise<void> {
    const permission = await multiTenantDb.getUserPermission(database, userId, orgId);
    if (!permission) return;

    const accessibleBrands = permission.accessible_brands.filter(id => id !== brandId);
    await multiTenantDb.updatePermission(database, permission.id, { accessible_brands: accessibleBrands });
  },

  // ============================================
  // USER CONTEXT MANAGEMENT (Context Switcher)
  // ============================================

  async getUserContext(database: D1Database, userId: string): Promise<UserContext | null> {
    const result = await database.prepare(`
      SELECT * FROM user_context WHERE user_id = ?
    `).bind(userId).first<any>();

    if (!result) return null;
    return {
      ...result,
      preferences: JSON.parse(result.preferences || '{}')
    };
  },

  async setUserContext(database: D1Database, userId: string, context: {
    active_org_id: string;
    active_brand_id: string;
    preferences?: Record<string, any>;
  }): Promise<void> {
    const id = `ctx_${Date.now()}`;
    await database.prepare(`
      INSERT INTO user_context (id, user_id, active_org_id, active_brand_id, preferences, last_accessed_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id) DO UPDATE SET
        active_org_id = excluded.active_org_id,
        active_brand_id = excluded.active_brand_id,
        preferences = COALESCE(excluded.preferences, user_context.preferences),
        last_accessed_at = CURRENT_TIMESTAMP
    `).bind(
      id,
      userId,
      context.active_org_id,
      context.active_brand_id,
      JSON.stringify(context.preferences || {})
    ).run();
  },

  async switchContext(database: D1Database, userId: string, orgId: string, brandId: string): Promise<{
    success: boolean;
    context: TenantContext | null;
    error?: string;
  }> {
    // Verify user has permission for this org
    const permission = await multiTenantDb.getUserPermission(database, userId, orgId);
    if (!permission) {
      return { success: false, context: null, error: 'No access to organization' };
    }

    // Verify user has access to this brand
    const role = permission.role as TenantContext['role'];
    const accessibleBrands = permission.accessible_brands;
    
    if (role !== 'owner' && role !== 'admin' && !accessibleBrands.includes(brandId)) {
      return { success: false, context: null, error: 'No access to brand' };
    }

    // Update user context
    await multiTenantDb.setUserContext(database, userId, {
      active_org_id: orgId,
      active_brand_id: brandId
    });

    const context: TenantContext = {
      userId,
      orgId,
      brandId,
      role,
      accessibleBrands,
      permissions: permission.permissions
    };

    return { success: true, context };
  },

  // Get full tenant context for a user
  async getTenantContext(database: D1Database, userId: string): Promise<TenantContext | null> {
    const userContext = await multiTenantDb.getUserContext(database, userId);
    if (!userContext || !userContext.active_org_id || !userContext.active_brand_id) {
      // Try to get default context
      const defaultPerm = await database.prepare(`
        SELECT * FROM permissions WHERE user_id = ? AND is_default_org = 1
      `).bind(userId).first<any>();

      if (!defaultPerm) return null;

      // Get first accessible brand
      const brands = await multiTenantDb.getUserAccessibleBrands(database, userId, defaultPerm.org_id);
      if (brands.length === 0) return null;

      // Set and return context
      await multiTenantDb.setUserContext(database, userId, {
        active_org_id: defaultPerm.org_id,
        active_brand_id: brands[0].id
      });

      return {
        userId,
        orgId: defaultPerm.org_id,
        brandId: brands[0].id,
        role: defaultPerm.role,
        accessibleBrands: JSON.parse(defaultPerm.accessible_brands || '[]'),
        permissions: JSON.parse(defaultPerm.permissions || '{}')
      };
    }

    const permission = await multiTenantDb.getUserPermission(database, userId, userContext.active_org_id);
    if (!permission) return null;

    return {
      userId,
      orgId: userContext.active_org_id,
      brandId: userContext.active_brand_id,
      role: permission.role as TenantContext['role'],
      accessibleBrands: permission.accessible_brands,
      permissions: permission.permissions
    };
  },

  // ============================================
  // BRAND SAFETY DOCUMENTS
  // ============================================

  async createBrandSafetyDocument(database: D1Database, doc: {
    brand_id: string;
    org_id: string;
    document_type: string;
    title: string;
    content: string;
    created_by?: string;
  }): Promise<string> {
    const id = `bsd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await database.prepare(`
      INSERT INTO brand_safety_documents (id, brand_id, org_id, document_type, title, content, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      doc.brand_id,
      doc.org_id,
      doc.document_type,
      doc.title,
      doc.content,
      doc.created_by || null
    ).run();
    return id;
  },

  async getBrandSafetyDocuments(database: D1Database, brandId: string, orgId: string): Promise<BrandSafetyDocument[]> {
    const result = await database.prepare(`
      SELECT * FROM brand_safety_documents 
      WHERE brand_id = ? AND org_id = ? AND status = 'active'
      ORDER BY document_type, version DESC
    `).bind(brandId, orgId).all<BrandSafetyDocument>();
    return result.results || [];
  },

  async getBrandSafetyDocument(database: D1Database, documentId: string): Promise<BrandSafetyDocument | null> {
    return database.prepare(
      'SELECT * FROM brand_safety_documents WHERE id = ?'
    ).bind(documentId).first<BrandSafetyDocument>();
  },

  // ============================================
  // HISTORICAL WINNERS (Contextual Memory for AI)
  // ============================================

  async getHistoricalWinners(database: D1Database, brandId: string, orgId: string, limit: number = 10): Promise<HistoricalWinner[]> {
    try {
      // Fetch top performing campaigns from the last 90 days
      const result = await database.prepare(`
        SELECT 
          hp.id,
          hp.platform,
          hp.campaign_type as campaignType,
          hp.spend,
          hp.revenue,
          hp.conversions,
          hp.roas,
          hp.cpa,
          hp.period_start as periodStart,
          hp.period_end as periodEnd,
          c.name as campaignName,
          c.objective,
          c.target_audience as targetAudience
        FROM historical_performance hp
        LEFT JOIN campaigns c ON hp.campaign_id = c.id
        WHERE hp.brand_id = ? AND hp.org_id = ?
          AND hp.roas >= 3.0
          AND hp.period_end >= datetime('now', '-90 days')
        ORDER BY hp.roas DESC, hp.conversions DESC
        LIMIT ?
      `).bind(brandId, orgId, limit).all<any>();

      return (result.results || []).map(r => ({
        id: r.id,
        platform: r.platform,
        campaignType: r.campaignType || 'general',
        headline: r.campaignName,
        description: r.objective,
        targetAudience: r.targetAudience,
        roas: r.roas,
        cpa: r.cpa,
        conversions: r.conversions,
        spend: r.spend,
        period: `${r.periodStart} to ${r.periodEnd}`,
        learnings: multiTenantDb.extractLearnings(r)
      }));
    } catch (error) {
      console.error('Error fetching historical winners:', error);
      return [];
    }
  },

  extractLearnings(data: any): string[] {
    const learnings: string[] = [];
    
    if (data.roas >= 5) {
      learnings.push(`Exceptional ROAS of ${data.roas.toFixed(1)}x - consider replicating this strategy`);
    } else if (data.roas >= 3.5) {
      learnings.push(`Strong ROAS of ${data.roas.toFixed(1)}x - proven conversion-focused approach`);
    }
    
    if (data.cpa && data.cpa < 20) {
      learnings.push(`Low CPA of $${data.cpa.toFixed(2)} - efficient acquisition strategy`);
    }
    
    if (data.conversions > 100) {
      learnings.push(`High conversion volume (${data.conversions}) - scalable campaign`);
    }
    
    if (data.platform) {
      learnings.push(`Top performer on ${data.platform}`);
    }
    
    return learnings;
  },

  // Enhanced getTenantContext with Historical Winners
  async getTenantContextWithHistory(database: D1Database, userId: string): Promise<TenantContext | null> {
    const context = await multiTenantDb.getTenantContext(database, userId);
    
    if (context) {
      // Enrich with historical winners for AI agent contextual memory
      context.historicalWinners = await multiTenantDb.getHistoricalWinners(
        database, 
        context.brandId, 
        context.orgId,
        10
      );
    }
    
    return context;
  },

  // ============================================
  // HELPER: Initialize tenant for new user
  // ============================================

  async initializeTenantForUser(database: D1Database, userId: string, options: {
    orgName: string;
    orgSlug: string;
    brandName: string;
    brandSlug: string;
    industry?: string;
  }): Promise<{ orgId: string; brandId: string; permissionId: string }> {
    // Create organization
    const orgId = await multiTenantDb.createOrganization(database, {
      name: options.orgName,
      slug: options.orgSlug
    });

    // Create brand
    const brandId = await multiTenantDb.createBrand(database, {
      org_id: orgId,
      name: options.brandName,
      slug: options.brandSlug,
      industry: options.industry
    });

    // Create permission (owner)
    const permissionId = await multiTenantDb.createPermission(database, {
      user_id: userId,
      org_id: orgId,
      role: 'owner',
      accessible_brands: [brandId],
      is_default_org: true
    });

    // Set user context
    await multiTenantDb.setUserContext(database, userId, {
      active_org_id: orgId,
      active_brand_id: brandId
    });

    return { orgId, brandId, permissionId };
  }
};

// Export types
export type { Organization, Brand, Permission, UserContext, BrandSafetyDocument };
