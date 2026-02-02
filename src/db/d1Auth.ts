/**
 * OWNLAY Marketing OS - D1 Authentication Database Layer
 * Version: 7.0.0 - D1 for Registration/Authentication ONLY
 * 
 * ARCHITECTURE DECISION:
 * - D1 (SQLite) handles ONLY: Users, Sessions, OAuth, Password Reset
 * - PostgreSQL handles ALL other business data
 * 
 * This separation ensures:
 * 1. Fast, edge-cached authentication checks
 * 2. Simplified user data management
 * 3. GDPR compliance (auth data isolated)
 * 4. Scalable business data in PostgreSQL
 */

// ============================================
// TYPE DEFINITIONS - Authentication Entities
// ============================================

export interface User {
  id: string;
  email: string;
  password_hash?: string; // Null for OAuth users
  name: string;
  avatar_url?: string;
  account_type: 'brand' | 'agency' | 'admin';
  role: 'owner' | 'admin' | 'manager' | 'analyst' | 'viewer';
  plan: 'none' | 'starter' | 'growth' | 'pro' | 'enterprise';
  status: 'active' | 'suspended' | 'pending_verification';
  email_verified: boolean;
  oauth_provider?: 'google' | 'microsoft' | 'github';
  oauth_id?: string;
  company_name?: string;
  company_website?: string;
  workspace_id?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

export interface Session {
  id: string;
  user_id: string;
  token: string;
  refresh_token?: string;
  expires_at: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface PasswordReset {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}

export interface OAuthState {
  id: string;
  state: string;
  provider: string;
  redirect_url?: string;
  expires_at: string;
  created_at: string;
}

// ============================================
// D1 Authentication Database Operations
// ============================================

export const d1Auth = {
  // ============================================
  // USERS
  // ============================================
  
  users: {
    /**
     * Get user by ID
     */
    async getById(db: D1Database, id: string): Promise<User | null> {
      const result = await db.prepare(
        `SELECT * FROM users WHERE id = ?`
      ).bind(id).first<User>();
      
      if (result?.metadata) {
        result.metadata = typeof result.metadata === 'string' 
          ? JSON.parse(result.metadata) 
          : result.metadata;
      }
      
      return result || null;
    },

    /**
     * Get user by email
     */
    async getByEmail(db: D1Database, email: string): Promise<User | null> {
      const result = await db.prepare(
        `SELECT * FROM users WHERE email = ? COLLATE NOCASE`
      ).bind(email.toLowerCase()).first<User>();
      
      if (result?.metadata) {
        result.metadata = typeof result.metadata === 'string' 
          ? JSON.parse(result.metadata) 
          : result.metadata;
      }
      
      return result || null;
    },

    /**
     * Get user by OAuth provider and ID
     */
    async getByOAuth(db: D1Database, provider: string, oauthId: string): Promise<User | null> {
      const result = await db.prepare(
        `SELECT * FROM users WHERE oauth_provider = ? AND oauth_id = ?`
      ).bind(provider, oauthId).first<User>();
      
      if (result?.metadata) {
        result.metadata = typeof result.metadata === 'string' 
          ? JSON.parse(result.metadata) 
          : result.metadata;
      }
      
      return result || null;
    },

    /**
     * Create a new user (Registration)
     */
    async create(db: D1Database, data: {
      email: string;
      password_hash?: string;
      name: string;
      account_type: 'brand' | 'agency' | 'admin';
      role?: string;
      plan?: string;
      oauth_provider?: string;
      oauth_id?: string;
      company_name?: string;
      company_website?: string;
      avatar_url?: string;
    }): Promise<User> {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      const workspaceId = `ws_${crypto.randomUUID().split('-')[0]}`;
      
      // Determine default plan based on account type
      const defaultPlan = data.account_type === 'agency' ? 'pro' : 'none';
      const plan = data.plan || defaultPlan;
      
      await db.prepare(`
        INSERT INTO users (
          id, email, password_hash, name, avatar_url, account_type, role, plan, 
          status, email_verified, oauth_provider, oauth_id, company_name, 
          company_website, workspace_id, metadata, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id,
        data.email.toLowerCase(),
        data.password_hash || null,
        data.name,
        data.avatar_url || null,
        data.account_type,
        data.role || 'owner',
        plan,
        data.oauth_provider ? 'active' : 'pending_verification',
        data.oauth_provider ? 1 : 0, // OAuth users are auto-verified
        data.oauth_provider || null,
        data.oauth_id || null,
        data.company_name || null,
        data.company_website || null,
        workspaceId,
        JSON.stringify({}),
        now,
        now
      ).run();

      return {
        id,
        email: data.email.toLowerCase(),
        name: data.name,
        avatar_url: data.avatar_url,
        account_type: data.account_type,
        role: (data.role || 'owner') as User['role'],
        plan: plan as User['plan'],
        status: data.oauth_provider ? 'active' : 'pending_verification',
        email_verified: !!data.oauth_provider,
        oauth_provider: data.oauth_provider as User['oauth_provider'],
        oauth_id: data.oauth_id,
        company_name: data.company_name,
        company_website: data.company_website,
        workspace_id: workspaceId,
        metadata: {},
        created_at: now,
        updated_at: now
      };
    },

    /**
     * Update user
     */
    async update(db: D1Database, id: string, data: Partial<User>): Promise<User | null> {
      const updates: string[] = [];
      const values: unknown[] = [];
      
      const allowedFields = [
        'name', 'avatar_url', 'plan', 'status', 'email_verified',
        'company_name', 'company_website', 'metadata', 'last_login_at'
      ];
      
      for (const field of allowedFields) {
        if (data[field as keyof User] !== undefined) {
          updates.push(`${field} = ?`);
          const value = data[field as keyof User];
          values.push(typeof value === 'object' ? JSON.stringify(value) : value);
        }
      }
      
      if (updates.length === 0) return this.getById(db, id);
      
      updates.push('updated_at = ?');
      values.push(new Date().toISOString());
      values.push(id);
      
      await db.prepare(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`
      ).bind(...values).run();
      
      return this.getById(db, id);
    },

    /**
     * Update password
     */
    async updatePassword(db: D1Database, id: string, passwordHash: string): Promise<boolean> {
      const result = await db.prepare(
        `UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?`
      ).bind(passwordHash, new Date().toISOString(), id).run();
      
      return result.success;
    },

    /**
     * Verify email
     */
    async verifyEmail(db: D1Database, id: string): Promise<boolean> {
      const result = await db.prepare(
        `UPDATE users SET email_verified = 1, status = 'active', updated_at = ? WHERE id = ?`
      ).bind(new Date().toISOString(), id).run();
      
      return result.success;
    },

    /**
     * Update last login
     */
    async updateLastLogin(db: D1Database, id: string): Promise<void> {
      await db.prepare(
        `UPDATE users SET last_login_at = ?, updated_at = ? WHERE id = ?`
      ).bind(new Date().toISOString(), new Date().toISOString(), id).run();
    }
  },

  // ============================================
  // SESSIONS
  // ============================================

  sessions: {
    /**
     * Create a new session
     */
    async create(db: D1Database, data: {
      user_id: string;
      ip_address?: string;
      user_agent?: string;
      expires_in_hours?: number;
    }): Promise<Session> {
      const id = crypto.randomUUID();
      const token = `ownlay_${crypto.randomUUID()}`;
      const refreshToken = `refresh_${crypto.randomUUID()}`;
      const now = new Date();
      const expiresAt = new Date(now.getTime() + (data.expires_in_hours || 24) * 60 * 60 * 1000);
      
      await db.prepare(`
        INSERT INTO sessions (id, user_id, token, refresh_token, expires_at, ip_address, user_agent, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id,
        data.user_id,
        token,
        refreshToken,
        expiresAt.toISOString(),
        data.ip_address || null,
        data.user_agent || null,
        now.toISOString()
      ).run();

      return {
        id,
        user_id: data.user_id,
        token,
        refresh_token: refreshToken,
        expires_at: expiresAt.toISOString(),
        ip_address: data.ip_address,
        user_agent: data.user_agent,
        created_at: now.toISOString()
      };
    },

    /**
     * Validate session token
     */
    async validateToken(db: D1Database, token: string): Promise<{ session: Session; user: User } | null> {
      const session = await db.prepare(
        `SELECT * FROM sessions WHERE token = ? AND expires_at > datetime('now')`
      ).bind(token).first<Session>();
      
      if (!session) return null;
      
      const user = await d1Auth.users.getById(db, session.user_id);
      if (!user || user.status !== 'active') return null;
      
      return { session, user };
    },

    /**
     * Refresh session
     */
    async refresh(db: D1Database, refreshToken: string): Promise<Session | null> {
      const session = await db.prepare(
        `SELECT * FROM sessions WHERE refresh_token = ?`
      ).bind(refreshToken).first<Session>();
      
      if (!session) return null;
      
      // Delete old session
      await this.delete(db, session.id);
      
      // Create new session
      return this.create(db, {
        user_id: session.user_id,
        ip_address: session.ip_address,
        user_agent: session.user_agent
      });
    },

    /**
     * Delete session (logout)
     */
    async delete(db: D1Database, sessionId: string): Promise<boolean> {
      const result = await db.prepare(
        `DELETE FROM sessions WHERE id = ?`
      ).bind(sessionId).run();
      
      return result.success;
    },

    /**
     * Delete all sessions for user
     */
    async deleteAllForUser(db: D1Database, userId: string): Promise<boolean> {
      const result = await db.prepare(
        `DELETE FROM sessions WHERE user_id = ?`
      ).bind(userId).run();
      
      return result.success;
    },

    /**
     * Clean expired sessions
     */
    async cleanExpired(db: D1Database): Promise<number> {
      const result = await db.prepare(
        `DELETE FROM sessions WHERE expires_at < datetime('now')`
      ).run();
      
      return result.meta.changes || 0;
    }
  },

  // ============================================
  // PASSWORD RESET
  // ============================================

  passwordReset: {
    /**
     * Create password reset token
     */
    async create(db: D1Database, userId: string): Promise<PasswordReset> {
      const id = crypto.randomUUID();
      const token = crypto.randomUUID();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour
      
      // Invalidate any existing reset tokens for this user
      await db.prepare(
        `UPDATE password_resets SET used = 1 WHERE user_id = ? AND used = 0`
      ).bind(userId).run();
      
      await db.prepare(`
        INSERT INTO password_resets (id, user_id, token, expires_at, used, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(id, userId, token, expiresAt.toISOString(), 0, now.toISOString()).run();

      return {
        id,
        user_id: userId,
        token,
        expires_at: expiresAt.toISOString(),
        used: false,
        created_at: now.toISOString()
      };
    },

    /**
     * Validate reset token
     */
    async validate(db: D1Database, token: string): Promise<PasswordReset | null> {
      const result = await db.prepare(
        `SELECT * FROM password_resets 
         WHERE token = ? AND used = 0 AND expires_at > datetime('now')`
      ).bind(token).first<PasswordReset>();
      
      return result || null;
    },

    /**
     * Mark token as used
     */
    async markUsed(db: D1Database, id: string): Promise<boolean> {
      const result = await db.prepare(
        `UPDATE password_resets SET used = 1 WHERE id = ?`
      ).bind(id).run();
      
      return result.success;
    }
  },

  // ============================================
  // OAUTH STATE
  // ============================================

  oauthState: {
    /**
     * Create OAuth state for CSRF protection
     */
    async create(db: D1Database, provider: string, redirectUrl?: string): Promise<OAuthState> {
      const id = crypto.randomUUID();
      const state = crypto.randomUUID();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes
      
      await db.prepare(`
        INSERT INTO oauth_states (id, state, provider, redirect_url, expires_at, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(id, state, provider, redirectUrl || null, expiresAt.toISOString(), now.toISOString()).run();

      return {
        id,
        state,
        provider,
        redirect_url: redirectUrl,
        expires_at: expiresAt.toISOString(),
        created_at: now.toISOString()
      };
    },

    /**
     * Validate and consume OAuth state
     */
    async validate(db: D1Database, state: string): Promise<OAuthState | null> {
      const result = await db.prepare(
        `SELECT * FROM oauth_states WHERE state = ? AND expires_at > datetime('now')`
      ).bind(state).first<OAuthState>();
      
      if (result) {
        // Delete the state after validation (one-time use)
        await db.prepare(`DELETE FROM oauth_states WHERE id = ?`).bind(result.id).run();
      }
      
      return result || null;
    },

    /**
     * Clean expired states
     */
    async cleanExpired(db: D1Database): Promise<number> {
      const result = await db.prepare(
        `DELETE FROM oauth_states WHERE expires_at < datetime('now')`
      ).run();
      
      return result.meta.changes || 0;
    }
  }
};

// ============================================
// Utility Functions
// ============================================

/**
 * Hash password using Web Crypto API (Cloudflare Workers compatible)
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

/**
 * Generate secure random token
 */
export function generateToken(prefix: string = ''): string {
  return `${prefix}${crypto.randomUUID()}`;
}

// Export types
export type { User, Session, PasswordReset, OAuthState };
