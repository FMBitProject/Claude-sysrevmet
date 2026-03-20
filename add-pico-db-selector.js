/**
 * PICO Database Selector
 * Adds database selection checkboxes to PICO Boolean Builder
 * Run this after page loads
 */

(function addPicoDatabaseSelector() {
  // Check if already added
  if (document.getElementById('pico-db-selector')) {
    console.log('PICO database selector already added');
    return;
  }

  // Find the query preview section
  const queryPreview = document.getElementById('query-preview');
  if (!queryPreview) {
    console.error('Query preview not found');
    return;
  }

  // Create database selector card
  const selectorCard = document.createElement('div');
  selectorCard.id = 'pico-db-selector';
  selectorCard.className = 'card';
  selectorCard.style.cssText = 'margin-top:14px;background:var(--bg3);border:1px solid var(--border2);';
  selectorCard.innerHTML = `
    <div style="font-size:11px;font-weight:700;color:var(--text);margin-bottom:12px;">
      📊 Select Databases for PICO Search
      <span style="font-size:10px;font-weight:400;color:var(--text3);margin-left:8px;">(check databases you want to search)</span>
    </div>
    
    <!-- Core Databases -->
    <div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;">Core Databases (Q1-Q5)</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px;">
      <label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:6px 12px;border:1px solid var(--border2);border-radius:6px;background:var(--bg2);font-size:10px;font-weight:600;">
        <input type="checkbox" id="pico-db-pubmed" checked onchange="updatePicoDbCount()" style="width:auto;margin:0;accent-color:#e11d48"/>
        <span style="color:#e11d48;">●</span> PubMed
      </label>
      <label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:6px 12px;border:1px solid var(--border2);border-radius:6px;background:var(--bg2);font-size:10px;font-weight:600;">
        <input type="checkbox" id="pico-db-europepmc" checked onchange="updatePicoDbCount()" style="width:auto;margin:0;accent-color:#2563eb"/>
        <span style="color:#2563eb;">●</span> Europe PMC
      </label>
      <label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:6px 12px;border:1px solid var(--border2);border-radius:6px;background:var(--bg2);font-size:10px;font-weight:600;">
        <input type="checkbox" id="pico-db-semantic" checked onchange="updatePicoDbCount()" style="width:auto;margin:0;accent-color:#7c3aed"/>
        <span style="color:#7c3aed;">●</span> Semantic Scholar
      </label>
      <label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:6px 12px;border:1px solid var(--border2);border-radius:6px;background:var(--bg2);font-size:10px;font-weight:600;">
        <input type="checkbox" id="pico-db-crossref" onchange="updatePicoDbCount()" style="width:auto;margin:0;accent-color:#16a34a"/>
        <span style="color:#16a34a;">●</span> CrossRef
      </label>
      <label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:6px 12px;border:1px solid var(--border2);border-radius:6px;background:var(--bg2);font-size:10px;font-weight:600;">
        <input type="checkbox" id="pico-db-core" onchange="updatePicoDbCount()" style="width:auto;margin:0;accent-color:#d97706"/>
        <span style="color:#d97706;">●</span> CORE
      </label>
    </div>
    
    <!-- Additional Databases -->
    <div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;">Additional Databases (Q3-Q5 Focus)</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px;">
      <label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:6px 12px;border:1px solid var(--border2);border-radius:6px;background:var(--bg2);font-size:10px;font-weight:600;">
        <input type="checkbox" id="pico-db-doaj" checked onchange="updatePicoDbCount()" style="width:auto;margin:0;accent-color:#16a34a"/>
        <span style="color:#16a34a;">●</span> DOAJ (Q3-Q5 OA)
      </label>
      <label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:6px 12px;border:1px solid var(--border2);border-radius:6px;background:var(--bg2);font-size:10px;font-weight:600;">
        <input type="checkbox" id="pico-db-scielo" checked onchange="updatePicoDbCount()" style="width:auto;margin:0;accent-color:#059669"/>
        <span style="color:#059669;">●</span> SciELO (Latin America)
      </label>
      <label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:6px 12px;border:1px solid var(--border2);border-radius:6px;background:var(--bg2);font-size:10px;font-weight:600;">
        <input type="checkbox" id="pico-db-pmc" checked onchange="updatePicoDbCount()" style="width:auto;margin:0;accent-color:#0891b2"/>
        <span style="color:#0891b2;">●</span> PubMed Central (Full-text)
      </label>
      <label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:6px 12px;border:1px solid var(--border2);border-radius:6px;background:var(--bg2);font-size:10px;font-weight:600;">
        <input type="checkbox" id="pico-db-medrxiv" onchange="updatePicoDbCount()" style="width:auto;margin:0;accent-color:#7c3aed"/>
        <span style="color:#7c3aed;">●</span> medRxiv (Preprints)
      </label>
      <label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:6px 12px;border:1px solid var(--border2);border-radius:6px;background:var(--bg2);font-size:10px;font-weight:600;">
        <input type="checkbox" id="pico-db-jstage" onchange="updatePicoDbCount()" style="width:auto;margin:0;accent-color:#0d9488"/>
        <span style="color:#0d9488;">●</span> J-STAGE (Asian Journals)
      </label>
      <label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:6px 12px;border:1px solid var(--border2);border-radius:6px;background:var(--bg2);font-size:10px;font-weight:600;">
        <input type="checkbox" id="pico-db-base" onchange="updatePicoDbCount()" style="width:auto;margin:0;accent-color:#0284c7"/>
        <span style="color:#0284c7;">●</span> BASE (Multidisciplinary)
      </label>
      <label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:6px 12px;border:1px solid var(--border2);border-radius:6px;background:var(--bg2);font-size:10px;font-weight:600;">
        <input type="checkbox" id="pico-db-clinicaltrials" onchange="updatePicoDbCount()" style="width:auto;margin:0;accent-color:#0369a1"/>
        <span style="color:#0369a1;">●</span> ClinicalTrials.gov
      </label>
      <label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:6px 12px;border:1px solid var(--border2);border-radius:6px;background:var(--bg2);font-size:10px;font-weight:600;">
        <input type="checkbox" id="pico-db-epistemonikos" onchange="updatePicoDbCount()" style="width:auto;margin:0;accent-color:#075985"/>
        <span style="color:#075985;">●</span> Epistemonikos (Systematic Reviews)
      </label>
    </div>
    
    <!-- Quick Select Buttons -->
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;padding-top:12px;border-top:1px solid var(--border);">
      <span style="font-size:10px;color:var(--text3);font-weight:600;">Quick Select:</span>
      <button class="btn btn-ghost btn-xs" onclick="selectAllPicoDatabases()">✅ All (15 DBs)</button>
      <button class="btn btn-ghost btn-xs" onclick="selectCorePicoDatabases()">🎯 Q1-Q2 Only (5 DBs)</button>
      <button class="btn btn-ghost btn-xs" onclick="selectQ3Q5PicoDatabases()">📚 Q3-Q5 Only (8 DBs)</button>
      <button class="btn btn-ghost btn-xs" onclick="clearAllPicoDatabases()">✕ Clear All</button>
      <span id="pico-db-count" style="font-size:10px;color:var(--text3);margin-left:auto;"><strong id="pico-db-selected-count">6</strong> databases selected</span>
    </div>
    
    <div style="font-size:10px;color:var(--text3);margin-top:12px;">
      💡 <strong>Tip:</strong> For Q1-Q2 journals, use Core Databases. For Q3-Q5 journals, check DOAJ, SciELO, PubMed Central. For comprehensive search, select All!
    </div>
  `;

  // Insert after query preview
  queryPreview.parentElement.insertAdjacentElement('afterend', selectorCard);

  // Initialize count
  updatePicoDbCount();

  console.log('✅ PICO database selector added');
})();

