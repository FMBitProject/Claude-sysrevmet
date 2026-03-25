/**
 * Forest Plot Module - Complete D3.js Implementation
 * Professional forest plot visualization for meta-analysis
 * 
 * @module forest-plot
 */

/**
 * Forest Plot Configuration
 */
const FOREST_CONFIG = {
  colors: {
    rct: '#2563eb',
    obs: '#9d174d',
    pool: '#d97706',
    zero: '#94a3b8',
    text: '#1e293b',
    bg: '#ffffff',
    ci: '#64748b'
  },
  dimensions: {
    width: 800,
    height: 500,
    leftMargin: 220,
    rightMargin: 180,
    topMargin: 60,
    bottomMargin: 80,
    rowHeight: 32,
    pointSize: 8
  },
  font: {
    family: 'Inter, system-ui, sans-serif',
    size: { label: 11, value: 10, title: 14 }
  }
};

/**
 * Check if measure is log scale (OR, RR, HR)
 */
function isLogScale(measure) {
  return ['OR', 'RR', 'HR', 'IRR'].includes(measure);
}

/**
 * Check if study design is observational
 */
function isObservational(design) {
  return ['Cohort', 'Case-Control', 'Cross-sectional', 'Registry']
    .some(t => (design || '').includes(t));
}

/**
 * Format value based on scale
 */
function fmt(value, logScale) {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return logScale ? Math.exp(value).toFixed(3) : value.toFixed(3);
}

/**
 * Create SVG element
 */
function createSVG(width, height, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return null;
  
  container.innerHTML = '';
  
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);
  svg.setAttribute('style', 'font-family: Inter, system-ui, sans-serif; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px;');
  svg.id = 'forest-svg';
  
  container.appendChild(svg);
  return svg;
}

/**
 * Create SVG group element
 */
function createGroup(svg, transform = '') {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  if (transform) g.setAttribute('transform', transform);
  svg.appendChild(g);
  return g;
}

/**
 * Create text element
 */
function createText(parent, x, y, text, options = {}) {
  const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  textEl.setAttribute('x', x);
  textEl.setAttribute('y', y);
  textEl.setAttribute('fill', options.color || '#1e293b');
  textEl.setAttribute('font-size', options.size || 11);
  textEl.setAttribute('font-weight', options.bold ? '700' : '400');
  textEl.setAttribute('text-anchor', options.anchor || 'start');
  textEl.textContent = text;
  parent.appendChild(textEl);
  return textEl;
}

/**
 * Create line element
 */
function createLine(parent, x1, y1, x2, y2, options = {}) {
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', x1);
  line.setAttribute('y1', y1);
  line.setAttribute('x2', x2);
  line.setAttribute('y2', y2);
  line.setAttribute('stroke', options.color || '#94a3b8');
  line.setAttribute('stroke-width', options.width || 1);
  if (options.dash) line.setAttribute('stroke-dasharray', options.dash);
  parent.appendChild(line);
  return line;
}

/**
 * Create rectangle element
 */
function createRect(parent, x, y, width, height, options = {}) {
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', x);
  rect.setAttribute('y', y);
  rect.setAttribute('width', width);
  rect.setAttribute('height', height);
  rect.setAttribute('fill', options.fill || 'none');
  rect.setAttribute('stroke', options.stroke || 'none');
  rect.setAttribute('rx', options.rx || 0);
  parent.appendChild(rect);
  return rect;
}

/**
 * Create polygon element (for diamond)
 */
function createPolygon(parent, points, options = {}) {
  const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  polygon.setAttribute('points', points);
  polygon.setAttribute('fill', options.fill || '#d97706');
  polygon.setAttribute('stroke', options.stroke || '#92400e');
  polygon.setAttribute('stroke-width', options.strokeWidth || 1);
  parent.appendChild(polygon);
  return polygon;
}

/**
 * Main Forest Plot Function
 * @param {Object} stats - Meta-analysis statistics
 * @param {string} containerId - Container element ID
 * @returns {Object} Forest plot SVG
 */
