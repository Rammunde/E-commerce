import { configureStore } from "@reduxjs/toolkit";
import appReducer from "./appSlice";

// Load state from localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem("appState");
    if (serializedState === null) return undefined;
    return JSON.parse(serializedState);
  } catch (e) {
    console.warn("Could not load state", e);
    return undefined;
  }
};

// Save state to localStorage
const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state.app);
    localStorage.setItem("appState", serializedState);
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
  },
  preloadedState,
});

// Subscribe to state changes and save
store.subscribe(() => {
  saveState(store.getState());
});

export default store;
