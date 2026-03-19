/**
 * State Management Module
 * Central state management for the MetaAnalysis Pro application
 */

// Application state
export let state = {
  pico: { p:'', i:'', c:'', o:'' },
  prospero: '',
  studies: [],
  eligibility: null,
  robTool: 'rob2',
  prisma: {},
  exclusionReasons: [
    {id:1,text:'Wrong Population',n:0},
    {id:2,text:'Wrong Intervention/Exposure',n:0},
    {id:3,text:'Wrong Outcome',n:0},
    {id:4,text:'Wrong Study Design',n:0},
    {id:5,text:'Insufficient Data',n:0}
  ],
  gradeOutcomes: [],
  statModel: 'random',
  effectMeasure: 'MD',
  ciZ: 1.96,
  _lastStats: null
};

// Tab labels mapping
export const TAB_LABELS = {
  'tab-pico': 'PICO',
  'tab-search': 'Search',
  'tab-extraction': 'Extraction',
  'tab-forest': 'Forest Plot',
  'tab-funnel': 'Funnel Plot',
  'tab-stats': 'Statistics',
  'tab-grade': 'GRADE',
  'tab-report': 'Report',
  'tab-aipaper': 'AI Paper'
};

/**
 * Classify study design
 * @param {string} design - Study design type
 * @returns {boolean}
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
  const cls = cat==='RCT' ? 'design-rct' : 'design-obs';
  return `<span class="tag ${cls}" style="font-size:9px;">${design||'RCT'}</span>`;
}

export function isTimeToEvent(measure) { 
  return measure==='HR'||measure==='IRR'; 
}

export function isLogScale(measure) { 
  return ['OR','RR','HR','IRR'].includes(measure); 
}

/**
 * Update state and trigger save
 * @param {string} key - State key to update
 * @param {any} value - New value
 */
export function updateState(key, value) {
  state[key] = value;
  // Auto-save to localStorage
  saveProject();
}

/**
 * Save project to localStorage
 */
export function saveProject() {
  try {
    localStorage.setItem('meta_analysis_project', JSON.stringify({
      state,
      timestamp: new Date().toISOString()
    }));
  } catch(e) {
    console.error('Failed to save project:', e);
  }
}

/**
 * Load project from localStorage
 * @returns {object|null}
 */
export function loadProject() {
  try {
    const saved = localStorage.getItem('meta_analysis_project');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.state) {
        state = { ...state, ...data.state };
      }
      return data;
    }
  } catch(e) {
    console.error('Failed to load project:', e);
  }
  return null;
}
