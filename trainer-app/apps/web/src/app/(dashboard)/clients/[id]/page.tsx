'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useClient } from '@/hooks/use-clients';
import { ClientHeader } from '@/components/clients/client-header';
import { ClientOverviewTab } from '@/components/clients/client-overview-tab';
import { ClientWorkoutsTab } from '@/components/clients/client-workouts-tab';
import { ClientProgressTab } from '@/components/clients/client-progress-tab';
import { ClientTrophiesTab } from '@/components/clients/client-trophies-tab';
import { Tabs } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { AIInsight } from '@/components/ui/ai-insight';

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'workouts', label: 'Workouts' },
  { id: 'nutrition', label: 'Nutrition' },
  { id: 'progress', label: 'Progress' },
  { id: 'trophies', label: 'Trophies' },
];

export default function ClientDetailPage() {
  const params = useParams();
  const clientId = params.id as string;
  const { data: client, isLoading } = useClient(clientId);
  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="mt-2 h-4 w-56" />
          </div>
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-heading-3 text-[var(--color-text-primary)]">Client not found</h2>
        <p className="mt-1 text-body-md text-[var(--color-text-secondary)]">
          This client may have been removed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ClientHeader client={client} />

      {/* AI Insight for this client */}
      {client.compliance < 70 && (
        <AIInsight
          type="alert"
          title={`${client.name.split(' ')[0]}'s compliance dropped to ${client.compliance}%`}
          description="Consider simplifying their program or sending a motivational check-in. Clients respond best to shorter, achievable workout blocks when consistency drops."
        />
      )}

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="animate-fade-in">
        {activeTab === 'overview' && <ClientOverviewTab client={client} />}
        {activeTab === 'workouts' && <ClientWorkoutsTab clientId={client.id} />}
        {activeTab === 'progress' && <ClientProgressTab clientId={client.id} />}
        {activeTab === 'trophies' && <ClientTrophiesTab clientId={client.id} />}
      </div>
    </div>
  );
}
