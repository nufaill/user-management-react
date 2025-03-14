import { configureStore } from '@reduxjs/toolkit';
import userSlice from './Slices/UserSlice';
import adminSlice from './Slices/AdminSlice';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user', 'admin'],
};

const rootReducer = combineReducers({
  user: userSlice,
  admin: adminSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create the store
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

const persistor = persistStore(store);

export default store;
export { persistor };