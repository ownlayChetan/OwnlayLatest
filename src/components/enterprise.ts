// OWNLAY Enterprise UI Components
// Live Agent Activity, Brand Switcher, Approval Center
// Version: 4.1.0 - Enterprise Observability & Human-in-the-Loop

// ============================================
// LIVE AGENT ACTIVITY COMPONENT
// Shows real-time agent thinking and decisions
// ============================================

export const liveAgentActivity = (options: {
  maxItems?: number;
  showHeader?: boolean;
  compact?: boolean;
} = {}) => {
  const maxItems = options.maxItems || 10;
  const showHeader = options.showHeader !== false;
  const compact = options.compact || false;

  return `
<div id="live-agent-activity" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
  ${showHeader ? `
  <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
    <div class="flex items-center gap-2">
      <div class="relative">
        <div class="w-2 h-2 bg-green-500 rounded-full"></div>
        <div class="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
      </div>
      <h3 class="font-semibold text-gray-900 text-sm">Live Agent Activity</h3>
    </div>
    <div class="flex items-center gap-2">
      <button onclick="refreshActivityFeed()" class="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Refresh">
        <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
      </button>
      <button onclick="toggleActivityPanel()" class="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 text-xs" id="activity-toggle-btn">
        <span id="activity-toggle-text">Hide</span>
      </button>
    </div>
  </div>
  ` : ''}
  
  <div id="activity-feed-container" class="divide-y divide-gray-50 max-h-96 overflow-y-auto">
    <!-- Activities will be rendered here -->
    <div id="activity-feed-loading" class="p-4 text-center text-gray-500">
      <svg class="animate-spin h-5 w-5 mx-auto mb-2 text-indigo-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span class="text-sm">Loading agent activity...</span>
    </div>
    <div id="activity-feed-empty" class="p-6 text-center text-gray-400 hidden">
      <svg class="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
      </svg>
      <p class="text-sm">No recent agent activity</p>
    </div>
    <div id="activity-feed-list" class="hidden"></div>
  </div>
</div>

<script>
// Activity Feed Controller
const ActivityFeed = {
  activities: [],
  maxItems: ${maxItems},
  pollingInterval: null,
  isCollapsed: false,
  useDemoData: false,
  
  // Helper to generate time ago timestamp
  getTimeAgo(ms) {
    return new Date(Date.now() - ms).toISOString();
  },
  
  // Demo activities for when no real data exists (computed on init)
  getDemoActivities() {
    return [
      {
        id: 'demo_1',
        agent_type: 'researcher',
        activity_type: 'analyzing',
        title: 'Researcher: Competitor Analysis',
        description: 'Analyzing pricing data from 5 competitors...',
        status: 'active',
        progress: 65,
        started_at: this.getTimeAgo(30000),
        duration_ms: null
      },
      {
        id: 'demo_2',
        agent_type: 'strategist',
        activity_type: 'deciding',
        title: 'Strategist: Budget Reallocation',
        description: 'Evaluating ROAS across channels for optimal budget distribution',
        status: 'active',
        progress: 80,
        started_at: this.getTimeAgo(120000),
        duration_ms: null
      },
      {
        id: 'demo_3',
        agent_type: 'creative',
        activity_type: 'completed',
        title: 'Creative: Headlines Generated',
        description: 'Generated 5 new ad headlines for Google Ads campaign',
        status: 'completed',
        progress: 100,
        started_at: this.getTimeAgo(300000),
        duration_ms: 4523
      },
      {
        id: 'demo_4',
        agent_type: 'auditor',
        activity_type: 'completed',
        title: 'Auditor: Compliance Check',
        description: 'Scanned 12 creatives against brand safety guidelines',
        status: 'completed',
        progress: 100,
        started_at: this.getTimeAgo(600000),
        duration_ms: 2187
      },
      {
        id: 'demo_5',
        agent_type: 'orchestrator',
        activity_type: 'waiting_approval',
        title: 'Orchestrator: Campaign Launch',
        description: 'Full campaign ready - awaiting human approval',
        status: 'pending',
        progress: 90,
        started_at: this.getTimeAgo(900000),
        duration_ms: null
      }
    ];
  },
  
  init() {
    this.refresh();
    this.startPolling();
  },
  
  async refresh() {
    try {
      const response = await fetch('/api/v1/observability/activity?limit=' + this.maxItems);
      const data = await response.json();
      
      if (data.success && data.activities && data.activities.length > 0) {
        this.activities = data.activities;
        this.useDemoData = false;
      } else {
        // Use demo data if no real data
        this.activities = this.getDemoActivities();
        this.useDemoData = true;
      }
      this.render();
    } catch (error) {
      console.error('Failed to fetch activities, using demo data:', error);
      this.activities = this.getDemoActivities();
      this.useDemoData = true;
      this.render();
    }
  },
  
  startPolling() {
    this.pollingInterval = setInterval(() => this.refresh(), 5000);
  },
  
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  },
  
  getAgentIcon(agentType) {
    const icons = {
      researcher: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>',
      strategist: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>',
      creative: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>',
      auditor: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>',
      orchestrator: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>',
      system: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/></svg>'
    };
    return icons[agentType] || icons.system;
  },
  
  getAgentColor(agentType) {
    const colors = {
      researcher: 'bg-blue-100 text-blue-600',
      strategist: 'bg-purple-100 text-purple-600',
      creative: 'bg-pink-100 text-pink-600',
      auditor: 'bg-amber-100 text-amber-600',
      orchestrator: 'bg-indigo-100 text-indigo-600',
      system: 'bg-gray-100 text-gray-600'
    };
    return colors[agentType] || colors.system;
  },
  
  getStatusBadge(status, progress) {
    if (status === 'completed') {
      return '<span class="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">Done</span>';
    }
    if (status === 'error') {
      return '<span class="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">Error</span>';
    }
    if (status === 'pending') {
      return '<span class="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">Pending</span>';
    }
    // Active with progress
    return \`<span class="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">\${progress}%</span>\`;
  },
  
  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    return date.toLocaleDateString();
  },
  
  render() {
    const loading = document.getElementById('activity-feed-loading');
    const empty = document.getElementById('activity-feed-empty');
    const list = document.getElementById('activity-feed-list');
    
    loading.classList.add('hidden');
    
    if (this.activities.length === 0) {
      empty.classList.remove('hidden');
      list.classList.add('hidden');
      return;
    }
    
    empty.classList.add('hidden');
    list.classList.remove('hidden');
    
    // Demo banner if using demo data
    const demoBanner = this.useDemoData ? \`
      <div class="px-3 py-2 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
        <svg class="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span class="text-xs text-amber-700 font-medium">Sample Activity — Run agent tasks for real data</span>
      </div>
    \` : '';
    
    list.innerHTML = demoBanner + this.activities.map(activity => \`
      <div class="p-3 hover:bg-gray-50 transition-colors \${activity.status === 'active' ? 'bg-indigo-50/30' : ''}">
        <div class="flex items-start gap-3">
          <div class="flex-shrink-0 w-8 h-8 rounded-lg \${this.getAgentColor(activity.agent_type)} flex items-center justify-center">
            \${this.getAgentIcon(activity.agent_type)}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-0.5">
              <span class="font-medium text-gray-900 text-sm truncate">\${activity.title}</span>
              \${this.getStatusBadge(activity.status, activity.progress)}
            </div>
            <p class="text-gray-500 text-xs line-clamp-2">\${activity.description}</p>
            <div class="flex items-center gap-2 mt-1.5">
              <span class="text-gray-400 text-xs">\${this.formatTime(activity.started_at)}</span>
              \${activity.duration_ms ? \`<span class="text-gray-400 text-xs">\${activity.duration_ms}ms</span>\` : ''}
            </div>
          </div>
        </div>
        \${activity.status === 'active' && activity.progress < 100 ? \`
        <div class="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
          <div class="h-full bg-indigo-500 rounded-full transition-all duration-500" style="width: \${activity.progress}%"></div>
        </div>
        \` : ''}
      </div>
    \`).join('');
  },
  
  toggle() {
    this.isCollapsed = !this.isCollapsed;
    const container = document.getElementById('activity-feed-container');
    const btn = document.getElementById('activity-toggle-text');
    
    if (this.isCollapsed) {
      container.classList.add('hidden');
      btn.textContent = 'Show';
    } else {
      container.classList.remove('hidden');
      btn.textContent = 'Hide';
    }
  }
};

function refreshActivityFeed() {
  ActivityFeed.refresh();
}

function toggleActivityPanel() {
  ActivityFeed.toggle();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  ActivityFeed.init();
});
</script>
`;
};

