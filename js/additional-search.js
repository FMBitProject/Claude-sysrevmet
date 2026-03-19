/**
 * Additional Search Engines Module
 * Comprehensive database search for Q1-Q5 journals
 * 
 * Includes: DOAJ, SciELO, PubMed Central, J-STage, medRxiv, ClinicalTrials.gov, etc.
 * 
 * @module additional-search
 */

import { makeStudyObj } from './study-manager.js';

/**
 * Search DOAJ (Directory of Open Access Journals)
 * Best for: Q3-Q5 open access journals
 * Coverage: 18,000+ journals, all open access
 */
export async function searchDOAJ(q, maxR = 50) {
  const url = `https://doaj.org/api/v2/search/articles?query=${encodeURIComponent(q)}&max=${maxR}`;
  
  try {
    const resp = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const data = await resp.json();
    
    return {
      results: (data.results || []).map(item => makeStudyObj({
        id: 'doaj_' + (item._id || Math.random()),
        doi: item.bibjson?.doi?.[0] || '',
        title: item.bibjson?.title || 'No title',
        author: item.bibjson?.author?.[0]?.name || 'N/A',
        year: item.bibjson?.year || 'N/A',
        journal: item.bibjson?.journal?.title || '',
        abstract: item.bibjson?.abstract || '',
        url: item.bibjson?.link?.[0]?.url || `https://doaj.org/article/${item._id}`,
        source_db: 'DOAJ',
        open_access: true
      })),
      total: data.total || 0
    };
  } catch(e) {
    console.error('DOAJ search error:', e);
    return { results: [], total: 0 };
  }
}

/**
 * Search SciELO (Scientific Electronic Library Online)
 * Best for: Q3-Q5 Latin American journals
 * Coverage: 1,500+ journals from Latin America, Spain, Portugal
 */
export async function searchSciELO(q, maxR = 50) {
  const url = `http://search.scielo.org/?q=${encodeURIComponent(q)}&lang=en&count=${maxR}&from=0&output=json&site=scielo-art`;
  
  try {
    const resp = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const data = await resp.json();
    
    return {
      results: (data.articles || []).map(item => makeStudyObj({
        id: 'scielo_' + (item.id || Math.random()),
        doi: item.doi || '',
        title: item.title || 'No title',
        author: item.author?.[0] || 'N/A',
        year: item.pubdate?.substring(0, 4) || 'N/A',
        journal: item.journal?.title || '',
        abstract: item.abstract || '',
        url: item.url || '',
        source_db: 'SciELO',
        open_access: true
      })),
      total: data.count || 0
    };
  } catch(e) {
    console.error('SciELO search error:', e);
    return { results: [], total: 0 };
  }
}

/**
 * Search PubMed Central (Full-Text)
 * Best for: Q1-Q3 with full-text access
 * Coverage: 8+ million full-text articles
 */
export async function searchPubMedCentral(q, maxR = 50) {
  const url = `https://www.ncbi.nlm.nih.gov/pmc/utils/oa/oa.file.cgi?cmd=search&term=${encodeURIComponent(q)}&max=${maxR}`;
  
  try {
    const resp = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const text = await resp.text();
    
    // Parse XML response
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, 'text/xml');
    const articles = xml.querySelectorAll('article');
    
    return {
      results: Array.from(articles).map(item => {
        const doi = item.querySelector('doi')?.textContent || '';
        const pmid = item.querySelector('pmid')?.textContent || '';
        
        return makeStudyObj({
          id: 'pmc_' + (pmid || Math.random()),
          pmid: pmid,
          doi: doi,
          title: item.querySelector('title')?.textContent || 'No title',
          author: item.querySelector('author')?.textContent || 'N/A',
          year: item.querySelector('pubdate')?.textContent?.substring(0, 4) || 'N/A',
          journal: item.querySelector('journal')?.textContent || '',
          abstract: item.querySelector('abstract')?.textContent || '',
          url: `https://www.ncbi.nlm.nih.gov/pmc/articles/${item.querySelector('pmcid')?.textContent || ''}`,
          source_db: 'PubMed Central',
          open_access: true
        });
      }),
      total: articles.length
    };
  } catch(e) {
    console.error('PMC search error:', e);
    return { results: [], total: 0 };
  }
}

/**
 * Search medRxiv (Preprints)
 * Best for: Latest Q1-Q2 research (pre-peer review)
 * Coverage: Health sciences preprints
 */
