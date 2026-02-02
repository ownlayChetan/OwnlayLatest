import { create } from 'zustand';
import type {
  TenantContext,
  Organization,
  Brand,
  AgentActivity,
  AgentDecision,
  ApprovalItem,
  ResearchResult,
  StrategyResult,
  CreativeResult,
  AuditResult,
  OrchestratorResult,
} from '@/types';
import { api } from '@/services/api';

interface AgentState {
  // Context
  tenantContext: TenantContext | null;
  organization: Organization | null;
  brand: Brand | null;
  organizations: Organization[];
  brands: Brand[];
  
  // Agent results
  researchResult: ResearchResult | null;
  strategyResult: StrategyResult | null;
  creativeResult: CreativeResult | null;
  auditResult: AuditResult | null;
  orchestratorResult: OrchestratorResult | null;
  
  // Activity
  activities: AgentActivity[];
  decisions: AgentDecision[];
  approvals: ApprovalItem[];
  
  // Status
  isLoading: boolean;
  error: string | null;
  runningAgents: Set<string>;
  
  // Actions
  loadContext: () => Promise<void>;
  switchContext: (orgId: string, brandId: string) => Promise<boolean>;
  loadOrganizations: () => Promise<void>;
  loadBrands: () => Promise<void>;
  
  // Agent actions
  runResearch: (params: { competitors: string[]; industry?: string; depth?: string }) => Promise<void>;
  runStrategy: (params: { budget: number; period?: string; platforms?: string[] }) => Promise<void>;
  runCreative: (params: { productInfo: string; brandName: string; platforms?: string[]; tone?: string }) => Promise<void>;
  runAudit: (params: { content: string; contentType: string; platform?: string }) => Promise<void>;
  runFullCampaign: (params: Record<string, unknown>) => Promise<void>;
  
  // Observability actions
  loadActivities: () => Promise<void>;
  loadDecisions: () => Promise<void>;
  loadApprovals: () => Promise<void>;
  approveItem: (id: string, notes?: string) => Promise<boolean>;
  rejectItem: (id: string, reason: string) => Promise<boolean>;
  
  clearError: () => void;
  clearResults: () => void;
}

