'use client';

import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { useClients } from '@/hooks/use-clients';
import { cn } from '@/lib/utils';

interface AssignProgramDialogProps {
  open: boolean;
  onClose: () => void;
  templateName: string;
}

export function AssignProgramDialog({ open, onClose, templateName }: AssignProgramDialogProps) {
  const { data: clients } = useClients();
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);

  const handleAssign = async () => {
    if (!selectedClient) return;
    setAssigning(true);
    // Simulate assignment
    await new Promise((r) => setTimeout(r, 800));
    setAssigning(false);
    setSelectedClient(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} title="Assign Program">
      <div className="space-y-4">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Assign <strong className="text-[var(--color-text-primary)]">{templateName}</strong> to a client.
        </p>

        <div className="max-h-64 overflow-y-auto space-y-1">
          {clients?.map((client) => (
            <button
              key={client.id}
              onClick={() => setSelectedClient(client.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition-colors',
                selectedClient === client.id
                  ? 'bg-brand-500/10 ring-1 ring-brand-500'
                  : 'hover:bg-surface-secondary'
              )}
            >
              <Avatar name={client.name} size="sm" />
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">{client.name}</p>
                <p className="text-xs text-[var(--color-text-tertiary)]">{client.email}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            loading={assigning}
            disabled={!selectedClient}
          >
            Assign Program
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
