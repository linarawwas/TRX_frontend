import { combineReducers } from 'redux';
import userReducer from './UserInfo/reducer.js';
import orderReducer from './Order/reducer.ts';
import shipmentReducer from './Shipment/reducer.js';
import defaultReducer from './Defaults/reducer.ts';

const rootReducer = combineReducers({
    user: userReducer,
    order: orderReducer,
    shipment: shipmentReducer, 
    default: defaultReducer
});

export default rootReducer;
