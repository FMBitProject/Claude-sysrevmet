/**
 * UI Components Module
 * Reusable UI components for all tabs
 * 
 * @module ui-components
 */

/**
 * Show loading state
 */
export function showLoading(containerId, message = 'Loading...') {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = `
    <div style="text-align:center;padding:40px;color:var(--text3);">
      <div class="spinner" style="width:24px;height:24px;border-width:3px;margin:0 auto 12px;"></div>
      <div style="font-size:13px;font-weight:600;">${message}</div>
    </div>`;
}

/**
 * Show skeleton loading
 */
export function showSkeleton(containerId, rows = 3) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = Array(rows).fill(`
    <div style="display:flex;gap:12px;margin-bottom:12px;animation:pulse 1.5s ease-in-out infinite;">
      <div style="width:40px;height:40px;background:var(--bg3);border-radius:6px;"></div>
      <div style="flex:1;">
        <div style="height:16px;background:var(--bg3);border-radius:4px;margin-bottom:8px;"></div>
        <div style="height:12px;background:var(--bg3);border-radius:4px;width:60%;"></div>
      </div>
    </div>
  `).join('');
}

/**
 * Show empty state
 */
export function showEmptyState(containerId, icon, title, message, action = null) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = `
    <div style="text-align:center;padding:40px;color:var(--text3);">
      <div style="font-size:48px;margin-bottom:12px;">${icon}</div>
      <div style="font-size:14px;font-weight:600;color:var(--text);margin-bottom:4px;">${title}</div>
      <div style="font-size:12px;margin-bottom:16px;">${message}</div>
      ${action ? `<button class="btn btn-primary btn-sm" onclick="${action}">${action}</button>` : ''}
    </div>`;
}

/**
 * Show error state
 */
export function showError(containerId, title, message, onRetry = null) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = `
    <div style="padding:20px;background:var(--redl);border:1px solid var(--red);border-radius:6px;">
      <div style="color:var(--red);font-weight:600;margin-bottom:8px;">⚠️ ${title}</div>
      <div style="font-size:11px;color:var(--text3);margin-bottom:12px;">${message}</div>
      ${onRetry ? `<button class="btn btn-ghost btn-sm" onclick="${onRetry}" style="color:var(--red);border-color:var(--red);">🔄 Retry</button>` : ''}
    </div>`;
}

/**
 * Show success state
 */
export function showSuccess(containerId, message) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = `
    <div style="padding:16px;background:var(--greenl);border:1px solid var(--green);border-radius:6px;">
      <div style="color:var(--green);font-weight:600;font-size:12px;">✅ ${message}</div>
    </div>`;
}

/**
 * Create card component
 */
