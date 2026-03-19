# MetaAnalysis Pro — Refactoring Status

## ✅ Completed Modules

| File | Description | Status |
|------|-------------|--------|
| `css/style.css` | Complete CSS extraction | ✅ Complete |
| `js/state.js` | State management module | ✅ Complete |
| `js/study-manager.js` | Study CRUD operations | ✅ Complete |
| `js/search-engines.js` | Database search (PubMed, Europe PMC, etc.) | ✅ Complete |
| `js/ai-extractor.js` | Groq API integration | ✅ Complete |
| `js/statistics.js` | Meta-analysis calculations | ✅ Complete |
| `js/main.js` | Main application coordinator | ✅ Complete |
| `js/firebase-config.js` | Firebase configuration template | ✅ Complete |
| `index.html` | Clean HTML structure | ⚠️ Needs full content |

## ⚠️ Remaining Migration Work

The original `index.html` contained approximately **7,400 lines of inline JavaScript**. The following functions need to be migrated to ES modules:

### High Priority (Core Functionality)
1. **Forest Plot** (`renderForest()`) — D3.js visualization
2. **Funnel Plot** (`renderFunnel()`) — Publication bias visualization  
3. **GRADE** (`renderGrade()`, `calcGrade()`) — Certainty assessment
4. **Risk of Bias** (`renderRoBHeatmap()`, `updateRoB()`) — Traffic light visualization
5. **PRISMA** (`renderPrisma()`, `syncPrismaInputs()`) — Flow diagram
6. **Export Functions** — HTML, CSV, JSON, PRISMA checklist

### Medium Priority
7. **Subgroup Analysis** (`runSubgroup()`)
8. **Meta-Regression** (`runMetaReg()`)
9. **Sensitivity Analysis** (`renderSensitivity()`)
10. **Kappa Calculator** (`calcKappa()`)
11. **Dashboard** (`renderDashboard()`)
12. **Timeline/Logging** functions

### Lower Priority (Can use legacy)
13. **PICO Builder** — Boolean query builder (partially migrated)
14. **Search History** — PICO history management
15. **RIS Import** — Citation file parsing

## 📁 Recommended Module Structure

```
js/
├── main.js              ✅ Core app coordinator
├── state.js             ✅ State management
├── study-manager.js     ✅ Study CRUD
├── search-engines.js    ✅ Database search
├── ai-extractor.js      ✅ Groq API
├── statistics.js        ✅ Meta-analysis calculations
├── firebase-config.js   ✅ Firebase setup
├── forest-plot.js       ⏳ TODO: D3.js forest plot
├── funnel-plot.js       ⏳ TODO: Publication bias
├── grade.js             ⏳ TODO: GRADE assessment
├── rob.js               ⏳ TODO: Risk of Bias
├── prisma.js            ⏳ TODO: PRISMA diagram
├── export.js            ⏳ TODO: Export functions
├── subgroup.js          ⏳ TODO: Subgroup analysis
├── dashboard.js         ⏳ TODO: Dashboard
└── legacy-compat.js     ⚠️ Temporary fallback
```

## 🔄 Migration Strategy

### Option A: Gradual Migration (Recommended)
1. Keep `legacy-compat.js` loaded for missing functions
2. Migrate one module at a time (e.g., `forest-plot.js` first)
3. Test each module independently
4. Remove migrated functions from `legacy-compat.js`

### Option B: Full Rewrite
1. Use the existing modules as foundation
2. Re-implement remaining features using modern patterns
3. More work but cleaner end result

## 🧪 Testing Checklist

For each migrated module:
- [ ] Function exports correctly
- [ ] Dependencies imported properly
- [ ] UI renders correctly
- [ ] Interactions work (clicks, inputs)
- [ ] Data persists to localStorage
- [ ] Error handling works

## 📝 Next Steps

1. **Immediate**: Copy original HTML body content to `index.html`
2. **Short-term**: Migrate forest-plot.js and funnel-plot.js
3. **Medium-term**: Complete GRADE and RoB modules
4. **Long-term**: Add Firebase integration for cloud sync

## 🔧 Quick Fix for Current Setup

To make the current refactored version work:

1. **Restore HTML content** from git backup:
```bash
git show HEAD:index.html > index.html.backup
# Then extract the HTML body content (lines 600-3700 approx)
```

2. **Load legacy-compat.js** for missing functions:
```html
<script src="js/legacy-compat.js" defer></script>
```

3. **Test core functionality**:
- PICO builder
- Database search
- Study management
- Statistics (basic)

## 📊 Progress: ~35% Complete

- ✅ CSS/Style: 100%
- ✅ Core modules: 60%
- ⚠️ Visualization: 0%
- ⚠️ HTML structure: 50%
- ⏳ Full functionality: 35%
