'use client';

import { useState } from 'react';
import { Search, ShieldCheck, Plus, Loader2, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { usePubMedSearch, useValidateCitations } from '@/hooks/use-pubmed';
import type { PubMedArticle } from '@/lib/pubmed-service';
import type { MockResearchCitation } from '@/lib/mock-data';

interface PubMedResearchPanelProps {
  citations: MockResearchCitation[];
  onAttachCitation?: (citation: MockResearchCitation) => void;
}

export function PubMedResearchPanel({ citations, onAttachCitation }: PubMedResearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [autoValidateEnabled, setAutoValidateEnabled] = useState(false);

  const { data: searchResults, isLoading: isSearching, isFetching } = usePubMedSearch(searchQuery);
  const {
    data: validationResults,
    isLoading: isValidating,
    refetch: runValidation,
  } = useValidateCitations(
    autoValidateEnabled ? citations.map((c) => ({ id: c.id, doi: c.doi })) : []
  );

  const handleAutoValidate = () => {
    setAutoValidateEnabled(true);
    // If already enabled, refetch
    if (autoValidateEnabled) {
      runValidation();
    }
  };

  const handleAttach = (article: PubMedArticle) => {
    if (!onAttachCitation) return;

    const newCitation: MockResearchCitation = {
      id: `rc-pm-${article.pmid}`,
      title: article.title,
      authors: article.authors.join(', '),
      journal: article.journal,
      year: article.year,
      doi: article.doi ?? '',
      summary: `Imported from PubMed (PMID: ${article.pmid})`,
    };

    onAttachCitation(newCitation);
  };

  const validCount = validationResults
    ? Object.values(validationResults).filter(Boolean).length
    : 0;
  const totalChecked = validationResults
    ? Object.keys(validationResults).length
    : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-brand-500" />
          <h3 className="text-body-sm font-semibold text-[var(--color-text-primary)]">
            Research Backing (Coach Only)
          </h3>
        </div>
        <p className="text-body-xs text-[var(--color-text-tertiary)]">
          Not visible to clients
        </p>
      </div>

      {/* Citation validation summary */}
      {citations.length > 0 && (
        <Card>
          <CardContent className="py-3 px-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-body-sm font-medium text-[var(--color-text-primary)]">
                  Current Citations
                </p>
                <p className="text-body-xs text-[var(--color-text-tertiary)]">
                  {citations.length} citation{citations.length !== 1 ? 's' : ''} attached
                  {autoValidateEnabled && totalChecked > 0 && (
                    <span className="ml-1.5">
                      — <span className="text-brand-500 font-medium">{validCount}</span>/{totalChecked} verified
                    </span>
                  )}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleAutoValidate}
                loading={isValidating}
              >
                <ShieldCheck size={14} className="mr-1" />
                Auto-validate
              </Button>
            </div>

            {/* Validation badges for each citation */}
            {autoValidateEnabled && validationResults && (
              <div className="mt-3 space-y-1.5 border-t border-[var(--color-border-light)] pt-3">
                {citations.map((citation) => {
                  const isValid = validationResults[citation.id];
                  const checked = citation.id in validationResults;

                  return (
                    <div
                      key={citation.id}
                      className="flex items-center gap-2 text-body-xs"
                    >
                      {checked ? (
                        isValid ? (
                          <CheckCircle size={13} className="text-brand-500 shrink-0" />
                        ) : (
                          <XCircle size={13} className="text-error-500 shrink-0" />
                        )
                      ) : (
                        <Loader2 size={13} className="text-[var(--color-text-tertiary)] animate-spin shrink-0" />
                      )}
                      <span
                        className={cn(
                          'truncate',
                          checked && isValid
                            ? 'text-[var(--color-text-primary)]'
                            : checked
                              ? 'text-error-500'
                              : 'text-[var(--color-text-tertiary)]'
                        )}
                      >
                        {citation.title}
                      </span>
                      {checked && (
                        <Badge variant={isValid ? 'success' : 'danger'} className="ml-auto shrink-0">
                          {isValid ? 'Valid' : 'Not found'}
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Search box */}
      <Input
        placeholder="Search PubMed for articles..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        icon={<Search size={15} />}
      />

      {/* Loading indicator */}
      {(isSearching || isFetching) && searchQuery.trim().length >= 3 && (
        <div className="flex items-center justify-center gap-2 py-4 text-body-xs text-[var(--color-text-tertiary)]">
          <Loader2 size={14} className="animate-spin" />
          Searching PubMed...
        </div>
      )}

      {/* Search results */}
      {searchResults && searchResults.length > 0 && (
        <div className="space-y-2">
          <p className="text-body-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
            Results ({searchResults.length})
          </p>
          {searchResults.map((article) => (
            <ArticleCard
              key={article.pmid}
              article={article}
              onAttach={() => handleAttach(article)}
              alreadyAttached={citations.some(
                (c) => c.doi === article.doi || c.title === article.title
              )}
            />
          ))}
        </div>
      )}

      {/* No results */}
      {searchResults && searchResults.length === 0 && searchQuery.trim().length >= 3 && !isSearching && !isFetching && (
        <p className="text-body-xs text-[var(--color-text-tertiary)] text-center py-4">
          No articles found for &quot;{searchQuery}&quot;
        </p>
      )}
    </div>
  );
}

function ArticleCard({
  article,
  onAttach,
  alreadyAttached,
}: {
  article: PubMedArticle;
  onAttach: () => void;
  alreadyAttached: boolean;
}) {
  return (
    <Card>
      <CardContent className="py-3 px-4 space-y-2">
        <p className="text-body-sm font-medium text-[var(--color-text-primary)] leading-snug">
          {article.title}
        </p>
        <p className="text-body-xs text-[var(--color-text-tertiary)]">
          {article.authors.slice(0, 3).join(', ')}
          {article.authors.length > 3 && ', et al.'}
        </p>
        <div className="flex items-center gap-2">
          <p className="text-body-xs text-[var(--color-text-secondary)]">
            <span className="italic">{article.journal}</span>
            {article.year > 0 && <span> ({article.year})</span>}
          </p>
          <Badge variant="brand">PMID: {article.pmid}</Badge>
        </div>
        <div className="flex items-center justify-between pt-1">
          <a
            href={`https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-body-xs text-brand-500 hover:underline"
          >
            <ExternalLink size={11} />
            View on PubMed
          </a>
          {alreadyAttached ? (
            <Badge variant="success">
              <CheckCircle size={11} className="mr-0.5" />
              Attached
            </Badge>
          ) : (
            <Button size="sm" variant="accent" onClick={onAttach}>
              <Plus size={13} className="mr-0.5" />
              Attach
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