// ============================================
// BRAND SWITCHER COMPONENT
// Modern sidebar with organization/brand context
// ============================================

export const brandSwitcher = () => {
  return `
<div id="brand-switcher" class="relative">
  <button onclick="toggleBrandDropdown()" class="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-gray-100 transition-colors group">
    <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm" id="brand-avatar">
      D
    </div>
    <div class="flex-1 text-left min-w-0">
      <p class="font-semibold text-gray-900 text-sm truncate" id="current-brand-name">Demo Brand</p>
      <p class="text-gray-500 text-xs truncate" id="current-org-name">Demo Agency</p>
    </div>
    <svg class="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"/>
    </svg>
  </button>
  
  <!-- Dropdown -->
  <div id="brand-dropdown" class="hidden absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
    <div class="p-2 border-b border-gray-100">
      <p class="text-xs font-medium text-gray-500 px-2 mb-1">Organizations</p>
      <div id="org-list" class="space-y-0.5">
        <!-- Organizations rendered here -->
      </div>
    </div>
    <div class="p-2 border-b border-gray-100">
      <p class="text-xs font-medium text-gray-500 px-2 mb-1">Brands</p>
      <div id="brand-list" class="space-y-0.5 max-h-48 overflow-y-auto">
        <!-- Brands rendered here -->
      </div>
    </div>
    <div class="p-2">
      <button onclick="createNewBrand()" class="flex items-center gap-2 w-full px-2 py-1.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg text-sm transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        Add New Brand
      </button>
    </div>
  </div>
</div>

<script>
// Brand Switcher Controller
const BrandSwitcher = {
  currentContext: null,
  organizations: [],
  brands: [],
  isOpen: false,
  
  async init() {
    await this.loadContext();
    await this.loadOrganizations();
    await this.loadBrands();
    this.render();
    
    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#brand-switcher')) {
        this.close();
      }
    });
  },
  
  async loadContext() {
    try {
      const response = await fetch('/api/v1/agents/context');
      const data = await response.json();
      if (data.success) {
        this.currentContext = {
          org: data.organization,
          brand: data.brand,
          context: data.context
        };
      }
    } catch (error) {
      console.error('Failed to load context:', error);
    }
  },
  
  async loadOrganizations() {
    try {
      const response = await fetch('/api/v1/agents/organizations');
      const data = await response.json();
      if (data.success) {
        this.organizations = data.organizations || [];
      }
    } catch (error) {
      console.error('Failed to load organizations:', error);
    }
  },
  
  async loadBrands() {
    try {
      const response = await fetch('/api/v1/agents/brands');
      const data = await response.json();
      if (data.success) {
        this.brands = data.brands || [];
      }
    } catch (error) {
      console.error('Failed to load brands:', error);
    }
  },
  
  async switchContext(orgId, brandId) {
    try {
      const response = await fetch('/api/v1/agents/context/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId, brandId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Reload the page to refresh all data with new context
        window.location.reload();
      } else {
        console.error('Failed to switch context:', data.error);
      }
    } catch (error) {
      console.error('Error switching context:', error);
    }
  },
  
  toggle() {
    this.isOpen = !this.isOpen;
    const dropdown = document.getElementById('brand-dropdown');
    
    if (this.isOpen) {
      dropdown.classList.remove('hidden');
    } else {
      dropdown.classList.add('hidden');
    }
  },
  
  close() {
    this.isOpen = false;
    document.getElementById('brand-dropdown').classList.add('hidden');
  },
  
  render() {
    // Update current brand display
    if (this.currentContext?.brand) {
      document.getElementById('brand-avatar').textContent = this.currentContext.brand.name?.charAt(0).toUpperCase() || 'B';
      document.getElementById('current-brand-name').textContent = this.currentContext.brand.name || 'Select Brand';
    }
    if (this.currentContext?.org) {
      document.getElementById('current-org-name').textContent = this.currentContext.org.name || 'Select Organization';
    }
    
    // Render organizations
    const orgList = document.getElementById('org-list');
    orgList.innerHTML = this.organizations.map(org => \`
      <button onclick="BrandSwitcher.switchContext('\${org.id}', null)" 
              class="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-sm transition-colors
                     \${this.currentContext?.context?.orgId === org.id ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'}">
        <div class="w-6 h-6 rounded bg-gray-200 flex items-center justify-center text-xs font-medium">
          \${org.name?.charAt(0).toUpperCase() || 'O'}
        </div>
        <span class="truncate">\${org.name}</span>
        \${this.currentContext?.context?.orgId === org.id ? '<svg class="w-4 h-4 ml-auto text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>' : ''}
      </button>
    \`).join('');
    
    // Render brands
    const brandList = document.getElementById('brand-list');
    brandList.innerHTML = this.brands.map(brand => \`
      <button onclick="BrandSwitcher.switchContext('\${this.currentContext?.context?.orgId}', '\${brand.id}')" 
              class="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-sm transition-colors
                     \${this.currentContext?.context?.brandId === brand.id ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'}">
        <div class="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium">
          \${brand.name?.charAt(0).toUpperCase() || 'B'}
        </div>
        <span class="truncate">\${brand.name}</span>
        \${this.currentContext?.context?.brandId === brand.id ? '<svg class="w-4 h-4 ml-auto text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>' : ''}
      </button>
    \`).join('');
  }
};

function toggleBrandDropdown() {
  BrandSwitcher.toggle();
}

function createNewBrand() {
  // Navigate to brand creation or show modal
  window.location.href = '/admin?action=new-brand';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  BrandSwitcher.init();
});
</script>
`;
};