export async function searchMedRxiv(q, maxR = 50) {
  const url = `https://api.medrxiv.org/details/medrxiv/${encodeURIComponent(q)}/${maxR}`;
  
  try {
    const resp = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const data = await resp.json();
    
    return {
      results: (data.collection || []).map(item => makeStudyObj({
        id: 'medrxiv_' + (item.doi || Math.random()),
        doi: item.doi || '',
        title: item.title || 'No title',
        author: item.authors?.split(';')?.[0] || 'N/A',
        year: item.date?.substring(0, 4) || 'N/A',
        journal: 'medRxiv',
        abstract: item.abstract || '',
        url: `https://doi.org/${item.doi}`,
        source_db: 'medRxiv',
        preprint: true
      })),
      total: data.count || 0
    };
  } catch(e) {
    console.error('medRxiv search error:', e);
    return { results: [], total: 0 };
  }
}

/**
 * Search bioRxiv (Preprints - Biology)
 * Best for: Latest biology research (pre-peer review)
 */
export async function searchBioRxiv(q, maxR = 50) {
  const url = `https://api.biorxiv.org/details/biorxiv/${encodeURIComponent(q)}/${maxR}`;
  
  try {
    const resp = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const data = await resp.json();
    
    return {
      results: (data.collection || []).map(item => makeStudyObj({
        id: 'biorxiv_' + (item.doi || Math.random()),
        doi: item.doi || '',
        title: item.title || 'No title',
        author: item.authors?.split(';')?.[0] || 'N/A',
        year: item.date?.substring(0, 4) || 'N/A',
        journal: 'bioRxiv',
        abstract: item.abstract || '',
        url: `https://doi.org/${item.doi}`,
        source_db: 'bioRxiv',
        preprint: true
      })),
      total: data.count || 0
    };
  } catch(e) {
    console.error('bioRxiv search error:', e);
    return { results: [], total: 0 };
  }
}

/**
 * Search ClinicalTrials.gov
 * Best for: Q1-Q2 clinical trials (registered studies)
 * Coverage: 400,000+ clinical trials worldwide
 */
export async function searchClinicalTrials(q, maxR = 50) {
  const url = `https://clinicaltrials.gov/api/v2/studies?query.cond=${encodeURIComponent(q)}&pageSize=${maxR}`;
  
  try {
    const resp = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const data = await resp.json();
    
    return {
      results: (data.studies || []).map(item => makeStudyObj({
        id: 'ct_' + (item.protocolSection?.identificationModule?.nctId || Math.random()),
        title: item.protocolSection?.identificationModule?.briefTitle || 'No title',
        author: item.protocolSection?.identificationModule?.organization?.fullName || 'N/A',
        year: item.protocolSection?.statusModule?.startDateStruct?.year || 'N/A',
        journal: 'ClinicalTrials.gov',
        abstract: item.protocolSection?.descriptionModule?.briefSummary || '',
        url: `https://clinicaltrials.gov/study/${item.protocolSection?.identificationModule?.nctId}`,
        source_db: 'ClinicalTrials.gov',
        design: 'RCT' // Most are RCTs
      })),
      total: data.totalCount || 0
    };
  } catch(e) {
    console.error('ClinicalTrials.gov search error:', e);
    return { results: [], total: 0 };
  }
}

/**
 * Search J-STage (Japan Science and Technology)
 * Best for: Q2-Q4 Asian journals
 * Coverage: 3,000+ Japanese journals
 */
export async function searchJStage(q, maxR = 50) {
  const url = `https://www.jstage.jst.go.jp/search/fulltext?q=${encodeURIComponent(q)}&rows=${maxR}`;
  
  try {
    const resp = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const html = await resp.text();
    
    // Parse HTML response (J-STage returns HTML)
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const articles = doc.querySelectorAll('.result-item');
    
    return {
      results: Array.from(articles).map(item => {
        const title = item.querySelector('.title')?.textContent?.trim() || 'No title';
        const journal = item.querySelector('.journal')?.textContent?.trim() || '';
        const year = item.querySelector('.year')?.textContent?.trim() || 'N/A';
        const doi = item.querySelector('.doi')?.textContent?.trim() || '';
        
        return makeStudyObj({
          id: 'jstage_' + Math.random(),
          doi: doi,
          title: title,
          author: item.querySelector('.author')?.textContent?.trim() || 'N/A',
          year: year,
          journal: journal,
          abstract: item.querySelector('.abstract')?.textContent?.trim() || '',
          url: `https://www.jstage.jst.go.jp${item.querySelector('a[href^="/article"]')?.getAttribute('href') || ''}`,
          source_db: 'J-STage'
        });
      }),
      total: articles.length
    };
  } catch(e) {
    console.error('J-STage search error:', e);
    return { results: [], total: 0 };
  }
}

/**
 * Search BASE (Bielefeld Academic Search Engine)
 * Best for: Q1-Q5 multidisciplinary
 * Coverage: 300+ million documents
 */