/**
 * Update database count display
 */
function updatePicoDbCount() {
  const checkboxes = document.querySelectorAll('[id^="pico-db-"]');
  const checked = Array.from(checkboxes).filter(cb => cb.checked).length;
  const countEl = document.getElementById('pico-db-selected-count');
  if (countEl) countEl.textContent = checked;
}

/**
 * Select all 15 databases
 */
function selectAllPicoDatabases() {
  const checkboxes = document.querySelectorAll('[id^="pico-db-"]');
  checkboxes.forEach(cb => cb.checked = true);
  updatePicoDbCount();
  showToast('✅ All 15 databases selected');
}

/**
 * Select only core Q1-Q2 databases (5)
 */
function selectCorePicoDatabases() {
  const checkboxes = document.querySelectorAll('[id^="pico-db-"]');
  checkboxes.forEach(cb => cb.checked = false);
  
  // Check only core databases
  ['pico-db-pubmed', 'pico-db-europepmc', 'pico-db-semantic', 'pico-db-crossref', 'pico-db-core']
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) el.checked = true;
    });
  
  updatePicoDbCount();
  showToast('🎯 Q1-Q2 databases selected (5 DBs)');
}

/**
 * Select only Q3-Q5 databases (8)
 */
function selectQ3Q5PicoDatabases() {
  const checkboxes = document.querySelectorAll('[id^="pico-db-"]');
  checkboxes.forEach(cb => cb.checked = false);
  
  // Check only Q3-Q5 databases
  ['pico-db-doaj', 'pico-db-scielo', 'pico-db-pmc', 'pico-db-medrxiv', 'pico-db-jstage', 'pico-db-base', 'pico-db-clinicaltrials', 'pico-db-epistemonikos']
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) el.checked = true;
    });
  
  updatePicoDbCount();
  showToast('📚 Q3-Q5 databases selected (8 DBs)');
}

