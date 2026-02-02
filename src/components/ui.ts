// OWNLAY UI Component Library
// Reusable components following 8-point spacing, neutral palette

// ============================================
// KPI TILES
// ============================================
export const kpiTile = (label: string, value: string, change?: string, changePositive?: boolean, icon?: string) => `
<div class="bg-white rounded-xl p-6 border border-gray-200 card-hover transition-all">
    <div class="flex items-start justify-between mb-4">
        <span class="text-sm font-medium text-gray-500">${label}</span>
        ${icon ? `<div class="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center"><i class="fas ${icon} text-indigo-600"></i></div>` : ''}
    </div>
    <div class="flex items-end gap-3">
        <span class="text-3xl font-bold text-gray-900">${value}</span>
        ${change ? `
        <span class="flex items-center gap-1 text-sm font-medium ${changePositive ? 'text-green-600' : 'text-red-600'}">
            <i class="fas ${changePositive ? 'fa-arrow-up' : 'fa-arrow-down'} text-xs"></i>
            ${change}
        </span>` : ''}
    </div>
</div>
`

// ============================================
// INSIGHT CARDS
// ============================================
export const insightCard = (title: string, description: string, impact: string, confidence: number, actionLabel: string, type: 'opportunity' | 'warning' | 'info' = 'info') => {
    const typeStyles = {
        opportunity: { bg: 'bg-green-50', border: 'border-green-200', icon: 'fa-lightbulb', iconColor: 'text-green-600' },
        warning: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'fa-exclamation-triangle', iconColor: 'text-amber-600' },
        info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'fa-info-circle', iconColor: 'text-blue-600' }
    }
    const style = typeStyles[type]
    
    return `
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden card-hover transition-all">
        <div class="${style.bg} ${style.border} border-b px-6 py-4 flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <i class="fas ${style.icon} ${style.iconColor}"></i>
            </div>
            <span class="font-semibold text-gray-900">${title}</span>
            <span class="ml-auto text-xs font-medium text-gray-500">${confidence}% confidence</span>
        </div>
        <div class="p-6">
            <p class="text-gray-600 mb-4">${description}</p>
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <span class="text-sm text-gray-500">Potential impact:</span>
                    <span class="text-sm font-semibold text-gray-900">${impact}</span>
                </div>
                <button class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
                    ${actionLabel}
                </button>
            </div>
        </div>
    </div>
    `
}

