/**
 * GRADE Assessment Module - Complete Implementation
 * Certainty of evidence grading and Summary of Findings table
 * 
 * @module grade-assessment
 */

/**
 * GRADE Configuration
 */
const GRADE_CONFIG = {
  startingPoints: {
    rct: 4,      // High
    observational: 2  // Low
  },
  certaintyLabels: {
    4: { label: 'High', symbol: '⊕⊕⊕⊕', color: '#16a34a' },
    3: { label: 'Moderate', symbol: '⊕⊕⊕⊝', color: '#84cc16' },
    2: { label: 'Low', symbol: '⊕⊕⊝⊝', color: '#f59e0b' },
    1: { label: 'Very Low', symbol: '⊕⊝⊝⊝', color: '#f87171' }
  },
  downgradeReasons: {
    rob: 'Risk of Bias',
    inconsistency: 'Inconsistency',
    indirectness: 'Indirectness',
    imprecision: 'Imprecision',
    publication_bias: 'Publication Bias'
  },
  upgradeReasons: {
    large_effect: 'Large Effect',
    dose_response: 'Dose-Response Gradient',
    confounders: 'All Plausible Confounders'
  }
};

/**
 * Calculate GRADE Score
 * @param {Object} outcome - GRADE outcome object
 * @returns {number} Certainty score (1-4)
 */
export function calculateGradeScore(outcome) {
  if (!outcome) return 2;

  const start = outcome.evidence_type === 'rct' ? 4 : 2;
  let score = start;

  // Downgrade domains
  if (outcome.rob === 'Serious') score -= 1;
  else if (outcome.rob === 'Very Serious') score -= 2;

  if (outcome.inconsistency === 'Serious') score -= 1;
  else if (outcome.inconsistency === 'Very Serious') score -= 2;

  if (outcome.indirectness === 'Serious') score -= 1;
  else if (outcome.indirectness === 'Very Serious') score -= 2;

  if (outcome.imprecision === 'Serious') score -= 1;
  else if (outcome.imprecision === 'Very Serious') score -= 2;

  if (outcome.publication_bias === 'Strongly Suspected') score -= 1;

  // Upgrade domains (observational only)
  if (outcome.evidence_type === 'observational') {
    if (outcome.upgrade_large_effect === 'Large') score += 1;
    else if (outcome.upgrade_large_effect === 'Very Large') score += 2;

    if (outcome.upgrade_dose_response) score += 1;
    if (outcome.upgrade_confounders) score += 1;
  }

  return Math.max(1, Math.min(4, score));
}

/**
 * Get Certainty Label
 * @param {number} score - Certainty score
 * @returns {Object} Certainty info
 */
export function getCertaintyInfo(score) {
  return GRADE_CONFIG.certaintyLabels[score] || GRADE_CONFIG.certaintyLabels[2];
}

/**
 * Create GRADE Outcome
 */
export function createGradeOutcome(name = 'New Outcome') {
  return {
    id: Date.now(),
    name,
    evidence_type: 'rct',
    rob: 'Not Serious',
    inconsistency: 'Not Serious',
    indirectness: 'Not Serious',
    imprecision: 'Not Serious',
    publication_bias: 'Not Detected',
    upgrade_large_effect: 'None',
    upgrade_dose_response: false,
    upgrade_confounders: false,
    n_studies: 0,
    n_participants: 0,
    effect_estimate: '',
    ci_lower: '',
    ci_upper: '',
    absolute_effect: '',
    importance: 'Critical',
    notes: ''
  };
}

/**
 * Render GRADE Outcomes Editor
 * @param {Array} outcomes - Array of GRADE outcomes
 * @param {string} containerId - Container element ID
 */
