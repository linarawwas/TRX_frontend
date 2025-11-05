import { createStore } from 'redux';
import rootReducer from './rootReducer';
import { ShipmentState } from './Shipment/types';

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: () => any;
  }
}

// Define the type for the state returned by rootReducer
type BaseRootState = ReturnType<typeof rootReducer>;

// Override shipment type since the reducer is JS and TypeScript can't infer it properly
export type RootState = Omit<BaseRootState, 'shipment'> & {
  shipment: ShipmentState;
};

// Load the state from localStorage when initializing the Redux store
const savedState = localStorage.getItem('reduxState');
const initialState = savedState ? JSON.parse(savedState) : {};

// Reducers usually take the initial state as the second argument
export const store = createStore(
  rootReducer,
  initialState,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

// Save the Redux state to localStorage whenever it changes
store.subscribe(() => {
  const state = store.getState();
  localStorage.setItem('reduxState', JSON.stringify(state));
});

