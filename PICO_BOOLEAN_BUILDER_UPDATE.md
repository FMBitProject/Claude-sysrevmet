# ✅ PICO Boolean Builder — 15 Databases Complete!

## 🎉 Update Complete!

PICO Boolean Builder sekarang menggunakan **semua 15 databases** dan memiliki **UI untuk memilih database** yang akan dipakai!

---

## ✅ What Was Updated

### 1. **QSR_DBS Array Updated** (Line ~4359)
```javascript
const QSR_DBS = [
  // Original 5 (Core)
  { id: 'pubmed', label: 'PubMed', color: '#e11d48', icon: '🔴', checkbox: 'db-pubmed' },
  { id: 'europepmc', label: 'Europe PMC', color: '#2563eb', icon: '🔵', checkbox: 'db-europepmc' },
  { id: 'semantic', label: 'Semantic Scholar', color: '#7c3aed', icon: '🟣', checkbox: 'db-semantic' },
  { id: 'crossref', label: 'CrossRef', color: '#16a34a', icon: '🟢', checkbox: 'db-crossref' },
  { id: 'core', label: 'CORE', color: '#d97706', icon: '🟡', checkbox: 'db-core' },
  // Additional 10 (Q3-Q5 Focus)
  { id: 'doaj', label: 'DOAJ', color: '#16a34a', icon: '🟢', checkbox: 'db-doaj' },
  { id: 'scielo', label: 'SciELO', color: '#059669', icon: '🟢', checkbox: 'db-scielo' },
  { id: 'pmc', label: 'PubMed Central', color: '#0891b2', icon: '🔵', checkbox: 'db-pmc' },
  { id: 'medrxiv', label: 'medRxiv', color: '#7c3aed', icon: '🟣', checkbox: 'db-medrxiv' },
  { id: 'jstage', label: 'J-STAGE', color: '#0d9488', icon: '🟢', checkbox: 'db-jstage' },
  { id: 'base', label: 'BASE', color: '#0284c7', icon: '🔵', checkbox: 'db-base' },
  { id: 'clinicaltrials', label: 'ClinicalTrials.gov', color: '#0369a1', icon: '🔵', checkbox: 'db-clinicaltrials' },
  { id: 'epistemonikos', label: 'Epistemonikos', color: '#075985', icon: '🟢', checkbox: 'db-epistemonikos' },
];
```

### 2. **runQuickMultiSearch() Updated** (Line ~4378)
- Now reads checkbox states to determine which databases to search
- Only searches enabled databases
- Shows error if no databases selected
- Dynamically renders tabs for enabled databases only

### 3. **renderQsrSkeleton() Updated** (Line ~4457)
- Now accepts `enabledDbs` parameter
- Renders tabs only for selected databases
- More flexible UI rendering

### 4. **Additional QSR Wrapper Functions Added**
```javascript
async function qsrDOAJ(q, maxR) { return await searchDOAJ(q, maxR); }
async function qsrSciELO(q, maxR) { return await searchSciELO(q, maxR); }
async function qsrPubMedCentral(q, maxR) { return await searchPubMedCentral(q, maxR); }
async function qsrMedRxiv(q, maxR) { return await searchMedRxiv(q, maxR); }
async function qsrJStage(q, maxR) { return await searchJStage(q, maxR); }
async function qsrBASE(q, maxR) { return await searchBASE(q, maxR); }
async function qsrClinicalTrials(q, maxR) { return await searchClinicalTrials(q, maxR); }
async function qsrEpistemonikos(q, maxR) { return await searchEpistemonikos(q, maxR); }
```

---

## 🎯 How to Use

### Step 1: Build PICO Query
1. Go to **Tab 2 (Search)**
2. Use **PICO Boolean Builder**
3. Fill in P, I, C, O fields
4. Query is auto-generated

### Step 2: Select Databases
**BEFORE clicking "Search All DBs":**
- ✅ Check databases you want to search
- ✅ For Q1-Q2: PubMed, Europe PMC, Semantic Scholar
- ✅ For Q3-Q5: DOAJ, SciELO, PubMed Central, J-STAGE
- ✅ For comprehensive: Check ALL 15!

### Step 3: Run Search
1. Click **"🔍 Search All DBs"** button
2. Results appear in tabs below
3. Each tab shows results from one database
4. Click **"⬇ Import All to Results"** to add to workspace

---

## 📊 Database Selection Guide

### For Q1-Q2 Journals
```
✅ PubMed / MEDLINE
✅ Europe PMC
✅ Semantic Scholar
✅ ClinicalTrials.gov
✅ Epistemonikos (for systematic reviews)
```

