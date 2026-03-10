import { applyMiddleware, compose, createStore } from 'redux';
import rootReducer from './rootReducer';
import { ShipmentState } from './Shipment/types';
import { trxApi } from '../features/api/trxApi';

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: () => any;
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
  }
}

// Define the type for the state returned by rootReducer
type BaseRootState = ReturnType<typeof rootReducer>;

// Override shipment type for proper TypeScript inference
export type RootState = Omit<BaseRootState, 'shipment'> & {
  shipment: ShipmentState;
};

// Load the state from localStorage when initializing the Redux store
const savedState = localStorage.getItem('reduxState');
const initialState = savedState ? JSON.parse(savedState) : {};

// Reducers usually take the initial state as the second argument
const composeEnhancers =
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export const store = createStore(
  rootReducer,
  initialState,
  composeEnhancers(
    applyMiddleware(trxApi.middleware as any),
  )
);

// Save the Redux state to localStorage whenever it changes
store.subscribe(() => {
  const state = store.getState();
  localStorage.setItem('reduxState', JSON.stringify(state));
});

