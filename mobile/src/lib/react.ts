/**
 * Re-export React and hooks so the IDE doesn't require @types/react to resolve.
 * Uses require to avoid "Module 'react' has no exported member" when types aren't in path.
 */
const R = require('react') as any;

export const useState = R.useState as <S>(initial: S | (() => S)) => [S, (value: S | ((prev: S) => S)) => void];
export const useEffect = R.useEffect as (effect: () => void | (() => void), deps?: unknown[]) => void;
export const useCallback = R.useCallback as <T extends (...args: unknown[]) => unknown>(callback: T, deps: unknown[]) => T;
export const useMemo = R.useMemo as <T>(factory: () => T, deps: unknown[]) => T;
export const memo = R.memo as <P extends object>(Component: (props: P) => any) => (props: P) => any;
export const Fragment = R.Fragment as (props: { children?: any; key?: string }) => any;

export default R;
