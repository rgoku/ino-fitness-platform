import Link from 'next/link';
import { FileQuestion, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center gap-5 px-4 text-center animate-slide-up">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-surface-hover)]">
        <FileQuestion size={28} className="text-[var(--color-text-tertiary)]" />
      </div>
      <div className="max-w-md">
        <h2 className="text-heading-2 text-[var(--color-text-primary)]">Page not found</h2>
        <p className="mt-2 text-body-md text-[var(--color-text-secondary)]">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>
      <Link href="/">
        <Button variant="primary" size="md" icon={<Home size={14} />}>
          Back to dashboard
        </Button>
      </Link>
    </div>
  );
}
