# 🚀 MetaAnalysis Pro — Remaining Work Plan

## ✅ What's Complete (70%)

### Core Modules
- ✅ State Management (`js/state.js`)
- ✅ Study Manager (`js/study-manager.js`)
- ✅ Search Engines - 15 databases (`js/search-engines.js`, `js/additional-search.js`)
- ✅ AI Extractor - Groq API (`js/ai-extractor.js`)
- ✅ Statistics Engine (`js/statistics.js`)
- ✅ Dashboard & Logging (`js/dashboard.js`)
- ✅ Eligibility Criteria (`js/eligibility.js`)

### Visualization Modules
- ✅ Forest Plot - Complete D3.js (`js/forest-plot-complete.js`)
- ✅ Funnel Plot (`js/funnel-plot.js`)
- ✅ GRADE Assessment (`js/grade-assessment.js`)
- ✅ RoB Visualization (`js/rob-visual.js`)
- ✅ PRISMA Flow (`js/prisma.js`)

### Export Modules
- ✅ Export Functions (`js/export.js`)

### UI Components
- ✅ PICO Database Selector (`add-pico-db-selector.js`)
- ✅ QSR Tabs Scroll (`qsr-tabs-scroll.js`)
- ✅ Additional Databases UI (`add-databases-ui.js`)

### CSS
- ✅ Complete Stylesheet (`css/style.css`)

### Documentation
- ✅ 10+ guide documents

---

## ⏳ What's Remaining (30%)

### Priority 1: Integration & Wiring (HIGH)

#### 1. Update main.js to Import All Modules
**File**: `js/main.js`
**Task**: Add imports for all new modules
```javascript
import { renderForestPlot } from './forest-plot-complete.js';
import { renderGradeEditor, renderSoFTable } from './grade-assessment.js';
import { renderRoBHeatmap } from './rob-visual.js';
import { renderPrismaFlow } from './prisma.js';
```

**Estimated Time**: 30 minutes

---

#### 2. Create Tab Navigation System
**File**: `js/navigation.js` (NEW)
**Task**: Create centralized tab navigation
```javascript
export function initNavigation() {
  // Render sidebar nav items
  // Render tab pills
  // Handle tab switching
  // Update breadcrumbs
}

export function showTab(tabId) {
  // Hide all tabs
  // Show selected tab
  // Update active states
  // Trigger tab-specific renders
}
```

**Estimated Time**: 1 hour

---

#### 3. Wire Up All Tab Contents
**Files**: Various
**Task**: Render content for each tab on activation

| Tab | Function Needed | Status |
|-----|----------------|--------|
| Dashboard | `renderDashboard()` | ✅ Done |
| PICO | `renderPICOBuilder()` | ⚠️ Needs update |
| Search | `renderSearchForm()` | ⚠️ Needs update |
| Extraction | `renderAIExtractor()` | ⚠️ Needs update |
| Forest | `renderForestPlot()` | ✅ Done |
| Funnel | `renderFunnelPlot()` | ✅ Done |
| GRADE | `renderGradeEditor()` | ✅ Done |
| RoB | `renderRoBHeatmap()` | ✅ Done |
| PRISMA | `renderPrismaFlow()` | ✅ Done |
| Stats | `renderStatsSettings()` | ⚠️ Needs update |
| Export | Already wired | ✅ Done |

**Estimated Time**: 3 hours

---

### Priority 2: Data Flow & State Management (HIGH)

#### 4. Centralize State Updates
**File**: `js/state-manager.js` (NEW)
**Task**: Create reactive state management
```javascript
export class StateManager {
  constructor(initialState) {
    this.state = initialState;
    this.listeners = [];
  }
  
  update(key, value) {
    this.state[key] = value;
    this.notifyListeners();
    this.saveToLocalStorage();
  }
  
  subscribe(callback) {
    this.listeners.push(callback);
  }
  
  notifyListeners() {
    this.listeners.forEach(cb => cb(this.state));
  }
  
  saveToLocalStorage() {
    localStorage.setItem('meta_analysis_state', JSON.stringify(this.state));
  }
}
```

