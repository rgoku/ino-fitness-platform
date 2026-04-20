'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error('ErrorBoundary caught:', error, info);
  }

  reset = () => this.setState({ hasError: false, error: undefined });

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error-50 dark:bg-red-900/20">
            <AlertTriangle size={20} className="text-error-500" />
          </div>
          <div>
            <h2 className="text-heading-3 text-[var(--color-text-primary)]">Something went wrong</h2>
            <p className="mt-1 text-body-sm text-[var(--color-text-secondary)] max-w-md">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
          </div>
          <Button variant="primary" size="md" onClick={this.reset} icon={<RefreshCw size={14} />}>
            Try again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
