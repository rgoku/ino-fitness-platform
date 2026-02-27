/**
 * Push notification handling: foreground, background, and app-killed.
 * - Foreground: show banner; tap goes through response listener.
 * - Background: tap opens app; response listener or getLastNotificationResponse handles navigation.
 * - Killed: app launches; handleLastNotificationResponse processes the tap once.
 * Deduplicates by key (reminder_id / type+screen) to prevent duplicate navigations.
 */
import * as Notifications from 'expo-notifications';
import { AppState, AppStateStatus, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NavigationContainerRef } from '@react-navigation/native';

type NavRef = React.RefObject<NavigationContainerRef<Record<string, object | undefined>> | null>;

const DEDUPE_STORAGE_KEY = '@ino_notification_dedupe';
const DEDUPE_WINDOW_MS = 8000;
const MAX_DEDUPE_ENTRIES = 50;
const NAV_READY_DELAY_MS = 600;

export type NotificationData = {
  user_id?: string;
  type?: string;
  screen?: string;
  reminder_id?: string;
  [key: string]: string | undefined;
};

/** Build a stable key for deduplication (same notification within window = ignore). */
function getDedupeKey(data: NotificationData | null, notificationId?: string): string {
  if (!data) return notificationId || `id-${Date.now()}`;
  const id = data.reminder_id ?? data.id ?? notificationId;
  if (id) return String(id);
  return `hash-${[data.type, data.screen, data.user_id].filter(Boolean).join('-')}-${Date.now()}`;
}

/** In-memory recent keys + persisted tail for app restarts. */
const recentKeys = new Set<string>();

async function loadPersistedDedupeKeys(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(DEDUPE_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as { keys: string[]; until: number };
    const cutoff = Date.now() - DEDUPE_WINDOW_MS;
    if (parsed.until > cutoff) {
      parsed.keys.forEach((k) => recentKeys.add(k));
    }
  } catch {
    // ignore
  }
}

async function addDedupeKey(key: string): Promise<void> {
  recentKeys.add(key);
  const keys = Array.from(recentKeys).slice(-MAX_DEDUPE_ENTRIES);
  try {
    await AsyncStorage.setItem(
      DEDUPE_STORAGE_KEY,
      JSON.stringify({ keys, until: Date.now() })
    );
  } catch {
    // ignore
  }
}

function isDuplicate(key: string): boolean {
  return recentKeys.has(key);
}

function clearStaleDedupeKeys(): void {
  // In-memory we only keep last N; storage has 'until' for restarts
  if (recentKeys.size > MAX_DEDUPE_ENTRIES) {
    const arr = Array.from(recentKeys);
    arr.slice(0, arr.length - MAX_DEDUPE_ENTRIES).forEach((k) => recentKeys.delete(k));
  }
}

/** Navigate from notification data. Handles Main tab and stack screens. */
function handleDeepLink(ref: NavRef, data: NotificationData): void {
  const nav = ref?.current;
  if (!nav) return;

  const screen = data.screen?.toLowerCase();
  const params: Record<string, string | undefined> = {
    reminder_id: data.reminder_id,
    ...data,
  };

  switch (screen) {
    case 'chat':
      nav.navigate('Chat', params);
      break;
    case 'workoutsession':
    case 'workout-session':
      nav.navigate('WorkoutSession', {
        workoutPlanId: data.workout_plan_id ?? data.workoutPlanId,
        ...params,
      });
      break;
    case 'foodphoto':
    case 'food-photo':
      nav.navigate('FoodPhoto', params);
      break;
    case 'formcheck':
    case 'form-check':
      nav.navigate('FormCheck', params);
      break;
    case 'diet':
      nav.navigate('Main', { screen: 'Diet' });
      break;
    case 'workout':
      nav.navigate('Main', { screen: 'Workout' });
      break;
    case 'progress':
      nav.navigate('Main', { screen: 'Progress' });
      break;
    case 'profile':
      nav.navigate('Main', { screen: 'Profile' });
      break;
    case 'home':
    default:
      nav.navigate('Main', { screen: 'Home' });
      break;
  }
}

