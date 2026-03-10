import { combineReducers } from 'redux';
import userReducer from './UserInfo/reducer';
import orderReducer from './Order/reducer';
import shipmentReducer from './Shipment/reducer';
import defaultReducer from './Defaults/reducer';
import { trxApi } from '../features/api/trxApi';

const rootReducer = combineReducers({
    user: userReducer,
    order: orderReducer,
    shipment: shipmentReducer, 
    default: defaultReducer,
    [trxApi.reducerPath]: trxApi.reducer,
});

export default rootReducer;

