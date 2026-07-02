import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

/**
 * Poll `callback` every `intervalMs`, but only while the app is in the
 * foreground. Polling stops when the app is backgrounded and resumes (with an
 * immediate tick) when it returns to the foreground. This replaces ad-hoc
 * setInterval loops that kept running — and draining battery — in the
 * background.
 */
export function usePolling(
  callback: () => void | Promise<void>,
  intervalMs: number,
  enabled: boolean = true,
) {
  const savedCallback = useRef(callback);
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;
    let timer: ReturnType<typeof setInterval> | null = null;

    const tick = () => {
      void savedCallback.current();
    };
    const start = () => {
      if (timer) return;
      tick();
      timer = setInterval(tick, intervalMs);
    };
    const stop = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };
    const onChange = (state: AppStateStatus) => {
      if (state === 'active') start();
      else stop();
    };

    if (AppState.currentState === 'active') start();
    const sub = AppState.addEventListener('change', onChange);
    return () => {
      stop();
      sub.remove();
    };
  }, [intervalMs, enabled]);
}
