/**
 * Tab Content Renderer Module
 * Renders content for all tabs
 * 
 * @module tab-renderer
 */

import { showLoading, showEmptyState, createCard, createGrid, createInput, createSelect, createButton } from './ui-components.js';

/**
 * Render PICO Builder
 */
export function renderPICOBuilder() {
  const container = document.getElementById('pico-builder');
  if (!container) return;
  
  container.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:12px;">
      <div style="font-size:11px;color:var(--text3);">Build your research question using the PICO framework. Each field supports multiple synonyms joined with OR.</div>
      
      ${['p', 'i', 'c', 'o'].map(letter => `
        <div class="pico-row">
          <div class="pico-label-col">
            <div class="pico-letter">${letter.toUpperCase()}</div>
            <div class="pico-letter-sub">${letter === 'p' ? 'Population' : letter === 'i' ? 'Intervention' : letter === 'c' ? 'Comparison' : 'Outcome'}</div>
          </div>
          <div class="pico-main-col">
            <div class="pico-field-label">
              ${letter === 'p' ? 'Population / Patients' : letter === 'i' ? 'Intervention / Exposure' : letter === 'c' ? 'Comparison / Control' : 'Outcome / Endpoints'}
              <div style="display:inline-flex;gap:4px;margin-left:8px;">
                <button class="pico-inner-op-btn active-or" id="inner-op-${letter}-or" onclick="setInnerOp('${letter}','OR')">OR</button>
                <button class="pico-inner-op-btn" id="inner-op-${letter}-and" onclick="setInnerOp('${letter}','AND')">AND</button>
              </div>
            </div>
            <div class="pico-terms-wrap" id="pico-terms-${letter}" onclick="document.getElementById('pico-input-${letter}').focus()">
              <input class="pico-term-input" id="pico-input-${letter}" placeholder="e.g., ${letter === 'p' ? 'diabetes, type 2 diabetes, T2DM' : letter === 'i' ? 'metformin, glucophage' : letter === 'c' ? 'placebo, standard care' : 'HbA1c, glycemic control'}… press Enter" onkeydown="picoKeydown(event,'${letter}')" oninput="updateQueryPreview()"/>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
    
    <div style="margin-top:14px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
        <div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;">🔎 Generated Search Query</div>
        <div style="display:flex;gap:6px;">
          <button class="btn btn-ghost btn-sm" onclick="copyQuery()">📋 Copy</button>
          <button class="btn btn-ghost btn-sm" onclick="clearQuery()">✕ Clear</button>
        </div>
      </div>
      <div id="query-preview" class="query-preview" contenteditable="true" spellcheck="false" style="min-height:44px;padding:8px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;font-family:var(--mono);font-size:11px;" oninput="onQueryManualEdit()"></div>
    </div>
  `;
}

/**
 * Render Search Form
 */
export function renderSearchForm() {
  const container = document.getElementById('search-form');
  if (!container) return;
  
  container.innerHTML = `
    <div class="card">
      <div class="card-title">Database Selection</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:8px 14px;border:1px solid var(--border2);border-radius:6px;background:var(--bg3);font-size:11px;font-weight:600;">
          <input type="checkbox" id="db-pubmed" checked style="width:auto;margin:0;accent-color:var(--accent)"/>
          <span style="color:#e11d48;">●</span> PubMed
        </label>
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:8px 14px;border:1px solid var(--border2);border-radius:6px;background:var(--bg3);font-size:11px;font-weight:600;">
          <input type="checkbox" id="db-europepmc" checked style="width:auto;margin:0;accent-color:var(--accent)"/>
          <span style="color:#2563eb;">●</span> Europe PMC
        </label>
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:8px 14px;border:1px solid var(--border2);border-radius:6px;background:var(--bg3);font-size:11px;font-weight:600;">
          <input type="checkbox" id="db-semantic" checked style="width:auto;margin:0;accent-color:var(--accent)"/>
          <span style="color:#7c3aed;">●</span> Semantic Scholar
        </label>
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:8px 14px;border:1px solid var(--border2);border-radius:6px;background:var(--bg3);font-size:11px;font-weight:600;">
          <input type="checkbox" id="db-doaj" checked style="width:auto;margin:0;accent-color:var(--accent)"/>
          <span style="color:#16a34a;">●</span> DOAJ
        </label>
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:8px 14px;border:1px solid var(--border2);border-radius:6px;background:var(--bg3);font-size:11px;font-weight:600;">
          <input type="checkbox" id="db-scielo" checked style="width:auto;margin:0;accent-color:var(--accent)"/>
          <span style="color:#059669;">●</span> SciELO
        </label>
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:8px 14px;border:1px solid var(--border2);border-radius:6px;background:var(--bg3);font-size:11px;font-weight:600;">
          <input type="checkbox" id="db-pmc" checked style="width:auto;margin:0;accent-color:var(--accent)"/>
          <span style="color:#0891b2;">●</span> PubMed Central
        </label>
      </div>
    </div>
    
    <div class="grid3" style="margin-top:16px;">
      ${createInput('Year From', { id: 'year-from', value: '2000', type: 'number' })}
      ${createInput('Year To', { id: 'year-to', value: '2025', type: 'number' })}
      ${createSelect('Max Results', [
        { value: '10', label: '10 per DB' },
        { value: '25', label: '25 per DB' },
        { value: '50', label: '50 per DB' },
        { value: '100', label: '100 per DB' }
      ], '25')}
    </div>
    
    <div style="margin-top:16px;display:flex;gap:8px;align-items:center;">
      <button class="btn btn-primary" onclick="runSearch()">🔍 Search All Databases</button>
      <button class="btn btn-ghost" onclick="clearSearch()">Clear</button>
      <span id="search-status" style="font-size:11px;color:var(--text3);"></span>
    </div>
  `;
}

/**
 * Render AI Extractor
 */
export function renderAIExtractor() {
  const container = document.getElementById('ai-extractor');
  if (!container) return;
  
  container.innerHTML = `
    <div style="display:flex;gap:12px;margin-bottom:16px;">
      <div style="flex:1;">
        <label style="font-size:11px;color:var(--text3);display:block;margin-bottom:4px;font-weight:600;">Paste Text from Paper</label>
        <textarea id="ai-paper-text" rows="6" placeholder="Paste abstract, results section, or data table from paper..." style="width:100%;padding:12px;border:1px solid var(--border);border-radius:6px;font-size:12px;font-family:var(--font);resize:vertical;"></textarea>
      </div>
      <div style="width:250px;">
        <label style="font-size:11px;color:var(--text3);display:block;margin-bottom:4px;font-weight:600;">Outcome Hint (Optional)</label>
        <input type="text" id="ai-outcome-hint" placeholder="e.g., HbA1c at 12 weeks" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:6px;font-size:11px;"/>
        <div style="margin-top:12px;">
          <button class="btn btn-primary" id="ai-extract-btn" onclick="runAIExtractor()" style="width:100%;">🤖 Extract Data with AI</button>
        </div>
        <div id="extractor-status" style="margin-top:8px;font-size:10px;color:var(--text3);"></div>
      </div>
    </div>
    
    <div id="ai-extract-result" style="display:none;">
      <div id="ai-extract-fields"></div>
      <div id="ai-missing-fields" style="display:none;margin-top:10px;padding:10px;background:var(--amberl);border:1px solid var(--amber);border-radius:6px;font-size:11px;color:#92400e;"></div>
      <div style="margin-top:12px;display:flex;gap:8px;">
        <button class="btn btn-success btn-sm" onclick="applyAIExtraction()">✅ Apply to Study</button>
        <button class="btn btn-ghost btn-sm" onclick="document.getElementById('ai-extract-result').style.display='none'">Cancel</button>
      </div>
    </div>
  `;
}

/**
 * Render Statistics Settings
 */
export function renderStatsSettings() {
  const container = document.getElementById('stats-settings');
  if (!container) return;
  
  container.innerHTML = `
    <div class="grid4">
      ${createSelect('Statistical Model', [
        { value: 'random', label: 'Random-effects (DL)' },
        { value: 'random-reml', label: 'Random-effects (REML)' },
        { value: 'random-pm', label: 'Random-effects (PM)' },
        { value: 'fixed', label: 'Fixed-effects (IV)' }
      ], 'random')}
      
      ${createSelect('Effect Measure', [
        { value: 'MD', label: 'Mean Difference (MD)' },
        { value: 'SMD', label: 'Standardized Mean Diff (SMD)' },
        { value: 'OR', label: 'Odds Ratio (OR)' },
        { value: 'RR', label: 'Risk Ratio (RR)' },
        { value: 'HR', label: 'Hazard Ratio (HR)' }
      ], 'MD')}
      
      ${createSelect('CI Level', [
        { value: '1.96', label: '95% CI' },
        { value: '1.645', label: '90% CI' },
        { value: '2.576', label: '99% CI' }
      ], '1.96')}
      
      <div style="display:flex;align-items:center;padding-top:24px;">
        <input type="checkbox" id="use-hksj" checked style="margin-right:8px;accent-color:var(--accent);"/>
        <label style="font-size:11px;color:var(--text2);">Use HKSJ correction</label>
      </div>
    </div>
    
    <div style="margin-top:16px;">
      <button class="btn btn-primary" onclick="runStats()">📊 Run Analysis</button>
    </div>
  `;
}

/**
 * Render Studies Table
 */
export function renderStudiesTable() {
  const container = document.getElementById('studies-table-area');
  if (!container) return;
  
  const state = window.state || { studies: [] };
  
  if (state.studies.length === 0) {
    showEmptyState(container, '📋', 'No Studies Yet', 'Add studies from Search tab or manually', 'addStudyManually()');
    return;
  }
  
  const headers = ['Active', 'Study', 'Design', 'Type', 'Data', 'RoB', 'Actions'];
  const rows = state.studies.map((s, i) => [
    `<input type="checkbox" ${s.active !== false ? 'checked' : ''} onchange="toggleStudyActive(${i},this.checked)" style="width:16px;height:16px;accent-color:var(--accent);"/>`,
    `<strong>${s.author}</strong> (${s.year})<div style="font-size:10px;color:var(--text3);">${s.journal || 'No journal'}</div>`,
    s.design || 'RCT',
    s.type || 'continuous',
    `<div style="font-size:10px;">${s.type === 'continuous' ? `N1=${s.nt||0}, N2=${s.nc||0}` : s.type === 'dichotomous' ? `E1=${s.et||0}, E2=${s.ec||0}` : 'Pre-entered'}</div>`,
    `<span style="padding:2px 6px;border-radius:3px;font-size:9px;font-weight:700;background:${s.rob?.overall === 'Low' ? 'var(--greenl)' : s.rob?.overall === 'High' ? 'var(--redl)' : 'var(--amberl)'};color:${s.rob?.overall === 'Low' ? 'var(--green)' : s.rob?.overall === 'High' ? 'var(--red)' : 'var(--amber)'};">${s.rob?.overall || 'Unclear'}</span>`,
    `<button class="btn btn-danger btn-sm" onclick="removeStudy(${i})">✕</button>`
  ]);
  
  container.innerHTML = createCard('Studies', createTable(headers, rows));
}

/**
 * Render all tab contents
 */
export function renderAllTabs() {
  renderPICOBuilder();
  renderSearchForm();
  renderAIExtractor();
  renderStatsSettings();
  renderStudiesTable();
}

export default {
  renderPICOBuilder,
  renderSearchForm,
  renderAIExtractor,
  renderStatsSettings,
  renderStudiesTable,
  renderAllTabs
};
