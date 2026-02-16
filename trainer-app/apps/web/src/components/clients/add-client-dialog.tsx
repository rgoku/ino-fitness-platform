'use client';

import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCreateClient } from '@/hooks/use-clients';

interface AddClientDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AddClientDialog({ open, onClose }: AddClientDialogProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const createClient = useCreateClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    try {
      await createClient.mutateAsync({ name: name.trim(), email: email.trim() || undefined });
      setName('');
      setEmail('');
      onClose();
    } catch {
      setError('Failed to create client');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Add New Client">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name"
          placeholder="Client name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={error && !name.trim() ? error : undefined}
          autoFocus
        />
        <Input
          label="Email"
          type="email"
          placeholder="client@email.com (optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {error && name.trim() && (
          <p className="text-sm text-red-500">{error}</p>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={createClient.isPending}>
            Add Client
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
