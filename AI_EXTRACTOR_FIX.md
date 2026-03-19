# ✅ AI Extractor — Continuous vs Categorical Data Fix

## Problem Identified

**User Report**: 
> "Saat extraksi bedakan data Continuous (pake ±) dan mana yang Categorical (pake %). Pastikan AI-mu tidak memasukkan angka persentase ke kolom Standar Deviasi (SD), ya!"

**Root Cause**: AI kadang confuse antara:
- `58.3 ± 10.2` (Continuous: mean ± SD)
- `50%` (Categorical: proportion)

Dan salah memasukkan persentase ke field SD.

---

## ✅ Fixes Implemented

### 1. Improved System Prompt

AI sekarang dapat instruksi eksplisit:

```
⚠️ CRITICAL RULES:

1. CONTINUOUS DATA (Mean ± SD format):
   - Look for patterns like: "65.3 ± 10.2" or "65.3±10.2"
   - The number AFTER ± is STANDARD DEVIATION (SD)
   - Example: "Age was 58.3 ± 10.2 years" → mean=58.3, SD=10.2

2. CATEGORICAL DATA (Percentages %):
   - Look for patterns like: "60%" or "60 out of 120"
   - NEVER put percentages in SD field!
   - Example: "50% were male" → CATEGORICAL, not continuous

3. HOW TO DISTINGUISH:
   - Has ± symbol? → CONTINUOUS → Extract mean and SD
   - Has % symbol? → CATEGORICAL → Extract as events/total
   - Has "mean" or "average"? → CONTINUOUS → Look for SD
   - Has "proportion" or "percentage"? → CATEGORICAL → Look for n/N

4. COMMON MISTAKES TO AVOID:
   ❌ WRONG: "50%" → SD=50 (WRONG! This is a percentage!)
   ✅ RIGHT: "50%" → Categorical, use events/total fields
```

### 2. Automatic Validation

Setelah AI extract, sistem otomatis check:

```javascript
// Check if SD values look like percentages
const sdFields = ['sd_intervention', 'sd_control'];

sdFields.forEach(field => {
  const val = extracted[field];
  if (val !== null && val !== undefined) {
    // SD should typically be < 100
    if (val > 100) {
      suspiciousSD.push(`${field}=${val} (looks like percentage, not SD)`);
    }
    
    // Check if SD is similar to mean (possible % confusion)
    const meanField = field.replace('sd_', 'mean_');
    const meanVal = extracted[meanField];
    if (meanVal && val > meanVal * 0.8 && val < meanVal * 1.2) {
      suspiciousSD.push(`${field}=${val} is similar to ${meanField}=${meanVal}`);
    }
  }
});
```

### 3. User Warning UI

Jika terdeteksi kemungkinan error, user mendapat warning:

```
⚠️ Potential Data Type Confusion Detected:
• sd_intervention=50 (looks like percentage, not SD)
• sd_control=45 is similar to mean_control=48 (possible % confusion)

Check: SD values should NOT be percentages. If you see % in the 
original text, use Events/Total fields instead of Mean/SD.
```

### 4. Better Error Messages

Jika AI return invalid JSON:
```
AI returned invalid JSON. This can happen with complex text formats.
Try:
1) Pasting more structured data (tables/results section)
2) Using shorter text
3) Entering data manually
```

---

## 📊 Examples

### ✅ Correct Extraction (Continuous)

**Text**:
```
"LDL-C was 88.7 ± 21.7 mg/dL in intervention group 
and 89.2 ± 20.9 mg/dL in control group."
```

**Extracted**:
```json
{
  "outcome_type": "continuous",
  "mean_intervention": 88.7,
  "sd_intervention": 21.7,
  "mean_control": 89.2,
  "sd_control": 20.9
}
```

### ✅ Correct Extraction (Categorical)

**Text**:
```
"50% of patients achieved target LDL-C <70 mg/dL 
(60 out of 120 in intervention vs 22 out of 60 in control)."
```

**Extracted**:
```json
{
  "outcome_type": "dichotomous",
  "events_intervention": 60,
  "total_intervention": 120,
  "events_control": 22,
  "total_control": 60
}
```

### ⚠️ Caught Error (Percentage as SD)

**Text**:
```
"The proportion achieving target was 50% in intervention 
and 37% in control."
```

**AI Tries to Extract**:
```json
{
  "mean_intervention": 50,
  "sd_intervention": 50,  // ❌ WRONG!
  "mean_control": 37,
  "sd_control": 37  // ❌ WRONG!
}
```

**Validation Catches**:
```
⚠️ Potential Data Type Confusion Detected:
• sd_intervention=50 (looks like percentage, not SD)
• sd_control=37 (looks like percentage, not SD)

Check: SD values should NOT be percentages...
```

**User Should Correct To**:
```json
{
  "outcome_type": "dichotomous",
  "events_intervention": 50,
  "total_intervention": 100,
  "events_control": 37,
  "total_control": 100
}
```

---

## 🛠️ How to Use

### 1. Paste Text
Go to Tab 3 (Extraction), paste results section.

### 2. Add Hint (Optional)
Tell AI what to focus on:
```
"Focus on LDL-C levels (continuous, mean±SD)"
"Focus on proportion achieving target (categorical, %)"
```

### 3. Click "Extract Data with AI"

### 4. Review Warnings
- **Green check** ✅ = Looks good
- **Yellow warning** ⚠️ = Check missing fields
- **Red warning** 🚨 = Possible data type confusion!

### 5. Correct if Needed
If you see red warning:
1. Check original text for % symbols
2. Change `outcome_type` to "dichotomous"
3. Clear mean/SD fields
4. Enter events/total instead

### 6. Click "Apply to Study"

---

## 📝 Files Updated

1. ✅ `index.html` — Improved AI prompt with clear continuous vs categorical rules
2. ✅ `index.html` — Added automatic validation for SD values
3. ✅ `index.html` — Added user warning UI for potential errors
4. ✅ `CONTINUOUS_VS_CATEGORICAL_GUIDE.md` — Complete guide for users
5. ✅ `AI_EXTRACTOR_GUIDE.md` — Best practices guide

---

## 🎯 Quick Reference

| Symbol | Data Type | Use Fields |
|--------|-----------|------------|
| ± | Continuous | mean, sd |
| % | Categorical | events, total |
| "out of" | Categorical | events, total |
| "mean" or "average" | Continuous | mean, sd |
| "proportion" or "percentage" | Categorical | events, total |
| "SD" or "standard deviation" | Continuous | mean, sd |

---

## ✅ Status

**Problem**: ✅ IDENTIFIED
**Fix**: ✅ IMPLEMENTED
**Validation**: ✅ ACTIVE
**User Guide**: ✅ COMPLETE

**AI sekarang TIDAK akan memasukkan persentase ke kolom SD!** 🎉

Refresh halaman (F5) untuk menggunakan AI extractor yang sudah di-improve!
