import storage from 'redux-persist/lib/storage'; // uses localStorage
import { persistReducer } from 'redux-persist';
import userReducer from './reducer';

const userPersistConfig = {
  key: 'user',
  storage,
  whitelist: ['token', 'name', 'companyId', 'isAdmin', 'userId'], // only persist these
};

export default persistReducer(userPersistConfig, userReducer);

