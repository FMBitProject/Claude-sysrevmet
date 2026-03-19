/**
 * GRADE Assessment Module
 * Certainty of evidence grading and Summary of Findings table
 * 
 * @module grade
 */

/**
 * GRADE certainty score mapping
 */
const CERTAINTY_MAP = {
  4: 'High',
  3: 'Moderate',
  2: 'Low',
  1: 'Very Low'
};

const CERTAINTY_COLORS = {
  'High': '#4ade80',
  'Moderate': '#84cc16',
  'Low': '#f59e0b',
  'Very Low': '#f87171'
};

/**
 * Calculate GRADE certainty score
 * @param {Object} outcome - GRADE outcome object
 * @returns {number} Certainty score (1-4)
 */
export function calcGradeScore(outcome) {
  const start = outcome.evidence_type === 'observational' ? 2 : 4;
  let score = start;

  // Downgrade domains
  if (outcome.rob === 'Serious') score -= 1;
  else if (outcome.rob === 'Very serious') score -= 2;

  if (outcome.inconsistency === 'Serious') score -= 1;
  else if (outcome.inconsistency === 'Very serious') score -= 2;

  if (outcome.indirectness === 'Serious') score -= 1;
  else if (outcome.indirectness === 'Very serious') score -= 2;

  if (outcome.imprecision === 'Serious') score -= 1;
  else if (outcome.imprecision === 'Very serious') score -= 2;

  if (outcome.pubBias === 'Strongly suspected') score -= 1;

  // Upgrade domains (observational only)
  if (outcome.evidence_type === 'observational') {
    if (outcome.upgrade_large_effect === 'large') score += 1;
    else if (outcome.upgrade_large_effect === 'very_large') score += 2;

    if (outcome.upgrade_dose_response) score += 1;
    if (outcome.upgrade_confounders) score += 1;
  }

  return Math.max(1, Math.min(4, score));
}

/**
 * Get certainty label from score
 */
export function getCertaintyLabel(score) {
  return CERTAINTY_MAP[score] || 'Uncertain';
}

/**
 * Get certainty color
 */
export function getCertaintyColor(grade) {
  return CERTAINTY_COLORS[grade] || '#94a3b8';
}

/**
 * Render GRADE outcomes list
 * @param {Array} outcomes - Array of GRADE outcome objects
 * @param {string} containerId - Container element ID
 * @returns {string} HTML markup
 */
