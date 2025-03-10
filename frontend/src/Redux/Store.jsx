import { configureStore } from "@reduxjs/toolkit";
import userSlice  from "./Slice/userSlice";
import  adminSlice  from "./Slice/AdminSlice";
import { combineReducers } from 'redux';
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from 'redux-persist';

const persistConfig = {
    key:'root',
    storage,
    whitelist:['user','admin']
}

const rootReducer =  combineReducers({
    user:userSlice, admin:adminSlice
});

const persistedReducer = persistReducer(persistConfig,rootReducer);

const store = configureStore({
    reducer:persistedReducer,
    middleware:(getDefualtMiddleware)=>
        getDefualtMiddleware({
            serializableCheck:{
                ignoreActions:['persist/PERSIST', 'persist/REHYDRATE']
            },
        }),
});


export default store;
export const persistor = persistStore(store);