/**
 * Clear all database selections
 */
function clearAllPicoDatabases() {
  const checkboxes = document.querySelectorAll('[id^="pico-db-"]');
  checkboxes.forEach(cb => cb.checked = false);
  updatePicoDbCount();
  showToast('⚠ All databases cleared');
}

/**
 * Get selected PICO databases
 */
function getSelectedPicoDatabases() {
  const allDbs = [
    { id: 'pubmed', checkbox: 'pico-db-pubmed' },
    { id: 'europepmc', checkbox: 'pico-db-europepmc' },
    { id: 'semantic', checkbox: 'pico-db-semantic' },
    { id: 'crossref', checkbox: 'pico-db-crossref' },
    { id: 'core', checkbox: 'pico-db-core' },
    { id: 'doaj', checkbox: 'pico-db-doaj' },
    { id: 'scielo', checkbox: 'pico-db-scielo' },
    { id: 'pmc', checkbox: 'pico-db-pmc' },
    { id: 'medrxiv', checkbox: 'pico-db-medrxiv' },
    { id: 'jstage', checkbox: 'pico-db-jstage' },
    { id: 'base', checkbox: 'pico-db-base' },
    { id: 'clinicaltrials', checkbox: 'pico-db-clinicaltrials' },
    { id: 'epistemonikos', checkbox: 'pico-db-epistemonikos' }
  ];
  
  return allDbs
    .filter(db => {
      const el = document.getElementById(db.checkbox);
      return el && el.checked;
    })
    .map(db => db.id);
}

// Export to window
window.updatePicoDbCount = updatePicoDbCount;
window.selectAllPicoDatabases = selectAllPicoDatabases;
window.selectCorePicoDatabases = selectCorePicoDatabases;
window.selectQ3Q5PicoDatabases = selectQ3Q5PicoDatabases;
window.clearAllPicoDatabases = clearAllPicoDatabases;
window.getSelectedPicoDatabases = getSelectedPicoDatabases;