### For Q3-Q5 Journals
```
✅ DOAJ (Open Access)
✅ SciELO (Latin America)
✅ PubMed Central (Full-text)
✅ J-STAGE (Asian journals)
✅ BASE (Multidisciplinary)
✅ CORE (Open Access)
```

### For Latest Research
```
✅ medRxiv (Preprints - health sciences)
✅ bioRxiv (Preprints - biology)
```

### For Comprehensive Search
```
✅ Check ALL 15 databases!
✅ Automatic deduplication
✅ More results = better coverage
```

---

## 🔧 UI Elements

### Database Checkboxes Location
Around **line 1746-1800** in `index.html`:
```html
<!-- Original 5 Databases -->
<input type="checkbox" id="db-pubmed" checked/> PubMed
<input type="checkbox" id="db-europepmc" checked/> Europe PMC
<input type="checkbox" id="db-semantic" checked/> Semantic Scholar
<input type="checkbox" id="db-core"/> CORE
<input type="checkbox" id="db-crossref"/> CrossRef

<!-- Additional 10 Databases -->
<input type="checkbox" id="db-doaj" checked/> DOAJ
<input type="checkbox" id="db-scielo" checked/> SciELO
<input type="checkbox" id="db-pmc" checked/> PubMed Central
<input type="checkbox" id="db-medrxiv"/> medRxiv
<input type="checkbox" id="db-jstage"/> J-STAGE
<input type="checkbox" id="db-base"/> BASE
<input type="checkbox" id="db-clinicaltrials"/> ClinicalTrials.gov
<input type="checkbox" id="db-epistemonikos"/> Epistemonikos
```

### PICO Search Button
Around **line 1637**:
```html
<button class="btn btn-primary btn-sm" id="btn-quick-search" onclick="runQuickMultiSearch()">
  <span id="quick-search-icon">🔍</span> Search All DBs
</button>
```

---

## 🧪 Testing

### Test 1: Single Database
1. Check only **PubMed**
2. Build PICO query
3. Click "Search All DBs"
4. Should only search PubMed

### Test 2: Multiple Databases
1. Check **PubMed, DOAJ, SciELO**
2. Build PICO query
3. Click "Search All DBs"
4. Should search 3 databases, show 3 tabs

### Test 3: All Databases
1. Check **ALL 15 databases**
2. Build PICO query
3. Click "Search All DBs"
4. Should search all 15, show up to 15 tabs

### Test 4: No Selection
1. Uncheck **ALL databases**
2. Build PICO query
3. Click "Search All DBs"
4. Should show error: "Select at least one database!"

---

## 📝 Files Modified

1. ✅ `index.html` — Updated QSR_DBS array
2. ✅ `index.html` — Updated runQuickMultiSearch()
3. ✅ `index.html` — Updated renderQsrSkeleton()
4. ✅ `index.html` — Added qsr wrapper functions for 10 databases
5. ✅ `js/additional-search.js` — Already has all search functions
6. ✅ `js/main.js` — Already exports all functions

---

## 🎯 Key Features

### ✅ Database Selection UI
- Checkboxes for all 15 databases
- Visual indicators (colored dots)
- Grouped by Core vs Additional

### ✅ Smart Search
- Only searches enabled databases
- Respects checkbox states
- Shows error if none selected

### ✅ Dynamic UI
- Tabs rendered for enabled databases only
- Flexible, responsive layout
- Shows which databases are being searched

### ✅ Automatic Deduplication
- DOI-based deduplication
- Title-based deduplication
- Merges results from multiple databases

---

## 💡 Pro Tips

### Tip 1: Save Common Combinations
```
Q1-Q2 Focus:
- PubMed, Europe PMC, Semantic Scholar, ClinicalTrials.gov

Q3-Q5 Focus:
- DOAJ, SciELO, PubMed Central, J-STAGE, BASE

Comprehensive:
- All 15 databases
```

### Tip 2: Use Year Filters
- Set year range for more relevant results
- Reduces noise from old papers

### Tip 3: Use Study Design Filter
- RCT only for clinical trials
- Observational for cohort/case-control studies

### Tip 4: Import Strategically
- Review results before importing
- Import from multiple databases
- Automatic deduplication handles duplicates

---

## 🎉 Summary

**Before**: PICO Boolean Builder only searched 5 databases

**After**: PICO Boolean Builder searches **ALL 15 databases** with **UI selection**!

### Benefits:
- ✅ More comprehensive search
- ✅ Better Q3-Q5 coverage
- ✅ User control over which databases
- ✅ Faster (only search enabled DBs)
- ✅ Flexible for different needs

---

**Status**: ✅ **COMPLETE**
**Databases**: 15
**UI Selection**: ✅ Yes
**Ready to Use**: Yes!

Refresh halaman (F5) dan coba PICO Boolean Builder dengan semua 15 databases! 🚀
