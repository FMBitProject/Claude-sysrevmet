/**
 * Risk of Bias Visualization Module
 * Traffic light plots and summary visualizations for RoB assessment
 * 
 * @module rob-visual
 */

import { isObservational, isRCT } from './study-manager.js';

/**
 * RoB color configuration
 */
const ROB_COLORS = {
  'Low': { color: '#16a34a', bg: '#dcfce7', label: 'Low' },
  'Moderate': { color: '#d97706', bg: '#fef9c3', label: 'Mod' },
  'High': { color: '#dc2626', bg: '#fee2e2', label: 'High' },
  'Serious': { color: '#b45309', bg: '#fde68a', label: 'Ser' },
  'Critical': { color: '#991b1b', bg: '#fecaca', label: 'Crit' },
  'Unclear': { color: '#64748b', bg: '#f1f5f9', label: '?' },
  'NI': { color: '#94a3b8', bg: '#f1f5f9', label: 'NI' }
};

/**
 * Get RoB styling for a value
 */
export function getRobStyle(value) {
  return ROB_COLORS[value] || ROB_COLORS['Unclear'];
}

/**
 * Render traffic light symbol
 */
export function renderTrafficLight(value, showLabel = true) {
  const style = getRobStyle(value);
  const symbol = ['Low', 'Moderate', 'High', 'Unclear', 'NI'].includes(value) ? '●' : value === 'Serious' ? '▲' : '◆';
  
  return `
    <div class="traffic-light" style="display:inline-flex;flex-direction:column;align-items:center;gap:2px;padding:4px 8px;border-radius:4px;background:${style.bg};" title="${value}">
      <span class="symbol" style="font-size:18px;line-height:1;color:${style.color};">${symbol}</span>
      ${showLabel ? `<span class="label" style="font-size:8px;font-weight:700;color:${style.color};">${style.label}</span>` : ''}
    </div>
  `;
}

/**
 * Render RoB heatmap table
 * @param {Array} studies - Array of studies with RoB data
 * @param {string} robTool - RoB tool type (rob2, robins, nos, mixed)
 * @param {string} containerId - Container element ID
 * @returns {string} HTML markup
 */
