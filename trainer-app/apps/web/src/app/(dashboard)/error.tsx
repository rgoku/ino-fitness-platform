'use client';

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
      <div className="mb-4 rounded-full bg-red-500/10 p-3">
        <AlertTriangle size={24} className="text-red-500" />
      </div>
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
        Something went wrong
      </h2>
      <p className="mt-1 max-w-md text-sm text-[var(--color-text-secondary)]">
        {error.message || 'An unexpected error occurred while loading this page.'}
      </p>
      <Button variant="secondary" size="sm" className="mt-4" onClick={reset}>
        Try Again
      </Button>
    </div>
  );
}
