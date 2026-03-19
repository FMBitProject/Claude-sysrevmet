/**
 * Study Manager Module
 * Study creation, management, and data handling
 */

/**
 * Create a new study object
 */
export function makeStudyObj(overrides = {}) {
  return {
    id: overrides.id || 's_' + Date.now() + '_' + Math.random().toString(36).slice(2),
    pmid: '',
    doi: '',
    title: 'No title',
    author: 'N/A',
    year: 'N/A',
    journal: '',
    abstract: '',
    source_db: '',
    url: '',
    design: 'RCT',
    type: 'continuous',
    rob: initRoB(false),
    // Continuous data
    nt: '',
    mt: '',
    sdt: '',
    nc: '',
    mc: '',
    sdc: '',
    // Dichotomous data
    et: '',
    tt: '',
    ec: '',
    tc: '',
    // Pre-entered HR/OR/IRR (log scale)
    preEntered_es: '',
    preEntered_ciL: '',
    preEntered_ciH: '',
    n_total: 0,
    included: false,
    active: true,
    ...overrides
  };
}

/**
 * Initialize Risk of Bias object
 */
export function initRoB(isObs) {
  return {
    // RoB 2 domains
    d1: 'Unclear',
    d2: 'Unclear',
    d3: 'Unclear',
    d4: 'Unclear',
    d5: 'Unclear',
    // ROBINS-I domains
    ri1: 'Moderate',
    ri2: 'Moderate',
    ri3: 'Moderate',
    ri4: 'Moderate',
    ri5: 'Moderate',
    ri6: 'Moderate',
    ri7: 'Moderate',
    // NOS
    nos_selection: 0,
    nos_comparability: 0,
    nos_outcome: 0,
    nos_total: 0,
    overall: isObs ? 'Moderate' : 'Unclear'
  };
}

/**
 * Classify study design
 */
export function isObservational(design) {
  return ['Cohort-Prospective','Cohort-Retrospective','Case-Control','Nested-CC','Case-Cohort','Cross-sectional','Registry','Case-series','Cross-sectional-desc'].includes(design);
}

export function isRCT(design) {
  return ['RCT','Quasi-RCT','Cluster-RCT','Crossover'].includes(design);
}

export function designCategory(design) {
  if (isRCT(design)) return 'RCT';
  if (isObservational(design)) return 'Observational';
  return 'Other';
}

export function designBadgeHtml(design) {
  const cat = designCategory(design);
  const cls = cat === 'RCT' ? 'design-rct' : 'design-obs';
  return `<span class="tag ${cls}" style="font-size:9px;">${design || 'RCT'}</span>`;
}

export function isTimeToEvent(measure) {
  return measure === 'HR' || measure === 'IRR';
}

export function isLogScale(measure) {
  return ['OR','RR','HR','IRR'].includes(measure);
}

/**
 * Add study to state
 */
export function addStudy(study, state) {
  if (!state.studies) state.studies = [];
  state.studies.push(study);
  return study;
}

/**
 * Remove study from state
 */
export function removeStudy(studyId, state) {
  if (!state.studies) return false;
  const index = state.studies.findIndex(s => s.id === studyId);
  if (index > -1) {
    state.studies.splice(index, 1);
    return true;
  }
  return false;
}

/**
 * Update study data
 */
export function updateStudy(studyId, updates, state) {
  const study = state.studies?.find(s => s.id === studyId);
  if (study) {
    Object.assign(study, updates);
    return study;
  }
  return null;
}

/**
 * Get study by ID
 */
export function getStudy(studyId, state) {
  return state.studies?.find(s => s.id === studyId) || null;
}

/**
 * Get all included studies
 */
export function getIncludedStudies(state) {
  return state.studies?.filter(s => s.included !== false && s.active !== false) || [];
}

/**
 * Get studies by design type
 */
export function getStudiesByDesign(state, designType) {
  return state.studies?.filter(s => s.design === designType) || [];
}

/**
 * Calculate total participants
 */
