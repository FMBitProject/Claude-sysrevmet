/**
 * AI Extractor Module
 * Groq API integration for AI-powered data extraction and paper generation
 */

/**
 * Get Groq API key from localStorage
 */
export function getApiKey() {
  return localStorage.getItem('groq_api_key') || '';
}

/**
 * Save Groq API key
 */
export function setApiKey(key) {
  if (key) {
    localStorage.setItem('groq_api_key', key.trim());
  } else {
    localStorage.removeItem('groq_api_key');
  }
}

/**
 * Call Groq API
 */
export async function callGroqAPI(messages, options = {}) {
  const key = getApiKey();
  if (!key) throw new Error('API_KEY_MISSING');

  const model = options.model || 'llama-3.3-70b-versatile';
  const TARGET = 'https://api.groq.com/openai/v1/chat/completions';

  const maxRetries = 3;
  const baseDelay = 1000;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const resp = await fetch(TARGET, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: options.maxTokens || 2000,
          temperature: options.temperature ?? 0.7,
          stream: false
        })
      });

      if (resp.status === 429 && attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }

      if (resp.status === 401) {
        throw new Error('Invalid API key — check at console.groq.com');
      }
      
      if (!resp.ok) {
        throw new Error(`API error: ${resp.status}`);
      }

      return await resp.json();
    } catch (err) {
      if (attempt === maxRetries) throw err;
      if (err.message !== 'API_KEY_MISSING') {
        await new Promise(r => setTimeout(r, baseDelay * Math.pow(2, attempt)));
      } else {
        throw err;
      }
    }
  }
}

/**
 * System prompt for data extraction
 */
const EXTRACTION_SYSTEM_PROMPT = `You are a biomedical data extraction assistant for systematic reviews and meta-analyses.
Extract ALL numerical outcome data from the text below.
Never invent or estimate values — only extract what is explicitly stated.
Respond ONLY with valid JSON — no markdown, no backticks, no explanation.

JSON schema (use null for any field not found):
{
  "author": "First author surname et al., or null",
  "year": "4-digit year as string, or null",
  "title": "paper title, or null",
  "journal": "journal name, or null",
  "pmid": "PMID as string, or null",
  "doi": "DOI string, or null",
  "design": "RCT | Quasi-RCT | Cluster-RCT | Crossover | Cohort-Prospective | Cohort-Retrospective | Case-Control | Cross-sectional | Registry | null",
  "outcome_type": "continuous | dichotomous | preEntered",
  "n_intervention": number or null,
  "mean_intervention": number or null,
  "sd_intervention": number or null,
  "n_control": number or null,
  "mean_control": number or null,
  "sd_control": number or null,
  "events_intervention": number or null,
  "total_intervention": number or null,
  "events_control": number or null,
  "total_control": number or null,
  "pre_es": number or null,
  "pre_ci_lower": number or null,
  "pre_ci_upper": number or null,
  "effect_measure": "MD | SMD | OR | RR | HR | RD | null",
  "confidence_level": 95,
  "notes": "what was extracted and which section was used"
}`;

/**
 * Extract data from text using AI
 */
