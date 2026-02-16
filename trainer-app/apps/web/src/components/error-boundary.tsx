'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-border p-8 text-center">
          <div className="mb-4 rounded-full bg-red-500/10 p-3">
            <AlertTriangle size={24} className="text-red-500" />
          </div>
          <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
            Something went wrong
          </h3>
          <p className="mt-1 max-w-sm text-sm text-[var(--color-text-secondary)]">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-4"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
