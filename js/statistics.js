/**
 * Statistics Module
 * Meta-analysis calculations: effect sizes, heterogeneity, models, etc.
 */

import { state } from './state.js';
import { isLogScale, isTimeToEvent } from './study-manager.js';

/**
 * Standard normal critical values
 */
const Z_CRIT = {
  0.95: 1.96,
  0.90: 1.645,
  0.99: 2.576
};

/**
 * Calculate effect size for continuous data (Mean Difference)
 */
export function calculateMD(mt, sdt, nt, mc, sdc, nc) {
  const meanDiff = mt - mc;
  const se = Math.sqrt((sdt * sdt) / nt + (sdc * sdc) / nc);
  const ciLow = meanDiff - 1.96 * se;
  const ciHigh = meanDiff + 1.96 * se;
  
  return {
    es: meanDiff,
    se,
    ciLow,
    ciHigh,
    measure: 'MD'
  };
}

/**
 * Calculate effect size for continuous data (Standardized Mean Difference - Hedges' g)
 */
export function calculateSMD(mt, sdt, nt, mc, sdc, nc) {
  // Pooled SD
  const pooledSD = Math.sqrt(
    ((nt - 1) * sdt * sdt + (nc - 1) * sdc * sdc) / (nt + nc - 2)
  );
  
  // Cohen's d
  const d = (mt - mc) / pooledSD;
  
  // Hedges' g correction
  const J = 1 - 3 / (4 * (nt + nc - 2) - 1);
  const g = J * d;
  
  // Standard error
  const se = Math.sqrt(
    (nt + nc) / (nt * nc) + (g * g) / (2 * (nt + nc - 2))
  );
  
  const ciLow = g - 1.96 * se;
  const ciHigh = g + 1.96 * se;
  
  return {
    es: g,
    se,
    ciLow,
    ciHigh,
    measure: 'SMD'
  };
}

/**
 * Calculate effect size for dichotomous data (Odds Ratio)
 */
export function calculateOR(et, tt, ec, tc) {
  // Add 0.5 continuity correction for zero cells
  const a = et || 0.5;
  const b = (tt - et) || 0.5;
  const c = ec || 0.5;
  const d = (tc - ec) || 0.5;
  
  const or = (a * d) / (b * c);
  const logOR = Math.log(or);
  const seLogOR = Math.sqrt(1/a + 1/b + 1/c + 1/d);
  
  const ciLow = Math.exp(logOR - 1.96 * seLogOR);
  const ciHigh = Math.exp(logOR + 1.96 * seLogOR);
  
  return {
    es: or,
    logES: logOR,
    se: seLogOR,
    ciLow,
    ciHigh,
    measure: 'OR'
  };
}

/**
 * Calculate effect size for dichotomous data (Risk Ratio)
 */
export function calculateRR(et, tt, ec, tc) {
  const a = et || 0.5;
  const c = ec || 0.5;
  
  const riskT = a / tt;
  const riskC = c / tc;
  const rr = riskT / riskC;
  const logRR = Math.log(rr);
  
  const seLogRR = Math.sqrt((1/a - 1/tt) + (1/c - 1/tc));
  
  const ciLow = Math.exp(logRR - 1.96 * seLogRR);
  const ciHigh = Math.exp(logRR + 1.96 * seLogRR);
  
  return {
    es: rr,
    logES: logRR,
    se: seLogRR,
    ciLow,
    ciHigh,
    measure: 'RR'
  };
}

/**
 * Calculate effect size for time-to-event data (Hazard Ratio)
 */
export function calculateHR(logHR, seLogHR) {
  const hr = Math.exp(logHR);
  const ciLow = Math.exp(logHR - 1.96 * seLogHR);
  const ciHigh = Math.exp(logHR + 1.96 * seLogHR);
  
  return {
    es: hr,
    logES: logHR,
    se: seLogHR,
    ciLow,
    ciHigh,
    measure: 'HR'
  };
}

/**
 * Get effect size from study based on type
 */