// ============================================
// CAMPAIGN CARDS
// ============================================
export const campaignCard = (name: string, status: 'active' | 'paused' | 'draft' | 'completed', channels: string[], spend: string, conversions: string, roas: string) => {
    const statusStyles = {
        active: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
        paused: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
        draft: { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400' },
        completed: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' }
    }
    const style = statusStyles[status]
    
    return `
    <div class="bg-white rounded-xl border border-gray-200 p-6 card-hover transition-all">
        <div class="flex items-start justify-between mb-4">
            <div>
                <h3 class="font-semibold text-gray-900 mb-1">${name}</h3>
                <div class="flex items-center gap-2">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}">
                        <span class="w-1.5 h-1.5 rounded-full ${style.dot}"></span>
                        ${status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                </div>
            </div>
            <button class="p-2 text-gray-400 hover:text-gray-600"><i class="fas fa-ellipsis-vertical"></i></button>
        </div>
        <div class="flex items-center gap-2 mb-4">
            ${channels.map(ch => `<span class="w-6 h-6 rounded bg-gray-100 flex items-center justify-center" title="${ch}"><i class="fab fa-${ch.toLowerCase()} text-xs text-gray-600"></i></span>`).join('')}
        </div>
        <div class="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div>
                <p class="text-xs text-gray-500 mb-1">Spend</p>
                <p class="font-semibold text-gray-900">${spend}</p>
            </div>
            <div>
                <p class="text-xs text-gray-500 mb-1">Conversions</p>
                <p class="font-semibold text-gray-900">${conversions}</p>
            </div>
            <div>
                <p class="text-xs text-gray-500 mb-1">ROAS</p>
                <p class="font-semibold text-green-600">${roas}</p>
            </div>
        </div>
    </div>
    `
}

// ============================================
// DATA TABLES
// ============================================
export const dataTable = (headers: string[], rows: string[][], actions?: boolean) => `
<div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <div class="overflow-x-auto">
        <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                    ${headers.map(h => `<th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">${h}</th>`).join('')}
                    ${actions ? '<th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>' : ''}
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
                ${rows.map(row => `
                <tr class="hover:bg-gray-50 transition-colors">
                    ${row.map(cell => `<td class="px-6 py-4 text-sm text-gray-900">${cell}</td>`).join('')}
                    ${actions ? `
                    <td class="px-6 py-4 text-right">
                        <button class="text-gray-400 hover:text-gray-600"><i class="fas fa-edit"></i></button>
                        <button class="ml-3 text-gray-400 hover:text-red-600"><i class="fas fa-trash"></i></button>
                    </td>` : ''}
                </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
</div>
`

// ============================================
// CHART CONTAINERS
// ============================================
export const chartContainer = (id: string, title: string, subtitle?: string, height: string = '320px') => `
<div class="bg-white rounded-xl border border-gray-200 p-6">
    <div class="flex items-center justify-between mb-6">
        <div>
            <h3 class="font-semibold text-gray-900">${title}</h3>
            ${subtitle ? `<p class="text-sm text-gray-500">${subtitle}</p>` : ''}
        </div>
        <div class="flex items-center gap-2">
            <button class="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">7D</button>
            <button class="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg">30D</button>
            <button class="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">90D</button>
        </div>
    </div>
    <div style="height: ${height}">
        <canvas id="${id}"></canvas>
    </div>
</div>
`

// ============================================
// FUNNEL CHART
// ============================================
export const funnelChart = (stages: { name: string; value: number; percent: number }[]) => `
<div class="bg-white rounded-xl border border-gray-200 p-6">
    <h3 class="font-semibold text-gray-900 mb-6">Conversion Funnel</h3>
    <div class="space-y-4">
        ${stages.map((stage, i) => `
        <div class="relative">
            <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-700">${stage.name}</span>
                <span class="text-sm text-gray-500">${stage.value.toLocaleString()} (${stage.percent}%)</span>
            </div>
            <div class="h-10 bg-gray-100 rounded-lg overflow-hidden">
                <div class="h-full gradient-accent rounded-lg transition-all" style="width: ${stage.percent}%"></div>
            </div>
            ${i < stages.length - 1 ? `
            <div class="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                <i class="fas fa-chevron-down text-gray-300"></i>
            </div>` : ''}
        </div>
        `).join('')}
    </div>
</div>
`

// ============================================
// MODALS
// ============================================
export const modal = (id: string, title: string, content: string, footer: string) => `
<div id="${id}" class="fixed inset-0 z-50 hidden">
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" onclick="closeModal('${id}')"></div>
    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl animate-fadeInUp">
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">${title}</h3>
            <button onclick="closeModal('${id}')" class="p-2 text-gray-400 hover:text-gray-600">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="p-6">${content}</div>
        <div class="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            ${footer}
        </div>
    </div>
</div>
`

// ============================================
// FORMS
// ============================================
export const formInput = (label: string, name: string, type: string = 'text', placeholder?: string, required?: boolean) => `
<div class="mb-4">
    <label for="${name}" class="block text-sm font-medium text-gray-700 mb-2">${label}${required ? ' <span class="text-red-500">*</span>' : ''}</label>
    <input type="${type}" id="${name}" name="${name}" ${placeholder ? `placeholder="${placeholder}"` : ''} ${required ? 'required' : ''}
        class="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors">
</div>
`

export const formSelect = (label: string, name: string, options: { value: string; label: string }[], required?: boolean) => `
<div class="mb-4">
    <label for="${name}" class="block text-sm font-medium text-gray-700 mb-2">${label}${required ? ' <span class="text-red-500">*</span>' : ''}</label>
    <select id="${name}" name="${name}" ${required ? 'required' : ''}
        class="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors">
        <option value="">Select...</option>
        ${options.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
    </select>
</div>
`

export const formTextarea = (label: string, name: string, placeholder?: string, rows: number = 4) => `
<div class="mb-4">
    <label for="${name}" class="block text-sm font-medium text-gray-700 mb-2">${label}</label>
    <textarea id="${name}" name="${name}" rows="${rows}" ${placeholder ? `placeholder="${placeholder}"` : ''}
        class="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"></textarea>
</div>
`

// ============================================
// PROGRESS BARS
// ============================================
export const progressBar = (value: number, max: number = 100, label?: string, showPercent: boolean = true) => {
    const percent = Math.round((value / max) * 100)
    return `
    <div class="w-full">
        ${label ? `<div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">${label}</span>
            ${showPercent ? `<span class="text-sm text-gray-500">${percent}%</span>` : ''}
        </div>` : ''}
        <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div class="h-full gradient-accent rounded-full transition-all" style="width: ${percent}%"></div>
        </div>
    </div>
    `
}

// ============================================
// CONNECTOR CARD (for integrations)
// ============================================
export const connectorCard = (name: string, icon: string, description: string, connected: boolean, category: string) => `
<div class="bg-white rounded-xl border border-gray-200 p-6 card-hover transition-all">
    <div class="flex items-start gap-4 mb-4">
        <div class="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
            <i class="${icon} text-xl text-gray-700"></i>
        </div>
        <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
                <h3 class="font-semibold text-gray-900">${name}</h3>
                ${connected ? '<span class="w-2 h-2 rounded-full bg-green-500"></span>' : ''}
            </div>
            <p class="text-sm text-gray-500">${description}</p>
        </div>
    </div>
    <div class="flex items-center justify-between pt-4 border-t border-gray-100">
        <span class="text-xs font-medium text-gray-400 uppercase">${category}</span>
        <button class="px-4 py-2 ${connected ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'} text-sm font-medium rounded-lg transition-colors">
            ${connected ? 'Manage' : 'Connect'}
        </button>
    </div>
</div>
`

// ============================================
// EMPTY STATE
// ============================================
export const emptyState = (icon: string, title: string, description: string, actionLabel?: string, actionHref?: string) => `
<div class="flex flex-col items-center justify-center py-16 text-center">
    <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-6">
        <i class="fas ${icon} text-2xl text-gray-400"></i>
    </div>
    <h3 class="text-lg font-semibold text-gray-900 mb-2">${title}</h3>
    <p class="text-gray-500 max-w-sm mb-6">${description}</p>
    ${actionLabel ? `<a href="${actionHref || '#'}" class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors">${actionLabel}</a>` : ''}
</div>
`

// ============================================
// BADGES / STATUS INDICATORS
// ============================================
export const badge = (label: string, variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' = 'neutral') => {
    const variants = {
        success: 'bg-green-100 text-green-700',
        warning: 'bg-amber-100 text-amber-700',
        danger: 'bg-red-100 text-red-700',
        info: 'bg-blue-100 text-blue-700',
        neutral: 'bg-gray-100 text-gray-700'
    }
    return `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${variants[variant]}">${label}</span>`
}

// ============================================
// TABS
// ============================================
export const tabs = (items: { id: string; label: string; active?: boolean }[]) => `
<div class="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
    ${items.map(item => `
    <button data-tab="${item.id}" class="px-4 py-2 text-sm font-medium rounded-lg transition-colors ${item.active ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}">
        ${item.label}
    </button>
    `).join('')}
</div>
`

// ============================================
// ASSET MANAGER PLACEHOLDER
// ============================================
export const assetManager = () => `
<div class="bg-white rounded-xl border border-gray-200 p-6">
    <div class="flex items-center justify-between mb-6">
        <h3 class="font-semibold text-gray-900">Assets</h3>
        <button class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
            <i class="fas fa-upload mr-2"></i>Upload
        </button>
    </div>
    <div class="grid grid-cols-4 gap-4">
        <div class="aspect-square bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors border-2 border-dashed border-gray-300">
            <i class="fas fa-plus text-gray-400"></i>
        </div>
        <div class="aspect-square bg-gray-200 rounded-lg overflow-hidden relative group cursor-pointer">
            <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button class="p-2 bg-white rounded-lg text-gray-700"><i class="fas fa-eye"></i></button>
                <button class="p-2 bg-white rounded-lg text-gray-700"><i class="fas fa-trash"></i></button>
            </div>
            <div class="w-full h-full flex items-center justify-center text-gray-400">
                <i class="fas fa-image text-2xl"></i>
            </div>
        </div>
        <div class="aspect-square bg-gray-200 rounded-lg overflow-hidden relative group cursor-pointer">
            <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button class="p-2 bg-white rounded-lg text-gray-700"><i class="fas fa-eye"></i></button>
                <button class="p-2 bg-white rounded-lg text-gray-700"><i class="fas fa-trash"></i></button>
            </div>
            <div class="w-full h-full flex items-center justify-center text-gray-400">
                <i class="fas fa-video text-2xl"></i>
            </div>
        </div>
        <div class="aspect-square bg-gray-200 rounded-lg overflow-hidden relative group cursor-pointer">
            <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button class="p-2 bg-white rounded-lg text-gray-700"><i class="fas fa-eye"></i></button>
                <button class="p-2 bg-white rounded-lg text-gray-700"><i class="fas fa-trash"></i></button>
            </div>
            <div class="w-full h-full flex items-center justify-center text-gray-400">
                <i class="fas fa-file-pdf text-2xl"></i>
            </div>
        </div>
    </div>
</div>
`

// ============================================
// WYSIWYG EDITOR PLACEHOLDER
// ============================================
export const wysiwygEditor = (id: string, placeholder: string = 'Start writing...') => `
<div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <div class="flex items-center gap-1 p-3 border-b border-gray-200 bg-gray-50">
        <button class="p-2 text-gray-600 hover:bg-gray-200 rounded"><i class="fas fa-bold"></i></button>
        <button class="p-2 text-gray-600 hover:bg-gray-200 rounded"><i class="fas fa-italic"></i></button>
        <button class="p-2 text-gray-600 hover:bg-gray-200 rounded"><i class="fas fa-underline"></i></button>
        <div class="w-px h-6 bg-gray-300 mx-1"></div>
        <button class="p-2 text-gray-600 hover:bg-gray-200 rounded"><i class="fas fa-list-ul"></i></button>
        <button class="p-2 text-gray-600 hover:bg-gray-200 rounded"><i class="fas fa-list-ol"></i></button>
        <div class="w-px h-6 bg-gray-300 mx-1"></div>
        <button class="p-2 text-gray-600 hover:bg-gray-200 rounded"><i class="fas fa-link"></i></button>
        <button class="p-2 text-gray-600 hover:bg-gray-200 rounded"><i class="fas fa-image"></i></button>
        <button class="p-2 text-gray-600 hover:bg-gray-200 rounded"><i class="fas fa-code"></i></button>
    </div>
    <div id="${id}" class="p-4 min-h-[200px]" contenteditable="true" data-placeholder="${placeholder}">
        <p class="text-gray-400">${placeholder}</p>
    </div>
</div>
`
