/**
 * Legacy Compatibility Layer
 * 
 * This file provides backward compatibility for functions that haven't
 * been migrated to ES modules yet. It references the original inline
 * JavaScript from index.html.
 * 
 * TODO: Migrate these functions to appropriate ES modules:
 * - forest-plot.js (renderForest, downloadForestSVG)
 * - funnel-plot.js (renderFunnel, estimateTrimFill)
 * - grade.js (renderGrade, calcGrade, addGradeOutcome)
 * - rob.js (renderRoBHeatmap, updateRoB, renderRoBCols)
 * - prisma.js (renderPrisma, syncPrismaInputs)
 * - export.js (exportHTML, exportCSV, exportJSON, exportPRISMAChecklist)
 * - subgroup.js (runSubgroup, runMetaReg)
 * - sensitivity.js (renderSensitivity)
 * - dashboard.js (renderDashboard, logTimeline, logSearch, logImport)
 * - eligibility.js (saveEligibility, renderEligibilitySummary, renderCriteriaHistory)
 * - kappa.js (calcKappa, addDiscordance)
 * 
 * For now, these functions remain in the original index.html <script> tag.
 * The modular imports in main.js will coexist with these legacy functions.
 */

// Placeholder - actual functions are in index.html <script> tag
console.log('Legacy compatibility layer loaded - functions available from inline script');

// Export placeholder objects for module imports
export const legacyFunctions = {
  warning: 'Functions not yet migrated to ES modules - see index.html inline script'
};
