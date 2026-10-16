import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: {},
  totalItems: 0,
  authToken: null,
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
    setToken: (state, action) => {
      state.authToken = action.payload;
    },
    logout: (state) => {
      state.user = {};
      state.totalItems = 0;
      state.authToken = null;
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

export const { setUser, logout, setToken, setTotalItems } = appSlice.actions;
export default appSlice.reducer;

