'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCreateTemplate } from '@/hooks/use-templates';

interface CreateProgramDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateProgramDialog({ open, onClose }: CreateProgramDialogProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [weeks, setWeeks] = useState('8');
  const [daysPerWeek, setDaysPerWeek] = useState('4');
  const [error, setError] = useState('');
  const createTemplate = useCreateTemplate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Program name is required');
      return;
    }

    try {
      const template = await createTemplate.mutateAsync({
        name: name.trim(),
        description: description.trim(),
        weeks: parseInt(weeks) || 8,
        days_per_week: parseInt(daysPerWeek) || 4,
      });
      setName('');
      setDescription('');
      onClose();
      router.push(`/programs/${template.id}`);
    } catch {
      setError('Failed to create program');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Create Program">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Program Name"
          placeholder="e.g., Hypertrophy A - Upper/Lower"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={error && !name.trim() ? error : undefined}
          autoFocus
        />
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
            Description
          </label>
          <textarea
            placeholder="Describe the program goals and structure..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="block w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Weeks"
            type="number"
            min="1"
            max="52"
            value={weeks}
            onChange={(e) => setWeeks(e.target.value)}
          />
          <Input
            label="Days / Week"
            type="number"
            min="1"
            max="7"
            value={daysPerWeek}
            onChange={(e) => setDaysPerWeek(e.target.value)}
          />
        </div>
        {error && name.trim() && (
          <p className="text-sm text-red-500">{error}</p>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={createTemplate.isPending}>
            Create Program
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
