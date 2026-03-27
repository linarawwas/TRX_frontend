import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';
import type { ShipmentState } from './Shipment/types';
import { trxApi } from '../features/api/trxApi';
import { createLogger } from '../utils/logger';

// Define the type for the state returned by rootReducer
type BaseRootState = ReturnType<typeof rootReducer>;

// Override shipment type for proper TypeScript inference
export type RootState = Omit<BaseRootState, 'shipment'> & {
  shipment: ShipmentState;
};

const persistLog = createLogger('redux-storage');

/** RTK Query cache can grow without bound and must not be written to localStorage (5MB quota). */
const RTK_CACHE_KEY = trxApi.reducerPath;

function stateWithoutRtkCache(state: BaseRootState): Omit<BaseRootState, typeof RTK_CACHE_KEY> {
  const next = { ...state } as Record<string, unknown>;
  delete next[RTK_CACHE_KEY];
  return next as Omit<BaseRootState, typeof RTK_CACHE_KEY>;
}

function sanitizePreloadedState(parsed: unknown): Partial<BaseRootState> | undefined {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return undefined;
  const next = { ...(parsed as Record<string, unknown>) };
  delete next[RTK_CACHE_KEY];
  return next as Partial<BaseRootState>;
}

// Load the state from localStorage when initializing the Redux store
const savedState = localStorage.getItem('reduxState');
const parseSavedState = (raw: string | null) => {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
};
const preloadedState = sanitizePreloadedState(parseSavedState(savedState));

function persistReduxState(): void {
  const payload = JSON.stringify(stateWithoutRtkCache(store.getState()));
  try {
    localStorage.setItem('reduxState', payload);
  } catch (err) {
    const quota =
      err instanceof DOMException && err.name === 'QuotaExceededError';
    if (!quota) throw err;
    persistLog.warn('localStorage quota exceeded; clearing reduxState and retrying once', {
      payloadLength: payload.length,
    });
    try {
      localStorage.removeItem('reduxState');
      localStorage.setItem('reduxState', JSON.stringify(stateWithoutRtkCache(store.getState())));
    } catch (retryErr) {
      persistLog.error('Could not persist Redux state after quota retry', {
        message: retryErr instanceof Error ? retryErr.message : String(retryErr),
      });
    }
  }
}

export const store = configureStore({
  reducer: rootReducer,
  preloadedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(trxApi.middleware),
});

// Persist app slices only (not RTK Query cache) on every change
store.subscribe(persistReduxState);

