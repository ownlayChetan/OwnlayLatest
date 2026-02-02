// Database utility functions for Cloudflare D1

export type Env = {
  DB: D1Database;
}

// User type for brand accounts
export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  role: string;
  account_type: string;
  plan: string;
  avatar: string | null;
  email_verified: number;
  created_at: string;
  updated_at: string;
}

// Influencer type
export interface Influencer {
  id: string;
  email: string;
  password_hash: string;
  username: string;
  first_name: string;
  last_name: string;
  bio: string | null;
  avatar: string | null;
  category: string | null;
  location: string | null;
  website: string | null;
  tier: string;
  verified: number;
  status: string;
  total_followers: number;
  avg_engagement: number;
  total_earnings: number;
  created_at: string;
  updated_at: string;
}

// Platform type
export interface InfluencerPlatform {
  id: string;
  influencer_id: string;
  platform: string;
  username: string;
  profile_url: string | null;
  followers: number;
  engagement_rate: number;
  access_token: string | null;
  refresh_token: string | null;
  token_expires_at: string | null;
  connected: number;
  connected_at: string;
  updated_at: string;
}

// Conversation type
export interface Conversation {
  id: string;
  brand_id: string;
  influencer_id: string;
  campaign_name: string | null;
  campaign_budget: string | null;
  status: string;
  unread_count: number;
  last_message_at: string;
  created_at: string;
  updated_at: string;
}

// Message type
export interface Message {
  id: string;
  conversation_id: string;
  sender_type: string;
  sender_id: string;
  content: string;
  read: number;
  created_at: string;
}

// Opportunity type
export interface Opportunity {
  id: string;
  brand_id: string;
  title: string;
  description: string | null;
  category: string | null;
  platform: string | null;
  budget_min: number | null;
  budget_max: number | null;
  requirements: string | null;
  deadline: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

// Campaign type
export interface Campaign {
  id: string;
  brand_id: string;
  influencer_id: string | null;
  opportunity_id: string | null;
  name: string;
  description: string | null;
  budget: number | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  deliverables: string | null;
  created_at: string;
  updated_at: string;
}

// Earnings type
export interface InfluencerEarning {
  id: string;
  influencer_id: string;
  campaign_id: string | null;
  amount: number;
  type: string;
  status: string;
  description: string | null;
  created_at: string;
  paid_at: string | null;
}

// Database query helpers
export const db = {
  // User queries
  async getUserByEmail(database: D1Database, email: string): Promise<User | null> {
    const result = await database.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(email).first<User>();
    return result;
  },

  async getUserById(database: D1Database, id: string): Promise<User | null> {
    const result = await database.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(id).first<User>();
    return result;
  },

  async createUser(database: D1Database, user: Partial<User>): Promise<User | null> {
    const id = user.id || `usr_${Date.now()}`;
    await database.prepare(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, company, role, account_type, plan)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      user.email,
      user.password_hash,
      user.first_name || null,
      user.last_name || null,
      user.company || null,
      user.role || 'user',
      user.account_type || 'brand',
      user.plan || 'starter'
    ).run();
    return db.getUserById(database, id);
  },

  // Influencer queries
  async getInfluencerByEmail(database: D1Database, email: string): Promise<Influencer | null> {
    const result = await database.prepare(
      'SELECT * FROM influencers WHERE email = ?'
    ).bind(email).first<Influencer>();
    return result;
  },

  async getInfluencerByUsername(database: D1Database, username: string): Promise<Influencer | null> {
    const result = await database.prepare(
      'SELECT * FROM influencers WHERE username = ?'
    ).bind(username).first<Influencer>();
    return result;
  },

  async getInfluencerById(database: D1Database, id: string): Promise<Influencer | null> {
    const result = await database.prepare(
      'SELECT * FROM influencers WHERE id = ?'
    ).bind(id).first<Influencer>();
    return result;
  },

