/**
 * Set EXPO_PUBLIC_API_URL to your machine's LAN IP so a physical device can reach FastAPI, e.g.:
 *   EXPO_PUBLIC_API_URL=http://192.168.1.42:8000
 * Simulator can use http://localhost:8000 (iOS) or http://10.0.2.2:8000 (Android emulator).
 */
const RAW = process.env.EXPO_PUBLIC_API_URL?.trim() || 'http://localhost:8000';

export function getApiBaseUrl(): string {
  return RAW.replace(/\/+$/, '');
}

export function getApiOrigin(): string {
  return getApiBaseUrl();
}

/**
 * Rewrite URLs returned by the API so they are reachable from the device.
 * Handles: localhost, 127.0.0.1, or any mismatched origin (e.g. backend
 * returns its own host but phone needs to reach it via LAN/Render URL).
 */
export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return '';
  // If the URL is already absolute and matches the configured API, return as-is
  const origin = getApiOrigin();
  if (url.startsWith(origin)) return url;
  // Relative path — prepend origin
  if (url.startsWith('/')) return `${origin}${url}`;
  // Replace common local origins with the configured one
  return url
    .replace(/^https?:\/\/localhost:\d+/i, origin)
    .replace(/^https?:\/\/127\.0\.0\.1:\d+/i, origin)
    .replace(/^https?:\/\/0\.0\.0\.0:\d+/i, origin);
}
