import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Skeleton className="h-64 rounded-xl lg:col-span-3" />
        <Skeleton className="h-64 rounded-xl lg:col-span-2" />
      </div>
    </div>
  );
}