**Estimated Time**: 2 hours

---

#### 5. Connect Statistics to Visualizations
**Task**: Ensure stats flow to forest/funnel plots
```javascript
// When stats are run:
function runStats() {
  const results = calculateMetaAnalysis();
  state._lastStats = results;
  
  // Auto-render visualizations
  renderForestPlot(results, 'forest-plot');
  renderFunnelPlot(results, 'funnel-plot');
}
```

**Estimated Time**: 1 hour

---

#### 6. Connect GRADE to SoF Table
**Task**: Auto-update SoF when GRADE outcomes change
```javascript
function updateGradeOutcome(index, field, value) {
  state.gradeOutcomes[index][field] = value;
  renderGradeEditor(state.gradeOutcomes);
  renderSoFTable(state.gradeOutcomes); // Auto-update
}
```

**Status**: ✅ Already implemented in `grade-assessment.js`

---

### Priority 3: UI Polish (MEDIUM)

#### 7. Create Loading States
**File**: `js/ui-components.js` (NEW)
**Task**: Add loading spinners and skeleton screens
```javascript
export function showLoading(containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = `
    <div style="text-align:center;padding:40px;">
      <div class="spinner"></div>
      <div style="margin-top:12px;color:var(--text3);">Loading...</div>
    </div>`;
}

export function showSkeleton(containerId, rows = 3) {
  // Render skeleton loading state
}
```

**Estimated Time**: 1 hour

---

#### 8. Add Error Boundaries
**Task**: Graceful error handling for all modules
```javascript
export function withErrorBoundary(Component, containerId) {
  try {
    return Component();
  } catch(error) {
    console.error('Error rendering:', error);
    const container = document.getElementById(containerId);
    container.innerHTML = `
      <div style="padding:20px;background:var(--redl);border:1px solid var(--red);border-radius:6px;">
        <div style="color:var(--red);font-weight:600;margin-bottom:8px;">⚠️ Error loading this section</div>
        <div style="font-size:11px;color:var(--text3);">${error.message}</div>
        <button onclick="location.reload()" style="margin-top:12px;padding:6px 12px;background:var(--red);color:white;border:none;border-radius:4px;cursor:pointer;font-size:11px;">Reload</button>
      </div>`;
  }
}
```

**Estimated Time**: 1 hour

---

#### 9. Improve Responsive Design
**File**: `css/style.css`
**Task**: Add mobile-responsive styles
```css
@media (max-width: 768px) {
  .sidebar { display: none; }
  .topbar { left: 0 !important; }
  .main { margin-left: 0 !important; padding: 12px; }
  .grid2, .grid3, .grid4 { grid-template-columns: 1fr; }
  .qsr-db-tabs { overflow-x: scroll; }
}
```

**Status**: ⚠️ Partially done, needs completion

**Estimated Time**: 2 hours

---

### Priority 4: Testing & QA (MEDIUM)

#### 10. Create Test Suite
**File**: `tests/` (NEW DIRECTORY)
**Task**: Add unit tests for critical functions
```javascript
// tests/state.test.js
import { state, saveProject, loadProject } from '../js/state.js';

describe('State Management', () => {
  test('state initializes with default values', () => {
    expect(state.studies).toEqual([]);
    expect(state.pico).toBeDefined();
  });
  
  test('saveProject saves to localStorage', () => {
    saveProject();
    const saved = localStorage.getItem('meta_analysis_project');
    expect(saved).toBeDefined();
  });
});
```

**Estimated Time**: 4 hours

---

#### 11. Integration Testing
**Task**: Test full workflow
1. Create PICO → Search → Extract → Analyze → Export
2. Test all 15 databases
3. Test all export formats
4. Test GRADE workflow
5. Test RoB assessment

**Estimated Time**: 6 hours

---

### Priority 5: Performance Optimization (LOW)