/** Process a notification response (tap): dedupe then deep link. Returns true if handled. */
export function processNotificationResponse(ref: NavRef, response: Notifications.NotificationResponse): boolean {
  const id = response.notification.request.identifier;
  const data = (response.notification.request.content.data || {}) as NotificationData;
  const key = getDedupeKey(data, id);
  if (isDuplicate(key)) return false;
  addDedupeKey(key);
  clearStaleDedupeKeys();
  lastProcessedResponseId = id;
  handleDeepLink(ref, data);
  return true;
}

type Subscription = { remove: () => void };
let subscriptionReceived: Subscription | null = null;
let subscriptionResponse: Subscription | null = null;
let subscriptionAppState: ReturnType<typeof AppState.addEventListener> | null = null;
/** Process last notification only once per cold start (killed → opened by tap). */
let lastProcessedResponseId: string | null = null;

/**
 * Initialize push notifications: permissions, foreground behavior, listeners,
 * and dedupe state. Call with navigation ref so deep links can navigate.
 */
export async function init(navigationRef: NavRef): Promise<void> {
  await loadPersistedDedupeKeys();

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
      sticky: false,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'INÖ Fitness',
      importance: 5, // Android importance MAX
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#007AFF',
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let final = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    final = status;
  }

  if (final === 'granted') {
    try {
      // Expo push token (for Expo push service; FCM is used when you use EAS / FCM config)
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: (require('../../app.json').expo?.extra?.eas?.projectId) || undefined,
      });
      // Optional: send token to your backend (e.g. apiService.registerPushToken(token.data))
      if (__DEV__) console.log('Expo push token:', token.data);
    } catch (e) {
      if (__DEV__) console.warn('Expo push token error:', e);
    }
  }

  subscriptionReceived = Notifications.addNotificationReceivedListener((notification) => {
    // Foreground: notification received; no navigation, just optional in-app UX
    const data = (notification.request.content.data || {}) as NotificationData;
    const key = getDedupeKey(data, notification.request.identifier);
    addDedupeKey(key);
    clearStaleDedupeKeys();
  });

  subscriptionResponse = Notifications.addNotificationResponseReceivedListener((response) => {
    // Background or foreground tap: user tapped notification
    setTimeout(() => processNotificationResponse(navigationRef, response), NAV_READY_DELAY_MS);
  });

  // When app comes to foreground, handle last response in case the listener didn't fire (e.g. background → tap)
  subscriptionAppState = AppState.addEventListener('change', (state: AppStateStatus) => {
    if (state !== 'active') return;
    (async () => {
      const response = await Notifications.getLastNotificationResponseAsync();
      if (!response || response.notification.request.identifier === lastProcessedResponseId) return;
      setTimeout(() => processNotificationResponse(navigationRef, response), NAV_READY_DELAY_MS);
    })();
  });
}

/**
 * Handle app opened from killed state by the last notification.
 * Call once after navigator is mounted (e.g. in App.tsx useEffect after init).
 * Only processes once per identifier so we don't double-navigate on re-mount.
 */
export async function handleLastNotificationResponse(navigationRef: NavRef): Promise<void> {
  const response = await Notifications.getLastNotificationResponseAsync();
  if (!response) return;
  if (response.notification.request.identifier === lastProcessedResponseId) return;
  setTimeout(() => processNotificationResponse(navigationRef, response), NAV_READY_DELAY_MS);
}

export function cleanup(): void {
  if (subscriptionReceived) {
    subscriptionReceived.remove();
    subscriptionReceived = null;
  }
  if (subscriptionResponse) {
    subscriptionResponse.remove();
    subscriptionResponse = null;
  }
  if (subscriptionAppState) {
    subscriptionAppState.remove();
    subscriptionAppState = null;
  }
  lastProcessedResponseId = null;
}