export function renderRoBHeatmap(studies, robTool = 'rob2', containerId = 'rob-heatmap') {
  const container = document.getElementById(containerId);
  if (!container) return '';

  if (!studies || studies.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:40px;color:var(--text3);">
        <div style="font-size:32px;margin-bottom:8px;">📊</div>
        <div>No studies to display.</div>
      </div>`;
    return '';
  }

  // Determine domains based on tool
  let domains, domainLabels;
  
  if (robTool === 'rob2') {
    domains = ['d1', 'd2', 'd3', 'd4', 'd5', 'overall'];
    domainLabels = ['D1: Rand.', 'D2: Deviations', 'D3: Missing', 'D4: Measurement', 'D5: Reporting', 'Overall'];
  } else if (robTool === 'robins') {
    domains = ['ri1', 'ri2', 'ri3', 'ri4', 'ri5', 'ri6', 'ri7', 'overall'];
    domainLabels = ['RI1: Confounding', 'RI2: Selection', 'RI3: Classification', 'RI4: Deviations', 'RI5: Missing', 'RI6: Measurement', 'RI7: Reporting', 'Overall'];
  } else if (robTool === 'nos') {
    domains = ['nos_selection', 'nos_comparability', 'nos_outcome', 'nos_total', 'overall'];
    domainLabels = ['Selection (★)', 'Comparability (★)', 'Outcome (★)', 'Total /9', 'Overall'];
  } else { // mixed
    domains = ['_tool', 'd1_ri1', 'd2_ri2', 'd3_ri3', 'd4_ri4', 'd5_ri5', 'ri6', 'ri7', 'overall'];
    domainLabels = ['Tool', 'D1/RI1', 'D2/RI2', 'D3/RI3', 'D4/RI4', 'D5/RI5', 'RI6', 'RI7', 'Overall'];
  }

  // Build table HTML
  let html = `
    <div style="overflow-x:auto;">
      <table class="tbl" style="width:100%;font-size:11px;">
        <thead>
          <tr>
            <th style="min-width:150px;text-align:left;">Study</th>
            <th style="min-width:100px;">Design</th>
            ${domainLabels.map(d => `<th style="font-size:9px;white-space:nowrap;">${d}</th>`).join('')}
          </tr>
        </thead>
        <tbody>`;

  studies.forEach(s => {
    const effectiveTool = robTool === 'mixed' 
      ? (isRCT(s.design || 'RCT') ? 'RoB2' : 'ROBINS-I') 
      : robTool === 'rob2' ? 'RoB 2' : robTool === 'robins' ? 'ROBINS-I' : 'NOS';

    html += `<tr>
      <td style="text-align:left;"><strong>${s.author}</strong> (${s.year})</td>
      <td>${s.design || 'RCT'}</td>`;

    if (robTool === 'mixed') {
      const obs = isObservational(s.design || 'RCT');
      html += `<td class="text-xs text-mono">${effectiveTool}</td>`;
      
      if (obs) {
        html += domains.slice(2).map(d => `<td class="rob-cell">${renderTrafficLight(s.rob[d] || 'Unclear')}</td>`).join('');
      } else {
        html += domains.slice(2, 7).map(d => `<td class="rob-cell">${renderTrafficLight(s.rob[d.replace('ri', 'd')] || 'Unclear')}</td>`).join('');
        html += `<td>—</td><td>—</td>`;
      }
      html += `<td>${renderTrafficLight(s.rob.overall || 'Unclear')}</td>`;
    } else {
      domains.forEach(d => {
        const v = s.rob[d];
        if (d.includes('nos') && d !== 'overall') {
          html += `<td class="rob-cell" style="text-align:center;">${typeof v === 'number' ? v + '★' : '—'}</td>`;
        } else {
          html += `<td class="rob-cell">${renderTrafficLight(v || 'Unclear')}</td>`;
        }
      });
    }

    html += `</tr>`;
  });

  html += `</tbody></table></div>`;

  // Add domain proportion chart for rob2/robins
  if (robTool === 'rob2' || robTool === 'robins') {
    const domainKeys = robTool === 'rob2' 
      ? ['d1', 'd2', 'd3', 'd4', 'd5', 'overall']
      : ['ri1', 'ri2', 'ri3', 'ri4', 'ri5', 'ri6', 'ri7', 'overall'];
    
    const domLabels = robTool === 'rob2'
      ? ['D1: Randomisation', 'D2: Deviations', 'D3: Missing Data', 'D4: Measurement', 'D5: Sel. Reporting', 'Overall']
      : ['RI1: Confounding', 'RI2: Selection', 'RI3: Classification', 'RI4: Deviations', 'RI5: Missing Data', 'RI6: Measurement', 'RI7: Reporting', 'Overall'];

    const k = studies.length;
    html += `
      <div style="margin-top:20px;">
        <div style="font-size:11px;font-weight:600;color:var(--text3);letter-spacing:.06em;text-transform:uppercase;margin-bottom:12px;">
          Domain Proportions (n=${k} studies)
          <span style="margin-left:16px;font-weight:400;text-transform:none;letter-spacing:0;">
            <span style="color:#16a34a;">● Low</span> · 
            <span style="color:#d97706;">● Unclear/Moderate</span> · 
            <span style="color:#dc2626;">● High/Serious/Critical</span>
          </span>
        </div>`;

    domainKeys.forEach((d, i) => {
      const nLow = studies.filter(s => s.rob[d] === 'Low').length;
      const nHigh = studies.filter(s => ['High', 'Serious', 'Critical'].includes(s.rob[d])).length;
      const nUnc = k - nLow - nHigh;
      const pL = k > 0 ? Math.round((nLow / k) * 100) : 0;
      const pH = k > 0 ? Math.round((nHigh / k) * 100) : 0;
      const pU = 100 - pL - pH;

      html += `
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
          <div style="width:180px;font-size:10px;font-weight:500;color:var(--text2);text-align:right;flex-shrink:0;">${domLabels[i]}</div>
          <div style="flex:1;height:20px;background:var(--bg4);border-radius:3px;overflow:hidden;display:flex;min-width:150px;">
            ${pL > 0 ? `<div style="width:${pL}%;background:#16a34a;display:flex;align-items:center;justify-content:center;" title="${nLow} Low (${pL}%)"><span style="font-size:8px;color:white;font-weight:700;">${pL > 10 ? pL + '%' : ''}</span></div>` : ''}
            ${pU > 0 ? `<div style="width:${pU}%;background:#d97706;display:flex;align-items:center;justify-content:center;" title="${nUnc} Unclear/Moderate (${pU}%)"><span style="font-size:8px;color:white;font-weight:700;">${pU > 10 ? pU + '%' : ''}</span></div>` : ''}
            ${pH > 0 ? `<div style="width:${pH}%;background:#dc2626;display:flex;align-items:center;justify-content:center;" title="${nHigh} High/Serious (${pH}%)"><span style="font-size:8px;color:white;font-weight:700;">${pH > 10 ? pH + '%' : ''}</span></div>` : ''}
          </div>
          <div style="width:120px;font-size:9px;color:var(--text3);">
            <span style="color:#16a34a;">L:${nLow}</span> · 
            <span style="color:#d97706;">U:${nUnc}</span> · 
            <span style="color:#dc2626;">H:${nHigh}</span>
          </div>
        </div>`;
    });

    html += `</div>`;
  }

  container.innerHTML = html;
  return html;
}

/**
 * Export RoB table as HTML
 */
export function exportRoBTableHTML(studies, robTool = 'rob2') {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Risk of Bias Summary — ${robTool === 'rob2' ? 'RoB 2' : robTool === 'robins' ? 'ROBINS-I' : 'NOS'}</title>
  <style>
    body{font-family:Arial,sans-serif;max-width:1200px;margin:40px auto;font-size:12px;}
    h2{color:#1e40af;margin-bottom:20px;}
    table{width:100%;border-collapse:collapse;}
    th,td{padding:8px;border:1px solid #e2e8f0;text-align:center;}
    th{background:#f1f5f9;font-weight:600;}
    .traffic-light{display:inline-flex;flex-direction:column;align-items:center;gap:2px;padding:4px 8px;border-radius:4px;}
    .symbol{font-size:18px;line-height:1;}
    .label{font-size:8px;font-weight:700;}
  </style>
</head>
<body>
  <h2>Risk of Bias Summary — ${robTool === 'rob2' ? 'Cochrane RoB 2' : robTool === 'robins' ? 'ROBINS-I' : 'Newcastle-Ottawa Scale'}</h2>
  ${renderRoBHeatmap(studies, robTool, 'temp-container')}
  <p style="margin-top:20px;font-size:10px;color:#64748b;">
    Generated by Meta-Analysis Workspace Pro v2 — ${new Date().toLocaleDateString()}
  </p>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'risk-of-bias-summary.html';
  a.click();
  URL.revokeObjectURL(a.href);
}

/**
 * Calculate RoB domain proportions
 */
export function calculateRoBProportions(studies, robTool = 'rob2') {
  const domains = robTool === 'rob2'
    ? ['d1', 'd2', 'd3', 'd4', 'd5']
    : robTool === 'robins'
      ? ['ri1', 'ri2', 'ri3', 'ri4', 'ri5', 'ri6', 'ri7']
      : ['nos_selection', 'nos_comparability', 'nos_outcome'];

  const proportions = {};
  const k = studies.length;

  domains.forEach(d => {
    const counts = { Low: 0, Moderate: 0, High: 0, Serious: 0, Critical: 0, Unclear: 0, NI: 0 };
    studies.forEach(s => {
      const v = s.rob[d] || 'Unclear';
      if (counts[v] !== undefined) counts[v]++;
    });

    proportions[d] = {
      counts,
      percentages: {
        Low: k > 0 ? Math.round((counts.Low / k) * 100) : 0,
        Moderate: k > 0 ? Math.round((counts.Moderate / k) * 100) : 0,
        High: k > 0 ? Math.round((counts.High / k) * 100) : 0,
        Serious: k > 0 ? Math.round((counts.Serious / k) * 100) : 0,
        Critical: k > 0 ? Math.round((counts.Critical / k) * 100) : 0,
        Unclear: k > 0 ? Math.round((counts.Unclear / k) * 100) : 0,
        NI: k > 0 ? Math.round((counts.NI / k) * 100) : 0
      }
    };
  });

  return proportions;
}

export default {
  getRobStyle,
  renderTrafficLight,
  renderRoBHeatmap,
  exportRoBTableHTML,
  calculateRoBProportions
};
