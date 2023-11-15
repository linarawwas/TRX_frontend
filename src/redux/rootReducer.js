import { combineReducers } from 'redux';
import userReducer from './reducer';
import recordOrderReducer from './Order/reducer';

const rootReducer = combineReducers({
  user: userReducer,
  order: recordOrderReducer,
  // Add more reducers here if needed
});

export default rootReducer;