export const useAgentStore = create<AgentState>()((set, get) => ({
  // Initial state
  tenantContext: null,
  organization: null,
  brand: null,
  organizations: [],
  brands: [],
  researchResult: null,
  strategyResult: null,
  creativeResult: null,
  auditResult: null,
  orchestratorResult: null,
  activities: [],
  decisions: [],
  approvals: [],
  isLoading: false,
  error: null,
  runningAgents: new Set(),

  // Context management
  loadContext: async () => {
    try {
      const response = await api.getTenantContext();
      if (response.success && response.data) {
        set({
          tenantContext: response.data.context,
          organization: response.data.organization,
          brand: response.data.brand,
        });
      }
    } catch (error) {
      console.error('Failed to load tenant context:', error);
    }
  },

  switchContext: async (orgId, brandId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.switchContext(orgId, brandId);
      if (response.success && response.data) {
        set({
          tenantContext: response.data.context,
          isLoading: false,
        });
        // Reload organization and brand details
        await get().loadContext();
        return true;
      }
      set({ error: 'Failed to switch context', isLoading: false });
      return false;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to switch context';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  loadOrganizations: async () => {
    try {
      const response = await api.getOrganizations();
      if (response.success && response.data) {
        set({ organizations: response.data });
      }
    } catch (error) {
      console.error('Failed to load organizations:', error);
    }
  },

  loadBrands: async () => {
    try {
      const response = await api.getBrands();
      if (response.success && response.data) {
        set({ brands: response.data });
      }
    } catch (error) {
      console.error('Failed to load brands:', error);
    }
  },

  // Agent execution
  runResearch: async (params) => {
    const runningAgents = new Set(get().runningAgents);
    runningAgents.add('researcher');
    set({ isLoading: true, error: null, runningAgents, researchResult: null });
    
    try {
      const response = await api.researchCompetitors({
        competitors: params.competitors,
        industry: params.industry,
        depth: params.depth as 'quick' | 'standard' | 'deep',
      });
      
      runningAgents.delete('researcher');
      
      if (response.success && response.data) {
        set({ researchResult: response.data, isLoading: false, runningAgents });
      } else {
        set({ error: 'Research failed', isLoading: false, runningAgents });
      }
    } catch (error) {
      runningAgents.delete('researcher');
      const message = error instanceof Error ? error.message : 'Research failed';
      set({ error: message, isLoading: false, runningAgents });
    }
  },

  runStrategy: async (params) => {
    const runningAgents = new Set(get().runningAgents);
    runningAgents.add('strategist');
    set({ isLoading: true, error: null, runningAgents, strategyResult: null });
    
    try {
      const response = await api.getBudgetAllocation({
        budget: params.budget,
        period: params.period as 'daily' | 'weekly' | 'monthly' | 'quarterly',
        platforms: params.platforms,
      });
      
      runningAgents.delete('strategist');
      
      if (response.success && response.data) {
        set({ strategyResult: response.data, isLoading: false, runningAgents });
      } else {
        set({ error: 'Strategy failed', isLoading: false, runningAgents });
      }
    } catch (error) {
      runningAgents.delete('strategist');
      const message = error instanceof Error ? error.message : 'Strategy failed';
      set({ error: message, isLoading: false, runningAgents });
    }
  },

  runCreative: async (params) => {
    const runningAgents = new Set(get().runningAgents);
    runningAgents.add('creative');
    set({ isLoading: true, error: null, runningAgents, creativeResult: null });
    
    try {
      const response = await api.generateCreative({
        productInfo: params.productInfo,
        brandName: params.brandName,
        platforms: params.platforms,
        tone: params.tone as 'professional' | 'casual' | 'urgent' | 'luxury' | 'playful',
      });
      
      runningAgents.delete('creative');
      
      if (response.success && response.data) {
        set({ creativeResult: response.data, isLoading: false, runningAgents });
      } else {
        set({ error: 'Creative generation failed', isLoading: false, runningAgents });
      }
    } catch (error) {
      runningAgents.delete('creative');
      const message = error instanceof Error ? error.message : 'Creative generation failed';
      set({ error: message, isLoading: false, runningAgents });
    }
  },

  runAudit: async (params) => {
    const runningAgents = new Set(get().runningAgents);
    runningAgents.add('auditor');
    set({ isLoading: true, error: null, runningAgents, auditResult: null });
    
    try {
      const response = await api.auditContent({
        content: params.content,
        contentType: params.contentType as 'headline' | 'description' | 'full_ad',
        platform: params.platform,
      });
      
      runningAgents.delete('auditor');
      
      if (response.success && response.data) {
        set({ auditResult: response.data, isLoading: false, runningAgents });
      } else {
        set({ error: 'Audit failed', isLoading: false, runningAgents });
      }
    } catch (error) {
      runningAgents.delete('auditor');
      const message = error instanceof Error ? error.message : 'Audit failed';
      set({ error: message, isLoading: false, runningAgents });
    }
  },

  runFullCampaign: async (params) => {
    const runningAgents = new Set(get().runningAgents);
    ['researcher', 'strategist', 'creative', 'auditor', 'orchestrator'].forEach(a => runningAgents.add(a));
    set({ 
      isLoading: true, 
      error: null, 
      runningAgents,
      orchestratorResult: null,
      researchResult: null,
      strategyResult: null,
      creativeResult: null,
      auditResult: null,
    });
    
    try {
      const response = await api.runFullCampaign(params as Parameters<typeof api.runFullCampaign>[0]);
      
      runningAgents.clear();
      
      if (response.success && response.data) {
        set({ 
          orchestratorResult: response.data,
          researchResult: response.data.stages.research || null,
          strategyResult: response.data.stages.strategy || null,
          creativeResult: response.data.stages.creative || null,
          auditResult: response.data.stages.audit || null,
          isLoading: false, 
          runningAgents 
        });
      } else {
        set({ error: 'Campaign execution failed', isLoading: false, runningAgents });
      }
    } catch (error) {
      runningAgents.clear();
      const message = error instanceof Error ? error.message : 'Campaign execution failed';
      set({ error: message, isLoading: false, runningAgents });
    }
  },

  // Observability
  loadActivities: async () => {
    try {
      const response = await api.getAgentActivity(20);
      if (response.success && response.data) {
        set({ activities: response.data });
      }
    } catch (error) {
      console.error('Failed to load activities:', error);
    }
  },

  loadDecisions: async () => {
    try {
      const response = await api.getAgentDecisions();
      if (response.success && response.data) {
        set({ decisions: response.data });
      }
    } catch (error) {
      console.error('Failed to load decisions:', error);
    }
  },

  loadApprovals: async () => {
    try {
      const response = await api.getApprovals();
      if (response.success && response.data) {
        set({ approvals: response.data });
      }
    } catch (error) {
      console.error('Failed to load approvals:', error);
    }
  },

  approveItem: async (id, notes) => {
    try {
      const response = await api.approveItem(id, notes);
      if (response.success) {
        // Remove from approvals list
        set({ approvals: get().approvals.filter(a => a.id !== id) });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to approve item:', error);
      return false;
    }
  },

  rejectItem: async (id, reason) => {
    try {
      const response = await api.rejectItem(id, reason);
      if (response.success) {
        // Remove from approvals list
        set({ approvals: get().approvals.filter(a => a.id !== id) });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to reject item:', error);
      return false;
    }
  },

  clearError: () => set({ error: null }),
  
  clearResults: () => set({
    researchResult: null,
    strategyResult: null,
    creativeResult: null,
    auditResult: null,
    orchestratorResult: null,
  }),
}));

export default useAgentStore;
