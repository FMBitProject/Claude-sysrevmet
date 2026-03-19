/**
 * Search Engines Module
 * Database search functionality for PubMed, Europe PMC, Semantic Scholar, CORE, and CrossRef
 */

import { makeStudyObj } from './study-manager.js';

/**
 * Design filter mapping for different databases
 */
const DESIGN_FILTERS = {
  'randomized controlled trial': {
    pubmed: '(randomized controlled trial[pt]) NOT (congress[pt] OR "letter"[pt] OR "comment"[pt] OR "editorial"[pt] OR "case reports"[pt] OR "abstract"[tiab])',
    europepmc: '(ARTICLE_TYPE:"research-article" AND (randomized OR randomised OR "randomized controlled trial" OR "RCT") NOT (conference OR abstract OR "letter to" OR editorial))',
    semantic: 'randomized controlled trial clinical trial',
    core: 'randomized controlled trial',
    crossref: 'randomized controlled trial'
  },
  'clinical trial': {
    pubmed: 'clinical trial[pt]',
    europepmc: '(clinical trial OR clinical study)',
    semantic: 'clinical trial',
    core: 'clinical trial',
    crossref: 'clinical trial'
  },
  'randomized controlled trial OR quasi-experimental': {
    pubmed: '(randomized controlled trial[pt] OR quasi-experimental[tiab] OR "non-randomized trial"[tiab])',
    europepmc: '(randomized OR randomised OR quasi-experimental OR "non-randomized")',
    semantic: 'randomized controlled trial quasi-experimental',
    core: 'randomized OR quasi-experimental',
    crossref: 'randomized quasi-experimental'
  },
  'cohort study': {
    pubmed: '(cohort studies[mh] OR cohort study[tiab] OR prospective study[tiab] OR retrospective study[tiab])',
    europepmc: '(cohort study OR prospective study OR retrospective study)',
    semantic: 'cohort study',
    core: 'cohort study',
    crossref: 'cohort study'
  },
  'case-control': {
    pubmed: 'case-control studies[mh]',
    europepmc: '(case-control OR case control)',
    semantic: 'case-control study',
    core: 'case-control',
    crossref: 'case-control'
  },
  'systematic review': {
    pubmed: '(systematic review[pt] OR meta-analysis[pt])',
    europepmc: '(systematic review OR meta-analysis)',
    semantic: 'systematic review meta-analysis',
    core: 'systematic review',
    crossref: 'systematic review'
  },
  'randomized controlled trial OR cohort study OR case-control': {
    pubmed: '(randomized controlled trial[pt] OR cohort studies[mh] OR case-control studies[mh])',
    europepmc: '(randomized OR cohort study OR case-control)',
    semantic: 'randomized controlled trial cohort study',
    core: 'randomized OR cohort OR case-control',
    crossref: 'randomized cohort case-control'
  }
};

/**
 * Get design filter value from UI
 */
export function getDesignFilter() {
  const el = document.getElementById('study-design-filter');
  return el?.value || '';
}

/**
 * Build design filters for all databases
 */
export function buildDesignFilters(designVal) {
  return DESIGN_FILTERS[designVal] || { 
    pubmed:'', europepmc:'', semantic:'', core:'', crossref:'' 
  };
}

/**
 * Search PubMed
 */
export async function searchPubMed(q, maxR = 50, yearFrom, yearTo) {
  const designVal = getDesignFilter();
  const filters = buildDesignFilters(designVal);
  
  let query = q;
  if (filters.pubmed) query += ` AND (${filters.pubmed})`;
  query += ' NOT ("published erratum"[pt] OR "congress"[pt] OR "animal experimentation"[mh] OR "mice"[mh] OR "rats"[mh])';
  query += ' AND ("journal article"[pt]) AND ("humans"[mh] OR humans[ti] OR adults[tiab] OR patients[tiab])';
  if (yearFrom || yearTo) query += ` AND ("${yearFrom||1900}"[PDAT]:"${yearTo||2099}"[PDAT])`;
  
  try {
    const res = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmode=json&retmax=${maxR}`);
    const data = await res.json();
    const ids = data.esearchresult?.idlist || [];
    
    if (!ids.length) return { results: [], total: 0 };
    
    const sum = await (await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`)).json();
    
    return {
      results: ids.map(id => makeStudyObj({
        id: 'pubmed_' + id,
        pmid: id,
        title: sum.result[id]?.title || 'No title',
        author: sum.result[id]?.authors?.[0]?.name || 'N/A',
        year: (sum.result[id]?.pubdate || '').split(' ')[0] || 'N/A',
        journal: sum.result[id]?.fulljournalname || '',
        doi: sum.result[id]?.articleids?.find(x => x.idtype === 'doi')?.value || '',
        url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
        source_db: 'PubMed'
      })),
      total: parseInt(data.esearchresult?.count || 0)
    };
  } catch (e) {
    console.error('PubMed search error:', e);
    return { results: [], total: 0 };
  }
}

