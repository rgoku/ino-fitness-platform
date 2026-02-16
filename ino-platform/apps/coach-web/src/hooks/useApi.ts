/**
 * Data hooks — thin wrappers around api.ts with loading/error/refresh state.
 * Each hook returns { data, loading, error, refresh }.
 */
import { useState, useEffect, useCallback } from "react";
import api from "../lib/api";

interface UseQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

function useQuery<T>(fetcher: () => Promise<T>, deps: any[] = []): UseQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetcher()
      .then(res => { if (!cancelled) setData(res); })
      .catch(e => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [tick, ...deps]);

  return { data, loading, error, refresh };
}

// ── Coach Stats ───────────────────────────────────────────────

export function useCoachStats() {
  return useQuery(() => api.coaches.stats());
}

export function useCoachProfile() {
  return useQuery(() => api.coaches.profile());
}

// ── Clients ───────────────────────────────────────────────────

export function useClients(statusFilter?: string) {
  return useQuery(
    () => api.clients.list({ status: statusFilter, page_size: 50 }).then(r => r.data),
    [statusFilter],
  );
}

export function useClient(id: string | null) {
  return useQuery(
    () => id ? api.clients.get(id) : Promise.resolve(null),
    [id],
  );
}

// ── Workouts ──────────────────────────────────────────────────

export function useWorkouts(templateOnly = false) {
  return useQuery(
    () => api.workouts.list(templateOnly).then(r => r.data),
    [templateOnly],
  );
}

// ── Messages ──────────────────────────────────────────────────

export function useConversations() {
  return useQuery(() => api.messages.conversations().then(r => r.data));
}

export function useConversation(userId: string | null) {
  return useQuery(
    () => userId ? api.messages.history(userId).then(r => r.data) : Promise.resolve([]),
    [userId],
  );
}

// ── Videos ────────────────────────────────────────────────────

export function usePendingVideos() {
  return useQuery(() => api.videos.pending().then(r => r.data));
}

// ── Automation ────────────────────────────────────────────────

export function useAutomationRules() {
  return useQuery(() => api.automation.list().then(r => r.data));
}

// ── Billing ───────────────────────────────────────────────────

export function useSubscription() {
  return useQuery(() => api.billing.subscription());
}

// ── Check-ins ─────────────────────────────────────────────────

export function useClientCheckins(clientId: string | null, type?: string) {
  return useQuery(
    () => clientId ? api.checkins.clientHistory(clientId, type).then(r => r.data) : Promise.resolve([]),
    [clientId, type],
  );
}

// ── Generic mutation hook ─────────────────────────────────────

interface UseMutationResult<TInput, TOutput> {
  mutate: (input: TInput) => Promise<TOutput>;
  loading: boolean;
  error: string | null;
}

export function useMutation<TInput, TOutput>(
  fn: (input: TInput) => Promise<TOutput>,
): UseMutationResult<TInput, TOutput> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (input: TInput) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn(input);
      return result;
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [fn]);

  return { mutate, loading, error };
}
