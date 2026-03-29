const PUBMED_BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/';

export interface PubMedArticle {
  pmid: string;
  title: string;
  authors: string[];
  journal: string;
  year: number;
  abstract?: string;
  doi?: string;
}

interface ESearchResult {
  esearchresult: {
    count: string;
    idlist: string[];
    retmax: string;
  };
}

interface ESummaryAuthor {
  name: string;
  authtype: string;
}

interface ESummaryArticle {
  uid: string;
  title: string;
  authors: ESummaryAuthor[];
  source: string;
  pubdate: string;
  elocationid?: string;
  articleids?: { idtype: string; value: string }[];
}

interface ESummaryResult {
  result: {
    uids: string[];
    [pmid: string]: ESummaryArticle | string[];
  };
}

/**
 * Search PubMed for articles matching a query string.
 * Returns an array of PMIDs (up to 20 results).
 */
export async function searchPubMed(query: string): Promise<string[]> {
  const encodedQuery = encodeURIComponent(query);
  const url = `${PUBMED_BASE_URL}esearch.fcgi?db=pubmed&retmode=json&retmax=20&term=${encodedQuery}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`PubMed search failed: ${response.statusText}`);
  }

  const data: ESearchResult = await response.json();
  return data.esearchresult.idlist;
}

/**
 * Validate that a PubMed article exists for the given PMID.
 * Returns true if the article was found, false otherwise.
 */
export async function validateCitation(pmid: string): Promise<boolean> {
  const url = `${PUBMED_BASE_URL}esummary.fcgi?db=pubmed&retmode=json&id=${encodeURIComponent(pmid)}`;

  const response = await fetch(url);
  if (!response.ok) return false;

  const data: ESummaryResult = await response.json();
  const uids = data.result?.uids ?? [];
  return uids.includes(pmid);
}

/**
 * Fetch detailed article information for one or more PMIDs.
 * Returns an array of PubMedArticle objects.
 */
export async function fetchArticleDetails(pmids: string[]): Promise<PubMedArticle[]> {
  if (pmids.length === 0) return [];

  const url = `${PUBMED_BASE_URL}esummary.fcgi?db=pubmed&retmode=json&id=${pmids.join(',')}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`PubMed fetch failed: ${response.statusText}`);
  }

  const data: ESummaryResult = await response.json();
  const uids = data.result?.uids ?? [];

  return uids.map((uid) => {
    const article = data.result[uid] as ESummaryArticle;
    const doi = article.articleids?.find((a) => a.idtype === 'doi')?.value
      ?? extractDoiFromElocationId(article.elocationid);

    return {
      pmid: uid,
      title: article.title ?? '',
      authors: (article.authors ?? []).map((a) => a.name),
      journal: article.source ?? '',
      year: parseYear(article.pubdate),
      doi: doi ?? undefined,
    };
  });
}

function parseYear(pubdate: string | undefined): number {
  if (!pubdate) return 0;
  const match = pubdate.match(/\d{4}/);
  return match ? parseInt(match[0], 10) : 0;
}

function extractDoiFromElocationId(elocationid: string | undefined): string | undefined {
  if (!elocationid) return undefined;
  // elocationid often looks like "doi: 10.xxxx/yyyy"
  const match = elocationid.match(/doi:\s*(10\.\S+)/i);
  return match ? match[1] : undefined;
}
