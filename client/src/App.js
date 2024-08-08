import React from "react";
import "./App.css";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import SignUp from "./components/SignUp";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PrivateComponent from "./components/PrivateComponent";
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import HomePage from "./components/Home";
import ProductPage from "./components/ProductPage";
import Container from "./components/Container";
import AddProduct from "./components/AddProduct";
import ContactUs from "./components/ContactUs/ContactUs";

function App() {
  const user = JSON.parse(localStorage.getItem('user'));
  console.log("Role is", user)
  const isAdmin = user?.data?.data?.role === 'Admin';

  return (
    <div style={appStyle}>
      <BrowserRouter>
        <Nav />
        <div style={mainContentStyle}>
          <Routes>
            <Route element={<PrivateComponent />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/product" element={<ProductPage />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/contactUs" element={<ContactUs />}/>
              {/* {!isAdmin && <Route path="/admin" element={<AdminPanel />} />}
              {!isAdmin && <Route path="/addProduct" element={<AddProduct />} />} */}
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/addProduct" element={<AddProduct />} />
              <Route path="/cart" element={<Container />} />
              <Route path="/logout" element={<h1>Logout products list</h1>} />
              <Route path="/profile" element={<h1>Profile products list</h1>} />
            </Route>
            <Route path='/signup' element={<SignUp />} />
            <Route path='/login' element={<Login />} />
          </Routes>
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
