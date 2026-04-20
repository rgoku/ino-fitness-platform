'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 px-4 text-center animate-slide-up">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-error-50 dark:bg-red-900/20">
        <AlertTriangle size={28} className="text-error-500" />
      </div>
      <div className="max-w-md">
        <h1 className="text-heading-1 text-[var(--color-text-primary)]">Something went wrong</h1>
        <p className="mt-2 text-body-md text-[var(--color-text-secondary)]">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        {error.digest && (
          <p className="mt-2 text-body-xs text-[var(--color-text-tertiary)] font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" size="md" onClick={reset} icon={<RefreshCw size={14} />}>
          Try again
        </Button>
        <Link href="/">
          <Button variant="primary" size="md" icon={<Home size={14} />}>
            Go home
          </Button>
        </Link>
      </div>
    </div>
  );
}
