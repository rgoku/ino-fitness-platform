'use client';

import { useState } from 'react';
import { Plus, Dumbbell } from 'lucide-react';
import { useTemplates, useDeleteTemplate } from '@/hooks/use-templates';
import { ProgramCard } from '@/components/programs/program-card';
import { CreateProgramDialog } from '@/components/programs/create-program-dialog';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProgramsPage() {
  const { data: templates, isLoading } = useTemplates();
  const deleteTemplate = useDeleteTemplate();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Programs</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Create and manage workout templates
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} size="sm">
          <Plus size={14} />
          New Program
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : !templates || templates.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="No programs yet"
          description="Create your first workout template to get started."
          action={{ label: 'Create Program', onClick: () => setCreateOpen(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => (
            <ProgramCard
              key={template.id}
              template={template}
              onDelete={(id) => deleteTemplate.mutate(id)}
            />
          ))}
        </div>
      )}

      <CreateProgramDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