export function getStudyEffectSize(study) {
  if (study.type === 'continuous') {
    if (study.mt !== '' && study.mc !== '') {
      return calculateMD(
        parseFloat(study.mt), parseFloat(study.sdt), parseFloat(study.nt),
        parseFloat(study.mc), parseFloat(study.sdc), parseFloat(study.nc)
      );
    }
  } else if (study.type === 'dichotomous') {
    if (study.et !== '' && study.ec !== '') {
      const measure = state.effectMeasure || 'OR';
      if (measure === 'OR') {
        return calculateOR(
          parseFloat(study.et), parseFloat(study.tt),
          parseFloat(study.ec), parseFloat(study.tc)
        );
      } else if (measure === 'RR') {
        return calculateRR(
          parseFloat(study.et), parseFloat(study.tt),
          parseFloat(study.ec), parseFloat(study.tc)
        );
      }
    }
  } else if (study.type === 'preEntered') {
    if (study.preEntered_es !== '') {
      const logES = parseFloat(study.preEntered_es);
      const ciL = parseFloat(study.preEntered_ciL);
      const ciH = parseFloat(study.preEntered_ciH);
      const se = (ciH - ciL) / (2 * 1.96);
      
      return {
        es: isLogScale(state.effectMeasure) ? Math.exp(logES) : logES,
        logES,
        se,
        ciLow: ciL,
        ciHigh: ciH,
        measure: state.effectMeasure || 'HR'
      };
    }
  }
  
  return null;
}

/**
 * Fixed-effects meta-analysis (Inverse Variance)
 */
export function fixedEffectMeta(effectSizes) {
  let sumW = 0;
  let sumWE = 0;
  
  for (const es of effectSizes) {
    if (!es || es.se === 0) continue;
    const w = 1 / (es.se * es.se);
    sumW += w;
    sumWE += w * es.logES;
  }
  
  if (sumW === 0) return null;
  
  const pooled = sumWE / sumW;
  const sePooled = Math.sqrt(1 / sumW);
  const ciLow = pooled - 1.96 * sePooled;
  const ciHigh = pooled + 1.96 * sePooled;
  const Z = pooled / sePooled;
  const pVal = 2 * (1 - normalCDF(Math.abs(Z)));
  
  return {
    pooled,
    pooledExp: Math.exp(pooled),
    se: sePooled,
    ciLow,
    ciHigh,
    ciLowExp: Math.exp(ciLow),
    ciHighExp: Math.exp(ciHigh),
    Z,
    pVal,
    model: 'fixed',
    k: effectSizes.length
  };
}

/**
 * Random-effects meta-analysis (DerSimonian-Laird)
 */
