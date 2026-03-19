/**
 * MetaAnalysis Pro — Main Application Module
 * 
 * Central coordinator for all application modules
 */

// Import modules
import { state, TAB_LABELS, saveProject, loadProject } from './state.js';
import { makeStudyObj, initRoB, isObservational, isRCT, designCategory } from './study-manager.js';
import { getApiKey, setApiKey, callGroqAPI, extractDataFromText, saveExtractionHistory } from './ai-extractor.js';
import { runMetaAnalysis } from './statistics.js';
import { runComprehensiveSearch, deduplicateResults } from './search-engines.js';

// ===========================
// EXPORT TO WINDOW FOR HTML HANDLERS
// ===========================

// Navigation
export function showTab(id, el) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
  
  document.querySelectorAll('.tab-pill').forEach(p => p.classList.remove('active'));
  const pill = document.getElementById('pill-' + id);
  if (pill) {
    pill.classList.add('active');
    pill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
  if (el) el.classList.add('active');
  
  const crumb = document.getElementById('topbar-crumb');
  if (crumb) crumb.innerHTML = `<span>Workspace</span> / ${TAB_LABELS[id] || id}`;
  
  // Tab-specific actions
  const tabActions = {
    'tab-stats': () => window.runStats && window.runStats(),
    'tab-forest': () => window.renderForest && window.renderForest(),
    'tab-funnel': () => window.renderFunnel && window.renderFunnel(),
    'tab-sensitivity': () => window.renderSensitivity && window.renderSensitivity(),
    'tab-grade': () => window.renderGrade && window.renderGrade(),
    'tab-report': () => {
      if (window.generateMethodsText) window.generateMethodsText();
      if (window.generateResultsText) window.generateResultsText();
      if (window.renderReadinessChecklist) window.renderReadinessChecklist();
    },
    'tab-extraction': () => window.refreshAIStudySelector && window.refreshAIStudySelector(),
    'tab-aipaper': () => window.renderReadinessChecklist && window.renderReadinessChecklist(),
    'tab-dashboard': () => window.renderDashboard && window.renderDashboard()
  };
  
  if (tabActions[id]) tabActions[id]();
}

// UI Utilities
export function showToast(message, duration = 3000) {
  const toast = document.getElementById('app-toast');
  if (!toast) return;
  toast.style.display = 'flex';
  toast.style.opacity = '1';
  document.getElementById('toast-message').textContent = message;
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.style.display = 'none', 300);
  }, duration);
}

export function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const main = document.querySelector('.main');
  const topbar = document.querySelector('.topbar');
  const tabWrap = document.querySelector('.tab-scrollbar-wrap');
  
  sidebar?.classList.toggle('collapsed');
  main?.classList.toggle('sidebar-collapsed');
  topbar?.classList.toggle('sidebar-collapsed');
  tabWrap?.classList.toggle('sidebar-collapsed');
  
  localStorage.setItem('sidebar_collapsed', sidebar?.classList.contains('collapsed'));
}

export function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
}

// ===========================
// APP INITIALIZATION
// ===========================
function initApp() {
  // Load saved theme
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  // Load saved sidebar state
  const sidebarCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';
  if (sidebarCollapsed) {
    document.querySelector('.sidebar')?.classList.add('collapsed');
    document.querySelector('.main')?.classList.add('sidebar-collapsed');
    document.querySelector('.topbar')?.classList.add('sidebar-collapsed');
    document.querySelector('.tab-scrollbar-wrap')?.classList.add('sidebar-collapsed');
  }
  
  // Load zoom
  applyZoom();
  
  // Load project
  loadProject();
  
  // Initialize scroll arrows
  updateTabStripArrows();
  updateSidebarScrollBtns();
  
  // Validate localStorage JSON
  ['meta_analysis_project', 'extraction_history', 'savedStudies', 'workspace_settings'].forEach(key => {
    try {
      const val = localStorage.getItem(key);
      if (val) JSON.parse(val);
    } catch(e) {
      console.warn('Corrupt localStorage key:', key, '- removing');
      localStorage.removeItem(key);
    }
  });
  
  showToast('✅ Workspace loaded');
  console.log('MetaAnalysis Pro initialized');
}

// ===========================
// SCROLL NAVIGATION
// ===========================
function updateTabStripArrows() {
  const strip = document.getElementById('tab-scrollbar');
  const btnL = document.getElementById('tab-arr-left');
  const btnR = document.getElementById('tab-arr-right');
  if (!strip) return;
  const atLeft = strip.scrollLeft <= 2;
  const atRight = strip.scrollLeft >= strip.scrollWidth - strip.clientWidth - 2;
  if (btnL) btnL.disabled = atLeft;
  if (btnR) btnR.disabled = atRight;
}

