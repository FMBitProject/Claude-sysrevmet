/**
 * Dashboard Module
 * Dashboard rendering and activity logging
 * 
 * @module dashboard
 */

import { isRCT, isObservational } from './study-manager.js';

/**
 * Timeline events storage
 */
let timelineEvents = [];

/**
 * Log timeline event
 * @param {string} section - Section identifier
 * @param {string} title - Event title
 * @param {string} details - Event details
 */
export function logTimeline(section, title, details = '') {
  const event = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    section,
    title,
    details
  };
  
  timelineEvents.unshift(event);
  
  // Keep last 50 events
  if (timelineEvents.length > 50) {
    timelineEvents = timelineEvents.slice(0, 50);
  }
  
  // Save to localStorage
  try {
    localStorage.setItem('dashboard_timeline', JSON.stringify(timelineEvents));
  } catch(e) {}
  
  // Update UI if visible
  renderTimeline();
}

/**
 * Log search event
 */
export function logSearch(query, databases, results, dupes, yearFrom = '', yearTo = '', design = 'All') {
  logTimeline('search', 'Database Search', 
    `${results} results · ${dupes} dupes · DBs: ${databases.join(', ')} · Query: "${query.slice(0, 50)}${query.length > 50 ? '...' : ''}"`
  );
}

/**
 * Log import event
 */
export function logImport(source, total, dupes, added, files = []) {
  logTimeline('import', 'Studies Imported',
    `${added} added · ${dupes} dupes removed · Source: ${source} · Total: ${total}`
  );
}

/**
 * Log study event
 */
export function logStudy(action, studyAuthor, details = '') {
  logTimeline('study', `Study ${action}`, `${studyAuthor} ${details}`);
}

/**
 * Log statistics event
 */
export function logStats(model, measure, k, i2, pooled) {
  logTimeline('stats', 'Statistics Updated',
    `${model} · ${measure} · k=${k} · I²=${i2.toFixed(1)}% · ES=${pooled.toFixed(3)}`
  );
}

/**
 * Load timeline from localStorage
 */
export function loadTimeline() {
  try {
    const saved = localStorage.getItem('dashboard_timeline');
    if (saved) {
      timelineEvents = JSON.parse(saved);
    }
  } catch(e) {}
  return timelineEvents;
}

/**
 * Render timeline
 */
