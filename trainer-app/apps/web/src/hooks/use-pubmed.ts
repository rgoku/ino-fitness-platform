import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import {
  searchPubMed,
  fetchArticleDetails,
  type PubMedArticle,
} from '@/lib/pubmed-service';

/**
 * Debounced PubMed search hook.
 * Waits 500ms after the last keystroke before firing the API call.
 */
export function usePubMedSearch(query: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 500);
    return () => clearTimeout(timer);
  }, [query]);

  const searchQuery = useQuery({
    queryKey: ['pubmed-search', debouncedQuery],
    queryFn: async () => {
      const pmids = await searchPubMed(debouncedQuery);
      if (pmids.length === 0) return [] as PubMedArticle[];
      return fetchArticleDetails(pmids);
    },
    enabled: debouncedQuery.trim().length >= 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return searchQuery;
}

/**
 * Validates existing citations by attempting to find them on PubMed via DOI.
 * Returns a map of citation id -> boolean (valid or not).
 */
export function useValidateCitations(citations: Array<{ id: string; doi: string }>) {
  return useQuery({
    queryKey: ['pubmed-validate', citations.map((c) => c.doi).join(',')],
    queryFn: async () => {
      const results: Record<string, boolean> = {};

      // Validate each citation by searching PubMed for the DOI
      await Promise.all(
        citations.map(async (citation) => {
          try {
            const pmids = await searchPubMed(citation.doi);
            results[citation.id] = pmids.length > 0;
          } catch {
            results[citation.id] = false;
          }
        })
      );

      return results;
    },
    enabled: citations.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
