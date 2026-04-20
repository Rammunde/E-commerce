import { createSlice } from "@reduxjs/toolkit";

const initialState = {
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
    logout: (state) => {
      state.user = {};
      state.totalItems = 0;
      // Clear all persisted auth data
      localStorage.removeItem("user");
      localStorage.removeItem("userId");
      localStorage.removeItem("appState");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("userId");
      sessionStorage.removeItem("appState");
    }
  },
});

export const { setUser, logout, setTotalItems } = appSlice.actions;
export default appSlice.reducer;

