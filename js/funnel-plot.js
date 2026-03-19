/**
 * Funnel Plot Module
 * Publication bias visualization and statistical tests
 * 
 * @module funnel-plot
 */

import { isLogScale } from './study-manager.js';

/**
 * Standard normal CDF approximation
 */
function normalCDF(z) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}

/**
 * Estimate trim-and-fill missing studies
 */
export function estimateTrimFill(studies, pooled) {
  if (studies.length < 4) return 0;
  const centered = studies.map(s => s.es - pooled);
  const neg = centered.filter(e => e < 0).length;
  const pos = centered.filter(e => e >= 0).length;
  return Math.max(0, Math.abs(pos - neg) - 1);
}

/**
 * Render funnel plot with publication bias tests
 * @param {Object} stats - Meta-analysis statistics
 * @param {string} containerId - Funnel plot container ID
 * @param {string} eggerContainerId - Egger test results container ID
 * @returns {Object} Publication bias test results
 */
export function renderFunnelPlot(stats, containerId = 'funnel-area', eggerContainerId = 'egger-result') {
  const container = document.getElementById(containerId);
  if (!container) return null;

  if (!stats || !stats.validStudies || stats.validStudies.length < 3) {
    container.innerHTML = `
      <div style="text-align:center;padding:30px;color:var(--text3);">
        <div style="font-size:32px;margin-bottom:8px;">📊</div>
        <div>Need ≥3 studies with valid data for funnel plot.</div>
      </div>`;

    // Update test result placeholders
    ['egger-p', 'begg-tau', 'trim-fill', 'failsafe-n'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = 'Need ≥3 studies';
    });

    return null;
  }

  const { validStudies, pooled, measure, zCrit } = stats;
  const n = validStudies.length;
  const logSc = isLogScale(measure);

  // ============ Egger's Test ============
  const y_e = validStudies.map(s => s.es / s.se);
  const x_e = validStudies.map(s => 1 / s.se);
  const mx = x_e.reduce((a, b) => a + b, 0) / n;
  const my = y_e.reduce((a, b) => a + b, 0) / n;

  const ssxy = x_e.reduce((a, xi, i) => a + (xi - mx) * (y_e[i] - my), 0);
  const ssx = x_e.reduce((a, xi) => a + (xi - mx) * (xi - mx), 0);
  const slope = ssx > 0 ? ssxy / ssx : 0;
  const intercept = my - slope * mx;

  const resid = y_e.map((yi, i) => yi - slope * x_e[i] - intercept);
  const mse = resid.reduce((a, r) => a + r * r, 0) / (n - 2);
  const seInt = ssx > 0 ? Math.sqrt(mse / ssx) * Math.sqrt(x_e.reduce((a, xi) => a + xi * xi, 0) / n) : 1;
  const t_eg = intercept / seInt;
  const p_eg = n > 3 ? 2 * (1 - normalCDF(Math.abs(t_eg))) : null;

  // ============ Begg's Test ============
  const adj_es = validStudies.map(s => s.es - pooled);
  const variances = validStudies.map(s => s.variance);
  let concordant = 0, discordant = 0;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const se = Math.sign(adj_es[i] - adj_es[j]);
      const sv = Math.sign(variances[i] - variances[j]);
      if (se * sv > 0) concordant++;
      else if (se * sv < 0) discordant++;
    }
  }

  const pairs = n * (n - 1) / 2;
  const kt = pairs > 0 ? (concordant - discordant) / pairs : 0;
  const se_t = Math.sqrt(2 * (2 * n + 5) / (9 * n * (n - 1)));
  const z_b = se_t > 0 ? kt / se_t : 0;
  const p_b = 2 * (1 - normalCDF(Math.abs(z_b)));

  // ============ Trim and Fill ============
  const missing = estimateTrimFill(validStudies, pooled);

  // ============ Fail-safe N (Rosenthal) ============
  const zScores = validStudies.map(s => s.es / s.se);
  const sumZ = zScores.reduce((a, b) => a + b, 0);
  const failsafeN = Math.max(0, Math.round((sumZ * sumZ / 2.706) - n));

  // ============ Update UI ============
  const fmt = (v) => logSc ? Math.exp(v).toFixed(3) : v.toFixed(3);

  // Update test result elements
  const updateEl = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  updateEl('egger-p', p_eg !== null ? p_eg.toFixed(4) : 'Need ≥4');
  updateEl('egger-intercept', `${intercept.toFixed(4)} (SE=${seInt.toFixed(4)})`);
  updateEl('egger-slope', `slope: ${slope.toFixed(4)}`);
  updateEl('begg-tau', `${kt.toFixed(3)} (p=${p_b.toFixed(3)})`);
  updateEl('trim-fill', missing);
  updateEl('trim-fill-adj', missing === 0 ? 'No adjustment' : `${missing} missing studies`);
  updateEl('failsafe-n', failsafeN.toLocaleString());

  // Interpretation
  const eggerInterp = document.getElementById('egger-interp');
  if (eggerInterp) {
    eggerInterp.textContent = p_eg !== null
      ? (p_eg < 0.10 ? '⚠ Possible publication bias (p<0.10)' : '✓ No significant asymmetry')
      : '';
  }

  const beggInterp = document.getElementById('begg-interp');
  if (beggInterp) {
    beggInterp.textContent = p_b < 0.10 ? '⚠ Possible funnel asymmetry' : '✓ No significant asymmetry';
  }

  const fsInterp = document.getElementById('failsafe-interp');
  if (fsInterp) {
    const threshold = 5 * n + 10;
    fsInterp.textContent = failsafeN > threshold
      ? `✓ Robust (Nfs > 5k+10)`
      : `⚠ Fragile (Nfs ≤ 5k+10)`;
  }

  // ============ Draw Funnel Plot SVG ============
  const maxSE = Math.max(...validStudies.map(s => s.se));
  const allEs = validStudies.map(s => s.es);
  const esMin = Math.min(...allEs), esMax = Math.max(...allEs);
  const esPad = (esMax - esMin) * 0.3 || 0.5;
  const xMin_f = esMin - esPad;
  const xMax_f = esMax + esPad;

  const svgW = 440, svgH = 330;
  const mL = 50, mR = 20, mT = 20, mB = 50;
  const pW = svgW - mL - mR, pH = svgH - mT - mB;

  const toXF = (v) => mL + ((v - xMin_f) / (xMax_f - xMin_f)) * pW;
  const toYF = (se) => mT + ((se / maxSE) * pH);

  // Build confidence limit lines
  let lLine = '', rLine = '';
  for (let p = 0; p <= 50; p++) {
    const se_p = (p / 50) * maxSE;
    const xL = toXF(pooled - 1.96 * se_p);
    const xR = toXF(pooled + 1.96 * se_p);
    const y = toYF(se_p);
    if (p === 0) {
      lLine += `M${xL},${y}`;
      rLine += `M${xR},${y}`;
    } else {
      lLine += ` L${xL},${y}`;
      rLine += ` L${xR},${y}`;
    }
  }

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" style="background:#fff;border:1px solid #e2e8f0;border-radius:6px;">`;

  // Funnel limits
  svg += `<path d="${lLine}" fill="none" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4,3"/>`;
  svg += `<path d="${rLine}" fill="none" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4,3"/>`;

  // Center line
  const centerX = toXF(pooled);
  svg += `<line x1="${centerX}" y1="${mT}" x2="${centerX}" y2="${mT + pH}" stroke="#94a3b8" stroke-dasharray="3,3" stroke-width="1"/>`;

  // Study points
  validStudies.forEach(s => {
    const obs = s.design && ['Cohort', 'Case-Control', 'Cross-sectional', 'Registry'].includes(s.design.split('-')[0]);
    const col = obs ? '#9d174d' : '#2563eb';
    const cx = toXF(s.es);
    const cy = toYF(s.se);

    if (obs) {
      // Triangle for observational
      svg += `<polygon points="${cx},${cy - 6} ${cx + 6},${cy + 4} ${cx - 6},${cy + 4}" fill="${col}" fill-opacity="0.7" stroke="${col}" stroke-width="1"/>`;
    } else {
      // Circle for RCT
      svg += `<circle cx="${cx}" cy="${cy}" r="5" fill="${col}" fill-opacity="0.7" stroke="${col}" stroke-width="1"/>`;
    }
  });

  // Axes
  svg += `<line x1="${mL}" y1="${mT}" x2="${mL}" y2="${mT + pH}" stroke="#94a3b8" stroke-width="1"/>`;
  svg += `<line x1="${mL}" y1="${mT + pH}" x2="${mL + pW}" y2="${mT + pH}" stroke="#94a3b8" stroke-width="1"/>`;

  // Labels
  svg += `<text x="${mL + pW / 2}" y="${svgH - 8}" fill="#64748b" font-size="10" text-anchor="middle" font-family="IBM Plex Mono">Effect size (${measure}${logSc ? ', exp scale' : ''})</text>`;
  svg += `<text x="15" y="${mT + pH / 2}" fill="#64748b" font-size="10" text-anchor="middle" font-family="IBM Plex Mono" transform="rotate(-90,15,${mT + pH / 2})">Standard Error</text>`;

  // Legend
  svg += `<text x="${mL + 4}" y="${svgH - 22}" fill="#2563eb" font-size="9">● RCT</text>`;
  svg += `<text x="${mL + 50}" y="${svgH - 22}" fill="#9d174d" font-size="9">▲ Observational</text>`;

  // Title
  svg += `<text x="${svgW / 2}" y="14" fill="#334155" font-size="11" text-anchor="middle" font-weight="600">Funnel Plot - Publication Bias Assessment</text>`;

  svg += `</svg>`;

  container.innerHTML = svg;

  // Color-code Egger result card
  const eggerCard = document.getElementById(eggerContainerId);
  if (eggerCard && p_eg !== null) {
    eggerCard.style.borderColor = p_eg < 0.10 ? 'var(--amber)' : 'var(--green)';
  }

  return {
    egger: { intercept, slope, t: t_eg, p: p_eg, se: seInt },
    begg: { tau: kt, z: z_b, p: p_b },
    trimFill: missing,
    failsafeN
  };
}