export async function extractDataFromText(pasteText, hint = '') {
  const userPrompt = `Extract all meta-analysis outcome data from this text.${hint ? '\nFocus on: ' + hint : ''}\n\nReturn ONLY the JSON object.\n\n---\n\n${pasteText}`;

  const response = await callGroqAPI(
    [
      { role: 'system', content: EXTRACTION_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ],
    {
      model: 'llama-3.3-70b-versatile',
      maxTokens: 2000,
      temperature: 0.1
    }
  );

  const raw = response.choices?.[0]?.message?.content;
  if (!raw) throw new Error('No content in response');

  const clean = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

/**
 * Count extracted fields
 */
export function countFoundFields(extracted) {
  const keys = [
    'n_intervention', 'n_control', 'mean_intervention', 'sd_intervention',
    'mean_control', 'sd_control', 'events_intervention', 'total_intervention',
    'events_control', 'total_control', 'pre_es'
  ];
  return keys.filter(k => extracted[k] !== null && extracted[k] !== undefined).length;
}

/**
 * Save extraction to history
 */
export function saveExtractionHistory(extracted, sourceText) {
  let history;
  try {
    history = JSON.parse(localStorage.getItem('extraction_history') || '[]');
  } catch(e) {
    history = [];
  }
  
  const entry = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    data: extracted,
    sourcePreview: sourceText.substring(0, 200).replace(/\n/g, ' ')
  };
  
  history.unshift(entry);
  if (history.length > 20) history.splice(20);
  localStorage.setItem('extraction_history', JSON.stringify(history));
}

/**
 * Load extraction from history
 */
export function loadExtractionFromHistory(id) {
  let history;
  try {
    history = JSON.parse(localStorage.getItem('extraction_history') || '[]');
  } catch(e) {
    localStorage.removeItem('extraction_history');
    return null;
  }
  
  return history.find(h => h.id === id) || null;
}

/**
 * Delete extraction from history
 */
export function deleteExtractionHistory(id) {
  let history;
  try {
    history = JSON.parse(localStorage.getItem('extraction_history') || '[]');
  } catch(e) {
    localStorage.removeItem('extraction_history');
    return;
  }
  
  const filtered = history.filter(h => h.id !== id);
  localStorage.setItem('extraction_history', JSON.stringify(filtered));
}

/**
 * Get extraction history
 */
export function getExtractionHistory() {
  try {
    return JSON.parse(localStorage.getItem('extraction_history') || '[]');
  } catch(e) {
    return [];
  }
}

/**
 * System prompt for AI paper generation
 */
export function getPaperGenerationPrompt(section, studyData, stats, gradeData) {
  const prompts = {
    introduction: `Write an Introduction section for a systematic review and meta-analysis.
Study data: ${JSON.stringify(studyData, null, 2)}
Include: background, rationale, objectives (PICO format), registration (PROSPERO).
Academic tone, 400-600 words.`,

    methods: `Write a Methods section for a systematic review and meta-analysis.
Study data: ${JSON.stringify(studyData, null, 2)}
Statistics: ${JSON.stringify(stats, null, 2)}
Include: search strategy, eligibility criteria, data extraction, RoB assessment, statistical analysis.
Follow PRISMA 2020 and Cochrane Handbook 6.3 guidelines. 600-800 words.`,

    results: `Write a Results section for a systematic review and meta-analysis.
Study data: ${JSON.stringify(studyData, null, 2)}
Statistics: ${JSON.stringify(stats, null, 2)}
GRADE: ${JSON.stringify(gradeData, null, 2)}
Include: study selection, characteristics, RoB results, synthesis results, subgroup/sensitivity analyses, GRADE certainty.
Report all numerical findings precisely. 800-1200 words.`,

    discussion: `Write a Discussion section for a systematic review and meta-analysis.
Key findings: ${JSON.stringify(stats, null, 2)}
Include: summary of main findings, strengths, limitations, comparison with existing literature, implications for practice and research.
Balanced interpretation, 600-900 words.`,

    conclusion: `Write a Conclusion section for a systematic review and meta-analysis.
Key findings: ${JSON.stringify(stats, null, 2)}
GRADE certainty: ${JSON.stringify(gradeData, null, 2)}
Include: main conclusion, certainty of evidence, implications for practice, research recommendations.
Concise and actionable, 150-250 words.`,

    abstract: `Write a structured Abstract for a systematic review and meta-analysis.
Study data: ${JSON.stringify(studyData, null, 2)}
Statistics: ${JSON.stringify(stats, null, 2)}
Structure: Background, Methods, Results, Conclusion.
Include PROSPERO registration. 250-300 words total.`
  };

  return prompts[section] || '';
}

/**
 * Generate paper section using AI
 */
export async function generatePaperSection(section, studyData, stats, gradeData, length = 'detailed') {
  const systemPrompt = `You are an academic writer specializing in systematic reviews and meta-analyses.
Write in formal academic English suitable for Q1 journals.
Use precise numerical data from the provided study information.
Follow PRISMA 2020 reporting guidelines.
Cite appropriately (author, year format).`;

  const userPrompt = getPaperGenerationPrompt(section, studyData, stats, gradeData);

  const response = await callGroqAPI(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    {
      model: 'llama-3.3-70b-versatile',
      maxTokens: length === 'short' ? 1000 : length === 'detailed' ? 2000 : 1500,
      temperature: 0.3
    }
  );

  return response.choices?.[0]?.message?.content || '';
}

/**
 * Stream paper generation (for real-time display)
 */
export async function streamPaperGeneration(section, studyData, stats, gradeData, onChunk) {
  const key = getApiKey();
  if (!key) throw new Error('API_KEY_MISSING');

  const model = 'llama-3.3-70b-versatile';
  const TARGET = 'https://api.groq.com/openai/v1/chat/completions';

  const systemPrompt = `You are an academic writer specializing in systematic reviews and meta-analyses.`;
  const userPrompt = getPaperGenerationPrompt(section, studyData, stats, gradeData);

  const resp = await fetch(TARGET, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 2000,
      temperature: 0.3,
      stream: true
    })
  });

  if (!resp.ok) throw new Error(`API error: ${resp.status}`);

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content || '';
          if (content) {
            fullText += content;
            onChunk(content);
          }
        } catch (e) {}
      }
    }
  }

  return fullText;
}
