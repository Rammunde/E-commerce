import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";

const Nav = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  console.log("Role is", user)
  console.log("Role is", user?.data?.role)

  const isAdmin = user?.data?.role === 'Admin';
  const auth = localStorage.getItem("user");
  const fullName = JSON.parse(auth)?.data?.firstName + " " + JSON.parse(auth)?.data?.lastName;
  const navigate = useNavigate();
  const [cartItemCount, setCartItemCount] = React.useState(3);

  // Example function to fetch cart item count
  const fetchCartItemCount = () => {
    // Replace with actual logic to get cart item count
    const cart = JSON.parse(localStorage.getItem("cart"));
    setCartItemCount(cart ? cart.length : 0);
  };

  React.useEffect(() => {
    fetchCartItemCount();
  }, []);

  const logOut = () => {
    console.log("logOut");
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div style={{ background: "skyblue", paddingTop: "5px" }}>
      <img
        alt="Logo"
        className="logo"
        src="https://img.etimg.com/thumb/msid-100973430,width-650,height-488,imgsize-2985114,resizemode-75/indian-ecommerce-market.jpg"
        style={{ height: "50px", float: "left" }}
      />
      {auth ? (
        <ul className="nav-ul" style={{ listStyleType: "none", margin: 0, padding: 0, overflow: "hidden" }}>
          {!isAdmin && (<li style={{ float: "left", marginRight: "20px" }}>
            <Link to="/">Home</Link>
          </li>)}
          {!isAdmin && (<li style={{ float: "left", marginRight: "20px" }}>
            <Link to="/product">Products</Link>
          </li>)}
          {isAdmin && <li style={{ float: "left", marginRight: "20px" }}>
            <Link to="/admin">Admin Panel</Link>
          </li>}
         {isAdmin && <li style={{ float: "left", marginRight: "20px" }}>
            <Link to="/addProduct">Add Product</Link>
          </li>}
          <li style={{ float: "right", position: "relative", marginRight: "20px" }}>
            <Link to="/cart" style={{ position: "relative", display: "inline-block" }}>
              <FontAwesomeIcon icon={faCartShopping} size="lg" />
              {cartItemCount > 0 && (
                <span
                  style={{
                    position: "absolute",
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
                  {cartItemCount}
                </span>
              )}
            </Link>
          </li>
          <li style={{ float: "right" }}>
            <Link onClick={logOut} to="/login">
              Logout ({fullName})
            </Link>
          </li>
        </ul>
      ) : (
        <ul className="nav-ul" style={{ listStyleType: "none", margin: 0, padding: 0, overflow: "hidden" }}>
          <li style={{ float: "right", marginRight: "20px" }}>
            <Link to="/signup">Signup</Link>
          </li>
          <li style={{ float: "right" }}>
            <Link to="/login">Login</Link>
          </li>
        </ul>
      )}
    </div>
  );
};

export default Nav;