export function renderTimeline(containerId = 'dashboard-timeline') {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  loadTimeline();
  
  if (timelineEvents.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:20px;color:var(--text3);">
        <div style="font-size:32px;margin-bottom:8px;">📊</div>
        <div>No activity yet. Start by searching databases or adding studies.</div>
      </div>`;
    return;
  }
  
  const icons = {
    search: '🔍',
    import: '📥',
    study: '📄',
    stats: '📈',
    save: '💾',
    export: '📤'
  };
  
  const colors = {
    search: 'var(--accent)',
    import: 'var(--green)',
    study: 'var(--purple)',
    stats: 'var(--amber)',
    save: 'var(--teal)',
    export: 'var(--blue)'
  };
  
  container.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
      <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;">Recent Activity</div>
      <button class="btn btn-ghost btn-sm" onclick="clearTimeline()" style="font-size:10px;">Clear</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px;">
      ${timelineEvents.slice(0, 10).map(e => `
        <div style="display:flex;gap:10px;align-items:flex-start;padding:8px;background:var(--bg3);border-radius:6px;">
          <div style="font-size:16px;flex-shrink:0;">${icons[e.section] || '•'}</div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:11px;font-weight:600;color:var(--text);margin-bottom:2px;">${e.title}</div>
            <div style="font-size:10px;color:var(--text3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${e.details}</div>
            <div style="font-size:9px;color:var(--text4);margin-top:2px;">${new Date(e.timestamp).toLocaleString()}</div>
          </div>
        </div>
      `).join('')}
    </div>`;
}

/**
 * Clear timeline
 */
export function clearTimeline() {
  if (!confirm('Clear all activity history?')) return;
  timelineEvents = [];
  try {
    localStorage.removeItem('dashboard_timeline');
  } catch(e) {}
  renderTimeline();
}

/**
 * Render dashboard statistics cards
 */
export function renderDashboardCards(state, containerId = 'dashboard-stats') {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const studies = state.studies || [];
  const rctCount = studies.filter(s => isRCT(s.design || 'RCT')).length;
  const obsCount = studies.filter(s => isObservational(s.design || '')).length;
  const activeCount = studies.filter(s => s.active !== false).length;
  const includedCount = studies.filter(s => s.included !== false).length;
  
  const stats = state._lastStats;
  const gradeOutcomes = state.gradeOutcomes || [];
  
  container.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;">
      <div class="stat-box" style="background:var(--accentl);border-color:var(--accent);">
        <div class="stat-label" style="color:var(--accent);">Total Studies</div>
        <div class="stat-value" style="color:var(--accent);font-size:28px;">${studies.length}</div>
        <div class="stat-sub">${activeCount} active · ${includedCount} included</div>
      </div>
      
      <div class="stat-box" style="background:var(--greenl);border-color:var(--green);">
        <div class="stat-label" style="color:var(--green);">RCT Studies</div>
        <div class="stat-value" style="color:var(--green);font-size:28px;">${rctCount}</div>
        <div class="stat-sub">${((rctCount/studies.length*100)||0).toFixed(0)}% of total</div>
      </div>
      
      <div class="stat-box" style="background:var(--purplel);border-color:var(--purple);">
        <div class="stat-label" style="color:var(--purple);">Observational</div>
        <div class="stat-value" style="color:var(--purple);font-size:28px;">${obsCount}</div>
        <div class="stat-sub">${((obsCount/studies.length*100)||0).toFixed(0)}% of total</div>
      </div>
      
      <div class="stat-box" style="background:var(--amberl);border-color:var(--amber);">
        <div class="stat-label" style="color:var(--amber);">GRADE Outcomes</div>
        <div class="stat-value" style="color:var(--amber);font-size:28px;">${gradeOutcomes.length}</div>
        <div class="stat-sub">Certainty assessments</div>
      </div>
      
      ${stats ? `
        <div class="stat-box" style="background:var(--teall);border-color:var(--teal);">
          <div class="stat-label" style="color:var(--teal);">Pooled Effect</div>
          <div class="stat-value" style="color:var(--teal);font-size:24px;">${stats.measure === 'MD' || stats.measure === 'SMD' ? stats.pooled.toFixed(3) : Math.exp(stats.pooled).toFixed(3)}</div>
          <div class="stat-sub">${stats.measure} [${stats.ciLow.toFixed(3)}, ${stats.ciHigh.toFixed(3)}]</div>
        </div>
        
        <div class="stat-box" style="background:var(--redl);border-color:var(--red);">
          <div class="stat-label" style="color:var(--red);">Heterogeneity</div>
          <div class="stat-value" style="color:var(--red);font-size:28px;">${stats.I2?.toFixed(1) || 0}%</div>
          <div class="stat-sub">I² statistic</div>
        </div>
      ` : `
        <div class="stat-box" style="background:var(--bg3);border-color:var(--border);">
          <div class="stat-label">Statistics</div>
          <div class="stat-value" style="font-size:16px;color:var(--text3);">Run analysis to see stats</div>
          <div class="stat-sub">Go to Tab 4</div>
        </div>
      `}
    </div>`;
}

/**
 * Render eligibility dashboard card
 */
export function renderEligibilityCard(state, containerId = 'dash-eligibility-card') {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const e = state.eligibility;
  
  if (!e) {
    container.innerHTML = `
      <div style="padding:16px;text-align:center;color:var(--text3);">
        <div style="font-size:24px;margin-bottom:8px;">⚠️</div>
        <div style="font-size:11px;font-weight:600;margin-bottom:8px;">Eligibility Criteria Not Set</div>
        <button class="btn btn-primary btn-sm" onclick="showTab('tab-pico')" style="font-size:10px;">Set Criteria Now</button>
      </div>`;
    return;
  }
  
  container.innerHTML = `
    <div style="padding:12px;">
      <div style="font-size:10px;font-weight:700;color:var(--green);margin-bottom:8px;">✅ Criteria Saved</div>
      <div style="font-size:10px;color:var(--text2);margin-bottom:6px;">
        <strong>Designs:</strong> ${(e.design || []).join(', ') || '—'}
      </div>
      <div style="font-size:10px;color:var(--text2);margin-bottom:6px;">
        <strong>Population:</strong> ${e.inclPop?.slice(0, 50) || '—'}${e.inclPop?.length > 50 ? '...' : ''}
      </div>
      <div style="font-size:9px;color:var(--text4);">
        Saved: ${new Date(e.savedAt).toLocaleString()}
      </div>
    </div>`;
}

/**
 * Render search summary card
 */
export function renderSearchSummary(containerId = 'dash-search-summary') {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  loadTimeline();
  const searchEvents = timelineEvents.filter(e => e.section === 'search');
  
  if (searchEvents.length === 0) {
    container.innerHTML = `
      <div style="padding:16px;text-align:center;color:var(--text3);">
        <div style="font-size:24px;margin-bottom:8px;">🔍</div>
        <div style="font-size:11px;">No searches yet</div>
      </div>`;
    return;
  }
  
  const totalResults = searchEvents.reduce((sum, e) => {
    const match = e.details.match(/(\d+) results/);
    return sum + (match ? parseInt(match[1]) : 0);
  }, 0);
  
  container.innerHTML = `
    <div style="padding:12px;">
      <div style="font-size:10px;font-weight:700;color:var(--text3);margin-bottom:8px;">Search Activity</div>
      <div style="font-size:20px;font-weight:700;color:var(--accent);margin-bottom:4px;">${searchEvents.length}</div>
      <div style="font-size:10px;color:var(--text2);">Searches</div>
      <div style="font-size:20px;font-weight:700;color:var(--green);margin:8px 0 4px;">${totalResults.toLocaleString()}</div>
      <div style="font-size:10px;color:var(--text2);">Total Results</div>
    </div>`;
}

/**
 * Render full dashboard
 */
export function renderDashboard(state) {
  renderDashboardCards(state);
  renderTimeline();
  renderEligibilityCard(state);
  renderSearchSummary();
}

/**
 * Export dashboard data
 */
export function exportDashboardData(state) {
  loadTimeline();
  
  const studies = state.studies || [];
  const rctCount = studies.filter(s => isRCT(s.design || 'RCT')).length;
  const obsCount = studies.filter(s => isObservational(s.design || '')).length;
  
  return {
    totalStudies: studies.length,
    rctStudies: rctCount,
    observationalStudies: obsCount,
    activeStudies: studies.filter(s => s.active !== false).length,
    includedStudies: studies.filter(s => s.included !== false).length,
    gradeOutcomes: state.gradeOutcomes?.length || 0,
    lastStats: state._lastStats ? {
      measure: state._lastStats.measure,
      pooled: state._lastStats.pooled,
      ciLow: state._lastStats.ciLow,
      ciHigh: state._lastStats.ciHigh,
      i2: state._lastStats.I2,
      tau2: state._lastStats.tau2
    } : null,
    timelineEvents: timelineEvents.length,
    recentActivity: timelineEvents.slice(0, 10)
  };
}

// Load timeline on module init
loadTimeline();

export default {
  logTimeline,
  logSearch,
  logImport,
  logStudy,
  logStats,
  loadTimeline,
  renderTimeline,
  clearTimeline,
  renderDashboardCards,
  renderEligibilityCard,
  renderSearchSummary,
  renderDashboard,
  exportDashboardData
};