#### 12. Lazy Load Modules
**Task**: Only load modules when needed
```javascript
// Instead of importing all at once
async function showTab(tabId) {
  if (tabId === 'tab-forest') {
    const { renderForestPlot } = await import('./forest-plot-complete.js');
    renderForestPlot(state._lastStats, 'forest-plot');
  }
}
```

**Estimated Time**: 2 hours

---

#### 13. Memoize Expensive Calculations
**Task**: Cache meta-analysis results
```javascript
const statsCache = new Map();

function runMetaAnalysis(studies, options) {
  const cacheKey = JSON.stringify({ studies: studies.map(s=>s.id), options });
  
  if (statsCache.has(cacheKey)) {
    return statsCache.get(cacheKey);
  }
  
  const results = calculateMetaAnalysis(studies, options);
  statsCache.set(cacheKey, results);
  return results;
}
```

**Estimated Time**: 1 hour

---

### Priority 6: Documentation & Deployment (LOW)

#### 14. Update User Documentation
**File**: `USER_GUIDE.md` (NEW)
**Task**: Create user-facing documentation
- Getting started
- Step-by-step workflow
- Feature explanations
- Troubleshooting

**Estimated Time**: 3 hours

---

#### 15. Deployment Setup
**Files**: `firebase.json`, `vercel.json`, etc.
**Task**: Configure deployment
```json
// firebase.json
{
  "hosting": {
    "public": ".",
    "ignore": ["node_modules"],
    "rewrites": [{
      "source": "**",
      "destination": "/index.html"
    }]
  }
}
```

**Estimated Time**: 1 hour

---

## 📅 Timeline Estimate

### Phase 1: Integration (Week 1)
- ✅ Day 1-2: Update main.js imports
- ✅ Day 2-3: Create navigation system
- ✅ Day 4-5: Wire up all tabs

### Phase 2: Data Flow (Week 2)
- ✅ Day 1-2: State manager
- ✅ Day 3: Connect stats to viz
- ✅ Day 4-5: Testing & bug fixes

### Phase 3: Polish (Week 3)
- ✅ Day 1: Loading states
- ✅ Day 2: Error boundaries
- ✅ Day 3-4: Responsive design
- ✅ Day 5: Final testing

### Phase 4: Testing & Deploy (Week 4)
- ✅ Day 1-3: Test suite
- ✅ Day 4: Integration testing
- ✅ Day 5: Deployment setup

**Total Estimated Time**: 4 weeks (part-time) or 2 weeks (full-time)

---

## 🎯 Next Immediate Steps

### 1. Update main.js (30 min)
Add all imports and exports

### 2. Create navigation.js (1 hour)
Centralized tab navigation

### 3. Test Forest Plot (30 min)
Ensure it renders with sample data

### 4. Test GRADE Editor (30 min)
Ensure outcomes can be added/edited

### 5. Test Full Workflow (2 hours)
PICO → Search → Extract → Analyze → Export

---

## 📊 Completion Status

| Category | Progress | Status |
|----------|----------|--------|
| **Core Modules** | 100% | ✅ Complete |
| **Visualization** | 100% | ✅ Complete |
| **Export** | 100% | ✅ Complete |
| **Integration** | 40% | ⚠️ In Progress |
| **Data Flow** | 60% | ⚠️ In Progress |
| **UI Polish** | 50% | ⚠️ In Progress |
| **Testing** | 10% | ❌ Not Started |
| **Documentation** | 70% | ⚠️ In Progress |
| **Deployment** | 0% | ❌ Not Started |
| **OVERALL** | **65%** | ⚠️ **In Progress** |

---

## 🚀 Quick Wins (Do These First!)

1. **Update main.js imports** — 30 min, immediate impact
2. **Test forest plot** — 30 min, visual win
3. **Test GRADE editor** — 30 min, functional win
4. **Add loading states** — 1 hour, UX improvement
5. **Create navigation.js** — 1 hour, foundational

**Total**: 3.5 hours for 80% perceived completion!

---

**Status**: Ready to Continue
**Next Step**: Update `main.js` with all imports
**Estimated to 100%**: 4 weeks part-time
