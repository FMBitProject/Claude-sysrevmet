/**
 * Navigation Module
 * Centralized tab navigation, sidebar rendering, and breadcrumb management
 * 
 * @module navigation
 */

import { TAB_LABELS } from './state.js';

/**
 * Tab configuration
 */
const TABS = [
  { id: 'tab-dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'tab-pico', label: 'PICO & Eligibility', icon: '🎯' },
  { id: 'tab-search', label: 'Search', icon: '🔍' },
  { id: 'tab-extraction', label: 'Extraction', icon: '📋' },
  { id: 'tab-forest', label: 'Forest Plot', icon: '🌲' },
  { id: 'tab-funnel', label: 'Funnel Plot', icon: '📈' },
  { id: 'tab-grade', label: 'GRADE', icon: '🎯' },
  { id: 'tab-rob', label: 'Risk of Bias', icon: '⚠️' },
  { id: 'tab-prisma', label: 'PRISMA', icon: '📊' },
  { id: 'tab-stats', label: 'Statistics', icon: '📊' },
  { id: 'tab-export', label: 'Export', icon: '📤' }
];

/**
 * Initialize navigation
 */
export function initNavigation() {
  renderSidebar();
  renderTabPills();
  setupEventListeners();
  
  // Show dashboard by default
  showTab('tab-dashboard');
}

/**
 * Render sidebar navigation
 */
function renderSidebar() {
  const nav = document.getElementById('sidebar-nav');
  if (!nav) return;
  
  nav.innerHTML = TABS.map((tab, index) => `
    <div class="nav-item" data-tab="${tab.id}" onclick="handleNavClick('${tab.id}')">
      <span class="nav-icon">${tab.icon}</span>
      <span class="nav-label">${tab.label}</span>
      <span class="nav-num">${index + 1}</span>
    </div>
  `).join('');
}

/**
 * Render tab pills in top scrollbar
 */
function renderTabPills() {
  const scrollbar = document.getElementById('tab-scrollbar');
  if (!scrollbar) return;
  
  scrollbar.innerHTML = TABS.map((tab, index) => `
    <button class="tab-pill" id="pill-${tab.id}" onclick="showTab('${tab.id}')">
      <span class="tab-pill-num">${index + 1}</span>
      <span>${tab.label}</span>
    </button>
  `).join('');
}

/**
 * Show specific tab
 * @param {string} tabId - Tab ID to show
 */
export function showTab(tabId) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Remove active from all nav items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  
  // Remove active from all tab pills
  document.querySelectorAll('.tab-pill').forEach(pill => {
    pill.classList.remove('active');
  });
  
  // Show selected tab
  const selectedTab = document.getElementById(tabId);
  if (selectedTab) {
    selectedTab.classList.add('active');
  }
  
  // Activate nav item
  const navItem = document.querySelector(`[data-tab="${tabId}"]`);
  if (navItem) {
    navItem.classList.add('active');
  }
  
  // Activate tab pill
  const pill = document.getElementById(`pill-${tabId}`);
  if (pill) {
    pill.classList.add('active');
    pill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
  
  // Update breadcrumb
  updateBreadcrumb(tabId);
  
  // Trigger tab-specific renders
  triggerTabActions(tabId);
  
  // Scroll to top
  const main = document.getElementById('main-content');
  if (main) {
    main.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

/**
 * Update breadcrumb
 */
function updateBreadcrumb(tabId) {
  const tab = TABS.find(t => t.id === tabId);
  const crumb = document.getElementById('topbar-crumb');
  const currentTabEl = document.getElementById('current-tab');
  
  if (crumb) {
    crumb.innerHTML = `<span>Workspace</span> / ${tab?.label || 'Dashboard'}`;
  }
  
  if (currentTabEl) {
    currentTabEl.textContent = tab?.label || 'Dashboard';
  }
}

/**
 * Trigger actions when tab is shown
 */
function triggerTabActions(tabId) {
  // Tab-specific render functions
  const actions = {
    'tab-dashboard': () => {
      if (typeof window.renderDashboard === 'function' && window.state) {
        window.renderDashboard(window.state);
      }
    },
    'tab-forest': () => {
      if (typeof window.renderForestPlot === 'function' && window.state?._lastStats) {
        window.renderForestPlot(window.state._lastStats, 'forest-plot');
      }
    },
    'tab-funnel': () => {
      if (typeof window.renderFunnelPlot === 'function' && window.state?._lastStats) {
        window.renderFunnelPlot(window.state._lastStats, 'funnel-plot');
      }
    },
    'tab-grade': () => {
      if (typeof window.renderGradeEditor === 'function') {
        const outcomes = window.state?.gradeOutcomes || [];
        window.renderGradeEditor(outcomes, 'grade-editor');
        window.renderSoFTable(outcomes, 'sof-table');
      }
    },
    'tab-rob': () => {
      if (typeof window.renderRoBHeatmap === 'function' && window.state?.studies) {
        window.renderRoBHeatmap(window.state.studies, window.state.robTool || 'rob2', 'rob-heatmap');
      }
    },
    'tab-prisma': () => {
      if (typeof window.renderPrismaFlow === 'function') {
        const prismaData = window.getPrismaDataFromState?.() || {};
        window.renderPrismaFlow(prismaData, 'prisma-diagram');
      }
    },
    'tab-stats': () => {
      if (typeof window.runStats === 'function') {
        window.runStats();
      }
    }
  };
  
  // Execute action if exists
  if (actions[tabId]) {
    setTimeout(actions[tabId], 100);
  }
}

/**
 * Handle navigation click
 */
window.handleNavClick = function(tabId) {
  showTab(tabId);
};

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + 1-9 to switch tabs
    if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '9') {
      const tabIndex = parseInt(e.key) - 1;
      if (TABS[tabIndex]) {
        showTab(TABS[tabIndex].id);
        e.preventDefault();
      }
    }
  });
  
  // Handle browser back/forward
  window.addEventListener('popstate', () => {
    const tabId = new URLSearchParams(window.location.search).get('tab') || 'tab-dashboard';
    showTab(tabId);
  });
}

/**
 * Update URL with current tab
 */
function updateURL(tabId) {
  const url = new URL(window.location);
  url.searchParams.set('tab', tabId);
  window.history.pushState({ tab: tabId }, '', url);
}

/**
 * Get current tab
 */
export function getCurrentTab() {
  const activeTab = document.querySelector('.tab-content.active');
  return activeTab?.id || 'tab-dashboard';
}

/**
 * Refresh current tab
 */
export function refreshCurrentTab() {
  const tabId = getCurrentTab();
  triggerTabActions(tabId);
}

export default {
  initNavigation,
  showTab,
  getCurrentTab,
  refreshCurrentTab
};