/**
 * Render Egger regression detail card
 */
export function renderEggerDetail(eggerResults, n) {
  const card = document.getElementById('egger-detail-card');
  const body = document.getElementById('egger-detail-body');

  if (!card || !body || !eggerResults) return;

  const { intercept, slope, t, p, se } = eggerResults;
  const sig = p !== null && p < 0.10;

  card.style.display = 'block';
  body.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
      <div style="padding:10px;background:var(--bg3);border-radius:5px;border:1px solid var(--border);">
        <div style="font-size:9px;color:var(--text3);text-transform:uppercase;font-weight:600;letter-spacing:.06em;margin-bottom:4px;">Regression Intercept (b₀)</div>
        <div style="font-family:var(--mono);font-size:16px;font-weight:600;">${intercept.toFixed(4)}</div>
        <div style="font-size:10px;color:var(--text3);">SE = ${se.toFixed(4)}</div>
        <div style="font-size:10px;color:var(--text3);">t(${n - 2}) = ${t.toFixed(3)}</div>
      </div>
      <div style="padding:10px;background:var(--bg3);border-radius:5px;border:1px solid var(--border);">
        <div style="font-size:9px;color:var(--text3);text-transform:uppercase;font-weight:600;letter-spacing:.06em;margin-bottom:4px;">Regression Slope (b₁)</div>
        <div style="font-family:var(--mono);font-size:16px;font-weight:600;">${slope.toFixed(4)}</div>
        <div style="font-size:10px;color:var(--text3);">≈ pooled effect size</div>
      </div>
    </div>
    <div style="padding:10px;background:${sig ? '#fffbeb' : '#f0fdf4'};border-left:3px solid ${sig ? 'var(--amber)' : 'var(--green)'};border-radius:0 5px 5px 0;font-size:11px;">
      <strong>${sig ? '⚠ Significant asymmetry detected' : '✓ No significant asymmetry'}</strong> — 
      Egger intercept = ${intercept.toFixed(3)}, p = ${p?.toFixed(4) || 'N/A'} 
      (${p < 0.05 ? 'p<0.05, strong evidence' : p < 0.10 ? 'p<0.10, moderate evidence' : 'p≥0.10, no evidence'} of bias).
      <br><span style="color:var(--text3);font-size:10px;">Note: Egger's test has low power with k&lt;10. Interpret with caution.</span>
    </div>`;
}

export default {
  renderFunnelPlot,
  renderEggerDetail,
  estimateTrimFill
};
