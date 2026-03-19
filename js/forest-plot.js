/**
 * Forest Plot Module
 * D3.js-style forest plot visualization for meta-analysis
 * 
 * @module forest-plot
 */

import { isObservational, isLogScale } from './study-manager.js';

/**
 * Forest plot configuration
 */
const CONFIG = {
  colors: {
    rct: '#2563eb',
    obs: '#9d174d',
    pool: '#d97706',
    zero: '#94a3b8',
    text: '#334155',
    bg: '#ffffff'
  },
  dimensions: {
    leftW: 200,
    rightW: 180,
    plotW: 480,
    rowH: 32,
    headerH: 55,
    footerH: 90
  }
};

/**
 * Format value based on measure type
 */
function fmt(value, logScale) {
  if (value === null || value === undefined) return '—';
  return logScale ? Math.exp(value).toFixed(3) : value.toFixed(3);
}

/**
 * Convert data value to X coordinate
 */
function toX(value, xMin, xMax, leftW, plotW) {
  return leftW + ((value - xMin) / (xMax - xMin)) * plotW;
}

/**
 * Render forest plot SVG
 * @param {Object} stats - Meta-analysis statistics from state._lastStats
 * @param {string} containerId - ID of container element
 * @returns {string} SVG markup
 */
export function renderForestPlot(stats, containerId = 'forest-canvas') {
  const container = document.getElementById(containerId);
  if (!container) return null;

  if (!stats || !stats.validStudies || stats.validStudies.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:40px;color:var(--text3);">
        <div style="font-size:32px;margin-bottom:8px;">📊</div>
        <div>No valid data. Enter study data in Tab 3 and run statistics.</div>
      </div>`;
    return null;
  }

  const {
    validStudies,
    weights,
    pooled,
    ciLow,
    ciHigh,
    Q,
    df,
    I2,
    tau2,
    measure,
    zCrit,
    k,
    useHKSJ,
    piLow,
    piHigh,
    model,
    tau
  } = stats;

  const logSc = isLogScale(measure);
  const studies = validStudies.map((s, i) => ({
    ...s,
    ciL: s.es - zCrit * s.se,
    ciH: s.es + zCrit * s.se,
    w: weights[i]
  }));

  const totalW = weights.reduce((a, b) => a + b, 0);

  // Calculate X axis range
  const allVals = studies.flatMap(s => [s.ciL, s.ciH, ciLow, ciHigh]);
  const rawMin = Math.min(...allVals);
  const rawMax = Math.max(...allVals);
  const pad = (rawMax - rawMin) * 0.15 || 1;
  const xMin = rawMin - pad;
  const xMax = rawMax + pad;

  // Dimensions
  const { leftW, rightW, plotW, rowH, headerH, footerH } = CONFIG.dimensions;
  const hasPi = piLow !== null && piHigh !== undefined;
  const svgH = headerH + k * rowH + footerH + (hasPi ? 28 : 0);
  const totalW_svg = leftW + plotW + rightW;

  // Build SVG
  let svg = `<svg id="forest-svg" xmlns="http://www.w3.org/2000/svg" width="${totalW_svg}" height="${svgH}" style="font-family:'IBM Plex Mono',monospace;font-size:11px;background:${CONFIG.colors.bg};border:1px solid #e2e8f0;border-radius:6px;">`;

  // Header
  svg += `<text x="10" y="28" fill="${CONFIG.colors.text}" font-size="11" font-weight="600">Study</text>`;
  svg += `<text x="${leftW + plotW / 2}" y="18" fill="${CONFIG.colors.text}" font-size="11" text-anchor="middle">${measure} [${zCrit === 1.96 ? '95' : '99'}% CI]</text>`;
  svg += `<text x="${leftW + plotW + 10}" y="18" fill="${CONFIG.colors.text}" font-size="11">Effect [CI]</text>`;
  svg += `<text x="${leftW + plotW + rightW - 10}" y="18" fill="${CONFIG.colors.text}" font-size="11" text-anchor="end">Weight%</text>`;

  // Legend
  svg += `<rect x="${leftW + 4}" y="34" width="10" height="10" fill="${CONFIG.colors.rct}" rx="1"/>`;
  svg += `<text x="${leftW + 18}" y="43" fill="${CONFIG.colors.rct}" font-size="9">RCT</text>`;
  svg += `<rect x="${leftW + 55}" y="34" width="10" height="10" fill="${CONFIG.colors.obs}" rx="1"/>`;
  svg += `<text x="${leftW + 69}" y="43" fill="${CONFIG.colors.obs}" font-size="9">Observational</text>`;

  // Zero/null line
  const zeroX = toX(logSc ? 0 : 0, xMin, xMax, leftW, plotW);
  svg += `<line x1="${zeroX}" y1="${headerH - 10}" x2="${zeroX}" y2="${headerH + k * rowH + 10}" stroke="${CONFIG.colors.zero}" stroke-width="1" stroke-dasharray="4,3"/>`;

  // Study rows
  studies.forEach((s, i) => {
    const y = headerH + i * rowH + rowH / 2;
    const x1 = toX(s.ciL, xMin, xMax, leftW, plotW);
    const x2 = toX(s.ciH, xMin, xMax, leftW, plotW);
    const xEs = toX(s.es, xMin, xMax, leftW, plotW);
    const wPct = (s.w / totalW * 100).toFixed(1);
    const sqSize = Math.max(4, Math.min(12, (s.w / totalW) * 60));
    const obs = isObservational(s.design || 'RCT');
    const col = obs ? CONFIG.colors.obs : CONFIG.colors.rct;

    // Study name
    svg += `<text x="8" y="${y + 4}" fill="${CONFIG.colors.text}" font-size="11">${s.author.split(',')[0].split(' ')[0]} (${s.year})</text>`;

    // CI line
    svg += `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${col}" stroke-width="2"/>`;
    svg += `<line x1="${x1}" y1="${y - 5}" x2="${x1}" y2="${y + 5}" stroke="${col}" stroke-width="2"/>`;
    svg += `<line x1="${x2}" y1="${y - 5}" x2="${x2}" y2="${y + 5}" stroke="${col}" stroke-width="2"/>`;

    // Effect marker (square for RCT, diamond for obs)
    if (obs) {
      svg += `<polygon points="${xEs},${y - sqSize / 2} ${xEs + sqSize / 2},${y} ${xEs},${y + sqSize / 2} ${xEs - sqSize / 2},${y}" fill="${col}"/>`;
    } else {
      svg += `<rect x="${xEs - sqSize / 2}" y="${y - sqSize / 2}" width="${sqSize}" height="${sqSize}" fill="${col}" rx="1"/>`;
    }

    // Effect value and weight
    svg += `<text x="${leftW + plotW + 10}" y="${y + 4}" fill="${CONFIG.colors.text}" font-size="10">${fmt(s.es, logSc)} [${fmt(s.ciL, logSc)}, ${fmt(s.ciH, logSc)}]</text>`;
    svg += `<text x="${leftW + plotW + rightW - 10}" y="${y + 4}" fill="#64748b" font-size="9" text-anchor="end">${wPct}%</text>`;
  });

  // Pooled effect (diamond)
  const diamondY = headerH + k * rowH + 30;
  const dX1 = toX(ciLow, xMin, xMax, leftW, plotW);
  const dX2 = toX(ciHigh, xMin, xMax, leftW, plotW);
  const dXc = toX(pooled, xMin, xMax, leftW, plotW);
  const dH = 10;

  svg += `<polygon points="${dXc},${diamondY - dH} ${dX2},${diamondY} ${dXc},${diamondY + dH} ${dX1},${diamondY}" fill="${CONFIG.colors.pool}" stroke="#92400e" stroke-width="1"/>`;

  const reLabel = model === 'random' ? ('RE-DL' + (useHKSJ ? ' HKSJ' : '')) : 'FE-IV';
  svg += `<text x="8" y="${diamondY + 4}" fill="#92400e" font-size="11" font-weight="600">Pooled (${reLabel})</text>`;
  svg += `<text x="${leftW + plotW + 10}" y="${diamondY + 4}" fill="#92400e" font-size="10" font-weight="600">${fmt(pooled, logSc)} [${fmt(ciLow, logSc)}, ${fmt(ciHigh, logSc)}]</text>`;

  // Prediction interval
  let piBarH = 0;
  if (hasPi) {
    const pX1 = Math.max(leftW + 2, toX(piLow, xMin, xMax, leftW, plotW));
    const pX2 = Math.min(leftW + plotW - 2, toX(piHigh, xMin, xMax, leftW, plotW));
    const piY = diamondY + 22;
    piBarH = 28;

    svg += `<line x1="${pX1}" y1="${piY}" x2="${pX2}" y2="${piY}" stroke="#7c3aed" stroke-width="3" stroke-linecap="round"/>`;
    svg += `<line x1="${pX1}" y1="${piY - 5}" x2="${pX1}" y2="${piY + 5}" stroke="#7c3aed" stroke-width="2"/>`;
    svg += `<line x1="${pX2}" y1="${piY - 5}" x2="${pX2}" y2="${piY + 5}" stroke="#7c3aed" stroke-width="2"/>`;
    svg += `<text x="8" y="${piY + 4}" fill="#7c3aed" font-size="10">95% Prediction Interval</text>`;
    svg += `<text x="${leftW + plotW + 10}" y="${piY + 4}" fill="#7c3aed" font-size="10">[${fmt(piLow, logSc)}, ${fmt(piHigh, logSc)}]</text>`;
  }

  // X axis
  const axisY = headerH + k * rowH + 55 + piBarH;
  svg += `<line x1="${leftW}" y1="${axisY}" x2="${leftW + plotW}" y2="${axisY}" stroke="#94a3b8" stroke-width="1"/>`;

  for (let t = 0; t <= 5; t++) {
    const tv = xMin + (xMax - xMin) * t / 5;
    const tx = toX(tv, xMin, xMax, leftW, plotW);
    svg += `<line x1="${tx}" y1="${axisY}" x2="${tx}" y2="${axisY + 5}" stroke="#94a3b8" stroke-width="1"/>`;
    svg += `<text x="${tx}" y="${axisY + 16}" fill="#64748b" font-size="9" text-anchor="middle">${logSc ? Math.exp(tv).toFixed(2) : tv.toFixed(2)}</text>`;
  }

  // Footer labels
  svg += `<text x="${leftW + plotW / 2}" y="${axisY + 30}" fill="#64748b" font-size="10" text-anchor="middle">${measure}${logSc ? ' (exp scale)' : ''} | Favours control ← → Favours intervention</text>`;

  const hksjNote = useHKSJ && model === 'random' ? ' · HKSJ t-correction' : '';
  const modelNames = { 'random': 'DL RE', 'random-reml': 'REML RE', 'random-pm': 'PM RE', 'fixed': 'Fixed-effects IV' };
  svg += `<text x="${leftW}" y="${axisY + 48}" fill="#94a3b8" font-size="9">I²=${I2.toFixed(1)}% · Q=${Q.toFixed(2)}(df=${df}) · τ²=${tau2.toFixed(4)} · ${modelNames[model] || 'RE'}${hksjNote}</text>`;
  svg += `<text x="${leftW}" y="${axisY + 62}" fill="#94a3b8" font-size="9">■ RCT ◆ Observational</text>`;
  svg += `</svg>`;

  container.innerHTML = svg;
  return svg;
}

/**
 * Download forest plot as SVG file
 */
export function downloadForestSVG(containerId = 'forest-svg') {
  const svg = document.getElementById(containerId);
  if (!svg) return;

  const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'forest-plot.svg';
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Download forest plot as PNG
 */
export async function downloadForestPNG(containerId = 'forest-svg', scale = 2) {
  const svg = document.getElementById(containerId);
  if (!svg) return;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const svgRect = svg.getBoundingClientRect();

  canvas.width = svgRect.width * scale;
  canvas.height = svgRect.height * scale;

  const img = new Image();
  const svgData = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(svgData);

  img.onload = () => {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);

    canvas.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'forest-plot.png';
      a.click();
    }, 'image/png');
  };

  img.src = url;
}

export default {
  renderForestPlot,
  downloadForestSVG,
  downloadForestPNG
};
