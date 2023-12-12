import { combineReducers } from 'redux';
import userReducer from './UserInfo/reducer.js';
import orderReducer from './Order/reducer.ts';
import shipmentReducer from './Shipment/reducer.js';
import languageReducer from './Language/reducer.ts';

const rootReducer = combineReducers({
    user: userReducer,
    order: orderReducer,
    shipment: shipmentReducer, 
    language: languageReducer
});

export default rootReducer;