/**
 * Search Europe PMC
 */
export async function searchEuropePMC(q, maxR = 50, yearFrom, yearTo) {
  const designVal = getDesignFilter();
  const filters = buildDesignFilters(designVal);
  
  let query = q;
  if (filters.europepmc) query += ` AND ${filters.europepmc}`;
  query += ' AND (SRC:MED OR SRC:PMC) NOT (conference OR "letter to the editor" OR preprint)';
  if (yearFrom) query += ` AND PUB_YEAR:[${yearFrom} TO ${yearTo||2099}]`;
  
  try {
    const res = await (await fetch(`https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(query)}&format=json&pageSize=${maxR}&resultType=core`)).json();
    
    return {
      results: (res.resultList?.result || []).map(item => makeStudyObj({
        id: 'epmc_' + (item.pmid || item.id || Math.random()),
        pmid: item.pmid || '',
        title: item.title || 'No title',
        author: item.authorString?.split(',')[0] || 'N/A',
        year: item.pubYear || 'N/A',
        journal: item.journalTitle || '',
        doi: item.doi || '',
        abstract: item.abstractText || '',
        url: item.pmid ? `https://europepmc.org/article/MED/${item.pmid}` : '',
        source_db: 'Europe PMC'
      })),
      total: res.hitCount || 0
    };
  } catch (e) {
    console.error('Europe PMC search error:', e);
    return { results: [], total: 0 };
  }
}

/**
 * Search Semantic Scholar
 */
export async function searchSemanticScholar(q, maxR = 50) {
  const designVal = getDesignFilter();
  const filters = buildDesignFilters(designVal);
  const query = filters.semantic ? `${q} ${filters.semantic}` : q;
  
  const apiUrl = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=${maxR}&fields=title,authors,year,venue,externalIds,abstract,openAccessPdf`;
  
  const proxies = [
    apiUrl,
    `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`,
    `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`
  ];
  
  let data = null;
  for (const url of proxies) {
    try {
      const resp = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!resp.ok) continue;
      let json = await resp.json();
      if (json.contents) json = JSON.parse(json.contents);
      if (json.data || json.error === undefined) { data = json; break; }
    } catch(e) { continue; }
  }
  
  if (!data || !data.data) return { results: [], total: 0 };
  
  return {
    results: (data.data || []).map(item => makeStudyObj({
      id: 'ss_' + (item.paperId || Math.random()),
      pmid: item.externalIds?.PubMed || '',
      doi: item.externalIds?.DOI || '',
      title: item.title || 'No title',
      author: item.authors?.[0]?.name || 'N/A',
      year: item.year ? String(item.year) : 'N/A',
      journal: item.venue || '',
      abstract: item.abstract || '',
      url: item.openAccessPdf?.url || (item.externalIds?.DOI ? `https://doi.org/${item.externalIds.DOI}` : ''),
      source_db: 'Semantic Scholar'
    })),
    total: data.total || 0
  };
}

/**
 * Search CORE
 */
export async function searchCORE(q, maxR = 50) {
  const designVal = getDesignFilter();
  const filters = buildDesignFilters(designVal);
  const query = filters.core ? `${q} ${filters.core}` : q;
  
  // Try CORE directly first
  try {
    const apiUrl = `https://api.core.ac.uk/v3/search/works?q=${encodeURIComponent(query)}&limit=${maxR}`;
    const proxied = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;
    const resp = await fetch(proxied, { signal: AbortSignal.timeout(7000) });
    
    if (resp.ok) {
      const data = await resp.json();
      if (data.results?.length) {
        return {
          results: (data.results || []).map(item => makeStudyObj({
            id: 'core_' + (item.id || Math.random()),
            title: item.title || 'No title',
            author: item.authors?.[0]?.name || (Array.isArray(item.authors) ? item.authors[0] : 'N/A') || 'N/A',
            year: item.publishedDate ? item.publishedDate.split('-')[0] : (item.yearPublished ? String(item.yearPublished) : 'N/A'),
            journal: item.publisher || item.journals?.[0]?.title || '',
            doi: item.doi || '',
            abstract: item.abstract || '',
            url: item.downloadUrl || item.links?.[0]?.url || '',
            source_db: 'CORE'
          })),
          total: data.totalHits || 0
        };
      }
    }
  } catch(e) {}
  
  // Fallback: Europe PMC open-access
  try {
    const oacQuery = `${query} AND (OPEN_ACCESS:true)`;
    const resp = await fetch(`https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(oacQuery)}&format=json&pageSize=${maxR}&resultType=core`);
    const res = await resp.json();
    
    return {
      results: (res.resultList?.result || []).map(item => makeStudyObj({
        id: 'core_epmc_' + (item.pmid || item.id || Math.random()),
        pmid: item.pmid || '',
        title: item.title || 'No title',
        author: item.authorString?.split(',')[0] || 'N/A',
        year: item.pubYear || 'N/A',
        journal: item.journalTitle || '',
        doi: item.doi || '',
        abstract: item.abstractText || '',
        url: item.pmid ? `https://europepmc.org/article/MED/${item.pmid}` : '',
        source_db: 'CORE (via Open Access)'
      })),
      total: res.hitCount || 0
    };
  } catch(e) {
    return { results: [], total: 0 };
  }
}