// ============================================
// APPROVAL CENTER COMPONENT
// Human-in-the-loop decision approval
// ============================================

export const approvalCenter = (options: {
  showFilters?: boolean;
  maxItems?: number;
} = {}) => {
  const showFilters = options.showFilters !== false;
  const maxItems = options.maxItems || 20;

  return `
<div id="approval-center" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
  <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
        <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>
      <div>
        <h2 class="font-semibold text-gray-900">Approval Center</h2>
        <p class="text-gray-500 text-sm">Review and approve AI agent decisions</p>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <span id="pending-count" class="px-2.5 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">0</span>
      <button onclick="refreshApprovals()" class="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Refresh">
        <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
      </button>
    </div>
  </div>
  
  ${showFilters ? `
  <div class="px-5 py-3 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3 overflow-x-auto">
    <button onclick="filterApprovals('all')" class="approval-filter active px-3 py-1.5 rounded-lg text-sm font-medium transition-colors" data-filter="all">
      All
    </button>
    <button onclick="filterApprovals('urgent')" class="approval-filter px-3 py-1.5 rounded-lg text-sm font-medium transition-colors" data-filter="urgent">
      Urgent
    </button>
    <button onclick="filterApprovals('budget')" class="approval-filter px-3 py-1.5 rounded-lg text-sm font-medium transition-colors" data-filter="budget">
      Budget
    </button>
    <button onclick="filterApprovals('creative')" class="approval-filter px-3 py-1.5 rounded-lg text-sm font-medium transition-colors" data-filter="creative">
      Creative
    </button>
    <button onclick="filterApprovals('campaign')" class="approval-filter px-3 py-1.5 rounded-lg text-sm font-medium transition-colors" data-filter="campaign">
      Campaign
    </button>
  </div>
  ` : ''}
  
  <div id="approvals-container" class="divide-y divide-gray-50">
    <div id="approvals-loading" class="p-8 text-center text-gray-500">
      <svg class="animate-spin h-6 w-6 mx-auto mb-3 text-indigo-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span class="text-sm">Loading pending approvals...</span>
    </div>
    
    <div id="approvals-empty" class="p-8 text-center text-gray-400 hidden">
      <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <p class="font-medium text-gray-500 mb-1">All caught up!</p>
      <p class="text-sm">No pending approvals at this time</p>
    </div>
    
    <div id="approvals-list" class="hidden"></div>
  </div>
</div>

<!-- Approval Detail Modal -->
<div id="approval-modal" class="fixed inset-0 bg-black/50 z-50 hidden flex items-center justify-center p-4">
  <div class="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-xl">
    <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
      <h3 class="font-semibold text-gray-900">Review Decision</h3>
      <button onclick="closeApprovalModal()" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
        <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
    <div id="approval-modal-content" class="p-6 overflow-y-auto max-h-[60vh]">
      <!-- Modal content rendered here -->
    </div>
    <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
      <div class="flex items-center gap-2">
        <span id="modal-risk-badge" class="px-2 py-1 text-xs font-medium rounded-full">Low Risk</span>
        <span id="modal-confidence" class="text-gray-500 text-sm">85% confidence</span>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="rejectApprovalFromModal()" class="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors">
          Reject
        </button>
        <button onclick="approveFromModal()" class="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg font-medium transition-colors">
          Approve & Deploy
        </button>
      </div>
    </div>
  </div>
</div>

<style>
.approval-filter {
  color: #6b7280;
  background: transparent;
}
.approval-filter:hover {
  background: #f3f4f6;
  color: #374151;
}
.approval-filter.active {
  background: #eef2ff;
  color: #4f46e5;
}
</style>

<script>
// Approval Center Controller
const ApprovalCenter = {
  approvals: [],
  currentFilter: 'all',
  selectedApproval: null,
  maxItems: ${maxItems},
  useDemoData: false,
  
  // Helper to generate time ago timestamp
  getTimeAgo(ms) {
    return new Date(Date.now() - ms).toISOString();
  },
  
  // Demo approvals for when no real data exists (computed on init)
  getDemoApprovals() {
    return [
      {
        id: 'demo_approval_1',
        item_type: 'budget_reallocation',
        item_title: 'Reallocate $5,000 from Meta to Google Ads',
        item_description: 'Based on 30-day performance analysis, Google Ads is delivering 52% better ROAS. Recommend shifting budget to higher-performing channel.',
        agent_type: 'strategist',
        agent_reasoning: 'Analysis of last 30 days shows Google Ads delivering 3.8x ROAS vs Meta at 2.5x. This represents $2,400 additional revenue potential. Maintaining baseline Meta presence for brand awareness.',
        agent_confidence: 89,
        risk_level: 'low',
        risk_summary: 'Low risk - reversible within 24 hours if performance drops',
        priority: 'high',
        expected_outcome: { revenue_increase: '+15%', roas_improvement: '+0.8x' },
        created_at: this.getTimeAgo(1800000)
      },
      {
        id: 'demo_approval_2',
        item_type: 'creative_launch',
        item_title: 'Launch 5 new ad headlines for Q1 campaign',
        item_description: 'AI-generated headlines based on top-performing patterns. Ready for deployment across Google and Meta platforms.',
        agent_type: 'creative',
        agent_reasoning: 'Generated headlines using proven formulas from top 10% performing ads. Incorporated action verbs, urgency elements, and value propositions that historically drive 23% higher CTR.',
        agent_confidence: 76,
        risk_level: 'low',
        risk_summary: 'Low risk - A/B testing recommended before full rollout',
        priority: 'medium',
        expected_outcome: { ctr_improvement: '+23%', cpc_reduction: '-12%' },
        created_at: this.getTimeAgo(3600000)
      },
      {
        id: 'demo_approval_3',
        item_type: 'campaign_pause',
        item_title: 'Pause underperforming "Summer Sale" campaign',
        item_description: 'Campaign showing -45% ROAS vs target. Recommend pausing and reallocating budget to better performers.',
        agent_type: 'auditor',
        agent_reasoning: 'Campaign has spent $3,200 with only $1,760 in attributed revenue (0.55x ROAS). Below the 2.0x minimum threshold. Budget better allocated to "Brand Awareness" campaign showing 4.2x ROAS.',
        agent_confidence: 94,
        risk_level: 'medium',
        risk_summary: 'Medium risk - may impact reach metrics but will improve overall ROI',
        priority: 'urgent',
        expected_outcome: { cost_savings: '$1,500/week', roas_improvement: '+1.2x' },
        created_at: this.getTimeAgo(7200000)
      }
    ];
  },
  
  async init() {
    await this.refresh();
    this.startPolling();
  },
  
  async refresh() {
    try {
      const response = await fetch('/api/v1/observability/approvals');
      const data = await response.json();
      
      if (data.success && data.approvals && data.approvals.length > 0) {
        this.approvals = data.approvals;
        this.useDemoData = false;
      } else {
        // Use demo data if no real data
        this.approvals = this.getDemoApprovals();
        this.useDemoData = true;
      }
      this.render();
    } catch (error) {
      console.error('Failed to fetch approvals, using demo data:', error);
      this.approvals = this.getDemoApprovals();
      this.useDemoData = true;
      this.render();
    }
  },
  
  startPolling() {
    setInterval(() => this.refresh(), 10000);
  },
  
  filter(type) {
    this.currentFilter = type;
    
    // Update filter buttons
    document.querySelectorAll('.approval-filter').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === type);
    });
    
    this.render();
  },
  
  getFilteredApprovals() {
    if (this.currentFilter === 'all') return this.approvals;
    
    return this.approvals.filter(a => {
      if (this.currentFilter === 'urgent') return a.priority === 'urgent' || a.priority === 'high';
      if (this.currentFilter === 'budget') return a.item_type.includes('budget');
      if (this.currentFilter === 'creative') return a.item_type.includes('creative');
      if (this.currentFilter === 'campaign') return a.item_type.includes('campaign');
      return true;
    });
  },
  
  getRiskBadge(risk) {
    const colors = {
      low: 'bg-green-100 text-green-700',
      medium: 'bg-amber-100 text-amber-700',
      high: 'bg-red-100 text-red-700',
      critical: 'bg-red-200 text-red-800'
    };
    return \`<span class="px-2 py-0.5 text-xs font-medium rounded-full \${colors[risk] || colors.medium}">\${risk.charAt(0).toUpperCase() + risk.slice(1)} Risk</span>\`;
  },
  
  getPriorityIcon(priority) {
    if (priority === 'urgent') {
      return '<svg class="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>';
    }
    if (priority === 'high') {
      return '<svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>';
    }
    return '';
  },
  
  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    return date.toLocaleDateString();
  },
  
  render() {
    const loading = document.getElementById('approvals-loading');
    const empty = document.getElementById('approvals-empty');
    const list = document.getElementById('approvals-list');
    const count = document.getElementById('pending-count');
    
    loading.classList.add('hidden');
    
    const filtered = this.getFilteredApprovals();
    count.textContent = this.approvals.length;
    
    if (filtered.length === 0) {
      empty.classList.remove('hidden');
      list.classList.add('hidden');
      return;
    }
    
    empty.classList.add('hidden');
    list.classList.remove('hidden');
    
    // Demo banner if using demo data
    const demoBanner = this.useDemoData ? \`
      <div class="px-4 py-2 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
        <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span class="text-xs text-amber-700 font-medium">Sample Data — Run agent tasks to see real approvals</span>
      </div>
    \` : '';
    
    list.innerHTML = demoBanner + filtered.slice(0, this.maxItems).map(approval => \`
      <div class="p-5 hover:bg-gray-50 transition-colors cursor-pointer" onclick="ApprovalCenter.openModal('\${approval.id}')">
        <div class="flex items-start gap-4">
          <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
            <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              \${this.getPriorityIcon(approval.priority)}
              <h4 class="font-medium text-gray-900 truncate">\${approval.item_title}</h4>
              \${this.getRiskBadge(approval.risk_level)}
            </div>
            <p class="text-gray-500 text-sm line-clamp-2 mb-2">\${approval.item_description}</p>
            <div class="flex items-center gap-4 text-xs text-gray-400">
              <span class="flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                \${this.formatTime(approval.created_at)}
              </span>
              <span>\${approval.agent_type} Agent</span>
              <span>\${Math.round(approval.agent_confidence)}% confidence</span>
            </div>
          </div>
          <div class="flex-shrink-0 flex items-center gap-2">
            <button onclick="event.stopPropagation(); ApprovalCenter.quickReject('\${approval.id}')" 
                    class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Reject">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
            <button onclick="event.stopPropagation(); ApprovalCenter.quickApprove('\${approval.id}')" 
                    class="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors" title="Approve">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    \`).join('');
  },
  
  openModal(approvalId) {
    this.selectedApproval = this.approvals.find(a => a.id === approvalId);
    if (!this.selectedApproval) return;
    
    const modal = document.getElementById('approval-modal');
    const content = document.getElementById('approval-modal-content');
    const riskBadge = document.getElementById('modal-risk-badge');
    const confidence = document.getElementById('modal-confidence');
    
    // Set risk badge
    const riskColors = {
      low: 'bg-green-100 text-green-700',
      medium: 'bg-amber-100 text-amber-700',
      high: 'bg-red-100 text-red-700'
    };
    riskBadge.className = 'px-2 py-1 text-xs font-medium rounded-full ' + (riskColors[this.selectedApproval.risk_level] || riskColors.medium);
    riskBadge.textContent = this.selectedApproval.risk_level.charAt(0).toUpperCase() + this.selectedApproval.risk_level.slice(1) + ' Risk';
    
    confidence.textContent = Math.round(this.selectedApproval.agent_confidence) + '% confidence';
    
    // Render content
    content.innerHTML = \`
      <div class="space-y-6">
        <div>
          <h4 class="text-sm font-medium text-gray-500 mb-2">Proposed Action</h4>
          <div class="p-4 bg-gray-50 rounded-xl">
            <p class="font-medium text-gray-900 mb-2">\${this.selectedApproval.item_title}</p>
            <p class="text-gray-600 text-sm">\${this.selectedApproval.item_description}</p>
          </div>
        </div>
        
        <div>
          <h4 class="text-sm font-medium text-gray-500 mb-2">Agent's Reasoning</h4>
          <div class="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
              </div>
              <div>
                <p class="font-medium text-indigo-900 mb-1">\${this.selectedApproval.agent_type.charAt(0).toUpperCase() + this.selectedApproval.agent_type.slice(1)} Agent</p>
                <p class="text-indigo-800 text-sm">\${this.selectedApproval.agent_reasoning}</p>
              </div>
            </div>
          </div>
        </div>
        
        \${this.selectedApproval.expected_outcome ? \`
        <div>
          <h4 class="text-sm font-medium text-gray-500 mb-2">Expected Outcome</h4>
          <div class="p-4 bg-green-50 rounded-xl border border-green-100">
            <p class="text-green-800 text-sm">\${JSON.stringify(this.selectedApproval.expected_outcome, null, 2)}</p>
          </div>
        </div>
        \` : ''}
        
        \${this.selectedApproval.risk_summary ? \`
        <div>
          <h4 class="text-sm font-medium text-gray-500 mb-2">Risk Summary</h4>
          <div class="p-4 bg-amber-50 rounded-xl border border-amber-100">
            <p class="text-amber-800 text-sm">\${this.selectedApproval.risk_summary}</p>
          </div>
        </div>
        \` : ''}
      </div>
    \`;
    
    modal.classList.remove('hidden');
  },
  
  closeModal() {
    document.getElementById('approval-modal').classList.add('hidden');
    this.selectedApproval = null;
  },
  
  async quickApprove(approvalId) {
    try {
      const response = await fetch(\`/api/v1/observability/approvals/\${approvalId}/approve\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: 'Quick approved from dashboard' })
      });
      
      if (response.ok) {
        this.refresh();
      }
    } catch (error) {
      console.error('Failed to approve:', error);
    }
  },
  
  async quickReject(approvalId) {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;
    
    try {
      const response = await fetch(\`/api/v1/observability/approvals/\${approvalId}/reject\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      
      if (response.ok) {
        this.refresh();
      }
    } catch (error) {
      console.error('Failed to reject:', error);
    }
  },
  
  async approveFromModal() {
    if (!this.selectedApproval) return;
    await this.quickApprove(this.selectedApproval.id);
    this.closeModal();
  },
  
  async rejectFromModal() {
    if (!this.selectedApproval) return;
    await this.quickReject(this.selectedApproval.id);
    this.closeModal();
  }
};

function refreshApprovals() {
  ApprovalCenter.refresh();
}

function filterApprovals(type) {
  ApprovalCenter.filter(type);
}

function closeApprovalModal() {
  ApprovalCenter.closeModal();
}

function approveFromModal() {
  ApprovalCenter.approveFromModal();
}

function rejectApprovalFromModal() {
  ApprovalCenter.rejectFromModal();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  ApprovalCenter.init();
});
</script>
`;
};

