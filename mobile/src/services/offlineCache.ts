/**
 * Offline cache for last diet plan, workout plan, and progress stats.
 *
 * - Screens: read from cache first (getCached), then refetch from API. On success, write
 *   with setCached. On network error, show cached data and set isOffline.
 * - Sync when back online: subscribe with onReconnect(fn). When network goes from offline
 *   to online, all subscribers are called so screens can refetch and update cache.
 * - Cache keys: CACHE_KEYS.DIET_PLAN, CACHE_KEYS.WORKOUT_PLAN, CACHE_KEYS.PROGRESS_STATS.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export const CACHE_KEYS = {
  DIET_PLAN: '@ino_cache_diet_plan',
  WORKOUT_PLAN: '@ino_cache_workout_plan',
  PROGRESS_STATS: '@ino_cache_progress_stats',
  WORKOUT_SESSION: (planId: string) => `@ino_cache_session_${planId}`,
} as const;

const KEY_PREFIX = '@ino_cache_';
const META_SUFFIX = '_at';

type ReconnectListener = () => void;
const reconnectListeners: ReconnectListener[] = [];
let wasOffline = false;

function handleNetworkChange(isOnline: boolean) {
  if (wasOffline && isOnline) {
    reconnectListeners.forEach((fn) => fn());
  }
  wasOffline = !isOnline;
}

NetInfo.addEventListener((state) => {
  const isOnline = state.isConnected ?? false;
  handleNetworkChange(isOnline);
});

NetInfo.fetch().then((state) => {
  wasOffline = !(state.isConnected ?? false);
});

/**
 * Subscribe to reconnect events. Call refetch logic here.
 */
export function onReconnect(fn: ReconnectListener): () => void {
  reconnectListeners.push(fn);
  return () => {
    const i = reconnectListeners.indexOf(fn);
    if (i >= 0) reconnectListeners.splice(i, 1);
  };
}

export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setCached(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    await AsyncStorage.setItem(key + META_SUFFIX, String(Date.now()));
  } catch (e) {
    console.warn('[OfflineCache] setCached failed:', key, e);
  }
}

export async function getCachedAt(key: string): Promise<number | null> {
  try {
    const s = await AsyncStorage.getItem(key + META_SUFFIX);
    return s ? parseInt(s, 10) : null;
  } catch {
    return null;
  }
}

export async function invalidate(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
    await AsyncStorage.removeItem(key + META_SUFFIX);
  } catch {
    // ignore
  }
}

export interface ProgressStatsCache {
  progress: import('../types').ProgressEntry[];
  streak: import('../types').Streak | null;
  trophies: import('../types').Trophy[];
}