export async function searchBASE(q, maxR = 50) {
  const url = `https://www.base-search.net/Search/Results?lookfor=${encodeURIComponent(q)}&limit=${maxR}&oformat=json`;
  
  try {
    const resp = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const data = await resp.json();
    
    return {
      results: (data.result || []).map(item => makeStudyObj({
        id: 'base_' + (item.id || Math.random()),
        doi: item.dcn?.find(d => d.type === 'doi')?.value || '',
        title: item.title || 'No title',
        author: item.creator?.[0] || 'N/A',
        year: item.year?.[0] || 'N/A',
        journal: item.relation?.[0] || '',
        abstract: item.description?.[0] || '',
        url: item.link || '',
        source_db: 'BASE'
      })),
      total: data.resultCount || 0
    };
  } catch(e) {
    console.error('BASE search error:', e);
    return { results: [], total: 0 };
  }
}

/**
 * Search CORE (Aggregated open access)
 * Best for: Q1-Q5 open access papers
 * Coverage: 135+ million papers
 */
export async function searchCORE(q, maxR = 50) {
  const url = `https://core.ac.uk/api-v2/articles/search/${encodeURIComponent(q)}?pageSize=${maxR}`;
  
  try {
    const resp = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const data = await resp.json();
    
    return {
      results: (data.results || []).map(item => makeStudyObj({
        id: 'core_' + (item.id || Math.random()),
        doi: item.doi || '',
        title: item.title || 'No title',
        author: item.authors?.[0]?.name || 'N/A',
        year: item.publishedDate?.substring(0, 4) || 'N/A',
        journal: item.journal?.title || '',
        abstract: item.abstract || '',
        url: item.downloadUrl || item.link || '',
        source_db: 'CORE',
        open_access: item.isOpenAccess || false
      })),
      total: data.total || 0
    };
  } catch(e) {
    console.error('CORE search error:', e);
    return { results: [], total: 0 };
  }
}

/**
 * Search Epistemonikos (Systematic Reviews)
 * Best for: Q1-Q2 systematic reviews and meta-analyses
 * Coverage: Largest database of systematic reviews
 */
export async function searchEpistemonikos(q, maxR = 50) {
  const url = `https://www.epistemonikos.org/api/v1/documents?q=${encodeURIComponent(q)}&size=${maxR}`;
  
  try {
    const resp = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const data = await resp.json();
    
    return {
      results: (data.results || []).map(item => makeStudyObj({
        id: 'epist_' + (item.id || Math.random()),
        doi: item.doi || '',
        title: item.title || 'No title',
        author: item.authors?.[0] || 'N/A',
        year: item.year || 'N/A',
        journal: item.journal || '',
        abstract: item.abstract || '',
        url: `https://www.epistemonikos.org/documents/${item.id}`,
        source_db: 'Epistemonikos',
        document_type: item.type || 'Systematic Review'
      })),
      total: data.total || 0
    };
  } catch(e) {
    console.error('Epistemonikos search error:', e);
    return { results: [], total: 0 };
  }
}

/**
 * Comprehensive search across ALL additional databases
 */
export async function searchAllAdditional(q, options = {}) {
  const {
    maxR = 50,
    databases = ['doaj', 'scielo', 'pmc', 'medrxiv', 'core', 'base'],
    yearFrom,
    yearTo
  } = options;
  
  const searchFunctions = {
    doaj: searchDOAJ,
    scielo: searchSciELO,
    pmc: searchPubMedCentral,
    medrxiv: searchMedRxiv,
    biorxiv: searchBioRxiv,
    clinicaltrials: searchClinicalTrials,
    jstage: searchJStage,
    base: searchBASE,
    core: searchCORE,
    epistemonikos: searchEpistemonikos
  };
  
  const results = [];
  const searchPromises = databases
    .filter(db => searchFunctions[db])
    .map(db => searchFunctions[db](q, maxR));
  
  const searchResults = await Promise.allSettled(searchPromises);
  
  searchResults.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.results?.length) {
      results.push(...result.value.results);
    }
  });
  
  // Deduplicate
  const seen = new Set();
  const deduped = results.filter(item => {
    const key = item.doi || item.pmid || item.title?.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  
  const total = searchResults
    .filter(r => r.status === 'fulfilled')
    .reduce((sum, r) => sum + (r.value?.total || 0), 0);
  
  return { results: deduped, total };
}

export default {
  searchDOAJ,
  searchSciELO,
  searchPubMedCentral,
  searchMedRxiv,
  searchBioRxiv,
  searchClinicalTrials,
  searchJStage,
  searchBASE,
  searchCORE,
  searchEpistemonikos,
  searchAllAdditional
};
