/**
 * Eligibility Module
 * Eligibility criteria management and history
 * 
 * @module eligibility
 */

/**
 * Criteria history array
 */
if (typeof window !== 'undefined' && !window._criteriaHistory) {
  window._criteriaHistory = [];
}

/**
 * Get eligibility design selections
 */
export function getEligDesign() {
  if (typeof document === 'undefined') return [];
  const checkboxes = document.querySelectorAll('#elig-design-box input[type=checkbox]:checked');
  return Array.from(checkboxes).map(cb => cb.value);
}

/**
 * Get eligibility language selections
 */
export function getEligLang() {
  if (typeof document === 'undefined') return [];
  const checkboxes = document.querySelectorAll('#elig-language-box input[type=checkbox]:checked');
  return Array.from(checkboxes).map(cb => cb.value);
}

/**
 * Save eligibility criteria
 */
export function saveEligibility(showToast = true) {
  if (typeof document === 'undefined') return;
  
  const getVal = (id) => {
    const el = document.getElementById(id);
    return el ? (el.value || '').trim() : '';
  };

  const entry = {
    id: 'crit_' + Date.now(),
    version: (window._criteriaHistory || []).length + 1,
    design: getEligDesign(),
    language: getEligLang(),
    inclPop: getVal('elig-incl-pop'),
    exclPop: getVal('elig-excl-pop'),
    inclInt: getVal('elig-incl-int'),
    exclInt: getVal('elig-excl-int'),
    followup: getVal('elig-followup'),
    outcomeReq: getVal('elig-outcome-req'),
    otherExcl: getVal('elig-other-excl'),
    reviewType: getVal('review-type'),
    savedAt: new Date().toISOString()
  };

  // Add to history (newest first)
  window._criteriaHistory = window._criteriaHistory || [];
  window._criteriaHistory.unshift(entry);
  
  // Keep max 20 versions
  if (window._criteriaHistory.length > 20) {
    window._criteriaHistory = window._criteriaHistory.slice(0, 20);
  }

  // Re-number versions
  window._criteriaHistory.forEach((e, i) => e.version = window._criteriaHistory.length - i);

  // Update current eligibility in state
  if (typeof window !== 'undefined' && window.state) {
    window.state.eligibility = entry;
  }

  // Persist to localStorage
  try {
    const proj = JSON.parse(localStorage.getItem('meta_analysis_project') || '{}');
    proj.eligibility = entry;
    proj.criteriaHistory = window._criteriaHistory;
    localStorage.setItem('meta_analysis_project', JSON.stringify(proj));
  } catch(e) {}

  // Update UI
  renderEligibilitySummary();
  renderCriteriaHistory();

  if (showToast && typeof window !== 'undefined' && window.showToast) {
    window.showToast('✅ Eligibility criteria saved (v' + entry.version + ')');
  }
  
  return entry;
}

/**
 * Render eligibility summary panel
 */
