import { legacy_createStore as createStore } from 'redux'
import rootReducer from './rootReducer';

// Load the state from localStorage when initializing the Redux store
const savedState = localStorage.getItem('reduxState');
const initialState = savedState ? JSON.parse(savedState) : {};
const store = createStore(
    rootReducer,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
    initialState
);
store.subscribe(() => {
    const state = store.getState();
    localStorage.setItem('reduxState', JSON.stringify(state));
});
export default store;