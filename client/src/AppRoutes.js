import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import PrivateComponent from "./components/PrivateComponent";

// Lazy loading components for better performance
// This splits the code into smaller chunks that are loaded on demand
const HomePage = lazy(() => import("./components/Home"));
const ProductPage = lazy(() => import("./components/ProductPage"));
const Container = lazy(() => import("./components/container/Container"));
const ContactUs = lazy(() => import("./components/ContactUs/ContactUs"));
const UsersTable = lazy(() => import("./components/AdminPanel/Users/UsersTable"));
const ProductTable = lazy(() => import("./components/AdminPanel/Products/ProductTable"));
const SignUp = lazy(() => import("./components/SignUp"));
const Login = lazy(() => import('./components/Login'));

// Simple loading fallback
const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <h3>Loading...</h3>
  </div>
);

const AppRoutes = () => {
  const userFromStore = useSelector((state) => state.app.user);

  // Safe JSON parsing for user data
  const user = React.useMemo(() => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      return null;
    }
  }, [userFromStore]);

  const isAdmin = user?.data?.role === 'Admin';

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Protected Routes Wrapper */}
        <Route element={<PrivateComponent />}>

          {/* Admin Routes */}
          {isAdmin ? (
            <>
              <Route path="/user-management" element={<UsersTable />} />
              <Route path="/product-management" element={<ProductTable />} />
              {/* Redirect any unknown admin route to user management */}
              <Route path="*" element={<Navigate to="/user-management" replace />} />
            </>
          ) : (
            /* User Routes */
            <>
              {/* <Route path="/" element={<HomePage />} /> */}
              <Route path="/product" element={<ProductPage />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/contactUs" element={<ContactUs />} />
              <Route path="/cart" element={<Container />} />
              <Route path="/logout" element={<h1>Logout products list</h1>} />
              <Route path="/profile" element={<h1>Profile products list</h1>} />
              {/* Redirect any unknown user route to product page */}
              <Route path="*" element={<Navigate to="/product" replace />} />
            </>
          )}
        </Route>

        {/* Public Routes */}
        <Route path='/signup' element={<SignUp />} />
        <Route path='/login' element={<Login />} />

        {/* Global Fallback (though PrivateComponent likely handles root redirects) */}
        {/* If user hits a random URL and is not logged in, PrivateComponent redirects to Signup.
            If they are logged in, the inner routes above handle 404s.
            So we just need public routes here. */}
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