export function renderEligibilitySummary(containerId = 'elig-summary-panel') {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const state = typeof window !== 'undefined' ? window.state : null;
  const e = state?.eligibility;
  
  if (!e) {
    container.style.display = 'none';
    return;
  }

  const row = (label, val, color) => val
    ? `<tr>
        <td style="font-weight:700;color:var(--text3);font-size:10px;padding:5px 10px;white-space:nowrap;text-transform:uppercase;width:160px;">${label}</td>
        <td style="font-size:11px;color:${color || 'var(--text2)'};padding:5px 10px;">${val}</td>
       </tr>`
    : '';

  container.style.display = 'block';
  container.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
      <div style="font-size:11px;font-weight:700;color:var(--green);">✅ Criteria saved — <span style="font-weight:400;color:var(--text3);">used in exports, report, and PRISMA checklist</span></div>
      <div style="font-size:10px;color:var(--text3);">${new Date(e.savedAt).toLocaleString()}</div>
    </div>
    <div style="overflow-x:auto;">
    <table style="width:100%;border-collapse:collapse;border:1px solid var(--border);border-radius:8px;overflow:hidden;">
      <thead>
        <tr style="background:var(--bg3);">
          <th style="font-size:10px;font-weight:700;color:var(--text3);padding:6px 10px;text-align:left;border-bottom:1px solid var(--border);text-transform:uppercase;">Criterion</th>
          <th style="font-size:10px;font-weight:700;color:var(--text3);padding:6px 10px;text-align:left;border-bottom:1px solid var(--border);text-transform:uppercase;">Value</th>
        </tr>
      </thead>
      <tbody>
        ${row('Study Designs', (e.design||[]).join(', '), 'var(--accent)')}
        ${row('Review Type', e.reviewType)}
        ${row('Language', (e.language||[]).join(', '))}
        ${row('Population Incl.', e.inclPop, 'var(--green)')}
        ${row('Population Excl.', e.exclPop, 'var(--red)')}
        ${row('Intervention Incl.', e.inclInt, 'var(--green)')}
        ${row('Intervention Excl.', e.exclInt, 'var(--red)')}
        ${row('Min. Follow-up', e.followup)}
        ${row('Required Outcome', e.outcomeReq)}
        ${row('Other Exclusions', e.otherExcl, 'var(--red)')}
      </tbody>
    </table>
    </div>
    <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;font-size:10px;color:var(--text3);">
      <span>📊 <strong>Dashboard</strong> Tab 0 — Eligibility card</span>
      <span>·</span>
      <span>📄 <strong>Report</strong> Tab 12 — Methods section</span>
      <span>·</span>
      <span>✅ <strong>PRISMA 2020</strong> checklist Item 6</span>
    </div>`;
}

/**
 * Render criteria history list
 */
export function renderCriteriaHistory(containerId = 'elig-history-list') {
  const container = document.getElementById(containerId);
  const wrap = document.getElementById('elig-history-wrap');
  const count = document.getElementById('elig-hist-count');
  
  if (!wrap || !container) return;
  
  const hist = window._criteriaHistory || [];
  
  if (!hist.length) {
    wrap.style.display = 'none';
    return;
  }
  
  wrap.style.display = 'block';
  
  if (count) {
    count.textContent = '(' + hist.length + ' version' + (hist.length > 1 ? 's' : '') + ')';
  }
  
  container.innerHTML = hist.map((e, i) => `
    <div class="criteria-hist-item ${i === 0 ? 'current' : ''}" onclick="restoreCriteriaVersion('${e.id}')" style="padding:10px;border:1px solid var(--border);border-radius:6px;margin-bottom:8px;cursor:pointer;background:${i === 0 ? 'var(--greenl)' : 'var(--bg2)'};transition:all .15s;" onmouseover="this.style.transform='translateY(-1px)';this.style.boxShadow='var(--shadow)'" onmouseout="this.style.transform='none';this.style.boxShadow='none'">
      <div style="display:flex;align-items:center;gap:8px;">
        <div class="criteria-hist-num" style="width:28px;height:28px;border-radius:5px;background:${i === 0 ? 'var(--green)' : 'var(--bg3)'};color:${i === 0 ? 'white' : 'var(--text3)'};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;">${e.version}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:11px;font-weight:600;color:var(--text);">
            ${i === 0 ? '✅ Current — ' : ''}v${e.version} · ${new Date(e.savedAt).toLocaleString()}
          </div>
          <div style="font-size:10px;color:var(--text3);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
            Designs: ${(e.design||[]).join(', ')||'—'} · Review: ${e.reviewType||'—'}
            ${e.inclPop ? ' · Pop: '+e.inclPop.slice(0,40)+'…' : ''}
          </div>
        </div>
        <button onclick="deleteCriteriaVersion('${e.id}',event)" style="flex-shrink:0;width:28px;height:28px;border-radius:5px;border:1px solid transparent;background:transparent;color:var(--text4);cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;transition:all .15s;"
          onmouseover="this.style.background='var(--red)';this.style.color='white'"
          onmouseout="this.style.background='transparent';this.style.color='var(--text4)'">🗑</button>
      </div>
    </div>`).join('');
}

/**
 * Restore criteria version to form
 */
export function restoreCriteriaVersion(id) {
  const e = (window._criteriaHistory || []).find(x => x.id === id);
  if (!e) return;
  
  if (typeof document === 'undefined') return;
  
  // Autofill all form fields from this version
  const setVal = (fieldId, val) => {
    const el = document.getElementById(fieldId);
    if (el) el.value = val || '';
  };
  
  setVal('elig-incl-pop', e.inclPop);
  setVal('elig-excl-pop', e.exclPop);
  setVal('elig-incl-int', e.inclInt);
  setVal('elig-excl-int', e.exclInt);
  setVal('elig-followup', e.followup);
  setVal('elig-outcome-req', e.outcomeReq);
  setVal('elig-other-excl', e.otherExcl);
  setVal('review-type', e.reviewType);
  
  // Restore checkboxes
  if (typeof document !== 'undefined') {
    document.querySelectorAll('#elig-design-box input[type=checkbox]').forEach(cb => {
      cb.checked = (e.design || []).includes(cb.value);
    });
    document.querySelectorAll('#elig-language-box input[type=checkbox]').forEach(cb => {
      cb.checked = (e.language || []).includes(cb.value);
    });
  }
  
  if (typeof window !== 'undefined' && window.showToast) {
    window.showToast('🔄 Criteria v' + e.version + ' restored to form. Click Save Criteria to make it current.');
  }
}

/**
 * Delete criteria version
 */
export function deleteCriteriaVersion(id, event) {
  if (event) event.stopPropagation();
  
  if (!confirm('Delete this version from history?')) return;
  
  window._criteriaHistory = (window._criteriaHistory || []).filter(x => x.id !== id);
  
  // Re-number
  window._criteriaHistory.forEach((e, i) => e.version = window._criteriaHistory.length - i);
  
  renderCriteriaHistory();
  
  // Update localStorage
  try {
    const proj = JSON.parse(localStorage.getItem('meta_analysis_project') || '{}');
    proj.criteriaHistory = window._criteriaHistory;
    localStorage.setItem('meta_analysis_project', JSON.stringify(proj));
  } catch(e) {}
  
  if (typeof window !== 'undefined' && window.showToast) {
    window.showToast('🗑️ Version deleted');
  }
}

/**
 * Restore eligibility checkboxes from saved state
 */
export function restoreEligCheckboxes() {
  if (typeof document === 'undefined') return;
  if (!window._criteriaHistory?.length) return;
  
  const latest = window._criteriaHistory[0];
  
  // Restore design checkboxes
  document.querySelectorAll('#elig-design-box input[type=checkbox]').forEach(cb => {
    cb.checked = (latest.design || []).includes(cb.value);
  });
  
  // Restore language checkboxes
  document.querySelectorAll('#elig-language-box input[type=checkbox]').forEach(cb => {
    cb.checked = (latest.language || []).includes(cb.value);
  });
}

/**
 * Load eligibility from localStorage
 */
export function loadEligibility() {
  try {
    const saved = localStorage.getItem('meta_analysis_project');
    if (saved) {
      const data = JSON.parse(saved);
      
      // Load criteria history
      if (data.criteriaHistory) {
        window._criteriaHistory = data.criteriaHistory;
      }
      
      // Load current eligibility
      if (data.eligibility && typeof window !== 'undefined' && window.state) {
        window.state.eligibility = data.eligibility;
      }
      
      return data;
    }
  } catch(e) {
    console.error('Failed to load eligibility:', e);
  }
  return null;
}

/**
 * Initialize eligibility module
 */
export function initEligibility() {
  loadEligibility();
  
  if (typeof window !== 'undefined') {
    // Restore checkboxes
    restoreEligCheckboxes();
    
    // Render summary
    if (typeof window.state !== 'undefined' && window.state.eligibility) {
      renderEligibilitySummary();
    }
    
    // Render history
    renderCriteriaHistory();
  }
}

/**
 * Export eligibility data
 */
export function exportEligibilityData() {
  return {
    current: window.state?.eligibility || null,
    history: window._criteriaHistory || [],
    versionCount: (window._criteriaHistory || []).length
  };
}

// Auto-init on module load
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEligibility);
  } else {
    setTimeout(initEligibility, 100);
  }
}

export default {
  getEligDesign,
  getEligLang,
  saveEligibility,
  renderEligibilitySummary,
  renderCriteriaHistory,
  restoreCriteriaVersion,
  deleteCriteriaVersion,
  restoreEligCheckboxes,
  loadEligibility,
  initEligibility,
  exportEligibilityData
};