export function renderGradeEditor(outcomes, containerId = 'grade-editor') {
  const container = document.getElementById(containerId);
  if (!container) return null;

  if (!outcomes || outcomes.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:40px;color:#64748b;">
        <div style="font-size:32px;margin-bottom:8px;">📋</div>
        <div style="font-size:13px;font-weight:600;">No GRADE outcomes</div>
        <button onclick="addNewGradeOutcome()" style="margin-top:12px;padding:8px 16px;background:#4361ee;color:white;border:none;border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;">
          + Add Outcome
        </button>
      </div>`;
    return null;
  }

  let html = '<div style="display:flex;flex-direction:column;gap:16px;">';

  outcomes.forEach((outcome, index) => {
    const score = calculateGradeScore(outcome);
    const certainty = getCertaintyInfo(score);

    html += `
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <input type="text" value="${outcome.name}" 
            onchange="updateGradeOutcome(${index}, 'name', this.value)"
            style="flex:1;font-size:13px;font-weight:600;border:none;border-bottom:2px solid #e2e8f0;padding:4px 0;background:transparent;"/>
          <div style="display:flex;gap:8px;align-items:center;">
            <span style="padding:4px 12px;border-radius:6px;font-size:11px;font-weight:700;background:${certainty.color}20;color:${certainty.color};">
              ${certainty.symbol} ${certainty.label}
            </span>
            <button onclick="removeGradeOutcome(${index})" style="padding:4px 8px;background:#fee2e2;color:#dc2626;border:none;border-radius:4px;cursor:pointer;font-size:11px;">✕</button>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:12px;">
          <div>
            <label style="font-size:10px;color:#64748b;font-weight:600;display:block;margin-bottom:4px;">Evidence Type</label>
            <select onchange="updateGradeOutcome(${index}, 'evidence_type', this.value)"
              style="width:100%;padding:6px;border:1px solid #e2e8f0;border-radius:4px;font-size:11px;">
              <option value="rct" ${outcome.evidence_type === 'rct' ? 'selected' : ''}>RCT (High ⊕⊕⊕⊕)</option>
              <option value="observational" ${outcome.evidence_type === 'observational' ? 'selected' : ''}>Observational (Low ⊕⊕⊝⊝)</option>
            </select>
          </div>
          <div>
            <label style="font-size:10px;color:#64748b;font-weight:600;display:block;margin-bottom:4px;">N Studies</label>
            <input type="number" value="${outcome.n_studies}" 
              onchange="updateGradeOutcome(${index}, 'n_studies', parseInt(this.value)||0)"
              style="width:100%;padding:6px;border:1px solid #e2e8f0;border-radius:4px;font-size:11px;"/>
          </div>
          <div>
            <label style="font-size:10px;color:#64748b;font-weight:600;display:block;margin-bottom:4px;">N Participants</label>
            <input type="number" value="${outcome.n_participants}" 
              onchange="updateGradeOutcome(${index}, 'n_participants', parseInt(this.value)||0)"
              style="width:100%;padding:6px;border:1px solid #e2e8f0;border-radius:4px;font-size:11px;"/>
          </div>
          <div>
            <label style="font-size:10px;color:#64748b;font-weight:600;display:block;margin-bottom:4px;">Importance</label>
            <select onchange="updateGradeOutcome(${index}, 'importance', this.value)"
              style="width:100%;padding:6px;border:1px solid #e2e8f0;border-radius:4px;font-size:11px;">
              <option value="Critical" ${outcome.importance === 'Critical' ? 'selected' : ''}>Critical</option>
              <option value="Important" ${outcome.importance === 'Important' ? 'selected' : ''}>Important</option>
              <option value="Not Important" ${outcome.importance === 'Not Important' ? 'selected' : ''}>Not Important</option>
            </select>
          </div>
        </div>

        <div style="font-size:10px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Downgrade Domains</div>
        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:12px;">
          ${['rob', 'inconsistency', 'indirectness', 'imprecision', 'publication_bias'].map(domain => `
            <div>
              <label style="font-size:9px;color:#64748b;display:block;margin-bottom:4px;">${GRADE_CONFIG.downgradeReasons[domain]}</label>
              <select onchange="updateGradeOutcome(${index}, '${domain}', this.value)"
                style="width:100%;padding:4px;border:1px solid #e2e8f0;border-radius:4px;font-size:10px;">
                <option value="Not Serious" ${outcome[domain] === 'Not Serious' ? 'selected' : ''}>Not Serious (0)</option>
                <option value="Serious" ${outcome[domain] === 'Serious' ? 'selected' : ''}>Serious (-1)</option>
                <option value="Very Serious" ${outcome[domain] === 'Very Serious' ? 'selected' : ''}>Very Serious (-2)</option>
              </select>
            </div>
          `).join('')}
        </div>

        ${outcome.evidence_type === 'observational' ? `
          <div style="font-size:10px;color:#16a34a;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Upgrade Domains</div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px;">
            <div>
              <label style="font-size:9px;color:#64748b;display:block;margin-bottom:4px;">Large Effect</label>
              <select onchange="updateGradeOutcome(${index}, 'upgrade_large_effect', this.value)"
                style="width:100%;padding:4px;border:1px solid #e2e8f0;border-radius:4px;font-size:10px;">
                <option value="None" ${outcome.upgrade_large_effect === 'None' ? 'selected' : ''}>None (0)</option>
                <option value="Large" ${outcome.upgrade_large_effect === 'Large' ? 'selected' : ''}>Large RR/OR >2 (+1)</option>
                <option value="Very Large" ${outcome.upgrade_large_effect === 'Very Large' ? 'selected' : ''}>Very Large >5 (+2)</option>
              </select>
            </div>
            <div style="display:flex;align-items:center;padding-top:16px;">
              <input type="checkbox" ${outcome.upgrade_dose_response ? 'checked' : ''}
                onchange="updateGradeOutcome(${index}, 'upgrade_dose_response', this.checked)"
                style="margin-right:6px;"/>
              <label style="font-size:9px;color:#64748b;">Dose-Response (+1)</label>
            </div>
            <div style="display:flex;align-items:center;padding-top:16px;">
              <input type="checkbox" ${outcome.upgrade_confounders ? 'checked' : ''}
                onchange="updateGradeOutcome(${index}, 'upgrade_confounders', this.checked)"
                style="margin-right:6px;"/>
              <label style="font-size:9px;color:#64748b;">Plausible Confounders (+1)</label>
            </div>
          </div>
        ` : ''}

        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">
          <div>
            <label style="font-size:10px;color:#64748b;font-weight:600;display:block;margin-bottom:4px;">Effect Estimate</label>
            <input type="text" value="${outcome.effect_estimate}" 
              onchange="updateGradeOutcome(${index}, 'effect_estimate', this.value)"
              placeholder="e.g., 0.75"
              style="width:100%;padding:6px;border:1px solid #e2e8f0;border-radius:4px;font-size:11px;"/>
          </div>
          <div>
            <label style="font-size:10px;color:#64748b;font-weight:600;display:block;margin-bottom:4px;">95% CI</label>
            <input type="text" value="${outcome.ci_lower} to ${outcome.ci_upper}" 
              onchange="const val=this.value.split(' to ');updateGradeOutcome(${index}, 'ci_lower', val[0]);updateGradeOutcome(${index}, 'ci_upper', val[1]);"
              placeholder="e.g., 0.60 to 0.94"
              style="width:100%;padding:6px;border:1px solid #e2e8f0;border-radius:4px;font-size:11px;"/>
          </div>
          <div>
            <label style="font-size:10px;color:#64748b;font-weight:600;display:block;margin-bottom:4px;">Absolute Effect</label>
            <input type="text" value="${outcome.absolute_effect}" 
              onchange="updateGradeOutcome(${index}, 'absolute_effect', this.value)"
              placeholder="e.g., 25 fewer per 1000"
              style="width:100%;padding:6px;border:1px solid #e2e8f0;border-radius:4px;font-size:11px;"/>
          </div>
        </div>
      </div>
    `;
  });

  html += '</div>';
  html += `<button onclick="addNewGradeOutcome()" style="margin-top:16px;padding:10px 20px;background:#4361ee;color:white;border:none;border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;">+ Add Another Outcome</button>`;

  container.innerHTML = html;
  return container;
}

/**
 * Render Summary of Findings Table
 * @param {Array} outcomes - GRADE outcomes
 * @param {string} containerId - Container element ID
 */
export function renderSoFTable(outcomes, containerId = 'sof-table') {
  const container = document.getElementById(containerId);
  if (!container) return null;

  if (!outcomes || outcomes.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:20px;color:#64748b;">No outcomes for SoF table</div>';
    return null;
  }

  let html = `
    <table style="width:100%;border-collapse:collapse;font-size:11px;">
      <thead>
        <tr style="background:#f1f5f9;">
          <th style="padding:10px;border:1px solid #e2e8f0;text-align:left;">Outcome</th>
          <th style="padding:10px;border:1px solid #e2e8f0;text-align:center;">Studies</th>
          <th style="padding:10px;border:1px solid #e2e8f0;text-align:center;">Participants</th>
          <th style="padding:10px;border:1px solid #e2e8f0;text-align:center;">Effect (95% CI)</th>
          <th style="padding:10px;border:1px solid #e2e8f0;text-align:center;">Absolute Effect</th>
          <th style="padding:10px;border:1px solid #e2e8f0;text-align:center;">Certainty</th>
        </tr>
      </thead>
      <tbody>
  `;

  outcomes.forEach(outcome => {
    const score = calculateGradeScore(outcome);
    const certainty = getCertaintyInfo(score);

    html += `
      <tr>
        <td style="padding:10px;border:1px solid #e2e8f0;">
          <div style="font-weight:600;">${outcome.name}</div>
          <div style="font-size:9px;color:#64748b;">${outcome.importance}</div>
        </td>
        <td style="padding:10px;border:1px solid #e2e8f0;text-align:center;">${outcome.n_studies || '—'}</td>
        <td style="padding:10px;border:1px solid #e2e8f0;text-align:center;">${outcome.n_participants || '—'}</td>
        <td style="padding:10px;border:1px solid #e2e8f0;text-align:center;font-family:monospace;">
          ${outcome.effect_estimate || '—'} ${outcome.ci_lower && outcome.ci_upper ? `(${outcome.ci_lower} to ${outcome.ci_upper})` : ''}
        </td>
        <td style="padding:10px;border:1px solid #e2e8f0;text-align:center;">${outcome.absolute_effect || '—'}</td>
        <td style="padding:10px;border:1px solid #e2e8f0;text-align:center;">
          <div style="color:${certainty.color};font-weight:700;">${certainty.symbol}</div>
          <div style="font-size:9px;color:#64748b;">${certainty.label}</div>
        </td>
      </tr>
    `;
  });

  html += '</tbody></table>';
  container.innerHTML = html;
  return container;
}

/**
 * Add New GRADE Outcome
 */
export function addNewGradeOutcome() {
  const newOutcome = createGradeOutcome();
  
  // Get current outcomes from window state or create new array
  if (!window.gradeOutcomes) window.gradeOutcomes = [];
  window.gradeOutcomes.push(newOutcome);
  
  // Re-render
  if (typeof renderGradeEditor === 'function') {
    renderGradeEditor(window.gradeOutcomes, 'grade-editor');
  }
  if (typeof renderSoFTable === 'function') {
    renderSoFTable(window.gradeOutcomes, 'sof-table');
  }
}

/**
 * Update GRADE Outcome
 */
export function updateGradeOutcome(index, field, value) {
  if (!window.gradeOutcomes || !window.gradeOutcomes[index]) return;
  
  window.gradeOutcomes[index][field] = value;
  
  // Re-render to update certainty
  renderGradeEditor(window.gradeOutcomes, 'grade-editor');
  renderSoFTable(window.gradeOutcomes, 'sof-table');
}

/**
 * Remove GRADE Outcome
 */
export function removeGradeOutcome(index) {
  if (!window.gradeOutcomes) return;
  
  if (confirm('Remove this outcome?')) {
    window.gradeOutcomes.splice(index, 1);
    renderGradeEditor(window.gradeOutcomes, 'grade-editor');
    renderSoFTable(window.gradeOutcomes, 'sof-table');
  }
}

/**
 * Export GRADE Data
 */
export function exportGradeData(outcomes) {
  return outcomes.map(outcome => ({
    outcome: outcome.name,
    certainty: getCertaintyInfo(calculateGradeScore(outcome)).label,
    studies: outcome.n_studies,
    participants: outcome.n_participants,
    effect: outcome.effect_estimate,
    ci: `${outcome.ci_lower} to ${outcome.ci_upper}`,
    absolute: outcome.absolute_effect,
    importance: outcome.importance,
    evidence_type: outcome.evidence_type,
    downgrade: {
      risk_of_bias: outcome.rob !== 'Not Serious' ? outcome.rob : null,
      inconsistency: outcome.inconsistency !== 'Not Serious' ? outcome.inconsistency : null,
      indirectness: outcome.indirectness !== 'Not Serious' ? outcome.indirectness : null,
      imprecision: outcome.imprecision !== 'Not Serious' ? outcome.imprecision : null,
      publication_bias: outcome.publication_bias !== 'Not Detected' ? outcome.publication_bias : null
    },
    upgrade: outcome.evidence_type === 'observational' ? {
      large_effect: outcome.upgrade_large_effect !== 'None' ? outcome.upgrade_large_effect : null,
      dose_response: outcome.upgrade_dose_response || null,
      confounders: outcome.upgrade_confounders || null
    } : null
  }));
}

export default {
  calculateGradeScore,
  getCertaintyInfo,
  createGradeOutcome,
  renderGradeEditor,
  renderSoFTable,
  addNewGradeOutcome,
  updateGradeOutcome,
  removeGradeOutcome,
  exportGradeData
};
