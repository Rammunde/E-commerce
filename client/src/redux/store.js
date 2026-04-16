import { configureStore } from "@reduxjs/toolkit";
import appReducer from "./appSlice";
import { apiSlice } from "./apiSlice";

// One-time migration: if there is no sessionStorage entry yet but one exists in
// localStorage (from before the sessionStorage switch), carry it over and remove
// the old localStorage key so the next tab open starts fresh.
if (!sessionStorage.getItem("appState") && localStorage.getItem("appState")) {
  sessionStorage.setItem("appState", localStorage.getItem("appState"));
  localStorage.removeItem("appState");
}

// Load state from sessionStorage (clears automatically when the tab is closed)
const loadState = () => {
  try {
    const serializedState = sessionStorage.getItem("appState");
    if (serializedState === null) return undefined;
    return JSON.parse(serializedState);
  } catch (e) {
    console.warn("Could not load state", e);
    return undefined;
  }
};

// Save state to sessionStorage
const saveState = (state) => {
  try {
    // Only persist the 'app' slice (user info etc.)
    const serializedState = JSON.stringify(state.app);
    sessionStorage.setItem("appState", serializedState);
  } catch (e) {
    console.warn("Could not save state", e);
  }
};

const preloadedState = {
  app: loadState(),
};

const store = configureStore({
  reducer: {
    app: appReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  preloadedState,
});

// Subscribe to state changes and save
store.subscribe(() => {
  saveState(store.getState());
});

export default store;

