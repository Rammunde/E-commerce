import React from "react";
import "./App.css";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./AppRoutes"; // Import your routes here

function App() {
  return (
    <div style={appStyle}>
      <BrowserRouter>
        <Nav />
        <div style={mainContentStyle}>
          <AppRoutes /> {/* Use the AppRoutes component here */}
        </div>
      </BrowserRouter>
      <Footer />
    </div>
  );
}

// Inline styles for the App component
const appStyle = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
};

const mainContentStyle = {
  flex: 1,
};

export default App;