function updateSidebarScrollBtns() {
  const nav = document.getElementById('sidebar-nav');
  const btnU = document.getElementById('nav-btn-up');
  const btnD = document.getElementById('nav-btn-down');
  if (!nav) return;
  const atTop = nav.scrollTop <= 2;
  const atBottom = nav.scrollTop >= nav.scrollHeight - nav.clientHeight - 2;
  if (btnU) btnU.disabled = atTop;
  if (btnD) btnD.disabled = atBottom;
}

function tabStripScroll(dir) {
  const strip = document.getElementById('tab-scrollbar');
  if (!strip) return;
  strip.scrollBy({ left: dir * 200, behavior: 'smooth' });
  setTimeout(updateTabStripArrows, 300);
}

function sidebarScroll(dir) {
  const nav = document.getElementById('sidebar-nav');
  if (!nav) return;
  nav.scrollBy({ top: dir === 'up' ? -180 : 180, behavior: 'smooth' });
  setTimeout(updateSidebarScrollBtns, 300);
}

function scrollToTop() {
  document.getElementById('main-content')?.scrollTo({ top: 0, behavior: 'smooth' });
}

function scrollToBottom() {
  const main = document.getElementById('main-content');
  if (main) main.scrollTo({ top: main.scrollHeight, behavior: 'smooth' });
}

// ===========================
// ZOOM CONTROL
// ===========================
let _zoomLevel = 100;

function adjustZoom(delta) {
  _zoomLevel = Math.max(75, Math.min(150, _zoomLevel + delta * 5));
  document.body.style.zoom = _zoomLevel / 100;
  document.getElementById('zoom-label').textContent = _zoomLevel + '%';
  localStorage.setItem('zoom_level', _zoomLevel);
}

function applyZoom() {
  const saved = parseInt(localStorage.getItem('zoom_level') || '100');
  _zoomLevel = saved;
  document.body.style.zoom = saved / 100;
  const label = document.getElementById('zoom-label');
  if (label) label.textContent = saved + '%';
}

// ===========================
// EXPORT FUNCTIONS TO WINDOW
// ===========================
function exportToWindow() {
  window.showTab = showTab;
  window.showToast = showToast;
  window.toggleSidebar = toggleSidebar;
  window.toggleTheme = toggleTheme;
  window.tabStripScroll = tabStripScroll;
  window.sidebarScroll = sidebarScroll;
  window.scrollToTop = scrollToTop;
  window.scrollToBottom = scrollToBottom;
  window.adjustZoom = adjustZoom;
  window.applyZoom = applyZoom;
  
  // Module functions for legacy compatibility
  window.state = state;
  window.TAB_LABELS = TAB_LABELS;
  window.saveProject = saveProject;
  window.loadProject = loadProject;
  window.makeStudyObj = makeStudyObj;
  window.initRoB = initRoB;
  window.isObservational = isObservational;
  window.isRCT = isRCT;
  window.designCategory = designCategory;
  window.getApiKey = getApiKey;
  window.setApiKey = setApiKey;
  window.callGroqAPI = callGroqAPI;
  window.extractDataFromText = extractDataFromText;
  window.saveExtractionHistory = saveExtractionHistory;
  window.runMetaAnalysis = runMetaAnalysis;
  window.runComprehensiveSearch = runComprehensiveSearch;
  window.deduplicateResults = deduplicateResults;
}

// ===========================
// INITIALIZATION
// ===========================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initApp();
    exportToWindow();
  });
} else {
  setTimeout(() => {
    initApp();
    exportToWindow();
  }, 100);
}

// Global error handler
window.addEventListener('error', (e) => {
  if (e.message.includes('JSON') || e.message.includes('Unexpected')) {
    console.error('JSON Parse Error:', e.message);
    ['meta_analysis_project', 'extraction_history', 'savedStudies', 'workspace_settings'].forEach(key => {
      try { localStorage.removeItem(key); } catch(e) {}
    });
    showToast('⚠ Corrupt data cleared. Refresh page.');
  }
});

// Export for ES Module usage
export {
  state,
  TAB_LABELS,
  makeStudyObj,
  initRoB,
  isObservational,
  isRCT,
  designCategory,
  getApiKey,
  setApiKey,
  callGroqAPI,
  extractDataFromText,
  saveExtractionHistory,
  runMetaAnalysis,
  runComprehensiveSearch
};