  async createInfluencer(database: D1Database, influencer: Partial<Influencer>): Promise<Influencer | null> {
    const id = influencer.id || `inf_${Date.now()}`;
    await database.prepare(`
      INSERT INTO influencers (id, email, password_hash, username, first_name, last_name, bio, category, location)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      influencer.email,
      influencer.password_hash,
      influencer.username,
      influencer.first_name,
      influencer.last_name,
      influencer.bio || null,
      influencer.category || null,
      influencer.location || null
    ).run();
    return db.getInfluencerById(database, id);
  },

  async getAllInfluencers(database: D1Database): Promise<Influencer[]> {
    const result = await database.prepare(
      'SELECT * FROM influencers WHERE status = ? ORDER BY total_followers DESC'
    ).bind('active').all<Influencer>();
    return result.results || [];
  },

  // Platform queries
  async getInfluencerPlatforms(database: D1Database, influencerId: string): Promise<InfluencerPlatform[]> {
    const result = await database.prepare(
      'SELECT * FROM influencer_platforms WHERE influencer_id = ? AND connected = 1'
    ).bind(influencerId).all<InfluencerPlatform>();
    return result.results || [];
  },

  async connectPlatform(database: D1Database, platform: Partial<InfluencerPlatform>): Promise<void> {
    const id = platform.id || `plat_${Date.now()}`;
    await database.prepare(`
      INSERT INTO influencer_platforms (id, influencer_id, platform, username, profile_url, followers, engagement_rate, access_token)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(influencer_id, platform) DO UPDATE SET
        username = excluded.username,
        profile_url = excluded.profile_url,
        followers = excluded.followers,
        engagement_rate = excluded.engagement_rate,
        access_token = excluded.access_token,
        connected = 1,
        updated_at = CURRENT_TIMESTAMP
    `).bind(
      id,
      platform.influencer_id,
      platform.platform,
      platform.username,
      platform.profile_url || null,
      platform.followers || 0,
      platform.engagement_rate || 0,
      platform.access_token || null
    ).run();
  },

  async disconnectPlatform(database: D1Database, influencerId: string, platform: string): Promise<void> {
    await database.prepare(
      'UPDATE influencer_platforms SET connected = 0, updated_at = CURRENT_TIMESTAMP WHERE influencer_id = ? AND platform = ?'
    ).bind(influencerId, platform).run();
  },

  // Conversation queries
  async getConversationsByInfluencer(database: D1Database, influencerId: string): Promise<any[]> {
    const result = await database.prepare(`
      SELECT c.*, u.first_name || ' ' || u.last_name as brand_name, u.company, u.avatar as brand_avatar
      FROM conversations c
      JOIN users u ON c.brand_id = u.id
      WHERE c.influencer_id = ?
      ORDER BY c.last_message_at DESC
    `).bind(influencerId).all();
    return result.results || [];
  },

  async getConversationsByBrand(database: D1Database, brandId: string): Promise<any[]> {
    const result = await database.prepare(`
      SELECT c.*, i.first_name || ' ' || i.last_name as influencer_name, i.username, i.avatar as influencer_avatar
      FROM conversations c
      JOIN influencers i ON c.influencer_id = i.id
      WHERE c.brand_id = ?
      ORDER BY c.last_message_at DESC
    `).bind(brandId).all();
    return result.results || [];
  },

  async getConversationById(database: D1Database, conversationId: string): Promise<any | null> {
    const result = await database.prepare(`
      SELECT c.*, 
        u.first_name || ' ' || u.last_name as brand_name, u.company, u.avatar as brand_avatar,
        i.first_name || ' ' || i.last_name as influencer_name, i.username, i.avatar as influencer_avatar
      FROM conversations c
      JOIN users u ON c.brand_id = u.id
      JOIN influencers i ON c.influencer_id = i.id
      WHERE c.id = ?
    `).bind(conversationId).first();
    return result;
  },

  async createConversation(database: D1Database, conv: Partial<Conversation>): Promise<string> {
    const id = conv.id || `conv_${Date.now()}`;
    await database.prepare(`
      INSERT INTO conversations (id, brand_id, influencer_id, campaign_name, campaign_budget, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      conv.brand_id,
      conv.influencer_id,
      conv.campaign_name || null,
      conv.campaign_budget || null,
      conv.status || 'active'
    ).run();
    return id;
  },

  async findConversation(database: D1Database, brandId: string, influencerId: string): Promise<Conversation | null> {
    const result = await database.prepare(
      'SELECT * FROM conversations WHERE brand_id = ? AND influencer_id = ?'
    ).bind(brandId, influencerId).first<Conversation>();
    return result;
  },

  // Message queries
  async getMessagesByConversation(database: D1Database, conversationId: string): Promise<Message[]> {
    const result = await database.prepare(
      'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC'
    ).bind(conversationId).all<Message>();
    return result.results || [];
  },

  async createMessage(database: D1Database, msg: Partial<Message>): Promise<string> {
    const id = msg.id || `msg_${Date.now()}`;
    await database.prepare(`
      INSERT INTO messages (id, conversation_id, sender_type, sender_id, content)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      id,
      msg.conversation_id,
      msg.sender_type,
      msg.sender_id,
      msg.content
    ).run();
    
    // Update conversation's last message time
    await database.prepare(`
      UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(msg.conversation_id).run();
    
    return id;
  },

  async markMessagesAsRead(database: D1Database, conversationId: string, senderType: string): Promise<void> {
    // Mark messages as read where sender is not the current user type
    await database.prepare(
      'UPDATE messages SET read = 1 WHERE conversation_id = ? AND sender_type != ?'
    ).bind(conversationId, senderType).run();
    
    // Reset unread count
    await database.prepare(
      'UPDATE conversations SET unread_count = 0 WHERE id = ?'
    ).bind(conversationId).run();
  },

  async incrementUnreadCount(database: D1Database, conversationId: string): Promise<void> {
    await database.prepare(
      'UPDATE conversations SET unread_count = unread_count + 1 WHERE id = ?'
    ).bind(conversationId).run();
  },

  // Opportunity queries
  async getOpportunities(database: D1Database, filters?: { category?: string; platform?: string }): Promise<any[]> {
    let query = `
      SELECT o.*, u.first_name || ' ' || u.last_name as brand_name, u.company, u.avatar as brand_avatar
      FROM opportunities o
      JOIN users u ON o.brand_id = u.id
      WHERE o.status = 'open'
    `;
    const params: string[] = [];
    
    if (filters?.category) {
      query += ' AND o.category = ?';
      params.push(filters.category);
    }
    if (filters?.platform) {
      query += ' AND o.platform = ?';
      params.push(filters.platform);
    }
    
    query += ' ORDER BY o.created_at DESC';
    
    const result = await database.prepare(query).bind(...params).all();
    return result.results || [];
  },

  // Campaign queries
  async getCampaignsByInfluencer(database: D1Database, influencerId: string): Promise<Campaign[]> {
    const result = await database.prepare(`
      SELECT c.*, u.first_name || ' ' || u.last_name as brand_name, u.company
      FROM campaigns c
      JOIN users u ON c.brand_id = u.id
      WHERE c.influencer_id = ?
      ORDER BY c.created_at DESC
    `).bind(influencerId).all<Campaign>();
    return result.results || [];
  },

  // Earnings queries
  async getEarningsByInfluencer(database: D1Database, influencerId: string): Promise<InfluencerEarning[]> {
    const result = await database.prepare(
      'SELECT * FROM influencer_earnings WHERE influencer_id = ? ORDER BY created_at DESC'
    ).bind(influencerId).all<InfluencerEarning>();
    return result.results || [];
  },

  async getTotalEarnings(database: D1Database, influencerId: string): Promise<{ total: number; pending: number; completed: number }> {
    const result = await database.prepare(`
      SELECT 
        COALESCE(SUM(amount), 0) as total,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as completed
      FROM influencer_earnings 
      WHERE influencer_id = ?
    `).bind(influencerId).first<{ total: number; pending: number; completed: number }>();
    return result || { total: 0, pending: 0, completed: 0 };
  },

  // Update influencer stats
  async updateInfluencerStats(database: D1Database, influencerId: string): Promise<void> {
    // Calculate total followers from connected platforms
    const platformStats = await database.prepare(`
      SELECT SUM(followers) as total_followers, AVG(engagement_rate) as avg_engagement
      FROM influencer_platforms
      WHERE influencer_id = ? AND connected = 1
    `).bind(influencerId).first<{ total_followers: number; avg_engagement: number }>();
    
    if (platformStats) {
      await database.prepare(`
        UPDATE influencers 
        SET total_followers = ?, avg_engagement = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(
        platformStats.total_followers || 0,
        platformStats.avg_engagement || 0,
        influencerId
      ).run();
    }
  },

  // Update influencer profile
  async updateInfluencerProfile(database: D1Database, influencerId: string, updates: {
    bio?: string;
    location?: string;
    website?: string;
    category?: string;
    avatar?: string;
  }): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];
    
    if (updates.bio !== undefined) { fields.push('bio = ?'); values.push(updates.bio); }
    if (updates.location !== undefined) { fields.push('location = ?'); values.push(updates.location); }
    if (updates.website !== undefined) { fields.push('website = ?'); values.push(updates.website); }
    if (updates.category !== undefined) { fields.push('category = ?'); values.push(updates.category); }
    if (updates.avatar !== undefined) { fields.push('avatar = ?'); values.push(updates.avatar); }
    
    if (fields.length > 0) {
      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(influencerId);
      await database.prepare(`
        UPDATE influencers SET ${fields.join(', ')} WHERE id = ?
      `).bind(...values).run();
    }
  },

  // Get platform by influencer and platform name
  async getPlatform(database: D1Database, influencerId: string, platform: string): Promise<InfluencerPlatform | null> {
    const result = await database.prepare(
      'SELECT * FROM influencer_platforms WHERE influencer_id = ? AND platform = ?'
    ).bind(influencerId, platform).first<InfluencerPlatform>();
    return result;
  },

  // Create opportunity
  async createOpportunity(database: D1Database, opp: {
    brand_id: string;
    title: string;
    description?: string;
    category?: string;
    platform?: string;
    budget_min?: number;
    budget_max?: number;
    requirements?: string;
    deadline?: string;
  }): Promise<string> {
    const id = `opp_${Date.now()}`;
    await database.prepare(`
      INSERT INTO opportunities (id, brand_id, title, description, category, platform, budget_min, budget_max, requirements, deadline)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      opp.brand_id,
      opp.title,
      opp.description || null,
      opp.category || null,
      opp.platform || null,
      opp.budget_min || null,
      opp.budget_max || null,
      opp.requirements || null,
      opp.deadline || null
    ).run();
    return id;
  },

  // Get all opportunities with brand info
  async getAllOpportunities(database: D1Database): Promise<any[]> {
    const result = await database.prepare(`
      SELECT o.*, 
        u.company as brand_name,
        u.avatar as brand_avatar
      FROM opportunities o
      JOIN users u ON o.brand_id = u.id
      WHERE o.status = 'open'
      ORDER BY o.created_at DESC
    `).all();
    return result.results || [];
  },

  // Create campaign
  async createCampaign(database: D1Database, campaign: {
    brand_id: string;
    influencer_id?: string;
    opportunity_id?: string;
    name: string;
    description?: string;
    budget?: number;
    status?: string;
    start_date?: string;
    end_date?: string;
    deliverables?: string;
  }): Promise<string> {
    const id = `camp_${Date.now()}`;
    await database.prepare(`
      INSERT INTO campaigns (id, brand_id, influencer_id, opportunity_id, name, description, budget, status, start_date, end_date, deliverables)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      campaign.brand_id,
      campaign.influencer_id || null,
      campaign.opportunity_id || null,
      campaign.name,
      campaign.description || null,
      campaign.budget || null,
      campaign.status || 'draft',
      campaign.start_date || null,
      campaign.end_date || null,
      campaign.deliverables || null
    ).run();
    return id;
  },

  // Get all campaigns for a brand
  async getCampaignsByBrand(database: D1Database, brandId: string): Promise<any[]> {
    const result = await database.prepare(`
      SELECT c.*, 
        i.first_name || ' ' || i.last_name as influencer_name,
        i.username as influencer_username,
        i.avatar as influencer_avatar
      FROM campaigns c
      LEFT JOIN influencers i ON c.influencer_id = i.id
      WHERE c.brand_id = ?
      ORDER BY c.created_at DESC
    `).bind(brandId).all();
    return result.results || [];
  },

  // Create earning record
  async createEarning(database: D1Database, earning: {
    influencer_id: string;
    campaign_id?: string;
    amount: number;
    type?: string;
    status?: string;
    description?: string;
  }): Promise<string> {
    const id = `earn_${Date.now()}`;
    await database.prepare(`
      INSERT INTO influencer_earnings (id, influencer_id, campaign_id, amount, type, status, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      earning.influencer_id,
      earning.campaign_id || null,
      earning.amount,
      earning.type || 'campaign',
      earning.status || 'pending',
      earning.description || null
    ).run();
    return id;
  },

  // Get earnings with campaign details
  async getEarningsWithDetails(database: D1Database, influencerId: string): Promise<any[]> {
    const result = await database.prepare(`
      SELECT e.*, 
        c.name as campaign_name,
        u.company as brand_name
      FROM influencer_earnings e
      LEFT JOIN campaigns c ON e.campaign_id = c.id
      LEFT JOIN users u ON c.brand_id = u.id
      WHERE e.influencer_id = ?
      ORDER BY e.created_at DESC
    `).bind(influencerId).all();
    return result.results || [];
  },

  // Get monthly earnings breakdown
  async getMonthlyEarnings(database: D1Database, influencerId: string): Promise<any[]> {
    const result = await database.prepare(`
      SELECT 
        strftime('%Y-%m', created_at) as month,
        SUM(amount) as amount
      FROM influencer_earnings
      WHERE influencer_id = ? AND status IN ('completed', 'processing')
      GROUP BY strftime('%Y-%m', created_at)
      ORDER BY month DESC
      LIMIT 12
    `).bind(influencerId).all();
    return result.results || [];
  },

  // ============================================
  // INVITATIONS
  // ============================================

  async createInvitation(database: D1Database, invitation: {
    brand_id: string;
    influencer_id: string;
    campaign_name: string;
    message?: string;
    budget?: number;
    platforms?: string[];
    deadline?: string;
  }): Promise<string> {
    const id = `inv_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    await database.prepare(`
      INSERT INTO invitations (id, brand_id, influencer_id, campaign_name, message, budget, platforms, deadline)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      invitation.brand_id,
      invitation.influencer_id,
      invitation.campaign_name,
      invitation.message || null,
      invitation.budget || null,
      invitation.platforms ? JSON.stringify(invitation.platforms) : null,
      invitation.deadline || null
    ).run();
    return id;
  },

  async getInvitationsByInfluencer(database: D1Database, influencerId: string): Promise<any[]> {
    const result = await database.prepare(`
      SELECT i.*, 
        u.first_name || ' ' || COALESCE(u.last_name, '') as brand_name,
        u.company,
        u.avatar as brand_avatar
      FROM invitations i
      JOIN users u ON i.brand_id = u.id
      WHERE i.influencer_id = ?
      ORDER BY i.created_at DESC
    `).bind(influencerId).all();
    return result.results || [];
  },

  async getInvitationById(database: D1Database, invitationId: string): Promise<any | null> {
    const result = await database.prepare(
      'SELECT * FROM invitations WHERE id = ?'
    ).bind(invitationId).first();
    return result;
  },

  async respondToInvitation(database: D1Database, invitationId: string, response: {
    action: 'accept' | 'decline' | 'negotiate';
    message?: string;
    counter_offer?: number;
  }): Promise<void> {
    const status = response.action === 'accept' ? 'accepted' 
      : response.action === 'decline' ? 'declined' 
      : 'negotiating';
    
    await database.prepare(`
      UPDATE invitations 
      SET status = ?, response_message = ?, counter_offer = ?, responded_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(status, response.message || null, response.counter_offer || null, invitationId).run();
  },

  // ============================================
  // NOTIFICATIONS
  // ============================================

  async createNotification(database: D1Database, notification: {
    user_id?: string;
    influencer_id?: string;
    user_type: 'brand' | 'influencer';
    type: string;
    title: string;
    message: string;
    action_url?: string;
    metadata?: any;
  }): Promise<string> {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    await database.prepare(`
      INSERT INTO notifications (id, user_id, influencer_id, user_type, type, title, message, action_url, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      notification.user_id || null,
      notification.influencer_id || null,
      notification.user_type,
      notification.type,
      notification.title,
      notification.message,
      notification.action_url || null,
      notification.metadata ? JSON.stringify(notification.metadata) : null
    ).run();
    return id;
  },

  async getNotificationsByInfluencer(database: D1Database, influencerId: string): Promise<any[]> {
    const result = await database.prepare(`
      SELECT * FROM notifications 
      WHERE influencer_id = ? AND user_type = 'influencer'
      ORDER BY created_at DESC
      LIMIT 50
    `).bind(influencerId).all();
    return result.results || [];
  },

  async getNotificationsByUser(database: D1Database, userId: string): Promise<any[]> {
    const result = await database.prepare(`
      SELECT * FROM notifications 
      WHERE user_id = ? AND user_type = 'brand'
      ORDER BY created_at DESC
      LIMIT 50
    `).bind(userId).all();
    return result.results || [];
  },

  async markNotificationsAsRead(database: D1Database, notificationIds: string[]): Promise<void> {
    if (notificationIds.length === 0) return;
    const placeholders = notificationIds.map(() => '?').join(',');
    await database.prepare(`
      UPDATE notifications SET read = 1 WHERE id IN (${placeholders})
    `).bind(...notificationIds).run();
  },

  async markAllNotificationsAsRead(database: D1Database, userId: string, userType: 'brand' | 'influencer'): Promise<void> {
    const column = userType === 'brand' ? 'user_id' : 'influencer_id';
    await database.prepare(`
      UPDATE notifications SET read = 1 WHERE ${column} = ? AND user_type = ?
    `).bind(userId, userType).run();
  },

  // ============================================
  // INFLUENCER RATES
  // ============================================

  async getInfluencerRate(database: D1Database, influencerId: string): Promise<{ rate_min: number; rate_max: number } | null> {
    const result = await database.prepare(
      'SELECT rate_min, rate_max FROM influencer_rates WHERE influencer_id = ?'
    ).bind(influencerId).first<{ rate_min: number; rate_max: number }>();
    return result;
  },

  async setInfluencerRate(database: D1Database, influencerId: string, rateMin: number, rateMax: number): Promise<void> {
    const id = `rate_${Date.now()}`;
    await database.prepare(`
      INSERT INTO influencer_rates (id, influencer_id, rate_min, rate_max)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(influencer_id) DO UPDATE SET
        rate_min = excluded.rate_min,
        rate_max = excluded.rate_max,
        updated_at = CURRENT_TIMESTAMP
    `).bind(id, influencerId, rateMin, rateMax).run();
  },

  // ============================================
  // OPPORTUNITY APPLICATIONS
  // ============================================

  async applyToOpportunity(database: D1Database, application: {
    opportunity_id: string;
    influencer_id: string;
    proposal?: string;
    proposed_rate?: number;
  }): Promise<string> {
    const id = `app_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    await database.prepare(`
      INSERT INTO opportunity_applications (id, opportunity_id, influencer_id, proposal, proposed_rate)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      id,
      application.opportunity_id,
      application.influencer_id,
      application.proposal || null,
      application.proposed_rate || null
    ).run();
    return id;
  },

  async getApplicationsByInfluencer(database: D1Database, influencerId: string): Promise<any[]> {
    const result = await database.prepare(`
      SELECT a.*, o.title as opportunity_title, o.budget_min, o.budget_max, u.company as brand_name
      FROM opportunity_applications a
      JOIN opportunities o ON a.opportunity_id = o.id
      JOIN users u ON o.brand_id = u.id
      WHERE a.influencer_id = ?
      ORDER BY a.created_at DESC
    `).bind(influencerId).all();
    return result.results || [];
  },

  async getApplicationsByOpportunity(database: D1Database, opportunityId: string): Promise<any[]> {
    const result = await database.prepare(`
      SELECT a.*, i.first_name || ' ' || i.last_name as influencer_name, i.username, i.avatar, i.total_followers
      FROM opportunity_applications a
      JOIN influencers i ON a.influencer_id = i.id
      WHERE a.opportunity_id = ?
      ORDER BY a.created_at DESC
    `).bind(opportunityId).all();
    return result.results || [];
  },

  // ============================================
  // SEARCH INFLUENCERS WITH FILTERS
  // ============================================

  async searchInfluencers(database: D1Database, filters: {
    category?: string;
    minFollowers?: number;
    minEngagement?: number;
    maxRate?: number;
    platform?: string;
    search?: string;
  }): Promise<any[]> {
    let query = `
      SELECT i.*, 
        (SELECT GROUP_CONCAT(platform || ':' || followers || ':' || engagement_rate, '|') 
         FROM influencer_platforms WHERE influencer_id = i.id AND connected = 1) as platforms_info,
        COALESCE(r.rate_min, 100) as rate_min,
        COALESCE(r.rate_max, 5000) as rate_max
      FROM influencers i
      LEFT JOIN influencer_rates r ON i.id = r.influencer_id
      WHERE i.status = 'active'
    `;
    const params: any[] = [];

    if (filters.category && filters.category !== 'all') {
      query += ' AND i.category = ?';
      params.push(filters.category);
    }
    if (filters.minFollowers) {
      query += ' AND i.total_followers >= ?';
      params.push(filters.minFollowers);
    }
    if (filters.minEngagement) {
      query += ' AND i.avg_engagement >= ?';
      params.push(filters.minEngagement);
    }
    if (filters.maxRate) {
      query += ' AND COALESCE(r.rate_min, 100) <= ?';
      params.push(filters.maxRate);
    }
    if (filters.search) {
      query += ' AND (i.first_name LIKE ? OR i.last_name LIKE ? OR i.username LIKE ? OR i.bio LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY i.total_followers DESC LIMIT 100';

    const result = await database.prepare(query).bind(...params).all();
    return result.results || [];
  },

  // ============================================
  // CONNECTION MANAGEMENT
  // ============================================

  // Create a connection request from brand to influencer
  async createConnection(database: D1Database, connection: {
    id: string;
    brand_id: string;
    influencer_id: string;
    message?: string;
    campaign_interest?: string;
  }): Promise<string> {
    await database.prepare(`
      INSERT INTO connections (id, brand_id, influencer_id, message, campaign_interest, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `).bind(
      connection.id,
      connection.brand_id,
      connection.influencer_id,
      connection.message || null,
      connection.campaign_interest || null
    ).run();
    return connection.id;
  },

  // Get connection by brand and influencer
  async getConnection(database: D1Database, brandId: string, influencerId: string): Promise<any | null> {
    const result = await database.prepare(`
      SELECT * FROM connections WHERE brand_id = ? AND influencer_id = ?
    `).bind(brandId, influencerId).first();
    return result;
  },

  // Get connection by ID
  async getConnectionById(database: D1Database, connectionId: string): Promise<any | null> {
    const result = await database.prepare(`
      SELECT * FROM connections WHERE id = ?
    `).bind(connectionId).first();
    return result;
  },

  // Get all connections for a brand (with influencer details)
  async getBrandConnections(database: D1Database, brandId: string, status?: string): Promise<any[]> {
    let query = `
      SELECT c.*, 
        i.first_name || ' ' || i.last_name as influencer_name,
        i.username,
        i.avatar as influencer_avatar,
        i.category,
        i.verified as influencer_verified,
        i.total_followers,
        i.avg_engagement
      FROM connections c
      JOIN influencers i ON c.influencer_id = i.id
      WHERE c.brand_id = ?
    `;
    const params: any[] = [brandId];

    if (status) {
      query += ' AND c.status = ?';
      params.push(status);
    }

    query += ' ORDER BY c.updated_at DESC';
    const result = await database.prepare(query).bind(...params).all();
    return result.results || [];
  },

  // Get all connections for an influencer (with brand details)
  async getInfluencerConnections(database: D1Database, influencerId: string, status?: string): Promise<any[]> {
    let query = `
      SELECT c.*, 
        u.first_name || ' ' || u.last_name as brand_name,
        u.company,
        u.avatar as brand_avatar,
        u.plan as brand_plan
      FROM connections c
      JOIN users u ON c.brand_id = u.id
      WHERE c.influencer_id = ?
    `;
    const params: any[] = [influencerId];

    if (status) {
      query += ' AND c.status = ?';
      params.push(status);
    }

    query += ' ORDER BY c.updated_at DESC';
    const result = await database.prepare(query).bind(...params).all();
    return result.results || [];
  },

  // Get pending connection requests for an influencer
  async getPendingConnectionRequests(database: D1Database, influencerId: string): Promise<any[]> {
    const result = await database.prepare(`
      SELECT c.*, 
        u.first_name || ' ' || u.last_name as brand_name,
        u.company,
        u.avatar as brand_avatar,
        u.plan as brand_plan
      FROM connections c
      JOIN users u ON c.brand_id = u.id
      WHERE c.influencer_id = ? AND c.status = 'pending'
      ORDER BY c.requested_at DESC
    `).bind(influencerId).all();
    return result.results || [];
  },

  // Update connection status
  async updateConnectionStatus(database: D1Database, connectionId: string, status: string): Promise<void> {
    await database.prepare(`
      UPDATE connections 
      SET status = ?, responded_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(status, connectionId).run();
  },

  // Check if brand and influencer are connected (accepted)
  async isConnected(database: D1Database, brandId: string, influencerId: string): Promise<boolean> {
    const result = await database.prepare(`
      SELECT id FROM connections WHERE brand_id = ? AND influencer_id = ? AND status = 'accepted'
    `).bind(brandId, influencerId).first();
    return !!result;
  },

  // Get connected influencers for a brand (for messaging)
  async getConnectedInfluencers(database: D1Database, brandId: string): Promise<any[]> {
    const result = await database.prepare(`
      SELECT c.*, 
        i.first_name || ' ' || i.last_name as influencer_name,
        i.username,
        i.avatar as influencer_avatar,
        i.category,
        i.verified as influencer_verified,
        i.total_followers,
        conv.id as conversation_id,
        conv.unread_count,
        (SELECT content FROM messages m WHERE m.conversation_id = conv.id ORDER BY m.created_at DESC LIMIT 1) as last_message
      FROM connections c
      JOIN influencers i ON c.influencer_id = i.id
      LEFT JOIN conversations conv ON conv.brand_id = c.brand_id AND conv.influencer_id = c.influencer_id
      WHERE c.brand_id = ? AND c.status = 'accepted'
      ORDER BY conv.last_message_at DESC NULLS LAST, c.responded_at DESC
    `).bind(brandId).all();
    return result.results || [];
  },

  // Get connected brands for an influencer (for messaging)
  async getConnectedBrands(database: D1Database, influencerId: string): Promise<any[]> {
    const result = await database.prepare(`
      SELECT c.*, 
        u.first_name || ' ' || u.last_name as brand_name,
        u.company,
        u.avatar as brand_avatar,
        u.plan as brand_plan,
        conv.id as conversation_id,
        conv.unread_count,
        (SELECT content FROM messages m WHERE m.conversation_id = conv.id ORDER BY m.created_at DESC LIMIT 1) as last_message
      FROM connections c
      JOIN users u ON c.brand_id = u.id
      LEFT JOIN conversations conv ON conv.brand_id = c.brand_id AND conv.influencer_id = c.influencer_id
      WHERE c.influencer_id = ? AND c.status = 'accepted'
      ORDER BY conv.last_message_at DESC NULLS LAST, c.responded_at DESC
    `).bind(influencerId).all();
    return result.results || [];
  }
};