export function renderGradeOutcomes(outcomes, containerId = 'grade-outcomes-list') {
  const container = document.getElementById(containerId);
  if (!container) return '';

  if (!outcomes || outcomes.length === 0) {
    container.innerHTML = `
      <div style="padding:12px;text-align:center;color:var(--text3);">
        <div style="font-size:32px;margin-bottom:8px;">📋</div>
        <div>No outcomes added yet.</div>
        <button class="btn btn-primary btn-sm mt8" onclick="addGradeOutcome()">+ Add Outcome</button>
      </div>`;
    return '';
  }

  const html = outcomes.map((o, i) => {
    const cert = getCertaintyLabel(calcGradeScore(o));
    const certColor = getCertaintyColor(cert);

    return `
      <div class="card" style="border-color:var(--border2);margin-bottom:12px;">
        <div class="flex-between mb8">
          <input type="text" value="${o.name || 'Outcome ' + (i + 1)}" 
            style="background:none;border:none;font-weight:600;font-size:13px;padding:0;" 
            onchange="if(window.state){window.state.gradeOutcomes[${i}].name=this.value;renderGradeOutcomes(window.state.gradeOutcomes)}"
          />
          <div class="flex">
            <span class="tag" style="font-size:12px;background:${certColor}20;color:${certColor};">${cert}</span>
            <button class="btn btn-danger btn-sm" onclick="if(window.state){window.state.gradeOutcomes.splice(${i},1);renderGradeOutcomes(window.state.gradeOutcomes)}">✕</button>
          </div>
        </div>
        
        <div class="grid2 mb8">
          <div>
            <label>Evidence type (starting point)</label>
            <select onchange="if(window.state){window.state.gradeOutcomes[${i}].evidence_type=this.value;renderGradeOutcomes(window.state.gradeOutcomes)}" style="width:100%;">
              <option value="rct" ${o.evidence_type === 'rct' ? 'selected' : ''}>RCT → High (starting point 4)</option>
              <option value="observational" ${o.evidence_type === 'observational' ? 'selected' : ''}>Observational → Low (starting point 2)</option>
            </select>
          </div>
          <div>
            <label>Outcome importance</label>
            <select onchange="if(window.state){window.state.gradeOutcomes[${i}].importance=this.value;renderGradeOutcomes(window.state.gradeOutcomes)}" style="width:100%;">
              <option value="Critical" ${o.importance === 'Critical' ? 'selected' : ''}>Critical</option>
              <option value="Important" ${o.importance === 'Important' ? 'selected' : ''}>Important</option>
              <option value="Not important" ${o.importance === 'Not important' ? 'selected' : ''}>Not important</option>
            </select>
          </div>
        </div>

        <div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;">↓ Downgrade domains</div>
        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:12px;">
          ${['rob', 'inconsistency', 'indirectness', 'imprecision'].map(d => `
            <div>
              <label style="font-size:9px;">${d.charAt(0).toUpperCase() + d.slice(1)}</label>
              <select style="font-size:10px;width:100%;" onchange="if(window.state){window.state.gradeOutcomes[${i}].${d}=this.value;renderGradeOutcomes(window.state.gradeOutcomes)}">
                <option value="Not serious" ${o[d] === 'Not serious' ? 'selected' : ''}>Not serious (0)</option>
                <option value="Serious" ${o[d] === 'Serious' ? 'selected' : ''}>Serious (−1)</option>
                <option value="Very serious" ${o[d] === 'Very serious' ? 'selected' : ''}>Very serious (−2)</option>
              </select>
            </div>`).join('')}
          <div>
            <label style="font-size:9px;">Publication bias</label>
            <select style="font-size:10px;width:100%;" onchange="if(window.state){window.state.gradeOutcomes[${i}].pubBias=this.value;renderGradeOutcomes(window.state.gradeOutcomes)}">
              <option value="Undetected" ${o.pubBias === 'Undetected' ? 'selected' : ''}>Undetected (0)</option>
              <option value="Strongly suspected" ${o.pubBias === 'Strongly suspected' ? 'selected' : ''}>Strongly suspected (−1)</option>
            </select>
          </div>
        </div>

        ${o.evidence_type === 'observational' ? `
          <div style="font-size:10px;font-weight:700;color:var(--green);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;">↑ Upgrade domains (observational only)</div>
          <div class="grid3 mb8">
            <div>
              <label style="font-size:9px;">Large effect</label>
              <select style="font-size:10px;width:100%;" onchange="if(window.state){window.state.gradeOutcomes[${i}].upgrade_large_effect=this.value;renderGradeOutcomes(window.state.gradeOutcomes)}">
                <option value="none" ${o.upgrade_large_effect === 'none' ? 'selected' : ''}>None (0)</option>
                <option value="large" ${o.upgrade_large_effect === 'large' ? 'selected' : ''}>Large (RR/OR>2 or <0.5) (+1)</option>
                <option value="very_large" ${o.upgrade_large_effect === 'very_large' ? 'selected' : ''}>Very large (>5 or <0.2) (+2)</option>
              </select>
            </div>
            <div style="display:flex;align-items:center;gap:6px;padding-top:14px;">
              <input type="checkbox" ${o.upgrade_dose_response ? 'checked' : ''} 
                onchange="if(window.state){window.state.gradeOutcomes[${i}].upgrade_dose_response=this.checked;renderGradeOutcomes(window.state.gradeOutcomes)}" 
                style="width:auto;accent-color:var(--green)"/>
              <label style="font-size:10px;">Dose-response gradient (+1)</label>
            </div>
            <div style="display:flex;align-items:center;gap:6px;padding-top:14px;">
              <input type="checkbox" ${o.upgrade_confounders ? 'checked' : ''} 
                onchange="if(window.state){window.state.gradeOutcomes[${i}].upgrade_confounders=this.checked;renderGradeOutcomes(window.state.gradeOutcomes)}" 
                style="width:auto;accent-color:var(--green)"/>
              <label style="font-size:10px;">All plausible confounders reduce effect (+1)</label>
            </div>
          </div>` : ''}

        <div class="grid4">
          <div>
            <label style="font-size:9px;">N studies</label>
            <input type="number" value="${o.n_studies || 0}" 
              onchange="if(window.state){window.state.gradeOutcomes[${i}].n_studies=this.value;renderGradeOutcomes(window.state.gradeOutcomes)}" 
              style="font-size:11px;width:100%;"/>
          </div>
          <div>
            <label style="font-size:9px;">N patients</label>
            <input type="number" value="${o.n_patients || 0}" 
              onchange="if(window.state){window.state.gradeOutcomes[${i}].n_patients=this.value;renderGradeOutcomes(window.state.gradeOutcomes)}" 
              style="font-size:11px;width:100%;"/>
          </div>
          <div>
            <label style="font-size:9px;">Effect (95% CI)</label>
            <input type="text" value="${o.ci || ''}" placeholder="e.g., HR 0.75 [0.60, 0.94]" 
              onchange="if(window.state){window.state.gradeOutcomes[${i}].ci=this.value;renderGradeOutcomes(window.state.gradeOutcomes)}" 
              style="font-size:11px;width:100%;"/>
          </div>
          <div>
            <label style="font-size:9px;">Absolute effect /1000</label>
            <input type="text" value="${o.abs_effect || ''}" placeholder="e.g., 25 fewer per 1000" 
              onchange="if(window.state){window.state.gradeOutcomes[${i}].abs_effect=this.value;renderGradeOutcomes(window.state.gradeOutcomes)}" 
              style="font-size:11px;width:100%;"/>
          </div>
        </div>
      </div>`;
  }).join('');

  container.innerHTML = html;
  return html;
}

