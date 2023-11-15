import { combineReducers } from 'redux';
import userReducer from './UserInfo/reducer.js';
import recordOrderReducer from './Order/reducer.js';

const rootReducer = combineReducers({
    user: userReducer,
    order: recordOrderReducer
});

export default rootReducer;
