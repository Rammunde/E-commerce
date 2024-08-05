import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Container = () => {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch cart items from local storage
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(cart);
  }, []);
console.log("cartItems",cartItems)
  const handleRemove = (id) => {
    // Remove item from cart and update local storage
    const updatedCart = cartItems.filter(item => item?.id !== id);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setCartItems(updatedCart);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Your Cart</h1>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          {cartItems.map(item => (
            <div key={item?.id} style={{ display: "flex", alignItems: "center", borderBottom: "1px solid #ddd", padding: "10px 0" }}>
              <img
                src={item?.image}
                alt={item?.name}
                style={{ width: "100px", height: "auto", objectFit: "cover", marginRight: "20px" }}
              />
              <div>
                <h3>{item?.name}</h3>
                <p>{item?.price}</p>
                <button onClick={() => handleRemove(item?.id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Container;
