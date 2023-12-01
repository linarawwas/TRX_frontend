import { createStore } from 'redux';
import rootReducer from './rootReducer';

// Load the state from localStorage when initializing the Redux store
const savedState = localStorage.getItem('reduxState');
const initialState = savedState ? JSON.parse(savedState) : {};

// Reducers usually take the initial state as the second argument
const store = createStore(
  rootReducer,
  initialState,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

// Save the Redux state to localStorage whenever it changes
store.subscribe(() => {
  const state = store.getState();
  localStorage.setItem('reduxState', JSON.stringify(state));
});

export default store;
