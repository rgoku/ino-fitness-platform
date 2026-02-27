'use client';

import { useState, useMemo } from 'react';
import { Users } from 'lucide-react';
import { useClients } from '@/hooks/use-clients';
import { ClientToolbar } from '@/components/clients/client-toolbar';
import { ClientList } from '@/components/clients/client-list';
import { ClientCard } from '@/components/clients/client-card';
import { AddClientDialog } from '@/components/clients/add-client-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

export default function ClientsPage() {
  const { data: clients, isLoading } = useClients();
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [addOpen, setAddOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!clients) return [];
    if (!search.trim()) return clients;
    const q = search.toLowerCase();
    return clients.filter(
      (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    );
  }, [clients, search]);

  return (
    <div className="space-y-5">
      <h1 className="text-[1.6rem] font-semibold tracking-tight text-[var(--color-text-primary)]">
        Clients{filtered.length > 0 && (
          <span className="ml-2 text-base font-normal text-[var(--color-text-tertiary)]">{filtered.length}</span>
        )}
      </h1>

      <ClientToolbar
        search={search}
        onSearchChange={setSearch}
        view={view}
        onViewChange={setView}
        onAddClick={() => setAddOpen(true)}
      />

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={search ? 'No matches' : 'Your roster is empty'}
          description={search ? `Nothing matching "${search}"` : 'Once you add clients, they\'ll show up here.'}
          action={!search ? { label: 'Add your first client', onClick: () => setAddOpen(true) } : undefined}
        />
      ) : view === 'list' ? (
        <ClientList clients={filtered} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      )}

      <AddClientDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
