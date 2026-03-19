/**
 * PRISMA 2020 Flow Diagram Module
 * Generates PRISMA flow diagram SVG
 * 
 * @module prisma
 */

/**
 * Render PRISMA 2020 flow diagram
 * @param {Object} prismaData - PRISMA numbers
 * @param {string} containerId - Container element ID
 * @returns {string} SVG markup
 */
export function renderPrismaFlow(prismaData, containerId = 'prisma-diagram') {
  const container = document.getElementById(containerId);
  if (!container) return '';

  // Get values with defaults
  const identified = parseInt(prismaData?.identified) || 0;
  const registers = parseInt(prismaData?.registers) || 0;
  const dupes = parseInt(prismaData?.dupes) || 0;
  const afterDupes = Math.max(0, identified + registers - dupes);
  
  const screened = parseInt(prismaData?.screened) || afterDupes;
  const exclScreen = parseInt(prismaData?.exclScreen) || 0;
  
  const sought = parseInt(prismaData?.sought) || Math.max(0, screened - exclScreen);
  const notRetrieved = parseInt(prismaData?.notRetrieved) || 0;
  
  const fullText = parseInt(prismaData?.fullText) || Math.max(0, sought - notRetrieved);
  const exclFull = parseInt(prismaData?.exclFull) || 0;
  
  const included = parseInt(prismaData?.included) || 0;

  // Exclusion reasons for side boxes
  const exclReasons = prismaData?.exclReasons || [];
  const exclLines = exclReasons
    .filter(r => parseInt(r.n) > 0)
    .map(r => `${r.text}: ${r.n}`);

  if (exclLines.length > 1) {
    const tot = exclReasons.reduce((s, r) => s + (parseInt(r.n) || 0), 0);
    exclLines.push('──────────');
    exclLines.push(`Total: ${tot}`);
  }
  if (!exclLines.length && exclFull > 0) {
    exclLines.push(`Total excluded: ${exclFull}`);
  }
  if (!exclLines.length) {
    exclLines.push('Enter counts →');
  }

  // SVG constants
  const SVG_W = 700;
  const MCX = 220; // Main column center X
  const MBW = 200; // Main box width
  const MBH = 72;  // Main box height
  const SBX = 450; // Side box left X
  const SBW = 230; // Side box width
  const ARR_H = 40; // Arrow gap
  const PH = 22;   // Phase label height
  const PH_GAP = 8; // Phase label gap

  // Helper: side box height
  const sbH = (n) => Math.max(52, 28 + Math.max(1, n) * 19);

  // Calculate Y positions
  const y_phase_id = 10;
  const y_topboxes = y_phase_id + PH + PH_GAP;
  const y_dedup = y_topboxes + MBH + ARR_H + MBH / 2;
  
  const ARR_STUB = 18;
  const INTER_PH = ARR_STUB + 6 + PH + PH_GAP;
  
  const y_dedup_bot = y_dedup + MBH / 2;
  const y_phase_sc = y_dedup_bot + ARR_STUB + 6;
  const y_screen = y_phase_sc + PH + PH_GAP + MBH / 2;
  
  const y_sought = y_screen + MBH / 2 + ARR_H + MBH / 2;
  const y_ft = y_sought + MBH / 2 + ARR_H + MBH / 2;
  
  const y_ft_bot = y_ft + MBH / 2;
  const y_phase_in = y_ft_bot + ARR_STUB + 6;
  const y_inc = y_phase_in + PH + PH_GAP + MBH / 2;
  
  const SVG_H = y_inc + MBH / 2 + 20;

  // SVG helpers
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  function box(x, y, w, h, stroke, fill, rx = 8) {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill || '#ffffff'}" stroke="${stroke || '#94a3b8'}" stroke-width="1.8"/>`;
  }

  function mainBox(cy, labelFull, val, strokeColor, numColor) {
    const x = MCX - MBW / 2;
    const y = cy - MBH / 2;
    
    let line1 = labelFull, line2 = '';
    if (labelFull.length > 28) {
      const mid = Math.floor(labelFull.length / 2);
      const space = labelFull.indexOf(' ', mid);
      if (space > 0) {
        line1 = labelFull.slice(0, space);
        line2 = labelFull.slice(space + 1);
      }
    }
    
    const sc = strokeColor || '#94a3b8';
    const nc = numColor || '#0f172a';
    
    let s = box(x, y, MBW, MBH, sc);
    
    if (line2) {
      s += `<text x="${MCX}" y="${cy - 18}" text-anchor="middle" font-size="9.5" fill="#64748b" font-family="Inter,system-ui,sans-serif">${esc(line1)}</text>`;
      s += `<text x="${MCX}" y="${cy - 7}" text-anchor="middle" font-size="9.5" fill="#64748b" font-family="Inter,system-ui,sans-serif">${esc(line2)}</text>`;
      s += `<text x="${MCX}" y="${cy + 18}" text-anchor="middle" font-size="24" font-weight="700" fill="${nc}" font-family="Inter,system-ui,sans-serif">${val}</text>`;
    } else {
      s += `<text x="${MCX}" y="${cy - 10}" text-anchor="middle" font-size="9.5" fill="#64748b" font-family="Inter,system-ui,sans-serif">${esc(line1)}</text>`;
      s += `<text x="${MCX}" y="${cy + 16}" text-anchor="middle" font-size="24" font-weight="700" fill="${nc}" font-family="Inter,system-ui,sans-serif">${val}</text>`;
    }
    return s;
  }

  function sideBox(cy, titleText, lines, strokeColor) {
    const h = sbH(lines.length);
    const y = cy - h / 2;
    const sc = strokeColor || '#f59e0b';
    const bg = sc === '#f04438' ? '#fef2f1' : '#fffbeb';
    const tc = sc === '#f04438' ? '#991b1b' : '#92400e';
    
    let s = box(SBX, y, SBW, h, sc, bg, 6);
    s += `<text x="${SBX + 10}" y="${y + 16}" font-size="9" font-weight="700" fill="${sc}" font-family="Inter,system-ui,sans-serif">${esc(titleText)}</text>`;
    
    lines.forEach((ln, i) => {
      if (ln === '──────────') {
        s += `<line x1="${SBX + 8}" y1="${y + 30 + i * 18}" x2="${SBX + SBW - 8}" y2="${y + 30 + i * 18}" stroke="${sc}" stroke-width="0.8" opacity="0.4"/>`;
        return;
      }
      const maxLen = 32;
      const isTotLine = ln.startsWith('Total:');
      const txt = ln.length > maxLen ? ln.slice(0, maxLen - 1) + '…' : ln;
      s += `<text x="${SBX + 10}" y="${y + 32 + i * 18}" font-size="${isTotLine ? '10' : '10'}" font-weight="${isTotLine ? '700' : '400'}" fill="${isTotLine ? sc : tc}" font-family="Inter,system-ui,sans-serif">${esc(txt)}</text>`;
    });
    return s;
  }

  function arrowDown(fromCY, toCY) {
    const y1 = fromCY + MBH / 2 + 2;
    const y2 = toCY - MBH / 2 - 8;
    return `<line x1="${MCX}" y1="${y1}" x2="${MCX}" y2="${y2}" stroke="#94a3b8" stroke-width="2" marker-end="url(#pArr)"/>`;
  }

  function arrowStub(fromCY, toLabelY) {
    const y1 = fromCY + MBH / 2 + 2;
    const y2 = toLabelY - 6;
    return `<line x1="${MCX}" y1="${y1}" x2="${MCX}" y2="${y2}" stroke="#94a3b8" stroke-width="2" marker-end="url(#pArr)"/>`;
  }

  function arrowFromLabel(labelY, toCY) {
    const y1 = labelY + PH + 4;
    const y2 = toCY - MBH / 2 - 8;
    if (y2 <= y1) return '';
    return `<line x1="${MCX}" y1="${y1}" x2="${MCX}" y2="${y2}" stroke="#94a3b8" stroke-width="2" marker-end="url(#pArr)"/>`;
  }

  function arrowSide(cy) {
    const x1 = MCX + MBW / 2 + 2;
    const x2 = SBX - 8;
    return `<line x1="${x1}" y1="${cy}" x2="${x2}" y2="${cy}" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#pArrAmber)"/>`;
  }

  function phaseLabel(y, text, color) {
    const pw = 110;
    const ph2 = 18;
    const px = MCX - pw / 2;
    return `<rect x="${px}" y="${y}" width="${pw}" height="${ph2}" rx="9" fill="${color}22" stroke="${color}" stroke-width="1"/>
      <text x="${MCX}" y="${y + 13}" text-anchor="middle" font-size="9" font-weight="700" fill="${color}" letter-spacing="1.2" font-family="Inter,system-ui,sans-serif">${text.toUpperCase()}</text>`;
  }

  // Top pair (Databases + Registers)
  function topPair() {
    const bw = 155;
    const bh = MBH;
    const gap2 = 24;
    const totalW = bw * 2 + gap2;
    const x1 = MCX - totalW / 2;
    const x2 = x1 + bw + gap2;
    const by = y_topboxes;

    let s = '';
    
    // Box 1: Databases
    s += box(x1, by, bw, bh, '#3b82f6', '#eff6ff');
    s += `<text x="${x1 + bw / 2}" y="${by + MBH / 2 - 10}" text-anchor="middle" font-size="9.5" fill="#1d4ed8" font-family="Inter,system-ui,sans-serif">Databases</text>`;
    s += `<text x="${x1 + bw / 2}" y="${by + MBH / 2 + 14}" text-anchor="middle" font-size="22" font-weight="700" fill="#1d4ed8" font-family="Inter,system-ui,sans-serif">${identified}</text>`;

    // Box 2: Registers
    s += box(x2, by, bw, bh, '#3b82f6', '#eff6ff');
    s += `<text x="${x2 + bw / 2}" y="${by + MBH / 2 - 10}" text-anchor="middle" font-size="9.5" fill="#1d4ed8" font-family="Inter,system-ui,sans-serif">Registers</text>`;
    s += `<text x="${x2 + bw / 2}" y="${by + MBH / 2 + 14}" text-anchor="middle" font-size="22" font-weight="700" fill="#1d4ed8" font-family="Inter,system-ui,sans-serif">${registers}</text>`;

    // Merge arrows
    const cy1 = by + bh;
    const mergeY = y_dedup - MBH / 2 - 12;
    const cx1 = x1 + bw / 2;
    const cx2 = x2 + bw / 2;

    s += `<line x1="${cx1}" y1="${cy1}" x2="${cx1}" y2="${mergeY}" stroke="#94a3b8" stroke-width="1.8"/>`;
    s += `<line x1="${cx2}" y1="${cy1}" x2="${cx2}" y2="${mergeY}" stroke="#94a3b8" stroke-width="1.8"/>`;
    s += `<line x1="${cx1}" y1="${mergeY}" x2="${cx2}" y2="${mergeY}" stroke="#94a3b8" stroke-width="1.8"/>`;
    s += `<line x1="${MCX}" y1="${mergeY}" x2="${MCX}" y2="${y_dedup - MBH / 2 - 8}" stroke="#94a3b8" stroke-width="2" marker-end="url(#pArr)"/>`;
    
    return s;
  }

  // Assemble SVG
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SVG_W} ${SVG_H}" width="${SVG_W}" height="${SVG_H}" style="display:block;max-width:100%;font-family:Inter,system-ui,sans-serif;">
  <defs>
    <marker id="pArr" markerWidth="9" markerHeight="9" refX="5" refY="4.5" orient="auto">
      <polygon points="1,1 8,4.5 1,8" fill="#94a3b8"/>
    </marker>
    <marker id="pArrAmber" markerWidth="9" markerHeight="9" refX="5" refY="4.5" orient="auto">
      <polygon points="1,1 8,4.5 1,8" fill="#f59e0b"/>
    </marker>
  </defs>

  ${phaseLabel(y_phase_id, 'Identification', '#3b82f6')}
  ${topPair()}
  ${mainBox(y_dedup, 'Records after duplicates removed', afterDupes, '#6366f1', '#4338ca')}

  ${arrowStub(y_dedup, y_phase_sc)}
  ${phaseLabel(y_phase_sc, 'Screening', '#7c3aed')}
  ${arrowFromLabel(y_phase_sc, y_screen)}
  ${mainBox(y_screen, 'Records screened', screened, '#7c3aed', '#5b21b6')}
  ${arrowSide(y_screen)}
  ${sideBox(y_screen, 'Excluded (title/abstract)', [`Excluded: ${exclScreen}`], '#f59e0b')}

  ${arrowDown(y_screen, y_sought)}
  ${mainBox(y_sought, 'Reports sought for retrieval', sought, '#7c3aed', '#5b21b6')}
  ${arrowSide(y_sought)}
  ${sideBox(y_sought, 'Not retrieved', [`Not retrieved: ${notRetrieved}`], '#f59e0b')}

  ${arrowDown(y_sought, y_ft)}
  ${mainBox(y_ft, 'Full-text reports assessed', fullText, '#7c3aed', '#5b21b6')}
  ${arrowSide(y_ft)}
  ${sideBox(y_ft, 'Excluded (full-text)', exclLines, '#f04438')}

  ${arrowStub(y_ft, y_phase_in)}
  ${phaseLabel(y_phase_in, 'Included', '#16a34a')}
  ${arrowFromLabel(y_phase_in, y_inc)}
  ${mainBox(y_inc, 'Studies included in synthesis', included, '#16a34a', '#15803d')}
</svg>`;

  container.innerHTML = svg;
  return svg;
}

/**
 * Download PRISMA diagram as SVG
 */
export function downloadPrismaSVG(containerId = 'prisma-diagram') {
  const svg = document.getElementById(containerId);
  if (!svg) return;

  const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'prisma-flow-diagram.svg';
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Get PRISMA data from state
 */
export function getPrismaDataFromState(state) {
  const getVal = (id) => {
    const el = typeof document !== 'undefined' ? document.getElementById(id) : null;
    return el ? parseInt(el.value) || 0 : 0;
  };

  return {
    identified: getVal('prisma-identified'),
    registers: getVal('prisma-registers'),
    dupes: getVal('prisma-dupes'),
    screened: getVal('prisma-screened'),
    exclScreen: getVal('prisma-excl-screen'),
    sought: getVal('prisma-sought'),
    notRetrieved: getVal('prisma-not-retrieved'),
    fullText: getVal('prisma-fulltext'),
    exclFull: getVal('prisma-excl-fulltext'),
    included: state.studies?.filter(s => s.included !== false).length || 0,
    exclReasons: state.exclusionReasons || []
  };
}

export default {
  renderPrismaFlow,
  downloadPrismaSVG,
  getPrismaDataFromState
};