export function getTotalParticipants(state) {
  return state.studies?.reduce((sum, s) => {
    const n = (parseInt(s.nt) || 0) + (parseInt(s.nc) || 0) || 
              (parseInt(s.tt) || 0) + (parseInt(s.tc) || 0) ||
              (parseInt(s.n_total) || 0);
    return sum + n;
  }, 0) || 0;
}

/**
 * Export studies to CSV
 */
export function exportStudiesToCSV(studies) {
  const headers = [
    'ID', 'Author', 'Year', 'Journal', 'Design', 'Type',
    'N_Intervention', 'Mean_Intervention', 'SD_Intervention',
    'N_Control', 'Mean_Control', 'SD_Control',
    'Events_Intervention', 'Total_Intervention',
    'Events_Control', 'Total_Control',
    'Effect_Size', 'CI_Lower', 'CI_Upper',
    'RoB_Overall', 'PMID', 'DOI'
  ];
  
  const rows = studies.map(s => [
    s.id,
    s.author,
    s.year,
    s.journal,
    s.design,
    s.type,
    s.nt,
    s.mt,
    s.sdt,
    s.nc,
    s.mc,
    s.sdc,
    s.et,
    s.tt,
    s.ec,
    s.tc,
    s.preEntered_es,
    s.preEntered_ciL,
    s.preEntered_ciH,
    s.rob.overall,
    s.pmid,
    s.doi
  ]);
  
  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell || ''}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'studies_' + new Date().toISOString().split('T')[0] + '.csv';
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Import studies from RIS file
 */
export async function importFromRIS(file) {
  const text = await file.text();
  const studies = [];
  const entries = text.split(/^ER\s*$/m);
  
  for (const entry of entries) {
    if (!entry.trim()) continue;
    
    const study = makeStudyObj();
    const lines = entry.split('\n');
    
    for (const line of lines) {
      const match = line.match(/^([A-Z0-9]+)\s*-\s*(.*)/);
      if (!match) continue;
      
      const [, tag, value] = match;
      const cleanValue = value.trim();
      
      switch (tag) {
        case 'TI':
          study.title = cleanValue;
          break;
        case 'AU':
          if (!study.author || study.author === 'N/A') {
            study.author = cleanValue;
          }
          break;
        case 'PY':
          study.year = cleanValue.split('/')[0];
          break;
        case 'JO':
        case 'JW':
          study.journal = cleanValue;
          break;
        case 'PMID':
          study.pmid = cleanValue;
          break;
        case 'DO':
          study.doi = cleanValue;
          break;
        case 'AB':
          study.abstract = cleanValue;
          break;
      }
    }
    
    if (study.title !== 'No title') {
      studies.push(study);
    }
  }
  
  return studies;
}

/**
 * Import studies from CSV
 */
export async function importFromCSV(file) {
  const text = await file.text();
  const lines = text.split('\n').filter(l => l.trim());
  const studies = [];
  
  // Parse headers
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    const study = makeStudyObj();
    
    headers.forEach((header, index) => {
      const value = (values[index] || '').trim().replace(/^"|"$/g, '');
      
      switch (header) {
        case 'Author': study.author = value; break;
        case 'Year': study.year = value; break;
        case 'Journal': study.journal = value; break;
        case 'Design': study.design = value; break;
        case 'Type': study.type = value; break;
        case 'N_Intervention': study.nt = value; break;
        case 'Mean_Intervention': study.mt = value; break;
        case 'SD_Intervention': study.sdt = value; break;
        case 'N_Control': study.nc = value; break;
        case 'Mean_Control': study.mc = value; break;
        case 'SD_Control': study.sdc = value; break;
        case 'Events_Intervention': study.et = value; break;
        case 'Total_Intervention': study.tt = value; break;
        case 'Events_Control': study.ec = value; break;
        case 'Total_Control': study.tc = value; break;
        case 'Effect_Size': study.preEntered_es = value; break;
        case 'CI_Lower': study.preEntered_ciL = value; break;
        case 'CI_Upper': study.preEntered_ciH = value; break;
        case 'PMID': study.pmid = value; break;
        case 'DOI': study.doi = value; break;
      }
    });
    
    studies.push(study);
  }
  
  return studies;
}
