'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dumbbell, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth-store';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-surface-secondary)] px-4">
      <div className="w-full max-w-[400px]">
        {/* Branding */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500 shadow-md">
            <Dumbbell size={24} className="text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-heading-1 text-[var(--color-text-primary)]">
              INO Coach
            </h1>
            <p className="mt-1 text-body-sm text-[var(--color-text-secondary)]">
              Sign in to your coaching dashboard
            </p>
          </div>
        </div>

        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="coach@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail size={16} />}
                required
                autoComplete="email"
              />

              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock size={16} />}
                required
                autoComplete="current-password"
              />

              {error && (
                <p className="text-body-xs text-error-500">{error}</p>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isLoading}
                className="w-full"
              >
                Sign in
              </Button>

              <p className="text-center text-body-xs text-[var(--color-text-tertiary)]">
                Dev mode: sarah@inocoach.com / password
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
