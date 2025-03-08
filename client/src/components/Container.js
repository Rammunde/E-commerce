import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  Divider,
  IconButton,
  Paper,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true); // Loader state
  const [respMsg, setRespMsg] = useState('');
  const [isError, setIsError] = useState(false);

  const handleRemove = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const handleQuantityChange = (id, increment) => {
    // Logic for updating quantity goes here
  };

  const getAddedItems = useCallback(() => {
    setLoading(true); // Show loader before fetching data
    let userId = localStorage.getItem("userId");
    fetch(`http://localhost:5000/products/getAddedItems/${userId}`, {
      method: "get",
      headers: { "content-Type": "application/json" },
    })
      .then((resp) => resp.json())
      .then((data) => {
        let updatedResult = data.result.map(record => {
          const price = parseFloat(record.price.replace(/[^0-9.-]+/g, ""));
          const discount = price * 0.1; // 10% discount
          const finalPrice = price - discount;

          return {
            ...record,
            stock: "In Stock",
            delivery: "Free",
            discount: discount.toFixed(2),
            finalPrice: finalPrice.toFixed(2),
          };
        });
        setCartItems(updatedResult);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setIsError(true);
      })
      .finally(() => {
        setLoading(false); // Hide loader after data is fetched
      });
  }, []);

  useEffect(() => {
    getAddedItems();
  }, [getAddedItems]);

  return (
    <Box p={4}>
      <Typography variant="h5" mb={2}>
        Your Cart
      </Typography>
      {loading ? ( // Show loader if loading is true
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      ) : (
        cartItems.length === 0 ?
          (<Typography variant="body1" fontWeight="bold" color="primary">
            Your cart is empty
          </Typography>) : <><Grid container spacing={2}>
            {/* Cart Items */}
            <Grid item xs={12} md={8}>
              {cartItems.map((item) => (
                <Paper elevation={3} key={item.id} sx={{ mb: 2, p: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    {/* Product Image */}
                    <Grid item xs={3}>
                      <img
                        src={item?.productImages[0]}
                        alt={item.name}
                        style={{ width: "100%", borderRadius: "8px" }}
                      />
                    </Grid>

                    {/* Product Details */}
                    <Grid item xs={6}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {item.name}
                      </Typography>
                      <Typography color={item.stock === "Out of Stock" ? "error" : "success.main"}>
                        {item.stock}
                      </Typography>
                      <Typography variant="body2">
                        Delivery: <b>{item.delivery}</b>
                      </Typography>
                    </Grid>

                    {/* Price and Actions */}
                    <Grid item xs={3}>
                      <Typography variant="body1" fontWeight="bold" color="primary">
                        {item.finalPrice}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <s>{item.price}</s> {item.discount} Off
                      </Typography>
                      <Box display="flex" alignItems="center" mt={1}>
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(item.id, false)}
                        >
                          <RemoveIcon />
                        </IconButton>
                        <Typography variant="body1" mx={1}>
                          {item?.quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(item.id, true)}
                        >
                          <AddIcon />
                        </IconButton>
                      </Box>
                      <Box display="flex" gap={1} mt={1}>
                        <Button size="small">Save for Later</Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleRemove(item.id)}
                        >
                          Remove
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Grid>

            {/* Price Details */}
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h6" mb={2}>
                  Price Details
                </Typography>
                <Divider />
                <Box display="flex" justifyContent="space-between" mt={2}>
                  <Typography>Price (2 items)</Typography>
                  <Typography>₹3,998</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mt={1}>
                  <Typography>Discount</Typography>
                  <Typography color="success.main">- ₹3,322</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mt={1}>
                  <Typography>Platform Fee</Typography>
                  <Typography>₹3</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mt={1}>
                  <Typography>Delivery Charges</Typography>
                  <Typography color="success.main">Free</Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box display="flex" justifyContent="space-between">
                  <Typography fontWeight="bold">Total Amount</Typography>
                  <Typography fontWeight="bold">₹341</Typography>
                </Box>
                <Typography color="success.main" mt={1}>
                  You will save ₹3,322 on this order.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Place Order
                </Button>
              </Paper>
            </Grid>
          </Grid></>
      )}
    </Box>
  );
};

export default Cart;
