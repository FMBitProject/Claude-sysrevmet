/**
 * Database UI Patcher
 * Adds 10 additional database checkboxes to the search UI
 * 
 * Run this in browser console OR include as script in index.html
 */

(function addAdditionalDatabases() {
  // Find the database selection card
  const dbCard = document.querySelector('.card-title');
  if (!dbCard || !dbCard.textContent.includes('Database Selection')) {
    console.warn('Database selection card not found');
    return;
  }
  
  const card = dbCard.parentElement;
  
  // Check if additional databases already added
  if (document.getElementById('db-doaj')) {
    console.log('Additional databases already added');
    return;
  }
  
  // Create additional databases section
  const additionalSection = document.createElement('div');
  additionalSection.innerHTML = `
    <div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;margin-top:16px;">Additional Databases (Q3-Q5 Focus)</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px;">
      <label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:8px 14px;border:1px solid var(--border2);border-radius:6px;background:var(--bg3);font-size:11px;font-weight:600;">
        <input type="checkbox" id="db-doaj" checked style="width:auto;margin:0;accent-color:var(--green)"/>
        <span style="color:#16a34a;">●</span> DOAJ (Q3-Q5 OA)
      </label>
      <label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:8px 14px;border:1px solid var(--border2);border-radius:6px;background:var(--bg3);font-size:11px;font-weight:600;">
        <input type="checkbox" id="db-scielo" checked style="width:auto;margin:0;accent-color:var(--green)"/>
        <span style="color:#059669;">●</span> SciELO (Latin America)
      </label>
      <label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:8px 14px;border:1px solid var(--border2);border-radius:6px;background:var(--bg3);font-size:11px;font-weight:600;">
        <input type="checkbox" id="db-pmc" checked style="width:auto;margin:0;accent-color:var(--green)"/>
        <span style="color:#0891b2;">●</span> PubMed Central (Full-text)
      </label>
      <label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:8px 14px;border:1px solid var(--border2);border-radius:6px;background:var(--bg3);font-size:11px;font-weight:600;">
        <input type="checkbox" id="db-medrxiv" style="width:auto;margin:0;accent-color:var(--purple)"/>
        <span style="color:#7c3aed;">●</span> medRxiv (Preprints)
      </label>
      <label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:8px 14px;border:1px solid var(--border2);border-radius:6px;background:var(--bg3);font-size:11px;font-weight:600;">
        <input type="checkbox" id="db-jstage" style="width:auto;margin:0;accent-color:var(--green)"/>
        <span style="color:#0d9488;">●</span> J-STAGE (Asian Journals)
      </label>
      <label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:8px 14px;border:1px solid var(--border2);border-radius:6px;background:var(--bg3);font-size:11px;font-weight:600;">
        <input type="checkbox" id="db-base" style="width:auto;margin:0;accent-color:var(--green)"/>
        <span style="color:#0284c7;">●</span> BASE (Multidisciplinary)
      </label>
      <label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:8px 14px;border:1px solid var(--border2);border-radius:6px;background:var(--bg3);font-size:11px;font-weight:600;">
        <input type="checkbox" id="db-clinicaltrials" style="width:auto;margin:0;accent-color:var(--green)"/>
        <span style="color:#0369a1;">●</span> ClinicalTrials.gov
      </label>
      <label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:8px 14px;border:1px solid var(--border2);border-radius:6px;background:var(--bg3);font-size:11px;font-weight:600;">
        <input type="checkbox" id="db-epistemonikos" style="width:auto;margin:0;accent-color:var(--green)"/>
        <span style="color:#075985;">●</span> Epistemonikos (Systematic Reviews)
      </label>
    </div>
    
    <div style="font-size:10px;color:var(--text3);margin-bottom:16px;">
      <strong>💡 Tip:</strong> For Q1-Q2 journals, use Core Databases. For Q3-Q5 journals, check DOAJ, SciELO, J-STAGE, and PubMed Central. For comprehensive search, check all!
    </div>
  `;
  
  // Insert after the original database checkboxes
  const originalDbSection = card.querySelector('div[style*="display:flex;gap:10px"]');
  if (originalDbSection) {
    originalDbSection.insertAdjacentElement('afterend', additionalSection.firstElementChild);
    console.log('✅ Additional databases UI added successfully');
  } else {
    console.error('Could not find original database section');
  }
})();