export function randomEffectsDL(effectSizes) {
  if (effectSizes.length < 2) {
    return fixedEffectMeta(effectSizes);
  }
  
  // First pass: fixed effects to get Q
  let sumW = 0;
  let sumWE = 0;
  
  for (const es of effectSizes) {
    if (!es || es.se === 0) continue;
    const w = 1 / (es.se * es.se);
    sumW += w;
    sumWE += w * es.logES;
  }
  
  if (sumW === 0) return null;
  
  const pooledFE = sumWE / sumW;
  
  // Calculate Q statistic
  let Q = 0;
  sumW = 0;
  
  for (const es of effectSizes) {
    if (!es || es.se === 0) continue;
    const w = 1 / (es.se * es.se);
    sumW += w;
    Q += w * Math.pow(es.logES - pooledFE, 2);
  }
  
  // Calculate tau-squared (between-study variance)
  const k = effectSizes.length;
  const C = sumW - (effectSizes.map(es => {
    const w = 1 / (es.se * es.se);
    return w * w;
  }).reduce((a, b) => a + b, 0) / sumW);
  
  let tau2 = (Q - (k - 1)) / C;
  if (tau2 < 0) tau2 = 0;
  
  // Second pass: random effects weights
  sumW = 0;
  sumWE = 0;
  
  for (const es of effectSizes) {
    if (!es || es.se === 0) continue;
    const w = 1 / (es.se * es.se + tau2);
    sumW += w;
    sumWE += w * es.logES;
  }
  
  if (sumW === 0) return null;
  
  const pooled = sumWE / sumW;
  const sePooled = Math.sqrt(1 / sumW);
  const ciLow = pooled - 1.96 * sePooled;
  const ciHigh = pooled + 1.96 * sePooled;
  const Z = pooled / sePooled;
  const pVal = 2 * (1 - normalCDF(Math.abs(Z)));
  
  // I-squared (heterogeneity)
  const I2 = Math.max(0, ((Q - (k - 1)) / Q) * 100);
  
  // Prediction interval
  const tau = Math.sqrt(tau2);
  const piLow = pooled - 1.96 * Math.sqrt(sePooled * sePooled + tau2);
  const piHigh = pooled + 1.96 * Math.sqrt(sePooled * sePooled + tau2);
  
  return {
    pooled,
    pooledExp: Math.exp(pooled),
    se: sePooled,
    ciLow,
    ciHigh,
    ciLowExp: Math.exp(ciLow),
    ciHighExp: Math.exp(ciHigh),
    Z,
    pVal,
    model: 'random',
    method: 'DL',
    k,
    tau2,
    tau,
    I2,
    Q,
    Qdf: k - 1,
    QpVal: 1 - chiSquareCDF(Q, k - 1),
    piLow,
    piHigh,
    piLowExp: Math.exp(piLow),
    piHighExp: Math.exp(piHigh)
  };
}

/**
 * Hartung-Knapp-Sidik-Jonkman (HKSJ) correction
 */
export function applyHKSJ(result, effectSizes) {
  if (!result || result.k < 2) return result;
  
  // Calculate study-specific variances
  const wi = effectSizes.map(es => 1 / (es.se * es.se));
  const wStar = wi.map(w => 1 / (w + result.tau2));
  
  // HKSJ variance
  let sumWStar = 0;
  let sumWStarE = 0;
  
  for (let i = 0; i < effectSizes.length; i++) {
    sumWStar += wStar[i];
    sumWStarE += wStar[i] * effectSizes[i].logES;
  }
  
  const pooledHKSJ = sumWStarE / sumWStar;
  
  // HKSJ standard error with scaling factor
  let sumSq = 0;
  for (let i = 0; i < effectSizes.length; i++) {
    sumSq += wStar[i] * Math.pow(effectSizes[i].logES - pooledHKSJ, 2);
  }
  
  const seHKSJ = Math.sqrt(sumSq / ((result.k - 1) * sumWStar));
  
  // Use t-distribution instead of normal
  const df = result.k - 1;
  const tCrit = tCritical(0.975, df);
  
  const ciLow = pooledHKSJ - tCrit * seHKSJ;
  const ciHigh = pooledHKSJ + tCrit * seHKSJ;
  const tVal = pooledHKSJ / seHKSJ;
  const pVal = 2 * (1 - tCDF(Math.abs(tVal), df));
  
  return {
    ...result,
    pooled: pooledHKSJ,
    pooledExp: Math.exp(pooledHKSJ),
    se: seHKSJ,
    ciLow,
    ciHigh,
    ciLowExp: Math.exp(ciLow),
    ciHighExp: Math.exp(ciHigh),
    Z: tVal,
    pVal,
    method: 'DL+HKSJ',
    df
  };
}

/**
 * Run complete meta-analysis
 */
export function runMetaAnalysis(studies, options = {}) {
  const {
    model = 'random',
    effectMeasure = 'MD',
    useHKSJ = true,
    ciLevel = 0.95
  } = options;
  
  // Get effect sizes for all included studies
  const effectSizes = [];
  const studyResults = [];
  
  for (const study of studies) {
    if (study.active === false || study.included === false) continue;
    
    const es = getStudyEffectSize(study);
    if (es) {
      effectSizes.push(es);
      studyResults.push({
        study: {
          id: study.id,
          author: study.author,
          year: study.year
        },
        ...es
      });
    }
  }
  
  if (effectSizes.length === 0) {
    return { error: 'No studies with valid data' };
  }
  
  // Run meta-analysis
  let result;
  if (model === 'fixed') {
    result = fixedEffectMeta(effectSizes);
  } else {
    result = randomEffectsDL(effectSizes);
    if (result && useHKSJ && result.k >= 2) {
      result = applyHKSJ(result, effectSizes);
    }
  }
  
  if (!result) {
    return { error: 'Meta-analysis failed' };
  }
  
  // Add study-level results
  result.studies = studyResults;
  
  // Calculate publication bias tests
  result.publicationBias = calculatePublicationBias(effectSizes, result);
  
  return result;
}

