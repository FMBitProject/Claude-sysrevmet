/**
 * Legacy Compatibility Layer
 * 
 * This file contains all the original JavaScript functions from index.html
 * that need to be migrated to the modular structure.
 * 
 * TODO: Migrate these functions to appropriate ES modules
 */

// ===========================
// STATE & GLOBALS
// ===========================
let state = {
  pico: { p:'', i:'', c:'', o:'' },
  prospero: '',
  studies: [],
  eligibility: null,
  robTool: 'rob2',
  prisma: {},
  exclusionReasons: [
    {id:1,text:'Wrong Population',n:0},{id:2,text:'Wrong Intervention/Exposure',n:0},
    {id:3,text:'Wrong Outcome',n:0},{id:4,text:'Wrong Study Design',n:0},{id:5,text:'Insufficient Data',n:0}
  ],
  gradeOutcomes: [],
  statModel: 'random',
  effectMeasure: 'MD',
  ciZ: 1.96,
  _lastStats: null
};

const TAB_LABELS = {
  'tab-pico': 'PICO',
  'tab-search': 'Search',
  'tab-extraction': 'Extraction',
  'tab-forest': 'Forest Plot',
  'tab-funnel': 'Funnel Plot',
  'tab-stats': 'Statistics',
  'tab-grade': 'GRADE',
  'tab-report': 'Report',
  'tab-aipaper': 'AI Paper',
  'tab-dashboard': 'Dashboard'
};

// ===========================
// UTILITY FUNCTIONS
// ===========================
function isObservational(design) {
  return ['Cohort-Prospective','Cohort-Retrospective','Case-Control','Nested-CC','Case-Cohort','Cross-sectional','Registry','Case-series','Cross-sectional-desc'].includes(design);
}

function isRCT(design) {
  return ['RCT','Quasi-RCT','Cluster-RCT','Crossover'].includes(design);
}

function designCategory(design) {
  if (isRCT(design)) return 'RCT';
  if (isObservational(design)) return 'Observational';
  return 'Other';
}

function designBadgeHtml(design) {
  const cat = designCategory(design);
  const cls = cat==='RCT' ? 'design-rct' : 'design-obs';
  return `<span class="tag ${cls}" style="font-size:9px;">${design||'RCT'}</span>`;
}

function isTimeToEvent(measure) { return measure==='HR'||measure==='IRR'; }
function isLogScale(measure) { return ['OR','RR','HR','IRR'].includes(measure); }

// ===========================
// NAVIGATION
// ===========================
function showTab(id, el) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  
  document.querySelectorAll('.tab-pill').forEach(p => p.classList.remove('active'));
  const pill = document.getElementById('pill-' + id);
  if (pill) {
    pill.classList.add('active');
    pill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
  if(el) el.classList.add('active');
  
  const crumb = document.getElementById('topbar-crumb');
  if(crumb) crumb.innerHTML = `<span>Workspace</span> / ${TAB_LABELS[id]||id}`;
  
  if (id==='tab-stats') runStats();
  if (id==='tab-forest') renderForest();
  if (id==='tab-funnel') renderFunnel();
  if (id==='tab-sensitivity') renderSensitivity();
  if (id==='tab-grade') renderGrade();
  if (id==='tab-report') { generateMethodsText(); generateResultsText(); renderReadinessChecklist(); }
  if (id==='tab-extraction') refreshAIStudySelector();
  if (id==='tab-aipaper') renderReadinessChecklist();
  if (id==='tab-nma') { /* NMA is triggered manually */ }
  if (id==='tab-dashboard') renderDashboard();
}

