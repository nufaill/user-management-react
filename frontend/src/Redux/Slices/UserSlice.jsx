import { createSlice } from "@reduxjs/toolkit";

const UserSlice = createSlice({
    name:'user',
    initialState:{user:null,token:null},
    reducers:{
        addUser:(state,action)=> {
            state.user = action.payload.user;
            state.token = action.payload.token;
        },
        updateUser:(state,action)=>{
            state.user = {...state.user,...action.payload}
        }
    },
});

export const { addUser, updateUser } = UserSlice.actions;
export const logoutUser = () => {
    return { type: "LOGOUT_USER" };
  };
  
export default UserSlice.reducer;