/**
 * Calculate publication bias statistics
 */
export function calculatePublicationBias(effectSizes, metaResult) {
  if (effectSizes.length < 3) {
    return { warning: 'Too few studies for publication bias analysis' };
  }
  
  // Egger's regression test
  const n = effectSizes.length;
  const x = effectSizes.map(es => 1 / es.se);
  const y = effectSizes.map(es => es.logES / es.se);
  
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;
  
  let sumXY = 0, sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumXY += (x[i] - meanX) * (y[i] - meanY);
    sumXX += (x[i] - meanX) * (x[i] - meanX);
  }
  
  const slope = sumXY / sumXX;
  const intercept = meanY - slope * meanX;
  
  // Standard error of intercept
  let sumResid = 0;
  for (let i = 0; i < n; i++) {
    const pred = intercept + slope * x[i];
    sumResid += Math.pow(y[i] - pred, 2);
  }
  const seIntercept = Math.sqrt(sumResid / (n - 2) / sumXX);
  
  const eggerT = intercept / seIntercept;
  const eggerP = 2 * (1 - tCDF(Math.abs(eggerT), n - 2));
  
  // Begg's rank correlation
  const zScores = effectSizes.map(es => es.logES / es.se);
  const seValues = effectSizes.map(es => es.se);
  
  let concordant = 0, discordant = 0;
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      const zDiff = zScores[i] - zScores[j];
      const seDiff = seValues[i] - seValues[j];
      if (zDiff * seDiff > 0) concordant++;
      else if (zDiff * seDiff < 0) discordant++;
    }
  }
  
  const tauB = (concordant - discordant) / (n * (n - 1) / 2);
  // Approximate p-value for Begg's test
  const beggP = 2 * (1 - normalCDF(Math.abs(tauB) * Math.sqrt(n * (n - 1) * (2 * n + 5) / 18)));
  
  return {
    egger: {
      intercept,
      slope,
      t: eggerT,
      p: eggerP
    },
    begg: {
      tau: tauB,
      p: beggP
    }
  };
}

/**
 * Standard normal CDF
 */
function normalCDF(x) {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - p : p;
}

/**
 * Chi-square CDF approximation
 */
function chiSquareCDF(x, df) {
  if (x <= 0) return 0;
  // Use gamma function approximation
  return gammaRegularized(df / 2, x / 2);
}

/**
 * Regularized incomplete gamma function
 */
function gammaRegularized(a, x) {
  if (x < 0 || a <= 0) return 0;
  if (x === 0) return 0;
  
  // Series expansion for small x
  if (x < a + 1) {
    let sum = 1 / a;
    let term = sum;
    for (let n = 1; n < 100; n++) {
      term *= x / (a + n);
      sum += term;
      if (Math.abs(term) < 1e-10) break;
    }
    return sum * Math.exp(-x + a * Math.log(x) - logGamma(a));
  }
  
  // Continued fraction for large x
  return 1 - gammaCF(a, x);
}

/**
 * Continued fraction for gamma function
 */
function gammaCF(a, x) {
  const maxIter = 100;
  const eps = 1e-10;
  
  let b = x + 1 - a;
  let c = 1 / eps;
  let d = 1 / b;
  let h = d;
  
  for (let i = 1; i < maxIter; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < eps) d = eps;
    c = b + an / c;
    if (Math.abs(c) < eps) c = eps;
    d = 1 / d;
    const delta = d * c;
    h *= delta;
    if (Math.abs(delta - 1) < eps) break;
  }
  
  return Math.exp(-x + a * Math.log(x) - logGamma(a)) * h;
}

