// Background Task Service for OWNLAY Marketing OS
// Implements async processing for long-running AI tasks
// Version: 4.7.0 - Enterprise Scale

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface BackgroundTask {
  id: string;
  type: 'ai_audit' | 'budget_allocation' | 'campaign_analysis' | 'creative_generation' | 'bulk_audit' | 'performance_report';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
  input: any;
  output?: any;
  error?: string;
  progress: number; // 0-100
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  brandId: string;
  orgId: string;
  userId: string;
  retryCount: number;
  maxRetries: number;
}

export interface TaskResult {
  success: boolean;
  taskId: string;
  status: BackgroundTask['status'];
  progress: number;
  result?: any;
  error?: string;
}

// ============================================
// BACKGROUND TASK SERVICE
// ============================================

export const backgroundTaskService = {
  /**
   * Create a new background task
   * Returns immediately with task ID for polling
   */
  async createTask(
    database: D1Database,
    type: BackgroundTask['type'],
    input: any,
    context: { brandId: string; orgId: string; userId: string },
    priority: BackgroundTask['priority'] = 'medium'
  ): Promise<string> {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await database.prepare(`
      INSERT INTO background_tasks (
        id, type, status, priority, input, progress,
        brand_id, org_id, user_id, retry_count, max_retries, created_at
      ) VALUES (?, ?, 'pending', ?, ?, 0, ?, ?, ?, 0, 3, CURRENT_TIMESTAMP)
    `).bind(
      taskId,
      type,
      priority,
      JSON.stringify(input),
      context.brandId,
      context.orgId,
      context.userId
    ).run();
    
    return taskId;
  },

  /**
   * Get task status
   */
  async getTask(database: D1Database, taskId: string): Promise<BackgroundTask | null> {
    const result = await database.prepare(`
      SELECT * FROM background_tasks WHERE id = ?
    `).bind(taskId).first<any>();
    
    if (!result) return null;
    
    return {
      id: result.id,
      type: result.type,
      status: result.status,
      priority: result.priority,
      input: JSON.parse(result.input || '{}'),
      output: result.output ? JSON.parse(result.output) : undefined,
      error: result.error,
      progress: result.progress,
      createdAt: result.created_at,
      startedAt: result.started_at,
      completedAt: result.completed_at,
      brandId: result.brand_id,
      orgId: result.org_id,
      userId: result.user_id,
      retryCount: result.retry_count,
      maxRetries: result.max_retries
    };
  },

  /**
   * Get pending tasks for processing (for queue worker)
   */
  async getPendingTasks(database: D1Database, limit: number = 10): Promise<BackgroundTask[]> {
    const result = await database.prepare(`
      SELECT * FROM background_tasks 
      WHERE status = 'pending' 
      ORDER BY 
        CASE priority 
          WHEN 'high' THEN 1 
          WHEN 'medium' THEN 2 
          WHEN 'low' THEN 3 
        END,
        created_at ASC
      LIMIT ?
    `).bind(limit).all<any>();
    
    return (result.results || []).map(r => ({
      id: r.id,
      type: r.type,
      status: r.status,
      priority: r.priority,
      input: JSON.parse(r.input || '{}'),
      output: r.output ? JSON.parse(r.output) : undefined,
      error: r.error,
      progress: r.progress,
      createdAt: r.created_at,
      startedAt: r.started_at,
      completedAt: r.completed_at,
      brandId: r.brand_id,
      orgId: r.org_id,
      userId: r.user_id,
      retryCount: r.retry_count,
      maxRetries: r.max_retries
    }));
  },

  /**
   * Update task progress
   */
  async updateProgress(database: D1Database, taskId: string, progress: number): Promise<void> {
    await database.prepare(`
      UPDATE background_tasks SET progress = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(progress, taskId).run();
  },

  /**
   * Start processing a task
   */
  async startTask(database: D1Database, taskId: string): Promise<void> {
    await database.prepare(`
      UPDATE background_tasks 
      SET status = 'processing', started_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).bind(taskId).run();
  },

  /**
   * Complete a task with result
   */
  async completeTask(database: D1Database, taskId: string, output: any): Promise<void> {
    await database.prepare(`
      UPDATE background_tasks 
      SET status = 'completed', output = ?, progress = 100, 
          completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).bind(JSON.stringify(output), taskId).run();
  },

  /**
   * Fail a task with error
   */
  async failTask(database: D1Database, taskId: string, error: string): Promise<void> {
    // Check if we should retry
    const task = await this.getTask(database, taskId);
    
    if (task && task.retryCount < task.maxRetries) {
      // Schedule for retry
      await database.prepare(`
        UPDATE background_tasks 
        SET status = 'pending', error = ?, retry_count = retry_count + 1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).bind(error, taskId).run();
    } else {
      // Mark as failed
      await database.prepare(`
        UPDATE background_tasks 
        SET status = 'failed', error = ?, completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).bind(error, taskId).run();
    }
  },

  /**
   * Cancel a task
   */
  async cancelTask(database: D1Database, taskId: string): Promise<boolean> {
    const task = await this.getTask(database, taskId);
    
    if (!task || task.status === 'completed' || task.status === 'failed') {
      return false;
    }
    
    await database.prepare(`
      UPDATE background_tasks 
      SET status = 'cancelled', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).bind(taskId).run();
    
    return true;
  },

  /**
   * Get user's recent tasks
   */
  async getUserTasks(
    database: D1Database, 
    userId: string, 
    brandId: string, 
    orgId: string,
    limit: number = 20
  ): Promise<BackgroundTask[]> {
    const result = await database.prepare(`
      SELECT * FROM background_tasks 
      WHERE user_id = ? AND brand_id = ? AND org_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `).bind(userId, brandId, orgId, limit).all<any>();
    
    return (result.results || []).map(r => ({
      id: r.id,
      type: r.type,
      status: r.status,
      priority: r.priority,
      input: JSON.parse(r.input || '{}'),
      output: r.output ? JSON.parse(r.output) : undefined,
      error: r.error,
      progress: r.progress,
      createdAt: r.created_at,
      startedAt: r.started_at,
      completedAt: r.completed_at,
      brandId: r.brand_id,
      orgId: r.org_id,
      userId: r.user_id,
      retryCount: r.retry_count,
      maxRetries: r.max_retries
    }));
  },

  /**
   * Clean up old completed/failed tasks
   */
  async cleanupOldTasks(database: D1Database, daysOld: number = 30): Promise<number> {
    const result = await database.prepare(`
      DELETE FROM background_tasks 
      WHERE (status = 'completed' OR status = 'failed' OR status = 'cancelled')
        AND created_at < datetime('now', '-' || ? || ' days')
    `).bind(daysOld).run();
    
    return result.meta.changes || 0;
  },

  /**
   * Process tasks asynchronously using Cloudflare's waitUntil
   * This allows the request to return immediately while processing continues
   */
  processTaskAsync(ctx: ExecutionContext, processor: () => Promise<void>): void {
    ctx.waitUntil(processor());
  },

  /**
   * Task processor - processes a single background task
   * This should be called from a scheduled worker or via waitUntil
   */
  async processTask(database: D1Database, task: BackgroundTask, processors: TaskProcessors): Promise<void> {
    try {
      await this.startTask(database, task.id);
      
      const processor = processors[task.type];
      if (!processor) {
        throw new Error(`No processor for task type: ${task.type}`);
      }
      
      const result = await processor(task.input, (progress) => {
        this.updateProgress(database, task.id, progress);
      });
      
      await this.completeTask(database, task.id, result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.failTask(database, task.id, errorMessage);
    }
  }
};

// Type for task processors
export type TaskProcessor = (input: any, updateProgress: (progress: number) => void) => Promise<any>;
export type TaskProcessors = Record<BackgroundTask['type'], TaskProcessor>;

export default backgroundTaskService;
