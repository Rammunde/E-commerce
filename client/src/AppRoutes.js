import React, { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import PrivateComponent from "./components/PrivateComponent";
import HomePage from "./components/Home";
import ProductPage from "./components/ProductPage";
import Container from "./components/Container";
import AddProduct from "./components/AddProduct";
import ContactUs from "./components/ContactUs/ContactUs";
import AdminPanel from "./components/AdminPanel";
import SignUp from "./components/SignUp";
import Login from './components/Login';

const AppRoutes = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user?.data?.role === 'Admin';

  return (
    <Routes>
      <Route element={<PrivateComponent />}>
        {!isAdmin && (
          <>
            <Route path="/" element={<HomePage />} />
            <Route path="/product" element={<ProductPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/contactUs" element={<ContactUs />} />
            <Route path="/cart" element={<Container />} />
            <Route path="/logout" element={<h1>Logout products list</h1>} />
            <Route path="/profile" element={<h1>Profile products list</h1>} />
          </>
        )}

        {isAdmin && (
          <>
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/addProduct" element={<AddProduct />} />
          </>
        )}
      </Route>
      <Route path='/signup' element={<SignUp />} />
      <Route path='/login' element={<Login />} />
    </Routes>
  );
};

export default AppRoutes;
