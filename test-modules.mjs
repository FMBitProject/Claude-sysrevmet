#!/usr/bin/env node

/**
 * Module Test Script
 * Tests all JavaScript modules without browser
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

console.log('🧪 MetaAnalysis Pro — Module Test Suite\n');

let passed = 0;
let failed = 0;
const results = [];

function test(name, fn) {
  try {
    const result = fn();
    if (result) {
      passed++;
      results.push({ name, status: '✅ Pass', detail: 'OK' });
      console.log(`✅ ${name}`);
    } else {
      failed++;
      results.push({ name, status: '❌ Fail', detail: 'Returned falsy' });
      console.log(`❌ ${name} - Returned falsy`);
    }
  } catch (e) {
    failed++;
    results.push({ name, status: '❌ Error', detail: e.message });
    console.log(`❌ ${name} - ${e.message}`);
  }
}

// Test 1: State module
console.log('\n📦 Testing state.js...');
try {
  const { state, saveProject, loadProject } = await import('./js/state.js');
  test('state module exports', () => state && saveProject && loadProject);
  test('state has studies array', () => Array.isArray(state.studies));
  test('state has pico object', () => state.pico && typeof state.pico === 'object');
} catch (e) {
  console.log(`❌ state.js failed to load: ${e.message}`);
  failed += 3;
}

// Test 2: Study Manager module
console.log('\n📦 Testing study-manager.js...');
try {
  const { makeStudyObj, initRoB, isObservational, isRCT, designCategory } = await import('./js/study-manager.js');
  
  test('makeStudyObj exists', () => typeof makeStudyObj === 'function');
  test('makeStudyObj creates object', () => {
    const study = makeStudyObj({ author: 'Test' });
    return study && study.author === 'Test' && study.id;
  });
  
  test('initRoB exists', () => typeof initRoB === 'function');
  test('initRoB creates RoB object', () => {
    const rob = initRoB(false);
    return rob && rob.d1 && rob.overall;
  });
  
  test('isRCT function', () => isRCT('RCT') === true && isRCT('Cohort') === false);
  test('isObservational function', () => isObservational('Cohort-Prospective') === true && isObservational('RCT') === false);
  test('designCategory function', () => designCategory('RCT') === 'RCT' && designCategory('Cohort') === 'Observational');
} catch (e) {
  console.log(`❌ study-manager.js failed to load: ${e.message}`);
  failed += 7;
}

// Test 3: AI Extractor module
console.log('\n🤖 Testing ai-extractor.js...');
try {
  const { getApiKey, setApiKey } = await import('./js/ai-extractor.js');
  
  test('getApiKey exists', () => typeof getApiKey === 'function');
  test('setApiKey exists', () => typeof setApiKey === 'function');
  
  // Test API key functions (using localStorage simulation)
  if (typeof localStorage === 'undefined') {
    // Node.js environment - skip localStorage tests
    console.log('⚠️  Skipping localStorage tests (Node.js environment)');
  } else {
    test('setApiKey stores key', () => {
      setApiKey('test_key');
      return getApiKey() === 'test_key';
    });
  }
} catch (e) {
  console.log(`❌ ai-extractor.js failed to load: ${e.message}`);
  failed += 3;
}

// Test 4: Statistics module
console.log('\n📊 Testing statistics.js...');
try {
  const { runMetaAnalysis, calculateMD, calculateSMD, calculateOR } = await import('./js/statistics.js');
  
  test('runMetaAnalysis exists', () => typeof runMetaAnalysis === 'function');
  test('calculateMD exists', () => typeof calculateMD === 'function');
  test('calculateSMD exists', () => typeof calculateSMD === 'function');
  test('calculateOR exists', () => typeof calculateOR === 'function');
  
  // Test MD calculation
  test('calculateMD returns correct structure', () => {
    const result = calculateMD(5.2, 1.2, 100, 6.1, 1.4, 100);
    return result && result.es !== undefined && result.se !== undefined;
  });
  
  // Test OR calculation
  test('calculateOR returns correct structure', () => {
    const result = calculateOR(10, 100, 20, 100);
    return result && result.es !== undefined && result.se !== undefined;
  });
} catch (e) {
  console.log(`❌ statistics.js failed to load: ${e.message}`);
  failed += 7;
}

// Test 5: Forest Plot module
console.log('\n🌲 Testing forest-plot.js...');
try {
  const { renderForestPlot, downloadForestSVG } = await import('./js/forest-plot.js');
  
  test('renderForestPlot exists', () => typeof renderForestPlot === 'function');
  test('downloadForestSVG exists', () => typeof downloadForestSVG === 'function');
} catch (e) {
  console.log(`❌ forest-plot.js failed to load: ${e.message}`);
  failed += 2;
}

// Test 6: Funnel Plot module
console.log('\n📈 Testing funnel-plot.js...');
try {
  const { renderFunnelPlot, renderEggerDetail, estimateTrimFill } = await import('./js/funnel-plot.js');
  
  test('renderFunnelPlot exists', () => typeof renderFunnelPlot === 'function');
  test('renderEggerDetail exists', () => typeof renderEggerDetail === 'function');
  test('estimateTrimFill exists', () => typeof estimateTrimFill === 'function');
  
  // Test trim and fill estimation
  test('estimateTrimFill returns number', () => {
    const result = estimateTrimFill([{ es: 0.5, se: 0.1 }], 0.5);
    return typeof result === 'number';
  });
} catch (e) {
  console.log(`❌ funnel-plot.js failed to load: ${e.message}`);
  failed += 4;
}

// Test 7: GRADE module
console.log('\n🎯 Testing grade.js...');
try {
  const { calcGradeScore, getCertaintyLabel, renderGradeOutcomes, createGradeOutcome } = await import('./js/grade.js');
  
  test('calcGradeScore exists', () => typeof calcGradeScore === 'function');
  test('getCertaintyLabel exists', () => typeof getCertaintyLabel === 'function');
  test('renderGradeOutcomes exists', () => typeof renderGradeOutcomes === 'function');
  test('createGradeOutcome exists', () => typeof createGradeOutcome === 'function');
  
  // Test GRADE score calculation
  test('calcGradeScore for RCT (should be 4)', () => {
    const outcome = {
      evidence_type: 'rct',
      rob: 'Not serious',
      inconsistency: 'Not serious',
      indirectness: 'Not serious',
      imprecision: 'Not serious',
      pubBias: 'Undetected'
    };
    return calcGradeScore(outcome) === 4;
  });
  
  test('calcGradeScore for Observational (should be 2)', () => {
    const outcome = {
      evidence_type: 'observational',
      rob: 'Not serious',
      inconsistency: 'Not serious',
      indirectness: 'Not serious',
      imprecision: 'Not serious',
      pubBias: 'Undetected'
    };
    return calcGradeScore(outcome) === 2;
  });
  
  test('getCertaintyLabel returns correct label', () => {
    return getCertaintyLabel(4) === 'High' && getCertaintyLabel(2) === 'Low';
  });
  
  test('createGradeOutcome creates object', () => {
    const outcome = createGradeOutcome('Test');
    return outcome && outcome.name === 'Test' && outcome.id;
  });
} catch (e) {
  console.log(`❌ grade.js failed to load: ${e.message}`);
  failed += 9;
}

// Test 8: Export module
console.log('\n📤 Testing export.js...');
try {
  const { exportJSON, exportCSV, exportHTMLReport } = await import('./js/export.js');
  
  test('exportJSON exists', () => typeof exportJSON === 'function');
  test('exportCSV exists', () => typeof exportCSV === 'function');
  test('exportHTMLReport exists', () => typeof exportHTMLReport === 'function');
} catch (e) {
  console.log(`❌ export.js failed to load: ${e.message}`);
  failed += 3;
}

// Test 9: RoB Visual module
console.log('\n🎨 Testing rob-visual.js...');
try {
  const { getRobStyle, renderTrafficLight, renderRoBHeatmap } = await import('./js/rob-visual.js');
  
  test('getRobStyle exists', () => typeof getRobStyle === 'function');
  test('renderTrafficLight exists', () => typeof renderTrafficLight === 'function');
  test('renderRoBHeatmap exists', () => typeof renderRoBHeatmap === 'function');
  
  // Test traffic light rendering
  test('renderTrafficLight returns HTML', () => {
    const html = renderTrafficLight('Low');
    return html && html.includes('traffic-light') && html.includes('#16a34a');
  });
  
  test('getRobStyle returns correct colors', () => {
    const style = getRobStyle('Low');
    return style.color === '#16a34a' && style.bg === '#dcfce7';
  });
} catch (e) {
  console.log(`❌ rob-visual.js failed to load: ${e.message}`);
  failed += 5;
}

// Test 10: PRISMA module
console.log('\n📋 Testing prisma.js...');
try {
  const { renderPrismaFlow, downloadPrismaSVG, getPrismaDataFromState } = await import('./js/prisma.js');
  
  test('renderPrismaFlow exists', () => typeof renderPrismaFlow === 'function');
  test('downloadPrismaSVG exists', () => typeof downloadPrismaSVG === 'function');
  test('getPrismaDataFromState exists', () => typeof getPrismaDataFromState === 'function');
} catch (e) {
  console.log(`❌ prisma.js failed to load: ${e.message}`);
  failed += 3;
}

// Test 11: Dashboard module
console.log('\n📊 Testing dashboard.js...');
try {
  const { renderDashboard, logTimeline, logSearch, logImport } = await import('./js/dashboard.js');
  
  test('renderDashboard exists', () => typeof renderDashboard === 'function');
  test('logTimeline exists', () => typeof logTimeline === 'function');
  test('logSearch exists', () => typeof logSearch === 'function');
  test('logImport exists', () => typeof logImport === 'function');
} catch (e) {
  console.log(`❌ dashboard.js failed to load: ${e.message}`);
  failed += 4;
}

// Test 12: Eligibility module
console.log('\n✅ Testing eligibility.js...');
try {
  const { saveEligibility, renderEligibilitySummary, renderCriteriaHistory } = await import('./js/eligibility.js');
  
  test('saveEligibility exists', () => typeof saveEligibility === 'function');
  test('renderEligibilitySummary exists', () => typeof renderEligibilitySummary === 'function');
  test('renderCriteriaHistory exists', () => typeof renderCriteriaHistory === 'function');
} catch (e) {
  console.log(`❌ eligibility.js failed to load: ${e.message}`);
  failed += 3;
}

// Test 13: Search Engines module
console.log('\n🔍 Testing search-engines.js...');
try {
  const { runComprehensiveSearch, deduplicateResults } = await import('./js/search-engines.js');
  
  test('runComprehensiveSearch exists', () => typeof runComprehensiveSearch === 'function');
  test('deduplicateResults exists', () => typeof deduplicateResults === 'function');
  
  // Test deduplication
  test('deduplicateResults removes duplicates', () => {
    const studies = [
      { doi: '10.1234/test', title: 'Test Study' },
      { doi: '10.1234/test', title: 'Test Study' }, // duplicate
      { doi: '10.5678/other', title: 'Other Study' }
    ];
    const deduped = deduplicateResults(studies);
    return deduped.length === 2;
  });
} catch (e) {
  console.log(`❌ search-engines.js failed to load: ${e.message}`);
  failed += 3;
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 TEST SUMMARY');
console.log('='.repeat(50));

const total = passed + failed;
const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;

console.log(`\nTotal Tests: ${total}`);
console.log(`Passed: ${passed} ✅`);
console.log(`Failed: ${failed} ❌`);
console.log(`Pass Rate: ${percentage}%`);

if (percentage === 100) {
  console.log('\n🎉 All tests passed! All modules are working correctly.');
} else if (percentage >= 80) {
  console.log('\n✅ Most tests passed. Check failed tests above.');
} else {
  console.log('\n⚠️ Many tests failed. Please check module imports.');
}

console.log('\n' + '='.repeat(50));

// Exit with appropriate code
process.exit(failed > 0 ? 1 : 0);
