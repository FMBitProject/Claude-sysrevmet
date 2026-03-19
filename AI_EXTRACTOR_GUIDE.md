# 🤖 AI Extractor — Best Practices Guide

## ✅ Best Text Formats for AI Extraction

### 1️⃣ **Structured Results Tables** (BEST)
```
Table 1: Baseline Characteristics
Group          N    Age (years)  BMI (kg/m²)  SBP (mmHg)
Intervention   120  58.3±10.2    28.4±4.1     142±15
Control        118  59.1±9.8     27.9±3.8     140±14

Outcomes at 12 weeks:
LDL-C (mg/dL):
- Intervention: 88.7±21.7 → 70.2±18.3 (reduction: 18.5±12.4)
- Control: 89.2±20.9 → 84.0±19.1 (reduction: 5.2±10.8)
Between-group difference: -13.8 mg/dL (95% CI: -11.6 to -15.3, p=0.002)
```

### 2️⃣ **Results Section with Clear Numbers** (GOOD)
```
RESULTS:
120 patients were randomized (60 intervention, 60 control).
Baseline LDL-C was 88.7±21.7 mg/dL in intervention group and 89.2±20.9 mg/dL in control group.
At 12 weeks, LDL-C decreased to 70.2±18.3 mg/dL in intervention vs 84.0±19.1 mg/dL in control.
The between-group difference was -13.8 mg/dL (95% CI -11.6 to -15.3, p=0.002).
```

### 3️⃣ **Abstract with Numbers** (OK)
```
ABSTRACT
Results: 120 patients completed the study. LDL-C levels decreased significantly in the intervention 
group (-18.5±12.4 mg/dL) compared with control (-5.2±10.8 mg/dL). Between-group difference was 
-13.8 mg/dL (95% CI -11.6 to -15.3, p=0.002).
```

---

## ❌ Text Formats That Don't Work Well

### Narrative/Descriptive Text (POOR)
```
From an original population of 361 patients initially screened we selected 182 patients 
who resulted being at high CV risk and were taking high at the same time a high intensity 
statin and ezetimibe. One hundred and twenty out of 182 (66%) were then selected for 
participating to this study because they had LDL-C levels above the threshold...
```

**Why it fails:**
- Numbers written as words ("One hundred and twenty")
- No clear group structure
- Mixed information (screening, selection, baseline)
- No clear outcome data structure

---

## 💡 Tips for Best Results

### ✅ DO:
1. **Paste from Results section** — Look for tables or structured text
2. **Include group labels** — "Intervention group", "Control group", "Treatment arm"
3. **Include clear numbers** — "120 patients", "88.7±21.7 mg/dL"
4. **Include statistical results** — "95% CI", "p=0.002", "mean difference"
5. **Use "Focus on" hint** — Tell AI what outcome to look for:
   - "Focus on LDL-C at 12 weeks"
   - "Focus on all-cause mortality"
   - "Focus on HbA1c changes"

### ❌ DON'T:
1. **Don't paste entire paper** — Too much noise
2. **Don't paste Introduction/Discussion** — No extractable numbers
3. **Don't paste screening flow** — Not outcome data
4. **Don't expect AI to calculate** — AI extracts, doesn't compute

---

## 🔧 If AI Extraction Fails

### Option 1: Try Different Text
```
Instead of: Full paragraph from methods
Try: Results table or outcomes section
```

### Option 2: Use "Focus on" Hint
```
In the "Outcome Hint" field, enter:
"LDL-C at 12 weeks" or "primary outcome"
```

### Option 3: Manual Entry
For complex papers, manual entry may be faster:
1. Click "+ Add Study Manually"
2. Enter author, year, journal
3. Fill in data fields directly

---

## 📊 What AI Can Extract

### ✅ Continuous Data
- N per group
- Mean ± SD per group
- Mean difference with CI

### ✅ Dichotomous Data  
- Events / Total per group
- OR, RR with CI

### ✅ Pre-entered Effect Sizes
- HR with 95% CI
- Adjusted OR/RR from multivariate analysis

### ✅ Study Metadata
- Author, year, journal
- PMID, DOI
- Study design (RCT, cohort, etc.)

### ❌ What AI Cannot Do
- Calculate SD from SE
- Extract data from figures/images
- Interpret p-values without CI
- Extract from PDF images (paste text only)

---

## 🎯 Example Workflow

### Good Workflow:
1. Open PDF of paper
2. Go to **Results** section
3. Find **Table 2** or **Primary Outcomes** subsection
4. Copy the table or structured text
5. Paste in AI Extractor
6. Add hint: "LDL-C at 12 weeks"
7. Click "Extract Data with AI"
8. Review extracted data
9. Click "Apply to Study"

### Bad Workflow:
1. Copy entire abstract
2. Paste in AI Extractor
3. Expect perfect extraction
4. Get frustrated when it fails ❌

---

## 🆘 Troubleshooting

### "AI returned invalid JSON"
**Cause:** Text too complex or narrative
**Fix:** Try shorter, more structured text

### "0/11 values extracted"
**Cause:** No extractable numbers in text
**Fix:** Paste results section with actual numbers

### "Missing fields" warning
**Normal!** AI can only extract what's reported.
**Fix:** Fill missing fields manually from paper

---

## 📝 Summary

**For best AI extraction:**
- ✅ Structured results > Narrative text
- ✅ Tables > Paragraphs  
- ✅ Clear group labels > Mixed groups
- ✅ Specific outcomes > General descriptions
- ✅ Use "Focus on" hint for better accuracy

**Remember:** AI is an assistant, not magic. Complex papers may still need manual entry.

---

**Status**: ✅ Guide Complete
**Use with**: Tab 3 — AI Data Extractor