export function renderForestPlot(stats, containerId = 'forest-plot') {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('Forest plot container not found');
    return null;
  }

  // Validate stats
  if (!stats || !stats.studies || stats.studies.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:40px;color:#64748b;">
        <div style="font-size:32px;margin-bottom:8px;">📊</div>
        <div style="font-size:13px;font-weight:600;">No data for forest plot</div>
        <div style="font-size:11px;margin-top:4px;">Enter study data and run statistics first</div>
      </div>`;
    return null;
  }

  const {
    studies,
    pooled,
    ciLow,
    ciHigh,
    I2,
    tau2,
    measure = 'MD',
    model = 'random',
    weights = []
  } = stats;

  const logSc = isLogScale(measure);
  const config = FOREST_CONFIG;
  const dims = config.dimensions;

  // Calculate dimensions
  const k = studies.length;
  const plotWidth = dims.width - dims.leftMargin - dims.rightMargin;
  const plotHeight = Math.max(300, k * dims.rowHeight + dims.topMargin + dims.bottomMargin);

  // Create SVG
  const svg = createSVG(dims.width, plotHeight, containerId);
  if (!svg) return null;

  // Calculate X scale
  const allValues = [
    ...studies.map(s => s.es),
    ...studies.map(s => s.ciLow || s.es - 1.96 * s.se),
    ...studies.map(s => s.ciHigh || s.es + 1.96 * s.se),
    pooled, ciLow, ciHigh
  ].filter(v => v !== null && v !== undefined && !isNaN(v));

  let xMin = Math.min(...allValues);
  let xMax = Math.max(...allValues);
  const xPad = (xMax - xMin) * 0.15 || 1;
  xMin -= xPad;
  xMax += xPad;

  const xScale = (value) => {
    return dims.leftMargin + ((value - xMin) / (xMax - xMin)) * plotWidth;
  };

  // Create groups
  const titleGroup = createGroup(svg);
  const axisGroup = createGroup(svg);
  const ciGroup = createGroup(svg);
  const pointGroup = createGroup(svg);
  const labelGroup = createGroup(svg);
  const pooledGroup = createGroup(svg);

  // Draw title
  createText(titleGroup, dims.width / 2, 25, 'Forest Plot', {
    size: config.font.size.title,
    bold: true,
    anchor: 'middle'
  });
  createText(titleGroup, dims.width / 2, 42, `${measure} [${k} studies]`, {
    size: 11,
    anchor: 'middle',
    color: '#64748b'
  });

  // Draw zero/null line
  const zeroX = xScale(logSc ? 0 : 0);
  createLine(axisGroup, zeroX, dims.topMargin, zeroX, plotHeight - dims.bottomMargin, {
    color: config.colors.zero,
    dash: '4,3',
    width: 1.5
  });
  createText(axisGroup, zeroX, dims.topMargin - 8, 'Null', {
    size: 9,
    anchor: 'middle',
    color: config.colors.zero
  });

  // Draw X axis
  createLine(axisGroup, xScale(xMin), plotHeight - dims.bottomMargin + 20, 
    xScale(xMax), plotHeight - dims.bottomMargin + 20, {
    color: config.colors.ci,
    width: 1.5
  });

  // X axis ticks
  for (let i = 0; i <= 5; i++) {
    const tickValue = xMin + (xMax - xMin) * i / 5;
    const tickX = xScale(tickValue);
    createLine(axisGroup, tickX, plotHeight - dims.bottomMargin + 15,
      tickX, plotHeight - dims.bottomMargin + 25, {
      color: config.colors.ci,
      width: 1
    });
    createText(axisGroup, tickX, plotHeight - dims.bottomMargin + 38,
      fmt(tickValue, logSc), {
      size: 9,
      anchor: 'middle',
      color: config.colors.ci
    });
  }

  // X axis label
  createText(axisGroup, dims.width / 2, plotHeight - dims.bottomMargin + 55,
    `${measure} ${logSc ? '(log scale)' : ''} | Favours Control ← → Favours Treatment`, {
    size: 10,
    anchor: 'middle',
    color: config.colors.ci
  });

  // Draw studies
  studies.forEach((study, i) => {
    const y = dims.topMargin + i * dims.rowHeight + dims.rowHeight / 2;
    const xEs = xScale(study.es);
    const xCiLow = xScale(study.ciLow || study.es - 1.96 * study.se);
    const xCiHigh = xScale(study.ciHigh || study.es + 1.96 * study.se);
    const weight = weights[i] || (1 / (study.se * study.se));
    const obs = isObservational(study.design);
    const color = obs ? config.colors.obs : config.colors.rct;

    // Study label
    createText(labelGroup, 10, y + 4, `${study.author} (${study.year})`, {
      size: config.font.size.label,
      color: config.colors.text
    });

    // CI line
    createLine(ciGroup, xCiLow, y, xCiHigh, y, {
      color: color,
      width: 2
    });

    // CI caps
    createLine(ciGroup, xCiLow, y - 5, xCiLow, y + 5, {
      color: color,
      width: 2
    });
    createLine(ciGroup, xCiHigh, y - 5, xCiHigh, y + 5, {
      color: color,
      width: 2
    });

    // Point (square for RCT, diamond for obs)
    const pointSize = Math.max(4, Math.min(12, Math.sqrt(weight) * 3));
    if (obs) {
      // Diamond for observational
      const points = `${xEs},${y - pointSize} ${xEs + pointSize},${y} ${xEs},${y + pointSize} ${xEs - pointSize},${y}`;
      createPolygon(pointGroup, points, {
        fill: color,
        stroke: color,
        strokeWidth: 1
      });
    } else {
      // Square for RCT
      createRect(pointGroup, xEs - pointSize / 2, y - pointSize / 2,
        pointSize, pointSize, {
        fill: color,
        rx: 1
      });
    }

    // Weight percentage
    const weightPct = (weight * 100).toFixed(1);
    createText(labelGroup, dims.width - dims.rightMargin + 10, y + 4,
      `${weightPct}%`, {
      size: config.font.size.value,
      color: config.colors.ci
    });
  });

  // Draw pooled effect (diamond)
  const pooledY = dims.topMargin + k * dims.rowHeight + 40;
  const dX1 = xScale(ciLow);
  const dX2 = xScale(ciHigh);
  const dXc = xScale(pooled);
  const dH = 12;

  const diamondPoints = `${dXc},${pooledY - dH} ${dX2},${pooledY} ${dXc},${pooledY + dH} ${dX1},${pooledY}`;
  createPolygon(pooledGroup, diamondPoints, {
    fill: config.colors.pool,
    stroke: '#92400e',
    strokeWidth: 1.5
  });

  // Pooled label
  createText(pooledGroup, 10, pooledY + 4, `Pooled (${model === 'random' ? 'RE' : 'FE'})`, {
    size: config.font.size.label,
    bold: true,
    color: config.colors.pool
  });

  // Pooled value
  createText(pooledGroup, dims.width - dims.rightMargin + 10, pooledY + 4,
    `${fmt(pooled, logSc)} [${fmt(ciLow, logSc)}, ${fmt(ciHigh, logSc)}]`, {
    size: config.font.size.value,
    bold: true,
    color: config.colors.pool
  });

  // Heterogeneity statistics
  const hetY = pooledY + 35;
  createText(pooledGroup, 10, hetY,
    `I² = ${I2?.toFixed(1) || 0}% · τ² = ${tau2?.toFixed(4) || 0}`, {
    size: 9,
    color: config.colors.ci
  });

  // Legend
  const legendY = hetY + 25;
  createRect(pooledGroup, 10, legendY - 8, 10, 10, {
    fill: config.colors.rct,
    rx: 1
  });
  createText(pooledGroup, 25, legendY, 'RCT', {
    size: 9,
    color: config.colors.text
  });

  createRect(pooledGroup, 70, legendY - 8, 10, 10, {
    fill: config.colors.obs,
    rx: 1
  });
  createText(pooledGroup, 85, legendY, 'Observational', {
    size: 9,
    color: config.colors.text
  });

  // Download button
  const downloadBtn = document.createElement('button');
  downloadBtn.textContent = '📥 Download SVG';
  downloadBtn.style.cssText = 'margin-top:10px;padding:8px 16px;background:#4361ee;color:white;border:none;border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;';
  downloadBtn.onclick = () => downloadForestPlot(containerId);
  container.appendChild(downloadBtn);

  return svg;
}

/**
 * Download forest plot as SVG
 */
export function downloadForestPlot(containerId = 'forest-plot') {
  const svg = document.getElementById('forest-svg');
  if (!svg) {
    alert('Forest plot not found');
    return;
  }

  const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `forest-plot-${new Date().toISOString().split('T')[0]}.svg`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Download forest plot as PNG
 */
export function downloadForestPlotPNG(containerId = 'forest-plot', scale = 2) {
  const svg = document.getElementById('forest-svg');
  if (!svg) return;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const rect = svg.getBoundingClientRect();

  canvas.width = rect.width * scale;
  canvas.height = rect.height * scale;

  const img = new Image();
  const svgData = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(svgData);

  img.onload = () => {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);

    canvas.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `forest-plot-${new Date().toISOString().split('T')[0]}.png`;
      a.click();
    }, 'image/png');
  };

  img.src = url;
}

export default {
  renderForestPlot,
  downloadForestPlot,
  downloadForestPlotPNG
};
