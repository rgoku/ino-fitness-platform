import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
      <div className="mb-4 rounded-full bg-surface-secondary p-3">
        <FileQuestion size={24} className="text-[var(--color-text-tertiary)]" />
      </div>
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
        Page not found
      </h2>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