// ===========================
// TOAST NOTIFICATIONS
// ===========================
function showToast(message, duration = 3000) {
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

// ===========================
// SIDEBAR & THEME
// ===========================
function toggleSidebar() {
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

function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
}

// ===========================
// SCROLL NAVIGATION
// ===========================
function tabStripScroll(dir) {
  const strip = document.getElementById('tab-scrollbar');
  if (!strip) return;
  strip.scrollBy({ left: dir * 200, behavior: 'smooth' });
  setTimeout(updateTabStripArrows, 300);
}

function updateTabStripArrows() {
  const strip = document.getElementById('tab-scrollbar');
  const btnL  = document.getElementById('tab-arr-left');
  const btnR  = document.getElementById('tab-arr-right');
  if (!strip) return;
  const atLeft  = strip.scrollLeft <= 2;
  const atRight = strip.scrollLeft >= strip.scrollWidth - strip.clientWidth - 2;
  if (btnL) btnL.disabled = atLeft;
  if (btnR) btnR.disabled = atRight;
}

function sidebarScroll(dir) {
  const nav = document.getElementById('sidebar-nav');
  if (!nav) return;
  nav.scrollBy({ top: dir === 'up' ? -180 : 180, behavior: 'smooth' });
  setTimeout(updateSidebarScrollBtns, 300);
}

function updateSidebarScrollBtns() {
  const nav  = document.getElementById('sidebar-nav');
  const btnU = document.getElementById('nav-btn-up');
  const btnD = document.getElementById('nav-btn-down');
  if (!nav) return;
  const atTop    = nav.scrollTop <= 2;
  const atBottom = nav.scrollTop >= nav.scrollHeight - nav.clientHeight - 2;
  if (btnU) btnU.disabled = atTop;
  if (btnD) btnD.disabled = atBottom;
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
// STUDY MANAGEMENT
// ===========================
function makeStudyObj(overrides) {
  return {
    id: overrides.id || 's_'+Date.now()+'_'+Math.random().toString(36).slice(2),
    pmid:'', doi:'', title:'No title', author:'N/A', year:'N/A', journal:'', abstract:'', source_db:'', url:'',
    design: 'RCT',
    type: 'continuous',
    rob: initRoB(false),
    nt:'', mt:'', sdt:'', nc:'', mc:'', sdc:'',
    et:'', tt:'', ec:'', tc:'',
    preEntered_es:'', preEntered_ciL:'', preEntered_ciH:'',
    n_total: 0, included: false, active: true,
    ...overrides
  };
}

function initRoB(isObs) {
  return {
    d1:'Unclear', d2:'Unclear', d3:'Unclear', d4:'Unclear', d5:'Unclear',
    ri1:'Moderate', ri2:'Moderate', ri3:'Moderate', ri4:'Moderate', ri5:'Moderate', ri6:'Moderate', ri7:'Moderate',
    nos_selection:0, nos_comparability:0, nos_outcome:0, nos_total:0,
    overall: isObs ? 'Moderate' : 'Unclear'
  };
}

// ===========================
// PROJECT SAVE/LOAD
// ===========================
function saveProject() {
  try {
    localStorage.setItem('meta_analysis_project', JSON.stringify({
      state,
      timestamp: new Date().toISOString()
    }));
    showToast('✅ Project saved');
    updateAutosaveIndicator(true);
  } catch(e) {
    console.error('Save failed:', e);
    showToast('❌ Save failed');
  }
}

function loadProject() {
  try {
    const saved = localStorage.getItem('meta_analysis_project');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.state) {
        state = { ...state, ...data.state };
      }
      showToast('✅ Project loaded');
      return data;
    }
  } catch(e) {
    console.error('Load failed:', e);
  }
  return null;
}

function updateAutosaveIndicator(saved) {
  const dot = document.getElementById('autosave-dot');
  const text = document.getElementById('autosave-text');
  if (saved) {
    dot?.classList.add('saved');
    if (text) text.textContent = 'Saved';
  } else {
    dot?.classList.remove('saved');
    if (text) text.textContent = 'Saving...';
  }
}

function resetWorkspace() {
  if (!confirm('⚠️ Reset entire workspace? This will delete all studies, settings, and results.')) return;
  if (!confirm('⚠️ Are you sure? This cannot be undone.')) return;
  
  localStorage.removeItem('meta_analysis_project');
  location.reload();
}

// ===========================
// EXPORT FUNCTIONS (Stubs)
// ===========================
function exportReport() {
  showToast('📤 Export functionality - implement from original code');
}

// ===========================
// INITIALIZATION
// ===========================
(function init() {
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
  
  console.log('MetaAnalysis Pro initialized');
})();

// Global error handler
window.addEventListener('error', (e) => {
  if (e.message.includes('JSON') || e.message.includes('Unexpected')) {
    console.error('JSON Parse Error:', e.message);
    ['meta_analysis_project', 'extraction_history', 'savedStudies', 'workspace_settings'].forEach(key => {
      try { localStorage.removeItem(key); } catch(e){}
    });
    showToast('⚠ Corrupt data cleared. Refresh page.');
  }
});
