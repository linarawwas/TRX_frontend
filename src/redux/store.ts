import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';
import { ShipmentState } from './Shipment/types';
import { trxApi } from '../features/api/trxApi';

// Define the type for the state returned by rootReducer
type BaseRootState = ReturnType<typeof rootReducer>;

// Override shipment type for proper TypeScript inference
export type RootState = Omit<BaseRootState, 'shipment'> & {
  shipment: ShipmentState;
};

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
const preloadedState = parseSavedState(savedState);

export const store = configureStore({
  reducer: rootReducer,
  preloadedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(trxApi.middleware),
});

// Save the Redux state to localStorage whenever it changes
store.subscribe(() => {
  const state = store.getState();
  localStorage.setItem('reduxState', JSON.stringify(state));
});