/**
 * Log gamma function (Lanczos approximation)
 */
function logGamma(x) {
  const g = 7;
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7
  ];
  
  if (x < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * x)) - logGamma(1 - x);
  }
  
  x -= 1;
  let y = c[0];
  for (let i = 1; i < g + 2; i++) {
    y += c[i] / (x + i);
  }
  
  const t = x + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(y);
}

/**
 * t-distribution CDF
 */
function tCDF(t, df) {
  const x = df / (df + t * t);
  return 1 - 0.5 * betaRegularized(df / 2, 0.5, x);
}

/**
 * t-distribution critical value
 */
function tCritical(p, df) {
  // Simple approximation using normal for large df
  if (df > 100) return normalInv(p);
  
  // Newton-Raphson iteration
  let t = normalInv(p);
  for (let i = 0; i < 10; i++) {
    const f = tCDF(t, df) - p;
    const fp = tPDF(t, df);
    t -= f / fp;
  }
  return t;
}

/**
 * t-distribution PDF
 */
function tPDF(t, df) {
  const c = logGamma((df + 1) / 2) - logGamma(df / 2);
  return Math.exp(c) * Math.pow(1 + t * t / df, -(df + 1) / 2) / Math.sqrt(df * Math.PI);
}

/**
 * Inverse normal CDF (rational approximation)
 */
function normalInv(p) {
  if (p <= 0) return -10;
  if (p >= 1) return 10;
  if (p === 0.5) return 0;
  
  const a = [
    -3.969683028665376e+01, 2.209460984245205e+02,
    -2.759285104469687e+02, 1.383577518672690e+02,
    -3.066479806614716e+01, 2.506628277459239e+00
  ];
  const b = [
    -5.447609879822406e+01, 1.615858368580409e+02,
    -1.556989798598866e+02, 6.680131188771972e+01,
    -1.328068155288572e+01
  ];
  const c = [
    -7.784894002430293e-03, -3.223964580411365e-01,
    -2.400758277161838e+00, -2.549732539343734e+00,
    4.374664141464968e+00, 2.938163982698783e+00
  ];
  const d = [
    7.784695709041462e-03, 3.224671290700398e-01,
    2.445134137142996e+00, 3.754408661907416e+00
  ];
  
  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  
  let q, r;
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
           ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  } else if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q /
           (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
            ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  }
}

/**
 * Regularized incomplete beta function
 */
function betaRegularized(a, b, x) {
  if (x === 0) return 0;
  if (x === 1) return 1;
  
  const bt = Math.exp(logGamma(a + b) - logGamma(a) - logGamma(b) +
                      a * Math.log(x) + b * Math.log(1 - x));
  
  if (x < (a + 1) / (a + b + 2)) {
    return bt * betaCF(a, b, x) / a;
  } else {
    return 1 - bt * betaCF(b, a, 1 - x) / b;
  }
}

/**
 * Continued fraction for incomplete beta
 */
function betaCF(a, b, x) {
  const maxIter = 100;
  const eps = 1e-10;
  
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  
  let c = 1;
  let d = 1 - qab * x / qap;
  if (Math.abs(d) < eps) d = eps;
  d = 1 / d;
  let h = d;
  
  for (let m = 1; m < maxIter; m++) {
    const m2 = 2 * m;
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    
    d = 1 + aa * d;
    if (Math.abs(d) < eps) d = eps;
    c = 1 + aa / c;
    if (Math.abs(c) < eps) c = eps;
    d = 1 / d;
    h *= d * c;
    
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    
    d = 1 + aa * d;
    if (Math.abs(d) < eps) d = eps;
    c = 1 + aa / c;
    if (Math.abs(c) < eps) c = eps;
    d = 1 / d;
    const delta = d * c;
    h *= delta;
    
    if (Math.abs(delta - 1) < eps) break;
  }
  
  return h;
}
