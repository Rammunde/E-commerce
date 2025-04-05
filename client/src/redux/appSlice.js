import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: 0,
  user: {},
  totalItems: 0,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setTotalItems: (state, action) => {
      state.totalItems = action.payload;
    },
    logout: (state, action) => {
      return {
        value: 0,
        user: {},
        totalItems: 0,
      };
    }    
  },
});

export const { setUser, setTotalItems, logout } = appSlice.actions;
export default appSlice.reducer;
