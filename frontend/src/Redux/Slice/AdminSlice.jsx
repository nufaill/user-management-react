import { createSlice } from "@reduxjs/toolkit";

const adminSlice = createSlice({
    name:'admin',
    initialState:{admin:null,token:null},
    reducers:{
        addadmin:(state,action)=> {
            state.admin = action.payload.admin;
            state.token = action.payload.token;
        },
        updateadmin:(state,action)=>{
            state.admin = {...state.admin,...action.payload}
        },
        logoutadmin:(state)=>{
            state.admin=null;
            state.token=null;
        },
    },
});

export const { addadmin, updateadmin,logoutadmin } = adminSlice.actions;

export default adminSlice.reducer;