// ============================================
// PREDICTIVE ROI WIDGET
// Shows budget prediction insights
// ============================================

export const predictiveROIWidget = () => {
  return `
<div id="predictive-roi-widget" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
  <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
        <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
        </svg>
      </div>
      <div>
        <h2 class="font-semibold text-gray-900">ROI Predictor</h2>
        <p class="text-gray-500 text-sm">Forecast revenue changes</p>
      </div>
    </div>
  </div>
  
  <div class="p-5">
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Budget Change</label>
        <div class="flex items-center gap-2">
          <input type="number" id="budget-change-input" value="5000" 
                 class="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
          <select id="budget-change-type" class="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
            <option value="increase">Increase</option>
            <option value="decrease">Decrease</option>
          </select>
        </div>
      </div>
      
      <button onclick="calculateROIPrediction()" class="w-full px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
        </svg>
        Calculate Prediction
      </button>
    </div>
    
    <div id="roi-prediction-result" class="hidden mt-4 p-4 bg-gray-50 rounded-xl">
      <div class="flex items-center justify-between mb-3">
        <span class="text-sm font-medium text-gray-700">Predicted Revenue</span>
        <span id="predicted-revenue" class="text-lg font-bold text-emerald-600">+$0</span>
      </div>
      <div class="flex items-center justify-between mb-3">
        <span class="text-sm font-medium text-gray-700">ROI Multiplier</span>
        <span id="roi-multiplier" class="text-lg font-bold text-indigo-600">0x</span>
      </div>
      <div class="flex items-center justify-between mb-3">
        <span class="text-sm font-medium text-gray-700">Confidence</span>
        <div class="flex items-center gap-2">
          <div class="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div id="confidence-bar" class="h-full bg-indigo-500 rounded-full" style="width: 0%"></div>
          </div>
          <span id="confidence-value" class="text-sm font-medium text-gray-600">0%</span>
        </div>
      </div>
      <div id="roi-recommendation" class="mt-3 p-3 rounded-lg text-sm"></div>
    </div>
  </div>
</div>

<script>
async function calculateROIPrediction() {
  const budgetInput = document.getElementById('budget-change-input');
  const changeType = document.getElementById('budget-change-type');
  const resultDiv = document.getElementById('roi-prediction-result');
  
  let budgetChange = parseFloat(budgetInput.value) || 0;
  if (changeType.value === 'decrease') {
    budgetChange = -budgetChange;
  }
  
  try {
    const response = await fetch('/api/v1/observability/predictions/budget', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        budgetChange,
        targetMetric: 'revenue'
      })
    });
    
    const data = await response.json();
    
    if (data.success && data.prediction) {
      const pred = data.prediction;
      
      document.getElementById('predicted-revenue').textContent = 
        (pred.predicted_impact.revenue_change >= 0 ? '+' : '') + 
        '$' + Math.abs(pred.predicted_impact.revenue_change).toLocaleString();
      
      document.getElementById('roi-multiplier').textContent = pred.roi_multiplier.toFixed(1) + 'x';
      
      document.getElementById('confidence-bar').style.width = pred.confidence_score + '%';
      document.getElementById('confidence-value').textContent = Math.round(pred.confidence_score) + '%';
      
      const recDiv = document.getElementById('roi-recommendation');
      const isPositive = pred.recommendation.includes('RECOMMENDED') && !pred.recommendation.includes('NOT');
      recDiv.className = 'mt-3 p-3 rounded-lg text-sm ' + 
        (isPositive ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-800');
      recDiv.textContent = pred.recommendation;
      
      resultDiv.classList.remove('hidden');
    }
  } catch (error) {
    console.error('Failed to calculate prediction:', error);
  }
}
</script>
`;
};