/**
 * Search CrossRef
 */
export async function searchCrossRef(q, maxR = 50, yearFrom, yearTo) {
  const designVal = getDesignFilter();
  const filters = buildDesignFilters(designVal);
  const query = filters.crossref ? `${q} ${filters.crossref}` : q;
  
  let url = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=${maxR}&select=DOI,title,author,published,container-title,abstract`;
  if (yearFrom) url += `&filter=from-pub-date:${yearFrom}`;
  if (yearTo) url += `,until-pub-date:${yearTo}`;
  
  try {
    const data = await (await fetch(url)).json();
    
    return {
      results: (data.message?.items || []).map(item => {
        const doi = item.DOI || '';
        const yr = item.published?.['date-parts']?.[0]?.[0];
        return makeStudyObj({
          id: 'cr_' + doi.replace(/\//g, '_'),
          doi: doi,
          title: (Array.isArray(item.title) ? item.title[0] : item.title) || 'No title',
          author: item.author?.[0] ? (item.author[0].family || item.author[0].name || 'N/A') : 'N/A',
          year: yr ? String(yr) : 'N/A',
          journal: (Array.isArray(item['container-title']) ? item['container-title'][0] : '') || '',
          abstract: item.abstract || '',
          url: doi ? `https://doi.org/${doi}` : '',
          source_db: 'CrossRef'
        });
      }),
      total: data.message?.['total-results'] || 0
    };
  } catch (e) {
    console.error('CrossRef search error:', e);
    return { results: [], total: 0 };
  }
}

/**
 * Deduplicate search results
 */
export function deduplicateResults(allResults) {
  const seen = new Map();
  const out = [];
  
  for (const s of allResults) {
    const keyDoi = s.doi ? s.doi.toLowerCase().trim() : null;
    const keyTitle = s.title.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim().slice(0, 80);
    const keyPmid = s.pmid ? 'pmid:' + s.pmid : null;
    const matchKey = keyPmid || keyDoi || keyTitle;
    
    if (matchKey && seen.has(matchKey)) {
      const ex = seen.get(matchKey);
      if (!ex.pmid && s.pmid) ex.pmid = s.pmid;
      if (!ex.doi && s.doi) ex.doi = s.doi;
      if (!ex.abstract && s.abstract) ex.abstract = s.abstract;
      ex.source_db = ex.source_db + ' + ' + s.source_db;
    } else {
      if (matchKey) seen.set(matchKey, s);
      out.push(s);
    }
  }
  
  return out;
}

/**
 * Run comprehensive search across all databases
 */
export async function runComprehensiveSearch(searchQuery, maxResults = 50, yearFrom, yearTo) {
  const results = [];
  
  const searchPromises = [
    searchPubMed(searchQuery, maxResults, yearFrom, yearTo),
    searchEuropePMC(searchQuery, maxResults, yearFrom, yearTo),
    searchSemanticScholar(searchQuery, maxResults),
    searchCORE(searchQuery, maxResults),
    searchCrossRef(searchQuery, maxResults, yearFrom, yearTo)
  ];
  
  const searchResults = await Promise.allSettled(searchPromises);
  
  searchResults.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.results?.length) {
      results.push(...result.value.results);
    }
  });
  
  const deduplicated = deduplicateResults(results);
  const total = searchResults
    .filter(r => r.status === 'fulfilled')
    .reduce((sum, r) => sum + (r.value?.total || 0), 0);
  
  return { results: deduplicated, total };
}
