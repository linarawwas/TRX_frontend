import { createStore } from 'redux';
import rootReducer from './rootReducer';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Use IndexedDB for offline-first, or localStorage for simpler cases.

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: () => any;
  }
}
const persistConfig = {
  key: 'root', // The key for your persisted state
  storage: storage, // Use 'storage' for localStorage or 'indexedDBStorage' for IndexedDB
};
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Define the type for the state returned by rootReducer
export type RootState = ReturnType<typeof rootReducer>;

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

const persistor = persistStore(store);
export { persistor };