export function createCard(title, content, options = {}) {
  return `
    <div class="card" style="${options.style || ''}">
      ${title ? `<div class="card-title">${title}</div>` : ''}
      ${content}
      ${options.footer ? `<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border);">${options.footer}</div>` : ''}
    </div>
  `;
}

/**
 * Create grid layout
 */
export function createGrid(columns, items) {
  return `
    <div style="display:grid;grid-template-columns:repeat(${columns},1fr);gap:16px;">
      ${items.join('')}
    </div>
  `;
}

/**
 * Create form input
 */
export function createInput(label, options = {}) {
  return `
    <div>
      <label style="font-size:11px;color:var(--text3);display:block;margin-bottom:4px;font-weight:600;">${label}</label>
      <input type="${options.type || 'text'}" 
             id="${options.id}" 
             value="${options.value || ''}" 
             placeholder="${options.placeholder || ''}"
             onchange="${options.onchange || ''}"
             style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:6px;font-size:12px;font-family:var(--font);"/>
    </div>
  `;
}

/**
 * Create select input
 */
export function createSelect(label, options, selected = null) {
  return `
    <div>
      <label style="font-size:11px;color:var(--text3);display:block;margin-bottom:4px;font-weight:600;">${label}</label>
      <select style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:6px;font-size:12px;font-family:var(--font);">
        ${options.map(opt => `<option value="${opt.value}" ${opt.value === selected ? 'selected' : ''}>${opt.label}</option>`).join('')}
      </select>
    </div>
  `;
}

/**
 * Create button
 */
export function createButton(label, options = {}) {
  const variant = options.variant || 'primary';
  const variants = {
    primary: 'btn-primary',
    ghost: 'btn-ghost',
    success: 'btn-success',
    danger: 'btn-danger'
  };
  
  return `
    <button class="btn ${variants[variant]} ${options.size || ''}" 
            onclick="${options.onclick || ''}"
            ${options.disabled ? 'disabled' : ''}
            style="${options.style || ''}">
      ${options.icon || ''}${label}
    </button>
  `;
}

/**
 * Create badge
 */
export function createBadge(text, color = 'var(--accent)') {
  return `
    <span style="padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;background:${color}20;color:${color};">
      ${text}
    </span>
  `;
}

/**
 * Create progress bar
 */
export function createProgress(value, max = 100, options = {}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const color = options.color || 'var(--accent)';
  
  return `
    <div style="height:8px;background:var(--bg3);border-radius:4px;overflow:hidden;">
      <div style="width:${percentage}%;height:100%;background:${color};transition:width .3s ease;"></div>
    </div>
    ${options.showValue ? `<div style="font-size:10px;color:var(--text3);margin-top:4px;text-align:${options.align || 'left'};">${value}/${max} (${percentage.toFixed(0)}%)</div>` : ''}
  `;
}

/**
 * Create table
 */
export function createTable(headers, rows, options = {}) {
  return `
    <div style="overflow-x:auto;">
      <table class="tbl">
        <thead>
          <tr>
            ${headers.map(h => `<th>${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map(row => `
            <tr>
              ${row.map(cell => `<td>${cell}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * Create tabs
 */
export function createTabs(tabs, activeTab, onTabChange) {
  return `
    <div style="display:flex;gap:4px;border-bottom:1px solid var(--border);margin-bottom:16px;">
      ${tabs.map(tab => `
        <button class="btn btn-ghost btn-sm" 
                style="border-bottom:2px solid ${tab.id === activeTab ? 'var(--accent)' : 'transparent'};border-radius:0;"
                onclick="${onTabChange}('${tab.id}')">
          ${tab.icon || ''}${tab.label}
        </button>
      `).join('')}
    </div>
  `;
}

/**
 * Create accordion
 */
export function createAccordion(items) {
  return items.map((item, index) => `
    <details style="background:var(--bg3);border-radius:6px;margin-bottom:8px;overflow:hidden;">
      <summary style="padding:12px 16px;font-size:12px;font-weight:600;cursor:pointer;list-style:none;display:flex;align-items:center;gap:8px;">
        <span style="color:var(--accent);font-size:10px;">▶</span>
        ${item.title}
      </summary>
      <div style="padding:0 16px 16px 40px;font-size:11px;color:var(--text2);line-height:1.6;">
        ${item.content}
      </div>
    </details>
  `).join('');
}

/**
 * Create modal
 */
export function createModal(title, content, options = {}) {
  return `
    <div class="modal-overlay" id="${options.id || 'modal'}" style="display:flex;z-index:1000;">
      <div class="modal" style="max-width:${options.width || '500px'};">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <div class="modal-title" style="margin:0;">${title}</div>
          <button onclick="document.getElementById('${options.id || 'modal'}').style.display='none'" 
                  style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--text3);">✕</button>
        </div>
        ${content}
        ${options.footer ? `<div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border);display:flex;gap:8px;justify-content:flex-end;">${options.footer}</div>` : ''}
      </div>
    </div>
  `;
}

/**
 * Create tooltip
 */
export function createTooltip(content, position = 'top') {
  const positions = {
    top: 'bottom:100%;left:50%;transform:translateX(-50%);margin-bottom:8px;',
    bottom: 'top:100%;left:50%;transform:translateX(-50%);margin-top:8px;',
    right: 'left:100%;top:50%;transform:translateY(-50%);margin-left:8px;',
    left: 'right:100%;top:50%;transform:translateY(-50%);margin-right:8px;'
  };
  
  return `
    <div style="position:absolute;${positions[position]};background:var(--text);color:var(--bg2);padding:6px 10px;border-radius:6px;font-size:10px;white-space:nowrap;z-index:1000;box-shadow:0 4px 12px rgba(0,0,0,.15);">
      ${content}
    </div>
  `;
}

export default {
  showLoading,
  showSkeleton,
  showEmptyState,
  showError,
  showSuccess,
  createCard,
  createGrid,
  createInput,
  createSelect,
  createButton,
  createBadge,
  createProgress,
  createTable,
  createTabs,
  createAccordion,
  createModal,
  createTooltip
};
