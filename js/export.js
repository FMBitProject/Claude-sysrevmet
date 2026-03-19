/**
 * Export Module
 * Export functions for HTML, CSV, JSON, and PRISMA checklist
 * 
 * @module export
 */

import { isObservational, isRCT, designCategory } from './study-manager.js';

/**
 * Export project as JSON
 */
export function exportJSON(state) {
  const data = { ...state, _lastStats: undefined };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `meta-analysis-project-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

/**
 * Export studies data as CSV
 */
export function exportCSV(studies) {
  if (!studies || studies.length === 0) {
    alert('No studies to export.');
    return;
  }

  const headers = [
    'Author', 'Year', 'Journal', 'PMID', 'DOI', 'Design', 'DesignCategory', 'OutcomeType',
    'n1', 'mean1', 'sd1', 'n2', 'mean2', 'sd2',
    'events1', 'total1', 'events2', 'total2',
    'preEntered_es', 'preEntered_ciL', 'preEntered_ciH',
    'RoB_D1', 'RoB_D2', 'RoB_D3', 'RoB_D4', 'RoB_D5',
    'ROBINS_RI1', 'ROBINS_RI2', 'ROBINS_RI3', 'ROBINS_RI4', 'ROBINS_RI5', 'ROBINS_RI6', 'ROBINS_RI7',
    'NOS_Selection', 'NOS_Comparability', 'NOS_Outcome', 'RoB_Overall'
  ];

  const rows = studies.map(s => [
    s.author, s.year, s.journal, s.pmid, s.doi, s.design || 'RCT', designCategory(s.design || 'RCT'), s.type,
    s.nt, s.mt, s.sdt, s.nc, s.mc, s.sdc,
    s.et, s.tt, s.ec, s.tc,
    s.preEntered_es, s.preEntered_ciL, s.preEntered_ciH,
    s.rob.d1, s.rob.d2, s.rob.d3, s.rob.d4, s.rob.d5,
    s.rob.ri1, s.rob.ri2, s.rob.ri3, s.rob.ri4, s.rob.ri5, s.rob.ri6, s.rob.ri7,
    s.rob.nos_selection, s.rob.nos_comparability, s.rob.nos_outcome, s.rob.overall
  ].map(v => `"${v || ''}"`).join(','));

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `meta-analysis-data-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

/**
 * Export PRISMA 2020 Checklist
 */
export function exportPRISMAChecklist(prosperoId) {
  const items = [
    ['Title', '1', 'Identify as systematic review'],
    ['Abstract', '2', 'Structured abstract: PICO, methods, results, conclusion'],
    ['Rationale', '3', 'Rationale in context of existing evidence'],
    ['Objectives', '4', 'PICO/PECO objectives'],
    ['Protocol & registration', '5', `PROSPERO: ${prosperoId || 'NOT REGISTERED'}`],
    ['Eligibility criteria', '6', 'Inclusion/exclusion criteria — a priori'],
    ['Information sources', '7', 'Databases, registers, grey literature'],
    ['Search strategy', '8', 'Full search strategy per database'],
    ['Selection process', '9', 'Independent screening, κ reported'],
    ['Data collection process', '10', 'Independent extraction'],
    ['Data items', '11', 'All variables, assumptions for missing'],
    ['RoB assessment', '12', 'RoB 2 (RCT) + ROBINS-I/NOS (Observational)'],
    ['Effect measures', '13', 'Effect measure as specified'],
    ['Synthesis methods', '14', 'DL/REML RE, I², Q, τ², HKSJ, 95% PI'],
    ['Reporting bias', '15', 'Egger, Begg, funnel plot'],
    ['Certainty (GRADE)', '16', 'GRADE approach for certainty assessment'],
    ['Study selection results', '17', 'PRISMA 2020 flow diagram'],
    ['Study characteristics', '18', 'Characteristics per study'],
    ['RoB per study', '19', 'Traffic light RoB per study'],
    ['Synthesis results', '20', 'Forest plot, pooled ES, CI, PI'],
    ['Publication bias', '21', 'Funnel plot, Egger/Begg p'],
    ['Certainty results', '22', 'GRADE certainty per outcome'],
    ['Discussion', '23', 'Summary, limitations, conclusions'],
    ['Competing interests', '24', 'COI declaration'],
    ['Funding', '25', 'Funding sources'],
  ];

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>PRISMA 2020 Checklist</title>
  <style>
    body{font-family:Arial,sans-serif;max-width:900px;margin:40px auto;font-size:12px;color:#1e293b;}
    h2{font-size:18px;color:#1e40af;border-bottom:2px solid #1e40af;padding-bottom:8px;}
    table{width:100%;border-collapse:collapse;margin:20px 0;}
    th,td{padding:10px;border:1px solid #e2e8f0;}
    th{background:#f1f5f9;font-weight:600;text-align:left;}
    tr:nth-child(even){background:#f8fafc;}
    .footer{margin-top:30px;font-size:10px;color:#64748b;border-top:1px solid #e2e8f0;padding-top:12px;}
  </style>
</head>
<body>
  <h2>PRISMA 2020 Checklist — Meta-Analysis Workspace Pro</h2>
  <table>
    <thead>
      <tr><th>Section</th><th>Item</th><th>Description</th><th>Reported? (page/section)</th></tr>
    </thead>
    <tbody>
      ${items.map(([s, i, d]) => `<tr><td>${s}</td><td>${i}</td><td>${d}</td><td>☐</td></tr>`).join('')}
    </tbody>
  </table>
  <p class="footer">
    Source: Page MJ, et al. BMJ 2021;372:n71 | Liberati A, et al. PLoS Med 2009<br/>
    Generated by Meta-Analysis Workspace Pro v2 — ${new Date().toLocaleDateString()}
  </p>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'PRISMA-2020-checklist.html';
  a.click();
  URL.revokeObjectURL(a.href);
}

/**
 * Export full HTML report
 */
export function exportHTMLReport(state, options = {}) {
  const {
    forestSVG = '',
    funnelSVG = '',
    sofTable = '',
    prismaDiagram = '',
    prospero = '',
    stats = null
  } = options;

  const logSc = stats && isLogScale(stats.measure);
  const fmt = v => logSc ? Math.exp(v).toFixed(3) : v.toFixed(3);

  const rctCount = state.studies?.filter(s => isRCT(s.design || 'RCT')).length || 0;
  const obsCount = state.studies?.filter(s => isObservational(s.design || '')).length || 0;

  const picoP = document.getElementById('pico-p')?.value || '—';
  const picoI = document.getElementById('pico-i')?.value || '—';
  const picoC = document.getElementById('pico-c')?.value || '—';
  const picoO = document.getElementById('pico-o')?.value || '—';

  const eligibilityHtml = state.eligibility ? `
    <table>
      <tr><th>Criterion</th><th>Inclusion</th><th>Exclusion</th></tr>
      <tr><td>Study Design</td><td>${(state.eligibility.design || []).join(', ') || '—'}</td><td>All other designs</td></tr>
      <tr><td>Population</td><td>${state.eligibility.inclPop || '—'}</td><td>${state.eligibility.exclPop || '—'}</td></tr>
      <tr><td>Intervention/Exposure</td><td>${state.eligibility.inclInt || '—'}</td><td>${state.eligibility.exclInt || '—'}</td></tr>
      <tr><td>Follow-up</td><td>${state.eligibility.followup || '—'}</td><td>Shorter duration</td></tr>
      <tr><td>Outcome required</td><td>${state.eligibility.outcomeReq || '—'}</td><td>—</td></tr>
      <tr><td>Language</td><td>${(state.eligibility.language || []).join(', ') || '—'}</td><td>—</td></tr>
      <tr><td>Other exclusions</td><td colspan="2">${state.eligibility.otherExcl || '—'}</td></tr>
    </table>
    <p style="font-size:10px;color:#64748b;">Criteria defined a priori. Saved: ${state.eligibility.savedAt ? new Date(state.eligibility.savedAt).toLocaleString() : '—'}</p>`
    : '<p style="color:#ef4444;">⚠ Eligibility criteria not defined.</p>';

  const studyRows = state.studies?.map(s => {
    const cat = designCategory(s.design || 'RCT');
    const robTool = isRCT(s.design || 'RCT') ? 'RoB 2' : 'ROBINS-I / NOS';
    return `<tr>
      <td>${s.author}</td><td>${s.year}</td><td>${s.journal || '—'}</td>
      <td>${s.design || '—'}</td>
      <td><span style="background:${cat === 'RCT' ? '#dbeafe' : '#fce7f3'};color:${cat === 'RCT' ? '#1e40af' : '#9d174d'};padding:2px 6px;border-radius:3px;font-size:10px;font-weight:600;">${cat}</span></td>
      <td>${s.type}</td><td>${robTool}</td><td>${s.rob.overall}</td>
    </tr>`;
  }).join('') || '';

  const statsHtml = stats ? `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:20px 0;">
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px;">
        <div style="font-size:10px;color:#64748b;text-transform:uppercase;font-weight:600;">Pooled ${stats.measure}</div>
        <div style="font-size:20px;font-weight:700;margin-top:4px;">${fmt(stats.pooled)}</div>
      </div>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px;">
        <div style="font-size:10px;color:#64748b;text-transform:uppercase;font-weight:600;">95% CI</div>
        <div style="font-size:20px;font-weight:700;margin-top:4px;">[${fmt(stats.ciLow)}, ${fmt(stats.ciHigh)}]</div>
      </div>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px;">
        <div style="font-size:10px;color:#64748b;text-transform:uppercase;font-weight:600;">I² Heterogeneity</div>
        <div style="font-size:20px;font-weight:700;margin-top:4px;">${stats.I2?.toFixed(1) || 0}%</div>
      </div>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px;">
        <div style="font-size:10px;color:#64748b;text-transform:uppercase;font-weight:600;">τ²</div>
        <div style="font-size:20px;font-weight:700;margin-top:4px;">${stats.tau2?.toFixed(4) || '0.0000'}</div>
      </div>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px;">
        <div style="font-size:10px;color:#64748b;text-transform:uppercase;font-weight:600;">Z statistic</div>
        <div style="font-size:20px;font-weight:700;margin-top:4px;">${stats.Z?.toFixed(3) || '0.000'}</div>
      </div>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px;">
        <div style="font-size:10px;color:#64748b;text-transform:uppercase;font-weight:600;">p-value</div>
        <div style="font-size:20px;font-weight:700;margin-top:4px;">${stats.pVal < 0.001 ? '<0.001' : stats.pVal?.toFixed(4) || '1.0000'}</div>
      </div>
    </div>
    <p><strong>Model:</strong> ${stats.model === 'random' ? 'DerSimonian-Laird Random-Effects' : 'Fixed-Effects (Inverse Variance)'}${stats.useHKSJ && stats.model === 'random' ? ' + Hartung-Knapp-Sidik-Jonkman correction' : ''}</p>
    ${stats.piLow !== null && stats.piHigh !== undefined ? `<p><strong>95% Prediction Interval:</strong> [${fmt(stats.piLow)}, ${fmt(stats.piHigh)}]</p>` : ''}`
    : '<p>No statistics computed.</p>';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Meta-Analysis Report — ${new Date().toLocaleDateString()}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:Arial,sans-serif;max-width:950px;margin:40px auto;color:#1e293b;font-size:13px;line-height:1.6;}
    h1{font-size:20px;border-bottom:2px solid #1e40af;padding-bottom:8px;margin-bottom:20px;}
    h2{font-size:15px;color:#1e40af;margin-top:28px;border-bottom:1px solid #e2e8f0;padding-bottom:4px;}
    table{width:100%;border-collapse:collapse;margin:12px 0;font-size:12px;}
    th{background:#f1f5f9;padding:8px;border:1px solid #cbd5e1;font-weight:600;text-align:left;}
    td{padding:7px 8px;border:1px solid #e2e8f0;}
    tr:nth-child(even){background:#f8fafc;}
    .stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:12px 0;}
    .stat-card{background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px;}
    .stat-label{font-size:10px;color:#64748b;text-transform:uppercase;font-weight:600;}
    .stat-value{font-size:20px;font-weight:700;margin-top:4px;}
    .footer{margin-top:40px;font-size:10px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:12px;}
    .figure-cap{font-size:10px;color:#64748b;text-align:center;margin-top:8px;font-style:italic;}
  </style>
</head>
<body>
  <h1>Systematic Review & Meta-Analysis Report</h1>
  <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
  ${prospero ? `<p><strong>PROSPERO Registration:</strong> ${prospero}</p>` : ''}
  <p><strong>Software:</strong> Meta-Analysis Workspace Pro v2 (PRISMA 2020, Cochrane Handbook 6.3)</p>
  <p><strong>Study composition:</strong> ${rctCount} RCT + ${obsCount} Observational studies (${state.studies?.length || 0} total)</p>

  <h2>1. PICO/PECO Framework</h2>
  <table>
    <tr><th>P (Population)</th><th>I/E (Intervention/Exposure)</th><th>C (Comparison)</th><th>O (Outcome)</th></tr>
    <tr><td>${picoP}</td><td>${picoI}</td><td>${picoC}</td><td>${picoO}</td></tr>
  </table>

  <h2>1b. Eligibility Criteria (PRISMA Item 6)</h2>
  ${eligibilityHtml}

  <h2>2. Study Characteristics</h2>
  <table>
    <tr><th>Author</th><th>Year</th><th>Journal</th><th>Design</th><th>Category</th><th>Outcome Type</th><th>RoB Tool</th><th>RoB Overall</th></tr>
    ${studyRows}
  </table>

  <h2>3. Statistical Results</h2>
  ${statsHtml}

  <h2>4. Forest Plot</h2>
  ${forestSVG || '<p style="color:#64748b;">No forest plot generated.</p>'}
  ${forestSVG ? '<p class="figure-cap">Figure 1: Forest plot of included studies</p>' : ''}

  <h2>5. Funnel Plot & Publication Bias</h2>
  ${funnelSVG || '<p style="color:#64748b;">No funnel plot generated.</p>'}
  ${funnelSVG ? '<p class="figure-cap">Figure 2: Funnel plot for publication bias assessment</p>' : ''}

  <h2>6. GRADE Summary of Findings</h2>
  ${sofTable || '<p style="color:#64748b;">No SoF table generated.</p>'}

  <h2>7. PRISMA Flow Diagram</h2>
  ${prismaDiagram || '<p style="color:#64748b;">No PRISMA diagram generated.</p>'}

  <div class="footer">
    Generated by Meta-Analysis Workspace Pro v2 · PRISMA 2020 · Cochrane Handbook §10 · ${new Date().toISOString()}<br/>
    Statistics: DerSimonian-Laird/REML random-effects · Hedges' g (SMD) · Pre-entered HR/OR supported · HKSJ correction · 95% Prediction Interval<br/>
    RoB: RoB 2 (Sterne et al. 2019) for RCT · ROBINS-I (Sterne et al. 2016) for Observational · NOS (Wells et al.) for Cohort/CC<br/>
    This report is for research purposes. Verify all calculations independently before submission.
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `meta-analysis-report-${new Date().toISOString().split('T')[0]}.html`;
  a.click();
  URL.revokeObjectURL(a.href);

  return html;
}

/**
 * Export Risk of Bias traffic light table
 */
export function exportRoBTable(studies, robTool = 'rob2') {
  const isObs = (design) => ['Cohort', 'Case-Control', 'Cross-sectional', 'Registry'].some(t => (design || '').includes(t));

  const domains = robTool === 'rob2'
    ? ['d1', 'd2', 'd3', 'd4', 'd5']
    : robTool === 'robins'
      ? ['ri1', 'ri2', 'ri3', 'ri4', 'ri5', 'ri6', 'ri7']
      : ['d1_ri1', 'd2_ri2', 'd3_ri3', 'd4_ri4', 'd5_ri5'];

  const domainLabels = robTool === 'rob2'
    ? ['D1: Randomisation', 'D2: Deviations', 'D3: Missing', 'D4: Measurement', 'D5: Reporting']
    : robTool === 'robins'
      ? ['RI1: Confounding', 'RI2: Selection', 'RI3: Classification', 'RI4: Deviations', 'RI5: Missing', 'RI6: Measurement', 'RI7: Reporting']
      : ['D1/RI1', 'D2/RI2', 'D3/RI3', 'D4/RI4', 'D5/RI5', 'RI6', 'RI7'];

  const robColor = (v) => {
    const colors = {
      'Low': '#16a34a', 'Moderate': '#d97706', 'High': '#dc2626',
      'Serious': '#b45309', 'Critical': '#991b1b', 'Unclear': '#64748b', 'NI': '#94a3b8'
    };
    return colors[v] || '#64748b';
  };

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Risk of Bias Summary</title>
  <style>
    body{font-family:Arial,sans-serif;max-width:1100px;margin:40px auto;font-size:12px;}
    h2{color:#1e40af;margin-bottom:20px;}
    table{width:100%;border-collapse:collapse;}
    th,td{padding:8px;border:1px solid #e2e8f0;text-align:center;}
    th{background:#f1f5f9;font-weight:600;}
    .rob-cell{min-width:80px;}
    .traffic-light{display:inline-flex;flex-direction:column;align-items:center;gap:2px;padding:4px 8px;border-radius:4px;}
    .symbol{font-size:18px;line-height:1;}
    .label{font-size:8px;font-weight:700;}
  </style>
</head>
<body>
  <h2>Risk of Bias Summary — ${robTool === 'rob2' ? 'RoB 2' : robTool === 'robins' ? 'ROBINS-I' : 'Mixed'}</h2>
  <table>
    <thead>
      <tr>
        <th>Study</th><th>Design</th>
        ${domainLabels.map(d => `<th style="font-size:9px;">${d}</th>`).join('')}
        <th>Overall</th>
      </tr>
    </thead>
    <tbody>
      ${studies.map(s => `
        <tr>
          <td style="text-align:left;"><strong>${s.author}</strong> (${s.year})</td>
          <td>${s.design || 'RCT'}</td>
          ${domains.map(d => {
            const v = s.rob[d] || 'Unclear';
            const color = robColor(v);
            const symbol = ['Low', 'Moderate', 'High', 'Unclear', 'NI'].includes(v) ? '●' : v === 'Serious' ? '▲' : '◆';
            const label = v === 'Moderate' ? 'Mod' : v === 'Unclear' ? '?' : v.slice(0, 4);
            return `<td class="rob-cell">
              <div class="traffic-light" style="background:${color}22;">
                <span class="symbol" style="color:${color};">${symbol}</span>
                <span class="label" style="color:${color};">${label}</span>
              </div>
            </td>`;
          }).join('')}
          <td>
            <div class="traffic-light" style="background:${robColor(s.rob.overall)}22;">
              <span class="symbol" style="color:${robColor(s.rob.overall)};">●</span>
              <span class="label" style="color:${robColor(s.rob.overall)};">${s.rob.overall.slice(0, 4)}</span>
            </div>
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>
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

export default {
  exportJSON,
  exportCSV,
  exportPRISMAChecklist,
  exportHTMLReport,
  exportRoBTable
};
