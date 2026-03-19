# 🤖 AI Extractor — Continuous vs Categorical Data Guide

## ⚠️ CRITICAL: Difference Between Continuous and Categorical Data

### 📊 **CONTINUOUS DATA** (Mean ± SD)

**Format**: `number ± number` or `number (SD number)`

**Examples**:
```
✅ "Age was 58.3 ± 10.2 years"
   → Mean = 58.3, SD = 10.2

✅ "BMI 28.4±4.1 kg/m²"
   → Mean = 28.4, SD = 4.1

✅ "LDL-C: 88.7 (SD 21.7) mg/dL"
   → Mean = 88.7, SD = 21.7

✅ "Blood pressure decreased by 15.3±8.5 mmHg"
   → Mean = 15.3, SD = 8.5
```

**Key indicators**:
- Has **±** symbol
- Has **"mean"** or **"average"**
- Has **"SD"** or **"standard deviation"**
- Numbers are typically: mean around 20-100, SD around 5-30

---

### 📈 **CATEGORICAL DATA** (Percentages %)

**Format**: `number%` or `number out of number` or `number (N=number)`

**Examples**:
```
✅ "50% were male"
   → This is a PROPORTION, NOT mean±SD!
   → Use events/total fields (dichotomous)

✅ "Diabetes: 45% (n=54)"
   → 45% of 120 patients = 54 events
   → Events = 54, Total = 120

✅ "60 out of 120 patients (50%) achieved target"
   → Events = 60, Total = 120
   → This is CATEGORICAL, not continuous!

✅ "Mortality rate was 12.5%"
   → Proportion, NOT mean±SD!
```

**Key indicators**:
- Has **%** symbol
- Has **"proportion"** or **"percentage"**
- Has **"out of"** (e.g., "60 out of 120")
- Has **"n="** or **"N="**

---

## ❌ COMMON MISTAKES TO AVOID

### Mistake 1: Putting % in SD Field

```
❌ WRONG EXTRACTION:
Text: "50% were male"
Extracted: mean_intervention=50, sd_intervention=50
→ WRONG! This is categorical data!

✅ CORRECT EXTRACTION:
Text: "50% were male"
Extracted: outcome_type="dichotomous"
           events_intervention=50, total_intervention=100
→ CORRECT! Use events/total for percentages!
```

### Mistake 2: Confusing Mean±SD with %CI

```
❌ WRONG EXTRACTION:
Text: "Reduction was 65.3% (95% CI 58.2-72.4)"
Extracted: mean=65.3, sd=72.4
→ WRONG! The CI is not SD, and this is a percentage!

✅ CORRECT EXTRACTION:
Text: "Reduction was 65.3% (95% CI 58.2-72.4)"
Extracted: outcome_type="dichotomous" or "preEntered"
           pre_es=65.3, pre_ci_lower=58.2, pre_ci_upper=72.4
→ CORRECT! This is a proportion with CI!
```

### Mistake 3: SD Larger Than Mean

```
❌ SUSPICIOUS:
Text: "Age 45.2 ± 52.3 years"
Extracted: mean=45.2, sd=52.3
→ SUSPICIOUS! SD > Mean is unusual for age
→ Probably AI misread percentage as SD!

✅ LIKELY CORRECT:
Text: "Age 45.2 ± 12.3 years"
Extracted: mean=45.2, sd=12.3
→ Makes sense! SD is reasonable for age
```

---

## 🔍 How AI Validator Works

The AI extractor now includes **automatic validation**:

### 1. SD Value Check
```javascript
// Flag SD > 100 (likely percentage)
if (sd > 100) {
  warn("SD looks like percentage!");
}
```

### 2. SD vs Mean Comparison
```javascript
// Flag if SD is similar to mean (possible % confusion)
if (sd > mean * 0.8 && sd < mean * 1.2) {
  warn("SD similar to mean - possible % confusion!");
}
```

### 3. Outcome Type Consistency
```javascript
// Check if continuous data has mean values
if (outcome_type === 'continuous' && !mean_intervention) {
  warn("Continuous but no mean found!");
}
```

---

## ✅ Best Practices for Users

### 1. Use "Outcome Hint" Field

Tell AI what to look for:
```
✅ "Focus on LDL-C levels (continuous, mean±SD)"
✅ "Focus on proportion achieving target (categorical, %)"
✅ "Focus on mortality rates (dichotomous, events/total)"
```

### 2. Paste Structured Data

**Good** (clear mean±SD):
```
Table 2: Outcomes at 12 weeks
Group       N    LDL-C (mg/dL)
Treatment   120  70.2 ± 18.3
Control     118  84.0 ± 19.1
```

**Bad** (mixed % and numbers):
```
50% of patients achieved target. The mean age was 58 years.
Diabetes was present in 45% of patients. BMI was 28.4±4.1.
```

### 3. Review Before Applying

After AI extraction:
1. **Check "Extracted Data Preview"**
2. **Look for warnings** (yellow box)
3. **Verify SD values** are reasonable (< mean, typically < 30)
4. **Check outcome type** matches data format

---

## 🛠️ Manual Correction

If AI makes mistakes:

### Scenario 1: % Extracted as SD
```
AI Extracted:
mean_intervention: 50
sd_intervention: 50  ← WRONG!

Manual Fix:
1. Change outcome_type to "dichotomous"
2. Clear mean_intervention and sd_intervention
3. Enter: events_intervention=50, total_intervention=100
```

### Scenario 2: CI Extracted as SD
```
AI Extracted:
mean_intervention: 65.3
sd_intervention: 72.4  ← WRONG! This is CI upper bound

Manual Fix:
1. Change outcome_type to "preEntered"
2. Clear mean_intervention and sd_intervention
3. Enter: pre_es=65.3, pre_ci_lower=58.2, pre_ci_upper=72.4
```

---

## 📋 Quick Reference Table

| Format | Data Type | Fields to Use |
|--------|-----------|---------------|
| 58.3 ± 10.2 | Continuous | mean, sd |
| 50% | Categorical | events/total |
| 60 out of 120 | Categorical | events=60, total=120 |
| HR 0.75 (0.60-0.94) | Pre-entered | pre_es, pre_ci_lower, pre_ci_upper |
| Mean (SD): 45.2 (12.3) | Continuous | mean=45.2, sd=12.3 |
| n=54 (45%) | Categorical | events=54, total=120 |

---

## 🎯 Summary

**Remember**:
- ✅ **±** = Continuous → Use mean & SD fields
- ✅ **%** = Categorical → Use events/total fields
- ✅ **CI** = Pre-entered → Use pre_es & CI fields
- ⚠️ **SD > 100** = Probably percentage!
- ⚠️ **SD ≈ Mean** = Probably confused with %!

**AI Validator will catch these errors**, but always review before applying!

---

**Status**: ✅ Guide Complete
**Validation**: ✅ Auto-check enabled
**Use with**: Tab 3 — AI Data Extractor
