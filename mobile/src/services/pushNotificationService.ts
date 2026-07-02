/**
 * @deprecated This module is superseded by ./notificationService, which is the
 * one wired into the app (see App/navigation). It previously imported
 * `expo-device`, a dependency that is not installed, which broke the TypeScript
 * build. It now simply re-exports the real notification service so any lingering
 * import keeps working without the broken dependency.
 */
export * from './notificationService';