/**
 * Render Summary of Findings table
 * @param {Array} outcomes - GRADE outcomes
 * @param {string} containerId - Table body container ID
 * @returns {string} HTML table rows
 */
export function renderSoFTable(outcomes, containerId = 'sof-tbody') {
  const container = document.getElementById(containerId);
  if (!container) return '';

  if (!outcomes || outcomes.length === 0) {
    container.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text3);padding:20px;">No outcomes in SoF table</td></tr>';
    return '';
  }

  const rows = outcomes.map(o => {
    const cert = getCertaintyLabel(calcGradeScore(o));
    const certColor = getCertaintyColor(cert);

    return `
      <tr>
        <td><strong>${o.name || '—'}</strong></td>
        <td>${o.n_studies || 0} (${o.n_patients || '—'})</td>
        <td>
          <span style="font-size:9px;padding:2px 6px;border-radius:3px;background:${o.evidence_type === 'rct' ? '#dbeafe' : '#fce7f3'};color:${o.evidence_type === 'rct' ? '#1e40af' : '#9d174d'};font-weight:600;">
            ${o.evidence_type === 'rct' ? 'RCT' : 'Observational'}
          </span>
        </td>
        <td>
          <span style="color:${certColor};font-weight:600;font-size:11px;">
            ${'●'.repeat(calcGradeScore(o))}${'○'.repeat(4 - calcGradeScore(o))} ${cert}
          </span>
        </td>
        <td class="text-mono" style="font-size:11px;">${o.ci || '—'}</td>
        <td class="text-mono" style="font-size:11px;">${o.abs_effect || '—'}</td>
        <td>${o.importance || '—'}</td>
      </tr>`;
  }).join('');

  container.innerHTML = rows;
  return rows;
}

/**
 * Add new GRADE outcome
 */
export function createGradeOutcome(name = null) {
  const index = typeof window !== 'undefined' && window.state ? window.state.gradeOutcomes.length : 0;

  return {
    id: Date.now(),
    name: name || `Outcome ${index + 1}`,
    evidence_type: 'rct',
    rob: 'Not serious',
    inconsistency: 'Not serious',
    indirectness: 'Not serious',
    imprecision: 'Not serious',
    pubBias: 'Undetected',
    upgrade_large_effect: 'none',
    upgrade_dose_response: false,
    upgrade_confounders: false,
    n_studies: 0,
    n_patients: 0,
    es: '',
    ci: '',
    importance: 'Critical',
    abs_effect: ''
  };
}

/**
 * Export GRADE data for manuscript
 */
export function exportGradeData(outcomes) {
  return outcomes.map(o => ({
    outcome: o.name,
    certainty: getCertaintyLabel(calcGradeScore(o)),
    studies: o.n_studies,
    patients: o.n_patients,
    effect: o.ci,
    absolute: o.abs_effect,
    importance: o.importance,
    design: o.evidence_type,
    downgrade: {
      rob: o.rob !== 'Not serious' ? o.rob : null,
      inconsistency: o.inconsistency !== 'Not serious' ? o.inconsistency : null,
      indirectness: o.indirectness !== 'Not serious' ? o.indirectness : null,
      imprecision: o.imprecision !== 'Not serious' ? o.imprecision : null,
      publication_bias: o.pubBias !== 'Undetected' ? o.pubBias : null
    },
    upgrade: o.evidence_type === 'observational' ? {
      large_effect: o.upgrade_large_effect !== 'none' ? o.upgrade_large_effect : null,
      dose_response: o.upgrade_dose_response || null,
      confounders: o.upgrade_confounders || null
    } : null
  }));
}

export default {
  calcGradeScore,
  getCertaintyLabel,
  getCertaintyColor,
  renderGradeOutcomes,
  renderSoFTable,
  createGradeOutcome,
  exportGradeData
};
