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
const preloadedState = savedState ? JSON.parse(savedState) : undefined;

export const store = configureStore({
  reducer: rootReducer,
  preloadedState,
  // @ts-expect-error - getDefaultMiddleware().concat(trxApi.middleware) is correct at runtime; TS complains due to redux vs @reduxjs/toolkit Middleware typings
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(trxApi.middleware),
});

// Save the Redux state to localStorage whenever it changes
store.subscribe(() => {
  const state = store.getState();
  localStorage.setItem('reduxState', JSON.stringify(state));
});

