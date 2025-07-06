import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { logout } from '../redux/appSlice';

const Nav = () => {
  const dispatch = useDispatch();
  const totalAddedItems = useSelector((state) => state.app.totalItems);
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.data?.role === "Admin";
  const auth = localStorage.getItem("user");
  const fullName =
    JSON.parse(auth)?.data?.firstName + " " + JSON.parse(auth)?.data?.lastName;
  const navigate = useNavigate();

  const logOut = () => {
    dispatch(logout());
    localStorage.clear();
    navigate("/login");
  };

  const activeLinkStyle = {
    textDecoration: "underline",
    textDecorationColor: "white", // Custom underline color
    textUnderlineOffset: "4px",    // Space between text and underline
    // marginBottom: "4px",           // Additional space below the text
    fontWeight: "bold",
  };

  const navLinkStyle = {
    marginRight: "20px",
    color: "white",
    textDecoration: "none",
    padding: "10px 0", // Adds some vertical padding for better click area
  };

  return (
    <div
      style={{
        background: "#626467", // Navbar color
        paddingTop: "5px",
        paddingBottom: "10px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <img
          alt="Logo"
          className="logo"
          src="https://img.etimg.com/thumb/msid-100973430,width-650,height-488,imgsize-2985114,resizemode-75/indian-ecommerce-market.jpg"
          style={{ height: "50px", marginRight: "20px" }} // added margin for spacing
        />
        <div style={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
          {auth && (
            <>
              {!isAdmin && (
                <>
                  <NavLink
                    to="/"
                    style={({ isActive }) =>
                      isActive
                        ? { ...navLinkStyle, ...activeLinkStyle }
                        : navLinkStyle
                    }
                  >
                    Home
                  </NavLink>
                  <NavLink
                    to="/product"
                    style={({ isActive }) =>
                      isActive
                        ? { ...navLinkStyle, ...activeLinkStyle }
                        : navLinkStyle
                    }
                  >
                    Products
                  </NavLink>
                  <NavLink
                    to="/contactUs"
                    style={({ isActive }) =>
                      isActive
                        ? { ...navLinkStyle, ...activeLinkStyle }
                        : navLinkStyle
                    }
                  >
                    Contact Us
                  </NavLink>
                </>
              )}
              {isAdmin && (
                <>
                  <NavLink
                    to="/admin"
                    style={({ isActive }) =>
                      isActive
                        ? { ...navLinkStyle, ...activeLinkStyle }
                        : navLinkStyle
                    }
                  >
                    Admin Panel
                  </NavLink>
                  <NavLink
                    to="/addProduct"
                    style={({ isActive }) =>
                      isActive
                        ? { ...navLinkStyle, ...activeLinkStyle }
                        : navLinkStyle
                    }
                  >
                    Add Product
                  </NavLink>
                </>
              )}
            </>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          {!auth ? (
            <>
              <NavLink
                to="/signup"
                style={({ isActive }) =>
                  isActive
                    ? { ...navLinkStyle, ...activeLinkStyle }
                    : navLinkStyle
                }
              >
                Signup
              </NavLink>
              <NavLink
                to="/login"
                style={({ isActive }) =>
                  isActive
                    ? { ...navLinkStyle, ...activeLinkStyle }
                    : navLinkStyle
                }
              >
                Login
              </NavLink>
            </>
          ) : (
            <>
              <NavLink onClick={logOut} to="/login" style={navLinkStyle}>
                Logout ({fullName})
              </NavLink>

              <NavLink
                to="/cart"
                style={({ isActive }) =>
                  isActive
                    ? { ...navLinkStyle, ...activeLinkStyle }
                    : navLinkStyle
                }
              >
                <FontAwesomeIcon icon={faCartShopping} size="lg" />
                {totalAddedItems > 0 && (
                  <span
                    style={{
                      position: "relative",
                      top: "-10px",
                      right: "-10px",
                      background: "red",
                      color: "white",
                      borderRadius: "50%",
                      padding: "0 6px",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {totalAddedItems}
                  </span>
                )}
              </NavLink>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Nav;
